import fs from 'node:fs';
import path from 'node:path';
import { parseHTML } from 'linkedom';
import { englishFiles, inventory } from './translation-inventory.mjs';
import { languages, normalize, isText, translate } from './locale-config.mjs';
const source = inventory(),
  files = englishFiles();
const englishSitemap = fs.readFileSync('dist/sitemap.xml', 'utf8');
const locations = [...englishSitemap.matchAll(/<loc>(.*?)<\/loc>/g)]
  .map((match) => match[1])
  .filter((url) => !languages[new URL(url).pathname.split('/')[1]]);
const origin = new URL(locations[0]).origin;
const routes = new Set(
  files.map((file) => '/' + file.replaceAll('\\', '/').replace(/index\.html$/, '')),
);
const missing = [];
const examNames = new Set(
  JSON.parse(fs.readFileSync('data/exams.json', 'utf8')).map((exam) => exam.name),
);
for (const [locale] of Object.entries(languages)) {
  const file = `src/i18n/machine/${locale}.json`;
  if (!fs.existsSync(file))
    throw new Error(`Missing machine translation file: ${file}. Run npm run translate.`);
  const { strings } = JSON.parse(fs.readFileSync(file, 'utf8'));
  const tr = (s) => {
    if (examNames.has(normalize(s))) return s;
    const translated = translate(s, strings);
    if (isText(normalize(s)) && translated === s && !strings[normalize(s)])
      missing.push({ locale, source: normalize(s) });
    return translated;
  };
  const runtime = Object.fromEntries(
    source.ui.filter((key) => strings[key]).map((key) => [key, strings[key]]),
  );
  for (const file of files) {
    const { document } = parseHTML(fs.readFileSync(path.join('dist', file), 'utf8'));
    const originalPath = '/' + file.replaceAll('\\', '/').replace(/index\.html$/, '');
    function visit(node) {
      if (node.nodeType === 3) {
        const value = node.textContent;
        if (value.trim()) node.textContent = value.replace(value.trim(), tr(value.trim()));
        return;
      }
      if (
        node.nodeType !== 1 ||
        ['SCRIPT', 'STYLE', 'SVG', 'CODE', 'PRE'].includes(node.tagName) ||
        node.hasAttribute('data-no-translate') ||
        node.hasAttribute('data-guide-body')
      )
        return;
      for (const attr of ['title', 'alt', 'aria-label', 'placeholder'])
        if (node.hasAttribute(attr)) node.setAttribute(attr, tr(node.getAttribute(attr)));
      if (
        node.tagName === 'META' &&
        ['description', 'og:title', 'og:description'].includes(
          node.getAttribute('name') || node.getAttribute('property'),
        )
      )
        node.setAttribute('content', tr(node.getAttribute('content')));
      for (const child of [...node.childNodes]) visit(child);
    }
    visit(document.documentElement);
    document.documentElement.lang = locale;
    document.title += ` | ${languages[locale]}`;
    document.querySelector('meta[property="og:title"]').setAttribute('content', document.title);
    document.querySelector('#language-switcher')?.setAttribute('aria-label', tr('Language'));
    const canonical = `${origin}/${locale}${originalPath}`;
    document.querySelector('link[rel=canonical]').href = canonical;
    document.querySelector('meta[property="og:url"]').setAttribute('content', canonical);
    for (const anchor of document.querySelectorAll('a[href]')) {
      const href = anchor.getAttribute('href');
      if (!anchor.hasAttribute('data-language-link') && routes.has(href))
        anchor.setAttribute('href', `/${locale}${href}`);
    }
    for (const option of document.querySelectorAll('#language-switcher option')) {
      option.removeAttribute('selected');
      if (option.getAttribute('data-locale') === locale) option.setAttribute('selected', '');
    }
    for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
      const object = JSON.parse(script.textContent);
      function walk(value) {
        if (Array.isArray(value)) return value.map(walk);
        if (value && typeof value === 'object') {
          for (const [key, item] of Object.entries(value)) {
            if (
              ['name', 'text', 'headline', 'description'].includes(key) &&
              typeof item === 'string'
            )
              value[key] = tr(item);
            else if (key === 'inLanguage')
              value[key] = value['@type'] === 'Article' ? 'en' : locale;
            else if (
              ['url', 'item', 'mainEntityOfPage'].includes(key) &&
              typeof item === 'string' &&
              item.startsWith(origin)
            ) {
              const url = new URL(item);
              if (routes.has(url.pathname)) value[key] = `${origin}/${locale}${url.pathname}`;
            } else if (item && typeof item === 'object') value[key] = walk(item);
          }
        }
        return value;
      }
      script.textContent = JSON.stringify(walk(object)).replace(/</g, '\\u003c');
    }
    const data = document.createElement('script');
    data.id = 'daykit-locale';
    data.type = 'application/json';
    data.textContent = JSON.stringify(runtime).replace(/</g, '\\u003c');
    document.head.append(data);
    const scriptName = {
      hi: 'devanagari',
      mr: 'devanagari',
      kn: 'kannada',
      ta: 'tamil',
      te: 'telugu',
      bn: 'bengali',
    }[locale];
    const preload = document.createElement('link');
    preload.rel = 'preload';
    preload.setAttribute('as', 'font');
    preload.setAttribute('type', 'font/woff2');
    preload.setAttribute('crossorigin', '');
    preload.href = `/fonts/${scriptName}.woff2`;
    document.head.append(preload);
    const fontStyle = document.createElement('style');
    fontStyle.textContent = fs.readFileSync(`public/fonts/${locale}.css`, 'utf8');
    document.head.append(fontStyle);
    const output = path.join('dist', locale, file);
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, document.toString());
  }
}
if (missing.length) {
  fs.writeFileSync('qa-missing-translations.json', JSON.stringify(missing, null, 2));
  throw new Error(
    `${missing.length} untranslated text instances. Run npm run translate, then rebuild.`,
  );
}
const escape = (s) => s.replaceAll('&', '&amp;');
const all = locations.flatMap((url) => [
  url,
  ...Object.keys(languages).map((locale) => `${origin}/${locale}${new URL(url).pathname}`),
]);
fs.writeFileSync(
  'dist/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${all.map((url) => `<url><loc>${escape(url)}</loc></url>`).join('')}</urlset>`,
);
console.log(`Localized ${files.length} pages into ${Object.keys(languages).length} languages.`);
