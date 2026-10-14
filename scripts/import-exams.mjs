#!/usr/bin/env node
/**
 * scripts/import-exams.mjs
 * Reads a flattened CSV (see data/exams-template.csv), validates every row, and
 * writes data/exams.json. Unclear or missing values stay null — never guessed.
 *
 * Usage:
 *   node scripts/import-exams.mjs <input.csv> [output.json]
 *   (output defaults to data/exams.json relative to the repo root)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateExams, isOfficialSourceUrl } from '../src/lib/exam-data.ts';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const IMAGE_FIELDS = ['width', 'height', 'unit', 'min_kb', 'max_kb', 'formats', 'background', 'rules'];
const NUMBER_FIELDS = new Set(['width', 'height', 'min_kb', 'max_kb']);

/** Minimal RFC-4180-ish CSV parser: handles quoted fields, escaped quotes, CRLF. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\r' || c === '\n') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  row.push(field);
  if (row.length > 1 || row[0] !== '') rows.push(row);
  if (inQuotes) throw new Error('Unterminated quoted field in CSV');
  return rows;
}

const nullIfEmpty = (v) => (v === undefined || v === null || String(v).trim() === '' ? null : String(v).trim());

function parseNumber(raw, slug, column) {
  const v = nullIfEmpty(raw);
  if (v === null) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error(`Not a number: ${slug}/${column} = "${v}"`);
  return n;
}

function parseFormats(raw, slug) {
  const v = nullIfEmpty(raw);
  if (v === null) return null;
  return v
    .split(';')
    .map((s) => s.trim().toLowerCase().replace(/^\./, ''))
    .filter(Boolean);
}

function parseVerified(raw, slug) {
  const v = nullIfEmpty(raw);
  if (v === null) return false;
  const t = v.toLowerCase();
  if (['true', '1', 'yes', 'y'].includes(t)) return true;
  if (['false', '0', 'no', 'n'].includes(t)) return false;
  throw new Error(`Invalid verified flag: ${slug} = "${v}" (use true/false)`);
}

function rowToExam(headers, cells, lineNo) {
  const get = (col) => {
    const idx = headers.indexOf(col);
    return idx === -1 ? null : nullIfEmpty(cells[idx]);
  };
  const slug = get('slug');
  if (!slug) throw new Error(`Row ${lineNo}: slug is required`);
  const name = get('name');
  if (!name) throw new Error(`Row ${lineNo}: name is required`);
  const cycle = get('cycle');
  if (!cycle) throw new Error(`Row ${lineNo}: cycle is required`);

  const spec = (prefix) => {
    const out = {};
    for (const f of IMAGE_FIELDS) out[f] = null;
    out.width = parseNumber(get(`${prefix}.width`), slug, `${prefix}.width`);
    out.height = parseNumber(get(`${prefix}.height`), slug, `${prefix}.height`);
    out.unit = get(`${prefix}.unit`);
    out.min_kb = parseNumber(get(`${prefix}.min_kb`), slug, `${prefix}.min_kb`);
    out.max_kb = parseNumber(get(`${prefix}.max_kb`), slug, `${prefix}.max_kb`);
    out.formats = parseFormats(get(`${prefix}.formats`), slug);
    out.background = get(`${prefix}.background`);
    out.rules = get(`${prefix}.rules`);
    return out;
  };

  const sourceUrl = get('source_url');
  if (sourceUrl !== null && !isOfficialSourceUrl(slug, sourceUrl))
    throw new Error(
      `Row ${lineNo}: source_url "${sourceUrl}" is not an official domain for slug "${slug}"`
    );
  const lastVerified = get('last_verified');
  if (lastVerified !== null && !/^\d{4}-\d{2}-\d{2}$/.test(lastVerified))
    throw new Error(`Row ${lineNo}: last_verified must be YYYY-MM-DD, got "${lastVerified}"`);

  const intro = get('content.en.intro');
  const exam = {
    slug,
    name,
    cycle,
    photo_spec: spec('photo_spec'),
    signature_spec: spec('signature_spec'),
    source_url: sourceUrl,
    source_title: get('source_title'),
    last_verified: lastVerified,
    verified: parseVerified(get('verified'), slug),
    notes: get('notes'),
  };
  if (intro !== null) exam.content = { en: { intro } };
  return exam;
}

function main() {
  const [, , inputArg, outputArg] = process.argv;
  if (!inputArg) {
    console.error('Usage: node scripts/import-exams.mjs <input.csv> [output.json]');
    process.exit(2);
  }
  const inputPath = resolve(REPO_ROOT, inputArg);
  const outputPath = resolve(REPO_ROOT, outputArg ?? 'data/exams.json');
  const rows = parseCsv(readFileSync(inputPath, 'utf8'));
  if (rows.length < 2) throw new Error('CSV needs a header row and at least one data row');
  const headers = rows[0].map((h) => h.trim());
  for (const required of ['slug', 'name', 'cycle']) {
    if (!headers.includes(required)) throw new Error(`CSV is missing required column "${required}"`);
  }
  const exams = rows.slice(1).map((cells, i) => rowToExam(headers, cells, i + 2));
  // Full schema validation (ranges, formats, verified requires source+date, …).
  validateExams(exams);
  writeFileSync(outputPath, JSON.stringify(exams, null, 2) + '\n');
  console.log(`Wrote ${exams.length} exam record(s) to ${outputPath}`);
}

main();
