// Authoring-time machine translation of public site copy only. Never used by visitors.
import fs from 'node:fs';
import { inventory } from './translation-inventory.mjs';
import { languages } from './locale-config.mjs';
const source = inventory();
fs.mkdirSync('src/i18n/machine', { recursive: true });
fs.writeFileSync('src/i18n/machine/source-inventory.json', JSON.stringify(source, null, 2));
const protectedTerms =
  /__ARG0__|JEE Main|SBI PO|Daykit|SSC|UPSC|NEET|IBPS|RRB|KCET|GATE|CGST|SGST|JPEG|JPG|PNG|WebP|HEIC|HEIF|PDF|EMI|SIP|GST|\bFD\b|\bRD\b|INR|USD|GBP|EUR|UTC|MiB|KB|\bpx\b/g;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function request(lines, locale) {
  const terms = [];
  const prepared = lines.map((line) =>
    line.replace(protectedTerms, (term) => {
      const token = `ZXQ${terms.length}QXZ`;
      terms.push(term);
      return token;
    }),
  );
  const url = new URL('https://translate.googleapis.com/translate_a/single');
  url.search = new URLSearchParams({
    client: 'gtx',
    sl: 'en',
    tl: locale,
    dt: 't',
    q: prepared.join('\n'),
  });
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(45000) });
      if (!response.ok) throw new Error(`Translation HTTP ${response.status}`);
      const data = await response.json();
      const translated = data[0]
        .map((segment) => segment[0] || '')
        .join('')
        .replace(/ZXQ\s*(\d+)\s*QXZ/g, (_, i) => terms[Number(i)] || '');
      const output = translated.split('\n').map((s) => s.trim());
      if (output.length !== lines.length || output.some((s) => !s)) {
        if (lines.length === 1) return [translated.trim()];
        const result = [];
        for (const line of lines) result.push(...(await request([line], locale)));
        return result;
      }
      if (/ZXQ\s*\d+/.test(translated)) throw new Error('Protected term token was not restored');
      return output;
    } catch (error) {
      if (attempt === 3) throw error;
      await sleep(1500 * (attempt + 1));
    }
  }
}
for (const locale of process.argv.slice(2).length
  ? process.argv.slice(2)
  : Object.keys(languages)) {
  if (!languages[locale]) throw new Error(`Unknown locale: ${locale}`);
  const file = `src/i18n/machine/${locale}.json`;
  const existing = fs.existsSync(file)
    ? JSON.parse(fs.readFileSync(file, 'utf8'))
    : { strings: {} };
  const document = {
    _meta: {
      language: locale,
      machineTranslated: true,
      reviewed: false,
      provider: 'Google Translate public endpoint',
      sourceLanguage: 'en',
      generated: new Date().toISOString().slice(0, 10),
      note: 'Authoring-time draft. Review wording, formulas and official names before public launch.',
    },
    // Removed source copy must not leave orphan translations behind.
    strings: Object.fromEntries(
      source.all.filter((key) => existing.strings[key]).map((key) => [key, existing.strings[key]]),
    ),
  };
  const missing = source.all.filter((key) => !document.strings[key]);
  let index = 0;
  while (index < missing.length) {
    const batch = [];
    let length = 0;
    while (index < missing.length && (length + missing[index].length < 2800 || !batch.length)) {
      batch.push(missing[index]);
      length += missing[index].length + 1;
      index++;
    }
    const values = await request(batch, locale);
    batch.forEach((key, i) => (document.strings[key] = values[i]));
    fs.writeFileSync(file, JSON.stringify(document, null, 2));
    console.log(`${locale}: ${index}/${missing.length} new strings saved`);
    await sleep(200);
  }
  fs.writeFileSync(file, JSON.stringify(document, null, 2));
}
