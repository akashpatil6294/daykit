import type { DocumentModel } from './pdf-text-model';
export interface Raster {
  blob: Blob;
  width: number;
  height: number;
}
function base64(bytes: Uint8Array) {
  let s = '';
  for (const byte of bytes) s += String.fromCharCode(byte);
  return btoa(s);
}
export async function buildPptx(model: DocumentModel, rasters?: Raster[]): Promise<Blob> {
  const { default: PptxGenJS } = await import('pptxgenjs');
  const pptx = new PptxGenJS();
  const first = model.pages[0];
  pptx.defineLayout({ name: 'PDF', width: first.width / 72, height: first.height / 72 });
  pptx.layout = 'PDF';
  for (const [i, page] of model.pages.entries()) {
    const slide = pptx.addSlide();
    const factor = Math.min(first.width / page.width, first.height / page.height);
    if (rasters?.[i])
      slide.addImage({
        data: 'image/jpeg;base64,' + base64(new Uint8Array(await rasters[i].blob.arrayBuffer())),
        x: 0,
        y: 0,
        w: (page.width / 72) * factor,
        h: (page.height / 72) * factor,
      });
    else
      for (const line of page.lines || [])
        slide.addText(line.text, {
          x: (line.x / 72) * factor,
          y: ((page.height - line.y - line.size) / 72) * factor,
          w: (Math.max(line.width, line.size) / 72) * factor + 0.1,
          h: (line.size / 72) * factor * 1.6,
          fontSize: line.size * factor,
          margin: 0,
          rtlMode: line.rtl,
          fit: 'shrink',
        });
  }
  return (await pptx.write({ outputType: 'blob' })) as Blob;
}
