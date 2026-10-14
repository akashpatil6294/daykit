export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_INPUT_PIXELS = 40_000_000;
export const MAX_OUTPUT_PIXELS = 16_000_000;
export const MAX_EDGE = 8192;
export function dimensionsValid(width: number, height: number) {
  return (
    Number.isInteger(width) &&
    Number.isInteger(height) &&
    width > 0 &&
    height > 0 &&
    width <= MAX_EDGE &&
    height <= MAX_EDGE &&
    width * height <= MAX_OUTPUT_PIXELS
  );
}
export function cropRect(
  width: number,
  height: number,
  ratio: number,
  zoom: number,
  x: number,
  y: number,
) {
  const cropWidth = Math.min(width, height * ratio) / zoom;
  const cropHeight = cropWidth / ratio;
  return {
    x: ((width - cropWidth) * x) / 100,
    y: ((height - cropHeight) * y) / 100,
    width: cropWidth,
    height: cropHeight,
  };
}
/** JPEG COM segments are legal metadata, inserted immediately after SOI.
 * Padding is disclosed in the UI. It never claims to recover detail or improve quality.
 */
export async function fitJpegRange(
  blob: Blob,
  target: number,
  minimum = Math.ceil(target * 0.95),
): Promise<{ blob: Blob; padding: number }> {
  if (blob.size > target) throw new Error('target');
  if (blob.size >= minimum) return { blob, padding: 0 };
  const bytes = new Uint8Array(await blob.arrayBuffer());
  if (bytes[0] !== 255 || bytes[1] !== 216) throw new Error('encode');
  let remaining = Math.max(4, Math.max(minimum, Math.floor(target * 0.975)) - blob.size);
  if (blob.size + remaining > target) throw new Error('constraints');
  const padding = remaining;
  const parts: BlobPart[] = [bytes.slice(0, 2)];
  while (remaining > 0) {
    let length = Math.min(65537, remaining);
    if (remaining - length > 0 && remaining - length < 4) length -= 4 - (remaining - length);
    const segment = new Uint8Array(length);
    segment[0] = 255;
    segment[1] = 254;
    segment[2] = (length - 2) >> 8;
    segment[3] = (length - 2) & 255;
    parts.push(segment);
    remaining -= length;
  }
  parts.push(bytes.slice(2));
  return { blob: new Blob(parts, { type: 'image/jpeg' }), padding };
}
