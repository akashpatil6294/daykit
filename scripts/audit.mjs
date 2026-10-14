import fs from 'node:fs';
import path from 'node:path';
import { parseHTML } from 'linkedom';
const files = fs.readdirSync('dist', { recursive: true }).filter((f) => f.endsWith('.html'));
const sitemap = [...fs.readFileSync('dist/sitemap.xml', 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(
  (m) => m[1],
);
const issues = [];
const titles = new Map(),
  descriptions = new Map(),
  incoming = new Map();
const summaries = [];
const fail = (route, issue) => issues.push({ route, issue });
for (const file of files) {
  const route = '/' + file.replaceAll('\\', '/').replace(/index\.html$/, '');
  const { document: d } = parseHTML(fs.readFileSync(path.join('dist', file), 'utf8'));
  const title = d.querySelector('title')?.textContent,
    desc = d.querySelector('meta[name=description]')?.getAttribute('content');
  for (const [name, value, map] of [
    ['title', title, titles],
    ['description', desc, descriptions],
  ]) {
    if (!value) fail(route, `Missing ${name}`);
    else if (map.has(value)) fail(route, `Duplicate ${name}: ${map.get(value)}`);
    else map.set(value, route);
  }
  const canonical = d.querySelector('link[rel=canonical]')?.getAttribute('href');
  if (!canonical || new URL(canonical).pathname !== route) fail(route, 'Incorrect canonical');
  if (
    !d.querySelector('meta[name=robots]')?.getAttribute('content')?.includes('noindex') &&
    !sitemap.includes(canonical)
  )
    fail(route, 'Missing sitemap entry');
  if (d.querySelectorAll('h1').length !== 1) fail(route, 'Expected one h1');
  let level = 0;
  for (const h of d.querySelectorAll('h1,h2,h3,h4,h5,h6')) {
    const n = Number(h.tagName[1]);
    if (n > level + 1) fail(route, `Heading jump ${level} to ${n}`);
    level = n;
  }
  for (const img of d.querySelectorAll('img'))
    if (!img.hasAttribute('alt')) fail(route, 'Image missing alt');
  for (const link of d.querySelectorAll('a[href],link[hreflang]')) {
    const href = link.getAttribute('href');
    if (!href || /^(mailto:|blob:|javascript:)/.test(href)) continue;
    const u = new URL(href, canonical);
    if (u.origin !== new URL(canonical).origin) continue;
    const dest = `dist${u.pathname.endsWith('/') ? u.pathname + 'index.html' : u.pathname}`;
    if (!fs.existsSync(dest)) fail(route, `Broken link ${href}`);
    else if (u.hash && dest.endsWith('.html')) {
      const target = parseHTML(fs.readFileSync(dest, 'utf8')).document;
      if (!target.getElementById(decodeURIComponent(u.hash.slice(1))))
        fail(route, `Missing fragment ${href}`);
    }
    if (link.tagName === 'A' && u.pathname !== route)
      incoming.set(u.pathname, (incoming.get(u.pathname) || 0) + 1);
  }
  for (const script of d.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const obj = JSON.parse(script.textContent);
      if (!obj['@context'] || !obj['@type']) fail(route, 'Incomplete structured data');
      if (obj['@type'] === 'Article' && obj.mainEntityOfPage !== canonical)
        fail(route, 'Article URL differs from canonical');
      if (
        obj['@type'] === 'FAQPage' &&
        obj.mainEntity.some((q) => !q.name || !q.acceptedAnswer?.text)
      )
        fail(route, 'Invalid FAQ data');
    } catch {
      fail(route, 'Invalid JSON-LD');
    }
  }
  const main = d.querySelector('main')?.cloneNode(true);
  main?.querySelectorAll('script,style,nav,astro-island,aside').forEach((e) => e.remove());
  summaries.push({
    route,
    explanatoryWords: main?.textContent.split(/\s+/).filter(Boolean).length || 0,
  });
}
for (const url of sitemap) {
  const route = new URL(url).pathname;
  if (!incoming.has(route) && route !== '/') fail(route, 'Orphan page');
}
const report = {
  pages: files.length,
  indexedPages: sitemap.length,
  issues,
  shortEnglishPages: summaries.filter(
    (s) => !/^\/(hi|kn|ta|te|mr|bn)\//.test(s.route) && s.explanatoryWords < 150,
  ),
};
fs.writeFileSync('qa-audit.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (issues.length) process.exitCode = 1;
