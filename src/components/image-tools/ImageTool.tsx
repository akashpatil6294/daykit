import { useEffect, useRef, useState } from 'react';
import ImageWorker from '../../workers/image.worker?worker';
import { imageTools as t } from '../../i18n/image-tools';
import { toolCatalog, type ToolMode } from '../../data/tools';
import presets from '../../data/photo-presets.json';
import { cropRect, dimensionsValid, MAX_FILE_BYTES } from '../../lib/image-math';
import type { ImageSettings, WorkerReply, WorkerRequest } from '../../lib/image-protocol';
import { Uploader, Preview, DownloadButton, ErrorState } from './Shared';
import { examText } from '../../i18n/exams';
import type { ExamImageSpec as ExamSpec } from '../../lib/exam-data';
type ImageInfo = { width: number; height: number; preview: string; size: number; name: string };
type Result = {
  url: string;
  width: number;
  height: number;
  size: number;
  padding: number;
  filename: string;
};
export default function ImageTool({
  mode,
  exam,
}: {
  mode: ToolMode;
  exam?: ExamSpec & { kind: 'photo' | 'signature' };
}) {
  const tool = toolCatalog.find((item) => item.mode === mode)!;
  const worker = useRef<Worker | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const urls = useRef<string[]>([]);
  const file = useRef<File | null>(null);
  const [generation, setGeneration] = useState(0);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>(t.preparing);
  const [error, setError] = useState('');
  const [info, setInfo] = useState<ImageInfo | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const pxDims = !exam || !exam.unit || exam.unit === 'px';
  const [width, setWidth] = useState(exam ? (pxDims ? (exam.width ?? NaN) : NaN) : 600);
  const [height, setHeight] = useState(exam ? (pxDims ? (exam.height ?? NaN) : NaN) : 600);
  const [locked, setLocked] = useState(true);
  const [minKB, setMinKB] = useState(exam?.min_kb ?? NaN);
  const [maxKB, setMaxKB] = useState(exam?.max_kb ?? NaN);
  const firstFormat = exam?.formats?.[0]?.toLowerCase();
  const [outputFormat, setOutputFormat] = useState<'jpeg' | 'png' | ''>(
    firstFormat === 'jpg' || firstFormat === 'jpeg' ? 'jpeg' : firstFormat === 'png' ? 'png' : '',
  );
  const showCrop = mode === 'passport' && exam?.kind !== 'signature';
  const [target, setTarget] = useState(100);
  const [quality, setQuality] = useState(0.9);
  const [preset, setPreset] = useState('square');
  const [zoom, setZoom] = useState(1);
  const [x, setX] = useState(50);
  const [y, setY] = useState(50);
  const drag = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);
  function release() {
    urls.current.forEach((url) => URL.revokeObjectURL(url));
    urls.current = [];
  }
  function clearResult() {
    setResult((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous.url);
        urls.current = urls.current.filter((url) => url !== previous.url);
      }
      return null;
    });
  }
  function reset() {
    worker.current?.terminate();
    clearTimeout(timer.current);
    release();
    file.current = null;
    setInfo(null);
    setResult(null);
    setBusy(false);
    setReady(false);
    setError('');
    setStatus(t.preparing);
    setGeneration((value) => value + 1);
  }
  function startTimeout() {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      worker.current?.terminate();
      setReady(false);
      setBusy(false);
      setError(t.timeout);
    }, 90000);
  }
  function send(message: WorkerRequest) {
    worker.current?.postMessage(message);
  }
  useEffect(() => {
    const instance = new ImageWorker();
    worker.current = instance;
    instance.onmessage = (event: MessageEvent<WorkerReply>) => {
      const reply = event.data;
      if (reply.type === 'progress') return;
      clearTimeout(timer.current);
      setBusy(false);
      if (reply.type === 'ready') {
        setReady(true);
        setStatus(t.ready);
      }
      if (reply.type === 'loaded') {
        const preview = URL.createObjectURL(reply.preview);
        urls.current.push(preview);
        setInfo({
          width: reply.width,
          height: reply.height,
          preview,
          size: file.current!.size,
          name: file.current!.name,
        });
        if (mode !== 'passport') {
          setWidth(reply.width);
          setHeight(reply.height);
        }
        setZoom(1);
        setX(50);
        setY(50);
        setStatus(t.ready);
      }
      if (reply.type === 'result') {
        const url = URL.createObjectURL(reply.blob);
        urls.current.push(url);
        const base = (file.current?.name.replace(/\.[^.]*$/, '') || 'image')
          .replace(/[^a-zA-Z0-9_-]/g, '_')
          .slice(0, 80);
        setResult({
          url,
          width: reply.width,
          height: reply.height,
          size: reply.blob.size,
          padding: reply.padding,
          filename: `${base}-${mode}.${reply.blob.type === 'image/png' ? 'png' : 'jpg'}`,
        });
        setStatus(t.done);
      }
      if (reply.type === 'error') {
        setError(
          reply.code === 'constraints'
            ? examText.constraints
            : t.errors[reply.code as keyof typeof t.errors] || t.errors.decode,
        );
        setStatus('');
      }
    };
    instance.onerror = () => {
      clearTimeout(timer.current);
      instance.terminate();
      setBusy(false);
      setReady(false);
      setError(t.errors.worker);
    };
    startTimeout();
    instance.postMessage({ type: 'init', heic: mode === 'heic-to-jpg' } satisfies WorkerRequest);
    return () => {
      clearTimeout(timer.current);
      instance.terminate();
      release();
    };
  }, [generation, mode]);
  function load(next: File) {
    clearResult();
    setError('');
    setInfo(null);
    release();
    if (!next.size || next.size > MAX_FILE_BYTES) {
      setError(t.errors.fileSize);
      return;
    }
    file.current = next;
    setBusy(true);
    setStatus(t.loading);
    startTimeout();
    send({ type: 'load', file: next, kind: tool.kind });
  }
  function changeWidth(value: number) {
    clearResult();
    setWidth(value);
    if (locked && info && mode === 'pixels')
      setHeight(Math.max(1, Math.round((value * info.height) / info.width)));
  }
  function changeHeight(value: number) {
    clearResult();
    setHeight(value);
    if (locked && info && mode === 'pixels')
      setWidth(Math.max(1, Math.round((value * info.width) / info.height)));
  }
  function run(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    clearResult();
    setError('');
    if (!info) return;
    if ((mode === 'pixels' || mode === 'passport') && !dimensionsValid(width, height)) {
      setError(t.errors.dimensions);
      return;
    }
    setBusy(true);
    setStatus(t.processing);
    startTimeout();
    const settings: ImageSettings = {
      mode: exam ? 'exam' : mode,
      width,
      height,
      targetKB: exam ? maxKB : target,
      quality,
      zoom,
      x,
      y,
      format: outputFormat || undefined,
      minKB: Number.isNaN(minKB) ? 0 : minKB,
      fit: exam?.kind === 'signature' ? 'contain' : 'crop',
    };
    send({ type: 'process', settings });
  }
  const crop =
    info && dimensionsValid(width, height)
      ? cropRect(info.width, info.height, width / height, zoom, x, y)
      : null;
  const formatSize = (size: number) =>
    `${(size / 1024).toLocaleString('en', { maximumFractionDigits: 2 })} ${t.sizeUnit}`;
  return (
    <section className="image-tool" aria-label={t.settings}>
      <div className="tool-status" role="status" aria-live="polite">
        <span aria-hidden="true" className={busy ? 'working-dot' : 'ready-dot'} />
        {status}
      </div>
      <ErrorState message={error} />
      {!ready && error && (
        <button className="button secondary" onClick={reset}>
          {t.retry}
        </button>
      )}
      <Uploader
        accept={tool.accept}
        kind={tool.kind}
        disabled={!ready || busy}
        onFile={load}
        onError={setError}
      />
      {info && (
        <form onSubmit={run} className="image-workspace">
          <fieldset disabled={busy} className="image-settings">
            <legend>{t.settings}</legend>
            {exam && (
              <>
                <h3>{examText.manual}</h3>
                <p className="field-help">{examText.manualHelp}</p>
                <label>
                  {examText.formatInput}
                  <select
                    required
                    value={outputFormat}
                    onChange={(event) => {
                      clearResult();
                      setOutputFormat(event.target.value as 'jpeg' | 'png' | '');
                    }}
                  >
                    <option value="">{examText.chooseFormat}</option>
                    <option value="jpeg">{examText.jpeg}</option>
                    <option value="png">{examText.png}</option>
                  </select>
                </label>
                <label>
                  {examText.minInput}
                  <input
                    type="number"
                    min="0"
                    max="10240"
                    step="0.01"
                    value={Number.isNaN(minKB) ? '' : minKB}
                    onChange={(event) => {
                      clearResult();
                      setMinKB(event.target.valueAsNumber);
                    }}
                  />
                </label>
                <label>
                  {examText.maxInput}
                  <input
                    type="number"
                    min="1"
                    max="10240"
                    step="0.01"
                    required
                    value={Number.isNaN(maxKB) ? '' : maxKB}
                    onChange={(event) => {
                      clearResult();
                      setMaxKB(event.target.valueAsNumber);
                    }}
                  />
                </label>
                {exam.kind === 'signature' && (
                  <p className="field-help">{examText.signatureHelp}</p>
                )}
              </>
            )}
            {mode === 'size' && (
              <>
                <label>
                  {t.target}
                  <input
                    type="number"
                    min="2"
                    max="10240"
                    step="0.01"
                    value={Number.isNaN(target) ? '' : target}
                    required
                    onChange={(event) => {
                      clearResult();
                      setTarget(event.target.valueAsNumber);
                    }}
                  />
                </label>
                <p className="field-help">{t.kbHelp}</p>
                <p className="field-help">{t.paddingHelp}</p>
              </>
            )}
            {mode === 'passport' && !exam && (
              <>
                <label>
                  {t.preset}
                  <select
                    value={preset}
                    onChange={(event) => {
                      clearResult();
                      setPreset(event.target.value);
                      const selected = presets.find((item) => item.id === event.target.value);
                      if (selected) {
                        setWidth(selected.width);
                        setHeight(selected.height);
                      }
                    }}
                  >
                    {presets.map((item) => (
                      <option key={item.id} value={item.id}>
                        {t.presets[item.id as keyof typeof t.presets]}
                      </option>
                    ))}
                    <option value="custom">{t.custom}</option>
                  </select>
                </label>
                <p className="unverified-label">{t.unverified}</p>
                <p className="field-help">{t.presetHelp}</p>
              </>
            )}
            {(mode === 'pixels' || mode === 'passport') && (
              <>
                <div className="dimensions-fields">
                  <label>
                    {t.width}
                    <input
                      type="number"
                      min="1"
                      max="8192"
                      step="1"
                      required
                      value={Number.isNaN(width) ? '' : width}
                      onChange={(event) => {
                        changeWidth(event.target.valueAsNumber);
                        if (mode === 'passport') setPreset('custom');
                      }}
                    />
                  </label>
                  <label>
                    {t.height}
                    <input
                      type="number"
                      min="1"
                      max="8192"
                      step="1"
                      required
                      value={Number.isNaN(height) ? '' : height}
                      onChange={(event) => {
                        changeHeight(event.target.valueAsNumber);
                        if (mode === 'passport') setPreset('custom');
                      }}
                    />
                  </label>
                </div>
                {mode === 'pixels' && (
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={locked}
                      onChange={(event) => {
                        clearResult();
                        setLocked(event.target.checked);
                        if (event.target.checked)
                          setHeight(Math.max(1, Math.round((width * info.height) / info.width)));
                      }}
                    />
                    {t.lock}
                  </label>
                )}
                <p className="field-help">{t.dimensionHelp}</p>
              </>
            )}
            {!exam && mode !== 'size' && mode !== 'jpg-to-png' && (
              <label>
                {t.quality}
                <output>{Math.round(quality * 100)}%</output>
                <input
                  aria-label={t.quality}
                  type="range"
                  min=".1"
                  max="1"
                  step=".01"
                  value={quality}
                  onChange={(event) => {
                    clearResult();
                    setQuality(event.target.valueAsNumber);
                  }}
                />
              </label>
            )}
            {showCrop && (
              <>
                <h3>{t.crop}</h3>
                <p className="field-help">{t.cropHelp}</p>
                {[
                  { label: t.zoom, value: zoom, min: 1, max: 4, step: 0.01, set: setZoom },
                  { label: t.horizontal, value: x, min: 0, max: 100, step: 1, set: setX },
                  { label: t.vertical, value: y, min: 0, max: 100, step: 1, set: setY },
                ].map((control) => (
                  <label key={control.label}>
                    {control.label}
                    <output>{control.value.toFixed(control.step < 1 ? 2 : 0)}</output>
                    <input
                      aria-label={control.label}
                      type="range"
                      min={control.min}
                      max={control.max}
                      step={control.step}
                      value={control.value}
                      onChange={(event) => {
                        clearResult();
                        control.set(event.target.valueAsNumber);
                      }}
                    />
                  </label>
                ))}
                <button
                  type="button"
                  className="text-button"
                  onClick={() => {
                    clearResult();
                    setZoom(1);
                    setX(50);
                    setY(50);
                  }}
                >
                  {t.reset}
                </button>
              </>
            )}
            <p className="field-help">
              {exam ? examText.constraintHelp : mode === 'jpg-to-png' ? t.convertHelp : t.jpegHelp}
            </p>
            <button className="button primary" type="submit">
              {mode === 'size' || mode === 'pixels'
                ? t.resize
                : mode === 'passport'
                  ? exam?.kind === 'signature'
                    ? t.resize
                    : t.cropAction
                  : t.convert}
              <span aria-hidden="true">↗</span>
            </button>
          </fieldset>
          <div className="image-preview-area">
            {showCrop && crop ? (
              <figure className="image-preview">
                <figcaption>{t.crop}</figcaption>
                <div
                  className="crop-frame"
                  style={{
                    aspectRatio: width / height,
                    width: `min(100%, ${(500 * width) / height}px)`,
                  }}
                  onPointerDown={(event) => {
                    if (busy) return;
                    event.currentTarget.setPointerCapture(event.pointerId);
                    drag.current = { x: event.clientX, y: event.clientY, startX: x, startY: y };
                  }}
                  onPointerUp={() => {
                    drag.current = null;
                  }}
                  onPointerCancel={() => {
                    drag.current = null;
                  }}
                  onPointerMove={(event) => {
                    if (!drag.current || busy) return;
                    const rect = event.currentTarget.getBoundingClientRect();
                    const dx = ((event.clientX - drag.current.x) * crop.width) / rect.width;
                    const dy = ((event.clientY - drag.current.y) * crop.height) / rect.height;
                    clearResult();
                    setX(
                      Math.max(
                        0,
                        Math.min(
                          100,
                          drag.current.startX - (dx / Math.max(1, info.width - crop.width)) * 100,
                        ),
                      ),
                    );
                    setY(
                      Math.max(
                        0,
                        Math.min(
                          100,
                          drag.current.startY - (dy / Math.max(1, info.height - crop.height)) * 100,
                        ),
                      ),
                    );
                  }}
                >
                  <img
                    draggable={false}
                    src={info.preview}
                    alt={t.originalAlt}
                    style={{
                      width: `${(info.width / crop.width) * 100}%`,
                      height: `${(info.height / crop.height) * 100}%`,
                      left: `${(-crop.x / crop.width) * 100}%`,
                      top: `${(-crop.y / crop.height) * 100}%`,
                    }}
                  />
                  <div className="crop-guides" aria-hidden="true" />
                </div>
                <p>
                  {formatSize(info.size)} · {info.width} × {info.height} {t.pixelUnit}
                </p>
              </figure>
            ) : (
              <Preview url={info.preview} label={t.original} alt={t.originalAlt}>
                <p>
                  {formatSize(info.size)} · {info.width} × {info.height} {t.pixelUnit}
                </p>
              </Preview>
            )}
            {result && (
              <Preview url={result.url} label={t.result} alt={t.resultAlt}>
                <p>
                  {formatSize(result.size)} · {result.width} × {result.height} {t.pixelUnit}
                </p>
              </Preview>
            )}
          </div>
        </form>
      )}
      {busy && (
        <button type="button" className="button secondary cancel-button" onClick={reset}>
          {t.cancel}
        </button>
      )}
      {result && (
        <section className="image-result" aria-label={t.result}>
          <div>
            <h3>{t.done}</h3>
            <p>
              <strong>{t.before}:</strong> {formatSize(info!.size)}{' '}
              <span aria-hidden="true">→</span> <strong>{t.after}:</strong>{' '}
              {formatSize(result.size)}
            </p>
            {mode === 'size' && <p>{t.targetMet}</p>}
            {result.padding > 0 && (
              <p className="field-help">
                {t.padding}: {result.padding.toLocaleString('en')}
              </p>
            )}
          </div>
          <DownloadButton url={result.url} filename={result.filename} />
        </section>
      )}
      {info && !busy && (
        <button className="text-button" type="button" onClick={reset}>
          {t.clear}
        </button>
      )}
    </section>
  );
}
