"""Direct tests of the converter service: uvicorn is not needed.

Run:  converter/.venv/bin/python -m pytest converter/test_service.py -q

Needs: LibreOffice (`soffice`) on PATH for the Office -> PDF modes.
OCR paths are exercised only when the `ocrmypdf` and `tesseract` binaries
exist; otherwise the scanned-PDF test asserts the honest 422.
"""
from __future__ import annotations

import io
import os
import shutil
import zipfile

os.environ.setdefault('PUBLIC_SITE_URL', 'https://daykit.example')

import pymupdf  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from converter.main import app  # noqa: E402

FIX = os.path.join(os.path.dirname(__file__), '..', 'tests', 'fixtures')
CONVERT = os.path.join(FIX, 'convert')
ORIGIN = 'https://daykit.example'

client = TestClient(app)


def post(name: str, mode: str, origin: str = ORIGIN, fidelity: str = 'editable'):
    path = os.path.join(CONVERT, name)
    with open(path, 'rb') as fh:
        return client.post(
            '/convert',
            files={'file': (name, fh, 'application/octet-stream')},
            data={'mode': mode, 'fidelity': fidelity},
            headers={'Origin': origin},
        )


def test_healthz():
    r = client.get('/healthz')
    assert r.status_code == 200
    assert r.json()['ok'] is True
    assert r.json()['engine'] == 'local'


def test_word_to_pdf():
    r = post('sample.docx', 'word-to-pdf')
    assert r.status_code == 200, r.text
    assert r.headers['content-type'] == 'application/pdf'
    assert r.content.startswith(b'%PDF')


def test_powerpoint_to_pdf():
    r = post('sample.pptx', 'powerpoint-to-pdf')
    assert r.status_code == 200, r.text
    assert r.headers['content-type'] == 'application/pdf'
    assert r.content.startswith(b'%PDF')


def test_excel_to_pdf():
    r = post('sample.xlsx', 'excel-to-pdf')
    assert r.status_code == 200, r.text
    assert r.headers['content-type'] == 'application/pdf'
    assert r.content.startswith(b'%PDF')


def test_pdf_to_word():
    r = post('text-heavy.pdf', 'pdf-to-word')
    assert r.status_code == 200, r.text
    assert 'wordprocessingml' in r.headers['content-type']
    assert r.content.startswith(b'PK')
    with zipfile.ZipFile(io.BytesIO(r.content)) as zf:
        xml = zf.read('word/document.xml').decode('utf-8', 'ignore')
    assert 'Lorem ipsum' in xml


def test_pdf_to_powerpoint_editable():
    r = post('tables.pdf', 'pdf-to-powerpoint', fidelity='editable')
    assert r.status_code == 200, r.text
    assert 'presentationml' in r.headers['content-type']
    with zipfile.ZipFile(io.BytesIO(r.content)) as zf:
        slides = [n for n in zf.namelist() if n.startswith('ppt/slides/slide')]
    assert len(slides) == 2, slides


def test_pdf_to_powerpoint_exact():
    r = post('images.pdf', 'pdf-to-powerpoint', fidelity='exact')
    assert r.status_code == 200, r.text
    assert 'presentationml' in r.headers['content-type']
    with zipfile.ZipFile(io.BytesIO(r.content)) as zf:
        pics = [n for n in zf.namelist() if n.startswith('ppt/media/')]
    assert len(pics) >= 2, pics


def test_pdf_to_excel():
    r = post('tables.pdf', 'pdf-to-excel')
    assert r.status_code == 200, r.text
    assert 'spreadsheetml' in r.headers['content-type']
    with zipfile.ZipFile(io.BytesIO(r.content)) as zf:
        sheets = [n for n in zf.namelist() if n.startswith('xl/worksheets/sheet')]
        assert len(sheets) == 2, sheets
        strings = zf.namelist()
        blob = b''.join(
            zf.read(n) for n in strings if n in ('xl/sharedStrings.xml',) or n.startswith('xl/worksheets/')
        )
    assert b'Widget' in blob


def test_indic_pdf_to_word():
    r = post('hindi-kannada.pdf', 'pdf-to-word')
    assert r.status_code == 200, r.text
    assert 'wordprocessingml' in r.headers['content-type']


def test_password_protected_rejected():
    path = os.path.join(FIX, 'encrypted.pdf')
    with open(path, 'rb') as fh:
        r = client.post(
            '/convert',
            files={'file': ('encrypted.pdf', fh, 'application/pdf')},
            data={'mode': 'pdf-to-word'},
            headers={'Origin': ORIGIN},
        )
    assert r.status_code == 422
    assert r.json()['detail'] == 'password'


def test_oversize_rejected():
    big = b'0' * (26 * 1024 * 1024)
    r = client.post(
        '/convert',
        files={'file': ('big.pdf', io.BytesIO(big), 'application/pdf')},
        data={'mode': 'pdf-to-word'},
        headers={'Origin': ORIGIN},
    )
    assert r.status_code == 413


def test_page_limit_rejected():
    doc = pymupdf.open()
    for _ in range(101):
        doc.new_page()
    data = doc.tobytes()
    r = client.post(
        '/convert',
        files={'file': ('many.pdf', io.BytesIO(data), 'application/pdf')},
        data={'mode': 'pdf-to-word'},
        headers={'Origin': ORIGIN},
    )
    assert r.status_code == 413


def test_unknown_mode_rejected():
    r = post('text-heavy.pdf', 'pdf-to-mobi')
    assert r.status_code == 422


def test_cors_rejection():
    r = post('text-heavy.pdf', 'pdf-to-word', origin='https://evil.example')
    assert r.status_code == 403


def test_scanned_pdf():
    r = post('scanned.pdf', 'pdf-to-word')
    if shutil.which('ocrmypdf') and shutil.which('tesseract'):
        assert r.status_code == 200, r.text
        assert r.headers.get('X-OCR-Applied') == 'true'
    else:
        assert r.status_code == 422
        assert r.json()['detail'] == 'ocr-unavailable'
