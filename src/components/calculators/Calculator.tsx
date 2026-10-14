import { lazy, Suspense, useEffect, useState } from 'react';
import { calculatorText as t } from '../../i18n/calculators';
import { calculatorExamples as example, type CalculatorSlug } from '../../data/calculators';
import { amortization, prepayment, type Payment } from '../../lib/finance/loans';
import { compound, sip, recurringDeposit } from '../../lib/finance/investments';
import { gst, percentage } from '../../lib/finance/arithmetic';
import { age } from '../../lib/finance/age';
const Breakdown = lazy(() => import('./Breakdown'));
type Values = Record<string, string>;
interface Result {
  rows: { label: string; value: number; money?: boolean }[];
  schedule?: Payment[];
  chart?: [number, number];
}
const defaults: Values = {
  principal: String(example.principal),
  monthly: String(example.monthly),
  rate: String(example.annualRate),
  months: String(example.months),
  frequency: '4',
  timing: 'start',
  amount: '1000',
  taxRate: String(example.gstRate),
  inclusive: 'no',
  percentMode: 'of',
  x: '25',
  y: '200',
  birth: '2000-01-01',
  asOf: '2026-01-01',
  extra: String(example.prepayment),
  extraMonth: String(example.prepaymentMonth),
  monthlyExtra: '0',
};
function compute(slug: CalculatorSlug, v: Values): Result {
  const num = (key: string) => {
    if (v[key]?.trim() === '') throw new RangeError('invalid');
    return Number(v[key]);
  };
  const row = (label: string, value: number, money = true) => ({ label, value, money });
  if (slug === 'age') {
    const a = age(v.birth, v.asOf);
    return {
      rows: [
        row(t.years, a.years, false),
        row(t.months, a.months, false),
        row(t.days, a.days, false),
        row(t.nextBirthday, a.nextBirthdayDays, false),
        row(t.totalDays, a.totalDays, false),
      ],
    };
  }
  if (slug === 'percentage')
    return {
      rows: [
        row(
          t.answer,
          percentage(v.percentMode as 'of' | 'ratio' | 'change', num('x'), num('y')),
          false,
        ),
      ],
    };
  if (slug === 'gst') {
    const r = gst(num('amount'), num('taxRate'), v.inclusive === 'yes');
    return {
      rows: [
        row(t.base, r.base),
        row(t.tax, r.tax),
        row(t.cgst, r.cgst),
        row(t.sgst, r.sgst),
        row(t.total, r.total),
      ],
    };
  }
  if (slug === 'emi' || slug === 'loan-prepayment') {
    const prepaid =
      slug === 'loan-prepayment'
        ? prepayment(
            num('principal'),
            num('rate'),
            num('months'),
            num('extra'),
            num('extraMonth'),
            num('monthlyExtra'),
          )
        : null;
    const r = prepaid ?? amortization(num('principal'), num('rate'), num('months'));
    const rows = [
      row(t.payment, r.payment),
      row(t.invested, num('principal')),
      row(t.interest, r.totalInterest),
      row(t.total, num('principal') + r.totalInterest),
    ];
    if (prepaid)
      rows.push(
        row(t.saved, prepaid.interestSaved),
        row(t.reduced, prepaid.monthsSaved, false),
        row(t.remaining, prepaid.months, false),
      );
    return { rows, schedule: r.schedule, chart: [num('principal'), r.totalInterest] };
  }
  const r =
    slug === 'sip'
      ? sip(num('monthly'), num('rate'), num('months'), v.timing as 'start' | 'end')
      : slug === 'rd'
        ? recurringDeposit(num('monthly'), num('rate'), num('months'))
        : compound(
            num('principal'),
            num('rate'),
            num('months'),
            slug === 'lumpsum' ? 1 : num('frequency'),
          );
  return {
    rows: [row(t.total, r.maturity), row(t.invested, r.invested), row(t.interest, r.growth)],
    chart: [r.invested, r.growth],
  };
}
export default function Calculator({ slug }: { slug: CalculatorSlug }) {
  const [values, setValues] = useState<Values>(defaults),
    [settled, setSettled] = useState<Values>(defaults);
  const [currency, setCurrency] = useState('INR'),
    [indian, setIndian] = useState(true),
    [page, setPage] = useState(0);
  useEffect(() => {
    if (slug === 'age') {
      const date = new Date();
      const today = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      setValues((v) => ({ ...v, asOf: today }));
    }
  }, [slug]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setSettled(values);
      setPage(0);
    }, 150);
    return () => clearTimeout(timer);
  }, [values]);
  let result: Result | undefined,
    error = '';
  try {
    result = compute(slug, settled);
  } catch (e) {
    const code = e instanceof Error ? e.message : 'invalid';
    error = t[code as keyof typeof t] || t.error;
  }
  const update = (key: string, value: string) => setValues((v) => ({ ...v, [key]: value }));
  const format = (value: number, money = false) =>
    `${money ? currency + ' ' : ''}${new Intl.NumberFormat(indian ? 'en-IN' : 'en-US', { maximumFractionDigits: money ? 2 : 4 }).format(value)}`;
  const compact = (value: number) =>
    indian && value >= 1e5 ? (
      <>
        {(value / (value >= 1e7 ? 1e7 : 1e5)).toFixed(2)} {value >= 1e7 ? t.crore : t.lakh}
      </>
    ) : (
      ''
    );
  function field(key: string, label: string, min = 0, max = 1e12, step = 'any', slider = false) {
    const value = Number(values[key]),
      invalid =
        values[key] === '' ||
        !Number.isFinite(value) ||
        value < min ||
        value > max ||
        (step === '1' && !Number.isInteger(value));
    return (
      <div className="calc-field" key={key}>
        <label htmlFor={`calc-${key}`}>{label}</label>
        <input
          id={`calc-${key}`}
          type="number"
          min={min}
          max={max}
          step={step}
          value={values[key]}
          aria-invalid={invalid}
          aria-describedby={invalid ? `error-${key}` : undefined}
          onChange={(e) => update(key, e.target.value)}
        />
        {slider && (
          <input
            type="range"
            aria-label={label}
            min={min}
            max={Math.min(max, key === 'months' ? 600 : 100)}
            step={step === 'any' ? '.1' : step}
            value={Number.isFinite(value) ? value : min}
            onChange={(e) => update(key, e.target.value)}
          />
        )}{' '}
        {invalid && (
          <p id={`error-${key}`} className="field-error">
            {t.invalid}
          </p>
        )}
      </div>
    );
  }
  const monetary = !['age', 'percentage'].includes(slug);
  return (
    <section className="calculator" aria-label={t.settings}>
      <div className="calculator-controls">
        <h2>{t.settings}</h2>
        {monetary && (
          <div className="calc-pair">
            <label>
              {t.currency}
              <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {['INR', 'USD', 'GBP', 'EUR'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              {t.numbering}
              <select
                value={indian ? 'indian' : 'international'}
                onChange={(e) => setIndian(e.target.value === 'indian')}
              >
                <option value="indian">{t.indian}</option>
                <option value="international">{t.international}</option>
              </select>
            </label>
          </div>
        )}
        {monetary && <p className="field-help">{t.currencyHelp}</p>}
        {['emi', 'lumpsum', 'fd', 'loan-prepayment', 'compound-interest'].includes(slug) &&
          field('principal', t.principal)}
        {['sip', 'rd'].includes(slug) && field('monthly', t.monthly)}
        {!['gst', 'percentage', 'age'].includes(slug) && (
          <>
            {field('rate', t.rate, 0, 100, 'any', true)}
            {field('months', t.months, 1, 1200, '1', true)}
          </>
        )}
        {['fd', 'compound-interest'].includes(slug) && (
          <label>
            {t.frequency}
            <select value={values.frequency} onChange={(e) => update('frequency', e.target.value)}>
              {[
                [12, t.month],
                [4, t.quarter],
                [2, t.half],
                [1, t.annual],
              ].map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        )}
        {slug === 'sip' && (
          <label>
            {t.timing}
            <select value={values.timing} onChange={(e) => update('timing', e.target.value)}>
              <option value="start">{t.start}</option>
              <option value="end">{t.end}</option>
            </select>
          </label>
        )}
        {slug === 'loan-prepayment' && (
          <>
            {field('extra', t.extra)}
            {field('extraMonth', t.extraMonth, 1, Number(values.months) || 1200, '1')}
            {field('monthlyExtra', t.monthlyExtra)}
          </>
        )}
        {slug === 'gst' && (
          <>
            {field('amount', t.amount)}
            {field('taxRate', t.taxRate, 0, 100)}
            <label className="calc-check">
              <input
                type="checkbox"
                checked={values.inclusive === 'yes'}
                onChange={(e) => update('inclusive', e.target.checked ? 'yes' : 'no')}
              />
              {t.taxMode}
            </label>
            <p className="field-help">{t.taxHelp}</p>
          </>
        )}
        {slug === 'percentage' && (
          <>
            <label>
              {t.percentageMode}
              <select
                value={values.percentMode}
                onChange={(e) => update('percentMode', e.target.value)}
              >
                <option value="of">{t.of}</option>
                <option value="ratio">{t.ratio}</option>
                <option value="change">{t.change}</option>
              </select>
            </label>
            {field('x', t.x, -1e12)}
            {field('y', t.y, -1e12)}
          </>
        )}
        {slug === 'age' && (
          <>
            <label>
              {t.birth}
              <input
                type="date"
                min="1900-01-01"
                max="2200-12-31"
                value={values.birth}
                onChange={(e) => update('birth', e.target.value)}
              />
            </label>
            <label>
              {t.asOf}
              <input
                type="date"
                min="1900-01-01"
                max="2200-12-31"
                value={values.asOf}
                onChange={(e) => update('asOf', e.target.value)}
              />
            </label>
            <p className="field-help">{t.ageHelp}</p>
          </>
        )}
      </div>
      <div className="calculator-results" aria-live="polite" aria-atomic="true">
        <h2>{t.results}</h2>
        {error ? (
          <p role="status" className="image-error">
            {error}
          </p>
        ) : (
          result && (
            <>
              <dl>
                {result.rows.map((r) => (
                  <div key={r.label}>
                    <dt>{r.label}</dt>
                    <dd>
                      {format(r.value, r.money)}
                      {r.money && <small>{compact(r.value)}</small>}
                    </dd>
                  </div>
                ))}
              </dl>
              {result.chart && (
                <Suspense fallback={<div style={{ height: 95 }} />}>
                  <Breakdown principal={result.chart[0]} interest={result.chart[1]} />
                </Suspense>
              )}
            </>
          )
        )}
      </div>
      {result?.schedule && (
        <section className="calc-schedule">
          <h2>{t.table}</h2>
          <div className="table-scroll" tabIndex={0} role="region" aria-label={t.table}>
            <table>
              <thead>
                <tr>
                  {[
                    t.paymentNumber,
                    t.opening,
                    t.paid,
                    t.principalPaid,
                    t.interestPaid,
                    t.additional,
                    t.balance,
                  ].map((label) => (
                    <th key={label} scope="col">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.schedule.slice(page * 12, page * 12 + 12).map((r) => (
                  <tr key={r.month}>
                    <th scope="row">{r.month}</th>
                    {[r.opening, r.payment, r.principal, r.interest, r.extra, r.balance].map(
                      (n, i) => (
                        <td key={i}>{format(n, true)}</td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-controls">
            <button
              className="button secondary"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              {t.previous}
            </button>
            <span>
              {t.rowPage}: {page + 1} / {Math.max(1, Math.ceil(result.schedule.length / 12))}
            </span>
            <button
              className="button secondary"
              disabled={(page + 1) * 12 >= result.schedule.length}
              onClick={() => setPage((p) => p + 1)}
            >
              {t.next}
            </button>
          </div>
        </section>
      )}
    </section>
  );
}
