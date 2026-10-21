import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { toolCatalog } from '../src/data/tools.ts';
import { calculatorSlugs } from '../src/data/calculators.ts';
import { pdfSlugs } from '../src/data/pdf-tools.ts';
const exams = JSON.parse(readFileSync('data/exams.json', 'utf8'));
const publication = JSON.parse(readFileSync('dist/publication.json', 'utf8'));
const routes = [
  '',
  'guides',
  ...readdirSync('content/guides')
    .filter((f) => f.endsWith('.md'))
    .map((f) => `guides/${f.replace(/\.md$/, '')}`),
  ...pdfSlugs.map((slug) => `tools/${slug}`),
  'tools',
  'calculators',
  'exams',
  'about',
  'contact',
  'privacy',
  'terms',
  'disclaimer',
  ...toolCatalog.map((tool) => `tools/${tool.slug}`),
  ...exams.map((exam) => `resize-photo-signature-${exam.slug}`),
  ...calculatorSlugs.map((slug) => `calculators/${slug}`),
].filter(route => !publication.excludedTools.includes('/'+route+'/'));
test('all public pages have unique SEO, navigation and valid JSON-LD', () => {
  const titles = new Set();
  const descriptions = new Set();
  for (const route of routes) {
    const html = readFileSync(`dist/${route ? route + '/' : ''}index.html`, 'utf8');
    const title = html.match(/<title>(.*?)<\/title>/)?.[1];
    const description = html.match(/name="description" content="([^"]+)"/)?.[1];
    assert.ok(title);
    assert.ok(description);
    assert.ok(!titles.has(title));
    assert.ok(!descriptions.has(description));
    titles.add(title);
    descriptions.add(description);
    assert.match(html, /rel="canonical" href="https?:\/\//);
    for (const property of ['og:title', 'og:description', 'og:url', 'og:type'])
      assert.ok(html.includes(`property="${property}"`));
    for (const script of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs))
      assert.doesNotThrow(() => JSON.parse(script[1]));
    assert.ok(html.includes('id="main"'));
    assert.ok(!html.includes('adsbygoogle.js'));
    for (const link of html.matchAll(/href="(\/[^"?#]*)"/g)) {
      const path = link[1];
      assert.ok(
        existsSync(`dist${path.endsWith('/') ? path + 'index.html' : path}`),
        `Broken internal link: ${path}`,
      );
    }
  }
});
test('sitemap, robots and excluded 404 are present', () => {
  const sitemap = readFileSync('dist/sitemap.xml', 'utf8');
  assert.equal((sitemap.match(/<loc>/g) || []).length, routes.filter(route=>!publication.noindex.includes('/'+route+'/')).length);
  assert.ok(!sitemap.includes('/404'));
  assert.match(readFileSync('dist/robots.txt', 'utf8'), /Sitemap: https?:\/\/.*\/sitemap.xml/);
  assert.match(readFileSync('dist/404.html', 'utf8'), /noindex, follow/);
});
test('built site contains only known categories and no retired routes', () => {
  const knownTop = new Set([
    'about',
    'calculators',
    'contact',
    'disclaimer',
    'exams',
    'guides',
    'legal',
    'privacy',
    'terms',
    'tools',
  ]);
  const locales = new Set(['hi', 'kn', 'ta', 'te', 'mr', 'bn']);
  const known = (segment) =>
    segment === '' ||
    knownTop.has(segment) ||
    segment.startsWith('resize-photo-signature-');
  for (const route of routes) {
    assert.ok(known(route.split('/')[0]), `unexpected category: ${route}`);
  }
  const topLevel = readdirSync('dist', { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        entry.name !== '_astro' &&
        existsSync(`dist/${entry.name}/index.html`),
    )
    .map((entry) => entry.name);
  for (const name of topLevel) {
    assert.ok(locales.has(name) || known(name), `unexpected top-level dist route: ${name}`);
  }
  for (const locale of ['']) {
    const home = readFileSync(`dist/${locale}index.html`, 'utf8');
    const pattern = new RegExp(`href="/${locale}([a-z-]+)/"`, 'g');
    const categories = new Set();
    for (const link of home.matchAll(pattern)) categories.add(link[1]);
    for (const category of categories) {
      assert.ok(known(category), `home page links to unexpected category: ${category}`);
    }
    for (const category of ['tools', 'calculators', 'guides'])
      assert.ok(home.includes(`href="/${locale}${category}/"`), `home missing /${locale}${category}/`);
  }
});
test('calculators publish 400+ guide words and five FAQs each', () => {
  for (const slug of calculatorSlugs) {
    const html = readFileSync(`dist/calculators/${slug}/index.html`, 'utf8');
    const guide = html.match(/<article[^>]*data-calculator-guide[^>]*>([\s\S]*?)<\/article>/)?.[1];
    assert.ok(guide, slug);
    const count = guide
      .replace(/<[^>]*>/g, ' ')
      .split(/\s+/)
      .filter(Boolean).length;
    assert.ok(count >= 400, `${slug}: ${count} words`);
    assert.equal((guide.match(/<details>/g) || []).length, 5);
  }
});
test('every image tool has 600+ guide words, steps and matching FAQ structured data', () => {
  for (const tool of toolCatalog) {
    const html = readFileSync(`dist/tools/${tool.slug}/index.html`, 'utf8');
    const guide = html.match(/<article[^>]*data-guide[^>]*>([\s\S]*?)<\/article>/)?.[1];
    assert.ok(guide, tool.slug);
    const words = guide
      .replace(/<[^>]*>/g, ' ')
      .split(/\s+/)
      .filter(Boolean).length;
    assert.ok(words >= 600, `${tool.slug}: ${words} words`);
    assert.ok(guide.includes('<ol>'));
    assert.ok((guide.match(/<details>/g) || []).length >= 4);
    const schemas = [
      ...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs),
    ].map((match) => JSON.parse(match[1]));
    assert.ok(schemas.some((schema) => schema['@type'] === 'WebApplication'));
    assert.ok(schemas.find((schema) => schema['@type'] === 'FAQPage').mainEntity.length >= 4);
  }
});
test('every JSON exam gets a page, transparent specs, instructions, FAQs and a sitemap entry', () => {
  const sitemap = readFileSync('dist/sitemap.xml', 'utf8');
  for (const exam of exams) {
    const path = `/resize-photo-signature-${exam.slug}/`;
    const html = readFileSync(`dist${path}index.html`, 'utf8');
    assert.equal(sitemap.includes(path), exam.verified);
    if (!exam.verified) assert.match(html, /noindex, follow/);
    assert.ok(html.includes('Photo and signature specifications'));
    assert.ok(
      html.includes(
        exam.verified ? 'Specification record marked verified' : 'Unverified specifications',
      ),
    );
    assert.ok(html.includes(exam.last_verified || 'Unverified'));
    assert.ok(html.includes('<ol>'));
    assert.equal((html.match(/<details>/g) || []).length, 4);
    const table = html.match(/<table>[\s\S]*?<\/table>/)?.[0];
    assert.ok(table);
    const nullCount = [
      ...Object.values(exam.photo_spec),
      ...Object.values(exam.signature_spec),
    ].filter((value) => value === null).length;
    assert.equal((table.match(/Not supplied/g) || []).length, nullCount);
  }
});
