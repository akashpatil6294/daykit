#!/usr/bin/env node
/**
 * scripts/check-exam-freshness.mjs
 * Fails (exit 1) listing any exam record whose last_verified is older than
 * 90 days, or that is marked verified but has no last_verified date.
 * The pure `findStaleExams` is imported by tests/exam-data.test.mjs.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * @param {Array<{slug:string,last_verified:string|null,verified:boolean}>} exams
 * @param {Date} [asOf] reference date (defaults to now)
 * @returns {Array<{slug:string,reason:string,last_verified:string|null}>}
 */
export function findStaleExams(exams, asOf = new Date()) {
  const cutoff = asOf.getTime() - NINETY_DAYS_MS;
  const stale = [];
  for (const exam of exams) {
    if (exam.verified && !exam.last_verified) {
      stale.push({ slug: exam.slug, reason: 'verified:true but last_verified missing', last_verified: null });
    } else if (exam.last_verified) {
      const t = Date.parse(exam.last_verified);
      if (!Number.isFinite(t)) {
        stale.push({ slug: exam.slug, reason: 'last_verified is not a parseable date', last_verified: exam.last_verified });
      } else if (t < cutoff) {
        stale.push({ slug: exam.slug, reason: 'last_verified older than 90 days', last_verified: exam.last_verified });
      }
    }
  }
  return stale;
}

function main() {
  const exams = JSON.parse(readFileSync(resolve(REPO_ROOT, 'data/exams.json'), 'utf8'));
  const stale = findStaleExams(exams);
  if (stale.length === 0) {
    console.log(`OK: all ${exams.length} exam record(s) are fresh (verified within 90 days or pending verification).`);
    return;
  }
  console.error(`STALE: ${stale.length} exam record(s) need re-verification:`);
  for (const s of stale) console.error(` - ${s.slug}: ${s.reason} (last_verified: ${s.last_verified ?? 'none'})`);
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
