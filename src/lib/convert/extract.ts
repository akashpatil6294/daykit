import { pageFromItems, guardMemory, type DocumentModel } from './pdf-text-model';
import { pageSelection } from '../pdf-protocol';
import type { PDFDocumentProxy } from 'pdfjs-dist';
export async function extractModel(
  pdf: PDFDocumentProxy,
  selection: string,
  signal: AbortSignal,
  progress: (n: number) => void,
): Promise<DocumentModel> {
  if (pdf.numPages > 100) throw new Error('limit');
  const indices = pageSelection(selection, pdf.numPages);
  const pages = [];
  let skipped = 0;
  for (const [i, index] of indices.entries()) {
    signal.throwIfAborted();
    const page = await pdf.getPage(index + 1);
    try {
      const size = page.getViewport({ scale: 1 });
      guardMemory(indices.length, size.width * size.height);
      const content = await page.getTextContent();
      const items = content.items.filter((item) => 'str' in item);
      if (items.length > 100000) throw new Error('limit');
      pages.push(pageFromItems(items, size.width, size.height));
    } catch (e) {
      // Abort and limit errors must propagate; a single unreadable page
      // must not fail the whole document. When nothing at all could be
      // read, the caller reports "no text" via the scanned check.
      if (e instanceof Error && (e.message === 'limit' || e.name === 'AbortError')) throw e;
      skipped += 1;
      console.warn(`[daykit] page ${index + 1}: text extraction failed, skipping`, e);
    } finally {
      page.cleanup();
    }
    progress(((i + 1) / indices.length) * 30);
    await new Promise((r) => setTimeout(r, 0));
  }
  if (skipped > 0) console.warn(`[daykit] skipped ${skipped} unreadable page(s)`);
  return { pages };
}
