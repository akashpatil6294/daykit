import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { toolCatalog } from '../src/data/tools.ts';
import { pdfSlugs } from '../src/data/pdf-tools.ts';
import { calculatorSlugs } from '../src/data/calculators.ts';
test('original guides have 800 words, metadata and two-guide tool coverage', () => {
  const files = fs.readdirSync('content/guides').filter((f) => f.endsWith('.md'));
  assert.ok(files.length >= 26);
  const texts = [];
  const titles = new Set();
  for (const file of files) {
    const source = fs.readFileSync(`content/guides/${file}`, 'utf8');
    const m = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    const meta = JSON.parse(m[1]);
    const content = m[2];
    assert.ok(meta.author && meta.published && meta.updated);
    assert.ok(meta.faq.length >= 3);
    assert.ok(!titles.has(meta.title));
    titles.add(meta.title);
    const words = (content + ' ' + meta.faq.map((f) => f.question + ' ' + f.answer).join(' '))
      .replace(/\([^)]*\)/g, ' ')
      .split(/\s+/)
      .filter(Boolean).length;
    assert.ok(words >= 800, `${file}: ${words}`);
    assert.ok(!texts.includes(content));
    texts.push(content);
    const html = fs.readFileSync(`dist/guides/${file.replace(/\.md$/, '')}/index.html`, 'utf8');
    assert.ok(html.includes('"@type":"Article"'));
    assert.ok(html.includes('On this page'));
  }
  for (const route of [
    ...toolCatalog.map((t) => `/tools/${t.slug}/`),
    ...pdfSlugs.map((s) => `/tools/${s}/`),
    ...calculatorSlugs.map((s) => `/calculators/${s}/`),
  ])
    assert.ok(
      texts.filter((text) => text.includes(`](${route})`)).length >= 2,
      `Insufficient guide coverage: ${route}`,
    );
});
