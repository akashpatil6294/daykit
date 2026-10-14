# Implementation reports

## Conversion service, exam data and cleanup — 14 October 2026

Three workstreams landed in one pass:

**Games and Supabase removal (complete).** The retired games category and every Supabase reference are gone: `src/lib/supabase.ts` deleted, `@supabase/supabase-js` uninstalled, `PUBLIC_SUPABASE_*` removed from `.env.example` and `src/env.d.ts`, games redirects removed from `public/_redirects`, and all mentions scrubbed from `src/i18n/en.ts`, the six machine dictionaries, `README.md`, `AUDIT-REPORT.md` and `PRE-LAUNCH-CHECKLIST.md`. `grep -ri "game"` over `src tests README.md` and `grep -ri "supabase"` across the repo both return nothing. The build test now asserts the site contains only known categories and no retired routes.

**High-fidelity conversion service (new).** The six converters (pdf-to-word, pdf-to-powerpoint, pdf-to-excel, word-to-pdf, powerpoint-to-pdf, excel-to-pdf) are now backed by a FastAPI service in `/converter` (Docker) behind `PUBLIC_CONVERTER_URL`, replacing the in-browser text-extraction versions with no silent fallback. Engines: headless LibreOffice for Office→PDF; pdf2docx for PDF→DOCX; PyMuPDF editable PPTX (text boxes + images from PDF coordinates) with a rasterized exact-look `fidelity=exact` option; PyMuPDF/pdfplumber table detection → openpyxl for XLSX; OCRmyPDF first for scanned PDFs (the UI reports when OCR was applied). Service rules: 25 MB / 100 pages, per-IP rate limiting, CORS allow-list, 120 s job timeout, concurrency cap, tmp files deleted immediately after the response plus a 10-minute sweep, no filename/content logging, `/healthz`. An `Engine` adapter interface allows swapping in a managed API (Adobe, ConvertAPI, CloudConvert) via `CONVERTER_ENGINE` with keys server-side only; licence notes for pdf2docx/PyMuPDF as a hosted service are in `README.md`. Frontend: explicit consent checkbox ("This file is sent to our converter and deleted right after."), progress, cancel, and clear errors for password-protected, too-large, timeout and service-down cases. Copy says "high-fidelity", never "exact". The old disabled `converter-service/` reference was removed. Quality gate: `scripts/converter-quality.py` converts fixtures, renders outputs back to images and writes `qa-converter-report.json` (9/11 ok; multicol reflow and missing-OCR cases documented as honest limitations). Docker could not be built in this environment; OCRmyPDF was absent so the OCR path returns an honest 422.

**Exam data rebuild (complete).** `data/exams.json` now holds 10 records (new `rrb-alp` entry) with the extended schema: cycle, source_url, source_title, last_verified, verified, notes, and per-spec width/height/unit/min_kb/max_kb/formats/background/rules. Nine records verified against the conducting bodies' official notifications on 2026-10-14 (SSC CGL, UPSC CSE, NEET UG, JEE Main, IBPS PO/Clerk, SBI PO, RRB Level-1, RRB ALP, GATE 2027); KCET remains unverified (KEA portal unreachable) with a TODO entry. Unclear fields are null, never guessed. Added `EXAM-DATA-TODO.md`, `data/exams-template.csv`, `scripts/import-exams.mjs` (CSV validation + import) and `scripts/check-exam-freshness.mjs` (fails on records older than 90 days, also covered by a unit test). Exam pages show "Last verified" with a source link when verified and keep the unverified notice otherwise; data values are marked `data-no-translate` so future data updates cannot break the localized build.

Validation: `npm run build` passes (astro check 0 errors, 84 pages, localized into 6 languages with 0 missing translations); `npm test` passes (19 node + 21 vitest). Remaining manual work is listed in `PRE-LAUNCH-CHECKLIST.md`: deploy `/converter`, set `PUBLIC_CONVERTER_URL` and rebuild, plus the KCET/UPSC-portal follow-ups in `EXAM-DATA-TODO.md`.

## Category cleanup — 13 October 2026

Removed the unused entertainment category, its homepage promotion, navigation, styling, sitemap special case and future-feature copy. The home secondary action now opens the exam photo/signature workspaces. All three home categories show their available status. Cloudflare redirects preserve old English and regional-language bookmarks; the README documents Vercel equivalents.

Regenerated all six machine dictionaries with 19 updated strings per language and pruned orphan keys against the current source inventory. Future translation runs now prune removed copy even when no new strings need translating. Translations remain unreviewed drafts.

Validation: production build has zero errors, warnings or hints; all 16 Node tests and 10 Vitest cases pass. Static audit checks 441 HTML files and 434 indexed URLs with no structural issues. No retired category page is generated in any language. Remaining source references are limited to redirect rules, their documentation and removal regression assertions.

The 12-page mobile browser audit also passes: no WCAG A/AA violations, horizontal overflow or uncaught page errors. All four ad-slot sizes retain their reserved height. These checks cover the cleanup; previously recorded Lighthouse numbers below are historical measurements, not a new performance run.

Run `npm run build`, `npm test`, then `npm run preview -- --host 127.0.0.1`. Next phase: the browser-only PDF/Office converter catalog, workers, safety limits, editorial pages and guides; afterward additional PDF editing tools. Those additions are not implemented by this cleanup phase. (The 14 October 2026 pass later replaced the disabled reference upload service with the production `/converter` service.)

## Phase 8 — pre-launch audit

Completed the 448-page static crawl, content/link coverage checks, 13-page mobile accessibility pass and ten-page Lighthouse sample. Fixed stale feature/privacy copy, 404 language links/canonicals, translated title collisions, localized article URLs, homepage contrast and placeholder indexing. Lighthouse performance was 91–100, accessibility/SEO 100 and CLS 0 on every sampled page. The production build and 25 unit/static cases pass.

Added `AUDIT-REPORT.md`, `PRE-LAUNCH-CHECKLIST.md`, comments-only `ads.txt`, a single disabled ad configuration and a clearly marked future script insertion component. No AdSense script is active. Run `npm run build`, `npm test`, `node scripts/audit.mjs`, then `npm run preview`.

Remaining launch tasks are explicit: real operator/contact/domain/hosting details, official exam verification, fluent translation review, physical-device testing, Search Console and certified advertising consent before ad activation. The report lists performance limitations, concise legal/placeholder content, and future backend work without claiming they are complete.

## Phase 7 — guides

Published 20 original Markdown guides under `content/guides/`, totaling about 17,600 words including FAQs. Every article exceeds 800 words, carries an editorial byline and published/updated dates, has a table of contents and Article JSON-LD, and links to relevant working tools. Every image tool, PDF tool and calculator is linked from at least two guides, enforced by a test. Tool pages link back to relevant guides. Titles, summaries and navigation have six translated mirrors; the English article body is labeled with its language and localized pages explain this limitation.

Run `npm run build` then `npm run preview`, and open `/guides/`. All 14 static/unit checks and 10 finance cases pass. Metadata is JSON inside Markdown front matter; add articles in `content/guides/` and rebuild. No exam specifications or market rates are invented. Editorial and translation review remain advisable before launch; the byline is the site editorial identity, not a claimed credentialed reviewer.

## Phase 6 — PDF tools

Six local tools: merge, selected-page split, reorder/delete, images to PDF, PDF to JPG ZIP, and target-size compression. Each has 300+ words, steps, FAQs, structured data, related links and six translated mirrors. Shared upload, preview, error and download components are reused. PDF.js parsing and pdf-lib assembly use workers; display rendering yields between chunks. Files are not uploaded. Inputs are limited to 50 MB total, 50 files and 100 pages.

Run `npm run build` then `npm run preview`; browser validation: `node tests/pdf-browser.mjs` with CHROMIUM_PATH configured. All six operations and corrupt-input handling passed. A 6,007,712-byte noisy scanned-form fixture compressed to 155,328 bytes, with the mobile preview visually checked. Thirty-page compression produced 202,065 bytes. Max heartbeat gap was 511 ms during PDF-to-images startup and 138 ms during compression; this is measured desktop Chromium with a mobile viewport, not a guarantee for low-end phones. The test report is `qa-pdf.json`.

Known limits: no OCR; raster compression loses searchable text, interactive features, tags and signatures; cannot guarantee readability for an arbitrary page count and target. Unsupported/encrypted inputs are rejected. Native mobile-device testing remains part of the launch checklist. PDF assets are self-hosted in `public/pdf-assets/`; refresh them with `node scripts/pdf-assets.mjs` after upgrading PDF.js.

## Phase 5 — regional languages

All 37 original pages are mirrored in Hindi, Kannada, Tamil, Telugu, Marathi and Bengali. Localized canonicals, reciprocal hreflang, x-default, sitemap entries and page-preserving language selection are included. Self-hosted script-subset fonts use swap. Translation dictionaries are generated at authoring time only and clearly marked as machine drafts under `src/i18n/machine/`.

Run `npm run build` then `npm run preview` for all languages. `npm run dev` serves English source pages. After changing copy, build English with `npx astro build`, run `npm run translate`, then run the full build. All six language calculator interaction checks passed, including hydration and mobile overflow checks. Sample mobile audits: Hindi EMI 97 performance, Kannada image resizer 98; both accessibility/SEO 100 and CLS 0. Static checks validate every mirror's canonical and hreflang.

Known issue: machine wording requires fluent human review before public launch, particularly financial terminology. Automated checks establish route and interaction correctness, not translation accuracy. The translation endpoint is only used while authoring public copy; it never receives visitor files.

## Phase 4 — calculators

Built ten prerendered calculator pages and a directory: EMI, SIP, lumpsum, FD, RD, GST, percentage, age, loan prepayment and compound interest. The calculator island updates after a 150 ms debounce, validates inputs, defaults to INR/Indian grouping and offers international formatting and currency labels. EMI/prepayment include paged amortization tables; money-growth pages load a separate SVG breakdown component. Each guide has 400+ words, a worked example, its formula, five FAQs with JSON-LD, related calculators and related tools.

Pure formula functions live in `src/lib/finance/`. Ten Vitest cases cover standard formulas, zero rates, one-month terms, large values, invalid inputs, leap dates and prepayments. Ten existing/static checks also pass. All ten pages passed mobile browser interaction checks; the EMI workspace passed automated WCAG A/AA checks.

Run: `npm run dev`; verify: `npm run build` then `npm test`. For browser checks, set `CHROMIUM_PATH` and run `node tests/calculators-browser.mjs` against the preview server.

Known modelling limits: constant nominal rates; no fees, taxes, inflation or market-return paths. RD uses beginning-of-month deposits with quarterly compounding expressed as an equivalent monthly factor. FD partial periods use fractional exponents. Prepayment keeps EMI fixed. Currency selection changes the label, not exchange rates. These assumptions are displayed on the relevant pages. Defaults are unverified examples, not market facts.
