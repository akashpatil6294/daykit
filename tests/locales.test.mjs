import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseHTML} from 'linkedom';
test('English publication omits locale pages, language controls and alternate locale tags',()=>{
 for(const locale of ['hi','kn','ta','te','mr','bn']) {
  assert.ok(!fs.existsSync(`dist/${locale}`));
  assert.ok(fs.existsSync(`src/i18n/machine/${locale}.json`));
  assert.ok(fs.readFileSync('dist/_redirects','utf8').includes(`/${locale}/* /:splat 301`));
 }
 for(const file of fs.readdirSync('dist',{recursive:true}).filter(f=>f.endsWith('.html'))) {
  const d=parseHTML(fs.readFileSync(`dist/${file}`,'utf8')).document;
  assert.equal(d.documentElement.lang,'en');
  assert.equal(d.querySelectorAll('link[hreflang]').length,1);
  assert.equal(d.querySelector('link[hreflang]').getAttribute('hreflang'),'x-default');
  assert.equal(d.querySelectorAll('#language-switcher,.consent,.ad-slot').length,0);
 }
});
