import test from 'node:test';
import assert from 'node:assert/strict';
import { cropRect, dimensionsValid, fitJpegRange } from '../src/lib/image-math.ts';
test('crop preserves ratio and stays inside the source at slider extremes', () => {
  for (const ratio of [0.5, 1, 2])
    for (const zoom of [1, 2, 4])
      for (const x of [0, 50, 100])
        for (const y of [0, 50, 100]) {
          const crop = cropRect(1800, 1200, ratio, zoom, x, y);
          assert.ok(Math.abs(crop.width / crop.height - ratio) < 1e-10);
          assert.ok(crop.x >= 0 && crop.y >= 0);
          assert.ok(crop.x + crop.width <= 1800 && crop.y + crop.height <= 1200);
        }
});
test('output allocations reject invalid and unsafe dimensions', () => {
  for (const [w, h] of [
    [0, 2],
    [-1, 100],
    [2.5, 8],
    [NaN, 10],
    [8193, 1],
    [8000, 8000],
  ])
    assert.equal(dimensionsValid(w, h), false);
  assert.equal(dimensionsValid(4000, 4000), true);
});
test('JPEG padding uses valid COM segment sizes, preserves original bytes and meets range', async () => {
  const source = new Uint8Array([255, 216, 255, 217]);
  for (const target of [2048, 65537, 65539, 100 * 1024, 10 * 1024 * 1024]) {
    const result = await fitJpegRange(new Blob([source], { type: 'image/jpeg' }), target);
    assert.ok(result.blob.size >= 0.95 * target && result.blob.size <= target);
    const b = new Uint8Array(await result.blob.arrayBuffer());
    let i = 2;
    while (b[i + 1] === 254) {
      const length = b[i + 2] * 256 + b[i + 3];
      assert.ok(length >= 2 && length <= 65535);
      i += 2 + length;
    }
    assert.deepEqual([...b.slice(i)], [255, 217]);
    assert.equal(b.length - source.length, result.padding);
  }
  const enough = new Blob([new Uint8Array(980)], { type: 'image/jpeg' });
  assert.equal((await fitJpegRange(enough, 1000)).padding, 0);
  await assert.rejects(fitJpegRange(enough, 500), /target/);
});
