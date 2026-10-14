import { number, months, safe } from './validation';
export interface Payment {
  month: number;
  opening: number;
  payment: number;
  principal: number;
  interest: number;
  extra: number;
  balance: number;
}
export function emi(principal: number, annualRate: number, tenure: number): number {
  number(principal);
  number(annualRate, 0, 100);
  months(tenure);
  const r = annualRate / 1200;
  return safe(
    r === 0 ? principal / tenure : (principal * r) / -Math.expm1(-tenure * Math.log1p(r)),
  );
}
export function amortization(
  principal: number,
  annualRate: number,
  tenure: number,
  extra = 0,
  atMonth = 1,
  monthlyExtra = 0,
) {
  const payment = emi(principal, annualRate, tenure);
  number(extra);
  number(monthlyExtra);
  months(atMonth);
  if (atMonth > tenure) throw new RangeError('prepaymentMonth');
  let balance = principal;
  const schedule: Payment[] = [];
  for (let month = 1; month <= tenure && balance > 1e-7; month++) {
    const opening = balance,
      interest = (balance * annualRate) / 1200;
    const paid = Math.min(payment, balance + interest);
    const principalPaid = Math.max(0, paid - interest);
    const additional = Math.min(
      Math.max(0, balance - principalPaid),
      monthlyExtra + (month === atMonth ? extra : 0),
    );
    balance = Math.max(0, balance - principalPaid - additional);
    if (month === tenure || balance < 1e-7) balance = 0;
    schedule.push({
      month,
      opening,
      payment: paid,
      principal: principalPaid,
      interest,
      extra: additional,
      balance,
    });
  }
  return {
    payment,
    schedule,
    totalInterest: safe(schedule.reduce((sum, row) => sum + row.interest, 0)),
    months: schedule.length,
  };
}
export function prepayment(
  principal: number,
  annualRate: number,
  tenure: number,
  extra: number,
  atMonth: number,
  monthlyExtra = 0,
) {
  const baseline = amortization(principal, annualRate, tenure);
  const revised = amortization(principal, annualRate, tenure, extra, atMonth, monthlyExtra);
  return {
    ...revised,
    interestSaved: Math.max(0, baseline.totalInterest - revised.totalInterest),
    monthsSaved: baseline.months - revised.months,
    originalInterest: baseline.totalInterest,
  };
}
