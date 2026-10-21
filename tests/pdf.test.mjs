import test from 'node:test';
import assert from 'node:assert/strict';
import { pageSelection } from '../src/lib/pdf-protocol.ts';
import fs from 'node:fs';
import { pdfSlugs } from '../src/data/pdf-tools.ts';
test('PDF pages include 600 words, steps and four FAQs', () => {
  for (const slug of pdfSlugs.filter(s=>!JSON.parse(fs.readFileSync('dist/publication.json','utf8')).excludedTools.includes(`/tools/${s}/`))) {
    const html = fs.readFileSync(`dist/tools/${slug}/index.html`, 'utf8');
    const body = html.match(/<article[^>]*data-guide[^>]*>([\s\S]*?)<\/article>/)[1];
    assert.ok(body.replace(/<[^>]+>/g, ' ').split(/\s+/).length >= 600, slug);
    assert.ok((body.match(/<details>/g) || []).length >= 4);
    assert.ok(body.includes('<ol>'));
    const sections = [...body.matchAll(/<section>([\s\S]*?)<\/section>/g)];
    if (
      ![
        'merge-pdf',
        'split-pdf',
        'reorder-pdf',
        'images-to-pdf',
        'pdf-to-images',
        'compress-pdf',
      ].includes(slug)
    ) {
      assert.ok(sections.length >= 3);
      assert.ok(
        sections
          .map((m) => m[1])
          .join(' ')
          .replace(/<[^>]+>/g, ' ')
          .split(/\s+/)
          .filter(Boolean).length >= 300,
        slug,
      );
    }
    const schemas = [
      ...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs),
    ].map((m) => JSON.parse(m[1]));
    assert.ok(schemas.some((s) => s['@type'] === 'WebApplication'));
    assert.ok(schemas.find((s) => s['@type'] === 'FAQPage').mainEntity.length >= 4);
    const related = html.match(/<section class="related-tools">([\s\S]*?)<\/section>/)?.[1];
    assert.ok((related?.match(/<a /g) || []).length >= 3, slug);
  }
});
test('PDF selections preserve order, reject invalid ranges and cap output pages', () => {
  assert.deepEqual(pageSelection('3,1,4-5', 5), [2, 0, 3, 4]);
  assert.deepEqual(pageSelection('', 2), [0, 1]);
  for (const value of ['0', '6', '3-1', 'a', '1,,2']) assert.throws(() => pageSelection(value, 5));
  assert.throws(() => pageSelection(Array(101).fill('1').join(','), 1));
});
