import { describe, it, expect } from 'vitest';
import { emi, amortization, prepayment } from '../src/lib/finance/loans';
import { compound, sip, recurringDeposit } from '../src/lib/finance/investments';
import { gst, percentage } from '../src/lib/finance/arithmetic';
import { age } from '../src/lib/finance/age';
describe('documented finance formulas', () => {
  it('EMI matches the standard reducing-balance calculation', () => {
    expect(emi(100000, 12, 12)).toBeCloseTo(8884.8788678, 5);
    expect(emi(1200, 0, 12)).toBe(100);
    expect(emi(1000, 12, 1)).toBeCloseTo(1010, 9);
  });
  it('amortizes principal completely without intermediate display rounding', () => {
    const r = amortization(500000, 8, 60);
    expect(r.schedule.at(-1)?.balance).toBe(0);
    expect(r.schedule.reduce((s, r) => s + r.principal, 0)).toBeCloseTo(500000, 5);
  });
  it('prepayment saves interest and tenure, respects remaining balance', () => {
    const r = prepayment(500000, 8, 60, 100000, 12);
    expect(r.interestSaved).toBeGreaterThan(0);
    expect(r.monthsSaved).toBeGreaterThan(0);
    expect(prepayment(1000, 0, 12, 10000, 1).months).toBe(1);
    expect(prepayment(1000, 12, 12, 0, 1).interestSaved).toBe(0);
  });
  it('SIP agrees with a month-by-month beginning-of-month model', () => {
    let amount = 0;
    for (let i = 0; i < 120; i++) amount = (amount + 5000) * 1.01;
    expect(sip(5000, 12, 120).maturity).toBeCloseTo(amount, 5);
    expect(sip(5000, 0, 120).maturity).toBe(600000);
    expect(sip(1000, 12, 1).maturity).toBeCloseTo(1010, 8);
    expect(sip(1000, 12, 1, 'end').maturity).toBeCloseTo(1000, 8);
  });
  it('FD agrees to a rupee for every compounding interval', () => {
    for (const n of [1, 2, 4, 12])
      expect(compound(100000, 7, 24, n).maturity).toBeCloseTo(
        100000 * (1 + 0.07 / n) ** (2 * n),
        6,
      );
    expect(compound(1000, 0, 1, 4).maturity).toBe(1000);
  });
  it('RD agrees with separately grown monthly deposits', () => {
    let expected = 0;
    for (let k = 1; k <= 12; k++) expected += 1000 * (1 + 0.06 / 4) ** (k / 3);
    expect(recurringDeposit(1000, 6, 12).maturity).toBeCloseTo(expected, 6);
    expect(recurringDeposit(1000, 0, 12).maturity).toBe(12000);
  });
  it('inclusive and exclusive GST reverse each other', () => {
    expect(gst(1000, 18)).toEqual({ base: 1000, tax: 180, cgst: 90, sgst: 90, total: 1180 });
    expect(gst(1180, 18, true).base).toBeCloseTo(1000, 8);
    expect(gst(100, 0).tax).toBe(0);
  });
  it('handles percentage modes and rejects undefined ratios', () => {
    expect(percentage('of', 25, 200)).toBe(50);
    expect(percentage('ratio', 25, 200)).toBe(12.5);
    expect(percentage('change', 100, 120)).toBe(20);
    expect(() => percentage('ratio', 1, 0)).toThrow();
  });
  it('calendar ages handle leap days, month ends and birthday day', () => {
    expect(age('2000-02-29', '2025-02-28')).toMatchObject({
      years: 25,
      months: 0,
      days: 0,
      nextBirthdayDays: 0,
    });
    expect(age('2025-01-31', '2025-02-28')).toMatchObject({ years: 0, months: 1, days: 0 });
    expect(age('2000-01-01', '2026-01-01').nextBirthdayDays).toBe(0);
    expect(() => age('2026-02-30', '2026-03-01')).toThrow();
  });
  it('accepts large finite amounts and rejects invalid/overflowing inputs', () => {
    expect(emi(1e12, 10, 360)).toBeGreaterThan(0);
    expect(compound(1e12, 5, 120, 4).maturity).toBeLessThan(2e12);
    expect(() => emi(1, 5, 0)).toThrow();
    expect(() => emi(NaN, 5, 12)).toThrow();
    expect(() => compound(1e12, 100, 1200, 12)).toThrow();
    expect(() => prepayment(1000, 5, 12, 100, 13)).toThrow();
  });
});
