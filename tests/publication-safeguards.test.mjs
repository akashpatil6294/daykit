import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { checkConverterHealth, preparePublication } from '../scripts/prepare-publication.mjs';
import { publishSite, REMOTE_SLUGS } from '../scripts/publish.mjs';

test('safeguard: missing endpoint safely keeps remote disabled', async () => {
  const resultEmpty = await checkConverterHealth('');
  assert.equal(resultEmpty.remote, false);
  assert.equal(resultEmpty.reason, 'No converter endpoint configured');

  const resultUndefined = await checkConverterHealth(undefined);
  assert.equal(resultUndefined.remote, false);
  assert.equal(resultUndefined.reason, 'No converter endpoint configured');
});

test('safeguard: non-HTTPS endpoint is rejected', async () => {
  const result = await checkConverterHealth('http://converter.example.com/api');
  assert.equal(result.remote, false);
  assert.equal(result.reason, 'Converter health check failed');
});

test('safeguard: embedded credentials in URL are rejected', async () => {
  const result = await checkConverterHealth('https://user:secret@converter.example.com/api');
  assert.equal(result.remote, false);
  assert.equal(result.reason, 'Converter health check failed');
});

test('safeguard: valid healthy response enables remote conversions', async () => {
  const mockFetch = async (url) => {
    assert.equal(url.pathname, '/healthz');
    return {
      ok: true,
      status: 200,
      json: async () => ({ ok: true, engine: 'libreoffice' }),
    };
  };
  const result = await checkConverterHealth('https://converter.example.com', { fetch: mockFetch });
  assert.equal(result.remote, true);
  assert.equal(result.reason, 'Converter health check passed');
});

test('safeguard: ok:false keeps remote conversions disabled', async () => {
  const mockFetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({ ok: false, error: 'busy' }),
  });
  const result = await checkConverterHealth('https://converter.example.com', { fetch: mockFetch });
  assert.equal(result.remote, false);
  assert.equal(result.reason, 'Converter health check failed');
});

test('safeguard: non-200 HTTP response keeps remote conversions disabled', async () => {
  const mockFetch = async () => ({
    ok: false,
    status: 503,
    json: async () => ({ ok: false }),
  });
  const result = await checkConverterHealth('https://converter.example.com', { fetch: mockFetch });
  assert.equal(result.remote, false);
  assert.equal(result.reason, 'Converter health check failed');
});

test('safeguard: malformed JSON response keeps remote conversions disabled', async () => {
  const mockFetch = async () => ({
    ok: true,
    status: 200,
    json: async () => {
      throw new SyntaxError('Unexpected token < in JSON');
    },
  });
  const result = await checkConverterHealth('https://converter.example.com', { fetch: mockFetch });
  assert.equal(result.remote, false);
  assert.equal(result.reason, 'Converter health check failed');
});

test('safeguard: network failure keeps remote conversions disabled', async () => {
  const mockFetch = async () => {
    throw new TypeError('fetch failed');
  };
  const result = await checkConverterHealth('https://converter.example.com', { fetch: mockFetch });
  assert.equal(result.remote, false);
  assert.equal(result.reason, 'Converter health check failed');
});

test('safeguard: timeout keeps remote conversions disabled without long delay', async () => {
  const mockFetch = async (_url, { signal }) => {
    return new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason || new Error('TimeoutError')));
    });
  };
  const result = await checkConverterHealth('https://converter.example.com', {
    fetch: mockFetch,
    timeoutMs: 30,
  });
  assert.equal(result.remote, false);
  assert.equal(result.reason, 'Converter health check failed');
});

test('safeguard: preparePublication writes state to publication.json', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astro-prep-'));
  try {
    const res = await preparePublication({
      targetDir: tempDir,
      env: { PUBLIC_CONVERTER_URL: '', PUBLIC_LOCALES: 'en' },
    });
    assert.equal(res.remote, false);
    const written = JSON.parse(fs.readFileSync(path.join(tempDir, 'publication.json'), 'utf8'));
    assert.equal(written.remote, false);
    assert.equal(written.locales, 'en');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('safeguard: actual publication output - unhealthy/missing backend removes converter pages and links', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astro-publish-'));
  try {
    const distDir = path.join(tempDir, 'dist');
    const astroDir = path.join(tempDir, '.astro');
    fs.mkdirSync(distDir, { recursive: true });
    fs.mkdirSync(astroDir, { recursive: true });

    // Populate fake remote tool pages and static pages in temp dist
    for (const slug of REMOTE_SLUGS) {
      const pageDir = path.join(distDir, 'tools', slug);
      fs.mkdirSync(pageDir, { recursive: true });
      fs.writeFileSync(path.join(pageDir, 'index.html'), `<html><body>${slug} page</body></html>`);
    }

    // Keep an available client-side tool
    const mergeDir = path.join(distDir, 'tools', 'merge-pdf');
    fs.mkdirSync(mergeDir, { recursive: true });
    fs.writeFileSync(path.join(mergeDir, 'index.html'), '<html><body>Merge PDF</body></html>');

    // Index.html with cards and navigation links
    const indexHtml = `<!DOCTYPE html><html><head></head><body>
      <nav><a href="/tools/pdf-to-word/">PDF to Word</a><a href="/tools/merge-pdf/">Merge PDF</a></nav>
      <ul><li><a href="/tools/excel-to-pdf/">Excel to PDF</a></li><li><a href="/tools/merge-pdf/">Merge PDF</a></li></ul>
      <div class="category-card"><a class="category-card" href="/tools/pdf-to-excel/">PDF to Excel</a></div>
    </body></html>`;
    fs.writeFileSync(path.join(distDir, 'index.html'), indexHtml);

    // Sitemap.xml
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?><urlset>
      <url><loc>https://pdf-converter.me/tools/pdf-to-word/</loc></url>
      <url><loc>https://pdf-converter.me/tools/merge-pdf/</loc></url>
    </urlset>`;
    fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml);

    // Publication state: remote is false
    fs.writeFileSync(path.join(astroDir, 'publication.json'), JSON.stringify({ remote: false, locales: 'en' }));

    // Run real publishSite logic
    await publishSite({
      distDir,
      astroDir,
      examsFile: path.resolve('data/exams.json'),
    });

    // 1. Verify all 6 remote routes are removed from dist/
    for (const slug of REMOTE_SLUGS) {
      assert.equal(fs.existsSync(path.join(distDir, 'tools', slug)), false, `Route ${slug} should be deleted`);
    }
    // Available tool was NOT removed
    assert.equal(fs.existsSync(path.join(distDir, 'tools', 'merge-pdf', 'index.html')), true);

    // 2. Verify links were purged from HTML
    const updatedHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
    assert.equal(updatedHtml.includes('/tools/pdf-to-word/'), false);
    assert.equal(updatedHtml.includes('/tools/excel-to-pdf/'), false);
    assert.equal(updatedHtml.includes('/tools/pdf-to-excel/'), false);
    assert.equal(updatedHtml.includes('/tools/merge-pdf/'), true);

    // 3. Verify sitemap purged remote links
    const updatedSitemap = fs.readFileSync(path.join(distDir, 'sitemap.xml'), 'utf8');
    assert.equal(updatedSitemap.includes('/tools/pdf-to-word/'), false);
    assert.equal(updatedSitemap.includes('/tools/merge-pdf/'), true);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('safeguard: actual publication output - healthy backend retains converter pages and links', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astro-publish-healthy-'));
  try {
    const distDir = path.join(tempDir, 'dist');
    const astroDir = path.join(tempDir, '.astro');
    fs.mkdirSync(distDir, { recursive: true });
    fs.mkdirSync(astroDir, { recursive: true });

    // Populate fake remote tool pages
    for (const slug of REMOTE_SLUGS) {
      const pageDir = path.join(distDir, 'tools', slug);
      fs.mkdirSync(pageDir, { recursive: true });
      fs.writeFileSync(path.join(pageDir, 'index.html'), `<html><body>${slug} page</body></html>`);
    }

    // Index.html with navigation links
    const indexHtml = `<!DOCTYPE html><html><head></head><body>
      <nav><a href="/tools/pdf-to-word/">PDF to Word</a></nav>
    </body></html>`;
    fs.writeFileSync(path.join(distDir, 'index.html'), indexHtml);

    // Sitemap.xml
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?><urlset>
      <url><loc>https://pdf-converter.me/tools/pdf-to-word/</loc></url>
    </urlset>`;
    fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml);

    // Publication state: remote is TRUE
    fs.writeFileSync(path.join(astroDir, 'publication.json'), JSON.stringify({ remote: true, locales: 'en' }));

    // Run real publishSite logic
    await publishSite({
      distDir,
      astroDir,
      examsFile: path.resolve('data/exams.json'),
    });

    // 1. Verify remote routes are RETAINED in dist/
    for (const slug of REMOTE_SLUGS) {
      assert.equal(fs.existsSync(path.join(distDir, 'tools', slug, 'index.html')), true, `Route ${slug} should remain`);
    }

    // 2. Verify links were retained in HTML
    const updatedHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
    assert.equal(updatedHtml.includes('/tools/pdf-to-word/'), true);

    // 3. Verify sitemap retained remote links
    const updatedSitemap = fs.readFileSync(path.join(distDir, 'sitemap.xml'), 'utf8');
    assert.equal(updatedSitemap.includes('/tools/pdf-to-word/'), true);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
