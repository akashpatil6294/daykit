import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { calculatorSlugs } from '../src/data/calculators.ts';
import AxeBuilder from '@axe-core/playwright';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  headless: true,
});
const report = [];
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addInitScript(() =>
    localStorage.setItem(
      'daykit:consent:v1',
      JSON.stringify({ version: 1, optional: false, timestamp: Date.now() }),
    ),
  );
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const slug of calculatorSlugs) {
    await page.goto(`http://127.0.0.1:4321/calculators/${slug}/`, { waitUntil: 'networkidle' });
    await page.locator('.calculator-results dd').first().waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), slug);
    if (slug === 'emi') {
      await page.getByRole('spinbutton', { name: 'Annual rate (%)', exact: true }).fill('12');
      await page.getByRole('spinbutton', { name: 'Term (months)', exact: true }).fill('12');
      await page.waitForTimeout(250);
      assert.ok(
        (await page.locator('.calculator-results dd').first().textContent()).includes('8,884.88'),
      );
      await page.getByRole('spinbutton', { name: 'Annual rate (%)', exact: true }).fill('0');
      await page.waitForTimeout(250);
      assert.ok(
        (await page.locator('.calculator-results dd').first().textContent()).includes('8,333.33'),
      );
      await page.getByLabel('Display currency').selectOption('USD');
      assert.ok(
        (await page.locator('.calculator-results dd').first().textContent()).includes('USD'),
      );
      const axe = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      assert.equal(
        axe.violations.length,
        0,
        JSON.stringify(
          axe.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
        ),
      );
      await page.screenshot({ path: 'qa-calculator-mobile.png', fullPage: true });
    }
    if (slug === 'gst') {
      await page.getByLabel('Amount', { exact: true }).fill('1180');
      await page.getByLabel('Price includes GST').check();
      await page.waitForTimeout(250);
      assert.ok(
        (await page.locator('.calculator-results dd').first().textContent()).includes('1,000'),
      );
    }
    if (slug === 'percentage') {
      await page.getByLabel('Percentage calculation').selectOption('ratio');
      await page.getByLabel('Y', { exact: true }).fill('0');
      await page.getByText('A percentage cannot be calculated from a zero base.').waitFor();
    }
    report.push({ slug, passed: true });
  }
  assert.deepEqual(errors, []);
  writeFileSync('qa-calculators.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} finally {
  await browser.close();
}
