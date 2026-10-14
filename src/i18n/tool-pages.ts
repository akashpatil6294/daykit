import type { ToolMode } from '../data/tools';
export interface ToolCopy {
  title: string;
  description: string;
  intro: string;
  sections: { heading: string; text: string }[];
  steps: string[];
  faq: { question: string; answer: string }[];
}
export const toolPages: Record<ToolMode, ToolCopy> = {
  size: {
    title: 'Resize an image to a target KB size',
    description:
      'Resize an image to your chosen KB limit in your browser. Search JPEG quality, reduce dimensions when needed, and compare the original with the result.',
    intro:
      'Meet a file-size limit without sending your picture anywhere. Choose a target, preview the result, and download a JPEG.',
    sections: [
      {
        heading: 'File size and dimensions solve different problems',
        text: 'An upload form can reject a picture because it contains too many bytes, even when its width and height look right. This tool works toward a file-size target rather than a fixed number of pixels. It accepts JPEG, PNG and WebP images and produces a new JPEG. The original file on your device is never overwritten. If your destination also specifies exact dimensions, use the pixel resizer first, then check the dimensions again after compression: a very small byte allowance can require this tool to shrink them.',
      },
      {
        heading: 'How the target is reached',
        text: 'The worker first tests JPEG encoding quality. A binary search narrows the quality setting to find an encoded file that stays under your allowance. If even low-quality encoding is too large, the worker reduces the image dimensions and repeats the search. A target of 100 KB means 102,400 bytes here, and successful output falls between 95% and 100% of that number. Some upload services count a kilobyte as 1,000 bytes, so check their convention and leave additional headroom if it is unclear.',
      },
      {
        heading: 'Why padding may appear in a result',
        text: 'A plain background or tiny icon may contain too little visual information to fill the requested range, even at maximum JPEG quality. In that case, valid JPEG comment metadata pads the output into range. The result reports the added bytes. This does not increase resolution, restore detail or improve appearance; it only satisfies the requested byte range. Your destination may re-encode an image or strip metadata, so a later file-size reading can differ. Always inspect the downloaded image and the destination’s own validation.',
      },
    ],
    steps: [
      'Choose or drop one supported image, up to 10 MiB. Wait for its local preview.',
      'Enter a target from 2 to 10,240 KB. Use a value below the upload limit if the destination’s KB convention is uncertain.',
      'Select Resize image. Check the resulting dimensions and visual quality as well as the before-and-after sizes.',
      'Download the JPEG and test it in the destination form. Keep your original for future edits.',
    ],
    faq: [
      {
        question: 'Will this always preserve the original dimensions?',
        answer:
          'No. Quality changes are attempted first, but dimensions are reduced when necessary. The result shows the actual output dimensions so you can compare them with your form’s requirements.',
      },
      {
        question: 'Can a smaller file look identical?',
        answer:
          'JPEG uses lossy compression. Differences can be subtle at larger allowances but become visible at small targets. Check fine text, hair and facial details before using the output.',
      },
      {
        question: 'Does compression upload my photo?',
        answer:
          'No. A browser worker decodes and processes the file locally. Once the workspace says it is ready, the tool continues working offline in the same tab.',
      },
    ],
  },
  pixels: {
    title: 'Resize an image by pixel dimensions',
    description:
      'Set image width and height in pixels with an aspect-ratio lock. Preview and download a resized JPEG with all processing on your device.',
    intro:
      'Get the width and height you need, with an aspect-ratio lock to keep the picture in proportion.',
    sections: [
      {
        heading: 'Choose dimensions with confidence',
        text: 'Pixels describe how many picture elements run across and down an image. They are different from the number of bytes stored in a file. A website may request a particular width and height for an avatar, a product picture or an attachment. Enter those numbers here to export a JPEG at the requested dimensions. This tool accepts JPEG, PNG and WebP input. A width of 800 and a height of 600 creates an 800-by-600-pixel image; no physical print size is implied by those numbers alone.',
      },
      {
        heading: 'Keep the original proportions',
        text: 'The aspect-ratio lock starts enabled. Changing either dimension calculates the other from your source picture, rounded to the nearest whole pixel. This prevents accidental stretching. If the destination requests a different shape, unlocking the ratio will force the image into that shape and can distort faces or objects. A crop is often a better option when the subject must retain its proportions. Use the photo crop tool for a fixed frame instead of stretching a portrait into a square.',
      },
      {
        heading: 'Understand enlargement and export quality',
        text: 'Reducing a large picture can make it easier to display or share, but increasing a small picture cannot recover detail that was never captured. The browser interpolates new pixels when you enlarge it. You can adjust JPEG quality independently of dimensions, so identical pixel sizes can still result in different byte sizes. The tool limits output to 8,192 pixels on either side and 16 million pixels in total to bound memory use. Transparent parts of a PNG or WebP become white in the JPEG output. Keep the original if you will need transparency later.',
      },
    ],
    steps: [
      'Open one image and check its original dimensions below the preview.',
      'Enter the desired width or height. Leave Keep aspect ratio checked for proportional resizing.',
      'If both exact dimensions are essential, unlock the ratio and enter them, or switch to the crop tool to avoid stretching.',
      'Choose JPEG quality, select Resize image and compare the preview. Download the result when the dimensions are correct.',
    ],
    faq: [
      {
        question: 'Why did the height change when I entered a width?',
        answer:
          'The aspect-ratio lock calculates the other dimension using your original picture’s proportions. Whole-pixel rounding can produce a small difference from a mathematically exact ratio.',
      },
      {
        question: 'Does this set a print size in centimetres?',
        answer:
          'No. This tool sets pixel dimensions. Print size depends on the printer’s scaling and resolution settings, which you must set separately.',
      },
      {
        question: 'Will the result fit an upload byte limit?',
        answer:
          'Not necessarily. Pixel dimensions and file size are separate constraints. Check the displayed output KB; use the target-size tool if you also need a byte limit.',
      },
    ],
  },
  'jpg-to-png': {
    title: 'Convert JPG to PNG locally',
    description:
      'Turn a JPG or JPEG image into a PNG file in your browser. Preserve pixel dimensions, preview the output and download without uploading.',
    intro:
      'Need a PNG instead of a JPEG? Make the format change locally and keep the original dimensions.',
    sections: [
      {
        heading: 'A real conversion, not a renamed extension',
        text: 'Changing a filename from photo.jpg to photo.png does not change how its image data is encoded. A program that reads the file may still detect a JPEG and reject it when PNG is required. This converter decodes the JPEG and writes a new PNG image. The downloaded filename uses the correct extension and the output contains PNG data. JPEG and JPG are two common extensions for the same input format, so either is accepted here. You can select the file with a keyboard or drop it onto the upload area.',
      },
      {
        heading: 'What PNG preserves—and what it cannot restore',
        text: 'PNG stores the decoded pixels without an additional lossy JPEG encoding step. It does not reverse damage from earlier JPEG compression. If the source has blockiness, blurred text or ringing around edges, those features remain part of the converted picture. The converter preserves the source pixel dimensions rather than rescaling the subject. A JPEG source does not have transparent pixels, so this conversion will not remove its background or create a cutout. Use a dedicated background-editing workflow if that is your actual goal.',
      },
      {
        heading: 'Plan for a different file size',
        text: 'The PNG may be considerably larger than the JPEG, particularly for detailed photographs. PNG uses a different compression approach, so the change in extension is not a promise of a smaller download. Compare the before-and-after sizes shown below the result. If the destination requires both PNG and a byte limit, test the file with that destination; the target-KB tool exports JPEG and therefore cannot preserve a PNG-only requirement. The conversion runs in a separate browser worker, and you can cancel an operation without waiting for its encoding loop to finish.',
      },
    ],
    steps: [
      'Choose a JPEG or JPG image no larger than 10 MiB. A renamed non-JPEG file will not be accepted.',
      'Wait for the preview and confirm that you selected the intended picture.',
      'Select Convert image. The converter writes PNG data at the original dimensions.',
      'Compare the output size, download the PNG, and open it in your intended app or upload form.',
    ],
    faq: [
      {
        question: 'Will PNG make an old JPEG sharper?',
        answer:
          'No. It preserves the decoded picture without another lossy encoding step, but cannot reconstruct missing detail. Start with a higher-quality source if one is available.',
      },
      {
        question: 'Where is the quality slider?',
        answer:
          'This PNG export does not use the JPEG quality setting. File size follows from the image content and the browser’s PNG encoder.',
      },
      {
        question: 'Can I disconnect from the internet?',
        answer:
          'Yes, once the workspace displays Ready. Keep this tab open: offline reloads and visits to another tool page are not guaranteed because this phase does not install an offline page cache.',
      },
    ],
  },
  'png-to-jpg': {
    title: 'Convert PNG to JPG with a white background',
    description:
      'Convert PNG images to JPEG on your device. Adjust quality, flatten transparency onto white, compare sizes and download your JPG.',
    intro:
      'Create a JPEG copy of a PNG, with adjustable quality and a clear white background for transparent areas.',
    sections: [
      {
        heading: 'When a JPEG copy is useful',
        text: 'A photo stored as PNG can be inconvenient when a form or application specifically asks for JPEG. This tool reads the PNG, paints its pixels onto a local canvas and exports a new JPG file. It keeps the original width and height instead of guessing a preferred size. The source remains untouched, so you can keep the PNG for editing and use the JPEG copy where that format is required. The preview and size comparison help you decide whether the exported copy is suitable before downloading it.',
      },
      {
        heading: 'Transparency becomes a white background',
        text: 'PNG can represent transparent or partly transparent pixels; JPEG cannot. This converter places a white background behind the source before encoding it. A transparent logo will therefore appear on white rather than remain a floating cutout. Soft edges are blended with that same background. This is an intentional conversion choice, not an automatic background-removal feature. If your destination needs transparency, keep the original PNG instead. Check pale artwork carefully because white subjects can become difficult to distinguish against the chosen background.',
      },
      {
        heading: 'Balance sharp edges against file size',
        text: 'JPEG quality is adjustable. A lower setting often makes a smaller file but can introduce visible artifacts, especially around text, screenshots, line drawings and logos. A photograph usually responds differently from a diagram, so compare the preview instead of relying on one quality value for every image. The displayed byte size is the size of this particular export. Converting a very simple PNG does not guarantee a smaller file. If a form imposes a strict byte limit, use the target-KB tool with the exported image, and check both its dimensions and legibility again after that additional encoding step.',
      },
    ],
    steps: [
      'Select a PNG and wait for the local preview. The tool validates the image data rather than trusting its name alone.',
      'Review transparent areas and decide whether a white background suits your destination.',
      'Adjust JPEG quality, then select Convert image. You can change quality and create another result if necessary.',
      'Inspect text and edges, compare sizes, and download the JPEG. Retain the PNG if you need an editable transparent original.',
    ],
    faq: [
      {
        question: 'Why is the transparent area now white?',
        answer:
          'JPEG does not support an alpha channel. The converter deliberately uses white behind transparent pixels so the exported background is predictable.',
      },
      {
        question: 'Does this remove a coloured background?',
        answer:
          'No. Existing opaque colours are preserved as part of the picture. Only transparent areas are composited onto the white background.',
      },
      {
        question: 'Are my location details copied?',
        answer:
          'The tool re-encodes pixels and does not copy the original file’s metadata blocks. It is not a complete privacy scrubber: visible text, landmarks or identifying information in the picture remain.',
      },
    ],
  },
  'webp-to-jpg': {
    title: 'Convert WebP to JPG in your browser',
    description:
      'Create a JPEG copy of a WebP image without uploading it. Adjust quality, preview the result and download locally with a white background.',
    intro:
      'Turn a WebP image into an easy-to-use JPEG copy, with the conversion happening entirely on your device.',
    sections: [
      {
        heading: 'Use an image where JPEG is requested',
        text: 'You may have a WebP image that opens in a browser but is not accepted by a particular form or editing workflow. This converter makes a JPEG copy without requiring a server upload. The original WebP remains on your device, while the downloaded copy has both a JPG extension and JPEG-encoded contents. Renaming the original extension would not accomplish the same thing. Before converting a downloaded image, make sure you have the rights or permission needed for your intended use; changing its format does not change its ownership.',
      },
      {
        heading: 'Know what changes during conversion',
        text: 'The converter preserves the image’s pixel dimensions and lets you choose JPEG quality. WebP supports features that a static JPEG cannot represent, including transparency and animation. Transparent pixels are composited onto white, and an animated source produces a single decoded frame rather than a moving image. This tool has no frame picker and should not be used when you need to preserve an animation. The preview shows the static picture being processed, so review it before saving the result, particularly when the source has several frames or transparent decorative elements.',
      },
      {
        heading: 'A format change is not always a size reduction',
        text: 'WebP and JPEG use different encoders. The output may be smaller or larger depending on the source content and the quality you select. Lowering JPEG quality can reduce bytes but may soften detail or add artifacts around high-contrast edges. Use the before-and-after measurements as observations about your own image, not as a general promise about either format. If the JPEG is for an upload with exact dimensions, compare the displayed width and height with that requirement. You can resize by pixels separately if the original resolution is not appropriate.',
      },
    ],
    steps: [
      'Choose a WebP file up to 10 MiB and wait for the preview to appear.',
      'Review the selected static frame and check how transparency will look against white.',
      'Set JPEG quality and select Convert image. Processing runs in a worker so the page controls remain available.',
      'Check the resulting picture and file size, then download your JPG copy. Keep the original WebP if you need its animation or transparency later.',
    ],
    faq: [
      {
        question: 'Can I preserve an animated WebP as a JPEG?',
        answer:
          'No. JPEG output is static. This tool exports a single decoded image and does not provide frame selection or an animation conversion workflow.',
      },
      {
        question: 'Why does the JPEG use more space?',
        answer:
          'A different format and quality setting can encode the same visible image into more bytes. Try a lower quality if the visual trade-off is acceptable.',
      },
      {
        question: 'Will this work without an account?',
        answer:
          'Yes. No sign-in or backend connection is needed. After the workspace is ready, conversion continues offline in this loaded tab.',
      },
    ],
  },
  'heic-to-jpg': {
    title: 'Convert HEIC to JPG privately',
    description:
      'Decode HEIC or HEIF photos locally and export a JPEG. A browser worker handles conversion, with no upload and offline use after initialization.',
    intro:
      'Make a JPEG copy of a HEIC photo without sending your camera image to a conversion server.',
    sections: [
      {
        heading: 'Prepare the local decoder first',
        text: 'HEIC photos need a decoder that is not built into every browser image workflow. This page loads its bundled decoder before showing the Ready status. That first preparation can take longer than opening a standard JPEG tool, especially on a slow connection. Wait for readiness before disconnecting from the internet. Once preparation is complete, the worker has the decoding code it needs for further files in the same open tab. Reloading the page or navigating elsewhere while offline is outside this phase’s offline guarantee.',
      },
      {
        heading: 'Export a compatible still image',
        text: 'Choose a HEIC or HEIF file and the decoder will attempt to read its primary still image. The tool then encodes a JPEG at the decoded dimensions with your selected quality. It does not export a complete photo collection, depth map, Live Photo video or every image contained in a multi-image file. Unusual encodings and damaged files may not be supported by the bundled decoder. An error is shown rather than returning a mislabeled file. If that happens, try exporting a JPEG from the application that originally created the photo.',
      },
      {
        heading: 'Review colour and detail before sharing',
        text: 'HEIC sources can contain colour and image features that do not translate exactly to a standard browser JPEG export. Treat the result as a practical sharing copy and compare it with your original, especially for important photographs. JPEG quality controls the final lossy encoding, not the amount of detail available in the source. The conversion does not deliberately copy camera metadata, and it does not guarantee removal of information visible in the image. Keep the original photo if you need its full editing flexibility or associated camera features later.',
      },
    ],
    steps: [
      'Load this page while online and wait until the workspace reports Ready. This also prepares the local HEIC decoder.',
      'Choose one HEIC or HEIF file no larger than 10 MiB. Leave the page open while its preview is decoded.',
      'Select JPEG quality and press Convert image. You can cancel if the operation takes longer than you want.',
      'Inspect orientation, colour and detail, then download the JPG copy. Retain the original HEIC for archival or editing purposes.',
    ],
    faq: [
      {
        question: 'Why does opening a HEIC take longer?',
        answer:
          'The page must load a separate decoder, and decoding a compressed camera photo can require substantial work. That work runs in a browser worker rather than the interface thread.',
      },
      {
        question: 'Does this support every HEIF file?',
        answer:
          'No universal compatibility is promised. The bundled decoder handles supported still-image encodings; unusual variants or damaged input can fail with a readable error.',
      },
      {
        question: 'Is a large photo uploaded for conversion?',
        answer:
          'No. The decoder and image encoder run locally. The tool accepts files up to 10 MiB and rejects images above a 40-megapixel safety limit to reduce memory pressure.',
      },
    ],
  },
  passport: {
    title: 'Passport and visa photo crop and resizer',
    description:
      'Crop a portrait and resize it to custom pixel dimensions or generic photo presets. Process locally, preview the frame and download a JPEG.',
    intro:
      'Frame your photo, set the dimensions, and export a JPEG. You stay in control of the crop and the official requirements.',
    sections: [
      {
        heading: 'Start with the issuing authority’s instructions',
        text: 'Passport and visa photo requirements vary by authority and application route. This tool does not claim that a generic size is suitable for a particular country. Its included presets are unverified pixel templates, clearly marked as such. Read the current official instructions for your application before choosing dimensions. Requirements may also concern face size, eye position, background, lighting, expression, age of the photo and digital editing. A file that has the right width and height can still fail those checks. This page resizes and crops; it does not certify compliance.',
      },
      {
        heading: 'Frame the subject without stretching',
        text: 'The crop frame always follows the width-to-height ratio you select. Zoom moves closer to the subject, while the horizontal and vertical controls place the visible region within the original image. You can also drag the picture inside the frame with a pointer or touch. The sliders provide the same adjustments by keyboard, including fine movements that can be easier than dragging. Export uses the original decoded image rather than the smaller preview, so the preview is a framing aid rather than the source of output detail.',
      },
      {
        heading: 'Choose pixels rather than guessing print dimensions',
        text: 'The presets and custom fields are expressed in pixels. They do not set a physical print size in millimetres or inches. If your instructions specify a printed photo size, use the authority’s resolution guidance and configure the printing workflow separately. JPEG output uses white behind transparent areas but does not replace an existing coloured background, retouch skin or correct shadows. Avoid assuming that increasing the pixel count will improve a blurry source. Start with a clear, well-lit original and keep it unchanged so you can make another crop if necessary.',
      },
    ],
    steps: [
      'Open your image and compare the official instructions with the generic presets. Choose Custom dimensions when the requested pixels differ.',
      'Set width and height. Adjust zoom and position with the sliders or by dragging the preview until the frame is appropriate.',
      'Select JPEG quality, then Crop and resize. Check the resulting dimensions and the complete image, including headroom and visible edges.',
      'Download the JPEG and validate it against the official rules. If a byte limit also applies, use the target-KB tool and recheck dimensions afterwards.',
    ],
    faq: [
      {
        question: 'Are the included presets verified passport standards?',
        answer:
          'No. They are generic templates stored in a data file with verified set to false. You must check the relevant authority’s current rules yourself.',
      },
      {
        question: 'Can the tool automatically position my face?',
        answer:
          'No face detection or compliance scoring is performed. You control the crop and must check the framing against your application instructions.',
      },
      {
        question: 'Can I make a print-ready sheet here?',
        answer:
          'This version exports one cropped JPEG at the selected pixel dimensions. It does not arrange multiple photographs on a print sheet or specify printer scaling.',
      },
    ],
  },
};
