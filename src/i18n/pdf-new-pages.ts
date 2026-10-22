import type { ToolCopy } from './tool-pages';

export const newPdfPages = {
  'pdf-to-word': {
    title: 'PDF to Word: high-fidelity conversion',
    description:
      'Convert a PDF to an editable DOCX with layout preserved. Files are uploaded to our converter and cleaned up after processing.',
    intro:
      'Turn a PDF into a working Word document that keeps the original look as closely as possible.',
    sections: [
      {
        heading: 'A layout-preserving Word document',
        text: 'This conversion uploads your PDF to our conversion service and rebuilds it as an editable DOCX, placing text runs, tables and images close to the original layout instead of dumping plain text. It is a high-fidelity reconstruction, not a pixel-perfect copy: fonts are matched from the server’s available set, so unusual typefaces are substituted; line and page breaks can shift where the PDF used custom spacing; and complex designs, form fields, digital signatures and advanced typography may change. After downloading, open the DOCX in Word or LibreOffice and compare page count, table boundaries, image placement and special characters — including Hindi, Kannada or other non-Latin scripts — against the original PDF. Keep your original PDF as the source of truth.',
      },
      {
        heading: 'Upload, consent and deletion',
        text: 'You must tick the consent checkbox before converting: the checkbox confirms you understand the file leaves your device for processing. Your file is sent to the converter over an encrypted connection, processed in an isolated temporary directory, and scheduled for cleanup after processing finishes; interruptions can delay deletion. Temporary files are needed for conversion. Worker output is suppressed; hosting logs and retention need separate operator review. Uploads are limited to 25 MB and 100 pages so one job cannot exhaust the service, and password-protected PDFs are rejected before any processing starts. If the converter is unreachable or unconfigured, this tool shows an error instead of quietly producing a lower-quality result.',
      },
      {
        heading: 'Scanned pages and complex layouts',
        text: 'Scanned PDFs — pages that are pictures of text with no selectable layer — pass through optical character recognition first, and the tool tells you when OCR was applied. OCR can misread unusual fonts, faint print or skewed scans, so check names, dates and amounts character by character. Multi-column pages are reflowed into linear reading order, which changes the visual arrangement even when the words are right. Forms, brochures and dense application paperwork may need minor edits after conversion: tab stops, merged table cells and floating text boxes are the usual casualties. For the best result, convert a clean digital PDF rather than a photo of a printout, and treat the DOCX as an editable working copy of the PDF, not a certified copy.',
      },
    ],
    steps: [
      'Choose a PDF up to 25 MB and tick the consent checkbox.',
      'Upload and convert, then download the DOCX.',
      'Open the Word document and compare its pages with the original PDF.',
    ],
    faq: [
      {
        question: 'Does this convert scanned PDFs?',
        answer:
          'Yes, through OCR on the server. The tool tells you when OCR was applied; review the text for recognition errors.',
      },
      {
        question: 'Is the conversion exact?',
        answer:
          'No. It is high-fidelity: layout, fonts and images are preserved as closely as the format allows, but complex or unusual documents may need minor edits.',
      },
      {
        question: 'What happens to my uploaded file?',
        answer:
          'Your uploaded PDF is sent to the converter and scheduled for cleanup after processing finishes. The temporary files used for DOCX generation are deleted, while provider request logs are managed separately. This tool requires the conversion service and cannot work offline.',
      },
    ],
  },
  'pdf-to-powerpoint': {
    title: 'PDF to PowerPoint: editable text or exact look',
    description:
      'Convert PDF pages to PPTX slides with editable text or a rasterized exact look. Files are uploaded to our converter and cleaned up after processing.',
    intro: 'Choose whether slide editing or visual likeness matters more for your presentation.',
    sections: [
      {
        heading: 'Two outputs for two different purposes',
        text: 'Editable mode places text and images into positioned PowerPoint objects, one slide per PDF page, so you can revise wording, restyle bullets and rearrange content in presentation software. Exact-look mode draws each page as a picture on a slide, matching the original appearance as closely as possible while leaving text uneditable — the right choice when the visual design matters more than editability. Neither mode restores the author’s slide master, speaker notes, animations, transitions or original chart data; charts arrive as static shapes or images. Choose the mode before converting using the slide-content control, and read the quality note shown beside the download so you know which trade-off you picked.',
      },
      {
        heading: 'Upload, consent and deletion',
        text: 'You must tick the consent checkbox before converting: it confirms you understand the file leaves your device for processing. Your file travels over an encrypted connection, is converted in an isolated temporary directory, and is scheduled for cleanup after processing finishes; interruptions can delay deletion. Temporary files are used during conversion; hosting request logs are managed separately. Uploads are limited to 25 MB and 100 pages, and password-protected PDFs are rejected before processing begins. If the converter is unreachable or unconfigured, the tool shows an error rather than silently producing a lower-quality result, so you always know what you got.',
      },
      {
        heading: 'Keep page dimensions and scanning in mind',
        text: 'Each selected page becomes one slide, including repeated pages in a custom selection, in the order you selected. Exact-look mode works for scanned pages because it renders their visible content as pictures. Editable mode needs a text layer; scanned pages pass through OCR first, and the tool tells you when that happened — review recognized text for errors before presenting. Mixed portrait and landscape documents fit within one canvas size, so some slides may carry empty space around the content. Very long handouts convert slowly and produce heavy files; select only the pages your audience needs, and keep the original PDF for distribution. If a deck must be projected at a fixed aspect ratio, set the slide size in PowerPoint before converting the source PDF, since the converter cannot invent missing margins.',
      },
    ],
    steps: [
      'Choose a PDF and optionally select a page range.',
      'Pick editable text or exact look, tick consent, and convert.',
      'Create the PPTX, then inspect every slide in presentation software.',
    ],
    faq: [
      {
        question: 'Which mode should I use for a scanned PDF?',
        answer:
          'Exact look preserves the visible page. Editable mode applies OCR first; review the recognized text for errors.',
      },
      {
        question: 'Does one PDF page become one slide?',
        answer: 'Yes. Each selected page becomes one slide, in the selection order.',
      },
      {
        question: 'What happens to my uploaded file?',
        answer:
          'Your PDF is sent to the converter and scheduled for cleanup after processing finishes. The temporary files used to generate the PPTX are deleted, while provider request logs are managed separately by the hosting platform.',
      },
    ],
  },
  'pdf-to-excel': {
    title: 'PDF to Excel: high-fidelity table conversion',
    description:
      'Convert PDF tables into an XLSX workbook with detected tables. Files are uploaded to our converter and cleaned up after processing.',
    intro: 'Recover a working spreadsheet from a PDF table without rebuilding it by hand.',
    sections: [
      {
        heading: 'Detected tables become worksheets',
        text: 'This conversion uploads your PDF to our conversion service, detects tables on each page and writes them into an XLSX workbook, one worksheet per page. It is a high-fidelity reconstruction, not a pixel-perfect copy: merged cells, nested headers, borderless layouts and unusual spacing may need manual cleanup after download. Extracted cells keep their literal values — including leading zeros and long account numbers — and never become evaluated spreadsheet formulas, so a cell that looked like a total stays text until you decide otherwise. Open the workbook, check that each table landed on the right sheet, and reshape headers before doing any analysis. When a page holds several small tables with gaps between them, each table is detected separately; use the worksheet order to match them back to the page.',
      },
      {
        heading: 'Upload, consent and deletion',
        text: 'You must tick the consent checkbox before converting: it confirms you understand the file leaves your device for processing. Your PDF travels over an encrypted connection, is processed in an isolated temporary directory, and is scheduled for cleanup after processing finishes; interruptions can delay deletion. Temporary files are required to extract the table data; hosting request logs are managed separately. Uploads are limited to 25 MB and 100 pages, and password-protected PDFs are rejected before any processing starts. If the converter is unreachable, the tool shows an error instead of quietly producing a lower-quality result.',
      },
      {
        heading: 'Check the recovered values',
        text: 'Scanned statements and photographed marksheets pass through OCR first, and the tool tells you when that happened. OCR can misread digits — 6 becomes 8, commas vanish — so reconcile important amounts with the source before any financial or official use. Compare several rows from the top, middle and bottom of each page, not just the first screen. Convert numeric text into spreadsheet numbers only after deciding how decimals, grouping marks and dates should be read; Indian grouping (lakh/crore) in particular needs an explicit choice. A second conversion of the same PDF is not an independent check — verify against the original document. For recurring statements from the same issuer, table positions are usually stable, so a cleanup routine you design once can be reused.',
      },
    ],
    steps: [
      'Choose a PDF with tables and tick the consent checkbox.',
      'Upload and convert, then open the workbook’s page worksheets.',
      'Reconcile cell boundaries and values with the source PDF.',
    ],
    faq: [
      {
        question: 'Will the converter calculate totals?',
        answer: 'No. It writes detected cell values and never evaluates formulas from a PDF.',
      },
      {
        question: 'Are leading zeros preserved?',
        answer:
          'Yes, extracted cells are stored as literal values. Your later spreadsheet edits can change their formatting.',
      },
      {
        question: 'What happens to my uploaded file?',
        answer:
          'Your uploaded PDF is sent to the converter and scheduled for cleanup after processing finishes. The temporary files used for table extraction are deleted, while provider request logs are managed separately by the hosting platform.',
      },
    ],
  },
  'word-to-pdf': {
    title: 'Word to PDF: high-fidelity conversion',
    description:
      'Convert DOCX to PDF with layout preserved. Files are uploaded to our converter and cleaned up after processing.',
    intro: 'Create a PDF from a DOCX that keeps the original Word layout as closely as possible.',
    sections: [
      {
        heading: 'A layout-preserving PDF',
        text: 'This conversion uploads your DOCX to our conversion service, which renders it with a full Office layout engine and returns a PDF. It is high-fidelity, not a pixel-perfect copy: the server substitutes fonts from its available set, so documents using typefaces the server lacks will reflow; floating objects, text boxes and advanced Word features can shift pagination or spacing. After downloading, review every page — check headers, footers, page numbers, tables and image placement — against the DOCX. Keep your original DOCX: the PDF is a rendered snapshot, and future edits belong in the source document. Embedded fonts travel with the DOCX only if they were embedded on save; otherwise substitution applies.',
      },
      {
        heading: 'Upload, consent and deletion',
        text: 'You must tick the consent checkbox before converting: it confirms you understand the file leaves your device for processing. The upload travels over an encrypted connection, is rendered in an isolated temporary directory, and is scheduled for cleanup after processing finishes; interruptions can delay deletion. Temporary files are used during conversion; hosting request logs are managed separately. Uploads are limited to 25 MB, and macro-enabled or password-encrypted documents are rejected before processing starts, since macros cannot run on the server and encrypted packages cannot be opened. If the converter is unreachable or unconfigured, the tool shows an error rather than silently producing a lower-quality result.',
      },
      {
        heading: 'Prepare a supported file',
        text: 'Choose a DOCX file rather than an older DOC file or a macro-enabled document: open legacy files in trusted office software and save a new DOCX copy first. Password-encrypted packages are rejected — remove the password in Word before uploading if you are authorized to do so. Linked external images are not downloaded by the converter, so pictures must be embedded in the document; check for missing-image missing-image markers in the output. Resolve tracked changes and accept or reject them before converting, since markup can otherwise leak into the PDF. Complex elements like embedded objects, SmartArt and 3D models may render differently than in Word. Documents with tracked changes, comments or ink annotations should be finalized first: markup and annotation layers can otherwise appear in the PDF unexpectedly.',
      },
    ],
    steps: [
      'Save your source as an unencrypted DOCX with embedded images.',
      'Tick the consent checkbox, upload and convert.',
      'Inspect all output pages before submitting the PDF.',
    ],
    faq: [
      {
        question: 'Can I convert a legacy DOC file?',
        answer: 'No. Re-save it as DOCX in a trusted office application first.',
      },
      {
        question: 'Is the layout exactly like Word?',
        answer:
          'It is high-fidelity, but conversion engines render differently, so pagination and spacing can shift. Review every page.',
      },
      {
        question: 'What happens to my uploaded file?',
        answer:
          'Your uploaded DOCX is sent to the converter and scheduled for cleanup after processing finishes. The temporary files used for PDF rendering are deleted, while provider request logs are managed separately.',
      },
    ],
  },
  'powerpoint-to-pdf': {
    title: 'PowerPoint to PDF: high-fidelity conversion',
    description:
      'Convert PPTX slides to PDF with visual composition preserved. Files are uploaded to our converter and cleaned up after processing.',
    intro: 'Create a PDF of your deck that keeps the slide composition as closely as possible.',
    sections: [
      {
        heading: 'A visual rendering, not a text extraction',
        text: 'This conversion uploads your PPTX to our conversion service, which renders each slide with a full Office layout engine and returns a PDF. It is high-fidelity, not a pixel-perfect copy: themes and fonts are matched from the server’s available set, and charts, SmartArt and drawing geometry can shift slightly compared with PowerPoint. Speaker notes, transitions, audio and animations do not become PDF features — the PDF captures the visual slide, not the presentation behavior. Review every page of the downloaded PDF against the deck, and keep your original PPTX for future edits. Slide masters, layouts and theme colors are interpreted, not preserved as editable theme objects, so later restyling happens in PowerPoint, not in the PDF.',
      },
      {
        heading: 'Upload, consent and deletion',
        text: 'You must tick the consent checkbox before converting: it confirms you understand the file leaves your device for processing. The upload travels over an encrypted connection, is rendered in an isolated temporary directory, and is scheduled for cleanup after processing finishes; interruptions can delay deletion. Temporary files are used during conversion; hosting request logs are managed separately. Uploads are limited to 25 MB, and macro-enabled or password-encrypted presentations are rejected before processing starts. If the converter is unreachable or unconfigured, the tool shows an error rather than silently producing a lower-quality result. Conversion is stateless: each upload is an independent job, and repeated conversions of the same file produce the same result.',
      },
      {
        heading: 'Prepare a supported presentation',
        text: 'The accepted format is PPTX. Older PPT files, encrypted packages and macro-enabled presentations are outside this tool’s scope — save a supported copy with your office application before trying again. Embed any custom fonts or accept substitution, and check slides that use unusual typefaces first. For a handout that must match the slide visuals exactly, compare the exported PDF with the deck in presentation software side by side. Very large decks with embedded video convert the poster frames only; video content itself does not transfer to PDF. Check builds that reveal bullet points step by step: the PDF shows the final state of each slide, not the intermediate builds.',
      },
    ],
    steps: [
      'Choose an unencrypted PPTX presentation.',
      'Tick the consent checkbox, upload and convert.',
      'Compare each slide’s composition with the downloaded pages.',
    ],
    faq: [
      {
        question: 'Does this keep the slide background and theme?',
        answer:
          'It renders the visual slide composition as closely as possible, but small shifts in fonts and geometry can occur.',
      },
      {
        question: 'Are notes and animations included?',
        answer: 'No. Speaker notes, transitions, audio and animation behavior are omitted.',
      },
      {
        question: 'What happens to my uploaded file?',
        answer:
          'Your uploaded PPTX is sent to the converter and scheduled for cleanup after processing finishes. The temporary files used for PDF rendering are deleted, while provider request logs are managed separately.',
      },
    ],
  },
  'excel-to-pdf': {
    title: 'Excel to PDF: high-fidelity conversion',
    description:
      'Convert XLSX worksheets to PDF with formatting preserved. Files are uploaded to our converter and cleaned up after processing.',
    intro:
      'Create a printable PDF of your workbook that keeps the spreadsheet formatting as closely as possible.',
    sections: [
      {
        heading: 'Formatted sheets become PDF pages',
        text: 'This conversion uploads your XLSX to our conversion service, which renders each worksheet with a full Office layout engine and returns a PDF. It is high-fidelity, not a pixel-perfect copy: column widths, page breaks and print scaling follow the converter’s rendering, and charts or drawing objects may differ from Excel’s own export. Set your print area, orientation and scaling in the workbook before uploading — the converter honors the sheet’s print settings. Review every page of the downloaded PDF, especially page breaks in wide tables, and keep your original workbook. Gridlines, freeze panes and filters are display aids, not print content: enable gridline printing in the sheet if the PDF must show them.',
      },
      {
        heading: 'Upload, consent and deletion',
        text: 'You must tick the consent checkbox before converting: it confirms you understand the file leaves your device for processing. Your workbook travels over an encrypted connection, is rendered in an isolated temporary directory, and is scheduled for cleanup after processing finishes; interruptions can delay deletion. Temporary files are required to generate the PDF pages; hosting request logs are managed separately. Uploads are limited to 25 MB, and macro-enabled or password-encrypted workbooks are rejected before processing starts. If the converter is unreachable, the tool shows an error rather than silently producing a lower-quality result.',
      },
      {
        heading: 'Check values before submitting',
        text: 'Formulas are rendered with their calculated results as in the spreadsheet application — the converter does not re-derive them from live data. Open the workbook in trusted spreadsheet software, recalculate it when appropriate and save it before conversion, so cached results are current. Reopen the downloaded PDF and reconcile important amounts, dates and totals with the saved workbook. Watch for dates rendered as serial numbers and percentages shown as decimals where number formats did not carry over; if the recipient needs the displayed form, adjust the sheet’s formatting and convert again. Hidden rows, columns and sheets are skipped in the rendering, so unhide anything the recipient must see before uploading.',
      },
    ],
    steps: [
      'Recalculate and save your workbook as an unencrypted XLSX.',
      'Tick the consent checkbox, upload and convert.',
      'Check dates, formula results and page breaks against the workbook.',
    ],
    faq: [
      {
        question: 'Are charts and pictures preserved?',
        answer:
          'They are rendered as part of the sheet layout, but complex drawings can differ from Excel’s own export.',
      },
      {
        question: 'Are formulas recalculated?',
        answer: 'The converter renders calculated results like the spreadsheet application does.',
      },
      {
        question: 'What happens to my uploaded file?',
        answer:
          'Your uploaded XLSX workbook is sent to the converter and scheduled for cleanup after processing finishes. The temporary files used to render the PDF are deleted, while provider request logs are managed separately.',
      },
    ],
  },
} satisfies Record<string, ToolCopy>;