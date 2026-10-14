# Pre-launch audit — 13 October 2026

## Result and scope

Phases 4–8 are implemented in the local static site. Production build passes Astro/TypeScript with zero errors, warnings or hints. There are 441 generated HTML files: 63 English pages including 404, mirrored into six regional languages. The sitemap contains 434 indexable URLs; seven 404 files are excluded. Advertising remains inactive.

This is a local implementation audit, not certification of legal compliance, translation accuracy, AdSense approval or performance on every device. Operator details, real domain configuration and content verification remain explicit launch tasks in `PRE-LAUNCH-CHECKLIST.md`.

## Automated and browser checks

- Static crawl after category cleanup: all 441 HTML pages checked for unique titles/descriptions, canonical paths, internal URLs/fragments, heading order, alt attributes, parseable structured data and inbound links. Zero reported structural issues. Hreflang and x-default targets are checked separately for every indexed page.
- Content: all seven image tools and six PDF tools have 300+ words, steps and FAQs; all ten calculators have 400+ words and five FAQs. All twenty guides have 800+ words including their FAQs. Every tool and calculator has inbound links from at least two distinct guides. All tool pages include three or more related links.
- Unit/static tests: 16 Node tests plus 10 Vitest finance cases. Category-removal checks cover all seven route variants and orphan translation keys. Finance checks cover EMI, SIP, FD frequencies, RD timing, amortization, prepayment, GST reversal, percentages, calendar dates, zero rates, one-month terms and large/invalid values.
- Browser accessibility after category cleanup: 12 pages spanning home, indexes, image/PDF tools, exam workspace, calculator, guide, policy and three localized examples. Axe WCAG A/AA checks reported no violations; no mobile overflow or uncaught page errors. Keyboard focus and all four ad sizes were checked. This supplements rather than replaces human assistive-technology testing.
- Six regional-language calculator interaction checks passed earlier, including page-preserving switching and no hydration errors. Final localized PDF, article and age pages also passed the browser audit.
- All six PDF operations passed with a 30-page fixture. A real encrypted fixture was rejected with a clear password-protection message in both pdf-lib and PDF.js paths. Corrupted input also produced a clear error.
- A generated noisy scanned form of 6,007,712 bytes compressed to 155,328 bytes. Its mobile preview was visually inspected: reference numbers, names and lines remained legible. This controlled fixture does not establish readability for arbitrary documents.

## Mobile Lighthouse sample

Local production preview, Chromium, Lighthouse mobile emulation. Scores are point-in-time lab results. Every row had accessibility 100, SEO 100 and CLS 0.

| Page | Performance |
| --- | ---: |
| Home | 91 |
| Tools index | 100 |
| Image KB resizer | 99 |
| PDF compressor | 100 |
| SSC workspace | 100 |
| EMI calculator | 98 |
| Guides index | 100 |
| EMI guide | 100 |
| Privacy policy | 100 |
| Hindi PDF compressor | 96 |

Mobile ad reservations measured 320×122 for leaderboard, 300×272 for in-content, 300×622 for sidebar and 320×72 for sticky-mobile. Empty slots retain their space. No ad-network script is loaded.

## Issues fixed

| Finding | Resolution |
| --- | --- |
| Translated React text had incorrect character decoding | Kept UTF-8 declaration before the embedded locale dictionary. |
| Compact lakh labels differed between static HTML and hydration | Rendered numeric and translated unit fragments consistently. |
| Tamil navigation overflowed a narrow viewport | Allowed navigation wrapping; verified all six languages. |
| Homepage decorative numbers had insufficient contrast | Darkened number text; final accessibility audit passes. |
| 404 canonical and language links pointed to nonexistent trailing-slash pages | Normalized 404 routes to their actual `.html` paths. |
| Hindi and Marathi disclaimer titles matched | Added native language names to localized document/OG titles. |
| Translated article structured data retained the English page URL | Localized `mainEntityOfPage`; retained English body language intentionally. |
| Home/about/privacy/terms described completed features as future work | Updated feature availability, calculator limits and local PDF processing. |
| No clear future ad activation location | Added disabled `src/config/ads.ts`, empty `AdIntegration.astro` insertion point and comments-only `ads.txt`. |
| PDF library API differed from an older integration assumption | Updated loading-task cleanup and configuration to installed PDF.js. |
| Type checking traversed generated vendor JavaScript | Excluded public assets from maintained-source TypeScript checks. |
| Exam browser test cleanup removed localized output | Restored localization after the test restores the real exam JSON. |

## Remaining issues and reasons

1. **Operator/contact/legal facts are incomplete.** These cannot be invented. Contact is intentionally short and visibly pending. About, terms and disclaimer are concise substantive pages, not 300-word tool pages; their final legal scope needs the real operator and hosting details. Complete them before launch rather than padding them with generic prose.
2. **All seeded exam specifications remain unverified.** The user will supply official values and source records. Unknown values remain null and warnings remain visible. No acceptance guarantee is made.
3. **Machine translations need fluent review.** Structural coverage is complete, but terminology can be awkward or inaccurate. Files are marked unreviewed. Guide bodies remain English by the explicit phase requirement; localized pages state this and mark body language correctly.
4. **Physical mobile performance remains unverified.** PDF parsing and assembly use workers, while page drawing is cooperatively scheduled. The 30-page test's maximum heartbeat gap was 511 ms for PDF-to-images startup and 138 ms for compression. Low-end phones can be slower or encounter memory limits; the UI has size/page limits and cancellation. A universal “never freezes” claim is not justified.
5. **Lighthouse still reports optimization opportunities.** Shared React/consent code contributes unused JavaScript and ordinary stylesheet requests remain on the render path. Home had 380 ms total blocking time in this sample. All requested score/CLS thresholds passed, so these are documented improvements rather than hidden acceptance failures. Indic fonts use self-hosted subsets, inline font declarations and swap; sampled font loading caused no measured CLS.
6. **Production hosting is not configured or audited.** Canonicals currently use the local configured origin. Set the real HTTPS origin and repeat routing, caching, Search Console and Lighthouse checks after deployment.
7. **Ad consent and AdSense activation remain future integrations.** The existing preference banner is not a certified CMP. No actual ad request or seller authorization is present. Review Google's current requirements before activation; see the linked checklist sources. Real ads require another layout/consent audit.
8. **Backend features remain outside these phases.** The site is fully static with no database connection.

## Reproduce

Run `npm ci`, `npm run build`, `npm test`, then `node scripts/audit.mjs`. Start `npm run preview -- --host 127.0.0.1`. Set `CHROMIUM_PATH` and run `tests/audit-browser.mjs`, `tests/pdf-protection-browser.mjs`, `tests/pdf-browser.mjs`, or `tests/locales-browser.mjs` with Node. Set comma-separated `AUDIT_ROUTES` for `tests/lighthouse.mjs`. Raw `qa-*.json` and screenshots are local ignored artifacts; this report preserves the reviewed outcomes.
