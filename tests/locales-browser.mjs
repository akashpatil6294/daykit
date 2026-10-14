import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  headless: true,
});
const report = [];
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const locale of ['hi', 'kn', 'ta', 'te', 'mr', 'bn']) {
    const dict = JSON.parse(fs.readFileSync(`src/i18n/machine/${locale}.json`)).strings;
    await page.goto(`http://127.0.0.1:4321/${locale}/calculators/emi/`, {
      waitUntil: 'networkidle',
    });
    assert.equal(await page.locator('html').getAttribute('lang'), locale);
    await page.locator('.calculator-results dd').first().waitFor();
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      locale,
    );
    assert.equal(
      await page.locator('#language-switcher').inputValue(),
      `/${locale}/calculators/emi/`,
    );
    const input = page.getByRole('spinbutton', { name: dict['Annual rate (%)'], exact: true });
    await input.fill('0');
    await page.waitForTimeout(250);
    assert.ok(
      (await page.locator('.calculator-results dd').first().textContent()).includes('1,666.67'),
    );
    await page.locator('#language-switcher').selectOption('/calculators/emi/');
    await page.waitForURL('**/calculators/emi/');
    assert.equal(await page.locator('html').getAttribute('lang'), 'en');
    report.push({ locale, passed: true });
  }
  assert.deepEqual(errors, []);
  fs.writeFileSync('qa-locales.json', JSON.stringify(report, null, 2));
  console.log(report);
} finally {
  await browser.close();
}
