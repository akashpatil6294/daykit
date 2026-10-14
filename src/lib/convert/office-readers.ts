import { Unzip, UnzipInflate, strFromU8 } from 'fflate';
import { XMLParser } from 'fast-xml-parser';
import { SyntaxValidator } from 'fast-xml-validator';
import type { Block, DocumentModel, ModelPage } from './pdf-text-model';

const MAX_ENTRY = 16 * 1024 * 1024,
  MAX_TOTAL = 120 * 1024 * 1024;
// Stream inflation in small input chunks; check actual output, not just ZIP headers.
export function safeOfficeZip(bytes: Uint8Array): Record<string, Uint8Array> {
  if (bytes.length > 50 * 1024 * 1024) throw new Error('limit');
  if (bytes[0] === 0xd0 && bytes[1] === 0xcf) throw new Error('encryptedOffice');
  if (bytes[0] !== 80 || bytes[1] !== 75) throw new Error('corrupt');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--)
    if (
      view.getUint32(i, true) === 0x06054b50 &&
      i + 22 + view.getUint16(i + 20, true) === bytes.length
    ) {
      end = i;
      break;
    }
  if (end < 0) throw new Error('corrupt');
  const advertisedCount = view.getUint16(end + 10, true);
  if (
    advertisedCount > 2000 ||
    view.getUint16(end + 4, true) !== 0 ||
    view.getUint32(end + 16, true) + view.getUint32(end + 12, true) > end
  )
    throw new Error('limit');
  const entries: Record<string, Uint8Array> = Object.create(null);
  let total = 0,
    count = 0,
    started = 0,
    finished = 0;
  const unzip = new Unzip((file) => {
    const name = file.name;
    if (
      ++count > 2000 ||
      name.startsWith('/') ||
      /(?:^|\/)\.\.(?:\/|$)|\\|\0/.test(name) ||
      name in entries
    )
      throw new Error('limit');
    if ((file.originalSize || 0) > MAX_ENTRY) throw new Error('limit');
    if (/vbaProject|encryptioninfo|encryptedpackage/i.test(name))
      throw new Error('unsupportedOffice');
    entries[name] = new Uint8Array();
    started++;
    const chunks: Uint8Array[] = [];
    let size = 0;
    file.ondata = (error, chunk, final) => {
      if (error) throw new Error('corrupt');
      size += chunk.length;
      total += chunk.length;
      if (size > MAX_ENTRY || total > MAX_TOTAL || total * 3 + bytes.length > 400 * 1024 * 1024)
        throw new Error('limit');
      chunks.push(chunk);
      if (final) {
        const value = new Uint8Array(size);
        let offset = 0;
        for (const part of chunks) {
          value.set(part, offset);
          offset += part.length;
        }
        entries[name] = value;
        finished++;
      }
    };
    file.start();
  });
  unzip.register(UnzipInflate);
  try {
    for (let i = 0; i < bytes.length; i += 4096)
      unzip.push(bytes.subarray(i, i + 4096), i + 4096 >= bytes.length);
  } catch (e) {
    if (e instanceof Error && ['limit', 'unsupportedOffice'].includes(e.message)) throw e;
    throw new Error('corrupt');
  }
  if (finished !== started || count !== advertisedCount || !entries['[Content_Types].xml'])
    throw new Error('corrupt');
  return entries;
}
// File-derived content is never inserted as HTML. Reject entity declarations outright.
type Node = Record<string, any>;
function xml(bytes?: Uint8Array): Node[] {
  if (!bytes) throw new Error('corrupt');
  const text = strFromU8(bytes);
  if (
    /<!DOCTYPE|<!ENTITY/i.test(text) ||
    text.length > 8 * 1024 * 1024 ||
    new SyntaxValidator().validate(text) !== true
  )
    throw new Error('corrupt');
  let depth = 0;
  for (const tag of text.matchAll(/<([^>]+)>/g)) {
    if (tag[1].startsWith('/')) depth--;
    else if (!/^[!?]|\/$/.test(tag[1])) depth++;
    if (depth > 128 || depth < 0) throw new Error('limit');
  }
  return new XMLParser({
    preserveOrder: true,
    ignoreAttributes: false,
    parseTagValue: false,
    trimValues: false,
    processEntities: true,
  }).parse(text);
}
function children(node: Node): Node[] {
  const key = Object.keys(node).find((k) => k !== ':@');
  return key && Array.isArray(node[key]) ? node[key] : [];
}
function descendants(nodes: Node[], key: string): Node[] {
  return nodes.flatMap((n) => [...(key in n ? [n] : []), ...descendants(children(n), key)]);
}
function textOf(nodes: Node[]): string {
  return nodes
    .map((n) => (n['#text'] !== undefined ? String(n['#text']) : textOf(children(n))))
    .join('');
}
function attr(node: Node | undefined, name: string): string {
  return node?.[':@']?.['@_' + name] || '';
}
function relations(zip: Record<string, Uint8Array>, path: string, base: string) {
  const found = new Map<string, string>();
  if (!zip[path]) return found;
  for (const rel of descendants(xml(zip[path]), 'Relationship')) {
    if (attr(rel, 'TargetMode') === 'External') continue;
    const target = attr(rel, 'Target');
    if (/^[a-z]+:|^\/|\\/i.test(target)) continue;
    const parts = base.split('/').filter(Boolean);
    for (const part of target.split('/')) {
      if (part === '..') parts.pop();
      else if (part !== '.') parts.push(part);
    }
    const resolved = parts.join('/');
    if (zip[resolved]) found.set(attr(rel, 'Id'), resolved);
  }
  return found;
}
function imageBlocks(
  nodes: Node[],
  zip: Record<string, Uint8Array>,
  rels: Map<string, string>,
): Block[] {
  return descendants(nodes, 'a:blip').flatMap((node) => {
    const path = rels.get(attr(node, 'r:embed'));
    if (!path || !/\.(png|jpe?g)$/i.test(path)) return [];
    return [
      {
        kind: 'image' as const,
        bytes: zip[path],
        format: /\.png$/i.test(path) ? ('png' as const) : ('jpg' as const),
      },
    ];
  });
}
const blankPage = (blocks: Block[]): ModelPage => ({ width: 595.28, height: 841.89, blocks });
export async function readOffice(bytes: Uint8Array, extension: string): Promise<DocumentModel> {
  const zip = safeOfficeZip(bytes);
  if (extension === 'docx') {
    const nodes = xml(zip['word/document.xml']);
    const body = descendants(nodes, 'w:body')[0];
    if (!body) throw new Error('corrupt');
    const rels = relations(zip, 'word/_rels/document.xml.rels', 'word');
    const blocks: Block[] = [];
    for (const node of children(body)) {
      if ('w:tbl' in node)
        blocks.push({
          kind: 'table',
          rows: descendants([node], 'w:tr').map((row) =>
            descendants(children(row), 'w:tc').map((cell) =>
              descendants(children(cell), 'w:p')
                .map((p) => textOf(descendants(children(p), 'w:t')))
                .join(' '),
            ),
          ),
        });
      else if ('w:p' in node) {
        const text = textOf(descendants(children(node), 'w:t'));
        const style = attr(descendants(children(node), 'w:pStyle')[0], 'w:val');
        if (text)
          blocks.push({
            kind: /heading|title/i.test(style)
              ? 'heading'
              : descendants(children(node), 'w:numPr').length
                ? 'bullet'
                : 'paragraph',
            text,
          });
        blocks.push(...imageBlocks([node], zip, rels));
      }
    }
    return { pages: [blankPage(blocks)] };
  }
  if (extension === 'pptx') {
    const order = descendants(xml(zip['ppt/presentation.xml']), 'p:sldId');
    const rels = relations(zip, 'ppt/_rels/presentation.xml.rels', 'ppt');
    if (order.length > 100) throw new Error('limit');
    const pages = order.map((id) => {
      const path = rels.get(attr(id, 'r:id'));
      if (!path) throw new Error('corrupt');
      const nodes = xml(zip[path]);
      const blocks: Block[] = [];
      for (const p of descendants(nodes, 'a:p')) {
        const text = textOf(descendants(children(p), 'a:t'));
        if (text)
          blocks.push({
            kind: descendants(children(p), 'a:buChar').length ? 'bullet' : 'paragraph',
            text,
          });
      }
      const filename = path.split('/').at(-1)!;
      blocks.push(
        ...imageBlocks(
          nodes,
          zip,
          relations(zip, `ppt/slides/_rels/${filename}.rels`, 'ppt/slides'),
        ),
      );
      return blankPage(blocks);
    });
    return { pages };
  }
  if (extension === 'xlsx') {
    const strings = zip['xl/sharedStrings.xml']
      ? descendants(xml(zip['xl/sharedStrings.xml']), 'si').map((si) =>
          textOf(descendants(children(si), 't')),
        )
      : [];
    const rels = relations(zip, 'xl/_rels/workbook.xml.rels', 'xl');
    const sheets = descendants(xml(zip['xl/workbook.xml']), 'sheet');
    let count = 0;
    const pages = sheets.map((sheet) => {
      const path = rels.get(attr(sheet, 'r:id'));
      if (!path) throw new Error('corrupt');
      const nodes = xml(zip[path]);
      const rows: string[][] = [];
      for (const row of descendants(nodes, 'row')) {
        const output: string[] = [];
        for (const cell of descendants(children(row), 'c')) {
          if (++count > 200000) throw new Error('tooManyCells');
          const ref = attr(cell, 'r');
          let column = 0;
          for (const char of ref.match(/^[A-Z]+/)?.[0] || 'A')
            column = column * 26 + char.charCodeAt(0) - 64;
          if (column > 1000) throw new Error('tooManyCells');
          const type = attr(cell, 't');
          const value = textOf(descendants(children(cell), 'v'));
          output[column - 1] =
            type === 's'
              ? strings[Number(value)] || ''
              : type === 'inlineStr'
                ? textOf(descendants(children(cell), 't'))
                : value;
          // Formula elements are deliberately ignored. Only saved cached values are used.
        }
        if (output.length)
          rows.push(Array.from({ length: output.length }, (_, i) => output[i] || ''));
      }
      return blankPage([
        { kind: 'heading', text: attr(sheet, 'name') },
        { kind: 'table', rows },
      ]);
    });
    if (pages.length > 100) throw new Error('limit');
    return { pages };
  }
  throw new Error('unsupportedOffice');
}
