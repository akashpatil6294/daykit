"""Generate converter QA fixtures into tests/fixtures/convert/.

Run:  converter/.venv/bin/python tests/fixtures/convert/generate.py
Everything is procedural; no user content. Indic text uses system Noto fonts.
"""
from __future__ import annotations

import sys
from pathlib import Path

import fitz  # PyMuPDF
from docx import Document as DocxDocument
from openpyxl import Workbook
from pptx import Presentation

OUT = Path(__file__).resolve().parent
HIN = '/usr/share/fonts/truetype/noto/NotoSansDevanagari-Regular.ttf'
KAN = '/usr/share/fonts/truetype/noto/NotoSansKannada-Regular.ttf'
import glob

HIN = next(iter(glob.glob('/usr/share/fonts/truetype/noto/NotoSansDevanagari-*.ttf')), None)
KAN = next(iter(glob.glob('/usr/share/fonts/truetype/noto/NotoSansKannada-*.ttf')), None)


def write(doc: fitz.Document, name: str) -> None:
    path = OUT / name
    doc.save(str(path))
    doc.close()
    print(f'{name}: {path.stat().st_size / 1024:.1f} KB')


def text_heavy() -> None:
    doc = fitz.open()
    lorem = (
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' * 14
    )
    for p in range(3):
        page = doc.new_page()
        page.insert_textbox(
            fitz.Rect(50, 50, 545, 792), f'Page {p + 1}\n\n' + lorem * 3,
            fontsize=11, fontname='helv', align=0,
        )
    write(doc, 'text-heavy.pdf')


def multicol() -> None:
    doc = fitz.open()
    body = ('Two column layout. ' * 60)
    for p in range(2):
        page = doc.new_page()
        page.insert_textbox(fitz.Rect(50, 60, 275, 792), f'Left column page {p + 1}\n' + body,
                            fontsize=10, fontname='helv')
        page.insert_textbox(fitz.Rect(305, 60, 545, 792), f'Right column page {p + 1}\n' + body,
                            fontsize=10, fontname='helv')
    write(doc, 'multicol.pdf')


def tables() -> None:
    doc = fitz.open()
    rows = [['Item', 'Qty', 'Price', 'Total']] + [
        [f'Widget {i}', str(i), f'{10 + i}.00', f'{(10 + i) * i}.00'] for i in range(1, 13)
    ]
    for p in range(2):
        page = doc.new_page()
        x0, y0, cw, rh = 50, 80, 120, 26
        page.insert_text(fitz.Point(50, 50), f'Sales report — sheet {p + 1}', fontsize=14,
                         fontname='hebo')
        for r, row in enumerate(rows):
            for c, cell in enumerate(row):
                rect = fitz.Rect(x0 + c * cw, y0 + r * rh, x0 + (c + 1) * cw, y0 + (r + 1) * rh)
                page.draw_rect(rect, color=(0, 0, 0), width=0.8)
                page.insert_textbox(rect + (4, 2, -4, -2), cell, fontsize=10, fontname='helv')
    write(doc, 'tables.pdf')


def images() -> None:
    doc = fitz.open()
    for p in range(2):
        page = doc.new_page()
        page.insert_text(fitz.Point(50, 50), f'Photo log page {p + 1}', fontsize=14, fontname='hebo')
        for i in range(2):
            pix = fitz.Pixmap(fitz.csRGB, fitz.Rect(0, 0, 200, 140), 0)
            pix.set_rect(pix.irect, (60 + p * 40, 80 + i * 30, 120 + p * 20))
            page.insert_image(fitz.Rect(60, 90 + i * 210, 260, 230 + i * 210), pixmap=pix)
            page.insert_text(fitz.Point(60, 250 + i * 210), f'Figure {p * 2 + i + 1}: sample render',
                             fontsize=10, fontname='helv')
    write(doc, 'images.pdf')


def indic() -> None:
    if not (HIN and KAN):
        print('indic fonts missing, skipped')
        return
    doc = fitz.open()
    page = doc.new_page()
    hindi = fitz.Font(fontfile=HIN)
    kannada = fitz.Font(fontfile=KAN)
    page.insert_font(fontfile=HIN, fontname='hin')
    page.insert_font(fontfile=KAN, fontname='kan')
    page.insert_text(fitz.Point(50, 80), 'हिन्दी पाठ — आवेदन पत्र निर्देश', fontname='hin', fontsize=14)
    page.insert_text(fitz.Point(50, 120), 'यह एक परीक्षण दस्तावेज़ है जिसमें देवनागरी लिपि है।', fontname='hin', fontsize=11)
    page.insert_text(fitz.Point(50, 170), 'ಕನ್ನಡ ಪಠ್ಯ — ಅರ್ಜಿ ಸೂಚನೆಗಳು', fontname='kan', fontsize=14)
    page.insert_text(fitz.Point(50, 210), 'ಇದು ಕನ್ನಡ ಲಿಪಿಯನ್ನು ಹೊಂದಿರುವ ಪರೀಕ್ಷಾ ದಾಖಲೆಯಾಗಿದೆ.', fontname='kan', fontsize=11)
    write(doc, 'hindi-kannada.pdf')


def scanned() -> None:
    """Image-only PDF: render a text page to a bitmap and re-wrap it."""
    doc = fitz.open()
    page = doc.new_page()
    page.insert_textbox(fitz.Rect(50, 60, 545, 700),
                        ('Scanned-looking memo. ' * 80), fontsize=12, fontname='helv')
    pix = page.get_pixmap(dpi=120)
    scan = fitz.open()
    spage = scan.new_page(width=pix.width * 72 / 120, height=pix.height * 72 / 120)
    spage.insert_image(spage.rect, pixmap=pix)
    write(scan, 'scanned.pdf')


def sample_docx() -> None:
    d = DocxDocument()
    d.add_heading('Application letter', 1)
    d.add_paragraph('Dear Sir or Madam, this is a sample Word document for conversion tests.')
    d.add_heading('Details', 2)
    t = d.add_table(rows=3, cols=3)
    for r in range(3):
        for c in range(3):
            t.cell(r, c).text = f'R{r + 1}C{c + 1}'
    d.save(str(OUT / 'sample.docx'))
    print('sample.docx written')


def sample_pptx() -> None:
    prs = Presentation()
    for i in range(2):
        slide = prs.slides.add_slide(prs.slide_layouts[5])
        slide.shapes.title.text = f'Sample slide {i + 1}'
        from pptx.util import Inches

        box = slide.shapes.add_textbox(Inches(1), Inches(1.5), Inches(8), Inches(3))
        box.text_frame.text = 'Bullet content for the conversion test.'
    prs.save(str(OUT / 'sample.pptx'))
    print('sample.pptx written')


def sample_xlsx() -> None:
    wb = Workbook()
    ws = wb.active
    ws.title = 'Expenses'
    ws.append(['Month', 'Rent', 'Food'])
    for i, m in enumerate(['Jan', 'Feb', 'Mar'], 1):
        ws.append([m, 5000 + i * 100, 3200 + i * 50])
    wb.save(str(OUT / 'sample.xlsx'))
    print('sample.xlsx written')


if __name__ == '__main__':
    text_heavy()
    multicol()
    tables()
    images()
    indic()
    scanned()
    sample_docx()
    sample_xlsx()
    # pptx needs a fix below (textbox geometry); handle separately
    try:
        sample_pptx()
    except Exception as e:
        print('sample_pptx failed:', e)
        sys.exit(1)
