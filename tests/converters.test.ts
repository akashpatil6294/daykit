import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { zipSync, strToU8, unzipSync, strFromU8 } from 'fflate';
import { PDFDocument } from 'pdf-lib';
import {
  pageFromItems,
  modelText,
  guardMemory,
  type TextItem,
} from '../src/lib/convert/pdf-text-model';
import { safeOfficeZip, readOffice } from '../src/lib/convert/office-readers';
import { buildDocx } from '../src/lib/convert/docx-builder';
import { buildPptx } from '../src/lib/convert/pptx-builder';
import { buildXlsx } from '../src/lib/convert/xlsx-builder';
import { writePdf, fontNames } from '../src/lib/convert/pdf-writer';
const item = (str: string, x: number, y: number, size = 12, width = 160): TextItem => ({
  str,
  transform: [size, 0, 0, size, x, y],
  height: size,
  width,
});
const page = pageFromItems(
  [
    item('Application heading', 40, 750, 22),
    item('First readable paragraph', 40, 710),
    item('continues on this line', 40, 694),
    item('• A bullet', 40, 650),
  ],
  595,
  842,
);
const model = { pages: [page, page] };
describe('positioned PDF text', () => {
  it('detects headings, joins close paragraphs and retains bullets', () => {
    expect(page.blocks.map((b) => b.kind)).toEqual(['heading', 'paragraph', 'bullet']);
    expect(modelText({ pages: [page] })).toContain('paragraph continues');
  });
  it('reads prose columns top to bottom, then the next column', () => {
    const p = pageFromItems(
      [
        item('Left first line has several words', 30, 700, 12, 200),
        item('Right first line has several words', 330, 700, 12, 200),
        item('Left second line has several words', 30, 680, 12, 200),
        item('Right second line has several words', 330, 680, 12, 200),
      ],
      600,
      800,
    );
    expect(p.lines?.map((l) => l.x)).toEqual([30, 30, 330, 330]);
  });
  it('clusters aligned cells without inventing numeric types', () => {
    const p = pageFromItems(
      [
        item('Name', 30, 700, 12, 40),
        item('Value', 180, 700, 12, 40),
        item('Fee', 30, 680, 12, 40),
        item('0012', 180, 680, 12, 40),
      ],
      595,
      842,
    );
    expect(p.blocks[0]).toEqual({
      kind: 'table',
      rows: [
        ['Name', 'Value'],
        ['Fee', '0012'],
      ],
    });
  });
  it('passes Indic and RTL strings untouched and detects empty pages', () => {
    const text = 'नमस्ते ಕನ್ನಡ தமிழ் తెలుగు বাংলা مرحبا שלום';
    expect(
      modelText({ pages: [pageFromItems([{ ...item(text, 40, 700), dir: 'rtl' }], 595, 842)] }),
    ).toBe(text);
    expect(pageFromItems([], 595, 842).scanned).toBe(true);
  });
  it('enforces page and decoded-memory limits', () => {
    expect(() => guardMemory(101, 1)).toThrow('limit');
    expect(() => guardMemory(100, 2e6)).toThrow('limit');
    expect(() => guardMemory(20, 500000)).not.toThrow();
  });
});
describe('Office ZIP security', () => {
  it('rejects malformed, encrypted, traversal and oversized expansion', () => {
    expect(() => safeOfficeZip(new Uint8Array([1, 2, 3]))).toThrow('corrupt');
    expect(() => safeOfficeZip(new Uint8Array([0xd0, 0xcf]))).toThrow('encryptedOffice');
    expect(() => safeOfficeZip(zipSync({ '../x': strToU8('x') }))).toThrow('limit');
    expect(() =>
      safeOfficeZip(
        zipSync({
          '[Content_Types].xml': strToU8('<Types/>'),
          bomb: new Uint8Array(17 * 1024 * 1024),
        }),
      ),
    ).toThrow('limit');
  });
  it('rejects entity declarations before parsing XML', async () => {
    const zip = zipSync({
      '[Content_Types].xml': strToU8('<Types/>'),
      'word/document.xml': strToU8('<!DOCTYPE x [<!ENTITY x "boom">]><w:document>&x;</w:document>'),
    });
    await expect(readOffice(zip, 'docx')).rejects.toThrow('corrupt');
  });
});
describe('generated Office round trips', () => {
  it('DOCX opens with Mammoth and the neutral reader', async () => {
    const bytes = new Uint8Array(await (await buildDocx(model)).arrayBuffer());
    const mammoth = await import('mammoth');
    const text = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
    expect(text.value).toContain('Application heading');
    expect(text.value).toContain('continues on this line');
    expect(modelText(await readOffice(bytes, 'docx'))).toContain('Application heading');
  });
  it('XLSX retains literal strings and reopens', async () => {
    const bytes = new Uint8Array(await (await buildXlsx(model)).arrayBuffer());
    const { default: ExcelJS } = await import('exceljs');
    const book = new ExcelJS.Workbook();
    await book.xlsx.load(bytes as any);
    expect(book.worksheets.length).toBe(2);
    expect(book.worksheets[0].getCell('A1').value).toBe('Application heading');
    expect(modelText(await readOffice(bytes, 'xlsx'))).toContain('Application heading');
  }, 20000);
  it('PPTX creates a slide per page with valid package relationships', async () => {
    const bytes = new Uint8Array(await (await buildPptx(model)).arrayBuffer());
    const zip = unzipSync(bytes);
    expect(Object.keys(zip).filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))).toHaveLength(2);
    expect(strFromU8(zip['[Content_Types].xml'])).toContain('presentationml');
    expect(strFromU8(zip['ppt/_rels/presentation.xml.rels'])).toContain('slides/slide1.xml');
    expect(modelText(await readOffice(bytes, 'pptx'))).toContain('Application heading');
  });
  it('Office models produce readable multi-page PDF containers', async () => {
    const fonts = fontNames.map(
      (name) => new Uint8Array(fs.readFileSync(`public/fonts/pdf/${name}.ttf`)),
    );
    for (const [extension, builder] of [
      ['docx', buildDocx],
      ['xlsx', buildXlsx],
      ['pptx', buildPptx],
    ] as const) {
      const source = await builder(model);
      const parsed = await readOffice(new Uint8Array(await source.arrayBuffer()), extension);
      const result = await writePdf(parsed, fonts);
      const pdf = await PDFDocument.load(await result.arrayBuffer());
      expect(pdf.getPageCount()).toBeGreaterThan(0);
    }
  }, 30000);
});
