import raw from '../../data/exams.json' with { type: 'json' };

export const SPEC_UNITS = ['px', 'cm', 'mm', 'in'] as const;
export type SpecUnit = (typeof SPEC_UNITS)[number];

/** Upload formats that are sane for photo/signature image uploads. */
const FORMAT_ALLOWLIST = new Set(['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tif', 'tiff']);

export interface ExamImageSpec {
  /** Linear dimensions; null when the official notice states none. */
  width: number | null;
  height: number | null;
  /** Unit of width/height, e.g. "px" or "cm"; null when no dimensions are stated. */
  unit: SpecUnit | null;
  min_kb: number | null;
  max_kb: number | null;
  /** e.g. ["jpg", "jpeg"]; null when the notice names no single set of formats. */
  formats: string[] | null;
  /** e.g. "white"; null when unstated. */
  background: string | null;
  /** Other rules transcribed from the notice; null when none apply. */
  rules: string | null;
}

export interface Exam {
  slug: string;
  name: string;
  /** e.g. "SSC CGL 2026"; null when the cycle is not pinned down. */
  cycle: string | null;
  photo_spec: ExamImageSpec;
  signature_spec: ExamImageSpec;
  source_url: string | null;
  source_title: string | null;
  /** ISO date (YYYY-MM-DD) the record was last checked against the official source. */
  last_verified: string | null;
  verified: boolean;
  notes: string | null;
  content?: { en?: { intro?: string } };
}

/**
 * Official-domain allowlist per exam slug. A verified record must cite a URL on
 * the conducting body's own domain (CDNs the body itself publishes to count).
 * Slugs without an entry here only need an http(s) URL.
 */
const OFFICIAL_DOMAINS: Record<string, RegExp[]> = {
  ssc: [/^([a-z0-9-]+\.)*ssc\.gov\.in$/],
  upsc: [/^([a-z0-9-]+\.)*upsc\.gov\.in$/, /^([a-z0-9-]+\.)*upsconline\.gov\.in$/],
  neet: [
    /^([a-z0-9-]+\.)*nta\.ac\.in$/,
    /^([a-z0-9-]+\.)*neet\.nta\.nic\.in$/,
    /^([a-z0-9-]+\.)*s3waas\.gov\.in$/,
  ],
  'jee-main': [
    /^([a-z0-9-]+\.)*nta\.ac\.in$/,
    /^([a-z0-9-]+\.)*jeemain\.nta\.nic\.in$/,
    /^([a-z0-9-]+\.)*s3waas\.gov\.in$/,
  ],
  ibps: [/^([a-z0-9-]+\.)*ibps\.in$/],
  'sbi-po': [/^([a-z0-9-]+\.)*sbi\.co\.in$/, /^([a-z0-9-]+\.)*sbi\.bank\.in$/],
  rrb: [
    /^([a-z0-9-]+\.)*indianrailways\.gov\.in$/,
    /^([a-z0-9-]+\.)*rrb[a-z]*\.gov\.in$/,
  ],
  'rrb-alp': [
    /^([a-z0-9-]+\.)*indianrailways\.gov\.in$/,
    /^([a-z0-9-]+\.)*rrb[a-z]*\.gov\.in$/,
  ],
  kcet: [
    /^([a-z0-9-]+\.)*kea\.kar\.nic\.in$/,
    /^([a-z0-9-]+\.)*cetonline\.karnataka\.gov\.in$/,
    /^([a-z0-9-]+\.)*keaonline\.karnataka\.gov\.in$/,
  ],
  gate: [/^([a-z0-9-]+\.)*iit[a-z]*\.ac\.in$/],
};

/** True when `url` is http(s) and, for slugs with an allowlist, hosted on an official domain. */
export function isOfficialSourceUrl(slug: string, url: string): boolean {
  let host: string;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    host = parsed.hostname.toLowerCase();
  } catch {
    return false;
  }
  const patterns = OFFICIAL_DOMAINS[slug];
  if (!patterns) return true;
  return patterns.some((re) => re.test(host));
}

function isIsoDate(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}

function validateImageSpec(entry: Record<string, unknown>, key: string): void {
  const slug = entry.slug as string;
  const spec = entry[key] as Record<string, unknown> | null | undefined;
  if (!spec || typeof spec !== 'object') throw new Error(`Missing spec: ${slug}/${key}`);
  for (const field of ['width', 'height'] as const) {
    const value = spec[field];
    if (
      value !== null &&
      (typeof value !== 'number' ||
        !Number.isInteger(value) ||
        value < 1 ||
        value > 8192)
    )
      throw new Error(`Invalid ${field}: ${slug}/${key}`);
  }
  if (spec.unit !== null && !SPEC_UNITS.includes(spec.unit as SpecUnit))
    throw new Error(`Invalid unit: ${slug}/${key}`);
  for (const field of ['min_kb', 'max_kb'] as const) {
    const value = spec[field];
    if (
      value !== null &&
      (typeof value !== 'number' || !Number.isFinite(value) || value <= 0)
    )
      throw new Error(`Invalid ${field}: ${slug}/${key}`);
  }
  const { min_kb, max_kb, width, height, unit } = spec as {
    min_kb: number | null;
    max_kb: number | null;
    width: number | null;
    height: number | null;
    unit: SpecUnit | null;
  };
  if (max_kb !== null && max_kb > 10240) throw new Error(`Unsupported max_kb: ${slug}/${key}`);
  if (min_kb !== null && max_kb !== null && min_kb > max_kb)
    throw new Error(`min_kb exceeds max_kb: ${slug}/${key}`);
  if (
    unit !== 'cm' &&
    unit !== 'mm' &&
    unit !== 'in' &&
    width !== null &&
    height !== null &&
    width * height > 16_000_000
  )
    throw new Error(`Unsupported pixel area: ${slug}/${key}`);
  const formats = spec.formats;
  if (
    formats !== null &&
    (!Array.isArray(formats) ||
      formats.length === 0 ||
      formats.some((f) => typeof f !== 'string' || !FORMAT_ALLOWLIST.has(f.toLowerCase())))
  )
    throw new Error(`Invalid formats: ${slug}/${key}`);
  for (const field of ['background', 'rules'] as const) {
    const value = spec[field];
    if (value !== null && (typeof value !== 'string' || !value.trim()))
      throw new Error(`Invalid ${field}: ${slug}/${key}`);
  }
}

/** Fail the build on malformed entries instead of publishing misleading preset values. */
export function validateExams(input: unknown): Exam[] {
  if (!Array.isArray(input)) throw new Error('exams.json must be an array');
  const slugs = new Set<string>();
  for (const entry of input as Record<string, unknown>[]) {
    if (
      !entry ||
      typeof entry.slug !== 'string' ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug) ||
      slugs.has(entry.slug)
    )
      throw new Error('Invalid or duplicate exam slug');
    slugs.add(entry.slug);
    if (typeof entry.name !== 'string' || !entry.name.trim() || typeof entry.verified !== 'boolean')
      throw new Error(`Invalid exam identity: ${entry.slug}`);
    for (const field of ['cycle', 'source_title', 'notes'] as const) {
      const value = entry[field];
      if (value !== null && (typeof value !== 'string' || !value.trim()))
        throw new Error(`Invalid ${field}: ${entry.slug}`);
    }
    validateImageSpec(entry, 'photo_spec');
    validateImageSpec(entry, 'signature_spec');
    if (
      entry.source_url !== null &&
      (typeof entry.source_url !== 'string' || !isOfficialSourceUrl(entry.slug, entry.source_url))
    )
      throw new Error(`Invalid source_url: ${entry.slug}`);
    if (entry.last_verified !== null && !isIsoDate(entry.last_verified))
      throw new Error(`Invalid last_verified: ${entry.slug}`);
    if (entry.verified && (!entry.source_url || !entry.last_verified))
      throw new Error(`Verified entries require source_url and last_verified: ${entry.slug}`);
  }
  return input as Exam[];
}

export const exams = validateExams(raw);
