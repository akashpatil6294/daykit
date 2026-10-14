/// <reference lib="webworker" />
import type { PdfJob } from '../lib/pdf-protocol';
const scope = self as unknown as DedicatedWorkerGlobalScope;
async function prepare(mode: string) {
  if (mode === 'pdf-to-word')
    await Promise.all([import('docx'), import('../lib/convert/docx-builder')]);
  else if (mode === 'pdf-to-powerpoint')
    await Promise.all([import('pptxgenjs'), import('../lib/convert/pptx-builder')]);
  else if (mode === 'pdf-to-excel')
    await Promise.all([import('exceljs'), import('../lib/convert/xlsx-builder')]);
  else if (['word-to-pdf', 'powerpoint-to-pdf', 'excel-to-pdf'].includes(mode)) {
    await import('../lib/convert/office-readers');
    const writer = await import('../lib/convert/pdf-writer');
    await import('@pdf-lib/fontkit');
    await writer.prepareFonts();
  }
}
scope.onmessage = async ({ data }: { data: PdfJob & { prepare?: boolean } }) => {
  try {
    await prepare(data.mode);
    if (data.prepare) {
      scope.postMessage({ ready: true });
      return;
    }
    if (data.files.length > 50 || data.files.reduce((n, f) => n + f.size, 0) > 50 * 1024 * 1024)
      throw new Error('limit');
    scope.postMessage({ progress: 35 });
    let blob: Blob;
    if (data.mode === 'pdf-to-word')
      blob = await (await import('../lib/convert/docx-builder')).buildDocx(data.model!);
    else if (data.mode === 'pdf-to-powerpoint')
      blob = await (
        await import('../lib/convert/pptx-builder')
      ).buildPptx(data.model!, data.rasters);
    else if (data.mode === 'pdf-to-excel')
      blob = await (await import('../lib/convert/xlsx-builder')).buildXlsx(data.model!);
    else {
      const { readOffice } = await import('../lib/convert/office-readers');
      const model = await readOffice(
        new Uint8Array(await data.files[0].arrayBuffer()),
        data.files[0].name.split('.').at(-1)!.toLowerCase(),
      );
      scope.postMessage({ progress: 65 });
      blob = await (await import('../lib/convert/pdf-writer')).writePdf(model);
    }
    scope.postMessage({ blob });
  } catch (e) {
    scope.postMessage({ error: e instanceof Error ? e.message : 'failed' });
  }
};
