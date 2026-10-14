# Daykit launch checklist

The code is a static preview, not a declaration that the site is ready for AdSense approval. No advertising script or seller ID is active.

## Complete before public launch

- Set `PUBLIC_SITE_URL` to the final HTTPS domain and rebuild. Canonicals, OpenGraph URLs, hreflang and sitemap use this value. The local default is not a production domain.
- Set `PUBLIC_CONTACT_EMAIL` to a working address. Supply the real operator identity, jurisdiction and privacy-request details in `src/i18n/en.ts`; update all translations afterward. The current contact/legal pages explicitly disclose these missing details.
- Identify the chosen hosting provider and describe its actual network-log, retention and transfer practices in the privacy policy. Have the final legal text reviewed for the operator's circumstances; no invented operator facts have been inserted.
- Check each exam's current official notification. `data/exams.json` now holds 10 records (9 verified 2026-10-14 with source URL and verification date); re-verify against the next cycle's notice when published — `node scripts/check-exam-freshness.mjs` flags records older than 90 days. KCET specs still need a human inside the live KEA application form (see `EXAM-DATA-TODO.md`). Only set `verified: true` for fields confirmed on the official page.
- Deploy the `/converter` service before the six conversion tools can work: host on Fly.io (`fly launch`), Cloud Run (`gcloud run deploy --memory 2Gi --cpu 2 --concurrency 2 --max-instances 3 --timeout 180s`) or a VPS `docker run` behind nginx/Caddy with TLS and `client_max_body_size 26m`. Set `CORS_ORIGINS`/`PUBLIC_SITE_URL` to the exact site origin. Then rebuild the Astro site with `PUBLIC_CONVERTER_URL=https://<service-host>/convert`. Without it, the six converter tools show a clear error instead of converting.
- Monitor the converter in production: `/healthz`, 429/504 rates, tmp-disk usage; cap container disk; set provider usage quotas if using a managed engine (`CONVERTER_ENGINE`). See `converter/README.md` for engine switching, monitoring and cost limits. Licence notes for pdf2docx/PyMuPDF as a hosted service are in `README.md`.
- Have fluent reviewers check Hindi, Kannada, Tamil, Telugu, Marathi and Bengali dictionaries under `src/i18n/machine/`, especially financial terms, instructions and official names. Their metadata explicitly says machine-translated and unreviewed. Review any new or changed strings again after regeneration.
- Review the twenty English guides and calculator conventions. Example rates are not current offers. Replace the editorial byline only with an accurate identity; do not add fictional credentials or review claims.
- Test real Android and iOS devices with representative 10 MB images, HEIC files, scanned PDFs, encrypted PDFs and 30-page documents. Desktop mobile emulation does not establish performance on every phone. Check cancel, download, repeated jobs, orientation and low-memory behaviour.
- Inspect compressed PDFs page by page. A successful target-size result can still be unsuitable. Raster output loses selectable text, interactive forms, tags, links and signatures. Do not advertise universal readability at 100/200 KB.
- Test cookie preferences with storage disabled and with keyboard navigation. The development preference banner does not implement a certified advertising CMP.

## Deploy and inspect the real domain

1. Install locked dependencies with `npm ci`; run `npm run build` and `npm test`.
2. Publish `dist/` as a static site on Cloudflare Pages or Vercel. No server functions are needed for the static site itself; the six file-conversion tools additionally require the deployed `/converter` service (see above).
3. Check HTTPS, redirects, trailing-slash URLs, localized routes and host-level 404 behaviour. The local preview is not proof of production routing or caching.
4. Run `node scripts/audit.mjs` against the built output. Repeat browser checks and Lighthouse on the deployed domain; local scores can change with hosting and future ads.
5. Verify ownership in Google Search Console and submit the deployed `/sitemap.xml`. Inspect representative English and localized URLs, including reciprocal hreflang and canonical choices.
6. Confirm public contact and legal pages show completed information, not launch placeholders. Inspect the site while signed out on a second device.

## Before enabling AdSense

- Apply only after the public site and content have been reviewed. Approval and revenue are not guaranteed by this implementation.
- Use the account's real publisher ID and slot IDs in `src/config/ads.ts`. There is no made-up sample ID.
- Integrate and test an appropriate Google-certified CMP before serving ads where required. The existing banner is only a development preference interface. See [Google's publisher consent requirements](https://support.google.com/adsense/answer/13554116?hl=en-GB).
- The sole future loader insertion point is `src/components/AdIntegration.astro`. It currently contains no loader and intentionally refuses an enabled configuration until the integration has been implemented and reviewed.
- Replace the comments in `public/ads.txt` with the exact record supplied by the account. See [Google's ads.txt guidance](https://support.google.com/adsense/answer/7532444).
- Retain the reserved dimensions in `AdSlot.astro` and its CSS. Never collapse an unfilled slot or cover primary controls. Repeat CLS, accessibility and consent checks with actual ads after approval.

## Ongoing maintenance

Keep source files and test fixtures private. Most tools process files locally in the browser, but the six conversion tools upload to the `/converter` service (deleted immediately after conversion). Downloaded documents remain on the visitor's device. Refresh PDF.js assets with `node scripts/pdf-assets.mjs` after a dependency upgrade. Rebuild translations after copy changes, review changed keys, and periodically recheck source-linked exam records.
