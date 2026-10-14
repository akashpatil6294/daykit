---
{"title":"Choose JPG, PNG, WebP or HEIC for an application image","summary":"Learn what image conversion changes, when transparency matters and why renaming an extension cannot fix an unsupported-format upload.","author":"Daykit editorial","published":"2026-10-13","updated":"2026-10-13","faq":[{"question":"Does PNG always look better than JPG?","answer":"Not necessarily. PNG can preserve the pixels it is given without JPEG-style losses, but converting a damaged JPEG to PNG does not recover missing detail. Source quality remains important."},{"question":"Why did conversion make my file larger?","answer":"Different formats and settings encode the same image differently. A PNG made from a photograph can be larger than its JPEG source without adding visible information."},{"question":"Can I just change .heic to .jpg?","answer":"No. That changes the name, not the encoded image. Use a genuine converter and inspect the exported result before uploading it."}]}
---
An upload form usually checks more than whether a filename ends with a familiar extension. The bytes inside the file identify how the image is encoded. Renaming an unsupported file can therefore leave the original problem unchanged while making the name misleading. A proper conversion decodes the source and writes a new image in the selected format.

The right choice starts with the destination. If its current instructions require a specific format, use that format and then check the remaining conditions. If several formats are accepted, compare their practical differences rather than assuming one is universally best. Keep an untouched source so that each export can be produced from the clearest available image.

## Use JPEG for a deliberate photographic export

JPEG is commonly used for photographs because quality can be traded for a smaller file. Its compression can change fine details, particularly around sharp edges, text and repeated high-contrast patterns. A moderate reduction may look acceptable, but repeated generations can accumulate artifacts. Export once from a good source whenever possible.

The [PNG-to-JPG converter](/tools/png-to-jpg/) is useful when the destination needs JPEG. Inspect transparent areas because JPEG does not preserve ordinary alpha transparency. Daykit places those regions on white. This can be appropriate for some documents, but it is not a universal rule for official submissions. Check the actual required appearance separately.

## Use PNG when preserving supplied pixels matters

PNG is useful for graphics and images where lossless storage or transparency is needed. It can preserve the pixel information it receives without adding JPEG compression artifacts. That does not mean it can undo damage already present in the source. A blurry photograph saved as PNG remains blurry.

The [JPG-to-PNG converter](/tools/jpg-to-png/) writes a PNG version of a JPEG image. Expect the byte size to change, sometimes substantially. A larger output is not evidence that new detail was created. If a form accepts only a small JPEG, converting to PNG is unlikely to solve that requirement and may create a second incompatibility.

## Convert WebP when a destination does not support it

Images downloaded from websites may arrive as WebP. A browser can display them even when an older upload workflow rejects them. Use the [WebP-to-JPG converter](/tools/webp-to-jpg/) to make a JPEG copy when that is appropriate for the destination. Check the converted image for background and edge changes.

Do not assume that a web-downloaded image is the best source for an official form. It may already have been resized or compressed for display. If you have access to the original photograph, use it instead. Conversion solves format compatibility; it does not establish ownership, suitability or compliance with a content requirement.

## Handle phone HEIC files as actual image files

Some phones store photographs as HEIC or HEIF. The gallery may hide that technical detail, making a later upload rejection surprising. Use the [HEIC-to-JPG converter](/tools/heic-to-jpg/) when a JPEG export is needed. The decoder is loaded as a local site asset; processing occurs on the device rather than uploading the photograph to a conversion server.

Open the result and inspect orientation, colour and brightness. A conversion can differ from a phone gallery’s specialized display, particularly for images with additional capture information. If an unusual HEIC file fails, use a trusted device export option to create a supported still-image copy. Keep the original rather than repeatedly trying to rename it.

## Separate format from dimensions and bytes

After conversion, confirm the output dimensions. Then compare its byte size with the destination’s limit. The [target-size resizer](/tools/resize-image-kb/) can help produce a smaller JPEG, but aggressive targets may require reduced dimensions. Check all three properties—format, pixels and bytes—on the final file rather than at separate stages only.

An example helps clarify the distinction. A hypothetical square image can keep the same pixel width when converted from PNG to JPEG, yet have a very different byte count. Lowering JPEG quality changes encoding without necessarily changing width. Resizing to fewer pixels changes the image itself. A portal may test each condition independently.

## Avoid unnecessary conversion chains

A sequence such as HEIC to JPG to PNG to JPG creates more opportunities for changes without guaranteeing a better result. Decide the destination format first, make a clean export and inspect it. If you need another attempt, start from the original rather than from the latest compressed copy.

Give exports descriptive names and open the exact file you intend to upload. A folder containing mixed formats can be confusing when the operating system hides extensions. Use its file information panel when necessary. A careful final check is faster than diagnosing a rejected application image whose name no longer describes its contents.
