import { PDFDocument, rgb, type PDFFont } from 'pdf-lib';
import type { DocumentModel } from './pdf-text-model';
export const fontNames = [
  'NotoSans',
  'NotoSansDevanagari',
  'NotoSansKannada',
  'NotoSansTamil',
  'NotoSansTelugu',
  'NotoSansBengali',
  'NotoSansArabic',
  'NotoSansHebrew',
] as const;
let fontData: Promise<Uint8Array[]> | undefined;
export function prepareFonts() {
  return (fontData ??= Promise.all(
    fontNames.map(async (name) => {
      const r = await fetch(`/fonts/pdf/${name}.ttf`);
      if (!r.ok) throw new Error('fontMissing');
      return new Uint8Array(await r.arrayBuffer());
    }),
  ).catch((e) => {
    fontData = undefined;
    throw e;
  }));
}
export async function writePdf(model: DocumentModel, suppliedFonts?: Uint8Array[]): Promise<Blob> {
  const { default: fontkit } = await import('@pdf-lib/fontkit');
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const fonts = await Promise.all(
    (suppliedFonts || (await prepareFonts())).map((data) => pdf.embedFont(data, { subset: true })),
  );
  const supports = fonts.map((f) => new Set(f.getCharacterSet()));
  function runs(text: string) {
    const result: { text: string; font: PDFFont }[] = [];
    for (const char of text.replace(/[\u0000-\u0008\u000b-\u001f]/g, '')) {
      const point = char.codePointAt(0)!;
      const index = supports.findIndex((s) => s.has(point));
      if (index < 0) throw new Error('fontMissing');
      const font = fonts[index];
      if (result.at(-1)?.font === font) result.at(-1)!.text += char;
      else result.push({ text: char, font });
    }
    return result;
  }
  let page = pdf.addPage(),
    y = 0;
  function newPage() {
    if (pdf.getPageCount() >= 100) throw new Error('limit');
    page = pdf.addPage([595.28, 841.89]);
    y = 795;
  }
  // Reflow into readable A4 pages, not an Office pagination engine.
  function line(text: string, size: number) {
    let buffer = '';
    const width = (s: string) =>
      runs(s).reduce((n, r) => n + r.font.widthOfTextAtSize(r.text, size), 0);
    const flush = () => {
      if (y < size + 40) newPage();
      let x = 40;
      for (const r of runs(buffer)) {
        page.drawText(r.text, { x, y, size, font: r.font, color: rgb(0.1, 0.1, 0.1) });
        x += r.font.widthOfTextAtSize(r.text, size);
      }
      y -= size * 1.5;
      buffer = '';
    };
    for (const word of text.split(/(\s+)/)) {
      if (width(buffer + word) > 515 && buffer) flush();
      for (const char of word) {
        if (width(buffer + char) > 515 && buffer) flush();
        buffer += char;
      }
    }
    if (buffer) flush();
  }
  pdf.removePage(0);
  for (const source of model.pages) {
    newPage();
    for (const block of source.blocks) {
      if (block.kind === 'image') {
        const img =
          block.format === 'png'
            ? await pdf.embedPng(block.bytes)
            : await pdf.embedJpg(block.bytes);
        const factor = Math.min(515 / img.width, 320 / img.height, 1),
          w = img.width * factor,
          h = img.height * factor;
        if (y - h < 40) newPage();
        page.drawImage(img, { x: 40, y: y - h, width: w, height: h });
        y -= h + 12;
      } else if (block.kind === 'table') {
        // Row values are kept in order; wide tables reflow instead of clipping.
        for (const row of block.rows) line(row.join('  |  '), 10);
        y -= 10;
      } else {
        line(
          (block.kind === 'bullet' && !/^[•\-]/.test(block.text) ? '• ' : '') + block.text,
          block.kind === 'heading' ? 18 : 11,
        );
        y -= 8;
      }
    }
  }
  if (!pdf.getPageCount()) throw new Error('noText');
  return new Blob([(await pdf.save()) as BlobPart], { type: 'application/pdf' });
}
