# Daykit local launch review — 16 October 2026

Continuation: see [BACKEND-VERIFICATION.md](BACKEND-VERIFICATION.md) for newer Docker, conversion and regression results. The original test results below describe the earlier checkpoint.

## Completed

- Applied the Genesis editorial reference to the homepage and shared tool styles: neutral surfaces, General Sans / DM Sans, generous spacing, white cards, indigo actions, mobile menu and reduced-motion support. Used the darker reference indigo for accessible primary-button contrast. Existing routes and tool implementations remain.
- Configured Akash Patil, individual developer, India, with clickable public email. Removed the resolved missing-identity banner. Revised About, Contact, Privacy and Terms; no invented business details or compliance guarantees.
- Corrected misleading browser-only and guaranteed-deletion claims. Disclosed Cloudflare Pages, Render, external fonts, browser preference storage and unresolved provider retention/transfer details.
- Removed disabled advertising placeholders. Advertising remains off; no publisher ID or ads.txt was invented. The existing activation guard still requires an implemented consent/ad integration.
- Production canonical fallback is https://daykit.pages.dev, with an explicit Node version and contact configuration. Added static security headers.
- Converter workers are isolated processes. Linux timeouts terminate the job process group before cleanup and release. Stale cleanup skips active jobs. Origin values are trimmed; OCR response headers are readable by browsers.
- Added Office archive size/path checks and enforced the page limit on Office-to-PDF output. Removed a misleading Docker hash-check fallback; dependency versions remain pinned but not hash-locked.
- Refreshed machine translation drafts and corrected reversed/duplicate Bengali conversion titles.
- The reported extract.ts import was already correct and was left intact.

## Verification

- Final Astro/TypeScript build and six-language generation passed, including the corrected conversion disclosures.
- Frontend suite: 19 Node tests and 21 Vitest tests passed.
- Site audit: 574 HTML pages, 567 indexed pages, zero reported issues after the Bengali title fix.
- Chrome mobile audit: 12 representative routes, zero overflow, accessibility violations or JavaScript errors; mobile menu checked. Desktop and mobile screenshots saved as qa-genesis-desktop.png and qa-genesis-mobile.png.
- npm production dependency audit: zero known vulnerabilities returned. This is not a security guarantee.
- Python service tests: 13 passed, 5 failed. All new archive, header and timeout regression tests passed. Three failing Office-to-PDF tests require missing LibreOffice; two PDF-to-Word tests require missing pdf2docx. Tests were not skipped or weakened.
- Docker CLI exists but Docker engine is not running, so the Linux image was not built or tested here. Linux process-group termination requires container verification; Windows only guarantees stopping the Python worker.
- npm ci was not rerun: existing installed dependencies were used. A clean dependency install remains a deployment verification step.
- Two existing unused-variable hints and a mixed static/dynamic-import bundling warning remain; neither blocks the build.
- HTTPS HEAD checks returned 200 for both daykit.pages.dev and pdf-converter.me. This verifies responses, not dashboard ownership or the desired canonical domain. No DNS changes were made.

## Required before launch (priority order)

1. **Converter deployment:** verify the Render service URL and set PUBLIC_CONVERTER_URL to its HTTPS /convert endpoint. Blank configuration intentionally leaves the six remote converters unavailable. Build the Linux image, run all 18 service tests with the image dependencies, exercise OCR, malformed uploads, timeout cleanup and concurrent load, and apply platform memory/CPU limits. CORS is not authentication; callers outside browsers can forge Origin. Validate trusted proxy handling and add edge abuse controls as needed.
2. **Provider and legal review:** confirm Cloudflare/Render logging, retention, processing regions and international transfers; update the privacy policy with verified facts. Obtain review of applicable Indian obligations, dispute terms and consumer rights. Verify the existing GPL/AGPL notes for pdf2docx/PyMuPDF against the exact installed packages and deployment; determine source-availability/commercial-license obligations with qualified advice. No legal conclusion is offered.
3. **Content review:** human-review all six machine-translated languages, especially legal, financial and conversion directions. Exam records intentionally retain unverified/blank specifications; check against current official notices. The short About/Contact/Disclaimer pages are factual but merit editorial review; do not pad them with fabricated content.
4. **Advertising:** keep ads disabled until account review, real publisher/slot values, consent implementation and policy review are complete. Check current Google requirements before activation: https://support.google.com/adsense/answer/13554116 . Approval is not guaranteed. Only add ads.txt using records supplied by the approved account.
5. **Dependency/container maintenance:** generate a hashed Python lock, scan the actual container, and run a clean npm ci plus build. External font availability and privacy tradeoffs need operator review; self-hosting appropriately licensed fonts is an alternative. The delivered theme is light; no dark-mode claim is made.

## Cloudflare Pages manual steps

1. Open the existing Pages project. Confirm the repository root is this package (the directory containing astro.config.mjs), build command npm run build, and output dist.
2. Set Node 24, PUBLIC_SITE_URL=https://daykit.pages.dev, PUBLIC_CONTACT_EMAIL=akashpatil6294@gmail.com, and PUBLIC_CONVERTER_URL=https://YOUR-RENDER-HOST/convert using the actual host. Never place server secrets in PUBLIC_* variables.
3. In Custom domains, verify pdf-converter.me is Active and attached to this Pages project. Both hosts currently respond over HTTPS; do not change nameservers merely based on this report. If a record is missing, use the exact DNS target displayed by Pages rather than an invented IP.
4. Confirm which domain should be canonical. Only then rebuild with its PUBLIC_SITE_URL, keep the pages.dev host working, and update converter CORS to include both intended origins. Verify canonical tags, sitemap.xml, robots.txt, redirects and 404 on the actual deployment.
5. Deployment requires operator approval; nothing was pushed or published in this task.

## Render manual steps

1. Confirm Docker context converter and Dockerfile converter/Dockerfile (or set root directory converter and Dockerfile Dockerfile). Expose port 8000 and health path /healthz; the current Docker command starts one worker.
2. Set PUBLIC_SITE_URL=https://daykit.pages.dev and CORS_ORIGINS=https://daykit.pages.dev,https://pdf-converter.me once both origins are confirmed as intended. Avoid wildcard origins. Use CONVERTER_ENGINE=local; managed adapters are unimplemented skeletons.
3. Retain CONVERTER_CONCURRENCY=2 and JOB_TIMEOUT_SECONDS=120 initially, then tune only after load tests. Verify 25 MiB/100-page limits, resources and cleanup on Linux. Use Render secrets for any future server-only credentials.
4. Verify all six conversions and OCR from each allowed frontend origin. Confirm forbidden origins fail. Record the actual HTTPS service URL for the frontend configuration.

## Review and commit (not executed)

Run from C:/Users/akash/Downloads/daykit (3)/daykit/merge_pdf:

```powershell
git status --short
git diff --check
git diff
npm ci
npm run build
npm test
node scripts/audit.mjs
git add -- .
git diff --cached --stat
git commit -m "Apply Genesis styling and harden Daykit launch readiness"
```

Inspect the staged diff before committing. No push or deployment command was executed. Deploy the reviewed commit through the existing Cloudflare Pages/Render project workflows only after the blockers above are resolved.

## Exact changed files

- `.env.example`
- `.node-version`
- `README.md`
- `astro.config.mjs`
- `content/guides/pdf-word-without-upload.md`
- `converter/Dockerfile`
- `converter/README.md`
- `converter/converter/engines.py`
- `converter/converter/main.py`
- `converter/converter/worker.py`
- `converter/test_service.py`
- `package-lock.json`
- `package.json`
- `public/_headers`
- `src/components/AdSlot.astro`
- `src/config/operator.ts`
- `src/i18n/en.ts`
- `src/i18n/machine/bn.json`
- `src/i18n/machine/hi.json`
- `src/i18n/machine/kn.json`
- `src/i18n/machine/mr.json`
- `src/i18n/machine/source-inventory.json`
- `src/i18n/machine/ta.json`
- `src/i18n/machine/te.json`
- `src/i18n/pdf-new-pages.ts`
- `src/i18n/pdf-tools.ts`
- `src/layouts/Layout.astro`
- `src/pages/[page].astro`
- `src/pages/index.astro`
- `src/pages/resize-photo-signature-[exam].astro`
- `src/styles/calculators.css`
- `src/styles/global.css`
- `src/styles/image-tools.css`
- `src/styles/pdf-tools.css`
- `tests/audit-browser.mjs`
- `LAUNCH-REVIEW.md` (this report)
