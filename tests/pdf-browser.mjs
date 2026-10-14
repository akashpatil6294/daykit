import { chromium } from 'playwright-core';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { unzipSync } from 'fflate';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  headless: true,
});
const report = [];
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  page.setDefaultTimeout(120000);
  await context.addInitScript(() =>
    localStorage.setItem(
      'daykit:consent:v1',
      JSON.stringify({ version: 1, optional: false, timestamp: Date.now() }),
    ),
  );
  const source = await PDFDocument.create();
  const font = await source.embedFont(StandardFonts.Helvetica);
  for (let n = 1; n <= 30; n++) {
    const p = source.addPage([595, 842]);
    p.drawText(`Document page ${n}`, { x: 45, y: 780, size: 24, font });
    p.drawText('Name: SAMPLE APPLICANT   Reference: 123456789', { x: 45, y: 740, size: 12, font });
  }
  const bytes = await source.save();
  const file = {
    name: 'thirty-pages.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(bytes),
  };
  const result = async () => {
    await page.getByRole('button', { name: 'Create download', exact: true }).click();
    await page.getByRole('heading', { name: 'Ready to download' }).waitFor();
    const href = await page.locator('a[download]').getAttribute('href');
    return Buffer.from(
      await page.evaluate(
        async (url) => Array.from(new Uint8Array(await (await fetch(url)).arrayBuffer())),
        href,
      ),
    );
  };
  for (const mode of [
    'merge-pdf',
    'split-pdf',
    'reorder-pdf',
    'images-to-pdf',
    'pdf-to-images',
    'compress-pdf',
  ]) {
    await page.goto(`http://127.0.0.1:4321/tools/${mode}/`, { waitUntil: 'networkidle' });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), mode);
    if (mode === 'images-to-pdf') {
      const png = await page.evaluate(() => {
        const c = document.createElement('canvas');
        c.width = 600;
        c.height = 800;
        const x = c.getContext('2d');
        x.fillStyle = 'white';
        x.fillRect(0, 0, 600, 800);
        x.fillStyle = 'black';
        x.font = '24px sans-serif';
        x.fillText('Readable image page', 40, 60);
        return c.toDataURL().split(',')[1];
      });
      await page
        .locator('input[type=file]')
        .setInputFiles({
          name: 'scan.png',
          mimeType: 'image/png',
          buffer: Buffer.from(png, 'base64'),
        });
    } else
      await page
        .locator('input[type=file]')
        .setInputFiles(mode === 'merge-pdf' ? [file, file] : file);
    if (['split-pdf', 'reorder-pdf'].includes(mode))
      await page.locator('input:not([type])').fill('3,1,4-5');
    await page.evaluate(() => {
      window.gaps = [];
      let last = performance.now();
      window.tick = setInterval(() => {
        const now = performance.now();
        window.gaps.push(now - last);
        last = now;
      }, 16);
    });
    const out = await result();
    const maxGap = await page.evaluate(() => {
      clearInterval(window.tick);
      return Math.max(...window.gaps);
    });
    if (mode === 'pdf-to-images') assert.equal(Object.keys(unzipSync(out)).length, 30);
    else {
      const pdf = await PDFDocument.load(out);
      assert.equal(
        pdf.getPageCount(),
        mode === 'merge-pdf'
          ? 60
          : ['split-pdf', 'reorder-pdf'].includes(mode)
            ? 4
            : mode === 'images-to-pdf'
              ? 1
              : 30,
      );
    }
    if (mode === 'compress-pdf') assert.ok(out.length <= 200 * 1024);
    report.push({ mode, bytes: out.length, maxHeartbeatGapMs: Math.round(maxGap) });
  }
  await page.goto('http://127.0.0.1:4321/tools/compress-pdf/');
  const scan = await page.evaluate(() => {
    const c = document.createElement('canvas');
    c.width = 2400;
    c.height = 3400;
    const ctx = c.getContext('2d');
    const pixels = ctx.createImageData(c.width, c.height);
    let seed = 7;
    for (let i = 0; i < pixels.data.length; i += 4) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const shade = 245 + (seed % 11);
      pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = shade;
      pixels.data[i + 3] = 255;
    }
    ctx.putImageData(pixels, 0, 0);
    ctx.fillStyle = '#111';
    ctx.font = 'bold 84px sans-serif';
    ctx.fillText('SAMPLE APPLICATION FORM', 140, 220);
    ctx.font = '48px sans-serif';
    for (let n = 0; n < 22; n++) {
      const y = 400 + n * 115;
      ctx.fillText(`${n + 1}. Reference 123456789 - Name: SAMPLE APPLICANT`, 140, y);
      ctx.fillRect(140, y + 30, 2050, 2);
    }
    return c.toDataURL('image/png').split(',')[1];
  });
  const scanned = await PDFDocument.create();
  const embedded = await scanned.embedPng(Buffer.from(scan, 'base64'));
  scanned.addPage([595, 842]).drawImage(embedded, { x: 0, y: 0, width: 595, height: 842 });
  const scannedBytes = await scanned.save();
  assert.ok(scannedBytes.length > 5 * 1024 * 1024, `Fixture too small: ${scannedBytes.length}`);
  await page
    .locator('input[type=file]')
    .setInputFiles({
      name: 'scanned-form.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from(scannedBytes),
    });
  const compressed = await result();
  assert.ok(compressed.length < 200 * 1024);
  await page.locator('.image-preview img').screenshot({ path: 'qa-compressed-form.png' });
  report.push({
    mode: 'scanned-form',
    inputBytes: scannedBytes.length,
    outputBytes: compressed.length,
  });
  await page.goto('http://127.0.0.1:4321/tools/merge-pdf/');
  await page
    .locator('input[type=file]')
    .setInputFiles({
      name: 'broken.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('broken'),
    });
  await page.getByRole('button', { name: 'Create download' }).click();
  await page.getByRole('alert').waitFor();
  fs.writeFileSync('qa-pdf.json', JSON.stringify(report, null, 2));
  console.log(report);
} finally {
  await browser.close();
}
