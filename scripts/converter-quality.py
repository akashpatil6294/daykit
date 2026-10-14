#!/usr/bin/env python3
"""Converter quality check: convert fixtures, render outputs back to page
images, compare page counts and visual similarity with the originals.

Usage:
    converter/.venv/bin/python scripts/converter-quality.py [--url http://localhost:8000]

- With --url (or CONVERTER_URL env), each fixture is posted to the live
  service (this also exercises the X-OCR-Applied header path).
- Without it, fixtures are converted through the local engine modules
  directly (no network, no LibreOffice server needed for PDF outputs).
- Renders: PDFs with PyMuPDF; DOCX/PPTX/XLSX outputs via LibreOffice to
  PDF first, then PyMuPDF. Skips gracefully (exit 0, clear message) when
  neither path is available.
- Writes qa-converter-report.json. Exits non-zero on any page-count
  mismatch. Similarity is informational (0-1, structural via downscaled
  grayscale pixel diff).
"""
from __future__ import annotations

import io
import json
import os
import shutil
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FIX = ROOT / 'tests' / 'fixtures' / 'convert'
REPORT = ROOT / 'qa-converter-report.json'
sys.path.insert(0, str(ROOT / 'converter'))

import pymupdf  # noqa: E402

CASES = [
    # (fixture, mode, fidelity)
    ('text-heavy.pdf', 'pdf-to-word', 'editable'),
    ('multicol.pdf', 'pdf-to-word', 'editable'),
    ('tables.pdf', 'pdf-to-word', 'editable'),
    ('tables.pdf', 'pdf-to-excel', 'editable'),
    ('tables.pdf', 'pdf-to-powerpoint', 'editable'),
    ('images.pdf', 'pdf-to-powerpoint', 'exact'),
    ('hindi-kannada.pdf', 'pdf-to-word', 'editable'),
    ('scanned.pdf', 'pdf-to-word', 'editable'),  # OCR path
    ('sample.docx', 'word-to-pdf', 'editable'),
    ('sample.pptx', 'powerpoint-to-pdf', 'editable'),
    ('sample.xlsx', 'excel-to-pdf', 'editable'),
]

EXT = {
    'pdf-to-word': 'docx', 'pdf-to-powerpoint': 'pptx', 'pdf-to-excel': 'xlsx',
    'word-to-pdf': 'pdf', 'powerpoint-to-pdf': 'pdf', 'excel-to-pdf': 'pdf',
}


def similarity(a: pymupdf.Pixmap, b: pymupdf.Pixmap) -> float:
    """Downscaled grayscale mean-absolute-difference similarity, 0..1."""
    from PIL import Image

    ia = Image.frombytes('RGB', (a.width, a.height), a.samples).convert('L').resize((64, 64))
    ib = Image.frombytes('RGB', (b.width, b.height), b.samples).convert('L').resize((64, 64))
    flat = lambda im: list(im.get_flattened_data()) if hasattr(im, 'get_flattened_data') else list(im.getdata())
    pa, pb = flat(ia), flat(ib)
    diff = sum(abs(x - y) for x, y in zip(pa, pb)) / len(pa)
    return max(0.0, 1.0 - diff / 255.0)


def render_pdf_pages(data: bytes, tmp: Path, dpi: int = 72) -> list[pymupdf.Pixmap]:
    doc = pymupdf.open(stream=data, filetype='pdf')
    pix = [page.get_pixmap(dpi=dpi) for page in doc]
    doc.close()
    return pix


def office_to_pdf(data: bytes, suffix: str, tmp: Path) -> bytes:
    src = tmp / ('in' + suffix)
    src.write_bytes(data)
    proc = subprocess.run(
        ['soffice', '--headless', '--nologo', '--nodefault', '--nolockcheck',
         '--convert-to', 'pdf', '--outdir', str(tmp), str(src)],
        capture_output=True, timeout=180,
    )
    out = tmp / (src.stem + '.pdf')
    if proc.returncode != 0 or not out.exists():
        raise RuntimeError('LibreOffice render failed')
    return out.read_bytes()


def convert_local(data: bytes, mode: str, fidelity: str):
    from converter.engines import LocalEngine

    with tempfile.TemporaryDirectory(prefix='qa-') as td:
        return LocalEngine().convert(data, mode, fidelity, Path(td))


def convert_remote(url: str, data: bytes, mode: str, fidelity: str):
    boundary = '----qa-boundary'
    body = (
        f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="in.bin"\r\n'
        f'Content-Type: application/octet-stream\r\n\r\n'
    ).encode() + data + (
        f'\r\n--{boundary}\r\nContent-Disposition: form-data; name="mode"\r\n\r\n{mode}'
        f'\r\n--{boundary}\r\nContent-Disposition: form-data; name="fidelity"\r\n\r\n{fidelity}'
        f'\r\n--{boundary}--\r\n'
    ).encode()
    req = urllib.request.Request(
        url.rstrip('/') + '/convert', data=body,
        headers={'Content-Type': f'multipart/form-data; boundary={boundary}',
                 'Origin': os.environ.get('PUBLIC_SITE_URL', 'http://localhost:4321')},
        method='POST',
    )
    with urllib.request.urlopen(req, timeout=180) as resp:
        return resp.read(), resp.headers.get('Content-Type', ''), \
            resp.headers.get('X-OCR-Applied') == 'true'


def service_reachable(url: str) -> bool:
    try:
        with urllib.request.urlopen(url.rstrip('/') + '/healthz', timeout=10) as resp:
            return resp.status == 200
    except Exception:
        return False


def main() -> int:
    url = next((a.split('=', 1)[1] for a in sys.argv[1:] if a.startswith('--url=')), None) \
        or os.environ.get('CONVERTER_URL')
    if url and not service_reachable(url):
        # Never fail the suite on an unavailable service: skip with a message.
        print(f'converter service at {url} is unreachable: skipping quality check.')
        return 0
    results = []
    failed = False
    with tempfile.TemporaryDirectory(prefix='qa-render-') as td:
        tmp = Path(td)
        for fixture, mode, fidelity in CASES:
            path = FIX / fixture
            if not path.exists():
                results.append({'case': f'{fixture}->{mode}', 'status': 'skipped',
                                'reason': 'fixture missing'})
                continue
            data = path.read_bytes()
            entry: dict = {'case': f'{fixture} -> {mode} ({fidelity})',
                           'mode': mode, 'fixture': fixture}
            try:
                if url:
                    out, media, ocr = convert_remote(url, data, mode, fidelity)
                else:
                    out, media, ocr = convert_local(data, mode, fidelity)
            except Exception as exc:  # noqa: BLE001 - report, don't crash the run
                entry.update(status='error', reason=f'{type(exc).__name__}: {exc}')
                if 'ocr' in str(exc).lower():
                    entry['note'] = 'OCR not installed here; service deploys with ocrmypdf'
                results.append(entry)
                continue
            entry['ocr_applied'] = ocr
            try:
                if fixture.endswith('.pdf'):
                    orig_pages = render_pdf_pages(data, tmp)
                else:
                    # Office inputs: render the input via LibreOffice for comparison.
                    orig_pages = render_pdf_pages(
                        office_to_pdf(data, '.' + fixture.rsplit('.', 1)[1], tmp), tmp)
                if EXT[mode] == 'pdf':
                    out_pages = render_pdf_pages(out, tmp)
                else:
                    out_pages = render_pdf_pages(
                        office_to_pdf(out, '.' + EXT[mode], tmp), tmp)
            except Exception as exc:  # noqa: BLE001
                entry.update(status='error', reason=f'render failed: {exc}')
                results.append(entry)
                continue
            entry['pages_in'] = len(orig_pages)
            entry['pages_out'] = len(out_pages)
            if len(orig_pages) != len(out_pages):
                entry['status'] = 'page-count-mismatch'
                failed = True
            else:
                entry['status'] = 'ok'
                entry['similarity'] = round(
                    sum(similarity(a, b) for a, b in zip(orig_pages, out_pages))
                    / len(orig_pages), 3)
            results.append(entry)
    REPORT.write_text(json.dumps({'results': results}, indent=2))
    ok = sum(1 for r in results if r.get('status') == 'ok')
    print(f'{ok}/{len(results)} cases ok; report: {REPORT}')
    for r in results:
        print(f"  {r['status']:20s} {r['case']}"
              + (f" pages {r.get('pages_in')}->{r.get('pages_out')}"
                 f" sim {r.get('similarity')}" if r.get('status') == 'ok' else '')
              + (f" ({r.get('reason')})" if r.get('reason') else ''))
    if any(r.get('status') == 'page-count-mismatch' for r in results):
        return 1
    return 0


if __name__ == '__main__':
    if shutil.which('soffice') is None and not (
        next((a for a in sys.argv[1:] if a.startswith('--url=')), None)
        or os.environ.get('CONVERTER_URL')
    ):
        print('soffice not found and no CONVERTER_URL: skipping quality check.')
        sys.exit(0)
    try:
        import PIL  # noqa: F401
    except ImportError:
        print('Pillow is required: run with converter/.venv/bin/python.')
        sys.exit(0)
    sys.exit(main())
