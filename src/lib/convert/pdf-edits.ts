import { PDFDocument, PDFName, StandardFonts, degrees, rgb } from 'pdf-lib';
import { pageSelection, type PdfJob } from '../pdf-protocol';
export async function editPdf(job: PdfJob) {
  const pdf = await PDFDocument.load(await job.files[0].arrayBuffer(), { updateMetadata: false });
  if (pdf.getPageCount() > 100) throw new Error('limit');
  const options = job.options || {};
  const metadata = {
    title: pdf.getTitle() || '',
    author: pdf.getAuthor() || '',
    subject: pdf.getSubject() || '',
    keywords: pdf.getKeywords() || '',
    creator: pdf.getCreator() || '',
    producer: pdf.getProducer() || '',
  };
  const selected = new Set(pageSelection(job.selection, pdf.getPageCount()));
  if (job.mode === 'delete-pdf-pages') {
    if (!job.selection.trim() || selected.size === pdf.getPageCount()) throw new Error('selection');
    for (const index of [...selected].sort((a, b) => b - a)) pdf.removePage(index);
  } else if (job.mode === 'pdf-metadata') {
    if (options.strip) {
      pdf.catalog.delete(PDFName.of('Metadata'));
      pdf.context.trailerInfo.Info = pdf.context.register(pdf.context.obj({}));
    }
  } else if (job.mode === 'sign-pdf') {
    const index = (options.page || 0) - 1;
    if (
      index < 0 ||
      index >= pdf.getPageCount() ||
      !job.signature ||
      job.signature.size > 10 * 1024 * 1024
    )
      throw new Error('signature');
    const page = pdf.getPage(index),
      x = options.x ?? 10,
      y = options.y ?? 70,
      width = options.width ?? 25;
    if (
      ![x, y, width].every(Number.isFinite) ||
      x < 0 ||
      y < 0 ||
      width < 1 ||
      x + width > 100 ||
      y >= 100
    )
      throw new Error('signature');
    const bitmap = await createImageBitmap(job.signature);
    if (bitmap.width * bitmap.height > 40e6) {
      bitmap.close();
      throw new Error('limit');
    }
    const factor = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = new OffscreenCanvas(
      Math.max(1, Math.round(bitmap.width * factor)),
      Math.max(1, Math.round(bitmap.height * factor)),
    );
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const png = await canvas.convertToBlob({ type: 'image/png' });
    const image = await pdf.embedPng(await png.arrayBuffer());
    const w = (page.getWidth() * width) / 100,
      h = (w * image.height) / image.width,
      top = (page.getHeight() * y) / 100;
    if (top + h > page.getHeight()) throw new Error('signature');
    page.drawImage(image, {
      x: (page.getWidth() * x) / 100,
      y: page.getHeight() - top - h,
      width: w,
      height: h,
    });
  } else {
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    for (const [i, page] of pdf.getPages().entries()) {
      if (!selected.has(i)) continue;
      if (job.mode === 'rotate-pdf') {
        const angle = options.rotation ?? 90;
        if (![90, 180, 270].includes(angle)) throw new Error('selection');
        page.setRotation(degrees((page.getRotation().angle + angle) % 360));
      } else {
        const text =
          job.mode === 'add-page-numbers'
            ? `${i + 1} / ${pdf.getPageCount()}`
            : (options.text || '').trim();
        if (!text || text.length > 100) throw new Error('stamp');
        try {
          font.encodeText(text);
        } catch {
          throw new Error('stamp');
        }
        const size =
          job.mode === 'add-page-numbers'
            ? 10
            : Math.min(32, (page.getWidth() - 40) / Math.max(font.widthOfTextAtSize(text, 1), 1));
        const opacity = job.mode === 'add-page-numbers' ? 1 : (options.opacity ?? 0.3);
        if (!Number.isFinite(opacity) || opacity < 0.05 || opacity > 1) throw new Error('stamp');
        const position = job.mode === 'add-page-numbers' ? 'bottom' : options.position || 'center';
        page.drawText(text, {
          font,
          size,
          x: (page.getWidth() - font.widthOfTextAtSize(text, size)) / 2,
          y:
            position === 'top'
              ? page.getHeight() - 40
              : position === 'bottom'
                ? 24
                : page.getHeight() / 2,
          opacity,
          color: rgb(0.2, 0.2, 0.2),
        });
      }
    }
  }
  return {
    blob: new Blob([(await pdf.save()) as BlobPart], { type: 'application/pdf' }),
    metadata,
  };
}
