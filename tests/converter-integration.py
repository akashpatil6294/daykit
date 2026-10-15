"""Real HTTP checks against a running test converter, not FastAPI TestClient.
Run: python tests/converter-integration.py http://127.0.0.1:18016
"""
import io
import json
import sys
import zipfile
from pathlib import Path
import httpx
import pymupdf

base = sys.argv[1].rstrip('/')
fixtures = Path(__file__).parent / 'fixtures' / 'convert'
origin = 'https://daykit.pages.dev'
results = []
with httpx.Client(base_url=base, timeout=150) as client:
    health = client.get('/healthz')
    assert health.status_code == 200 and health.json() == {'ok': True, 'engine': 'local'}
    cases = [
        ('pdf-to-word', 'text-heavy.pdf', 'word/document.xml'),
        ('pdf-to-powerpoint', 'tables.pdf', 'ppt/presentation.xml'),
        ('pdf-to-excel', 'tables.pdf', 'xl/workbook.xml'),
        ('word-to-pdf', 'sample.docx', None),
        ('powerpoint-to-pdf', 'sample.pptx', None),
        ('excel-to-pdf', 'sample.xlsx', None),
    ]
    for mode, name, member in cases:
        response = client.post('/convert', headers={'Origin': origin},
            files={'file': (name, (fixtures / name).read_bytes())}, data={'mode': mode})
        assert response.status_code == 200, (mode, response.status_code, response.text[:200])
        assert response.content
        assert response.headers['access-control-allow-origin'] == origin
        if member:
            with zipfile.ZipFile(io.BytesIO(response.content)) as archive:
                assert member in archive.namelist()
                assert archive.testzip() is None
        else:
            assert response.headers['content-type'] == 'application/pdf'
            with pymupdf.open(stream=response.content, filetype='pdf') as document:
                assert 0 < len(document) <= 100
        results.append({'mode': mode, 'status': response.status_code, 'bytes': len(response.content)})
    for label, payload, mode, request_origin, status in [
        ('malformed PDF', b'not a pdf', 'pdf-to-word', origin, 422),
        ('malformed Office', b'not a zip', 'word-to-pdf', origin, 422),
        ('unsupported mode', b'file', 'pdf-to-mobi', origin, 422),
        ('forbidden origin', b'file', 'pdf-to-word', 'https://evil.example', 403),
        ('missing origin', b'file', 'pdf-to-word', None, 403),
    ]:
        response = client.post('/convert', headers={'Origin': request_origin} if request_origin else {},
            files={'file': ('invalid', payload)}, data={'mode': mode})
        assert response.status_code == status, (label, response.status_code)
        assert 'Traceback' not in response.text
        results.append({'check': label, 'status': response.status_code})
    response = client.post('/convert', headers={'Origin': origin},
        files={'file': ('scanned.pdf', (fixtures / 'scanned.pdf').read_bytes())},
        data={'mode': 'pdf-to-word'})
    assert response.status_code == 200, ('OCR', response.status_code, response.text[:200])
    assert response.headers.get('x-ocr-applied') == 'true'
    with zipfile.ZipFile(io.BytesIO(response.content)) as archive:
        assert 'word/document.xml' in archive.namelist()
    results.append({'check': 'scanned PDF OCR to Word', 'status': 200, 'bytes': len(response.content)})
    for allowed in [origin, 'https://pdf-converter.me']:
        response = client.options('/convert', headers={'Origin': allowed, 'Access-Control-Request-Method': 'POST'})
        assert response.status_code == 204
        assert response.headers['access-control-allow-origin'] == allowed
    results.append({'check': 'both production origins preflight', 'status': 204})
print(json.dumps({'health': health.json(), 'checks': results}, indent=2))
