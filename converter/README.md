# PDF Converter converter service

High-fidelity conversion behind one endpoint, used by the six PDF Converter
conversion tools (PDF→Word, PDF→PowerPoint, PDF→Excel, Word→PDF,
PowerPoint→PDF, Excel→PDF). The static site calls it only after an
explicit consent checkbox. Temporary job files are cleaned up after processing;
interruptions or filesystem failures can delay deletion.

## Endpoints

- `POST /convert` — multipart form: `file`, `mode` (one of
  `pdf-to-word`, `pdf-to-powerpoint`, `pdf-to-excel`, `word-to-pdf`,
  `powerpoint-to-pdf`, `excel-to-pdf`), `fidelity` (`editable` default,
  `exact` for the rasterized PDF→PowerPoint look). Returns the converted
  file with its real content type, and `X-OCR-Applied: true` when a
  scanned PDF went through OCR.
- `GET /healthz` — `{ "ok": true, "engine": "<name>" }`.

## Engines

`converter/engines.py` defines the `Engine` adapter interface.
`LocalEngine` (default, `CONVERTER_ENGINE=local`) converts in an isolated worker process:

- Office→PDF: headless LibreOffice
- PDF→DOCX: pdf2docx (layout-preserving)
- PDF→PPTX: editable mode — text boxes and images positioned from PDF
  coordinates via PyMuPDF; `fidelity=exact` keeps the old rasterized
  "looks identical" mode with one page image per slide
- PDF→XLSX: table detection via PyMuPDF `find_tables`, written with
  openpyxl (a plain text-line fallback fills sheets when no tables exist)
- Scanned PDFs (no text layer): OCRmyPDF runs first; the response carries
  `X-OCR-Applied: true`

`ManagedApiEngine` is a skeleton for swapping in a paid API without
changing the site: set `CONVERTER_ENGINE=adobe|convertapi|cloudconvert`
and the matching key env var (`ADOBE_CLIENT_ID`+`ADOBE_CLIENT_SECRET`,
`CONVERTAPI_SECRET`, or `CLOUDCONVERT_API_KEY`). The key stays
server-side only; it is never sent to the browser. Implement
`ManagedApiEngine.convert()` for your provider's SDK/REST calls, pin the
SDK version in `requirements.txt`, redeploy, and keep `LocalEngine` as
the fallback.

## Run locally

```bash
cd converter
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
PUBLIC_SITE_URL=http://localhost:4321 .venv/bin/uvicorn converter.main:app --port 8000
```

Then set `PUBLIC_CONVERTER_URL=http://localhost:8000/convert` when running
the Astro site. LibreOffice (`soffice`), tesseract and ocrmypdf must be
installed for the Office and OCR paths.

### Troubleshooting Office -> PDF

If Word/PowerPoint/Excel to PDF fails while PDF -> Office works, LibreOffice
is not starting inside the container. Check:

```powershell
# Find the container name, then:
docker exec <name> soffice --headless --version
docker logs <name> | Select-String "daykit"
```

- `soffice: not found` -> the image was built without LibreOffice; rebuild
  from `converter/` with `docker build -t daykit-converter .`.
- `User installation could not be completed` -> LibreOffice has no writable
  HOME. The fixed Dockerfile creates the `converter` user with a home
  directory; rebuild the image.
- `[daykit] libreoffice failed` in the logs shows LibreOffice's real stderr.

The Dockerfile runs `soffice --headless --version` as the `converter` user
at build time, so a broken image fails the build instead of failing at
runtime.

## Deploy

Run one instance; scale by adding instances behind your proxy.

- **Fly.io**: `fly launch --no-deploy` (keeps the included `fly.toml`:
  port 8000, `/healthz` check, 2 shared CPUs, 2 GB RAM, Mumbai region,
  concurrency limits matching `CONVERTER_CONCURRENCY=2`), then
  `fly secrets set PUBLIC_SITE_URL=https://daykit.example`, `fly deploy`.
- **Cloud Run**: `gcloud run deploy daykit-converter --source . --memory 2Gi
  --cpu 2 --concurrency 2 --timeout 180s --max-instances 3
  --set-env-vars PUBLIC_SITE_URL=...`. Cold starts run LibreOffice once
  per instance; keep `--min-instances 1` if latency matters.
- **VPS**: `docker build -t daykit-converter .` then
  `docker run -d --restart unless-stopped --memory 2g --cpus 2 -p 127.0.0.1:8000:8000
  -e PUBLIC_SITE_URL=https://daykit.example daykit-converter`
  behind nginx/Caddy terminating TLS with `client_max_body_size 26m`.

## Environment

| Variable | Default | Meaning |
|---|---|---|
| `PUBLIC_SITE_URL` | (required in prod) | Exact site origin; becomes a CORS allow-list entry |
| `CORS_ORIGINS` | from `PUBLIC_SITE_URL` | Comma-separated extra origins |
| `CONVERTER_ENGINE` | `local` | `local`, `adobe`, `convertapi`, `cloudconvert` |
| `CONVERTER_MAX_BYTES` | 25165824 (25 MB) | Input cap; larger uploads get 413 |
| `CONVERTER_MAX_PAGES` | 100 | PDFs above this get 413 |
| `RATE_LIMIT_PER_MINUTE` | 30 | Per-IP request budget |
| `CONVERTER_CONCURRENCY` | 2 | Simultaneous conversions; extra requests get 429 |
| `JOB_TIMEOUT_SECONDS` | 120 | Per-job cap; timeouts get 504 |
| `CONVERTER_TMP` | system tmp | Root for per-job tmp dirs |

## Service rules (enforced)

- HTTPS only in production (http allowed solely for localhost dev).
- Uploaded filenames are ignored; every job gets a generated tmp dir.
- Input/output tmp data is deleted immediately after the response
  (and on failure/timeout); a background sweep removes anything older
  than 10 minutes.
- No file names, contents, or document text are logged (uvicorn runs
  with `--no-access-log`).
- Macro-enabled Office files and oversized OOXML packages are rejected.

## Monitoring and cost limits

- Alert on `/healthz` (5xx or latency), 429/504 rates, and tmp-dir disk
  usage. The 10-minute sweep plus per-job deletion bounds disk growth;
  still cap the container disk (e.g. 10 GB) so a stuck job cannot fill it.
- Cost limits: keep `--max-instances` low (each instance runs LibreOffice
  and OCR, ~1–2 GB RAM); set `CONVERTER_CONCURRENCY` to match CPU
  (2 vCPU ≈ 2). For a managed engine, set the provider's own usage quota
  and watch its dashboard — per-conversion pricing can spike with 100-page
  PDFs, so consider lowering `CONVERTER_MAX_PAGES` there.
- OCRmyPDF is the slowest path (~1–2 s/page); the 120 s timeout bounds it.

## Quality checks

- `converter/.venv/bin/python -m pytest converter/test_service.py -q` — direct
  service tests: all six modes, 413 on oversize, 413 on >100 pages, 422 on
  password-protected input, CORS rejection, unknown mode, `/healthz`, and the
  scanned-PDF path (expects `X-OCR-Applied` when ocrmypdf is installed, else
  the honest 422).
- `converter/.venv/bin/python scripts/converter-quality.py [--url <service>]` —
  converts the fixtures in `tests/fixtures/convert/`, renders outputs back to
  page images (LibreOffice to PDF first for Office outputs), compares page
  counts and visual similarity, writes `qa-converter-report.json`. Without
  `--url` it uses the local engine directly; with an unreachable `--url` it
  skips with a clear message (exit 0). Exits non-zero on page-count mismatch.

## Licence note

pdf2docx is GPL-3.0 and PyMuPDF is AGPL-3.0: running this service for
the public is conveying the software over a network, which triggers the
AGPL obligations for PyMuPDF and the GPL obligations for pdf2docx.
Read the "Converter service licences" section of the repo-root README
before hosting; switching to a managed engine removes those libraries
from the deployment.

## Job isolation and deployment verification

Each job uses a separate Python worker process. On Linux (including Render),
a timeout kills the entire process group before releasing its concurrency slot
and deleting the temporary directory. The stale-folder sweep excludes active jobs.
On Windows, timeout termination only guarantees the Python worker is stopped;
validate the Linux container before deploying. Office ZIP archives are bounded to
10,000 entries and 200 MiB expanded data, and unsafe member paths are rejected.
Office-to-PDF output is checked against the same PDF page limit.

The dependency file is version-pinned but not hash-locked. Docker installs it
normally; it no longer silently falls back after a failed hash-verification attempt.
A fully hashed lock and image vulnerability scanning remain deployment work.

## Verified test environment (16 October 2026)

See `../BACKEND-VERIFICATION.md` for this continuation's measured results and
review/deployment commands. Test the Linux image rather than assuming the Windows
host has its dependencies. The existing Dockerfile installs LibreOffice; the host
needs a separate installation. `pdf2docx` was already declared correctly.

OCRmyPDF 16.7 requires pikepdf's `Pdf.check()` API; pikepdf 10 removed it.
`requirements.txt` now pins pikepdf 9.11.0, and the build checks the API exists.
Keep the scanned-PDF service test when updating either package. `pip check` alone
does not detect this API incompatibility. Direct dependency versions are pinned,
but transitive dependencies and the base image still need a reproducible lock and
ongoing security updates.

For optional Windows-host testing (not required when testing in Docker):

```powershell
py -3.12 -m venv converter/.venv
converter/.venv/Scripts/python -m pip install -r converter/requirements.txt
winget install --id TheDocumentFoundation.LibreOffice --exact
$env:Path = "C:\Program Files\LibreOffice\program;" + $env:Path
Set-Location converter
.venv/Scripts/python -m pytest test_service.py -q
```

OCR also needs Tesseract and Ghostscript installed and on PATH for host tests.
The Docker image includes these. No host package or system installation was
performed by this continuation. On Windows, prefer Docker for process-group
termination guarantees and production parity.
