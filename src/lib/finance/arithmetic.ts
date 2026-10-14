import { number, safe } from './validation';
export function gst(amount: number, rate: number, inclusive = false) {
  number(amount);
  number(rate, 0, 100);
  const base = inclusive ? amount / (1 + rate / 100) : amount;
  const tax = inclusive ? amount - base : (base * rate) / 100;
  return { base, tax, cgst: tax / 2, sgst: tax / 2, total: inclusive ? amount : safe(base + tax) };
}
export function percentage(mode: 'of' | 'ratio' | 'change', x: number, y: number) {
  number(x, -1e12);
  number(y, -1e12);
  if (mode === 'of') return safe((x * y) / 100);
  if (mode === 'ratio') {
    if (y === 0) throw new RangeError('zeroBase');
    return safe((x / y) * 100);
  }
  if (mode === 'change') {
    if (x === 0) throw new RangeError('zeroBase');
    return safe(((y - x) / Math.abs(x)) * 100);
  }
  throw new RangeError('invalid');
}
