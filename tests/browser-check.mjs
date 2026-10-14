// Optional browser QA: pass an installed Playwright module and Chromium executable.
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  headless: true,
});
try {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.addInitScript(() => {
      window.__cls = 0;
      new PerformanceObserver((list) => {
        for (const item of list.getEntries()) if (!item.hadRecentInput) window.__cls += item.value;
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Necessary only', exact: true }).waitFor();
    const before = await page.locator('.ad-slot').boundingBox();
    assert.equal(before.height, width < 601 ? 122 : 112);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: `qa-${width}.png`, fullPage: true });
    const initialCls = await page.evaluate(() => window.__cls);
    assert.ok(initialCls < 0.1, `Initial CLS ${initialCls}`);
    await page.getByRole('button', { name: 'Necessary only', exact: true }).click();
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('.consent').count(), 0);
    await page.getByRole('button', { name: 'Cookie preferences', exact: true }).click();
    await page.getByRole('button', { name: 'Allow optional cookies', exact: true }).click();
    assert.equal(
      await page.evaluate(() => JSON.parse(localStorage.getItem('daykit:consent:v1')).optional),
      true,
    );
    const after = await page.locator('.ad-slot').boundingBox();
    assert.equal(after.height, before.height);
    const cls = await page.evaluate(() => window.__cls);
    assert.ok(cls < 0.1, `CLS ${cls}`);
    assert.deepEqual(errors, []);
    console.log(
      JSON.stringify({
        width,
        initialCls,
        cls,
        adHeight: after.height,
        consent: 'passed',
        overflow: 'none',
        errors,
      }),
    );
    await context.close();
  }
} finally {
  await browser.close();
}
