import type { PdfMode } from '../data/pdf-tools';
export interface PdfJob {
  mode: PdfMode;
  files: File[];
  selection: string;
  target: number;
  rasters?: { blob: Blob; width: number; height: number }[];
  images?: boolean;
  model?: import('./convert/pdf-text-model').DocumentModel;
  options?: { conversionMode?: string; rotation?: number; text?: string; opacity?: number; position?: string; page?: number; x?: number; y?: number; width?: number; strip?: boolean };
  signature?: Blob;
}
export function pageSelection(value: string, count: number): number[] {
  if (!value.trim()) return Array.from({ length: count }, (_, i) => i);
  const result: number[] = [];
  for (const part of value.split(',')) {
    const match = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) throw new Error('selection');
    const a = Number(match[1]),
      b = Number(match[2] || a);
    if (a < 1 || b < a || b > count) throw new Error('selection');
    for (let n = a; n <= b; n++) result.push(n - 1);
    if (result.length > 100) throw new Error('limit');
  }
  return result;
}
