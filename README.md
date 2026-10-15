# Daykit

A static Astro site with React islands, TypeScript and Tailwind CSS. “Daykit” is a working name; branding and UI text live in `src/i18n/en.ts`.

## Run locally

Use Node 22.12+ (tested with Node 24) and npm.

```sh
npm ci
cp .env.example .env
npm run dev
```

On PowerShell, replace `cp` with `Copy-Item` if preferred. Open the address printed by Astro (normally http://localhost:4321).

```sh
npm run build
npm test
npm run preview -- --host 127.0.0.1
```

The build runs Astro/TypeScript diagnostics, then generates `dist/`. Tests inspect the generated HTML, unique SEO, JSON-LD, internal links, robots, sitemap and 404. Run the build before tests.

## Structure

- `src/pages/{tools,exams,calculators}/`: prerendered category routes, ready for future features.
- `src/pages/[page].astro`: About, Contact, Privacy Policy, Terms and Disclaimer.
- `src/layouts/Layout.astro`: shared SEO, header, navigation, breadcrumbs, footer and consent island.
- `src/components/AdSlot.astro`: reserved advertisement boxes.
- `src/components/CookieConsent.tsx`: necessary-only or optional preference, 180-day expiry, persistent storage fallback and footer reopen control.
- `src/data/`: route catalog and typed future reference data. No invented rates or exam facts.
- `src/i18n/`: English dictionary and locale entry point. Add a dictionary and locale-aware routes when introducing another language. All meaningful interface text comes from the dictionary; decorative artwork is hidden from assistive technology.
- `src/styles/global.css`: responsive styling and fixed ad reservations; Tailwind utilities are available.

## Environment

`PUBLIC_SITE_URL` is the canonical origin, defaulting to https://daykit.pages.dev. Set it to the final HTTPS domain **before building for deployment**. Canonicals, OpenGraph URLs, sitemap and robots derive from it. Do not deploy public production with a localhost origin.

`PUBLIC_CONTACT_EMAIL` overrides the public contact address (default: akashpatil6294@gmail.com). Operator details live in `src/config/operator.ts`. Provider retention, international transfers, licensing and jurisdiction-specific terms still require human review. See `LAUNCH-REVIEW.md`.

## Ad reservations

```astro
<AdSlot size="leaderboard" />
<AdSlot size="in-content" />
<AdSlot size="sidebar" />
<AdSlot size="sticky-mobile" />
```

Leaderboards reserve 728×112 pixels on desktop and 320×122 on mobile; in-content slots reserve 336×302 (mobile 300×272); sidebar slots reserve 300×622. These heights include label space. Widths shrink for narrow viewports without changing heights. Sticky-mobile reserves 320×72 in normal flow and sticks at the viewport bottom only below 601px; it is hidden on larger screens. It is available for future templates but intentionally not placed on every page. Future creatives must fit the reserved space. Never collapse unfilled slots after paint. No AdSense script or ad requests are installed. Disabled slots are omitted at build time; the dimensions below apply only to future enabled slots.

The consent UI overlays content rather than inserting layout space. Both choices currently only save a local preference: they do not enable ads or analytics. Before activating ads for EEA, UK or Switzerland visitors, integrate a Google-certified CMP; this custom banner is not a certified CMP. See https://support.google.com/adsense/answer/13554116 .

## Static deployment

Cloudflare Pages reads `public/_redirects`; redirect rules for retired URLs live there. For Vercel, add permanent redirects in `vercel.json` and equivalent entries for each locale prefix. Redirect rules are the only intentional references to those retired URLs.

Cloudflare Pages or Vercel: connect this repository, select the Astro/static preset (or equivalent), build command `npm run build`, output directory `dist`. Configure the environment variables above, use a supported Node version and deploy. No server adapter is required. Both hosts can use the generated `404.html` for missing routes. Avoid a catch-all SPA rewrite: these are real static HTML pages.

## Image tools (Phase 2)

Open `/tools/` to find seven working image pages: target KB resizing, pixel resizing, JPG to PNG, PNG to JPG, WebP to JPG, HEIC to JPG, and passport/visa photo cropping. Each prerendered page includes a unique 300+ word guide, steps, FAQs, metadata, WebApplication and FAQ JSON-LD. English is the only published locale; tool strings and editorial content are in `src/i18n/image-tools.ts` and `src/i18n/tool-pages.ts`.

`src/components/image-tools/` contains the React workspace and shared uploader, preview, download and error UI. `src/workers/image.worker.ts` owns decoding, canvas work and compression. `src/lib/image-math.ts` contains bounds, crop math and JPEG comment padding. The tool never calls an upload endpoint. Blob URLs are revoked on replacement/unmount, image bitmaps are closed when replaced, and temporary canvases are released. Cancel terminates the worker; it does not wait for compression to finish.

The file limit is 10 MiB (10,485,760 bytes), with a 40-megapixel decoded input safety limit. Exact-size output is capped at 16 megapixels and 8,192 pixels per side. Large target-size inputs are reduced to a bounded working resolution before quality search. Format conversion preserves original dimensions. HEIC adds a separate bundled decoder (~3.15 MB uncompressed), loaded only on its own page. Library attribution and source links are in `public/licenses/`.

Target KB uses 1,024 bytes. Binary search finds a JPEG quality under the target; dimensions are reduced if low-quality output is still too large. If maximum-quality output or a quality-step gap falls below 95%, valid JPEG COM metadata pads the result to approximately 97.5%. Padding is disclosed beside the result and in the guide; it does not add image detail. Every successful target-size export is checked to be between 95% and 100% of the target. The accepted target range is 2–10,240 KB. A destination may strip metadata or count KB differently, so its own upload validation remains authoritative.

The **Ready** message means required code has loaded. Processing continues offline in that same tab; this does not promise offline reloads or navigation, and no service worker is installed. HEIC uses the library's local decoder worker. Unsupported browser canvas features produce an error instead of silently moving expensive work onto the interface thread. Unusual HEIF variants can fail gracefully. Animated and multi-image sources yield a single image. JPEG flattens transparency onto white.

Photo presets in `src/data/photo-presets.json` are generic pixel templates with `verified: false` and no official claims. Crop positioning is available through pointer dragging and labeled keyboard sliders. No face detection, country-specific compliance checks, background removal or print-sheet generation is provided.

Run `npm run build` and `npm test`. Optional real-browser checks:

```powershell
$env:PLAYWRIGHT_MODULE='path/to/installed/playwright'
$env:CHROMIUM_PATH='path/to/chrome.exe'
node tests/image-tools-browser.mjs
```

Keep `npm run preview -- --host 127.0.0.1` running during these checks. Tests generate local fixtures and use a public libheif HEIC example. They check offline conversion, actual downloaded bytes and decodeability, aspect-ratio lock, crop output pixels, target range, downscaling, JPEG padding, invalid/oversized input, cancellation and a near-10 MiB file with a mobile viewport and 4× CPU throttling. Results and screenshots are written to ignored `qa-*` files. Emulation does not replace testing on physical mobile devices.

## Exam workspaces (Phase 3)

`data/exams.json` is the single registry for SSC, UPSC, NEET, JEE Main, IBPS, SBI PO, RRB, KCET and GATE. All seeded photo/signature values, source URLs and verification dates are null, and every seeded entry has `verified: false`. There are no invented official requirements.

Each record generates `/resize-photo-signature-[slug]/`, an exam index entry and a sitemap entry. Pages include an exam-specific introduction, specification table, preparation steps, FAQs, source link/status and last-verified status. Unknown values render as “Not supplied”, never zero or a guessed default. Unverified records display a prominent notice.

To add an exam, edit **only** `data/exams.json`, then rebuild. Copy a record and give it a unique lowercase hyphenated `slug` and a `name`. Required fields:

- `photo_spec` and `signature_spec`: `width`, `height` (whole pixels), `min_kb`, `max_kb`, and `format` (`jpg`, `jpeg` or `png`). Use null for unknown values.
- `source_url`: an official notification URL, or null until supplied.
- `last_verified`: `YYYY-MM-DD`, or null until checked.
- `verified`: false until you have checked the record against its official source. Marking true requires a source URL and verification date.
- Optional `content.en.intro`: a custom introduction. If absent, the page generates an introduction using the exam name, so new entries need no translation or route edits.

The build validates slugs, supported formats, dimensions, file-size ranges and dates. Changing a stored specification automatically prefills the corresponding editor. The seeded null settings stay blank; the visitor must supply dimensions, maximum KB and a format. The optional minimum is treated as no lower bound only in the visitor's working settings when left blank, not as a fact about the exam. Editing controls never changes the JSON or verification state.

The exam editor reuses the Phase 2 worker and controls. Photo mode crops; signature mode fits the full image within the requested rectangle and adds white margins as necessary. Dimensions stay fixed. JPEG searches quality to meet the maximum and can add disclosed COM padding to meet the minimum. PNG must naturally fit the requested range. Impossible combinations produce an error rather than silently changing dimensions, format or specifications. Output uses 1,024 bytes per KB; check the destination's convention.

`node tests/exam-browser.mjs` temporarily adds an explicitly synthetic JSON record, builds it, tests automatic generation, preset prefilling, unknown values, offline photo/signature processing, invalid ranges and accessibility, then restores the real JSON and production build in a `finally` block. Run it while the local preview server is running. Do not interrupt this particular test while it is using its temporary record; its normal completion removes the synthetic page.

## Phases 4–8

Ten calculators, six PDF tools, six regional-language mirrors and twenty guides are now implemented. See `PHASE-REPORTS.md` for phase details and `PRE-LAUNCH-CHECKLIST.md` for the remaining operator decisions. Backend tables remain outside this phase. Advertising remains disabled.

Local production-preview verification on 2026-10-12: Lighthouse mobile scored **100 performance, 100 accessibility and 100 SEO**, with **CLS 0**, on `/tools/resize-image-kb/` and `/resize-photo-signature-ssc/`. This is a two-page local lab sample, not a claim about every device or future deployment. The interactive exam workspace also passed the automated WCAG A/AA check. Run `npm run audit:mobile` to repeat the Lighthouse sample with `CHROMIUM_PATH` set to your Chromium executable.

The final standalone browser regression processed a 10,120,279-byte generated PNG at a mobile viewport with 4× CPU throttling. The maximum measured main-thread long task during that workflow was 69 ms. Its 100 KB target output was 99,840 bytes; its 2 KB downscaled output was 1,973 bytes. All format conversions, including the real HEIC fixture, decoded successfully offline. Production build, nine unit/static tests, and the JSON-only exam integration check passed. Physical mobile-device verification and deployed-domain measurements remain recommended before launch.

Use `npm run build` then `npm run preview` for the full multilingual static site. `npm run dev` serves the English source routes. Locale pages are generated by `scripts/localize.mjs` after Astro builds; runtime dictionaries keep React interactions translated. Translation drafts are committed under `src/i18n/machine/`. After editing public copy, run `npx astro build`, `npm run translate`, then `npm run build`. Translation is an authoring-time network operation only, and needs a trusted network connection. It never sends visitor files.

Guide Markdown lives in `content/guides/`; its front matter is a JSON object between `---` lines. This deliberately simple format is parsed by `src/lib/guides.ts`. Each entry includes title, summary, author, published/updated dates and FAQ items. Do not convert the front matter to YAML without updating that reader. Article bodies stay English; localized pages translate titles, summaries and navigation.

PDF dependencies are self-hosted. Run `node scripts/pdf-assets.mjs` after a PDF.js upgrade. PDF parsing and document assembly use workers; rendering yields between chunks. Files have a 50 MB aggregate limit, with at most 50 input files and 100 pages. Compression flattens pages and cannot guarantee readability at arbitrary targets.

Validation: `npm test`, `node scripts/audit.mjs`, and the browser scripts in `tests/` against the preview server. Configure `CHROMIUM_PATH` for browser checks. `AUDIT_ROUTES` can contain comma-separated paths for `node tests/lighthouse.mjs`. Browser viewport emulation is not a substitute for physical-device testing.

Deployment: run `npm ci` and `npm run build`; publish `dist/` to Cloudflare Pages or Vercel as a static site. Set `PUBLIC_SITE_URL` to the final HTTPS origin before building and `PUBLIC_CONTACT_EMAIL` to a working address. No server functions are required. Test trailing-slash URLs and the host's 404 behaviour after deployment.

## Converter service licences

The `/converter` service (which replaces the old disabled `converter-service/` reference) converts documents with third-party libraries. Check the licences below against the pinned versions in `converter/requirements.txt` before hosting it for the public:

- **PyMuPDF** (pinned 1.28.2): dual-licensed **AGPL-3.0 or Artifex commercial**. Running it as a network service counts as conveying the software under the AGPL: you must offer the corresponding source (including your modifications to the service) to users of the service, or buy the commercial licence from Artifex.
- **pdf2docx** (pinned 0.5.13): the bundled licence is **MIT** (Artifex re-release). Caution: older `dothinking/pdf2docx` releases were GPL-3.0, so the pin matters — re-check the licence if you change the version.
- **OCRmyPDF** (pinned 16.7.0): **MPL-2.0** (file-level copyleft; keep its notices with the deployment).
- **Tesseract** (system package in the Docker image): Apache-2.0.
- **LibreOffice** (system package): MPL-2.0 / LGPL.

Switching `CONVERTER_ENGINE` to a managed API (Adobe, ConvertAPI, CloudConvert) removes these libraries from the deployment and with them the copyleft obligations — see `converter/README.md`.

## Genesis frontend

The shared styles use the Genesis editorial reference: General Sans headings, DM Sans body, neutral surfaces, indigo actions, 12px cards and 6px buttons. Primary buttons use the darker reference indigo for accessible white-text contrast. Fonts load from Fontshare and Google Fonts, disclosed in the privacy policy. Mobile navigation uses an accessible disclosure button.
