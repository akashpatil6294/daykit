# Daykit backend verification — 16 October 2026

## Outcome

Ready for a reviewed staging deployment of the verified converter image. Not an unconditional public-launch approval: the actual Render URL/environment, Cloudflare domain settings, resource sizing, provider privacy practices and licensing still require operator review. No commit, push, deployment, DNS change or production configuration change was made.

Existing frontend and legal-page changes were preserved. The Windows host remains without LibreOffice/pdf2docx; the complete suite passes in the intended Linux Docker environment, not on the unconfigured host.

## Original five failures: reproduced and diagnosed individually

| Test | Actual host traceback | Linux result |
| --- | --- | --- |
| test_word_to_pdf | `subprocess.run` cannot find `soffice`: WinError 2, wrapped as ConversionError | Passed |
| test_powerpoint_to_pdf | Same missing executable on the PPTX fixture | Passed |
| test_excel_to_pdf | Same missing executable on the XLSX fixture | Passed |
| test_pdf_to_word | `from pdf2docx import Converter`: ModuleNotFoundError | Passed |
| test_indic_pdf_to_word | Same missing import on the Hindi/Kannada fixture | Passed |

The host reproduction returned **13 passed, 5 failed**. Direct engine calls on each fixture confirmed the tracebacks above. LibreOffice and pdf2docx were already correctly declared in Docker; the new image installed them. No unnecessary application rewrite or host-wide package installation was needed.

The first Docker suite returned **17 passed, 1 failed**: OCRmyPDF 16.7 failed on scanned PDFs because pip selected pikepdf 10.17, which removed `Pdf.check()`. The raw OCR traceback showed that exact AttributeError. Pinned pikepdf 9.11.0, added a build-time API check and pip compatibility check, then rebuilt and retested. The existing scanned-PDF assertion was retained.

Upstream evidence: [pikepdf 10 breaking changes](https://pikepdf.readthedocs.io/en/stable/releasenotes/version10.html), [pikepdf 9.11.0 distribution](https://pypi.org/project/pikepdf/9.11.0/).

## Files changed in this continuation only

- `converter/requirements.txt`: pin compatible pikepdf 9.11.0; clarify tested dependency context.
- `converter/Dockerfile`: run pip check, use the current pymupdf import, assert OCR API compatibility and accurately label the dependency smoke check.
- `converter/test_service.py`: five additional checks for malformed input, missing origin, busy-service rejection, rate limiting and actual OS-process timeout/reaping/cleanup.
- `tests/converter-integration.py`: new real-HTTP integration runner for all six modes, OCR, malformed files, unsupported modes and origin controls.
- `converter/README.md`: explain the compatibility fix, host-versus-container dependencies and optional Windows installation commands.
- `LAUNCH-REVIEW.md`: link to this newer verification checkpoint; earlier historical results retained.
- `BACKEND-VERIFICATION.md`: this report.

No frontend source, legal-page source, canonical setting, dependency assertions or existing container/image was overwritten in this continuation.

## Executed checks

| Check | Result |
| --- | --- |
| Host Python 3.11 service suite before changes | 13 passed / 5 failed; causes above |
| Initial fresh-tag Docker build | Passed; package installation ran, base/apt layers reused |
| Initial Docker service suite | 17 passed / 1 OCR failure, diagnosed and fixed |
| Corrected Docker build | Passed, including pip check and module/API smoke check |
| Final Docker backend suite | **23 passed, 0 failed**, 21.07 seconds |
| Frontend `npm run build` | Passed: 82 source pages, six locale variants; no TypeScript errors |
| Frontend `npm test` | **19 Node tests + 21 Vitest tests = 40 passed** |
| Actual HTTP health check | 200, `{"ok":true,"engine":"local"}`; no Origin needed |
| HTTP integration checks | All six modes, OCR and all rejection/preflight assertions passed |
| Temporary job folders after tests | Zero |
| Container startup logs | Normal startup, LibreOffice available, port 8000 listening; no startup failures |
| `git diff --check` | Passed; existing LF/CRLF notices only |
| Legal/contact HTML assertions | About, Contact, Privacy, Terms and Disclaimer contain supplied identity/email; no pending-identity banner |

Backend pytest emits one Starlette TestClient/httpx deprecation warning. Existing frontend unused-variable hints and a mixed import bundling warning remain. Tests were not skipped or weakened. Prior browser and large site audits were not rerun because their frontend source remained unchanged.

Verified environment: Python 3.12.15, LibreOffice 25.2.3.2, pdf2docx 0.5.13, PyMuPDF 1.28.2, OCRmyPDF 16.7.0, pikepdf 9.11.0.

Final test image: `daykit-converter-test:20261016-verified`

Image ID: `sha256:ab54cd3826fc4750f1a9ca82337dec33a9695d384b85c9b96932128c9c8d6856`

Both temporary test containers were stopped and removed after checking cleanup/logs. Test images were retained. The original `daykit-converter` remains in its original stopped state; `daykit-converter:latest` was not changed.

## Individual real HTTP conversion results

These requests crossed the published localhost port into Uvicorn; they were separate from FastAPI TestClient tests. ZIP outputs were parsed, checked for the expected Office member and checked for ZIP corruption. PDF outputs were opened with PyMuPDF and checked for a valid bounded page count.

| Mode | Status | Output bytes |
| --- | --- | ---: |
| PDF to Word | 200 | 37,128 |
| PDF to PowerPoint | 200 | 30,105 |
| PDF to Excel | 200 | 5,963 |
| Word to PDF | 200 | 25,558 |
| PowerPoint to PDF | 200 | 15,207 |
| Excel to PDF | 200 | 16,743 |
| Scanned PDF → OCR → Word | 200 + X-OCR-Applied:true | 197,822 |

Malformed PDF/Office and unsupported mode returned 422. Missing/forbidden Origin returned 403. Both intended production origins returned 204 preflight responses with the matching allow-origin header. These small fixtures verify functionality, not fidelity for every real document or all scripts/languages; OCR and reconstructed layouts still need user review.

## Security and launch review

Origin allowlisting remains enabled; PUBLIC_SITE_URL is merged with trimmed CORS_ORIGINS. Tested configuration allows https://daykit.pages.dev and https://pdf-converter.me, with no wildcard. Size/page limits, archive/path checks, rate limiting and concurrency admission remain intact. Existing tests cover oversize uploads, excess pages and password protection. New tests confirm busy/rate rejection and a real timed-out process is reaped before its slot/job folder is released. Application errors remain generic; no traceback was returned in HTTP checks.

Local public configuration contains only site/contact/converter endpoint values, not server credentials. The actual Render environment was not accessed. CORS is not authentication; non-browser callers can forge Origin. Resource limits, trusted proxy/IP handling and sustained abuse/load tests remain production operations work. The image is not a complete sandbox for malicious native-parser input; maintain dependencies, platform isolation and resource limits.

Direct versions are pinned, but there is not yet a complete hashed transitive lock or pinned base digest. This run did not perform a container vulnerability scan. The existing GPL/AGPL notices need qualified licensing review for the chosen deployment; no legal conclusion is implied.

Reviewed pages accurately identify Akash Patil, individual developer, India, akashpatil6294@gmail.com. Browser processing and remote conversion are distinguished. Temporary storage and possible delayed cleanup are disclosed, as are browser preferences, external fonts and provider metadata. Advertising and analytics remain disabled. Provider retention/regions/transfers and legal terms still need human confirmation. No AdSense approval is guaranteed.

## Domain findings and external configuration

Both HTTPS hostnames served the Daykit title and canonical https://pdf-converter.me/ using the system HTTPS client. DNS authority is Cloudflare; the apex does not expose a CNAME (consistent with flattening, but not proof of a specific Pages project). A Python urllib request received 403, while curl retrieved the actual pages. Public evidence supports a live custom domain, but private Pages project attachment/Active status was not inspected.

The local fallback remains https://daykit.pages.dev, as requested. Before deployment, explicitly reconcile this with the already-live custom-domain canonical; do not deploy the fallback accidentally over an intended custom-domain setting.

### Cloudflare Pages, after approval

1. Open the existing project and verify Custom domains → pdf-converter.me is Active on this project. Do not change DNS or nameservers based only on a public response.
2. Confirm the intended primary hostname. If pdf-converter.me is confirmed, set PUBLIC_SITE_URL=https://pdf-converter.me in build settings; otherwise retain https://daykit.pages.dev. Keep both hosts reachable. No automatic redirect is proposed here.
3. Set PUBLIC_CONTACT_EMAIL=akashpatil6294@gmail.com. Set PUBLIC_CONVERTER_URL to the verified Render HTTPS endpoint ending in /convert; the actual backend hostname is still required.
4. Use Node 24, package root containing astro.config.mjs, build command npm run build and output dist. Review the diff and approved commit before using the existing Pages deployment workflow.
5. Check both origins, canonical URLs, robots/sitemap and real conversions after deployment.

### Render, after approval

1. Confirm the existing service uses root directory converter with Dockerfile Dockerfile (equivalently repository-root context converter). Deploy the approved commit through that service; do not replace resources blindly.
2. Set CONVERTER_ENGINE=local, PUBLIC_SITE_URL to the approved primary origin, CORS_ORIGINS=https://daykit.pages.dev,https://pdf-converter.me, CONVERTER_CONCURRENCY=2 and JOB_TIMEOUT_SECONDS=120. Do not publish secrets in PUBLIC_* values.
3. Keep port 8000, one Uvicorn worker and /healthz health path. Health does not need Origin, but only proves API liveness; perform real conversion checks as well.
4. Choose and verify memory/CPU capacity, proxy settings and abuse controls. Verify all six modes and OCR, inspect logs and cleanup, then supply the confirmed service URL to Pages.

## Reproduce the verified Docker checks

Run from `C:/Users/akash/Downloads/daykit (3)/daykit/merge_pdf`. Use an unused image tag, container name and localhost port for another run. Commands below use a new `-review` name; confirm it does not already exist before running.

```powershell
docker build -t daykit-converter-test:review ./converter
docker run -d --name daykit-converter-review -p 127.0.0.1:18018:8000 -e PUBLIC_SITE_URL=https://daykit.pages.dev -e CORS_ORIGINS=https://pdf-converter.me --mount "type=bind,source=$($PWD.Path),target=/verification,readonly" daykit-converter-test:review
docker exec -e PUBLIC_SITE_URL=https://daykit.example -e CORS_ORIGINS=https://daykit.example -e PYTHONPATH=/app daykit-converter-review python -m pytest /verification/converter/test_service.py --import-mode=importlib -p no:cacheprovider -q
docker exec daykit-converter-review python /verification/tests/converter-integration.py http://127.0.0.1:8000
docker logs daykit-converter-review
docker stop daykit-converter-review
docker rm daykit-converter-review
```

The integration script can also run from a host with httpx and PyMuPDF against the mapped port. Optional host installation commands are in converter/README.md; do not confuse that environment with the image.

## Git review commands (no commit/push/deploy executed)

```powershell
Set-Location -LiteralPath 'C:\Users\akash\Downloads\daykit (3)\daykit\merge_pdf'
git status --short
git diff --check
git diff --stat
git diff -- converter/Dockerfile converter/requirements.txt converter/test_service.py converter/README.md
git diff
Get-Content tests/converter-integration.py
Get-Content BACKEND-VERIFICATION.md
```

`git diff` does not include untracked files: inspect all entries in `git status`, including prior-session new files, before staging. Commit/push/deployment remain subject to your explicit approval.
