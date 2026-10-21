import { chromium } from 'playwright-core';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  headless: true,
});
const report = [];
const base = process.env.BASE_URL || 'http://127.0.0.1:4321';
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push({ url: page.url(), message: e.message }));
  const routes = fs.readdirSync('dist',{recursive:true}).filter(f=>f.endsWith('index.html')).map(f=>'/'+f.replaceAll('\\','/').replace(/index\.html$/,''));
  for (const route of routes) {
    const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
    assert.equal(response.status(),200,route);
    assert.equal(await page.locator('.consent,.ad-slot').count(),0);
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
  for (const route of JSON.parse(fs.readFileSync('dist/publication.json','utf8')).excludedTools) {
    const response=await page.goto(base+route); assert.equal(response.status(),404,route);
  }
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.locator('.menu-toggle').click();
  assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
  await page.screenshot({path: 'qa-genesis-mobile.png', fullPage: true});
  await page.setViewportSize({width: 1440, height: 1000});
  await page.screenshot({path: 'qa-genesis-desktop.png', fullPage: true});
  const sizes = {};
  assert.equal(await page.locator('.ad-slot').count(), 0, 'Disabled ads must not render placeholders');
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
