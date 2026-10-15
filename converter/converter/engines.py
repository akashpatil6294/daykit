"""Conversion engines behind POST /convert.

Engine selection is server-side only, via the CONVERTER_ENGINE environment
variable. LocalEngine does everything in-process (no external API calls).
ManagedApiEngine is a skeleton for a paid managed API (Adobe PDF Services,
ConvertAPI, CloudConvert): the API key comes from the environment and is
never sent to the browser. See converter/README.md for how to switch.
"""
from __future__ import annotations

import abc
import os
import shutil
import subprocess
import tempfile
import zipfile
from pathlib import Path

import pymupdf  # PyMuPDF
from docx import Document as DocxDocument
from openpyxl import Workbook
from pptx import Presentation
from pptx.util import Emu, Pt

MODES = (
    'pdf-to-word',
    'pdf-to-powerpoint',
    'pdf-to-excel',
    'word-to-pdf',
    'powerpoint-to-pdf',
    'excel-to-pdf',
)
OUTPUT_MEDIA = {
    'pdf-to-word': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'pdf-to-powerpoint': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'pdf-to-excel': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'word-to-pdf': 'application/pdf',
    'powerpoint-to-pdf': 'application/pdf',
    'excel-to-pdf': 'application/pdf',
}
OUTPUT_SUFFIX = {
    'pdf-to-word': '.docx',
    'pdf-to-powerpoint': '.pptx',
    'pdf-to-excel': '.xlsx',
    'word-to-pdf': '.pdf',
    'powerpoint-to-pdf': '.pdf',
    'excel-to-pdf': '.pdf',
}
INPUT_SUFFIX = {
    'pdf-to-word': '.pdf',
    'pdf-to-powerpoint': '.pdf',
    'pdf-to-excel': '.pdf',
    'word-to-pdf': '.docx',
    'powerpoint-to-pdf': '.pptx',
    'excel-to-pdf': '.xlsx',
}


MAX_PAGES = int(os.environ.get('CONVERTER_MAX_PAGES', '100'))
MAX_BYTES = int(os.environ.get('CONVERTER_MAX_BYTES', str(25 * 1024 * 1024)))


class ConversionError(Exception):
    """Raised for expected conversion failures. `code` maps to an HTTP error."""

    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code


def open_pdf(data: bytes) -> pymupdf.Document:
    """Open PDF bytes, rejecting password-protected and damaged files."""
    try:
        doc = pymupdf.open(stream=data, filetype='pdf')
    except Exception as exc:  # corrupt header, truncated stream, ...
        raise ConversionError('corrupt', 'input PDF could not be parsed') from exc
    if doc.needs_pass:
        doc.close()
        raise ConversionError('password', 'input PDF is password-protected')
    return doc


def assert_page_limit(doc: pymupdf.Document, limit: int) -> None:
    if doc.page_count > limit:
        # Caller closes the document in its finally block.
        raise ConversionError('page-limit', f'PDF has {doc.page_count} pages; limit is {limit}')


def ocr_binary() -> str | None:
    return shutil.which('ocrmypdf')


def is_scanned(doc: pymupdf.Document) -> bool:
    """True when no page carries an extractable text layer."""
    for page in doc:
        if page.get_text().strip():
            return False
    return True


def ocr_pdf(src: Path, dst: Path) -> None:
    """Run OCRmyPDF into a new file. Raises ConversionError on failure."""
    binary = ocr_binary()
    if not binary or not shutil.which('tesseract'):
        raise ConversionError('ocr-unavailable', 'scanned PDF needs OCR, which is not installed')
    proc = subprocess.run(
        [binary, '--force-ocr', '--optimize', '0', '--quiet', str(src), str(dst)],
        capture_output=True,
        timeout=180,
    )
    if proc.returncode != 0:
        raise ConversionError('ocr-failed', 'OCR of the scanned PDF failed')


def libreoffice_pdf(src: Path, tmp: Path) -> Path:
    """Office -> PDF via headless LibreOffice. Returns the produced PDF."""
    profile = Path(tempfile.mkdtemp(prefix='lo-profile-', dir=tmp))
    # LibreOffice requires a writable HOME even with -env:UserInstallation,
    # otherwise it fails with "User installation could not be completed"
    # when running as a user without a home directory (e.g., in Docker).
    home = Path(tempfile.mkdtemp(prefix='lo-home-', dir=tmp))
    home.chmod(0o700)
    env = {**os.environ, 'HOME': str(home)}
    try:
        proc = subprocess.run(
            [
                'soffice',
                '--headless',
                '--nologo',
                '--nodefault',
                '--nolockcheck',
                f'-env:UserInstallation=file://{profile}',
                '--convert-to',
                'pdf',
                '--outdir',
                str(tmp),
                str(src),
            ],
            capture_output=True,
            timeout=180,
            env=env,
        )
    except FileNotFoundError as exc:
        raise ConversionError('conversion-failed', 'LibreOffice (soffice) is not installed') from exc
    out = tmp / (src.stem + '.pdf')
    if proc.returncode != 0 or not out.exists():
        # Log the real stderr server-side so the failure can be diagnosed;
        # the client only sees the generic code.
        err = proc.stderr.decode('utf-8', 'replace').strip()[-2000:]
        print(f'[daykit] libreoffice failed (rc={proc.returncode}): {err}', flush=True)
        raise ConversionError('conversion-failed', 'LibreOffice could not convert this document')
    return out


def pdf_to_docx(doc: pymupdf.Document, tmp: Path) -> Path:
    from pdf2docx import Converter

    raw = tmp / 'src.pdf'
    doc.save(str(raw))
    out = tmp / 'out.docx'
    try:
        cv = Converter(str(raw))
        cv.convert(str(out))
        cv.close()
    except Exception as exc:
        raise ConversionError('conversion-failed', 'PDF to Word conversion failed') from exc
    return out


def _add_paragraphs(cell, lines: list[str]) -> None:
    first = True
    for line in lines:
        if first:
            cell.paragraphs[0].text = line
            first = False
        else:
            cell.add_paragraph(line)


def pdf_to_pptx(doc: pymupdf.Document, tmp: Path, fidelity: str) -> Path:
    """Editable mode: text boxes + images positioned from PDF coordinates.
    fidelity=exact: one rasterized page image per slide (the old "image slides"
    behaviour, maximum visual likeness, no editable text).
    """
    prs = Presentation()
    prs.slide_width = Emu(12192000)
    prs.slide_height = Emu(6858000)
    for page in doc:
        rect = page.rect
        slide = prs.slides.add_slide(prs.slide_layouts[6])  # blank
        sx = prs.slide_width / rect.width
        sy = prs.slide_height / rect.height
        if fidelity == 'exact':
            pix = page.get_pixmap(dpi=150)
            img = tmp / f'page-{page.number}.png'
            pix.save(str(img))
            slide.shapes.add_picture(str(img), Emu(0), Emu(0), prs.slide_width, prs.slide_height)
            continue
        # Images first so text boxes sit on top.
        for img_info in page.get_images(full=True):
            try:
                xref = img_info[0]
                bbox = page.get_image_bbox(img_info)
                data = doc.extract_image(xref)['image']
            except Exception:
                continue
            img = tmp / f'page-{page.number}-{xref}.img'
            img.write_bytes(data)
            try:
                slide.shapes.add_picture(
                    str(img),
                    Emu(int(bbox.x0 * sx)),
                    Emu(int(bbox.y0 * sy)),
                    Emu(int(bbox.width * sx)),
                    Emu(int(bbox.height * sy)),
                )
            except Exception:
                pass
        # Text lines as positioned text boxes.
        for block in page.get_text('dict')['blocks']:
            if block.get('type') != 0:
                continue
            lines = [ln for ln in block['lines'] if ln['spans']]
            if not lines:
                continue
            text = '\n'.join(''.join(s['text'] for s in ln['spans']) for ln in lines)
            if not text.strip():
                continue
            x0, y0 = block['bbox'][0], block['bbox'][1]
            x1, y1 = block['bbox'][2], block['bbox'][3]
            box = slide.shapes.add_textbox(
                Emu(int(x0 * sx)), Emu(int(y0 * sy)),
                Emu(max(int((x1 - x0) * sx), 1)), Emu(max(int((y1 - y0) * sy), 1)),
            )
            frame = box.text_frame
            frame.word_wrap = True
            size = max(ln['spans'][0].get('size', 11) for ln in lines)
            para = frame.paragraphs[0]
            para.text = text
            for run in para.runs:
                run.font.size = Pt(min(size, 48))
    out = tmp / 'out.pptx'
    prs.save(str(out))
    return out


def pdf_to_xlsx(doc: pymupdf.Document, tmp: Path) -> Path:
    """Table detection per page via PyMuPDF find_tables; falls back to a
    text-line grid when no ruled tables are found."""
    wb = Workbook()
    wb.remove(wb.active)
    for page in doc:
        ws = wb.create_sheet(f'Page {page.number + 1}')
        tables = page.find_tables()
        rows: list[list[str]] = []
        for table in tables:
            for row in table.extract():
                rows.append([(c or '').strip() for c in row])
        if not rows:
            # Fallback: one column of text lines keeps the content at least
            # inspectable; layout of untabled PDFs is inherently approximate.
            for line in page.get_text().splitlines():
                rows.append([line.strip()])
        for row in rows:
            ws.append(row)
    out = tmp / 'out.xlsx'
    wb.save(str(out))
    return out


def looks_like_ooxml(data: bytes) -> bool:
    if not data.startswith(b'PK'):
        return False
    try:
        with zipfile.ZipFile(__import__('io').BytesIO(data)) as zf:
            names = zf.namelist()
        return any(n.startswith('[Content_Types]') for n in names)
    except Exception:
        return False


def sanity_check_office(data: bytes, mode: str) -> None:
    if not looks_like_ooxml(data):
        raise ConversionError('invalid', 'file is not a supported Office document')
    with zipfile.ZipFile(__import__('io').BytesIO(data)) as archive:
        entries = archive.infolist()
        if len(entries) > 10000 or sum(item.file_size for item in entries) > 200 * 1024 * 1024:
            raise ConversionError('too-large', 'expanded Office archive exceeds limits')
        for item in entries:
            name = item.filename.replace('\\', '/')
            if name.startswith('/') or '..' in name.split('/') or ':' in name:
                raise ConversionError('invalid', 'unsafe Office archive path')
            if name.lower().endswith('vbaproject.bin'):
                raise ConversionError('macros', 'macro-enabled Office files are not accepted')



class Engine(abc.ABC):
    """Adapter interface: swap engines with CONVERTER_ENGINE (local|adobe|convertapi|cloudconvert)."""

    name: str = 'base'

    @abc.abstractmethod
    def convert(self, data: bytes, mode: str, fidelity: str, tmp: Path) -> tuple[bytes, str, bool]:
        """Return (output bytes, media type, ocr_applied). May raise ConversionError."""


class LocalEngine(Engine):
    name = 'local'

    def convert(self, data: bytes, mode: str, fidelity: str, tmp: Path) -> tuple[bytes, str, bool]:
        if mode not in MODES:
            raise ConversionError('invalid', f'unknown mode {mode}')
        ocr_applied = False
        tmp.mkdir(parents=True, exist_ok=True)
        src = tmp / ('input' + INPUT_SUFFIX[mode])
        src.write_bytes(data)
        if mode in ('word-to-pdf', 'powerpoint-to-pdf', 'excel-to-pdf'):
            sanity_check_office(data, mode)
            out = libreoffice_pdf(src, tmp)
            with open_pdf(out.read_bytes()) as rendered:
                assert_page_limit(rendered, MAX_PAGES)
        else:
            doc = open_pdf(data)
            try:
                assert_page_limit(doc, MAX_PAGES)
                if is_scanned(doc):
                    ocr_src = tmp / 'ocr.pdf'
                    ocr_pdf(src, ocr_src)
                    doc.close()
                    doc = open_pdf(ocr_src.read_bytes())
                    ocr_applied = True
                if mode == 'pdf-to-word':
                    out = pdf_to_docx(doc, tmp)
                elif mode == 'pdf-to-powerpoint':
                    out = pdf_to_pptx(doc, tmp, fidelity)
                else:
                    out = pdf_to_xlsx(doc, tmp)
            finally:
                doc.close()
        return out.read_bytes(), OUTPUT_MEDIA[mode], ocr_applied


class ManagedApiEngine(Engine):
    """Skeleton for a managed conversion API. Fill in one provider's SDK/REST
    calls; everything below stays server-side and the API key never reaches
    the browser.

    - Adobe PDF Services:   ADOBE_CLIENT_ID / ADOBE_CLIENT_SECRET
    - ConvertAPI:           CONVERTAPI_SECRET
    - CloudConvert:         CLOUDCONVERT_API_KEY (+ CLOUDCONVERT_SANDBOX)
    """

    def __init__(self, provider: str):
        self.name = f'managed:{provider}'
        self.provider = provider
        if provider == 'adobe':
            self.key = (os.environ.get('ADOBE_CLIENT_ID'), os.environ.get('ADOBE_CLIENT_SECRET'))
        elif provider == 'convertapi':
            self.key = os.environ.get('CONVERTAPI_SECRET')
        elif provider == 'cloudconvert':
            self.key = os.environ.get('CLOUDCONVERT_API_KEY')
        else:
            raise ValueError(f'unknown managed provider {provider}')

    def convert(self, data: bytes, mode: str, fidelity: str, tmp: Path) -> tuple[bytes, str, bool]:
        raise NotImplementedError(
            f'{self.name} is a skeleton: implement convert() for the {self.provider} '
            'API (server-side only, key from environment), then redeploy. '
            'See converter/README.md.'
        )


def make_engine() -> Engine:
    which = os.environ.get('CONVERTER_ENGINE', 'local').lower()
    if which == 'local':
        return LocalEngine()
    if which in ('adobe', 'convertapi', 'cloudconvert'):
        return ManagedApiEngine(which)
    raise ValueError(f'unknown CONVERTER_ENGINE={which!r}')
