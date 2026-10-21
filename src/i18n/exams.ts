import { localize } from './runtime';
export const examText = localize({
  title: (name: string) => `Resize ${name} photo and signature`,
  description: (name: string) =>
    `Prepare a ${name} photo or signature locally. Review the specification table, verification status and source, then enter or apply the required image settings.`,
  intro: (name: string) =>
    `Prepare a separate photo or signature copy for ${name}. Read the relevant official instructions before choosing any dimensions, byte limits or format. This editor keeps your original unchanged and processes your image locally.`,
  eyebrow: 'EXAM IMAGE WORKSPACE',
  table: 'Photo and signature specifications',
  property: 'Requirement',
  photo: 'Photo',
  signature: 'Signature',
  width: 'Width',
  height: 'Height',
  unit: 'Unit',
  minimum: 'Minimum KB',
  maximum: 'Maximum KB',
  format: 'Format',
  formats: 'Formats',
  background: 'Background',
  rules: 'Other rules',
  unknown: 'Not supplied',
  unverified: 'Unverified specifications — check the official notification',
  warning: (name: string) =>
    `No verified requirements are claimed for ${name}. Empty fields mean unknown, not unrestricted. Values entered in the editor are your working settings and do not change this page’s verification status.`,
  verified: 'Specification record marked verified',
  verifiedHelp:
    'Check that the linked notification applies to your application and remains current. Verification is an editorial record, not an acceptance guarantee.',
  lastVerified: 'Last verified',
  never: 'Unverified',
  source: 'Source notification',
  missingSource: 'Official source not supplied',
  stepsTitle: 'Prepare your files step by step',
  steps: (name: string) => [
    `Find the current official ${name} instructions for your application. Confirm the required photo and signature dimensions, formats, minimum and maximum file sizes, plus any appearance rules.`,
    'Choose Photo or Signature below. Supplied values are prefilled; unknown values stay blank. Enter the missing dimensions, maximum KB and format from the instructions. Minimum KB is optional if no lower limit is stated.',
    'Choose a local image. For a photo, adjust the crop using the frame and sliders. For a signature, the full source is fitted inside the requested rectangle with white margins, preserving its proportions.',
    'Create the image and compare its dimensions and byte size with your instructions. Download the result and inspect it for clarity. Keep the source file so you can revise the image if needed.',
    `Test the file in the ${name} application portal. This tool checks the supplied image constraints, not identity, photo appearance or whether the notification applies to you.`,
  ],
  faqTitle: 'Questions about this exam workspace',
  faq: (name: string) => [
    {
      question: `What are the official ${name} photo and signature sizes?`,
      answer:
        'Use the specification table and its linked source only after checking the verification status. Unknown values are deliberately left blank. This site does not infer official sizes from generic templates or previous applications.',
    },
    {
      question: `Can I use this ${name} page before its record is verified?`,
      answer:
        'You can enter your own working values from the current official instructions. Doing so does not verify the record or establish that your picture meets every appearance requirement.',
    },
    {
      question: 'Will the tool change my required pixel dimensions to make a smaller file?',
      answer:
        'No. The exam editor keeps the chosen dimensions fixed. It searches JPEG quality to meet the maximum size and may add disclosed JPEG comment padding for a minimum. If it cannot satisfy the limits, it reports an error rather than silently changing the dimensions. PNG output is checked against the range but is not padded.',
    },
    {
      question: `Does resizing guarantee my ${name} upload will be accepted?`,
      answer:
        'No. The application may have additional rules for framing, image content, dates, naming or capture methods. Check those instructions and use the portal’s validation. Your original file is not changed or uploaded by this tool.',
    },
  ],
  editorTitle: 'Choose the image you are preparing',
  manual: 'Enter values from your notification',
  manualHelp:
    'Blank fields are unknown. This editor uses 1 KB = 1,024 bytes; confirm the portal’s convention. Supplied values remain editable working settings.',
  minInput: 'Minimum file size (KB, optional)',
  maxInput: 'Maximum file size (KB)',
  formatInput: 'Output format',
  chooseFormat: 'Choose a format',
  jpeg: 'JPEG (.jpg)',
  png: 'PNG (.png)',
  signatureHelp:
    'Signature mode fits the entire image inside the selected dimensions without cropping or stretching. White margins may be added. Start with a tightly framed signature image.',
  constraints:
    'The chosen dimensions, format and size limits cannot all be met. Keep the official dimensions; try a clearer or simpler source image, or check your entered limits. PNG is not padded to meet a minimum.',
  constraintHelp:
    'Dimensions remain fixed. JPEG quality is searched to meet the limit; minimum-size padding is disclosed. PNG must naturally fit the range or the tool reports an error.',
  libraryTitle: 'Exam photo and signature workspaces',
  libraryDescription:
    'Find exam-specific local image editors with transparent specification tables and visible verification status. No official sizes are assumed.',
  libraryIntro: 'The right file starts with the right instructions.',
  libraryBody:
    'Choose your exam, check its specification record, and prepare a photo or signature on your own device.',
  open: 'Open workspace',
  recordUnknown: 'Unverified specifications',
  recordVerified: 'Verified record',
  related: 'Other exam workspaces',
} as const);
