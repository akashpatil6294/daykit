import type { PdfMode } from '../data/pdf-tools';
import type { ToolCopy } from './tool-pages';
import { newPdfPages } from './pdf-new-pages';
import { editPdfPages } from './pdf-edit-pages';
export const pdfPages: Record<PdfMode, ToolCopy> = {
  ...newPdfPages,
  ...editPdfPages,
  'merge-pdf': {
    title: 'Merge PDF files in your browser',
    description:
      'Combine multiple PDFs in your chosen order without uploading documents. Arrange files, create a merged PDF and check the result before submitting.',
    intro:
      'Put supporting documents together in the order your application asks for. Your files stay on your device.',
    sections: [
      {
        heading: 'Build one document with a clear reading order',
        text: 'A collection of separate certificates can be difficult to review when a portal expects one attachment. Merging places the pages from each selected PDF into a new document. The first file contributes its pages first, followed by the second file, and so on. Use the move buttons beside a filename to change that sequence. The list shows file sizes so you can spot an unexpectedly large scan before starting. This operation does not deliberately rasterize pages, so ordinary page text can remain selectable.',
      },
      {
        heading: 'Know what a merged copy can change',
        text: 'The output is a new PDF, not an extension of the original files. Digital signatures should not be assumed valid after pages are copied. Document-level bookmarks, attachments, interactive forms and other advanced features may not carry over as expected. If an institution requires an original signed document, send that original through its approved process. Keep source files until you have reopened the merged copy and checked every page. For standard scanned certificates, compare orientation, margins and the visibility of stamps or handwritten information.',
      },
      {
        heading: 'Size limits still apply to the combined file',
        text: 'Joining documents does not guarantee a smaller attachment. A large scanned page remains a large scanned page when copied into a new container. First remove files that are not requested, then inspect the final byte count. If you need further reduction, use the PDF compressor and compare its image-based output carefully. Avoid repeated rounds of raster compression because small characters and faint lines can become harder to read. A portal may enforce both a file-size limit and a page-count limit; satisfying one does not satisfy the other.',
      },
    ],
    steps: [
      'Choose the PDF files you want to combine.',
      'Use Move up and Move down to arrange the file order.',
      'Create the download, save the result and reopen it to check all pages.',
    ],
    faq: [
      {
        question: 'Are my certificates sent to a server?',
        answer: 'No. The selected file bytes are read and combined locally by your browser.',
      },
      {
        question: 'Can I merge a password-protected PDF?',
        answer:
          'This tool rejects encrypted files. If authorized, export an unlocked copy using a trusted PDF application first.',
      },
      {
        question: 'Will merging reduce the file size?',
        answer:
          'Not necessarily. Merging copies pages; it is not an image-compression operation. Check the downloaded size against your destination’s limit.',
      },
    ],
  },
  'split-pdf': {
    title: 'Split a PDF and extract selected pages',
    description:
      'Extract a page range or selected pages into a new PDF locally. Keep only the document pages needed for an application, email or personal record.',
    intro:
      'Take the pages you need from a larger PDF and save them together as a separate document.',
    sections: [
      {
        heading: 'Choose pages by position, not printed labels',
        text: 'The selection field uses the physical order of pages in the PDF. Page 1 means the first page displayed by a viewer, even when its printed footer says something different or has no number. A cover, contents page or inserted blank sheet can offset printed numbering. Open the source document first and note the viewer’s page positions. Enter a range such as 2-5 for consecutive pages, or a comma-separated list such as 1,4,7 when the required pages are separated.',
      },
      {
        heading: 'Extract a useful, complete record',
        text: 'Splitting is helpful when a downloaded statement contains several unrelated sections or when an application requests only one certificate from a scan bundle. Keep enough context for the recipient to understand the extracted pages. Removing a page that explains a table, identifies its owner or carries a verification note could make the result incomplete. This tool cannot determine what an institution considers acceptable evidence. Follow the current instructions for the specific document field, and retain the full original in your own records.',
      },
      {
        heading: 'Check the boundaries before sending',
        text: 'The result places every selected page into one new PDF. It does not create a separate file for each range. To make multiple smaller documents, repeat the selection and download process with a different filename each time. Look at the first and last page of every output because boundary mistakes are easy to miss. Text and images are copied as page content rather than intentionally turned into a screenshot, but document-wide features such as signatures and bookmarks may not survive. If you need to preserve those features, use the original document or an appropriate desktop editor.',
      },
    ],
    steps: [
      'Choose one source PDF and check its page count in your viewer.',
      'Enter the positions to extract, for example 2-4,7.',
      'Create and download the new PDF, then verify its beginning and ending pages.',
    ],
    faq: [
      {
        question: 'Does a blank selection extract everything?',
        answer: 'Yes. Leave the selection empty to copy all pages in their existing order.',
      },
      {
        question: 'Can I include pages in a different order?',
        answer:
          'Yes. A list such as 4,1,2 produces that sequence. Use the reorder tool when arranging pages is your main task.',
      },
      {
        question: 'Does splitting redact private information?',
        answer:
          'No. It removes unselected pages from the output, but it does not redact content within retained pages. Do not use it as a redaction tool.',
      },
    ],
  },
  'reorder-pdf': {
    title: 'Reorder or delete PDF pages',
    description:
      'Set a new PDF page order and omit unwanted pages using a simple numbered list. Rearrange documents locally with no file upload.',
    intro:
      'Fix a scan sequence or leave out unnecessary pages using a keyboard-friendly page list.',
    sections: [
      {
        heading: 'Describe the order you want to keep',
        text: 'Start with the positions in the original PDF, then list them in the order the recipient should read them. For example, 3,1,2 moves the third source page to the beginning. A range such as 5-8 keeps those four pages in their original sequence. Combine lists and ranges when working with a longer document. Any source page you leave out is absent from the new file. The source itself is unchanged, so you can return to it if you discover an omission.',
      },
      {
        heading: 'Make deletion deliberate and reviewable',
        text: 'It can be tempting to remove every blank-looking page to reduce a document’s length. Inspect those pages first: faint stamps, reverse-side notes and small identification details can be easy to overlook in a thumbnail. Record the intended sequence on paper if the source is complicated. This tool uses page numbers rather than a drag-only interface, which also allows precise changes with a keyboard. A repeated page number produces another copy of that page, so check your list for accidental duplicates.',
      },
      {
        heading: 'Preserve meaning as well as order',
        text: 'A document’s narrative can depend on adjacent pages. Keep a declaration with its signature, a table with its column headings, and a certificate with any relevant continuation page. Rearranging a signed or certified document can affect how it is interpreted and whether it is accepted. This utility creates a convenient copy; it does not certify the copy or validate the evidence. Download the result, read it from start to finish and use a filename that distinguishes it from the original. For an official submission, confirm the required order in the current application instructions.',
      },
    ],
    steps: [
      'Select one PDF and identify the original page positions.',
      'Enter a complete keep-list in your preferred order, omitting pages to delete.',
      'Download the rebuilt document and inspect every transition between pages.',
    ],
    faq: [
      {
        question: 'How do I delete page 2 from a five-page file?',
        answer: 'Enter 1,3-5. The output contains four pages and the source stays unchanged.',
      },
      {
        question: 'Can I reverse a range using 5-1?',
        answer:
          'No. Write 5,4,3,2,1 instead. Ranges run from the lower page number to the higher one.',
      },
      {
        question: 'Is this safe for a digitally signed original?',
        answer:
          'Keep the original signed file. Copying or rearranging its pages does not preserve the original document’s cryptographic signature.',
      },
    ],
  },
  'images-to-pdf': {
    title: 'Convert images to a PDF document',
    description:
      'Turn JPG and PNG images into an ordered PDF locally. Fit scans on A4 pages, arrange the images and download a single document.',
    intro: 'Bring photographed or scanned pages together in one PDF that is easy to review.',
    sections: [
      {
        heading: 'Prepare images that are readable before conversion',
        text: 'Creating a PDF cannot restore details that were absent from a photograph. Start with images that show the full document, have even lighting and are in focus. Check all four edges, particularly when a phone camera has cropped close to a seal or signature. If the page is rotated, correct it with your device’s image editor before choosing it here. This tool fits each image within an A4 page with margins; it does not stretch the image to fill the paper or automatically correct perspective.',
      },
      {
        heading: 'Understand the image-based result',
        text: 'Each selected JPG or PNG becomes one page. Transparent regions are placed on white, and large images are reduced to a practical working resolution before JPEG encoding. This keeps processing manageable on mobile devices, but it can soften very fine details. The output contains pictures of pages rather than searchable text. Optical character recognition is not performed. If selectable text or an accessible document is required, obtain a properly exported PDF or use a suitable OCR workflow and verify its reading order separately.',
      },
      {
        heading: 'Arrange the packet before downloading',
        text: 'Choose the images, then use the move controls to set their order. File selection order can vary between devices, so never assume the first image selected will always be the first page without checking the list. The filename beside each entry helps identify the intended sequence. After creating the PDF, open it in a viewer and confirm orientation, margins and page order. If the file is too large for a portal, first remove unnecessary pages; only then consider reducing quality. Keep the original photographs or scans so you can produce a clearer copy if requested.',
      },
    ],
    steps: [
      'Choose JPG or PNG page images from your device.',
      'Arrange the filenames in the intended reading order.',
      'Create the PDF and inspect each page at normal reading size.',
    ],
    faq: [
      {
        question: 'Can I use a HEIC photo directly?',
        answer: 'Convert it with the HEIC-to-JPG tool first, then select the resulting JPG here.',
      },
      {
        question: 'Will the PDF contain selectable text?',
        answer:
          'No. The pages are images. Converting their container to PDF does not add OCR or an accessible text layer.',
      },
      {
        question: 'Will every picture be stretched to A4?',
        answer:
          'No. Each picture keeps its aspect ratio and is fitted inside A4 margins, leaving white space where necessary.',
      },
    ],
  },
  'pdf-to-images': {
    title: 'Convert PDF pages to JPG images',
    description:
      'Render PDF pages as JPG images and download a ZIP archive. Choose pages locally without sending the document to a conversion service.',
    intro:
      'Make image copies of selected PDF pages for a preview, reference or image-only upload field.',
    sections: [
      {
        heading: 'Render a page, rather than extract an embedded picture',
        text: 'A PDF page can combine text, vector lines, photographs and several separate images. This converter draws the entire visible page into one JPG. It does not pull the original embedded photograph out of the PDF at its original resolution. This distinction matters when you need a portrait from an application: rendering the full page also includes surrounding labels and white space. Use a separate crop step when appropriate, and confirm that the destination permits the resulting image.',
      },
      {
        heading: 'Use a selection to keep the download manageable',
        text: 'Choose one PDF and enter page positions if you only need a few images. Leaving the selection blank renders the whole document, up to the supported page limit. The images are placed in a ZIP archive with sequential filenames so their output order is clear. You will need to extract that archive using your device’s file manager before choosing an individual JPG on an upload form. The first rendered page is shown as a preview, but you should also open the remaining images after extraction.',
      },
      {
        heading: 'Check clarity and handle the copies carefully',
        text: 'Rendering turns text into pixels. You cannot select, search or copy that text from the JPG as you could from a text-based PDF. Small print may need a larger source or a different export method when the image is intended for close inspection. The converter uses a bounded resolution to avoid excessive memory use on phones. Sensitive information visible on a PDF page remains visible in the image copy, so store and share it with the same care as the source. Delete temporary copies from shared devices when they are no longer needed.',
      },
    ],
    steps: [
      'Select a PDF and optionally list the pages to render.',
      'Create the download while the page progress updates.',
      'Extract the ZIP archive and inspect the JPG files before using them.',
    ],
    faq: [
      {
        question: 'Why is the download a ZIP file?',
        answer:
          'An archive keeps multiple page images together in one download. Extract it to access the individual JPG files.',
      },
      {
        question: 'Does this extract only photos from the PDF?',
        answer:
          'No. It renders each selected page as a complete image, including text and other visible page content.',
      },
      {
        question: 'Can I reverse the conversion later?',
        answer:
          'Images can be placed back into a PDF, but that will not restore text selection, links, form controls or original vector detail.',
      },
    ],
  },
  'compress-pdf': {
    title: 'Compress a PDF to a target KB size',
    description:
      'Reduce a scanned PDF toward 100 KB, 200 KB, 500 KB or a custom limit in your browser. Review the image-based result before submitting.',
    intro:
      'Try a smaller document for a strict upload limit, with a clear warning about the quality trade-off.',
    sections: [
      {
        heading: 'What target compression changes',
        text: 'This compressor renders each selected page as an image, encodes it as JPEG and builds a new PDF. It tries decreasing JPEG quality, then lower rendering scales, until a candidate fits under your target. Because it rebuilds the page appearance, selectable text becomes pixels. Interactive forms, links, accessibility tags and digital signatures are not preserved. Keep an untouched source copy. This approach is mainly useful for scanned documents where the pages are already pictures; a well-optimized text PDF may become larger or less useful when rasterized.',
      },
      {
        heading: 'A size target is not a readability guarantee',
        text: 'The same byte budget has very different consequences for a single clean form and a thirty-page scan full of photographs. The tool has a minimum rendering scale and reports a failure if the requested size cannot be reached within that limit. Even a successful result may be too soft for submission. Read small numbers, dates, names, seals and handwritten marks at a normal viewing size. If any become uncertain, use a larger target, fewer pages where permitted, or a cleaner original scan. Do not trade away required information just to pass a byte check.',
      },
      {
        heading: 'Use the destination’s actual requirement',
        text: 'Choose a preset or enter a custom limit from the current application instructions. Here, one KB is treated as 1,024 bytes. Some destinations count decimal kilobytes or reject a file equal to their stated maximum, so leave a margin when necessary. The result panel shows both the combined input size and output size. Inspect the preview, download the file and reopen all of its pages before uploading it elsewhere. Processing happens locally; this page does not send your form to the destination portal or tell you whether the portal will accept it.',
      },
    ],
    steps: [
      'Select one PDF and choose a target or enter a custom KB value.',
      'Read the flattening warning, then start processing.',
      'Compare size and legibility; download only if every required detail remains clear.',
    ],
    faq: [
      {
        question: 'Can every PDF fit below 200 KB?',
        answer:
          'No. Page count, scan noise and fine detail affect the achievable size. A higher limit or a cleaner scan may be necessary.',
      },
      {
        question: 'Why can I no longer select text?',
        answer:
          'Compression rasterizes pages. The output preserves a rendered appearance rather than the original text objects.',
      },
      {
        question: 'Does this remove a password?',
        answer:
          'No. Password-protected documents are rejected. Use an authorized, unlocked source copy if your workflow permits it.',
      },
    ],
  },
};
