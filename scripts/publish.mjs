import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';

export const REMOTE_SLUGS = [
  'pdf-to-word',
  'pdf-to-powerpoint',
  'pdf-to-excel',
  'word-to-pdf',
  'powerpoint-to-pdf',
  'excel-to-pdf',
];

export async function publishSite(options = {}) {
  const cwd = options.cwd ?? process.cwd();
  const distDir = options.distDir ?? path.join(cwd, 'dist');
  const astroDir = options.astroDir ?? path.join(cwd, '.astro');
  const examsFile = options.examsFile ?? path.join(cwd, 'data', 'exams.json');

  const publicationFile = path.join(astroDir, 'publication.json');
  const state = options.state ?? JSON.parse(fs.readFileSync(publicationFile, 'utf8'));
  const blocked = new Set(state.remote ? [] : REMOTE_SLUGS.map((s) => `/tools/${s}/`));
  const exams = JSON.parse(fs.readFileSync(examsFile, 'utf8'));
  const hiddenExams = new Set(
    exams.filter((e) => !e.verified).map((e) => `/resize-photo-signature-${e.slug}/`),
  );
  if (!exams.some((e) => e.verified)) hiddenExams.add('/exams/');

  // Omit unavailable converter pages before writing links and the sitemap.
  const distResolved = path.resolve(distDir);
  for (const route of blocked) {
    const folder = path.resolve(distDir, '.' + route);
    if (!folder.startsWith(distResolved + path.sep)) throw new Error('Unsafe output path');
    fs.rmSync(folder, { recursive: true, force: true });
  }

  if (fs.existsSync(distDir)) {
    const htmlFiles = fs
      .readdirSync(distDir, { recursive: true })
      .filter((f) => f.endsWith('.html'));

    for (const file of htmlFiles) {
      const full = path.join(distDir, file);
      const route = '/' + file.replaceAll('\\', '/').replace(/index\.html$/, '');
      const { document: d } = parseHTML(fs.readFileSync(full, 'utf8'));
      if (hiddenExams.has(route)) {
        let meta = d.querySelector('meta[name=robots]');
        if (!meta) {
          meta = d.createElement('meta');
          meta.setAttribute('name', 'robots');
          d.head.append(meta);
        }
        meta.setAttribute('content', 'noindex, follow');
      }
      for (const a of [...d.querySelectorAll('a[href]')]) {
        const href = a.getAttribute('href');
        if (!blocked.has(href) && !hiddenExams.has(href)) continue;
        if (a.matches('.tool-library-card,.category-card')) a.remove();
        else if (a.parentElement?.tagName === 'LI') a.parentElement.remove();
        else if (a.closest('nav') || a.classList.contains('button')) a.remove();
        else a.replaceWith(d.createTextNode(a.textContent));
      }
      fs.writeFileSync(full, d.toString());
    }

    const sitemapPath = path.join(distDir, 'sitemap.xml');
    if (fs.existsSync(sitemapPath)) {
      let xml = fs.readFileSync(sitemapPath, 'utf8');
      xml = xml.replace(/<url><loc>(.*?)<\/loc><\/url>/g, (entry, url) =>
        blocked.has(new URL(url).pathname) || hiddenExams.has(new URL(url).pathname) ? '' : entry,
      );
      fs.writeFileSync(sitemapPath, xml);
    }

    const pubOut = {
      remote: state.remote,
      locales: state.locales,
      excludedTools: [...blocked],
      noindex: [...hiddenExams],
    };
    fs.writeFileSync(path.join(distDir, 'publication.json'), JSON.stringify(pubOut));
  }

  if (state.locales !== 'en') await import('./localize.mjs');
  const summary = `Publication: ${state.locales}; ${blocked.size} unavailable conversion routes omitted; ${hiddenExams.size} exam routes excluded from indexing.`;
  return { summary, blocked: [...blocked], hiddenExams: [...hiddenExams], state };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const { summary } = await publishSite();
  console.log(summary);
}
