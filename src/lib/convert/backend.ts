import type { PdfMode } from '../../data/pdf-tools';
export interface ConverterRequest {
  file: File;
  mode: PdfMode;
  signal: AbortSignal;
  consent?: boolean;
  /** pdf-to-powerpoint only: 'editable' (default) or 'exact' rasterized look. */
  fidelity?: 'editable' | 'exact';
  /** Populated by remote(): notices such as OCR being applied server-side. */
  notices?: { ocrApplied?: boolean };
}
export interface ConverterBackend {
  readonly uploads: boolean;
  convert(request: ConverterRequest): Promise<Blob>;
}
// The caller supplies the worker pipeline: no backend can silently change destination.
export const inBrowser = (
  convert: (request: ConverterRequest) => Promise<Blob>,
): ConverterBackend => ({ uploads: false, convert });

/** The six high-fidelity conversion modes. They run only on the conversion
 * service; the in-browser text-extraction workers are retired for them and
 * the UI must not silently fall back when the service is unavailable. */
export const SERVICE_CONVERTER_MODES: PdfMode[] = [
  'pdf-to-word',
  'pdf-to-powerpoint',
  'pdf-to-excel',
  'word-to-pdf',
  'powerpoint-to-pdf',
  'excel-to-pdf',
];
const EXPECTED_CONTENT_TYPE: Record<string, string> = {
  'pdf-to-word': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'pdf-to-powerpoint': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'pdf-to-excel': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'word-to-pdf': 'application/pdf',
  'powerpoint-to-pdf': 'application/pdf',
  'excel-to-pdf': 'application/pdf',
};
const CONVERTER_MAX_BYTES = 25 * 1024 * 1024;

export function remote(url: string): ConverterBackend {
  const fail = (code: string): never => {
    throw new Error(`remote:${code}`);
  };
  if (!url) fail('missing');
  const endpoint = new URL(url);
  const host = endpoint.hostname;
  const loopback = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  // https: always; http: only for localhost development.
  if (endpoint.protocol !== 'https:' && !(endpoint.protocol === 'http:' && loopback))
    fail('missing');
  return {
    uploads: true,
    async convert({ file, mode, signal, consent, fidelity, notices }) {
      if (!SERVICE_CONVERTER_MODES.includes(mode)) fail('unsupported');
      if (!consent) fail('consent');
      if (file.size > CONVERTER_MAX_BYTES) fail('too-large');
      const form = new FormData();
      form.append('file', file, 'input.' + file.name.split('.').at(-1));
      form.append('mode', mode);
      if (mode === 'pdf-to-powerpoint') form.append('fidelity', fidelity ?? 'editable');
      let response: Response;
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          body: form,
          credentials: 'omit',
          signal,
        });
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') throw e;
        throw new Error('remote:unreachable');
      }
      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        if (response.status === 413 || /page-limit/.test(detail)) fail('too-large');
        if (response.status === 504) fail('timeout');
        if (/password/.test(detail)) fail('password');
        fail('failed');
      }
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes(EXPECTED_CONTENT_TYPE[mode])) fail('failed');
      if (notices && response.headers.get('X-OCR-Applied') === 'true') notices.ocrApplied = true;
      return response.blob();
    },
  };
}
