# EXAM-DATA-TODO — exam photo/signature verification follow-ups

Generated 2026-10-14. Values in `data/exams.json` come only from the conducting
body's official documents; anything not confirmed stays `null` with
`verified: false`. A record is flagged stale when `last_verified` is older than
90 days (`node scripts/check-exam-freshness.mjs`) — re-check each record against
the **next** cycle's notice when it is published and update `last_verified` even
if nothing changed.

How to fill a row: open the official URL, read the notice, then either edit
`data/exams.json` directly or fill `data/exams-template.csv` and run
`node scripts/import-exams.mjs data/exams-template.csv` (it validates: required
slug/name/cycle, number ranges, official-domain `source_url`, ISO
`last_verified`).

---

## 1. SSC (`ssc`) — SSC CGL 2026 — verified 2026-10-14
- Official site to check: https://ssc.gov.in (notice board; next cycle's notice)
- Still needed: nothing for CGL 2026. Open item: the notice body's signature
  dimensions (6.0 cm x 2.0 cm) conflict with Annexure-IV (4.0 cm x 2.0 cm) —
  confirm which one the live application enforces.
- Open item: SSC CHSL 2026 full notice could not be located; its specs appear
  identical to CGL's (live photo; signature JPEG 10–20 KB, ~6.0 x 2.0 cm). If a
  full CHSL notice shows different specs, split into a separate record.

## 2. UPSC (`upsc`) — UPSC CSE 2026 — verified 2026-10-14
- Official site to check: https://upsc.gov.in and the live application
  instructions at https://upsconline.nic.in ("Instructions and FAQs >
  Instruction for filling the form > Photos and Signature")
- Still needed (null fields): `photo_spec.width/height/unit`,
  `signature_spec.width/height/unit` — pixel dimensions and bit-depth are stated
  only in the portal's application-module instructions, which could not be
  fetched. Read them from the live portal and fill.

## 3. NEET (`neet`) — NEET (UG) 2026 — verified 2026-10-14
- Official site to check: https://neet.nta.nic.in (next Information Bulletin)
- Still needed (null fields): `photo_spec.width/height/unit`,
  `signature_spec.width/height/unit`, `signature_spec.background` — the bulletin
  gives no pixel dimensions or DPI. Confirm against the next bulletin; if still
  absent, leave null.

## 4. JEE Main (`jee-main`) — JEE Main 2026 — verified 2026-10-14
- Official site to check: https://jeemain.nta.nic.in (next Information Bulletin)
- Still needed (null fields): `photo_spec.width/height/unit`,
  `signature_spec.width/height/unit`, `signature_spec.background` — no
  dimensions or DPI in the bulletin. Do NOT copy 3.5x4.5 cm from coaching blogs;
  leave null unless the official bulletin states it.

## 5. IBPS (`ibps`) — IBPS CRP PO/MT-XVI and CRP CSA 2026 — verified 2026-10-14
- Official site to check: https://www.ibps.in (CRP PO/MT and CRP CSA pages;
  "Guidelines for scanning and Upload of Documents")
- Still needed: nothing — PO and Clerk specs confirmed identical from official
  ibps.in PDFs. Re-check when the CRP PO/MT-XVII / CRP CSA next-cycle
  guidelines are published (the CRP-PO/MT-XVI detailed-notification PDF link
  returned HTTP 500 during verification; Annexure III should be re-read from the
  official domain when available).

## 6. SBI PO (`sbi-po`) — SBI PO 2026 (CRPD/PO/2026-27/09) — verified 2026-10-14
- Official site to check: https://sbi.bank.in (careers / current openings;
  official domain; sbi.co.in redirects here)
- Still needed: nothing for this cycle, but the values were read from faithful
  copies because the official careers portal is JavaScript-only. When the next
  advertisement publishes, confirm Annexure II directly from an official
  `sbi.bank.in` PDF URL and replace `source_url` with that PDF link.

## 7. RRB (`rrb`) — RRB CEN 09/2025 (Level-1) — verified 2026-10-14
- Official site to check: https://www.rrbcdg.gov.in (or the regional RRB site
  for the candidate's zone)
- Still needed (null fields): photo `width/height/unit/min_kb/max_kb/formats` —
  intentionally null: this CEN captures a live photo instead of an upload.
  Re-check the next CEN; if it reverts to an uploaded photo, fill from that
  notice.

## 8. RRB ALP (`rrb-alp`) — RRB CEN 01/2025 (Assistant Loco Pilot) — verified 2026-10-14
- Official site to check: https://www.rrbcdg.gov.in (next ALP CEN)
- Still needed: nothing for this CEN (all stated values recorded; pixel
  dimensions are stated as minimums). Re-check when the next ALP CEN publishes.

## 9. KCET (`kcet`) — KCET (UGCET) 2026 — NOT verified, all fields null
- Official site to check: https://cetonline.karnataka.gov.in and
  https://kea.kar.nic.in (Information Bulletin for the next CET cycle)
- Still needed: EVERYTHING — `photo_spec` and `signature_spec` are entirely
  null. The 2026 bulletin states no upload specs at all (they appear only in
  the live application form, which requires login). A human should check the
  application-session instructions or the next bulletin and fill every field
  from the official source.

## 10. GATE (`gate`) — GATE 2027 — verified 2026-10-14
- Official site to check: https://gate2027.iitm.ac.in (and the organizing
  institute's portal for the next cycle)
- Still needed (null fields): `photo_spec.width/height`, `min_kb`;
  `signature_spec.width/height`, `min_kb` — intentionally null: the official
  brochure states pixel ranges (recorded in `rules`) and only maximum file
  sizes (600 KB / 300 KB). Do NOT invent minima. Re-check when the next GATE
  brochure publishes.

---

## General rules for this dataset
- Official sources only; unclear or missing = `null`, never a guess.
- `verified: true` requires both `source_url` (on the conducting body's domain —
  enforced by `validateExams` in `src/lib/exam-data.ts`) and `last_verified`
  (ISO date of the check).
- Re-verify each record against the next cycle's notice and update
  `last_verified` every time, even if nothing changed.
