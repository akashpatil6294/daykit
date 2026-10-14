import { useEffect, useRef, useState } from 'react';
import { getPdfTool, type PdfMode } from '../../data/pdf-tools';
import { pdfText as t } from '../../i18n/pdf-tools';
import { localPath } from '../../i18n/runtime';
import { SERVICE_CONVERTER_MODES } from '../../lib/convert/backend';
import type { PdfJob } from '../../lib/pdf-protocol';
import { Uploader, DownloadButton, ErrorState, Preview } from '../image-tools/Shared';
import SignaturePad from './SignaturePad';
type Result = { url: string; size: number; preview?: string; metadata?: Record<string, string> };
export default function DocumentTool({ mode }: { mode: PdfMode }) {
  const config = getPdfTool(mode),
    office = config.group === 'to-pdf',
    edit = config.group === 'edit',
    // The six high-fidelity converters run only on the conversion service.
    // Their in-browser worker path is retired: no silent fallback.
    converter = SERVICE_CONVERTER_MODES.includes(mode);
  const [files, setFiles] = useState<File[]>([]),
    [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [progress, setProgress] = useState(0),
    [output, setOutput] = useState<Result>(),
    [selection, setSelection] = useState(''),
    [scanned, setScanned] = useState(false);
  const [options, setOptions] = useState<NonNullable<PdfJob['options']>>({
    conversionMode: 'image',
    rotation: 90,
    text: '',
    opacity: 0.3,
    position: 'center',
    page: 1,
    x: 10,
    y: 70,
    width: 25,
    strip: true,
  });
  const [signature, setSignature] = useState<Blob>(),
    [consent, setConsent] = useState(false),
    [ocrNotice, setOcrNotice] = useState(false);
  const worker = useRef<Worker | null>(null),
    abort = useRef<AbortController | null>(null),
    mounted = useRef(true);
  // Local preview convenience: when the site is served from localhost without an
  // explicitly configured converter, default to the documented local address
  // (converter/README.md runs the service on :8000). Production origins keep
  // the empty value so the "not configured" banner still appears there.
  // Brackets are stripped because browsers report IPv6 literals as "[::1]".
  const pageHost =
    typeof window === 'undefined'
      ? ''
      : window.location.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  const remoteUrl =
    import.meta.env.PUBLIC_CONVERTER_URL ||
    (pageHost === 'localhost' || pageHost === '127.0.0.1' || pageHost === '::1'
      ? 'http://localhost:8000/convert'
      : '');
  if (typeof window !== 'undefined' && !remoteUrl) {
    console.warn(
      '[daykit] converter URL not configured; page hostname is',
      JSON.stringify(window.location.hostname),
    );
  }
  const quality =
    mode === 'sign-pdf'
      ? t.signatureQuality
      : mode === 'pdf-metadata'
        ? t.metadataQuality
        : office
          ? t.officeQuality
          : mode === 'pdf-to-powerpoint' && options.conversionMode === 'image'
            ? t.imageQuality
            : t.converterQuality;
  function explain(e: unknown) {
    const message = e instanceof Error ? e.message : 'failed';
    if (message.startsWith('remote:')) {
      const code = message.slice('remote:'.length);
      const map: Record<string, keyof typeof t.errors> = {
        missing: 'remoteMissing',
        unsupported: 'conversionFailed',
        consent: 'remoteConsent',
        'too-large': 'tooLarge',
        timeout: 'timeout',
        unreachable: 'serviceDown',
        failed: 'conversionFailed',
        password: 'password',
        'page-limit': 'pageLimit',
      };
      return t.errors[map[code] ?? 'conversionFailed'];
    }
    return (
      t.errors[
        (/password|encrypt.*PDF/i.test(message) ? 'password' : message) as keyof typeof t.errors
      ] || t.errors.corrupt
    );
  }
  async function initialize() {
    // Converter modes need no worker: the service does the conversion.
    if (converter) {
      setReady(true);
      return;
    }
    setReady(false);
    worker.current?.terminate();
    const instance = edit
      ? new Worker(new URL('../../workers/convert-edit.worker.ts', import.meta.url), {
          type: 'module',
        })
      : new Worker(new URL('../../workers/convert-document.worker.ts', import.meta.url), {
          type: 'module',
        });
    worker.current = instance;
    try {
      await Promise.all([
        new Promise<void>((resolve, reject) => {
          instance.onmessage = ({ data }) =>
            data.error ? reject(new Error(data.error)) : data.ready && resolve();
          instance.onerror = () => reject(new Error('failed'));
          instance.postMessage({ prepare: true, mode });
        }),
        import('../../lib/convert/prepare-renderer').then((module) => module.prepareRenderer()),
        // Warm the small wrapper modules too, so navigation is not needed offline.
        import('../../lib/convert/extract'),
        import('../../lib/convert/backend'),
      ]);
      if (mounted.current && worker.current === instance) setReady(true);
    } catch (e) {
      if (mounted.current) setError(explain(e));
    }
  }
  useEffect(() => {
    mounted.current = true;
    const timer = setTimeout(() => void initialize(), 1200);
    return () => {
      mounted.current = false;
      clearTimeout(timer);
      abort.current?.abort();
      worker.current?.terminate();
    };
  }, [mode]);
  useEffect(
    () => () => {
      if (output) {
        URL.revokeObjectURL(output.url);
        if (output.preview) URL.revokeObjectURL(output.preview);
      }
    },
    [output],
  );
  function update(key: keyof NonNullable<PdfJob['options']>, value: string | number | boolean) {
    setOptions((o) => ({ ...o, [key]: value }));
    setOutput(undefined);
    setScanned(false);
  }
  function choose(chosen: File[]) {
    setError('');
    setOutput(undefined);
    setScanned(false);
    setConsent(false);
    if (chosen.length !== 1) {
      setError(t.errors.single);
      return;
    }
    const maxBytes = converter ? 25 * 1024 * 1024 : 50 * 1024 * 1024;
    if (chosen[0].size > maxBytes) {
      setError(converter ? t.errors.tooLarge : t.errors.limit);
      return;
    }
    if (!chosen[0].name.toLowerCase().endsWith(config.accept)) {
      setError(office ? t.errors.unsupportedOffice : t.errors.invalid);
      return;
    }
    setFiles(chosen);
  }
  function assemble(
    job: PdfJob,
    signal: AbortSignal,
  ): Promise<{ blob: Blob; metadata?: Record<string, string> }> {
    return new Promise((resolve, reject) => {
      const instance = worker.current;
      if (!instance) {
        reject(new Error('failed'));
        return;
      }
      const cancel = () => {
        instance.terminate();
        reject(new DOMException('Cancelled', 'AbortError'));
      };
      const finish = () => signal.removeEventListener('abort', cancel);
      instance.onmessage = ({ data }) => {
        if (data.progress !== undefined) setProgress(data.progress);
        else {
          finish();
          data.error ? reject(new Error(data.error)) : resolve(data);
        }
      };
      instance.onerror = () => {
        finish();
        reject(new Error('failed'));
      };
      signal.addEventListener('abort', cancel, { once: true });
      instance.postMessage(job);
    });
  }
  async function run(upload = false) {
    if (!ready || !files.length) return;
    setBusy(true);
    setError('');
    setOutput(undefined);
    setProgress(0);
    setScanned(false);
    setOcrNotice(false);
    const controller = new AbortController();
    abort.current = controller;
    let pdf: Awaited<ReturnType<typeof import('../../lib/pdf-render').openPdf>> | undefined;
    try {
      const job: PdfJob = { mode, files, selection, target: 0, options, signature };
      let result: { blob: Blob; metadata?: Record<string, string> };
      let preview: Blob | undefined;
      const render = await import('../../lib/pdf-render');
      await render.preparePdf();
      if (upload || converter) {
        const { remote } = await import('../../lib/convert/backend');
        const notices: { ocrApplied?: boolean } = {};
        // remote() throws a clear error when the URL is unset or the
        // service is unreachable: converter modes never fall back to the
        // in-browser text extraction.
        result = {
          blob: await remote(remoteUrl).convert({
            file: files[0],
            mode,
            signal: controller.signal,
            consent,
            fidelity:
              mode === 'pdf-to-powerpoint' && options.conversionMode === 'image'
                ? 'exact'
                : 'editable',
            notices,
          }),
        };
        if (notices.ocrApplied) setOcrNotice(true);
      } else {
        if (config.needsTextLayer) {
          pdf = await render.openPdf(files[0]);
          const { extractModel } = await import('../../lib/convert/extract');
          job.model = await extractModel(pdf, selection, controller.signal, setProgress);
          const hasScanned = job.model.pages.some((p) => p.scanned);
          setScanned(hasScanned);
          if (mode === 'pdf-to-powerpoint' && options.conversionMode === 'image') {
            job.rasters = await render.rasterize(
              pdf,
              selection,
              1.25,
              0.9,
              controller.signal,
              setProgress,
            );
            preview = job.rasters[0]?.blob;
          } else if (job.model.pages.every((p) => p.scanned)) throw new Error('noText');
        }
        const { inBrowser } = await import('../../lib/convert/backend');
        let metadata: Record<string, string> | undefined;
        const blob = await inBrowser(async () => {
          const value = await assemble(job, controller.signal);
          metadata = value.metadata;
          return value.blob;
        }).convert({ file: files[0], mode, signal: controller.signal });
        result = { blob, metadata };
      }
      controller.signal.throwIfAborted();
      if (config.outputExt === 'pdf') {
        const outputPdf = await render.openPdf(
          new File([result.blob], 'preview.pdf', { type: 'application/pdf' }),
        );
        try {
          const page = mode === 'sign-pdf' ? String(options.page) : '1';
          preview = (
            await render.rasterize(outputPdf, page, 0.7, 0.8, controller.signal, () => {})
          )[0]?.blob;
        } finally {
          await outputPdf.loadingTask.destroy();
        }
      }
      controller.signal.throwIfAborted();
      setOutput({
        url: URL.createObjectURL(result.blob),
        size: result.blob.size,
        metadata: result.metadata,
        preview: preview ? URL.createObjectURL(preview) : undefined,
      });
      setProgress(100);
    } catch (e) {
      if (!controller.signal.aborted) {
        console.warn('[daykit] tool failed:', mode, e instanceof Error ? e.message : e);
        setError(explain(e));
      }
    } finally {
      await pdf?.loadingTask.destroy();
      if (mounted.current) {
        setBusy(false);
        if (controller.signal.aborted) void initialize();
      }
    }
  }
  const numberControl = (
    key: 'page' | 'x' | 'y' | 'width',
    label: string,
    min: number,
    max: number,
  ) => (
    <label>
      {label}
      <input
        type="number"
        min={min}
        max={max}
        value={options[key]}
        onChange={(e) => update(key, Number(e.target.value))}
      />
    </label>
  );
  return (
    <section className="pdf-workspace">
      <p className="notice">{converter ? t.uploadNotice : t.privacy}</p>
      <p className="notice">{quality}</p>
      <p role="status" data-tool-ready={ready}>
        {ready ? t.loaded : t.loading}
      </p>
      {!ready && error && (
        <button
          onClick={() => {
            setError('');
            void initialize();
          }}
        >
          {t.retry}
        </button>
      )}
      <Uploader
        accept={config.accept}
        kind="any"
        disabled={busy}
        onFile={(file) => choose([file])}
        onFiles={choose}
        onError={setError}
        multiple={config.multiple}
        label={t.choose}
        help={converter ? t.helpUpload : t.help}
        acceptedLabel={config.accept.slice(1).toUpperCase()}
      />
      {files.length > 0 && (
        <p>
          {t.files}: {files[0].name}
        </p>
      )}
      {config.options.length > 0 && (
        <fieldset disabled={busy} className="document-options">
          <legend>{t.format}</legend>
          {config.options.includes('selection') && (
            <label>
              {t.pages}
              <input
                value={selection}
                onChange={(e) => {
                  setSelection(e.target.value);
                  setOutput(undefined);
                }}
              />
              <small>{mode === 'delete-pdf-pages' ? t.deleteHelp : t.pageHelp}</small>
            </label>
          )}
          {config.options.includes('conversionMode') && (
            <label>
              {t.conversionMode}
              <select
                value={options.conversionMode}
                onChange={(e) => update('conversionMode', e.target.value)}
              >
                <option value="image">{t.imageMode}</option>
                <option value="text">{t.textMode}</option>
              </select>
            </label>
          )}
          {config.options.includes('rotation') && (
            <label>
              {t.rotation}
              <select
                value={options.rotation}
                onChange={(e) => update('rotation', Number(e.target.value))}
              >
                {[90, 180, 270].map((value) => (
                  <option key={value} value={value}>
                    {value}°
                  </option>
                ))}
              </select>
            </label>
          )}
          {config.options.includes('stamp') && (
            <>
              <label>
                {t.stamp}
                <input
                  maxLength={100}
                  value={options.text}
                  onChange={(e) => update('text', e.target.value)}
                />
              </label>
              <label>
                {t.opacity}
                <input
                  type="number"
                  min="0.05"
                  max="1"
                  step="0.05"
                  value={options.opacity}
                  onChange={(e) => update('opacity', Number(e.target.value))}
                />
              </label>
              <label>
                {t.position}
                <select
                  value={options.position}
                  onChange={(e) => update('position', e.target.value)}
                >
                  {Object.entries(t.positions).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
          {config.options.includes('metadata') && (
            <label>
              <input
                type="checkbox"
                checked={options.strip}
                onChange={(e) => update('strip', e.target.checked)}
              />
              {t.strip}
            </label>
          )}
          {config.options.includes('signature') && (
            <>
              <label>
                {t.signature}
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(e) => {
                    setSignature(e.target.files?.[0]);
                    setOutput(undefined);
                  }}
                />
              </label>
              <SignaturePad
                disabled={busy}
                onChange={(blob) => {
                  setSignature(blob);
                  setOutput(undefined);
                }}
              />
              {numberControl('page', t.signaturePage, 1, 100)}
              {numberControl('x', t.signatureX, 0, 99)}
              {numberControl('y', t.signatureY, 0, 99)}
              {numberControl('width', t.signatureWidth, 1, 100)}
            </>
          )}
        </fieldset>
      )}
      {scanned && (
        <aside className="notice" role="status">
          <p>{t.scanned}</p>
          <p>{t.scannedHelp}</p>
          <a href={localPath('/tools/pdf-to-powerpoint/')}>{t.imageAlternative}</a>
        </aside>
      )}
      <ErrorState message={error} />
      {ocrNotice && (
        <p className="notice" role="status">
          {t.ocrApplied}
        </p>
      )}
      {converter && (
        <section className="notice">
          <p>{t.remotePrivacy}</p>
          <label>
            <input
              type="checkbox"
              disabled={busy}
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            {t.remoteConsent}
          </label>
        </section>
      )}
      <div className="pdf-actions">
        <button
          className="button primary"
          disabled={!ready || busy || !files.length}
          onClick={() => void run(converter)}
        >
          {converter ? t.remote : t.run}
        </button>
        {busy && (
          <button className="button secondary" onClick={() => abort.current?.abort()}>
            {t.cancel}
          </button>
        )}
      </div>
      {busy && (
        <div role="status">
          <p>
            {t.working}… {Math.round(progress)}%
          </p>
          <progress max={100} value={progress} aria-label={t.working} />
        </div>
      )}
      {output && (
        <section aria-live="polite">
          <h2>{t.ready}</h2>
          <p>
            {t.before}: {(files[0].size / 1024).toFixed(1)} KB · {t.after}:{' '}
            {(output.size / 1024).toFixed(1)} KB
          </p>
          <DownloadButton
            url={output.url}
            filename={`${mode}-daykit.${config.outputExt}`}
            label={t.download}
          />
          {output.preview && (
            <Preview
              url={output.preview}
              label={mode === 'sign-pdf' ? t.signaturePreview : t.preview}
              alt={mode === 'sign-pdf' ? t.signaturePreview : t.preview}
            />
          )}
          <p>{quality}</p>
          {mode === 'pdf-metadata' && output.metadata && (
            <>
              <h3>{t.metadata}</h3>
              <dl>
                {Object.entries(output.metadata).map(([key, value]) => (
                  <div key={key}>
                    <dt>{t.metadataFields[key as keyof typeof t.metadataFields]}</dt>
                    <dd>{value || '—'}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </section>
      )}
    </section>
  );
}
