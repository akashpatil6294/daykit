# PDF Converter

PDF and image utilities, practical guides and calculators operated by Akash Patil, an independent developer in Bengaluru, India. Contact: pdfconverter.help@gmail.com.

## Run and verify

Use Node 24. Run `npm ci`, `npm run build`, `npm test`, and `node scripts/audit.mjs`. Preview with `npm run preview -- --host 127.0.0.1`. The site is static Astro with React tool workspaces.

## Publication settings

`PUBLIC_SITE_URL=https://pdf-converter.me` is the canonical origin. `PUBLIC_LOCALES=en` publishes English only; stored translation dictionaries are retained but unused. Legacy locale prefixes redirect to the corresponding English path.

Set `PUBLIC_CONVERTER_URL` to the real HTTPS Render endpoint ending in `/convert`. The build checks `/healthz`; absent or unsuccessful health checks omit all six remote conversion routes, remove their links and sitemap entries, and leave those URLs to the real 404 handler. A successful health check is liveness evidence, not a conversion quality guarantee. Retest all modes on the deployed service.

Unverified exam pages remain directly reachable with noindex, but are not advertised or included in the sitemap. Preserve honest specification labels until authoritative source records are verified.

## Processing and advertising

Image and local PDF operations run in browser workers. The six Office/PDF conversions use Render after explicit file-upload consent. Temporary cleanup is attempted; immediate or complete deletion is not guaranteed. Cloudflare Pages serves the frontend. Confirm provider log retention and processing regions separately.

Advertising and analytics are disabled. No cookie overlay or advertising loader is shipped. Before enabling AdSense, integrate and verify a Google-certified CMP for relevant EEA, UK and Swiss traffic, update privacy disclosures and use actual approved account values. Approval is not guaranteed.

## Deployment

Cloudflare Pages: Node 24, build `npm run build`, output `dist`. Render: use the converter Dockerfile, port 8000, health `/healthz`, and exact allowed origins in `PUBLIC_SITE_URL` and `CORS_ORIGINS`. Do not use wildcard origins. Consult converter/README.md and the verification reports for tests, limits and licensing review. Commit, push and deployment require operator approval.
