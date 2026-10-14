export type PdfControl =
  'selection' | 'target' | 'conversionMode' | 'rotation' | 'stamp' | 'signature' | 'metadata';
type Group = 'from-pdf' | 'to-pdf' | 'edit';
function tool<S extends string>(
  slug: S,
  group: Group,
  accept: string,
  outputExt: string,
  options: PdfControl[] = [],
  multiple = false,
  needsTextLayer = false,
) {
  const mime: Record<string, string> = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    txt: 'text/plain;charset=utf-8',
    zip: 'application/zip',
  };
  return {
    slug,
    group,
    accept,
    multiple,
    outputExt,
    outputMime: mime[outputExt],
    options,
    needsTextLayer,
  };
}
// Heavy implementations stay lazy; upload rules and controls share one registry.
export const pdfCatalog = [
  tool('merge-pdf', 'edit', '.pdf', 'pdf', [], true),
  tool('split-pdf', 'edit', '.pdf', 'pdf', ['selection']),
  tool('reorder-pdf', 'edit', '.pdf', 'pdf', ['selection']),
  tool('images-to-pdf', 'to-pdf', '.jpg,.jpeg,.png', 'pdf', [], true),
  tool('pdf-to-images', 'from-pdf', '.pdf', 'zip', ['selection']),
  tool('compress-pdf', 'edit', '.pdf', 'pdf', ['selection', 'target']),
  tool('pdf-to-word', 'from-pdf', '.pdf', 'docx', ['selection'], false, true),
  tool(
    'pdf-to-powerpoint',
    'from-pdf',
    '.pdf',
    'pptx',
    ['selection', 'conversionMode'],
    false,
    true,
  ),
  tool('pdf-to-excel', 'from-pdf', '.pdf', 'xlsx', ['selection'], false, true),
  tool('word-to-pdf', 'to-pdf', '.docx', 'pdf'),
  tool('powerpoint-to-pdf', 'to-pdf', '.pptx', 'pdf'),
  tool('excel-to-pdf', 'to-pdf', '.xlsx', 'pdf'),
  tool('rotate-pdf', 'edit', '.pdf', 'pdf', ['selection', 'rotation']),
  tool('delete-pdf-pages', 'edit', '.pdf', 'pdf', ['selection']),
  tool('add-page-numbers', 'edit', '.pdf', 'pdf', ['selection']),
  tool('watermark-pdf', 'edit', '.pdf', 'pdf', ['selection', 'stamp']),
  tool('sign-pdf', 'edit', '.pdf', 'pdf', ['signature']),
  tool('pdf-metadata', 'edit', '.pdf', 'pdf', ['metadata']),
] as const;
export const pdfSlugs = pdfCatalog.map((entry) => entry.slug);
export type PdfMode = (typeof pdfCatalog)[number]['slug'];
export const getPdfTool = (mode: PdfMode) => pdfCatalog.find((entry) => entry.slug === mode)!;
