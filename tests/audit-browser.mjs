import { chromium } from 'playwright-core';
import AxeBuilder from '@axe-core/playwright';
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
  const errors = [];
  page.on('pageerror', (e) => errors.push({ url: page.url(), message: e.message }));
  await page.addInitScript(() =>
    localStorage.setItem(
      'daykit:consent:v1',
      JSON.stringify({ version: 1, optional: false, timestamp: Date.now() }),
    ),
  );
  for (const route of [
    '/',
    '/tools/',
    '/tools/compress-pdf/',
    '/tools/resize-image-kb/',
    '/resize-photo-signature-ssc/',
    '/calculators/emi/',
    '/guides/',
    '/guides/understand-emi-amortization/',
    '/privacy/',
    '/hi/tools/compress-pdf/',
    '/ta/guides/choose-image-format/',
    '/bn/calculators/age/',
  ]) {
    await page.goto(`http://127.0.0.1:4321${route}`, { waitUntil: 'networkidle' });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    report.push({
      route,
      overflow,
      violations: axe.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    });
  }
  await page.goto('http://127.0.0.1:4321/tools/resize-image-kb/', { waitUntil: 'networkidle' });
  const sizes = {};
  for (const size of ['leaderboard', 'in-content', 'sidebar', 'sticky-mobile']) {
    sizes[size] = await page
      .locator('.ad-slot')
      .first()
      .evaluate((el, size) => {
        el.className = `ad-slot ad-${size}`;
        const r = el.getBoundingClientRect();
        return { width: r.width, height: r.height };
      }, size);
    assert.ok(sizes[size].height >= 70);
  }
  await page.keyboard.press('Tab');
  assert.ok(await page.evaluate(() => document.activeElement !== document.body));
  const result = { pages: report, adSizes: sizes, errors };
  fs.writeFileSync('qa-browser-audit.json', JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  assert.ok(report.every((p) => !p.overflow && !p.violations.length));
  assert.equal(errors.length, 0);
} finally {
  await browser.close();
}
