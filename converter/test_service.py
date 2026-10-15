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


def test_office_archive_path_rejected():
    from converter.engines import sanity_check_office, ConversionError
    import pytest
    data = io.BytesIO()
    with zipfile.ZipFile(data, 'w') as archive:
        archive.writestr('[Content_Types].xml', '<Types/>')
        archive.writestr('../outside.xml', 'unsafe')
    with pytest.raises(ConversionError) as error:
        sanity_check_office(data.getvalue(), 'word-to-pdf')
    assert error.value.code == 'invalid'


def test_ocr_header_is_exposed():
    from converter.main import cors_headers
    assert cors_headers(ORIGIN)['Access-Control-Expose-Headers'] == 'X-OCR-Applied'


def test_conversion_timeout_reaps_worker_before_cleanup(monkeypatch):
    import asyncio
    from starlette.datastructures import UploadFile
    import converter.main as service
    import pytest
    from fastapi import HTTPException

    class Worker:
        returncode = None
        pid = 123456789
        killed = False
        async def wait(self):
            if not self.killed:
                await asyncio.sleep(10)
            self.returncode = -9
            return self.returncode
        def kill(self):
            self.killed = True

    worker = Worker()
    async def spawn(*args, **kwargs):
        return worker
    monkeypatch.setattr(service.asyncio, 'create_subprocess_exec', spawn)
    monkeypatch.setattr(service, 'JOB_TIMEOUT', 0.01)
    if os.name != 'nt':
        monkeypatch.setattr(service.os, 'killpg', lambda *args: worker.kill())
    async def run():
        monkeypatch.setattr(service, 'slots', asyncio.Semaphore(1))
        before = set(service.TMP_ROOT.iterdir())
        with pytest.raises(HTTPException) as error:
            await service.convert(UploadFile(filename='file.pdf', file=io.BytesIO(b'%PDF')), 'pdf-to-word', 'editable')
        assert error.value.status_code == 504
        assert worker.killed and worker.returncode == -9
        assert not service.slots.locked()
        assert not service.active_jobs
        assert set(service.TMP_ROOT.iterdir()) == before
    asyncio.run(run())


def test_malformed_pdf_rejected_without_details():
    response = client.post('/convert', files={'file': ('invalid.pdf', b'not a PDF')},
                           data={'mode': 'pdf-to-word'}, headers={'Origin': ORIGIN})
    assert response.status_code == 422
    assert response.json() == {'detail': 'corrupt'}


def test_missing_origin_rejected():
    response = client.post('/convert', files={'file': ('invalid.pdf', b'file')},
                           data={'mode': 'pdf-to-word'})
    assert response.status_code == 403


def test_concurrency_rejects_when_all_slots_busy(monkeypatch):
    import asyncio
    import converter.main as service
    monkeypatch.setattr(service, 'slots', asyncio.Semaphore(0))
    response = post('text-heavy.pdf', 'pdf-to-word')
    assert response.status_code == 429
    assert response.headers['access-control-allow-origin'] == ORIGIN


def test_rate_limit_rejects_before_conversion(monkeypatch):
    import converter.main as service
    monkeypatch.setattr(service, 'RATE_LIMIT', 0)
    assert post('text-heavy.pdf', 'pdf-to-word').status_code == 429


def test_real_worker_timeout_and_cleanup(monkeypatch):
    import asyncio
    from fastapi import HTTPException
    from starlette.datastructures import UploadFile
    import converter.main as service
    import pytest
    original_spawn = asyncio.create_subprocess_exec
    processes = []
    async def spawn(*args, **kwargs):
        # A real OS process ensures timeout and reaping are not only mock-tested.
        process = await original_spawn(service.sys.executable, '-c',
                                      'import time; time.sleep(10)', **kwargs)
        processes.append(process)
        return process
    monkeypatch.setattr(service.asyncio, 'create_subprocess_exec', spawn)
    monkeypatch.setattr(service, 'JOB_TIMEOUT', 0.05)
    async def run():
        monkeypatch.setattr(service, 'slots', asyncio.Semaphore(1))
        before = set(service.TMP_ROOT.iterdir())
        with pytest.raises(HTTPException) as error:
            await service.convert(UploadFile(filename='fixture.pdf', file=io.BytesIO(b'%PDF')),
                                  'pdf-to-word', 'editable')
        assert error.value.status_code == 504
        assert len(processes) == 1 and processes[0].returncode is not None
        assert not service.slots.locked() and not service.active_jobs
        assert set(service.TMP_ROOT.iterdir()) == before
    asyncio.run(run())
