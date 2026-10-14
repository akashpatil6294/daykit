/// <reference lib="webworker" />
import { PDFDocument } from 'pdf-lib';
import { zipSync } from 'fflate';
import { pageSelection, type PdfJob } from '../lib/pdf-protocol';
const scope = self as unknown as DedicatedWorkerGlobalScope;
scope.onmessage = async ({ data: job }: { data: PdfJob }) => {
  try {
    const output = await PDFDocument.create();
    let total = 0;
    const progress = (value: number) => scope.postMessage({ progress: value });
    if (job.rasters) {
      if (job.images) {
        const entries: Record<string, Uint8Array> = {};
        for (let i = 0; i < job.rasters.length; i++)
          entries[`page-${String(i + 1).padStart(3, '0')}.jpg`] = new Uint8Array(
            await job.rasters[i].blob.arrayBuffer(),
          );
        const bytes = zipSync(entries, { level: 0 });
        scope.postMessage({ blob: new Blob([bytes as BlobPart], { type: 'application/zip' }) });
        return;
      }
      for (const [i, raster] of job.rasters.entries()) {
        const image = await output.embedJpg(await raster.blob.arrayBuffer());
        const page = output.addPage([raster.width, raster.height]);
        page.drawImage(image, { x: 0, y: 0, width: raster.width, height: raster.height });
        progress(((i + 1) / job.rasters.length) * 95);
      }
    } else if (job.mode === 'images-to-pdf') {
      for (const [i, file] of job.files.entries()) {
        const bitmap = await createImageBitmap(file);
        if (bitmap.width * bitmap.height > 40e6) {
          bitmap.close();
          throw new Error('limit');
        }
        const factor = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
        const canvas = new OffscreenCanvas(
          Math.max(1, Math.round(bitmap.width * factor)),
          Math.max(1, Math.round(bitmap.height * factor)),
        );
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();
        const jpeg = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.92 });
        const image = await output.embedJpg(await jpeg.arrayBuffer());
        const page = output.addPage([595.28, 841.89]);
        const fit = Math.min(555.28 / image.width, 801.89 / image.height);
        page.drawImage(image, {
          x: (595.28 - image.width * fit) / 2,
          y: (841.89 - image.height * fit) / 2,
          width: image.width * fit,
          height: image.height * fit,
        });
        progress(((i + 1) / job.files.length) * 95);
      }
    } else {
      for (const [i, file] of job.files.entries()) {
        const source = await PDFDocument.load(await file.arrayBuffer());
        total += source.getPageCount();
        if (total > 100) throw new Error('limit');
        const indices =
          job.mode === 'merge-pdf'
            ? source.getPageIndices()
            : pageSelection(job.selection, source.getPageCount());
        for (const page of await output.copyPages(source, indices)) output.addPage(page);
        progress(((i + 1) / job.files.length) * 95);
      }
    }
    const bytes = await output.save();
    scope.postMessage({ blob: new Blob([bytes as BlobPart], { type: 'application/pdf' }) });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    scope.postMessage({
      error: /encrypt|password/i.test(message)
        ? 'password'
        : ['selection', 'limit'].includes(message)
          ? message
          : 'corrupt',
    });
  }
};
