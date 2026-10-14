import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import {translate} from '../scripts/locale-config.mjs';
test('new exam names reuse translated templates without a new route registry',()=>{
  for(const locale of ['hi','kn','ta','te','mr','bn']){
    const {strings}=JSON.parse(fs.readFileSync(`src/i18n/machine/${locale}.json`,'utf8'));
    const source='Resize Synthetic test record photo and signature | Daykit';
    const result=translate(source,strings);
    assert.notEqual(result,source);assert.ok(result.includes('Synthetic test record'));assert.ok(result.endsWith(' | Daykit'));
  }
});
test('all localized pages have canonical, reciprocal hreflang and translated headings', () => {
  const urls = [...fs.readFileSync('dist/sitemap.xml', 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(
    (m) => new URL(m[1]),
  );
  for (const url of urls) {
    const { document } = parseHTML(fs.readFileSync(`dist${url.pathname}index.html`, 'utf8'));
    assert.equal(document.querySelector('link[rel=canonical]').getAttribute('href'), url.href);
    assert.equal(document.querySelectorAll('link[hreflang]').length, 8);
    assert.equal(document.querySelectorAll('h1').length, 1);
    for (const a of document.querySelectorAll('link[hreflang]'))
      assert.ok(urls.some((u) => u.href === a.href));
  }
});
