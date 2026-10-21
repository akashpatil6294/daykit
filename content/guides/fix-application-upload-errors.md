---
{"title":"Diagnose application upload errors one condition at a time","summary":"Use the portal's exact error message to distinguish format, dimensions, bytes, PDF structure and session problems before changing your files.","author":"Akash Patil","published":"2026-10-13","updated":"2026-10-21","faq":[{"question":"Should I compress every rejected file?","answer":"No. Compression only addresses some size problems. It will not necessarily fix the wrong format, incorrect dimensions, a damaged document or an expired application session."},{"question":"Does an accepted upload mean the application is complete?","answer":"Not necessarily. Review the official workflow, previews, required fields and confirmation steps. Technical acceptance of one attachment is only one part of submission."},{"question":"Can the age calculator confirm eligibility?","answer":"No. It calculates calendar differences under its stated convention. Eligibility depends on the official cutoff, rules and any applicable provisions for the particular application."}]}
---


## Record the failure before changing the file

Write down the exact upload message, the selected filename and the actual bytes. If the error says format rather than size, another compression pass may be irrelevant. Compare 102,400 bytes with a decimal 100,000-byte ceiling: a file labelled 100 KB locally can exceed that destination’s rule.

“Upload failed” is a symptom, not a diagnosis. The most useful first action is to preserve the exact message and the file you attempted to upload. Changing several properties immediately can erase the evidence of what went wrong. A structured check often resolves the issue faster than repeated compression or repeated attempts with differently named copies.

Start by confirming that you are using the correct application and document field. A photo field, signature field and supporting-document field may accept different file types. Compare the current official instructions with the selected file, not with the settings you remember entering earlier. The downloaded output is the item the portal sees.

## Check file type before adjusting quality

An extension is a filename convention, not proof of encoded format. A HEIC image renamed to JPG is still HEIC inside. A scanned page inside a PDF is not a JPG attachment. Use a genuine conversion when the destination requires it, and then inspect the result. Do not make the filename less truthful while trying to satisfy a filter.

If the document is supposed to be a PDF, open it in a trusted viewer. A file that cannot be opened may be incomplete or damaged. Download or export a fresh copy from its source when possible. A compressor is not a general repair service, and an unreadable source may fail before any size reduction can begin.

## Match the dimensions condition

For an image dimensions error, inspect width and height in pixels. Use the [pixel resizer](/tools/resize-image-pixels/) with values taken from the current instructions. Make sure the output ratio is appropriate; stretching to fit can meet a numerical check while distorting the image. Crop from the source when a different shape is necessary.

Recheck dimensions after later processing. The [target-KB tool](/tools/resize-image-kb/) may reduce pixels if JPEG quality changes alone cannot meet a difficult target. A file that passed your first dimensions check can therefore fail a final one. Treat format, dimensions and bytes as a group of independent conditions to verify at the end.

## Read minimum and maximum sizes carefully

A form may state a range rather than only a maximum. Do not assume that “under the limit” is sufficient when a minimum is also specified. Record the units and whether the instructions describe the image itself or the complete document. Operating systems and websites can round size displays differently, so inspect exact bytes when available.

For a PDF size problem, the [PDF compressor](/tools/compress-pdf/) can try a smaller image-based output. It removes selectable text and other interactive features as part of rasterization. Review whether that trade-off is acceptable for the required document before using it. Reducing a file below a limit is not useful if the required evidence becomes unreadable or loses an essential feature.

## Investigate PDF structure separately

A password-protected PDF can be rejected even when it opens on your own device because your viewer remembers a password. If you are authorized to do so, export an unlocked copy through a trusted application. Do not assume that copying or renaming the file removes encryption. PDF Converter rejects protected files rather than trying to bypass their protection.

If the portal requests only particular pages, use the [split tool](/tools/split-pdf/) to create the appropriate extract. Removing unrequested pages may reduce size without degrading retained page content. Verify that the extract still includes all necessary context, such as continuation pages or declarations. The tool cannot decide what counts as complete evidence.

## Separate file problems from session problems

If a checked file still fails and the message suggests a session or connection issue, preserve your work before refreshing or signing in again. Follow the portal’s own guidance. Repeated file editing will not fix an expired session. Avoid opening many competing application tabs that make it unclear which one contains the latest saved state.

For other form values, use supporting tools carefully. The [age calculator](/calculators/age/) can compare dates, but an eligibility rule may use a specific cutoff or legal convention. Read the official instruction before interpreting the result. A technically consistent form can still contain an administratively incorrect value if the wrong reference date was used.

## Finish with evidence of the successful attempt

Once an upload works, inspect the preview and confirm the selected file version. Save the confirmation provided by the official process and keep the exact exported attachment until the application is finished. If you contact support, provide the error wording and relevant file properties without sharing more personal information than necessary.

On a shared device, clean up temporary copies and sign out after the task. Browser-only processing keeps files out of this tool’s server, but local downloads remain accessible to whoever can use the device. Practical privacy includes the download folder and account session as well as the conversion method.
