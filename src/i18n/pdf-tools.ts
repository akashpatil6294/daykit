import { localize } from './runtime';
export const pdfText = localize({
  eyebrow: 'DOCUMENT TOOLS',
  privacy: 'Processed in your browser. Nothing is uploaded.',
  uploadNotice:
    'This tool uploads your file to our conversion service and attempts to delete temporary files when processing finishes. It is not processed in your browser.',
  choose: 'Choose files or drop them here',
  help: 'Choose the format shown for this tool. Maximum 50 MB total, 50 files and 100 pages. Office tools accept DOCX, PPTX or XLSX only.',
  helpUpload:
    'Choose the format shown for this tool. Maximum 25 MB and 100 pages. Your file is uploaded to the converter and cleaned up when processing finishes.',
  files: 'Selected files',
  remove: 'Remove',
  up: 'Move up',
  down: 'Move down',
  run: 'Create download',
  cancel: 'Cancel',
  working: 'Processing',
  ready: 'Ready to download',
  pages: 'Page order / selection',
  pageHelp:
    'Use page numbers in the order you want, for example 3,1,4-6. Omit pages to delete them. Leave blank for all pages.',
  target: 'Target size (KB)',
  preset: 'Size preset',
  custom: 'Custom',
  flatten:
    'Compression turns every page into an image. Text becomes non-selectable; forms, links, accessibility tags and digital signatures are not preserved. Keep the original.',
  quality:
    'Review every page at normal reading size before submitting. A small file is not useful if text is unclear.',
  preview: 'First output page preview',
  before: 'Input size',
  after: 'Output size',
  clear: 'Clear files',
  format: 'Output format',
  groups: {
    'from-pdf': 'Convert from PDF',
    'to-pdf': 'Convert to PDF',
    edit: 'Edit PDF',
    images: 'Image tools',
  },
  loading: 'Loading local tools…',
  loaded: 'Ready for offline processing in this tab',
  retry: 'Reload local tools',
  conversionMode: 'Slide content',
  imageMode: 'Image slides (appearance, not editable text)',
  textMode: 'Editable text (reconstructed layout)',
  converterQuality:
    'High-fidelity conversion: layout, fonts and images are preserved as closely as the format allows, but the result is a reconstruction, not a pixel-perfect copy. Scanned or complex PDFs may need minor edits. Keep your original and review every page.',
  officeQuality:
    'High-fidelity conversion: layout and fonts are matched as closely as possible, but conversion engines render differently, so pagination and spacing can shift. Keep your original and review every page.',
  imageQuality:
    'Exact-look mode: each slide is a picture of one PDF page, so the appearance matches the original as closely as possible. Text is not editable or searchable. Keep your original.',
  scanned: 'This page looks scanned. Text cannot be extracted without OCR.',
  scannedHelp:
    'Use image slides or PDF to images to keep a visual copy. Text-mode downloads omit scanned page content.',
  imageAlternative: 'Open PDF to image slides',
  rotation: 'Rotate selected pages clockwise',
  deleteHelp: 'Enter pages to remove. All other pages stay in their original order.',
  stamp: 'Watermark text',
  opacity: 'Opacity',
  position: 'Position',
  positions: { top: 'Top', center: 'Center', bottom: 'Bottom' },
  signature: 'Signature image (PNG or JPG)',
  draw: 'Draw a signature',
  drawHelp:
    'Draw with a pointer, or upload a signature image using the labeled file field. Drawing is an alternative input.',
  clearDrawing: 'Clear drawing',
  signaturePage: 'Page number for signature',
  signatureX: 'Horizontal position (% from left)',
  signatureY: 'Vertical position (% from top)',
  signatureWidth: 'Signature width (% of page)',
  signatureQuality:
    'This places a visible image, not a cryptographic digital signature. Use only a signature you are authorized to apply. Existing digital signatures may become invalid.',
  metadata: 'Input document metadata',
  signaturePreview: 'Signed page preview',
  metadataFields: {
    title: 'Title',
    author: 'Author',
    subject: 'Subject',
    keywords: 'Keywords',
    creator: 'Creator',
    producer: 'Producer',
  },
  strip: 'Remove document information and XMP metadata',
  metadataQuality:
    'Removes document-level information and XMP. This is not redaction or complete anonymization: page text, annotations, attachments and embedded images may still contain personal information.',
  remote: 'Upload and convert',
  remoteConsent: 'This file is sent to our converter and cleaned up when processing finishes.',
  remotePrivacy:
    'Conversion uploads your file to our converter for processing. Temporary files are cleaned up when processing finishes; interruptions may delay deletion. If the converter is unreachable, this tool cannot convert in your browser instead.',
  instructions: 'How to use this tool',
  faq: 'Frequently asked questions',
  related: 'Related tools',
  download: 'Download result',
  noScript:
    'Enable JavaScript to process documents. The instructions below remain available without it.',
  errors: {
    invalid: 'Choose the supported file type for this tool.',
    limit: 'Use at most 50 MB of files and 100 pages per job.',
    empty: 'Choose at least one file first.',
    single: 'Choose one PDF for this tool.',
    password:
      'This PDF is password-protected. Open it in a trusted PDF app and export an unlocked copy if you are authorized to do so.',
    corrupt:
      'This document could not be read. It may be damaged or use an unsupported PDF feature. Try exporting a fresh copy.',
    selection: 'Enter valid page numbers within the document, such as 1,3-5.',
    target: 'Enter a target from 20 to 50,000 KB.',
    unreachable:
      'The target cannot be reached at the minimum supported resolution. Choose a larger target or fewer pages.',
    unsupported:
      'This browser does not support the required image processing features. Use a recent browser.',
    failed: 'Processing failed. Try a smaller document or export a fresh copy.',
    noText: 'No text layer was found. Use image slides or PDF to images; OCR is not included.',
    unsupportedOffice:
      'Use DOCX, PPTX or XLSX. Legacy DOC/PPT/XLS and macro-enabled files are unsupported; re-save a copy in a supported format.',
    encryptedOffice:
      'This Office file is encrypted or uses the older binary format. Export an unencrypted DOCX, PPTX or XLSX copy in your Office application.',
    tooManyCells: 'The spreadsheet is too large. Use at most 200,000 cells and 1,000 columns.',
    fontMissing:
      'A character has no supported local font. Replace that character or export the PDF using your original Office application.',
    signature: 'Choose or draw a signature and enter a valid page and placement.',
    stamp: 'Enter watermark text using supported Latin characters, at most 100 characters.',
    remote:
      'The optional service could not convert this file. Check its configuration or use browser mode.',
    remoteMissing:
      'The conversion service is not configured. This tool needs its converter URL to be set.',
    remoteConsent: 'Tick the consent checkbox to allow the upload, then convert again.',
    tooLarge: 'Conversion uploads are limited to 25 MB and 100 pages per file.',
    pageLimit: 'This PDF has more than 100 pages. Convert a smaller selection.',
    timeout: 'The conversion timed out. Try a smaller file or fewer pages.',
    serviceDown:
      'The conversion service did not respond. Check your connection and try again later.',
    conversionFailed:
      'The conversion failed on the service. Try exporting a fresh copy of the file.',
    ocrUnavailable:
      'This PDF looks scanned. The converter cannot read text from page images on this setup.',
  },
  ocrApplied:
    'Optical character recognition was applied to this scanned file before conversion. Check the extracted text carefully.',
} as const);
