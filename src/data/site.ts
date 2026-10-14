import { toolCatalog } from './tools';
import { exams } from '../lib/exam-data';
import { calculatorSlugs } from './calculators';
import { pdfSlugs } from './pdf-tools';
import { guides } from '../lib/guides';
export const categoryKeys = ['tools', 'calculators', 'exams'] as const;
export const legalKeys = ['about', 'contact', 'privacy', 'terms', 'disclaimer'] as const;
export const routes = [
  '/',
  '/guides/',
  ...guides.map((g) => `/guides/${g.slug}/`),
  ...pdfSlugs.map((slug) => `/tools/${slug}/`),
  ...categoryKeys.map((key) => `/${key}/`),
  ...legalKeys.map((key) => `/${key}/`),
  ...toolCatalog.map((tool) => `/tools/${tool.slug}/`),
  ...exams.map((exam) => `/resize-photo-signature-${exam.slug}/`),
  ...calculatorSlugs.map((slug) => `/calculators/${slug}/`),
];
// Future facts belong here or in dedicated data files, never in UI components.
export interface ReferenceEntry {
  id: string;
  value: number | string | null;
  verified: boolean;
  sourceUrl: string | null;
  checkedAt: string | null;
}
export const rates: ReferenceEntry[] = [];
