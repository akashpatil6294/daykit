// Run against npm run preview. PLAYWRIGHT_MODULE and CHROMIUM_PATH can select existing installations.
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, statSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  headless: true,
});
const report = [];
function record(item) {
  report.push(item);
  writeFileSync('qa-image-report.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(item));
}
async function open(slug, width = 390) {
  const context = await browser.newContext({
    viewport: { width, height: 844 },
    acceptDownloads: true,
  });
  await context.addInitScript(() =>
    localStorage.setItem(
      'daykit:consent:v1',
      JSON.stringify({ version: 1, optional: false, timestamp: Date.now() }),
    ),
  );
  const page = await context.newPage();
  const errors = [];
  const external = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (r) => {
    if (
      r.url().startsWith('http') &&
      !r.url().startsWith('http://127.0.0.1:4321/') &&
      !r.url().includes('font')
    )
      external.push(r.url());
  });
  await page.goto(`http://127.0.0.1:4321/tools/${slug}/`, { waitUntil: 'networkidle' });
  await page
    .getByText('Ready · works offline in this tab', { exact: true })
    .waitFor({ timeout: 45000 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), slug);
  await context.setOffline(true);
  return { context, page, errors, external };
}
async function makeFile(page, type = 'image/png', large = false) {
  return page.evaluate(
    async ({ type, large }) => {
      const c = document.createElement('canvas');
      c.width = large ? 1800 : 800;
      c.height = large ? 1400 : 600;
      const ctx = c.getContext('2d');
      if (large) {
        const data = ctx.createImageData(c.width, c.height);
        let seed = 12345;
        for (let i = 0; i < data.data.length; i++) {
          seed ^= seed << 13;
          seed ^= seed >>> 17;
          seed ^= seed << 5;
          data.data[i] = seed & 255;
        }
        ctx.putImageData(data, 0, 0);
      } else {
        ctx.fillStyle = '#ee2211';
        ctx.fillRect(0, 0, 400, 600);
        ctx.fillStyle = '#1133ee';
        ctx.fillRect(400, 0, 400, 600);
        ctx.clearRect(0, 0, 40, 40);
      }
      const blob = await new Promise((resolve) => c.toBlob(resolve, type, 0.94));
      window.testFile = new File([blob], `fixture.${type.split('/')[1]}`, { type });
      return blob.size;
    },
    { type, large },
  );
}
async function selectGenerated(page) {
  await page.evaluate(() => {
    const transfer = new DataTransfer();
    transfer.items.add(window.testFile);
    const input = document.querySelector('input[type=file]');
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.locator('.image-workspace').waitFor({ timeout: 60000 });
}
async function makeNamedFile(page, { name, width, height, color, noise = false }) {
  return page.evaluate(
    async ({ name, width, height, color, noise }) => {
      const c = document.createElement('canvas');
      c.width = width;
      c.height = height;
      const ctx = c.getContext('2d');
      if (noise) {
        const data = ctx.createImageData(width, height);
        let seed = 98765;
        for (let i = 0; i < data.data.length; i += 4) {
          seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
          data.data[i] = 200 + (seed & 55);
          data.data[i + 1] = seed & 30;
          data.data[i + 2] = seed & 30;
          data.data[i + 3] = 255;
        }
        ctx.putImageData(data, 0, 0);
      } else {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);
      }
      const blob = await new Promise((resolve) => c.toBlob(resolve, 'image/png'));
      window.testFile = new File([blob], name, { type: 'image/png' });
      return blob.size;
    },
    { name, width, height, color, noise },
  );
}
async function output(page) {
  await page.getByRole('link', { name: 'Download image' }).waitFor({ timeout: 60000 });
  return page.evaluate(async () => {
    const blob = await fetch(document.querySelector('a[download]').href).then((r) => r.blob());
    const image = await createImageBitmap(blob);
    const c = new OffscreenCanvas(image.width, image.height);
    const ctx = c.getContext('2d');
    ctx.drawImage(image, 0, 0);
    const corner = [...ctx.getImageData(0, 0, 1, 1).data];
    const center = [
      ...ctx.getImageData(Math.floor(image.width / 2), Math.floor(image.height / 2), 1, 1).data,
    ];
    const result = {
      size: blob.size,
      type: blob.type,
      width: image.width,
      height: image.height,
      corner,
      center,
    };
    image.close();
    return result;
  });
}
try {
  {
    const { context, page, errors, external } = await open('resize-image-kb');
    const bytes = await makeFile(page, 'image/png', true);
    assert.ok(bytes > 9 * 1024 * 1024 && bytes <= 10 * 1024 * 1024);
    const session = await context.newCDPSession(page);
    await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.evaluate(() => {
      window.longTasks = [];
      new PerformanceObserver((list) =>
        list.getEntries().forEach((entry) => window.longTasks.push(entry.duration)),
      ).observe({ type: 'longtask' });
      window.ticks = 0;
      window.tickInterval = setInterval(() => window.ticks++, 50);
    });
    await selectGenerated(page);
    await page.getByLabel('Target file size (KB)').fill('100');
    await page.getByRole('button', { name: 'Resize image', exact: true }).click();
    const result = await output(page);
    assert.ok(result.size >= 0.95 * 102400 && result.size <= 102400);
    assert.equal(result.type, 'image/jpeg');
    const timing = await page.evaluate(() => ({
      maxLongTask: Math.max(0, ...window.longTasks),
      ticks: window.ticks,
    }));
    assert.ok(timing.ticks > 5);
    assert.ok(timing.maxLongTask < 250, JSON.stringify(timing));
    const downloadEvent = page.waitForEvent('download');
    await page.getByRole('link', { name: 'Download image' }).click();
    const download = await downloadEvent;
    assert.ok(download.suggestedFilename().endsWith('.jpg'));
    assert.equal(statSync(await download.path()).size, result.size);
    await page.getByLabel('Target file size (KB)').fill('2');
    await page.getByRole('button', { name: 'Resize image', exact: true }).click();
    const tiny = await output(page);
    assert.ok(tiny.size >= 0.95 * 2048 && tiny.size <= 2048);
    assert.ok(tiny.width < 1800);
    await page.screenshot({ path: 'qa-image-mobile.png', fullPage: true });
    assert.deepEqual(errors, []);
    assert.deepEqual(external, []);
    record({
      test: 'near-10MiB/mobile/offline/size/downscale/download',
      inputBytes: bytes,
      result,
      tiny,
      timing,
    });
    await context.close();
  }
  {
    const { context, page } = await open('resize-image-kb', 1440);
    await makeFile(page);
    await selectGenerated(page);
    await page.getByLabel('Target file size (KB)').fill('100');
    await page.getByRole('button', { name: 'Resize image', exact: true }).click();
    const result = await output(page);
    assert.ok(result.size >= 0.95 * 102400 && result.size <= 102400);
    await page.getByText(/JPEG comment padding added/).waitFor();
    record({ test: 'padding/simple-image', result });
    await context.close();
  }
  {
    const { context, page } = await open('resize-image-pixels');
    await makeFile(page);
    await selectGenerated(page);
    await page.getByLabel('Width (px)', { exact: true }).fill('400');
    assert.equal(await page.getByLabel('Height (px)', { exact: true }).inputValue(), '300');
    await page.getByRole('button', { name: 'Resize image', exact: true }).click();
    assert.deepEqual(((r) => [r.width, r.height])(await output(page)), [400, 300]);
    await page.getByLabel('Keep aspect ratio').uncheck();
    await page.getByLabel('Height (px)', { exact: true }).fill('250');
    assert.equal(await page.getByRole('link', { name: 'Download image' }).count(), 0);
    await page.getByRole('button', { name: 'Resize image', exact: true }).click();
    const result = await output(page);
    assert.deepEqual([result.width, result.height], [400, 250]);
    record({ test: 'aspect-lock/unlocked/stale-result-cleared', result });
    await context.close();
  }
  for (const [slug, type, out] of [
    ['jpg-to-png', 'image/jpeg', 'image/png'],
    ['png-to-jpg', 'image/png', 'image/jpeg'],
    ['webp-to-jpg', 'image/webp', 'image/jpeg'],
    ['heic-to-jpg', 'image/heic', 'image/jpeg'],
  ]) {
    const { context, page, errors, external } = await open(slug);
    if (type === 'image/heic') {
      await page.locator('input[type=file]').setInputFiles({
        name: 'example.heic',
        mimeType: type,
        buffer: readFileSync('tests/fixtures/example.heic'),
      });
      await page.locator('.image-workspace').waitFor({ timeout: 60000 });
    } else {
      await makeFile(page, type);
      await selectGenerated(page);
    }
    await page.getByRole('button', { name: 'Convert image', exact: true }).click();
    const result = await output(page);
    assert.equal(result.type, out);
    if (type !== 'image/heic') assert.deepEqual([result.width, result.height], [800, 600]);
    if (type === 'image/png' || type === 'image/webp')
      assert.ok(result.corner.slice(0, 3).every((x) => x >= 245));
    assert.deepEqual(errors, []);
    assert.deepEqual(external, []);
    record({ test: `${slug}/offline/decoded-output`, result });
    await context.close();
  }
  {
    const { context, page } = await open('passport-photo', 1440);
    await makeFile(page);
    await selectGenerated(page);
    await page.getByLabel('Photo size preset').selectOption('portrait');
    await page.getByLabel('Zoom', { exact: true }).fill('2');
    await page.getByLabel('Horizontal position', { exact: true }).fill('100');
    await page.getByRole('button', { name: 'Crop and resize', exact: true }).click();
    const result = await output(page);
    assert.deepEqual([result.width, result.height], [420, 540]);
    assert.ok(result.center[2] > 200 && result.center[0] < 50);
    await page.screenshot({ path: 'qa-crop-desktop.png', fullPage: true });
    record({ test: 'crop/preset/position/content', result });
    await context.close();
  }
  {
    const { context, page } = await open('resize-image-kb');
    await page.locator('input[type=file]').setInputFiles({
      name: 'fake.png',
      mimeType: 'image/png',
      buffer: Buffer.from('not an image'),
    });
    await page.getByRole('alert').filter({ hasText: 'not a supported image' }).waitFor();
    await page.locator('input[type=file]').setInputFiles({
      name: 'large.png',
      mimeType: 'image/png',
      buffer: Buffer.alloc(10 * 1024 * 1024 + 1),
    });
    await page.getByRole('alert').filter({ hasText: 'no larger than' }).waitFor();
    await makeFile(page, 'image/png', false);
    await selectGenerated(page);
    await page.getByRole('button', { name: 'Choose another image' }).click();
    await page.getByText('Ready · works offline in this tab', { exact: true }).waitFor();
    assert.equal(await page.getByRole('link', { name: 'Download image' }).count(), 0);
    assert.ok(await page.locator('input[type=file]').isEnabled());
    record({ test: 'invalid/oversize/reset-clears-workspace', passed: true });
    await context.close();
  }
  {
    const { context, page } = await open('resize-image-kb');
    // Prepare Image A: large noisy image (takes >400ms to compress in worker)
    await makeNamedFile(page, {
      name: 'file-a-red.png',
      width: 2400,
      height: 1800,
      color: '#ee2211',
      noise: true,
    });
    await selectGenerated(page);
    await page.locator('.image-workspace img').waitFor();

    // Start processing A
    await page.getByRole('button', { name: 'Resize image', exact: true }).click();

    // Cancel while A is actively in flight
    const cancelBtn = page.getByRole('button', { name: 'Cancel and clear image', exact: true });
    await cancelBtn.waitFor({ state: 'visible' });
    await cancelBtn.click();

    // Immediately load visibly different Image B (solid blue 400x300)
    await makeNamedFile(page, {
      name: 'file-b-blue.png',
      width: 400,
      height: 300,
      color: '#0022ee',
      noise: false,
    });
    await selectGenerated(page);
    await page.locator('.image-workspace img').waitFor();

    // Process B
    await page.getByRole('button', { name: 'Resize image', exact: true }).click();
    const downloadLink = page.getByRole('link', { name: 'Download image' });
    await downloadLink.waitFor({ state: 'visible', timeout: 30000 });

    // Allow any trailing completion or delayed error from cancelled job A to arrive
    await page.waitForTimeout(1000);

    // Verify filename belongs to B, not A
    const downloadAttr = await downloadLink.getAttribute('download');
    assert.ok(
      downloadAttr.includes('file-b-blue'),
      `Download filename should contain file-b-blue but was: ${downloadAttr}`,
    );
    assert.ok(
      !downloadAttr.includes('file_a_red'),
      'Download filename must NOT contain cancelled file_a_red!',
    );

    // Verify downloaded image content is B's dimensions and color
    const res = await output(page);
    assert.equal(res.width, 400, `Expected B width 400, got ${res.width}`);
    assert.equal(res.height, 300, `Expected B height 300, got ${res.height}`);
    assert.ok(
      res.center[2] > 180 && res.center[0] < 50,
      `Expected blue center pixel from B, got RGBA: ${res.center.join(',')}`,
    );

    // Verify no unhandled error alerts
    assert.equal(await page.getByRole('alert').count(), 0);

    // Verify busy state is false
    assert.equal(await page.locator('.working-dot').count(), 0);

    record({
      test: 'cancellation-race-overridden-by-new-job',
      passed: true,
      downloadAttr,
      result: { width: res.width, height: res.height, center: res.center },
    });
    await context.close();
  }
  writeFileSync('qa-image-report.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
