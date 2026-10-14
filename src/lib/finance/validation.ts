export function number(value: number, min = 0, max = 1e12): number {
  if (!Number.isFinite(value) || value < min || value > max) throw new RangeError('invalid');
  return value;
}
export function months(value: number): number {
  number(value, 1, 1200);
  if (!Number.isInteger(value)) throw new RangeError('months');
  return value;
}
export function safe(value: number): number {
  if (!Number.isFinite(value) || Math.abs(value) > 1e18) throw new RangeError('overflow');
  return value;
}
