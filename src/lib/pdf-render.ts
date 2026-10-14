import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { pageSelection } from './pdf-protocol';
import { guardMemory } from './convert/pdf-text-model';
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
let offlineData: Record<string, Uint8Array> | undefined;
let preparing: Promise<void> | undefined;
class LocalBinaryDataFactory {
  async fetch({ kind, filename }: { kind: string; filename: string }) {
    const dir: Record<string, string> = {
      cMapUrl: 'cmaps',
      standardFontDataUrl: 'standard_fonts',
      wasmUrl: 'wasm',
    };
    const bytes = offlineData?.[`${dir[kind]}/${filename}`];
    if (!bytes) throw new Error('unsupported');
    return bytes.slice();
  }
}
export function preparePdf() {
  return (preparing ??= (async () => {
    const [workerResponse, assetsResponse] = await Promise.all([
      fetch(workerUrl, { cache: 'force-cache' }),
      fetch('/pdf-assets/offline.zip', { cache: 'force-cache' }),
    ]);
    if (!workerResponse.ok || !assetsResponse.ok) throw new Error('failed');
    const { unzip } = await import('fflate');
    const compressed = new Uint8Array(await assetsResponse.arrayBuffer());
    offlineData = await new Promise((resolve, reject) =>
      unzip(compressed, (e, data) => (e ? reject(e) : resolve(data))),
    );
  })().catch((e) => {
    preparing = undefined;
    throw e;
  }));
}
// Parsing runs in PDF.js's worker. Display work is sliced with onContinue;
// canvas encoding is asynchronous, and PDF assembly runs in our own worker.
export async function openPdf(file: File) {
  return pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    standardFontDataUrl: '/pdf-assets/standard_fonts/',
    cMapUrl: '/pdf-assets/cmaps/',
    cMapPacked: true,
    wasmUrl: '/pdf-assets/wasm/',
    ...(offlineData ? { useWorkerFetch: false, BinaryDataFactory: LocalBinaryDataFactory } : {}),
  }).promise;
}
export async function rasterize(
  pdf: pdfjs.PDFDocumentProxy,
  selection: string,
  scale: number,
  quality: number,
  signal: AbortSignal,
  progress: (value: number) => void,
) {
  if (pdf.numPages > 100) throw new Error('limit');
  const indices = pageSelection(selection, pdf.numPages);
  const rasters = [];
  for (const [i, index] of indices.entries()) {
    signal.throwIfAborted();
    const page = await pdf.getPage(index + 1);
    const original = page.getViewport({ scale: 1 });
    const factor = Math.min(scale, 2400 / Math.max(original.width, original.height));
    const viewport = page.getViewport({ scale: factor });
    guardMemory(indices.length, viewport.width * viewport.height);
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const task = page.render({ canvas, viewport, background: 'rgb(255,255,255)' });
    task.onContinue = (resume: () => void) =>
      setTimeout(() => (signal.aborted ? task.cancel() : resume()), 0);
    await task.promise;
    signal.throwIfAborted();
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (value) => (value ? resolve(value) : reject(new Error('failed'))),
        'image/jpeg',
        quality,
      ),
    );
    rasters.push({ blob, width: original.width, height: original.height });
    canvas.width = canvas.height = 1;
    page.cleanup();
    progress(((i + 1) / indices.length) * 80);
  }
  return rasters;
}
