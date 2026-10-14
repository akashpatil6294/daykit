export const calculatorSlugs = [
  'emi',
  'sip',
  'lumpsum',
  'fd',
  'rd',
  'gst',
  'percentage',
  'age',
  'loan-prepayment',
  'compound-interest',
] as const;
export type CalculatorSlug = (typeof calculatorSlugs)[number];
// Illustrations only. These numbers are not rates offered by any provider.
export const calculatorExamples = {
  verified: false,
  principal: 100000,
  monthly: 5000,
  annualRate: 8,
  months: 60,
  gstRate: 18,
  prepayment: 20000,
  prepaymentMonth: 12,
};
