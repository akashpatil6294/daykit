"""Daykit converter service.

POST /convert (multipart: file, mode, fidelity) and GET /healthz.

Service rules:
- input cap 25 MB (CONVERTER_MAX_BYTES), 100 pages (CONVERTER_MAX_PAGES)
- per-IP rate limit (RATE_LIMIT_PER_MINUTE, default 30)
- CORS allow-list from CORS_ORIGINS, defaulting to PUBLIC_SITE_URL
- concurrency cap (CONCURRENCY, default 2) -> 429 when busy
- job timeout JOB_TIMEOUT_SECONDS (default 120) -> 504
- files live only in per-job tmp dirs, deleted right after the response
  (plus a 10-minute background sweep); no file names or contents are logged
- deploy behind HTTPS; http is only accepted for localhost dev traffic
"""
from __future__ import annotations

import asyncio
import os
import shutil
import tempfile
import time
from collections import deque
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse, Response

from .engines import (
    MAX_BYTES,
    MAX_PAGES,
    MODES,
    ConversionError,
    make_engine,
)

JOB_TIMEOUT = float(os.environ.get('JOB_TIMEOUT_SECONDS', '120'))
RATE_LIMIT = int(os.environ.get('RATE_LIMIT_PER_MINUTE', '30'))
CONCURRENCY = int(os.environ.get('CONVERTER_CONCURRENCY', '2'))
TMP_ROOT = Path(os.environ.get('CONVERTER_TMP', tempfile.gettempdir())) / 'daykit-converter'
TMP_ROOT.mkdir(parents=True, exist_ok=True)

origins = [o.rstrip('/') for o in os.environ.get('CORS_ORIGINS', '').split(',') if o.strip()]
site_url = os.environ.get('PUBLIC_SITE_URL', '').rstrip('/')
if site_url and site_url not in origins:
    origins.append(site_url)

from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Fail fast if LibreOffice is missing: Office -> PDF would 500 otherwise.
    if shutil.which('soffice') is None:
        print('[daykit] WARNING: soffice not found -- word/powerpoint/excel to PDF will fail', flush=True)
    else:
        print('[daykit] soffice available', flush=True)

    async def sweep():
        while True:
            await asyncio.sleep(600)  # 10-minute sweep
            cutoff = time.time() - 600
            try:
                for child in TMP_ROOT.iterdir():
                    try:
                        if child.stat().st_mtime < cutoff:
                            shutil.rmtree(child, ignore_errors=True)
                    except FileNotFoundError:
                        pass
            except FileNotFoundError:
                pass

    task = asyncio.create_task(sweep())
    yield
    task.cancel()


app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None, lifespan=lifespan)
engine = make_engine()
recent: dict[str, deque[float]] = {}
slots = asyncio.Semaphore(CONCURRENCY)

ERROR_STATUS = {
    'too-large': 413,
    'page-limit': 413,
    'password': 422,
    'invalid': 422,
    'corrupt': 422,
    'macros': 422,
    'ocr-unavailable': 422,
    'ocr-failed': 422,
    'conversion-failed': 422,
}


class LimitBody:
    """Reject excess bytes while receiving, including chunked requests."""

    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        if scope['type'] != 'http':
            return await self.inner(scope, receive, send)
        total = 0

        async def limited_receive():
            nonlocal total
            message = await receive()
            total += len(message.get('body', b''))
            if total > MAX_BYTES + 131072:
                raise HTTPException(413, 'File too large')
            return message

        await self.inner(scope, limited_receive, send)


app.add_middleware(LimitBody)


def cors_headers(origin: str | None) -> dict[str, str]:
    if origin and origin in origins:
        return {
            'Access-Control-Allow-Origin': origin,
            'Vary': 'Origin',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Cache-Control': 'no-store',
        }
    return {}


@app.middleware('http')
async def boundary(request: Request, call_next):
    origin = request.headers.get('origin')
    if request.url.path not in ('/healthz',) and (
        not origins or not origin or origin not in origins
    ):
        return Response(status_code=403, content='forbidden origin')
    headers = cors_headers(origin)
    if request.method == 'OPTIONS':
        return Response(status_code=204, headers=headers)
    if request.url.path == '/convert' and request.method == 'POST':
        now = time.monotonic()
        for key in list(recent):
            if not recent[key] or recent[key][-1] < now - 60:
                del recent[key]
        key = request.client.host if request.client else 'unknown'
        if len(recent) >= 10000 and key not in recent:
            return Response(status_code=429, headers=headers)
        bucket = recent.setdefault(key, deque())
        while bucket and bucket[0] < now - 60:
            bucket.popleft()
        if len(bucket) >= RATE_LIMIT or slots.locked():
            return Response(status_code=429, headers=headers)
        bucket.append(now)
        try:
            async with asyncio.timeout(JOB_TIMEOUT):
                response = await call_next(request)
        except TimeoutError:
            response = Response(status_code=504, content='conversion timed out')
    else:
        response = await call_next(request)
    response.headers.update(headers)
    return response


@app.get('/healthz')
async def healthz():
    return JSONResponse({'ok': True, 'engine': engine.name})


@app.post('/convert')
async def convert(
    file: UploadFile = File(...),
    mode: str = Form(...),
    fidelity: str = Form('editable'),
):
    if mode not in MODES:
        raise HTTPException(422, 'unknown mode')
    if fidelity not in ('editable', 'exact'):
        fidelity = 'editable'
    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(413, 'File too large')
    job = Path(tempfile.mkdtemp(prefix='job-', dir=TMP_ROOT))
    try:

        def run() -> tuple[bytes, str, bool]:
            return engine.convert(data, mode, fidelity, job)

        try:
            async with slots:
                out, media, ocr = await asyncio.get_running_loop().run_in_executor(None, run)
        except ConversionError as exc:
            raise HTTPException(ERROR_STATUS.get(exc.code, 422), exc.code)
        headers = {'Cache-Control': 'no-store'}
        if ocr:
            headers['X-OCR-Applied'] = 'true'
        # Bytes are fully in memory; the tmp dir is gone before the response.
        return Response(content=out, media_type=media, headers=headers)
    finally:
        shutil.rmtree(job, ignore_errors=True)
