/// <reference lib="webworker" />
import {
  cropRect,
  dimensionsValid,
  fitJpegRange,
  MAX_FILE_BYTES,
  MAX_INPUT_PIXELS,
} from '../lib/image-math';
import type { WorkerRequest, WorkerReply, ImageSettings } from '../lib/image-protocol';
import type { InputKind } from '../data/tools';
let bitmap: ImageBitmap | null = null;
let heicDecoder: typeof import('heic-to/next') | null = null;
function send(message: WorkerReply) {
  self.postMessage(message);
}
function fail(code: string): never {
  throw new Error(code);
}
function canvas(width: number, height: number) {
  const surface = new OffscreenCanvas(width, height);
  const context = surface.getContext('2d');
  if (!context) fail('unsupported');
  context.imageSmoothingQuality = 'high';
  return { surface, context };
}
async function detect(file: Blob): Promise<InputKind> {
  const b = new Uint8Array(await file.slice(0, 64).arrayBuffer());
  if (b[0] === 255 && b[1] === 216 && b[2] === 255) return 'jpeg';
  if (b[0] === 137 && b[1] === 80 && b[2] === 78 && b[3] === 71) return 'png';
  const text = new TextDecoder().decode(b);
  if (text.startsWith('RIFF') && text.slice(8, 12) === 'WEBP') return 'webp';
  if (text.slice(4, 8) === 'ftyp' && /heic|heix|hevc|hevx|mif1|msf1/.test(text.slice(8)))
    return 'heic';
  fail('format');
}
// Preflight common image headers before allocating a decoded pixel buffer.
async function checkHeader(file: Blob, kind: InputKind) {
  const buffer = await file.arrayBuffer();
  const b = new Uint8Array(buffer);
  const v = new DataView(buffer);
  let w = 0,
    h = 0;
  if (kind === 'png' && b.length >= 24) {
    w = v.getUint32(16);
    h = v.getUint32(20);
  }
  if (kind === 'jpeg') {
    let offset = 2;
    while (offset + 8 < b.length) {
      if (b[offset] !== 255) break;
      const marker = b[offset + 1];
      if (marker === 218 || marker === 217) break;
      const size = v.getUint16(offset + 2);
      if (size < 2) break;
      if ([192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207].includes(marker)) {
        h = v.getUint16(offset + 5);
        w = v.getUint16(offset + 7);
        break;
      }
      offset += size + 2;
    }
  }
  if (kind === 'webp' && b.length >= 30) {
    const tag = new TextDecoder().decode(b.slice(12, 16));
    if (tag === 'VP8X') {
      w = 1 + b[24] + (b[25] << 8) + (b[26] << 16);
      h = 1 + b[27] + (b[28] << 8) + (b[29] << 16);
    }
    if (tag === 'VP8 ') {
      w = v.getUint16(26, true) & 16383;
      h = v.getUint16(28, true) & 16383;
    }
    if (tag === 'VP8L') {
      const bits = v.getUint32(21, true);
      w = (bits & 16383) + 1;
      h = ((bits >>> 14) & 16383) + 1;
    }
  }
  // HEIF ispe boxes include tile and full-image dimensions. Reject any oversized one.
  if (kind === 'heic') {
    for (let i = 4; i + 16 <= b.length; i++) {
      if (
        b[i] === 105 &&
        b[i + 1] === 115 &&
        b[i + 2] === 112 &&
        b[i + 3] === 101 &&
        v.getUint32(i - 4) === 20
      ) {
        if (v.getUint32(i + 8) * v.getUint32(i + 12) > MAX_INPUT_PIXELS) fail('pixels');
      }
    }
  }
  if (w * h > MAX_INPUT_PIXELS) fail('pixels');
}
async function load(file: File, kind: InputKind) {
  bitmap?.close();
  bitmap = null;
  if (!file.size || file.size > MAX_FILE_BYTES) fail('fileSize');
  const actual = await detect(file);
  if ((kind !== 'any' && kind !== actual) || (kind === 'any' && actual === 'heic')) fail('format');
  await checkHeader(file, actual);
  if (actual === 'heic') {
    if (!heicDecoder) fail('notReady');
    bitmap = (await heicDecoder.heicTo({ blob: file, type: 'bitmap' })) as ImageBitmap;
  } else bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  if (bitmap.width * bitmap.height > MAX_INPUT_PIXELS) {
    bitmap.close();
    bitmap = null;
    fail('pixels');
  }
  const { width, height } = bitmap;
  const factor = Math.min(1, 720 / Math.max(width, height));
  const { surface, context } = canvas(
    Math.max(1, Math.round(width * factor)),
    Math.max(1, Math.round(height * factor)),
  );
  context.drawImage(bitmap, 0, 0, surface.width, surface.height);
  const preview = await surface.convertToBlob({ type: 'image/png' });
  surface.width = 1;
  surface.height = 1;
  send({ type: 'loaded', width, height, preview });
}
async function processImage(s: ImageSettings) {
  if (!bitmap) fail('notReady');
  if (!Number.isFinite(s.quality) || s.quality < 0.1 || s.quality > 1) fail('settings');
  let width =
    s.mode === 'pixels' || s.mode === 'passport' || s.mode === 'exam' ? s.width : bitmap.width;
  let height =
    s.mode === 'pixels' || s.mode === 'passport' || s.mode === 'exam' ? s.height : bitmap.height;
  // Size compression can start at a bounded working resolution; exact-size tools must be explicit.
  if (s.mode === 'size' && (width * height > 16_000_000 || Math.max(width, height) > 8192)) {
    const factor = Math.min(
      Math.sqrt(16_000_000 / (width * height)),
      8192 / Math.max(width, height),
    );
    width = Math.floor(width * factor);
    height = Math.floor(height * factor);
  }
  // Format converters preserve dimensions up to the input limit. Pixel tools cap output allocations.
  if (['pixels', 'passport', 'size', 'exam'].includes(s.mode) && !dimensionsValid(width, height))
    fail('dimensions');
  if (
    s.mode === 'exam' &&
    (!['jpeg', 'png'].includes(s.format || '') ||
      !Number.isFinite(s.targetKB) ||
      s.targetKB < 1 ||
      s.targetKB > 10240 ||
      !Number.isFinite(s.minKB) ||
      s.minKB! < 0 ||
      s.minKB! > s.targetKB)
  )
    fail('constraints');
  const { surface, context } = canvas(width, height);
  const mime =
    s.mode === 'jpg-to-png' || (s.mode === 'exam' && s.format === 'png')
      ? 'image/png'
      : 'image/jpeg';
  const paint = () => {
    if (!bitmap) fail('notReady');
    surface.width = width;
    surface.height = height;
    context.imageSmoothingQuality = 'high';
    if (mime === 'image/jpeg' || s.mode === 'exam') {
      context.fillStyle = '#fff';
      context.fillRect(0, 0, width, height);
    }
    if (s.mode === 'exam' && s.fit === 'contain') {
      const factor = Math.min(width / bitmap.width, height / bitmap.height);
      const fittedWidth = bitmap.width * factor,
        fittedHeight = bitmap.height * factor;
      context.drawImage(
        bitmap,
        (width - fittedWidth) / 2,
        (height - fittedHeight) / 2,
        fittedWidth,
        fittedHeight,
      );
    } else if (s.mode === 'passport' || s.mode === 'exam') {
      if (
        ![s.zoom, s.x, s.y].every(Number.isFinite) ||
        s.zoom < 1 ||
        s.zoom > 4 ||
        s.x < 0 ||
        s.x > 100 ||
        s.y < 0 ||
        s.y > 100
      )
        fail('settings');
      const crop = cropRect(bitmap.width, bitmap.height, width / height, s.zoom, s.x, s.y);
      context.drawImage(bitmap, crop.x, crop.y, crop.width, crop.height, 0, 0, width, height);
    } else context.drawImage(bitmap, 0, 0, width, height);
  };
  try {
    paint();
    let output: Blob;
    let padding = 0;
    if (s.mode === 'size' || (s.mode === 'exam' && mime === 'image/jpeg')) {
      if (
        !Number.isFinite(s.targetKB) ||
        s.targetKB < (s.mode === 'exam' ? 1 : 2) ||
        s.targetKB > 10240
      )
        fail('target');
      const target = Math.floor(s.targetKB * 1024);
      let best: Blob | null = null;
      // Quality is searched at each resolution before dimensions are reduced.
      for (let step = 0; step < (s.mode === 'exam' ? 1 : 32); step++) {
        send({ type: 'progress', value: Math.min(95, 10 + step * 3) });
        const high = await surface.convertToBlob({ type: mime, quality: 1 });
        if (high.size <= target) {
          best = high;
          break;
        }
        const low = await surface.convertToBlob({ type: mime, quality: 0.05 });
        if (low.size <= target) {
          best = low;
          let left = 0.05,
            right = 1;
          for (let trial = 0; trial < 12; trial++) {
            const middle = (left + right) / 2;
            const candidate = await surface.convertToBlob({ type: mime, quality: middle });
            if (candidate.size <= target) {
              if (candidate.size > best.size) best = candidate;
              left = middle;
            } else right = middle;
          }
          break;
        }
        if (s.mode === 'exam' || (width === 1 && height === 1)) break;
        const factor = Math.min(0.85, Math.max(0.2, Math.sqrt(target / low.size) * 0.9));
        width = Math.max(1, Math.floor(width * factor));
        height = Math.max(1, Math.floor(height * factor));
        paint();
      }
      if (!best) fail(s.mode === 'exam' ? 'constraints' : 'target');
      const minimum = s.mode === 'exam' ? Math.ceil(s.minKB! * 1024) : Math.ceil(target * 0.95);
      const fitted = await fitJpegRange(best, target, minimum);
      output = fitted.blob;
      padding = fitted.padding;
      if (output.size > target || output.size < minimum) fail('target');
    } else output = await surface.convertToBlob({ type: mime, quality: s.quality });
    if (
      s.mode === 'exam' &&
      (output.size > Math.floor(s.targetKB * 1024) || output.size < Math.ceil(s.minKB! * 1024))
    )
      fail('constraints');
    if (output.type !== mime) fail('encode');
    send({ type: 'result', blob: output, width, height, padding });
  } finally {
    surface.width = 1;
    surface.height = 1;
  }
}
self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  try {
    const message = event.data;
    if (message.type === 'init') {
      if (typeof OffscreenCanvas === 'undefined' || typeof createImageBitmap === 'undefined')
        fail('unsupported');
      if (message.heic) heicDecoder = await import('heic-to/next');
      send({ type: 'ready' });
    } else if (message.type === 'load') await load(message.file, message.kind);
    else await processImage(message.settings);
  } catch (error) {
    const code = error instanceof Error ? error.message : 'decode';
    const known = [
      'unsupported',
      'format',
      'pixels',
      'fileSize',
      'notReady',
      'dimensions',
      'target',
      'settings',
      'encode',
      'constraints',
    ];
    send({ type: 'error', code: known.includes(code) ? code : 'decode' });
  }
};
