// Pure positioned-text heuristics. Ambiguous reading order needs human review.
export interface TextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
  dir?: string;
}
export interface TextLine {
  text: string;
  x: number;
  y: number;
  width: number;
  size: number;
  cells: string[];
  rtl: boolean;
}
export type Block =
  | { kind: 'paragraph' | 'heading' | 'bullet'; text: string; size?: number; rtl?: boolean }
  | { kind: 'table'; rows: string[][] }
  | { kind: 'image'; bytes: Uint8Array; format: 'png' | 'jpg'; width?: number; height?: number };
export interface ModelPage {
  width: number;
  height: number;
  blocks: Block[];
  lines?: TextLine[];
  scanned?: boolean;
}
export interface DocumentModel {
  pages: ModelPage[];
}
export function linesFromItems(items: TextItem[]): TextLine[] {
  const sorted = items
    .filter((i) => i.str.trim())
    .map((i) => ({
      ...i,
      x: i.transform[4],
      y: i.transform[5],
      size: Math.max(1, Math.abs(i.height || i.transform[3] || 12)),
    }))
    .sort((a, b) => b.y - a.y || a.x - b.x);
  const rows: (typeof sorted)[] = [];
  for (const item of sorted) {
    const row = rows.at(-1);
    if (row && Math.abs(row[0].y - item.y) <= Math.min(row[0].size, item.size) * 0.3)
      row.push(item);
    else rows.push([item]);
  }
  return rows.map((row) => {
    row.sort((a, b) => a.x - b.x);
    const rtl = row.filter((i) => i.dir === 'rtl').length > row.length / 2;
    const cells: string[] = [];
    let cell = '';
    row.forEach((item, index) => {
      const prev = row[index - 1];
      const gap = prev ? item.x - (prev.x + prev.width) : 0;
      if (gap > item.size * 2.2 && cell) {
        cells.push(cell.trim());
        cell = '';
      }
      cell += (cell && gap > item.size * 0.15 ? ' ' : '') + item.str;
    });
    if (cell) cells.push(cell.trim());
    return {
      text: rtl
        ? [...row]
            .reverse()
            .map((i) => i.str)
            .join(' ')
        : cells.join('  '),
      x: row[0].x,
      y: row[0].y,
      width: Math.max(...row.map((i) => i.x + i.width)) - row[0].x,
      size: Math.max(...row.map((i) => i.size)),
      cells,
      rtl,
    };
  });
}
export function pageFromItems(items: TextItem[], width: number, height: number): ModelPage {
  const visible = items.filter((i) => i.str.trim());
  const left = visible.filter((i) => i.transform[4] + i.width < width * 0.49);
  const right = visible.filter((i) => i.transform[4] > width * 0.51);
  const prose = [...left, ...right].filter((i) => i.str.trim().split(/\s+/).length >= 5).length;
  const lines =
    left.length >= 2 &&
    right.length >= 2 &&
    prose >= 4 &&
    left.length + right.length === visible.length
      ? [...linesFromItems(left), ...linesFromItems(right)]
      : linesFromItems(items);
  const sizes = lines.map((l) => l.size).sort((a, b) => a - b);
  const bodySize = sizes[Math.floor((sizes.length - 1) / 2)] || 12;
  const blocks: Block[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.cells.length > 1 && lines[i + 1]?.cells.length === line.cells.length) {
      const rows = [line.cells];
      while (lines[i + 1]?.cells.length === line.cells.length) rows.push(lines[++i].cells);
      blocks.push({ kind: 'table', rows });
      continue;
    }
    const kind =
      line.size > bodySize * 1.2
        ? 'heading'
        : /^\s*(?:[•●▪\-–]|\d+[.)])\s/.test(line.text)
          ? 'bullet'
          : 'paragraph';
    const prior = blocks.at(-1);
    const previousLine = lines[i - 1];
    if (
      kind === 'paragraph' &&
      prior?.kind === 'paragraph' &&
      previousLine &&
      previousLine.y > line.y &&
      previousLine.y - line.y < line.size * 1.8 &&
      Math.abs(previousLine.x - line.x) < line.size &&
      prior.rtl === line.rtl
    )
      prior.text += ' ' + line.text;
    else blocks.push({ kind, text: line.text, size: line.size, rtl: line.rtl });
  }
  return { width, height, lines, blocks, scanned: !lines.length };
}
export function modelText(model: DocumentModel): string {
  return model.pages
    .map((p) =>
      p.blocks
        .map((b) =>
          b.kind === 'image'
            ? ''
            : b.kind === 'table'
              ? b.rows.map((r) => r.join('\t')).join('\n')
              : b.text,
        )
        .join('\n\n'),
    )
    .join('\n\f\n');
}
export function guardMemory(pages: number, pixelsPerPage: number, extra = 0) {
  if (
    pages > 100 ||
    pages < 1 ||
    !Number.isFinite(pixelsPerPage) ||
    pages * pixelsPerPage * 4 + extra > 400 * 1024 * 1024
  )
    throw new Error('limit');
}
