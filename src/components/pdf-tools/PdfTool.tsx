import { useEffect, useRef, useState } from 'react';
import { getPdfTool, type PdfMode } from '../../data/pdf-tools';
import type { PdfJob } from '../../lib/pdf-protocol';
import { pdfText as t } from '../../i18n/pdf-tools';
import { Uploader, DownloadButton, ErrorState, Preview } from '../image-tools/Shared';
export default function PdfTool({ mode }: { mode: PdfMode }) {
  const config = getPdfTool(mode);
  const [files, setFiles] = useState<File[]>([]),
    [selection, setSelection] = useState(''),
    [target, setTarget] = useState(200),
    [busy, setBusy] = useState(false),
    [progress, setProgress] = useState(0),
    [error, setError] = useState(''),
    [output, setOutput] = useState<{ url: string; size: number; preview?: string }>();
  const worker = useRef<Worker | null>(null),
    controller = useRef<AbortController | null>(null);
  useEffect(
    () => () => {
      worker.current?.terminate();
      controller.current?.abort();
    },
    [],
  );
  useEffect(
    () => () => {
      if (output) {
        URL.revokeObjectURL(output.url);
        if (output.preview) URL.revokeObjectURL(output.preview);
      }
    },
    [output],
  );
  function add(chosen: File[]) {
    setError('');
    setOutput(undefined);
    const list = config.multiple ? [...files, ...chosen] : chosen;
    if (list.length > 1 && !config.multiple) {
      setError(t.errors.single);
      return;
    }
    if (list.length > 50 || list.reduce((n, f) => n + f.size, 0) > 50 * 1024 * 1024) {
      setError(t.errors.limit);
      return;
    }
    if (
      list.some((f) =>
        mode === 'images-to-pdf'
          ? !/\.(jpe?g|png)$/i.test(f.name)
          : !f.name.toLowerCase().endsWith('.pdf'),
      )
    ) {
      setError(t.errors.invalid);
      return;
    }
    setFiles(list);
  }
  function assemble(job: PdfJob): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const instance = new Worker(new URL('../../workers/pdf.worker.ts', import.meta.url), {
        type: 'module',
      });
      worker.current = instance;
      instance.onmessage = ({ data }) => {
        if (data.progress !== undefined) setProgress(data.progress);
        else {
          instance.terminate();
          worker.current = null;
          data.error ? reject(new Error(data.error)) : resolve(data.blob);
        }
      };
      instance.onerror = () => {
        instance.terminate();
        reject(new Error('failed'));
      };
      controller.current?.signal.addEventListener(
        'abort',
        () => {
          instance.terminate();
          reject(new DOMException('Cancelled', 'AbortError'));
        },
        { once: true },
      );
      instance.postMessage(job);
    });
  }
  async function run() {
    if (!files.length) {
      setError(t.errors.empty);
      return;
    }
    if (mode === 'compress-pdf' && (!Number.isFinite(target) || target < 20 || target > 50000)) {
      setError(t.errors.target);
      return;
    }
    setBusy(true);
    setProgress(0);
    setError('');
    setOutput(undefined);
    const abort = new AbortController();
    controller.current = abort;
    let pdf: Awaited<ReturnType<typeof import('../../lib/pdf-render').openPdf>> | undefined;
    try {
      let result: Blob, preview: Blob | undefined;
      const job = { mode, files, selection, target };
      if (mode === 'compress-pdf' || mode === 'pdf-to-images') {
        const { openPdf, rasterize } = await import('../../lib/pdf-render');
        pdf = await openPdf(files[0]);
        if (mode === 'pdf-to-images') {
          const rasters = await rasterize(pdf, selection, 1.6, 0.9, abort.signal, setProgress);
          preview = rasters[0].blob;
          result = await assemble({ ...job, rasters, images: true });
        } else {
          let best: Blob | undefined;
          for (const scale of [2, 1.5, 1, 0.75, 0.5]) {
            for (const quality of [0.85, 0.65, 0.45, 0.25]) {
              abort.signal.throwIfAborted();
              const rasters = await rasterize(
                pdf,
                selection,
                scale,
                quality,
                abort.signal,
                setProgress,
              );
              const candidate = await assemble({ ...job, rasters });
              if (candidate.size <= target * 1024) {
                best = candidate;
                preview = rasters[0].blob;
                break;
              }
            }
            if (best) break;
          }
          if (!best) throw new Error('unreachable');
          result = best;
        }
      } else result = await assemble(job);
      abort.signal.throwIfAborted();
      setOutput({
        url: URL.createObjectURL(result),
        size: result.size,
        preview: preview ? URL.createObjectURL(preview) : undefined,
      });
      setProgress(100);
    } catch (e) {
      if (!abort.signal.aborted) {
        const err = e as Error;
        const code = /password|encrypt/i.test(err.message) ? 'password' : err.message;
        setError(t.errors[code as keyof typeof t.errors] || t.errors.corrupt);
      }
    } finally {
      await pdf?.loadingTask.destroy();
      setBusy(false);
    }
  }
  const move = (index: number, delta: number) => {
    setOutput(undefined);
    setFiles((current) => {
      const copy = [...current];
      [copy[index], copy[index + delta]] = [copy[index + delta], copy[index]];
      return copy;
    });
  };
  return (
    <section className="pdf-workspace">
      <p className="notice">{t.privacy}</p>
      <Uploader
        accept={config.accept}
        kind="any"
        disabled={busy}
        onFile={(f) => add([f])}
        onFiles={add}
        onError={setError}
        multiple={config.multiple}
        label={t.choose}
        help={t.help}
        acceptedLabel={mode === 'images-to-pdf' ? 'JPG, PNG' : 'PDF'}
      />
      {files.length > 0 && (
        <section aria-label={t.files}>
          <h2>{t.files}</h2>
          <ol className="pdf-files">
            {files.map((file, i) => (
              <li key={`${i}-${file.name}`}>
                <span>
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </span>
                <button disabled={busy || i === 0} onClick={() => move(i, -1)}>
                  {t.up}
                </button>
                <button disabled={busy || i === files.length - 1} onClick={() => move(i, 1)}>
                  {t.down}
                </button>
                <button
                  disabled={busy}
                  onClick={() => {
                    setFiles(files.filter((_, j) => j !== i));
                    setOutput(undefined);
                  }}
                >
                  {t.remove}
                </button>
              </li>
            ))}
          </ol>
        </section>
      )}
      {!config.multiple && (
        <label>
          {t.pages}
          <input
            value={selection}
            disabled={busy}
            onChange={(e) => {
              setSelection(e.target.value);
              setOutput(undefined);
            }}
            aria-describedby="pdf-page-help"
          />
          <small id="pdf-page-help">{t.pageHelp}</small>
        </label>
      )}
      {mode === 'compress-pdf' && (
        <>
          <p className="notice">{t.flatten}</p>
          <label>
            {t.preset}
            <select
              disabled={busy}
              value={[100, 200, 500].includes(target) ? target : 'custom'}
              onChange={(e) => {
                setTarget(e.target.value === 'custom' ? 300 : Number(e.target.value));
                setOutput(undefined);
              }}
            >
              {[100, 200, 500].map((n) => (
                <option key={n} value={n}>
                  {n} KB
                </option>
              ))}
              <option value="custom">{t.custom}</option>
            </select>
          </label>
          <label>
            {t.target}
            <input
              type="number"
              min="20"
              max="50000"
              disabled={busy}
              value={target}
              onChange={(e) => {
                setTarget(Number(e.target.value));
                setOutput(undefined);
              }}
            />
          </label>
        </>
      )}
      <ErrorState message={error} />
      <div className="pdf-actions">
        <button className="button primary" disabled={busy || !files.length} onClick={run}>
          {t.run}
        </button>
        {busy && (
          <button className="button secondary" onClick={() => controller.current?.abort()}>
            {t.cancel}
          </button>
        )}
      </div>
      {busy && (
        <div role="status">
          <p>
            {t.working}… {Math.round(progress)}%
          </p>
          <progress max="100" value={progress} aria-label={t.working} />
        </div>
      )}
      {output && (
        <section aria-live="polite">
          <h2>{t.ready}</h2>
          <p>
            {t.before}: {(files.reduce((n, f) => n + f.size, 0) / 1024).toFixed(1)} KB · {t.after}:{' '}
            {(output.size / 1024).toFixed(1)} KB
          </p>
          <DownloadButton
            url={output.url}
            filename={`${mode}-daykit.${config.outputExt}`}
            label={t.download}
          />
          {output.preview && <Preview url={output.preview} label={t.preview} alt={t.preview} />}
          <p>{t.quality}</p>
        </section>
      )}
    </section>
  );
}
