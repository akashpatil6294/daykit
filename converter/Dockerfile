# syntax=docker/dockerfile:1
# Daykit converter service: high-fidelity Office <-> PDF conversion.
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# LibreOffice (headless Office -> PDF), tesseract + OCRmyPDF (scanned PDFs),
# and Noto fonts covering Latin, Devanagari, Kannada, Tamil, Telugu, Bengali.
RUN apt-get update && apt-get install -y --no-install-recommends \
      libreoffice-writer libreoffice-impress libreoffice-calc \
      tesseract-ocr tesseract-ocr-hin tesseract-ocr-kan tesseract-ocr-tam tesseract-ocr-tel tesseract-ocr-ben \
      fonts-noto fonts-noto-core fonts-noto-extra \
      fonts-indic \
      ghostscript \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt && pip check
COPY converter ./converter

# One low-privilege user for the whole service, WITH a home directory:
# headless LibreOffice refuses to start ("User installation could not be
# completed") when HOME is missing or not writable.
RUN useradd --system --create-home --shell /usr/sbin/nologin converter \
    && mkdir -p /tmp/daykit-converter \
    && chown -R converter:converter /app /tmp/daykit-converter /home/converter
USER converter

ENV HOME=/home/converter \
    CONVERTER_TMP=/tmp/daykit-converter \
    CONVERTER_CONCURRENCY=2 \
    JOB_TIMEOUT_SECONDS=120

# Build-time dependency smoke test as the converter user.
# Real conversions and OCR are covered by the container verification suite.
# If this fails, the image is broken -- do not ship it.
RUN soffice --headless --version && \
    python3 -c "import pymupdf, docx, openpyxl, pptx, pdf2docx, pikepdf; assert hasattr(pikepdf.Pdf, 'check'); print('py deps ok')"

EXPOSE 8000
CMD ["uvicorn", "converter.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1", "--no-access-log"]
