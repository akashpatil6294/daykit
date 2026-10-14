import { number, months, safe } from './validation';
export function compound(principal: number, annualRate: number, tenure: number, frequency = 12) {
  number(principal);
  number(annualRate, 0, 100);
  months(tenure);
  if (![1, 2, 4, 12].includes(frequency)) throw new RangeError('frequency');
  const maturity = safe(
    principal * Math.exp(((frequency * tenure) / 12) * Math.log1p(annualRate / 100 / frequency)),
  );
  return { invested: principal, maturity, growth: maturity - principal };
}
/** Nominal annual return divided by 12; contributions can be at start or end of month. */
export function sip(
  payment: number,
  annualRate: number,
  tenure: number,
  timing: 'start' | 'end' = 'start',
) {
  number(payment);
  number(annualRate, 0, 100);
  months(tenure);
  if (!['start', 'end'].includes(timing)) throw new RangeError('timing');
  const r = annualRate / 1200;
  const maturity = safe(
    r === 0
      ? payment * tenure
      : ((payment * Math.expm1(tenure * Math.log1p(r))) / r) * (timing === 'start' ? 1 + r : 1),
  );
  return { invested: payment * tenure, maturity, growth: maturity - payment * tenure };
}
/** Quarterly compounding expressed as an equivalent monthly factor, beginning-of-month deposits. */
export function recurringDeposit(payment: number, annualRate: number, tenure: number) {
  number(payment);
  number(annualRate, 0, 100);
  months(tenure);
  const r = Math.expm1(Math.log1p(annualRate / 400) / 3);
  const maturity = safe(
    r === 0 ? payment * tenure : ((payment * Math.expm1(tenure * Math.log1p(r))) / r) * (1 + r),
  );
  return { invested: payment * tenure, maturity, growth: maturity - payment * tenure };
}
