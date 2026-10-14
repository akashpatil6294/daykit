import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { writeFileSync } from 'node:fs';
const chrome = await launch({
  chromePath: process.env.CHROMIUM_PATH,
  chromeFlags: ['--headless', '--disable-gpu'],
});
try {
  const summaries = [];
  for (const route of process.env.AUDIT_ROUTES?.split(',') || [
    '/tools/resize-image-kb/',
    '/resize-photo-signature-ssc/',
  ]) {
    const result = await lighthouse(`http://127.0.0.1:4321${route}`, {
      port: chrome.port,
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'seo'],
      logLevel: 'error',
    });
    const { lhr } = result;
    summaries.push({
      route,
      performance: lhr.categories.performance.score * 100,
      accessibility: lhr.categories.accessibility.score * 100,
      seo: lhr.categories.seo.score * 100,
      cls: lhr.audits['cumulative-layout-shift'].numericValue,
      issues: Object.values(lhr.audits)
        .filter((a) => a.score !== null && a.score < 1)
        .map((a) => ({ id: a.id, title: a.title, score: a.score, displayValue: a.displayValue })),
    });
    writeFileSync('qa-lighthouse.json', JSON.stringify(summaries, null, 2));
    console.log(`Audited ${route}: performance ${lhr.categories.performance.score * 100}, CLS ${lhr.audits['cumulative-layout-shift'].numericValue}`);
  }
  writeFileSync('qa-lighthouse.json', JSON.stringify(summaries, null, 2));
  console.log(JSON.stringify(summaries, null, 2));
} finally {
  chrome.kill();
}
