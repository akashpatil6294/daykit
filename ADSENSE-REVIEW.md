# AdSense readiness review

Reviewed: 21 October 2026 (Asia/Calcutta)

## Decision

Do not request another review yet: deployment succeeded, but two stale converter URLs still serve the previous HTML. The user authorized publication; commit 23b56fd was pushed to main and Cloudflare deployment 77ae74d4-6764-415f-9743-8cc5fa483666 succeeded. Google decides approval based on its site/account review; no test suite, word count or checklist guarantees approval. This report does not claim to identify every possible rejection reason.

Operator: Akash Patil, independent developer, Bengaluru, India. Contact: pdfconverter.help@gmail.com. Site: https://pdf-converter.me. Frontend: Cloudflare Pages. Optional conversion backend: Render. Terms: India, subject to applicable law. Advertising remains disabled locally.

## Changes implemented locally

- PDF Converter identity, operator/contact details, favicon, shared navigation and footer; legal pages remain in the existing page template.
- English-only output and six locale-prefix redirects. Machine dictionaries remain unused in the repository.
- Ads loader and cookie overlay removed; disabled ad slots render no boxes.
- Browser-only versus uploaded conversion behavior disclosed. No immediate or complete deletion guarantee; provider log retention remains unverified.
- Nineteen published tools have at least 600 explanatory words and four FAQs. Six conditional conversion tools also have content checks. Twenty-six guides and ten calculators retain their explanatory content and review dates. These word floors are project rules, not Google approval criteria.
- Missing/unhealthy conversion backend excludes six routes and their links/sitemap entries. One unverified exam is noindex and unlinked. Existing source records describe nine other exams as verified; this turn did not independently reverify their source documents.
- Corrected NEET, SBI PO and RRB introductions that contradicted populated tables. Corrected About's unconditional Office-conversion availability claim and a nonexistent unit-conversion category claim.
- Real production publication functions are tested using isolated fixtures and injected network responses, including healthy/error/malformed/timeout conditions.
- The build now runs publication/content assertions after output filtering, so a failing gate prevents a successful build.
- Image jobs carry identifiers. Stale replies cannot change a subsequent job, its timer or result. Cancelled worker operations check their identity at asynchronous boundaries.
- Added a deterministic browser regression that holds real worker results, cancels A, starts B, then injects A's result/error/loaded/progress replies while B is still busy. It checks B's timer, preview, filename, dimensions, pixel content and offline operation.
- Restored image-worker initialization timeout/error handling so unsupported engines or failed initialization do not leave the interface indefinitely on Preparing.

## Evidence and limits

Final checks on 21 October 2026, after the initialization fix:

| Check | Result |
|---|---|
| npm run build | Passed, including all 3 publication/content gates; 0 type errors, 0 type warnings, 2 existing hints |
| npm test | 54 passed: 33 Node tests + 21 Vitest tests |
| node scripts/audit.mjs | 76 HTML pages, 74 indexed, zero issues |
| node tests/image-cancellation-browser.mjs | Passed: deliberately delayed replies, preserved timer/preview, correct blue output, offline mode, unsupported-engine error |
| node tests/image-tools-browser.mjs | All 10 image workflows passed |
| git diff --check | Passed |
| Targeted visible-content scan | No matches for unfinished-site phrases or the obsolete empty-table/no-verified-spec claims |

The scan excludes script/style contents; technical source identifiers and third-party license text are not falsely represented as absent. The build retains an existing ineffective-dynamic-import bundling warning. Earlier artifacts must not be represented as freshly executed checks.

- Existing qa-browser-audit.json records the preceding 75-route accessibility/mobile audit. qa-image-report.json records this turn’s completed image suite; qa-pdf.json and qa-calculators.json record earlier functional runs. They are useful evidence, not a claim that every possible file or browser was tested.
- Existing qa-lighthouse.json records eight earlier sampled routes with performance 91-100, accessibility/SEO 100, CLS at most 0.033. These are local laboratory observations, not live Core Web Vitals guarantees.
- Content/duplicate checks cannot establish originality against the entire web or predict Google's assessment of usefulness.
- Browser checks do not verify actual Google crawler access through every Cloudflare security rule.

## Live inspection before deployment (historical)

Read-only HTTP inspection saved in qa-live-readiness.json:

| Route | Observed response |
|---|---|
| / | 200; Daykit title; active adsbygoogle.js loader |
| /about/ and /privacy/ | 200; old Daykit identity; active ad loader |
| /hi/ | 200 translated page; not the intended 301 |
| /tools/pdf-to-word/ | 200 old conversion page; backend conversion not tested live |
| /sitemap.xml | 200; 567 URLs, versus 74 locally indexed URLs |
| /ads.txt | 200; existing Google publisher record |
| /robots.txt | 200; general Allow rule and sitemap; Cloudflare also inserts specific bot rules |
| Random nonexistent route | Actual 404 |

The public site is reachable from the working PowerShell HTTP client. Node fetch failed from this environment; that is not evidence the site is down. The robots file did not explicitly disallow Mediapartners-Google, but this does not establish that Google encounters no challenge/WAF rule.

## Advertising verification and account checks

public/ads.txt contains the existing record:
`google.com, pub-5625418813515014, DIRECT, f08c47fec0942fa0`

It is NOT comment-only. It was preserved, not invented or newly enabled. An ads.txt record does not itself load or display ads. Google supports ads.txt or a meta tag as alternatives to the ad script for connecting a site. Confirm that this existing publisher ID matches the intended AdSense account and select the matching verification method in that account before requesting review. Account ownership, review status, identity/payment requirements and policy-center notices were not accessible in this code audit.

Keep advertising disabled until the account/site and required consent setup are ready. Before serving applicable Google ads in the EEA, UK or Switzerland, configure a Google-certified CMP with the currently required TCF integration. Do not rely on a fixed TCF version in an old report. Review other applicable consent requirements when enabling advertising.

## Production configuration

- Repository build directory: daykit/merge_pdf (when repository root is its parent).
- Build: npm run build; output: dist.
- Node: a version satisfying package.json >=22.12.0 and the lockfile.
- PUBLIC_SITE_URL=https://pdf-converter.me
- PUBLIC_LOCALES=en
- Leave PUBLIC_CONVERTER_URL unset until its real HTTPS endpoint and service are verified. Build health timeout is 10,000 ms; a successful build-time check does not guarantee later uptime.
- Preserve _redirects, _headers, robots.txt, ads.txt and 404.html in publication.

## Required before resubmission

1. Deployment completed with user authorization: commit 23b56fd. Clear stale cached copies of /tools/pdf-to-word/ and /tools/word-to-pdf/ before resubmission; the opened Cloudflare dashboard currently requires owner sign-in.
2. Check the production homepage, legal pages, metadata and operator details; verify no active ad loader/consent overlay while ads are disabled.
3. Check each locale prefix redirects directly to the matching English route, unavailable converters return actual 404, no excluded routes appear in the sitemap, and normal tool pages work on mobile and desktop.
4. Confirm Google can fetch the site without login or security challenges. Use actual AdSense/Search Console evidence; spoofing a crawler user-agent is not proof.
5. Confirm the existing publisher record belongs to the intended account, complete the chosen site-verification method, and resolve all account-specific notices. Do not invent eligibility or payment information.
6. Review the specific rejection notice and affected URLs against the updated live site. The exact latest account notice was not provided in this turn.
7. Confirm exam source documents/cycles and legal/data-handling statements remain accurate; no unsupported verification dates or deletion promises.
8. Only then request review through the owner's AdSense account. Traffic and site age must not be presented as invented numeric approval thresholds. Search Console submission can aid discovery but does not guarantee AdSense approval.

## Official guidance checked

- [Page quality and navigation](https://support.google.com/adsense/answer/7299563?hl=en): original, relevant content and a useful visitor experience.
- [Connect a site and request review](https://support.google.com/adsense/answer/7584263?hl=en): supported verification methods, public access and crawler access.
- [Google CMP requirements](https://support.google.com/adsense/answer/13554020?hl=en-GB): certified CMP integration for applicable ad serving in the EEA, UK and Switzerland.

These sources support the listed checks, not a promise of acceptance.


## Production deployment follow-up

- Commit: `23b56fd`, pushed to `main`; GitHub Cloudflare Pages check: **success**.
- Deployment: `77ae74d4-6764-415f-9743-8cc5fa483666`; immutable URL: https://77ae74d4.daykit.pages.dev.
- Custom-domain homepage, About and Privacy now show PDF Converter with no ad loader.
- Live sitemap contains **74 URLs**. English publication metadata confirms six omitted converters and KCET noindex.
- `/hi/` redirects directly to `/` with 301; `/kn/tools/merge-pdf/` redirects directly to `/tools/merge-pdf/` with 301.
- Live deterministic image cancellation/offline-download and unsupported-engine checks passed. Node used the system trust store for HTTPS verification; certificate checks were not disabled.
- Production crawl checked **83 routes**: all 75 published HTML routes passed the status/branding/ad-loader checks. Two excluded URLs still returned old Daykit HTML with ads: `/tools/pdf-to-word/` and `/tools/word-to-pdf/`. The other four excluded routes returned 404.
- The immutable deployment and a cache-busted request return 404 for the old PDF-to-Word URL, while its normal custom-domain URL has an Age header and old seven-day shared-cache policy. This is evidence of stale cached content, not an omitted-file failure in the deployed build. The precise cache layer remains to be confirmed.
- Purging stale copies requires authenticated Cloudflare controls. The dashboard was opened but is at the login screen. No Cloudflare API credentials are configured locally.
- Artifacts: `qa-live-deployed.json` (initial redirect requests encountered a client error; later direct no-follow requests verified the two 301s), `qa-production-crawl.json`, `qa-image-cancellation.json`.
- AdSense account notices, ownership confirmation and resubmission remain unperformed; do not claim account approval or readiness until these and the stale-cache check are resolved.
