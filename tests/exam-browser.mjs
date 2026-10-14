// Adds one synthetic JSON record, builds and checks it, then always restores the real dataset.
// This proves that adding an exam needs no source-code or route edits.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import assert from 'node:assert/strict';
import AxeBuilder from '@axe-core/playwright';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const original = readFileSync('data/exams.json');
const records = JSON.parse(original);
const astroPackage = JSON.parse(readFileSync('node_modules/astro/package.json', 'utf8'));
const astroBin = path.resolve(
  'node_modules/astro',
  typeof astroPackage.bin === 'string' ? astroPackage.bin : astroPackage.bin.astro,
);
const build = () => execFileSync(process.execPath, [astroBin, 'build'], { stdio: 'pipe' });
let browser;
const report = [];
try {
  records.push({
    slug: 'test-only-preset',
    name: 'Synthetic test record',
    photo_spec: { width: 300, height: 400, min_kb: 20, max_kb: 40, format: 'jpg' },
    signature_spec: { width: 400, height: 100, min_kb: 0, max_kb: 40, format: 'png' },
    source_url: null,
    last_verified: null,
    verified: false,
  });
  writeFileSync('data/exams.json', JSON.stringify(records, null, 2));
  build();
  assert.ok(existsSync('dist/resize-photo-signature-test-only-preset/index.html'));
  assert.ok(
    readFileSync('dist/sitemap.xml', 'utf8').includes('/resize-photo-signature-test-only-preset/'),
  );
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addInitScript(() =>
    localStorage.setItem(
      'daykit:consent:v1',
      JSON.stringify({ version: 1, optional: false, timestamp: Date.now() }),
    ),
  );
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const ready = () =>
    page.getByText('Ready · works offline in this tab', { exact: true }).waitFor();
  async function image() {
    await page.evaluate(async () => {
      const c = document.createElement('canvas');
      c.width = 800;
      c.height = 400;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#eee';
      ctx.fillRect(0, 0, 800, 400);
      ctx.fillStyle = '#112233';
      ctx.fillRect(20, 100, 760, 200);
      const blob = await new Promise((resolve) => c.toBlob(resolve, 'image/png'));
      const data = new DataTransfer();
      data.items.add(new File([blob], 'test.png', { type: 'image/png' }));
      const input = document.querySelector('input[type=file]');
      input.files = data.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.locator('.image-workspace').waitFor();
  }
  async function result() {
    await page.getByRole('link', { name: 'Download image' }).waitFor();
    return page.evaluate(async () => {
      const blob = await fetch(document.querySelector('a[download]').href).then((r) => r.blob());
      const b = await createImageBitmap(blob);
      const c = new OffscreenCanvas(b.width, b.height);
      const ctx = c.getContext('2d');
      ctx.drawImage(b, 0, 0);
      return {
        width: b.width,
        height: b.height,
        size: blob.size,
        type: blob.type,
        corner: [...ctx.getImageData(0, 0, 1, 1).data],
      };
    });
  }
  await page.goto('http://127.0.0.1:4321/resize-photo-signature-ssc/');
  await ready();
  await image();
  for (const field of [
    'Width (px)',
    'Height (px)',
    'Maximum file size (KB)',
    'Minimum file size (KB, optional)',
  ])
    assert.equal(await page.getByLabel(field, { exact: true }).inputValue(), '');
  assert.equal(await page.getByLabel('Output format').inputValue(), '');
  await page.screenshot({ path: 'qa-exam-ssc.png', fullPage: true });
  await page.getByRole('button', { name: 'Crop and resize', exact: true }).click();
  assert.equal(await page.getByRole('link', { name: 'Download image' }).count(), 0);
  await page.getByLabel('Width (px)', { exact: true }).fill('300');
  await page.getByLabel('Height (px)', { exact: true }).fill('400');
  await page.getByLabel('Maximum file size (KB)', { exact: true }).fill('50');
  await page.getByLabel('Minimum file size (KB, optional)', { exact: true }).fill('60');
  await page.getByLabel('Output format').selectOption('jpeg');
  await page.getByRole('button', { name: 'Crop and resize', exact: true }).click();
  await page.getByRole('alert').filter({ hasText: 'cannot all be met' }).waitFor();
  report.push({ test: 'unknown-specs-stay-blank/invalid-range', passed: true });
  await page.goto('http://127.0.0.1:4321/resize-photo-signature-test-only-preset/');
  await ready();
  await image();
  assert.equal(await page.getByLabel('Width (px)', { exact: true }).inputValue(), '300');
  assert.equal(await page.getByLabel('Height (px)', { exact: true }).inputValue(), '400');
  assert.equal(await page.getByLabel('Maximum file size (KB)', { exact: true }).inputValue(), '40');
  assert.equal(
    await page.getByLabel('Minimum file size (KB, optional)', { exact: true }).inputValue(),
    '20',
  );
  assert.equal(await page.getByLabel('Output format').inputValue(), 'jpeg');
  await context.setOffline(true);
  await page.getByRole('button', { name: 'Crop and resize', exact: true }).click();
  const photo = await result();
  assert.deepEqual([photo.width, photo.height], [300, 400]);
  assert.ok(photo.size >= 20 * 1024 && photo.size <= 40 * 1024);
  report.push({ test: 'json-only-route/prefilled-photo/offline', photo });
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  report.push({
    test: 'accessibility',
    violations: axe.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => n.target),
    })),
  });
  await page.screenshot({ path: 'qa-exam-mobile.png', fullPage: true });
  assert.equal(axe.violations.length, 0, JSON.stringify(report.at(-1)));
  await page.getByRole('button', { name: 'Signature', exact: true }).click();
  await ready();
  await image();
  assert.equal(await page.getByLabel('Width (px)', { exact: true }).inputValue(), '400');
  assert.equal(await page.getByLabel('Height (px)', { exact: true }).inputValue(), '100');
  assert.equal(await page.getByLabel('Output format').inputValue(), 'png');
  await page.getByRole('button', { name: 'Resize image', exact: true }).click();
  const signature = await result();
  assert.deepEqual([signature.width, signature.height], [400, 100]);
  assert.equal(signature.type, 'image/png');
  assert.deepEqual(signature.corner, [255, 255, 255, 255]);
  report.push({ test: 'signature-fit/prefilled-png/offline', signature });
  await page.getByLabel('Minimum file size (KB, optional)', { exact: true }).fill('30');
  await page.getByRole('button', { name: 'Resize image', exact: true }).click();
  await page.getByRole('alert').filter({ hasText: 'PNG is not padded' }).waitFor();
  assert.equal(await page.getByRole('link', { name: 'Download image' }).count(), 0);
  report.push({ test: 'impossible-png-range-rejected', passed: true });
  assert.deepEqual(errors, []);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  writeFileSync('qa-exam-report.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser?.close();
  writeFileSync('data/exams.json', original);
  build();
  execFileSync(process.execPath, ['scripts/localize.mjs'], { stdio: 'pipe' });
  assert.ok(!existsSync('dist/resize-photo-signature-test-only-preset/index.html'));
}
