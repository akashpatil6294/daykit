import test from 'node:test';
import assert from 'node:assert/strict';
import { exams, validateExams, isOfficialSourceUrl } from '../src/lib/exam-data.ts';
import { findStaleExams } from '../scripts/check-exam-freshness.mjs';

test('seed names exist and JSON-only additions need no hardcoded exam registry', () => {
  for (const slug of ['ssc', 'upsc', 'neet', 'jee-main', 'ibps', 'sbi-po', 'rrb', 'kcet', 'gate'])
    assert.ok(exams.some((exam) => exam.slug === slug));
  const extra = structuredClone(exams[0]);
  extra.slug = 'test-new-exam';
  extra.name = 'Test exam';
  delete extra.content;
  assert.equal(validateExams([...exams, extra]).at(-1).slug, 'test-new-exam');
});

test('a fully populated record with the new schema validates', () => {
  const entry = structuredClone(exams[0]);
  entry.slug = 'ssc';
  entry.name = 'SSC';
  entry.cycle = 'SSC CGL 2026';
  entry.photo_spec = {
    width: 200, height: 230, unit: 'px', min_kb: 20, max_kb: 50,
    formats: ['jpg', 'jpeg'], background: 'white', rules: null,
  };
  entry.signature_spec = {
    width: null, height: null, unit: null, min_kb: 10, max_kb: 20,
    formats: ['jpg'], background: 'white', rules: 'Sign on white paper with black ink.',
  };
  entry.source_url = 'https://ssc.gov.in/api/attachment/downloaded?fileName=Notice.pdf&location=NoticeBoards';
  entry.source_title = 'Notice – Combined Graduate Level Examination, 2026';
  entry.last_verified = '2026-10-14';
  entry.verified = true;
  entry.notes = 'Photo captured live by the application module.';
  assert.equal(validateExams([entry])[0].slug, 'ssc');
});

test('invalid spec ranges, dates, slugs and falsely marked records stop the build', () => {
  for (const mutate of [
    (e) => (e.slug = '../bad'),
    (e) => (e.photo_spec.width = -1),
    (e) => (e.photo_spec.formats = ['pdf']),
    (e) => (e.photo_spec.formats = 'jpg'),
    (e) => (e.photo_spec.unit = 'furlongs'),
    (e) => (e.signature_spec.max_kb = 0),
    (e) => (e.signature_spec.min_kb = 0),
    (e) => {
      e.photo_spec.min_kb = 100;
      e.photo_spec.max_kb = 50;
    },
    (e) => (e.last_verified = '2026-02-31'),
    (e) => (e.source_url = 'javascript:alert(1)'),
    (e) => (e.source_url = 'https://example.com/notice.pdf'),
    (e) => (e.notes = 42),
    (e) => (e.cycle = ''),
    (e) => {
      e.verified = true;
      e.source_url = null;
    },
    (e) => {
      e.verified = true;
      e.last_verified = null;
    },
  ]) {
    const entry = structuredClone(exams[0]);
    mutate(entry);
    assert.throws(() => validateExams([entry]));
  }
  assert.throws(() => validateExams([exams[0], exams[0]]));
});

test('official-domain allowlist gates source_url per exam slug', () => {
  assert.ok(isOfficialSourceUrl('ssc', 'https://ssc.gov.in/api/x.pdf'));
  assert.ok(isOfficialSourceUrl('gate', 'https://gate2027.iitm.ac.in/photograph_and_signature'));
  assert.ok(!isOfficialSourceUrl('ssc', 'https://example.com/notice.pdf'));
  assert.ok(!isOfficialSourceUrl('upsc', 'https://coaching-site.example/upsc.pdf'));
  assert.ok(!isOfficialSourceUrl('ssc', 'javascript:alert(1)'));
  // Slugs without an allowlist entry only need an http(s) URL.
  assert.ok(isOfficialSourceUrl('some-new-exam', 'https://example.com/notice.pdf'));
});

test('findStaleExams flags records older than 90 days or verified without a date', () => {
  const asOf = new Date('2026-10-14T00:00:00Z');
  const fresh = { slug: 'a', last_verified: '2026-10-13', verified: true };
  const boundary = { slug: 'b', last_verified: '2026-07-16', verified: true }; // 90 days before 2026-10-14
  const stale = { slug: 'c', last_verified: '2026-07-15', verified: true };
  const noDate = { slug: 'd', last_verified: null, verified: true };
  const unverified = { slug: 'e', last_verified: null, verified: false };
  const found = findStaleExams([fresh, boundary, stale, noDate, unverified], asOf);
  assert.deepEqual(
    found.map((s) => s.slug).sort(),
    ['c', 'd']
  );
});
