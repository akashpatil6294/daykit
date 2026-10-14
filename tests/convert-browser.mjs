import { chromium } from 'playwright-core';
import AxeBuilder from '@axe-core/playwright';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { Document, Paragraph, Packer } from 'docx';
import PptxGenJS from 'pptxgenjs';
import ExcelJS from 'exceljs';
import mammoth from 'mammoth';
import { unzipSync, strFromU8 } from 'fflate';
import fs from 'node:fs';
import assert from 'node:assert/strict';
// The six high-fidelity converter modes run only on the conversion service.
// They are exercised here only when CONVERTER_URL points at a running service
// (the preview build must have PUBLIC_CONVERTER_URL set to the same origin).
const CONVERTER_MODES = [
  'pdf-to-word',
  'pdf-to-powerpoint',
  'pdf-to-excel',
  'word-to-pdf',
  'powerpoint-to-pdf',
  'excel-to-pdf',
];
const CONVERTER_URL = process.env.CONVERTER_URL || '';
const CONSENT_LABEL = 'This file is sent to our converter and deleted right after.';
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  headless: true,
});
const report = [],
  errors = [];
let assets = new Set();
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  context.on('response', (response) => {
    try {
      const path = new URL(response.url()).pathname;
      if (
        path.startsWith('/_astro/') ||
        path.startsWith('/fonts/pdf/') ||
        path === '/pdf-assets/offline.zip'
      )
        assets.add(path);
    } catch {}
  });
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  page.on('pageerror', (e) => errors.push(e.message));
  await context.addInitScript(() =>
    localStorage.setItem(
      'daykit:consent:v1',
      JSON.stringify({ version: 1, optional: false, timestamp: Date.now() }),
    ),
  );
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  for (let i = 1; i <= 2; i++) {
    const p = pdf.addPage([595, 842]);
    p.drawText(`Sample document ${i}`, { x: 40, y: 740, size: 18, font });
    p.drawText('First paragraph for conversion.', { x: 40, y: 700, size: 12, font });
  }
  pdf.setAuthor('Private author');
  const pdfBytes = Buffer.from(await pdf.save());
  const docx = await Packer.toBuffer(
    new Document({ sections: [{ children: [new Paragraph('Sample document in Word')] }] }),
  );
  const deck = new PptxGenJS();
  deck.addSlide().addText('Sample document in slides', { x: 1, y: 1, w: 8, h: 1 });
  const pptx = Buffer.from(await deck.write({ outputType: 'arraybuffer' }));
  const book = new ExcelJS.Workbook();
  book.addWorksheet('Data').addRow(['Sample document in Excel', '0012']);
  const xlsx = Buffer.from(await book.xlsx.writeBuffer());
  async function visit(slug) {
    assets = new Set();
    await context.setOffline(false);
    await page.goto(`http://127.0.0.1:4321/tools/${slug}/`);
    await page.waitForFunction(
      () =>
        document.querySelector('[data-tool-ready="true"]') ||
        document.querySelector('.image-error'),
    );
    assert.equal(
      await page.locator('.image-error').count(),
      0,
      await page.locator('.pdf-workspace').innerText(),
    );
  }
  async function output() {
    await page.getByRole('button', { name: 'Create download', exact: true }).click();
    await page.waitForFunction(
      () => document.querySelector('a[download]') || document.querySelector('.image-error'),
    );
    assert.equal(
      await page.locator('.image-error').count(),
      0,
      await page.locator('.pdf-workspace').innerText(),
    );
    return Buffer.from(
      await page
        .locator('a[download]')
        .evaluate(async (a) =>
          Array.from(new Uint8Array(await (await fetch(a.href)).arrayBuffer())),
        ),
    );
  }
  async function serviceOutput() {
    // Converter modes: explicit consent, then upload to the service.
    await page.getByRole('button', { name: 'Upload and convert', exact: true }).click();
    await page.waitForFunction(
      () => document.querySelector('a[download]') || document.querySelector('.image-error'),
    );
    assert.equal(
      await page.locator('.image-error').count(),
      0,
      await page.locator('.pdf-workspace').innerText(),
    );
    return Buffer.from(
      await page
        .locator('a[download]')
        .evaluate(async (a) =>
          Array.from(new Uint8Array(await (await fetch(a.href)).arrayBuffer())),
        ),
    );
  }
  const fixtures = {
    'word-to-pdf': ['input.docx', docx],
    'powerpoint-to-pdf': ['input.pptx', pptx],
    'excel-to-pdf': ['input.xlsx', xlsx],
  };
  const modes = process.env.CONVERT_ROUTES?.split(',') || [
    'pdf-to-word',
    'pdf-to-powerpoint',
    'pdf-to-excel',
    'word-to-pdf',
    'powerpoint-to-pdf',
    'excel-to-pdf',
    'rotate-pdf',
    'delete-pdf-pages',
    'add-page-numbers',
    'watermark-pdf',
    'sign-pdf',
    'pdf-metadata',
  ];
  for (const mode of modes) {
    await visit(mode);
    const [name, buffer] = fixtures[mode] || ['input.pdf', pdfBytes];
    await page
      .locator('.image-uploader input[type=file], .upload-zone input[type=file], input[type=file]')
      .first()
      .setInputFiles({ name, mimeType: 'application/octet-stream', buffer });
    if (mode === 'delete-pdf-pages') await page.getByLabel('Page order / selection').fill('2');
    if (mode === 'watermark-pdf')
      await page.getByLabel('Watermark text', { exact: true }).fill('DRAFT');
    if (mode === 'sign-pdf') {
      const png = await page.evaluate(async () => {
        const c = document.createElement('canvas');
        c.width = 150;
        c.height = 40;
        c.getContext('2d').fillText('Sample signature', 5, 25);
        return Array.from(
          new Uint8Array(await (await new Promise((r) => c.toBlob(r))).arrayBuffer()),
        );
      });
      await page
        .getByLabel('Signature image (PNG or JPG)', { exact: true })
        .setInputFiles({ name: 'signature.png', mimeType: 'image/png', buffer: Buffer.from(png) });
    }
    if (CONVERTER_MODES.includes(mode)) {
      if (!CONVERTER_URL) {
        console.log(`skip ${mode}: set CONVERTER_URL to a running converter service to test it`);
        continue;
      }
      await page.getByLabel(CONSENT_LABEL).check();
      const bytes = await serviceOutput();
      assert.ok(bytes.length > 20);
      if (mode === 'pdf-to-word')
        assert.match((await mammoth.extractRawText({ buffer: bytes })).value, /Sample document 1/);
      else if (mode === 'pdf-to-powerpoint') {
        const zip = unzipSync(bytes);
        assert.equal(
          Object.keys(zip).filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n)).length,
          2,
        );
        assert.ok(strFromU8(zip['[Content_Types].xml']).includes('presentationml'));
      } else if (mode === 'pdf-to-excel') {
        const b = new ExcelJS.Workbook();
        await b.xlsx.load(bytes);
        assert.match(String(b.worksheets[0].getCell('A1').value), /Sample document/);
      } else {
        const out = await PDFDocument.load(bytes);
        assert.equal(out.getPageCount(), 1);
        assert.ok(bytes.subarray(0, 4).toString() === '%PDF');
      }
      console.log(mode, bytes.length, '(service)');
      continue;
    }
    // Every operation is performed after disconnecting, not just after an online first run.
    await context.setOffline(true);
    const bytes = await output();
    assert.ok(bytes.length > 20);
    if (mode === 'pdf-to-word')
      assert.match((await mammoth.extractRawText({ buffer: bytes })).value, /Sample document 1/);
    else if (mode === 'pdf-to-powerpoint') {
      const zip = unzipSync(bytes);
      assert.equal(
        Object.keys(zip).filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n)).length,
        2,
      );
      assert.ok(Object.keys(zip).some((n) => n.startsWith('ppt/media/')));
      assert.ok(strFromU8(zip['[Content_Types].xml']).includes('presentationml'));
    } else if (mode === 'pdf-to-excel') {
      const b = new ExcelJS.Workbook();
      await b.xlsx.load(bytes);
      assert.equal(b.worksheets.length, 2);
      assert.match(String(b.worksheets[0].getCell('A1').value), /Sample document/);
    } else if (mode.endsWith('text')) assert.match(bytes.toString('utf8'), /Sample document 1/);
    else {
      const out = await PDFDocument.load(bytes);
      assert.equal(out.getPageCount(), fixtures[mode] ? 1 : mode === 'delete-pdf-pages' ? 1 : 2);
      if (mode === 'rotate-pdf') assert.equal(out.getPage(0).getRotation().angle, 90);
      if (mode === 'pdf-metadata') assert.equal(out.getAuthor(), undefined);
      if (fixtures[mode]) {
        const moduleUrl =
          '/_astro/' +
          fs
            .readdirSync('dist/_astro')
            .find((f) => f.startsWith('pdf-render.') && f.endsWith('.js'));
        const text = await page.evaluate(
          async ({ moduleUrl, bytes }) => {
            const { openPdf } = await import(moduleUrl);
            const p = await openPdf(new File([new Uint8Array(bytes)], 'result.pdf'));
            try {
              return (await (await p.getPage(1)).getTextContent()).items
                .map((i) => i.str || '')
                .join(' ');
            } finally {
              await p.loadingTask.destroy();
            }
          },
          { moduleUrl, bytes: Array.from(bytes) },
        );
        assert.match(text, /Sample document/);
      }
    }
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    assert.deepEqual(
      axe.violations.map((v) => v.id),
      [],
      mode,
    );
    const js = [...assets].filter((path) => /\.m?js$/.test(path) && fs.existsSync(`dist${path}`));
    const data = [...assets].filter(
      (path) => !/\.m?js$/.test(path) && fs.existsSync(`dist${path}`),
    );
    const { gzipSync } = await import('node:zlib');
    report.push({
      mode,
      bytes: bytes.length,
      offline: true,
      accessibilityViolations: 0,
      javascriptBytes: js.reduce((n, path) => n + fs.statSync(`dist${path}`).size, 0),
      javascriptGzipBytes: js.reduce(
        (n, path) => n + gzipSync(fs.readFileSync(`dist${path}`)).length,
        0,
      ),
      assetBytes: data.reduce((n, path) => n + fs.statSync(`dist${path}`).size, 0),
      javascriptFiles: js,
    });
    console.log(mode, bytes.length);
  }
  if (!process.env.CONVERT_ROUTES) {
    // Password-protected PDF through the service (or a clear config error without one).
    await visit('pdf-to-word');
    await page.locator('input[type=file]').first().setInputFiles('tests/fixtures/encrypted.pdf');
    await page.getByLabel(CONSENT_LABEL).check();
    await page.getByRole('button', { name: 'Upload and convert', exact: true }).click();
    await page.getByRole('alert').waitFor();
    assert.match(
      await page.getByRole('alert').innerText(),
      CONVERTER_URL ? /password/i : /not configured/i,
    );
    // Without consent the upload must be refused with a clear message.
    await visit('pdf-to-word');
    await page
      .locator('input[type=file]')
      .first()
      .setInputFiles({ name: 'input.pdf', mimeType: 'application/pdf', buffer: pdfBytes });
    await page.getByRole('button', { name: 'Upload and convert', exact: true }).click();
    await page.getByRole('alert').waitFor();
    assert.match(await page.getByRole('alert').innerText(), /consent/i);
    if (CONVERTER_URL) {
      // Cancel an in-flight service upload.
      await visit('pdf-to-powerpoint');
      await page
        .locator('input[type=file]')
        .first()
        .setInputFiles({ name: 'input.pdf', mimeType: 'application/pdf', buffer: pdfBytes });
      await page.getByLabel(CONSENT_LABEL).check();
      await page.getByRole('button', { name: 'Upload and convert', exact: true }).click();
      await page.getByRole('button', { name: 'Cancel', exact: true }).click();
      await page.locator('[data-tool-ready=true]').waitFor();
      assert.equal(await page.locator('a[download]').count(), 0);
    } else {
      console.log('skip converter cancel test: CONVERTER_URL not set');
    }
  }
  assert.deepEqual(errors, []);
  fs.writeFileSync('qa-converters.json', JSON.stringify({ report, errors }, null, 2));
} finally {
  await browser.close();
}
