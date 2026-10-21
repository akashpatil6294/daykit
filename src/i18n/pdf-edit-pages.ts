import type { ToolCopy } from './tool-pages';
export const editPdfPages = {
  'rotate-pdf': {
    title: 'Rotate selected PDF pages locally',
    description:
      'Turn sideways or upside-down PDF pages by 90, 180 or 270 degrees. Select pages, preserve ordinary page content and inspect the downloaded copy.',
    intro: 'Correct page orientation without turning the whole document into new images.',
    sections: [
      {
        heading: 'Change orientation without rescanning',
        text: 'A sideways scan can be awkward to read even when its text is clear. Rotation changes the PDF page rotation setting so viewers display the page at the chosen angle. This operation does not deliberately redraw every page as a photograph or reduce image quality. Select ninety degrees for a quarter turn, one hundred eighty for an upside-down page, or two hundred seventy for the opposite quarter turn. The angle is added to the page’s current rotation, so applying the same setting twice has a cumulative effect. Work from your original document when comparing alternatives, and use the downloaded copy only after checking that the page now reads in the intended direction.',
      },
      {
        heading: 'Apply the change to the right pages',
        text: 'Leave the selection blank to rotate every page, or enter the page numbers that need correction. A comma-separated list and ascending ranges let you target a few pages within a longer document. Rotation keeps every page in its existing order; the selection identifies pages to edit rather than pages to extract. If your document combines portrait forms and landscape tables, inspect each selected page individually. A landscape table is not necessarily incorrect simply because it is wider than the surrounding pages. Rotation also does not crop excess borders, deskew a slightly tilted scan or repair text that was already cut off when the image was captured.',
      },
      {
        heading: 'Verify the saved orientation in another viewer',
        text: 'The first output page preview offers a quick visual check, but it may not be one of the pages you selected. Download the file and inspect all changed pages in your usual PDF viewer, including print preview if the document will be printed. Ordinary text and page artwork remain in the PDF; interactive behavior and existing digital signatures should still be treated cautiously after any saved modification. Rotation is not a way to certify an official document or validate its contents. Keep the source file available so you can restore it if the destination interprets page rotation differently. Processing remains inside the loaded browser tab, subject to the same file-size and page-count limits as the other PDF editors.',
      },
    ],
    steps: [
      'Choose the PDF and specify pages, or leave selection blank for all pages.',
      'Choose the clockwise angle and create the download.',
      'Open the saved copy and inspect every changed page.',
    ],
    faq: [
      {
        question: 'Does rotation delete unselected pages?',
        answer: 'No. Unselected pages stay in the document in their original order.',
      },
      {
        question: 'Will this straighten a slightly tilted scan?',
        answer: 'No. The available rotations are quarter turns, not arbitrary deskew angles.',
      },
      {
        question: 'Are pages converted into JPG images?',
        answer:
          'No. Rotation changes the PDF page setting without deliberately rasterizing its content.',
      },
    ],
  },
  'delete-pdf-pages': {
    title: 'Delete unwanted PDF pages in your browser',
    description:
      'Remove selected PDF pages while keeping the rest in order. Enter pages to delete, inspect the output and retain the source document for recovery.',
    intro: 'Create a shorter PDF by identifying the pages you want to remove.',
    sections: [
      {
        heading: 'Select pages to remove rather than keep',
        text: 'This editor uses the page selection as a removal list. If you enter page two, the output contains all source pages except page two. That differs from the split tool, where a selection describes the pages to keep. The distinction is visible beside the input because confusing the two can remove useful material. You can combine individual page numbers and ascending ranges, such as a cover sheet followed by several duplicate scans. The remaining pages keep their original sequence. Page numbers refer to their positions in the input file, starting with one, rather than to numbers printed in a header or footer. Check the viewer’s page counter when the document contains an unnumbered cover.',
      },
      {
        heading: 'Remove redundant material carefully',
        text: 'A shorter attachment is easier to review when every remaining page serves the requested purpose. Typical candidates for removal include an accidental blank scan or an extra copy of a certificate. Do not assume that a page with little visible text is unnecessary: it might contain an endorsement, a stamp, a continuation notice or relevant instructions. Review front and back scans before deleting either side of an official record. The tool requires an explicit selection and refuses to remove every page, so a successful output always contains something. It does not decide which documents an examination portal needs, and it does not replace the current submission instructions from the receiving institution.',
      },
      {
        heading: 'Deletion is not redaction or secure erasure',
        text: 'The result is a new downloadable document with selected pages removed from its page tree. This operation is not a promise to erase every underlying object, embedded attachment or other hidden data in the PDF container. If you need to remove sensitive information securely, use a dedicated redaction workflow and validate the result with appropriate inspection tools. Existing digital signatures can become invalid when the document changes. Keep the original in a separate location, reopen the new copy and confirm both the page count and the transition between remaining sections. Your selected file is processed in browser memory and is not uploaded. Downloaded copies remain on your device until you choose to remove them.',
      },
    ],
    steps: [
      'Choose a PDF and review its source page positions.',
      'Enter the pages to delete and create the remaining-page copy.',
      'Check the new page count and confirm that all required content remains.',
    ],
    faq: [
      {
        question: 'What happens if I leave the field blank?',
        answer: 'The tool asks for a valid removal selection instead of deleting all pages.',
      },
      {
        question: 'Can I remove the entire document?',
        answer: 'No. At least one page must remain.',
      },
      {
        question: 'Is this safe redaction of confidential data?',
        answer: 'No. Page removal is not complete sanitization or verified secure erasure.',
      },
    ],
  },
  'add-page-numbers': {
    title: 'Add visible page numbers to a PDF',
    description:
      'Stamp current page positions at the bottom of selected PDF pages locally. Keep existing content and check that numbering does not cover important text.',
    intro: 'Make a document easier to discuss by adding a visible page-position label.',
    sections: [
      {
        heading: 'Add a reference label to the current sequence',
        text: 'Page numbers help when a reviewer needs to refer to a particular part of a combined document. This tool adds a small label at the bottom of selected pages, using the current position and total page count. It does not renumber sections according to the source author’s printed numbering or detect chapters. If a merged file contains a cover and several certificates, the label reflects that combined sequence. Add numbering after merging, deleting or reordering pages so the labels describe the final order. If you later change the sequence again, return to an unnumbered copy rather than stamping a second set of conflicting labels onto the same pages.',
      },
      {
        heading: 'Choose pages and inspect the footer space',
        text: 'Leaving the selection blank numbers every page. A selection limits which pages receive the label, while the total still counts the entire document. That lets you omit a cover without pretending that the cover no longer occupies a position in the PDF. The label is centered near the bottom edge using a basic font. The editor does not expand page margins or move existing content out of the way. A certificate with a seal, barcode or signature near the footer may therefore be unsuitable for this operation. Inspect that space before creating a numbered submission, and follow any instruction that prohibits adding markings to an official record.',
      },
      {
        heading: 'Treat numbering as an added visible annotation',
        text: 'The output is a modified PDF, not a newly certified version of its source. Ordinary page text and graphics remain, but existing cryptographic signatures may no longer validate after saving. The numbers are drawn into page content and are not a substitute for accessible document structure, bookmarks or PDF page-label metadata. Some rotated or unusually cropped pages may place the stamp differently from what you expect, so examine every numbered page rather than only the preview. Keep an untouched source copy for recovery. The browser performs the edit locally, and the downloaded file can be checked in another viewer before sharing. Numbering does not compress the document or guarantee acceptance by an upload portal.',
      },
    ],
    steps: [
      'Finish arranging the document, then choose its PDF file.',
      'Select pages to number or leave the selection blank.',
      'Create and inspect the numbered copy, especially around footer content.',
    ],
    faq: [
      {
        question: 'Can I skip a cover page?',
        answer:
          'Yes. Select the other page positions; the displayed total still includes the cover.',
      },
      {
        question: 'Does this replace existing printed numbers?',
        answer: 'No. It adds a new visible label without removing old text.',
      },
      {
        question: 'Will numbering reduce file size?',
        answer: 'No. It adds content and is not a compression operation.',
      },
    ],
  },
  'watermark-pdf': {
    title: 'Add a text watermark to PDF pages',
    description:
      'Place a short text watermark on selected PDF pages with adjustable opacity and position. Process locally and check that the mark does not obscure content.',
    intro: 'Label a working copy visibly while preserving your untouched original.',
    sections: [
      {
        heading: 'Use a short label with a clear purpose',
        text: 'A watermark can help distinguish a working copy from the version you intend to submit. Enter a short phrase, choose a vertical position and adjust opacity before creating the PDF. The browser draws that text onto each selected page using a basic embedded font. This implementation supports the font’s Latin character repertoire and reports unsupported characters instead of silently losing them. A one hundred character limit keeps the stamp bounded, but a much shorter label is usually easier to read. Do not use a watermark to imply institutional approval, certification or ownership that you do not have. It is simply visible text added to your own working copy.',
      },
      {
        heading: 'Balance visibility with the underlying document',
        text: 'A dark mark across a table can make figures harder to read, while a very faint mark may disappear on a printer or low-quality screen. Compare the chosen opacity with the background of the actual pages. Top, center and bottom positions are approximate placements on the page canvas; the tool does not detect blank regions, faces, signatures or seals. A page selection can restrict the watermark to the relevant part of the document. Other pages stay present and retain their order. For mixed page sizes, the font size is bounded to fit the page width, but you should still inspect pages with unusual crop boxes or rotation.',
      },
      {
        heading: 'A watermark is neither encryption nor redaction',
        text: 'Adding text does not stop another person from copying, printing or editing the file. It does not remove sensitive content hidden underneath the mark, and it does not create a digital signature. Anyone who needs confidentiality should use a suitable secure sharing method rather than rely on a visual label. Save the downloaded watermarked copy under a different filename and keep the original unchanged. Existing PDF signatures may become invalid after the edit. Before sharing, reopen all marked pages, zoom into text behind the watermark and check print preview if printing matters. The file stays in your browser during this operation; the output remains a local download until you decide how to distribute it.',
      },
    ],
    steps: [
      'Choose a PDF and the pages that should receive the mark.',
      'Enter a short watermark, position and opacity.',
      'Create the copy and check readability behind every mark.',
    ],
    faq: [
      {
        question: 'Can the watermark hide confidential text?',
        answer: 'No. A visible overlay does not remove the underlying text and is not redaction.',
      },
      {
        question: 'Can I enter every language?',
        answer: 'This basic watermark uses a Latin font. Unsupported characters produce an error.',
      },
      {
        question: 'Will it prevent copying?',
        answer: 'No. Watermarking does not encrypt or restrict the document.',
      },
    ],
  },
  'sign-pdf': {
    title: 'Place a signature image on a PDF',
    description:
      'Upload or draw a visible signature and place it on a selected PDF page locally. Adjust its position and width; this is not a cryptographic digital signature.',
    intro: 'Add a visible signature image to a document you are authorized to sign.',
    sections: [
      {
        heading: 'A visible mark with a specific limitation',
        text: 'This tool places a picture of a signature onto a PDF page. You can upload a PNG or JPG image, or draw a signature in the provided area using a pointer. The uploaded-image route also provides a keyboard-accessible alternative to drawing. A visible signature image is not a cryptographic digital signature: it does not verify identity, protect the document against later changes or establish an institution’s acceptance policy. Use only a signature you have permission to apply. If a portal requires a separate signature image rather than a signed PDF, use the exam signature workspace or image resizing tools instead of adding the image to a document.',
      },
      {
        heading: 'Position the signature deliberately',
        text: 'Choose the page number, horizontal position, vertical position and width. Positions are percentages measured from the page’s left and top edges; width is a percentage of page width. The signature keeps its image proportions, so changing width also changes height. Placement that extends beyond the page is rejected. A transparent PNG can avoid a white rectangle around the signature, while a JPG normally includes its background. The editor does not identify the signing box or remove a background automatically. Existing page rotation and cropping can affect how coordinates appear in a viewer, so use the resulting page preview and adjust the position if necessary before downloading the final copy.',
      },
      {
        heading: 'Review the marked page and keep the source',
        text: 'Check that the signature is readable, lies inside the intended field and does not cover a date, declaration or printed name. The preview for this tool shows the chosen page, but you should still open the downloaded PDF to inspect it at a comfortable zoom level. All other pages remain in their original order. Existing digital signatures can become invalid after saving a modified PDF, even if the new visible mark looks correct. Keep an untouched source and the signature image in a location appropriate for sensitive personal material. The local browser workflow does not upload either file, and cancelling terminates the active processing worker. The destination’s instructions remain authoritative about which signing method it accepts.',
      },
    ],
    steps: [
      'Choose the PDF and upload a signature image or draw one.',
      'Set the target page, position and width.',
      'Create the result, inspect the signed-page preview and reopen the download.',
    ],
    faq: [
      {
        question: 'Does this create a verified digital signature?',
        answer:
          'No. It adds a visible image only, without identity verification or cryptographic protection.',
      },
      {
        question: 'Can I use the tool without drawing?',
        answer: 'Yes. Upload a PNG or JPG signature through the labeled file input.',
      },
      {
        question: 'Will it find the signature box automatically?',
        answer: 'No. You choose placement and must review it against the form.',
      },
    ],
  },
  'pdf-metadata': {
    title: 'View and remove PDF document metadata',
    description:
      'Inspect common PDF information fields and optionally remove document information and XMP locally. This is not complete anonymization or content redaction.',
    intro:
      'Review the document’s common metadata before deciding whether to remove it from a copy.',
    sections: [
      {
        heading: 'Read the information attached to the document',
        text: 'PDF files can contain a document information dictionary with fields such as title, author, subject, keywords, creator and producer. This workspace shows those common fields after processing so you can inspect them without sending the file to a server. A field may be blank, generic or copied from an earlier editing application. It is not reliable proof of authorship or authenticity. The displayed values describe the selected input file; they are not claims made by this site. The viewer does not enumerate every custom property, embedded attachment or per-page metadata stream. If you are investigating a document’s full history, use a dedicated inspection tool and retain the original bytes.',
      },
      {
        heading: 'Remove document information from a new copy',
        text: 'With the removal option selected, the editor clears the document information dictionary and removes the document-level XMP metadata reference before saving. If you turn the option off, it leaves those fields in place while still creating a new downloadable serialization for review. Neither option edits the source file stored on your device. Keep that source under a separate name so you can compare fields or restore information later. The metadata shown in the result panel comes from the input, even when the download has been stripped. Reopen the saved copy in a PDF information viewer to confirm the common fields no longer contain the values you intended to remove.',
      },
      {
        heading: 'Do not confuse metadata cleanup with anonymization',
        text: 'Personal details can occur in many places besides the document information fields. Page text, annotations, form values, bookmarks, embedded images and attachments may still contain names or identifiers after this operation. Removing a metadata reference also does not promise secure erasure of every unused object in the PDF container. The tool therefore makes no complete anonymization or redaction claim. Existing digital signatures may become invalid when the document is resaved. For confidential disclosure, use a broader reviewed sanitization process and verify the output independently. This small utility is most useful when you understand which common document fields you want to clear, while keeping ordinary page content available for reading and preserving an untouched source for your records.',
      },
    ],
    steps: [
      'Choose a PDF and decide whether to remove its metadata.',
      'Create the result and inspect the input information fields shown.',
      'Download the copy and verify its document properties separately.',
    ],
    faq: [
      {
        question: 'Does stripping metadata remove names printed on a page?',
        answer: 'No. Page text and other content remain. This is not redaction.',
      },
      {
        question: 'Which fields does the panel display?',
        answer: 'Title, author, subject, keywords, creator and producer from the input document.',
      },
      {
        question: 'Is the output fully anonymous?',
        answer:
          'No. Other document objects and visible content can still identify people or organizations.',
      },
    ],
  },
} satisfies Record<string, ToolCopy>;
