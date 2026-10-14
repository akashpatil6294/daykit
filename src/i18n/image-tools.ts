import { localize } from './runtime';
export const imageTools = localize({
  libraryTitle: 'Free image tools',
  libraryDescription:
    'Resize, crop and convert images on your device. Free browser tools for target KB, pixel dimensions, JPG, PNG, WebP, HEIC and photo crops.',
  libraryIntro: 'A smaller file. The right dimensions. A format that fits.',
  libraryBody:
    'Choose a tool, load it once, and keep working offline in the same tab. Your image stays on your device.',
  eyebrow: 'YOUR FILES STAY WITH YOU',
  available: 'Open tool',
  related: 'More image tools',
  instructions: 'How to use this tool',
  faq: 'Frequently asked questions',
  preparing: 'Preparing your offline workspace…',
  ready: 'Ready · works offline in this tab',
  loading: 'Opening image on your device…',
  processing: 'Processing on your device…',
  done: 'Your image is ready.',
  upload: 'Choose an image',
  drop: 'Drop an image here, or choose a file',
  uploadHelp: 'One file at a time · up to 10 MiB (10,485,760 bytes) · maximum 40 megapixels',
  accepted: 'Accepted formats',
  inputTypes: {
    any: 'JPG, PNG or WebP',
    jpeg: 'JPG / JPEG',
    png: 'PNG',
    webp: 'WebP',
    heic: 'HEIC / HEIF',
  },
  noScript:
    'Enable JavaScript to use this browser-only image tool. The instructions below remain available without it.',
  original: 'Original',
  result: 'Result',
  before: 'Before',
  after: 'After',
  empty: 'Your preview will appear here',
  originalAlt: 'Selected image preview',
  resultAlt: 'Processed image preview',
  download: 'Download image',
  cancel: 'Cancel and clear image',
  clear: 'Choose another image',
  settings: 'Make it fit',
  target: 'Target file size (KB)',
  kbHelp:
    '1 KB = 1,024 bytes here. Allowed: 2–10,240 KB. Output will be 95–100% of this target, never above it.',
  paddingHelp:
    'Very simple images may need JPEG comment padding to reach the requested range. We report this separately; padding adds no visual detail.',
  width: 'Width (px)',
  height: 'Height (px)',
  lock: 'Keep aspect ratio',
  dimensionHelp:
    'Output: up to 8,192 pixels per side and 16 megapixels. Unlocking the ratio can stretch the picture.',
  quality: 'JPEG quality',
  jpegHelp:
    'JPEG output uses a white background for transparent areas. Metadata is not copied; animation and multi-image files produce a single image.',
  convertHelp:
    'Conversion preserves pixel dimensions. PNG output does not restore detail already lost in a JPEG.',
  preset: 'Photo size preset',
  custom: 'Custom dimensions',
  presets: {
    square: 'Square · 600 × 600 px',
    portrait: 'Portrait · 420 × 540 px',
    small: 'Small portrait · 350 × 450 px',
  },
  unverified: 'Generic preset · unverified',
  presetHelp:
    'These are size templates, not official passport or visa requirements. Check the issuing authority’s dimensions, framing and background rules yourself.',
  crop: 'Adjust your crop',
  cropHelp:
    'Drag the image or use the sliders. The frame shows exactly what will be exported. This tool crops; it does not check identity-photo compliance.',
  zoom: 'Zoom',
  horizontal: 'Horizontal position',
  vertical: 'Vertical position',
  reset: 'Centre and reset crop',
  apply: 'Create image',
  resize: 'Resize image',
  convert: 'Convert image',
  cropAction: 'Crop and resize',
  sizeUnit: 'KB',
  pixelUnit: 'px',
  padding: 'JPEG comment padding added (bytes)',
  targetMet: 'Within 5% under your target',
  timeout: 'Processing took too long. Try a smaller image or fewer output pixels.',
  retry: 'Reload tool',
  errors: {
    unsupported:
      'This browser does not support the worker canvas features this tool needs. Try a current version of Chrome, Edge, Firefox or Safari.',
    format:
      'This file is not a supported image for this tool. Choose the listed input format; renaming a file does not convert it.',
    fileSize: 'Choose a non-empty image no larger than 10 MiB (10,485,760 bytes).',
    pixels:
      'This image exceeds the 40-megapixel safety limit. Export a smaller copy and try again.',
    notReady: 'Wait until the workspace is ready, then choose an image.',
    dimensions:
      'Enter whole-number dimensions between 1 and 8,192, with no more than 16 million output pixels.',
    target: 'Enter a target from 2 to 10,240 KB. If processing still fails, try a larger target.',
    settings: 'Check the dimensions, quality and crop values, then try again.',
    encode: 'The browser could not create the requested output format.',
    decode:
      'This image could not be read. It may be damaged, unsupported or too complex for the available memory. Try a smaller copy.',
    worker:
      'The image worker could not start or stopped unexpectedly. Reload the tool while online and try again.',
    multiple: 'Please choose one image at a time.',
  },
} as const);
