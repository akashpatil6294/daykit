import type { CalculatorSlug } from '../data/calculators';
export interface CalculatorCopy {
  title: string;
  description: string;
  intro: string;
  formula: string;
  example: string;
  sections: { heading: string; text: string }[];
  faq: { question: string; answer: string }[];
  sources: { title: string; url: string }[];
}
const investing = {
  title: 'Investor.gov: compound interest calculator',
  url: 'https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator',
};
const loans = {
  title: 'CBSE: financial mathematics',
  url: 'https://cbseacademic.nic.in/web_material/Manuals/appliedmaths/Chapter7_Financial_Mathematics.pdf',
};
export const calculatorPages: Record<CalculatorSlug, CalculatorCopy> = {
  emi: {
    title: 'EMI calculator with amortization schedule',
    description:
      'Estimate a monthly loan payment, inspect principal and interest, and follow the outstanding balance through an amortization table. Editable example rates.',
    intro:
      'Understand how a fixed monthly loan payment is divided between interest and principal. Enter a borrowing amount, an illustrative annual rate and the number of months, then examine the repayment schedule rather than judging the loan by its monthly payment alone.',
    formula:
      'Divide the nominal annual percentage rate by 1,200 to obtain the monthly decimal rate r. For principal P and n monthly payments, EMI = P × r ÷ [1 − (1 + r)^(−n)]. At zero interest, divide the principal by the number of months. Interest each month is the opening balance multiplied by r.',
    example:
      'For a purely illustrative ₹1,00,000 loan at 12% a year over 12 months, the monthly rate is 1%. The formula gives an EMI of approximately ₹8,884.88. The first month’s interest is ₹1,000, so approximately ₹7,884.88 of that payment reduces principal. Subsequent interest is calculated on the smaller balance.',
    sections: [
      {
        heading: 'Look beyond the headline payment',
        text: 'A longer term can reduce the amount due each month while increasing the total interest paid. To compare two scenarios, keep principal and rate unchanged and move the term slider. Note both the monthly payment and the interest total. A lower EMI is not automatically a cheaper loan. Processing charges, insurance, taxes and other costs can also change the amount you actually pay; this calculator deliberately models only principal and scheduled interest.',
      },
      {
        heading: 'Read the schedule as a sequence',
        text: 'Each row starts with the opening balance, calculates interest, subtracts the principal portion of the payment and produces the closing balance. The last payment can be slightly different because the remaining debt must be cleared. Calculations keep unrounded values internally and round only the displayed amounts. A lender may round each posting, use actual calendar days, reset a floating rate or follow different due dates, so its statement can differ from this idealised monthly model.',
      },
    ],
    faq: [
      {
        question: 'Does the rate represent a current loan offer?',
        answer:
          'No. The starting rate is an editable illustration. Enter a rate from the lender’s own documents, and compare the complete cost disclosure rather than treating the default as an available offer.',
      },
      {
        question: 'What happens at 0% interest?',
        answer:
          'The payment becomes principal divided by tenure. The table shows no interest, and each scheduled payment reduces the balance by the same amount, subject to the final displayed rounding.',
      },
      {
        question: 'Are fees included in EMI?',
        answer:
          'Not here. Fees may be charged separately or financed into the amount borrowed. If they are financed, include the actual financed principal, but avoid counting the same cost twice.',
      },
      {
        question: 'Can I model a floating-rate loan?',
        answer:
          'This page assumes one unchanged rate. You can examine alternative rates as separate scenarios, but it does not forecast future resets or reproduce a variable-rate repayment history.',
      },
      {
        question: 'Why does the interest portion fall?',
        answer:
          'With a reducing-balance loan, interest is charged on the outstanding principal. As payments reduce that principal, less interest is due, leaving more of the fixed payment to repay the loan.',
      },
    ],
    sources: [loans],
  },
  sip: {
    title: 'SIP calculator for regular investments',
    description:
      'Project monthly SIP contributions with adjustable return, tenure and contribution timing. Compare invested money and illustrative growth without guaranteed-return claims.',
    intro:
      'Explore what a regular monthly investment could grow into under a constant-return assumption. A SIP is a way to invest periodically; it does not turn a market-linked investment into a deposit with a guaranteed rate. Use the projection to understand the arithmetic, then consider uncertainty separately.',
    formula:
      'Let C be the monthly contribution, r the entered annual percentage divided by 1,200, and n the number of months. End-of-month future value is C × [(1 + r)^n − 1] ÷ r. Beginning-of-month contributions multiply that result by (1 + r). At zero return, future value is simply C × n.',
    example:
      'Suppose you contribute ₹1,000 at the beginning of each month for two months and assume 12% nominal annual growth. The monthly factor is 1.01. The first contribution grows to ₹1,020.10 and the second to ₹1,010, giving ₹2,030.10 from ₹2,000 invested. This is an arithmetic illustration, not a return forecast.',
    sections: [
      {
        heading: 'Timing changes the calculation',
        text: 'A contribution made at the beginning of a month participates in that month’s assumed growth; one made at the end does not. Select the timing that matches the illustration you want to inspect. Many online calculators choose one convention without making it visible, which explains some differences between their answers. This page uses the annual percentage divided by twelve, rather than converting an effective annual return into an equivalent monthly rate.',
      },
      {
        heading: 'Separate the plan from the projection',
        text: 'Start with a contribution you can sustain, then compare shorter and longer terms using several assumed returns. Contributions are the money you put in; projected growth is the difference between that total and the future value. Neither quantity describes the risk of the underlying investment. The model excludes withdrawals, skipped instalments, expenses, taxes and inflation. Real market values move unevenly, so identical average returns can produce different outcomes when contributions occur along different return paths.',
      },
    ],
    faq: [
      {
        question: 'Does a SIP guarantee positive growth?',
        answer:
          'No. Regular investing does not guarantee a profit or protect capital. This non-negative-rate illustration helps explore compounding but does not model market losses or the probability of any outcome.',
      },
      {
        question: 'Why can another SIP calculator show a different value?',
        answer:
          'Check contribution timing, monthly-rate conversion and rounding. Some use an effective annual growth assumption, while this page divides the entered nominal annual percentage by twelve.',
      },
      {
        question: 'Can I increase the contribution each year?',
        answer:
          'This version assumes a constant monthly contribution. A step-up plan needs a separate cash-flow model; increasing the fixed input here applies that amount to every month.',
      },
      {
        question: 'What does the zero-return scenario show?',
        answer:
          'It shows only the accumulated contributions. For ₹5,000 over 120 months, the total is ₹6,00,000 before any fees, withdrawals or inflation adjustment.',
      },
      {
        question: 'Are the results after tax and expenses?',
        answer:
          'No. Costs and taxes depend on the investment and your circumstances. The projection is a gross mathematical scenario, not a recommendation or a statement of spendable future wealth.',
      },
    ],
    sources: [
      investing,
      {
        title: 'SEBI Investor: SIP calculator',
        url: 'https://investor.sebi.gov.in/calculators/sip_calculator.html',
      },
    ],
  },
  lumpsum: {
    title: 'Lumpsum investment calculator',
    description:
      'Estimate the future value of a one-time investment with editable annual growth and tenure. See principal and projected growth using transparent compounding.',
    intro:
      'A one-time investment has a different cash-flow pattern from monthly investing. All of the starting money is exposed to the assumed growth rate for the full period. This calculator helps you inspect that simple relationship without suggesting that a chosen return will actually occur.',
    formula:
      'For starting principal P, annual decimal growth r and a term of m months, future value = P × (1 + r)^(m ÷ 12). Projected growth is future value minus P. A fractional year is represented by a fractional exponent; no monthly contributions or withdrawals are included in this model.',
    example:
      'An illustrative ₹1,00,000 invested for 24 months at 10% annual compounded growth becomes ₹1,21,000: ₹1,00,000 × 1.10 × 1.10. The first year adds ₹10,000; the second adds ₹11,000 because growth is applied to the increased balance. The total projected gain is ₹21,000.',
    sections: [
      {
        heading: 'Compare time horizons deliberately',
        text: 'Change the term while holding the principal and assumed rate constant. This shows how repeated growth changes the final amount. Extending a horizon is not a guarantee of a satisfactory result, particularly for market-linked assets. You may need the money earlier, or face expenses and taxes along the way. Keep a separate record of why you chose each assumption so the result does not gradually become an expectation without supporting evidence.',
      },
      {
        heading: 'Understand the purchasing-power gap',
        text: 'The number shown is a nominal amount in the currency label you select. It is not adjusted for changes in the cost of living. A larger future balance can still buy less than you expect if prices rise substantially. Changing the display from INR to USD does not perform foreign-exchange conversion; it only changes how the scenario is labelled. Enter a correctly converted principal yourself if you want to model money denominated in another currency.',
      },
    ],
    faq: [
      {
        question: 'Is this suitable for a savings account quote?',
        answer:
          'Only if its assumptions match the account. Interest-credit frequency, day counts and withdrawals can differ. Use the FD or compound-interest calculator when you need a specific compounding frequency.',
      },
      {
        question: 'Does the calculator choose an investment?',
        answer:
          'No. It models the numbers you provide and does not rank products, assess suitability or account for your ability to tolerate losses. The default rate is not a recommendation.',
      },
      {
        question: 'Can I add a later contribution?',
        answer:
          'Not on this page. For regular monthly contributions use the SIP calculator. Irregular deposits need separate cash flows, each grown for its own remaining period.',
      },
      {
        question: 'Why is a two-year gain more than twice a one-year gain?',
        answer:
          'Under a positive compound-growth assumption, later growth applies to previous gains as well as the original principal. This additional growth is the mathematical compounding effect.',
      },
      {
        question: 'What should I check before relying on the result?',
        answer:
          'Review the rate convention, the horizon, fees, taxes, inflation and possible losses. Compare several scenarios rather than treating one smooth projection as a forecast of a real investment.',
      },
    ],
    sources: [investing],
  },
  fd: {
    title: 'FD calculator with compounding options',
    description:
      'Estimate fixed-deposit maturity using monthly, quarterly, half-yearly or yearly compounding. Enter your own rate and compare gross principal and interest.',
    intro:
      'Estimate a cumulative fixed deposit using a rate and term that you enter. The calculator offers four compounding frequencies so you can match the mathematical convention in your deposit illustration. It does not publish current bank rates or account for every institution’s maturity rules.',
    formula:
      'Let P be the deposit, r the annual rate as a decimal, f the number of compounding periods per year and m the term in months. Maturity = P × (1 + r ÷ f)^(f × m ÷ 12). Use f = 12, 4, 2 or 1 for monthly, quarterly, half-yearly or yearly compounding respectively.',
    example:
      'For an illustrative ₹1,00,000 deposit at 8% annually over 12 months with quarterly compounding, each quarter applies 2%. The calculation is ₹1,00,000 × 1.02^4 = ₹1,08,243.22 approximately. Gross interest is about ₹8,243.22. The 8% input is an example, not an advertised or verified deposit rate.',
    sections: [
      {
        heading: 'Match the product’s interest convention',
        text: 'A cumulative deposit adds credited interest to its balance. A payout deposit distributes interest instead, so the same maturity formula may not describe its cash flows. Select the frequency stated in the product terms rather than choosing the one with the largest answer. Where the term includes a partial compounding period, this calculator uses a fractional exponent; an institution may instead apply a separate simple-interest or day-count rule for the unfinished period.',
      },
      {
        heading: 'Distinguish gross maturity from the amount received',
        text: 'The result excludes deductions, penalties and taxes. A premature withdrawal can change the rate or trigger a charge, and tax treatment can depend on circumstances outside this form. Check the provider’s own maturity statement for the actual payable amount. The breakdown is useful for understanding how much of the projection comes from your deposit and how much comes from interest, but it is not evidence of a current offer or a promise that a bank will pay that exact number.',
      },
    ],
    faq: [
      {
        question: 'Where should I get the interest rate?',
        answer:
          'Use the current official terms for the particular deposit and tenure you are considering. This site intentionally supplies editable examples rather than asserting that any example rate is available.',
      },
      {
        question: 'Does more frequent compounding increase maturity?',
        answer:
          'For a positive nominal rate held constant, more frequent compounding raises the effective annual growth. However, products can quote rates using different conventions, so compare like with like.',
      },
      {
        question: 'Are monthly interest payouts included?',
        answer:
          'No. This models a cumulative balance. A payout deposit needs a cash-flow calculation that removes each paid amount rather than leaving it invested for further compounding.',
      },
      {
        question: 'How is a one-month term handled?',
        answer:
          'The formula applies the corresponding fraction of the annual compounding periods. This is a mathematical convention and may differ from a provider’s actual short-term or broken-period calculation.',
      },
      {
        question: 'Can I use the result as a bank maturity certificate?',
        answer:
          'No. It is a gross estimate based on entered values. Provider rounding, exact dates, deductions and product terms must be checked against the bank’s official calculation.',
      },
    ],
    sources: [investing],
  },
  rd: {
    title: 'RD calculator for monthly deposits',
    description:
      'Estimate recurring-deposit maturity from monthly instalments using an explicit quarterly-compounding convention. Separate contributions and projected interest.',
    intro:
      'A recurring deposit builds a balance through repeated contributions rather than a single opening amount. Each instalment has a different amount of time to earn interest. This calculator makes its timing and compounding assumptions visible so you can compare them with the deposit terms you actually have.',
    formula:
      'The illustration assumes beginning-of-month contributions and quarterly compounding. Convert annual decimal rate r to monthly growth j = (1 + r ÷ 4)^(1 ÷ 3) − 1. For monthly payment C over n months, maturity = C × [(1 + j)^n − 1] ÷ j × (1 + j). At zero interest, the result is C × n.',
    example:
      'If you put aside ₹1,000 per month for 12 months at a zero interest rate, contributions and maturity both equal ₹12,000. With a positive entered rate, each instalment grows for its remaining months: the first gets twelve monthly periods, the second eleven and the last one. This explains why applying a full year’s interest to all ₹12,000 would overstate this model.',
    sections: [
      {
        heading: 'Read deposit timing carefully',
        text: 'The start-of-month assumption gives every instalment at least one month of growth. Moving payments to the end of each month reduces the time exposed to interest. Actual providers may use payment due dates, completed quarters, broken-period rules or their own rounding conventions. This calculator uses an equivalent monthly growth factor derived from quarterly compounding; it is transparent and repeatable, but it should not be presented as the contract formula of every recurring-deposit product.',
      },
      {
        heading: 'Check affordability as well as maturity',
        text: 'A projected maturity amount can look attractive while the required monthly commitment is difficult to maintain. Use the contribution field to compare realistic amounts and keep a note of which assumptions you changed. The model assumes every instalment is made on time. It excludes missed-payment fees, delayed deposits, premature closure, deductions and taxes. The original contribution total provides a useful reference point because it is money you supply yourself, not interest generated by the account.',
      },
    ],
    faq: [
      {
        question: 'Why does RD interest differ from an FD on the total contributions?',
        answer:
          'An FD starts with the whole principal invested. In an RD, later instalments arrive gradually and have less time to grow. The timing of the money matters as much as its total.',
      },
      {
        question: 'Is the example rate a current bank rate?',
        answer:
          'No. It is an editable modelling input. Find the rate and calculation rules in the provider’s official product information for the exact tenure and deposit you are considering.',
      },
      {
        question: 'Can I model missed instalments?',
        answer:
          'This version assumes the same amount arrives at the start of every month. Missed or delayed instalments require a dated cash-flow model and any applicable provider charges.',
      },
      {
        question: 'What happens for a single month?',
        answer:
          'One contribution earns one equivalent monthly growth period under the stated quarterly-compounding convention. The provider may apply a different rule for a short or incomplete term.',
      },
      {
        question: 'Is the displayed maturity after tax?',
        answer:
          'No. The calculation reports gross projected maturity and interest. It does not determine deductions, tax liability or whether the deposit terms permit the selected duration.',
      },
    ],
    sources: [investing],
  },
  gst: {
    title: 'GST calculator: inclusive and exclusive amounts',
    description:
      'Calculate GST added to a price or extracted from a tax-inclusive total. Show base value, total tax and illustrative equal CGST/SGST portions.',
    intro:
      'Use this calculator to inspect the arithmetic of adding GST to a base amount or separating it from a tax-inclusive total. You supply the rate. The tool does not classify goods or services, determine place of supply, or decide whether an exemption or additional levy applies.',
    formula:
      'For an exclusive base B and a percentage rate r, tax = B × r ÷ 100 and total = B + tax. For an inclusive total T, base = T ÷ (1 + r ÷ 100) and tax = T − base. The displayed intra-state illustration divides that tax equally between CGST and SGST.',
    example:
      'With an illustrative base price of ₹1,000 and an entered 18% rate, tax is ₹180 and the inclusive total is ₹1,180. The equal split is ₹90 CGST and ₹90 SGST. Entering ₹1,180 with the inclusive option reverses the calculation and recovers a ₹1,000 base. The example rate is not a classification of any particular item.',
    sections: [
      {
        heading: 'Choose the correct starting amount',
        text: 'If the figure you know excludes tax, leave the inclusive option unchecked. If it is the final price including the tax being modelled, enable that option before reading the answer. Simply subtracting eighteen percent from an inclusive price does not reverse adding eighteen percent to a base: the percentages use different starting values. The inverse formula divides by the full growth factor, which is why it correctly separates the original base from the tax amount.',
      },
      {
        heading: 'Keep tax determination separate from arithmetic',
        text: 'The equal CGST/SGST presentation illustrates an intra-state split. Inter-state transactions, union-territory treatment, exemptions, cess, discounts, rounding and other rules may require a different tax treatment. Consult the applicable official information or a qualified professional for that determination. This page uses unrounded arithmetic internally and formats the results for readability. A real invoice can apply line-level rounding, so totals from many individually rounded lines may differ slightly from applying one percentage to a combined amount.',
      },
    ],
    faq: [
      {
        question: 'Does the calculator tell me which GST rate to charge?',
        answer:
          'No. It uses the rate you enter without determining the applicable classification. Confirm the relevant official rate and the facts of the transaction before preparing an invoice.',
      },
      {
        question: 'Why can I not subtract the rate from the inclusive amount?',
        answer:
          'The tax rate applies to the base value, not to the final tax-inclusive total. Dividing by one plus the rate recovers the base; direct subtraction uses the wrong denominator.',
      },
      {
        question: 'When is the CGST/SGST split appropriate?',
        answer:
          'The displayed split is an intra-state illustration. It is not a determination of tax jurisdiction. Check the nature and place of supply and the applicable official requirements separately.',
      },
      {
        question: 'Can I use a zero rate?',
        answer:
          'Yes. The arithmetic then shows no tax and the same base and total. That mathematical result does not establish that a particular supply is exempt, zero-rated or outside scope.',
      },
      {
        question: 'Are discounts and additional levies included?',
        answer:
          'No automatic discount, cess or other charge is applied. Enter the appropriate taxable amount only after determining those details, and check invoice-level requirements separately.',
      },
    ],
    sources: [
      { title: 'CBIC: GST sectoral FAQs', url: 'https://cbic-gst.gov.in/sectoral-faq.html' },
    ],
  },
  percentage: {
    title: 'Percentage calculator for amounts and changes',
    description:
      'Find X percent of Y, express X as a percentage of Y, or calculate percentage change. Clear examples explain the denominator and zero-base errors.',
    intro:
      'Three common percentage questions use similar numbers but different denominators. Choose the question first, then enter X and Y. This calculator keeps the modes separate so that a share of a total is not confused with a change from an original amount.',
    formula:
      'For X% of Y, calculate X × Y ÷ 100. For X as a percentage of Y, calculate X ÷ Y × 100; Y cannot be zero. For change from X to Y, calculate (Y − X) ÷ |X| × 100; X cannot be zero. The absolute starting value makes the signed change convention explicit for negative bases.',
    example:
      'Twenty-five percent of 200 is 50. In a different question, 25 is 12.5% of 200. If an amount increases from 200 to 250, its percentage change is 25%, because the increase of 50 is compared with the original 200. The same numbers do not make these questions interchangeable.',
    sections: [
      {
        heading: 'Identify the reference quantity',
        text: 'A percentage always needs a reference amount, even when everyday language leaves it unstated. In a discount, the reference is usually the original price; in a share calculation it is the whole group or total. Write down that reference before entering the values. The ratio mode asks how much X represents out of Y, whereas the change mode compares the difference with the starting X. Reversing the inputs can therefore give a different, and sometimes much larger, result.',
      },
      {
        heading: 'Avoid confusing percent and percentage points',
        text: 'If a rate rises from 10% to 12%, the increase is two percentage points, while the relative increase is twenty percent. This tool calculates the relative percentage when you choose change and enter 10 and 12. It does not attach context to the values or decide which description is appropriate. Negative inputs are accepted for general arithmetic, but the signed-change convention should be explained when reporting a result involving losses, balances below zero or a transition across zero.',
      },
    ],
    faq: [
      {
        question: 'Why is a percentage of zero sometimes valid?',
        answer:
          'Calculating X% of zero is multiplication and gives zero. Dividing by a zero total, or measuring change from a zero starting amount, is undefined and produces an error instead.',
      },
      {
        question: 'Why does reversing a change give a different percentage?',
        answer:
          'The original amount becomes the denominator. Moving from 100 to 120 is a 20% increase; returning from 120 to 100 is about a 16.67% decrease because the base is larger.',
      },
      {
        question: 'Can the result exceed 100%?',
        answer:
          'Yes. A part can exceed the comparison amount, and growth can more than double a starting value. A number above 100% is not automatically an error; inspect the underlying question.',
      },
      {
        question: 'How are negative starting values handled?',
        answer:
          'Change divides by the absolute value of the starting amount, so the sign describes the direction of the movement. Other conventions exist; state this one when communicating the result.',
      },
      {
        question: 'Does rounding affect later calculations?',
        answer:
          'The result is formatted for readability, while the function keeps its numerical precision. Re-entering a rounded displayed answer into another calculation may introduce a small rounding difference.',
      },
    ],
    sources: [],
  },
  age: {
    title: 'Age calculator with next birthday countdown',
    description:
      'Calculate calendar age in years, months and days, total elapsed days and days to the next birthday. Explicit leap-day convention and editable reference date.',
    intro:
      'Calculate an age on a date you choose rather than assuming every question is about today. This tool separates completed calendar years and months from the remaining days, and also shows elapsed days and the countdown to the next birthday under its stated calendar convention.',
    formula:
      'Find the greatest completed anniversary that does not fall after the reference date. From that anniversary, count completed calendar months, clamping to the final day where a month is shorter. The remaining whole calendar days form the day component. Day totals use UTC calendar dates to avoid changes caused by daylight-saving hours.',
    example:
      'For a birth date of 1 January 2000 and a reference date of 1 January 2026, the result is 26 years, 0 months and 0 days. The birthday countdown is zero because the chosen reference date is the birthday itself. A different reference date answers a different age question; it is not tied to the day the page was built.',
    sections: [
      {
        heading: 'A calendar month is not a fixed number of days',
        text: 'Dividing an elapsed day count by thirty does not produce an exact calendar age. Months differ in length, and leap years change February. This calculator advances through calendar anniversaries instead. It treats a 29 February birthday as 28 February in a non-leap year and clamps month-end dates to the last valid day. These are declared calculation conventions; they do not establish how a particular law, examination authority or application form defines age eligibility.',
      },
      {
        heading: 'Use the date specified by the question',
        text: 'A form may ask for age on a stated cutoff date rather than on the current day. Enter that date in the reference field and check both inputs before copying a result. Date fields are displayed using the browser’s local interface, but the underlying calculation uses date-only values, not a birth time or timezone. The calculator accepts dates from 1900 through 2200 and rejects a birth date later than the reference date. It does not infer missing dates from identity documents or store the dates you type on a server.',
      },
    ],
    faq: [
      {
        question: 'Is this suitable for proving exam eligibility?',
        answer:
          'It can help check calendar arithmetic, but the authority’s cutoff date and eligibility rules control. Read the official notification, particularly where leap-day or inclusive-date rules matter.',
      },
      {
        question: 'Why does a birthday today show zero days remaining?',
        answer:
          'The countdown includes the current reference date. On the birthday itself, no days remain until that birthday. The following day, it counts forward to the next anniversary.',
      },
      {
        question: 'How is 29 February treated?',
        answer:
          'In non-leap years, this calculator uses 28 February for the anniversary. Some legal or administrative rules use another convention, so confirm the relevant rule before relying on the age.',
      },
      {
        question: 'Can daylight-saving time change the answer?',
        answer:
          'The function compares UTC representations of calendar dates, not local elapsed hours. This prevents a daylight-saving change from adding or removing a calendar day in the result.',
      },
      {
        question: 'Can I calculate age on a future date?',
        answer:
          'Yes, within the supported date range and with birth no later than the reference date. This is useful for planning, but it is not a statement about future eligibility rules.',
      },
    ],
    sources: [],
  },
  'loan-prepayment': {
    title: 'Loan prepayment calculator: interest and tenure saved',
    description:
      'Compare a fixed-EMI loan with a one-time or monthly extra payment. Estimate interest saved and months reduced with a revised amortization schedule.',
    intro:
      'Explore how paying principal earlier can change the remaining life of a fixed-rate loan. This calculator keeps the original EMI and applies extra payments to the outstanding balance. It reports the modelled interest saving and term reduction, not the benefit after lender charges or alternative uses of the cash.',
    formula:
      'Calculate the original EMI using the reducing-balance formula. Each month, apply interest to the opening balance, subtract the scheduled principal repayment, then subtract any extra payment without taking the balance below zero. Stop when the balance is cleared. Interest saved is baseline interest minus revised interest; months saved is the difference in payment counts.',
    example:
      'Consider ₹1,000 borrowed at an illustrative 12% annual rate for two months. The EMI is approximately ₹507.51 and total scheduled interest approximately ₹15.02. Clearing the remaining balance just after the first scheduled payment leaves only the first month’s ₹10 interest, saves about ₹5.02 and removes the second payment month, before any fees.',
    sections: [
      {
        heading: 'Choose when the extra money arrives',
        text: 'The one-time payment is applied after the numbered scheduled payment you select. A separate field adds an extra amount after every monthly payment, beginning in month one. The two can be combined, but check that this matches your intended cash flow. Extra amounts are capped at the remaining principal so the model never creates a negative loan balance or treats surplus money as an investment. The revised schedule shows exactly when the additional principal is removed.',
      },
      {
        heading: 'Compare the saving with the broader decision',
        text: 'A lower interest total does not by itself decide whether prepayment is right for you. Fees, restrictions, liquidity needs and the value of alternative uses for the money are outside this calculator. The model assumes the rate stays fixed and that the EMI is retained, shortening tenure. A lender might instead reduce the EMI or follow a different reset procedure. Ask for its actual revised schedule before making a payment based on this illustration.',
      },
    ],
    faq: [
      {
        question: 'Does the calculator reduce EMI after prepayment?',
        answer:
          'No. It keeps the original EMI and measures tenure reduction. If your lender reduces the instalment instead, its remaining interest and term will follow a different repayment pattern.',
      },
      {
        question: 'Can the extra payment exceed the outstanding balance?',
        answer:
          'You can enter a larger amount, but only the remaining principal is applied. The model does not charge interest on a negative balance or count unused surplus as a payment.',
      },
      {
        question: 'Are prepayment penalties included?',
        answer:
          'No. The displayed saving is interest only. Check your contract and applicable rules for fees, restrictions or other costs before comparing the net benefit of prepayment.',
      },
      {
        question: 'What if the loan rate is zero?',
        answer:
          'There is no interest to save, but extra payments can still clear the principal sooner. The result can therefore show fewer months with zero monetary interest saving.',
      },
      {
        question: 'Why does an earlier prepayment usually save more interest?',
        answer:
          'In this fixed-rate reducing-balance model, lowering principal earlier removes it from more future interest calculations. The precise saving still depends on the amount, timing and remaining loan schedule.',
      },
    ],
    sources: [loans],
  },
  'compound-interest': {
    title: 'Compound interest calculator with frequency control',
    description:
      'Calculate compound growth using monthly, quarterly, half-yearly or yearly periods. Explore principal, nominal annual rate and term with transparent assumptions.',
    intro:
      'Compound interest applies growth to a balance that can already include earlier interest. This calculator isolates that mechanism with a single opening principal, an unchanged nominal annual rate and a selectable compounding frequency. It is useful for comparing conventions, not for predicting an uncertain investment path.',
    formula:
      'Future value = P × (1 + r ÷ f)^(f × m ÷ 12), where P is principal, r is the annual decimal rate, f is compounding periods per year and m is months. Growth equals future value minus principal. Zero interest leaves the principal unchanged, regardless of frequency or term.',
    example:
      'For ₹50,000 at an illustrative 12% nominal annual rate compounded monthly for 12 months, the monthly rate is 1%. The future value is ₹50,000 × 1.01^12, approximately ₹56,341.25. Growth is approximately ₹6,341.25. Simply adding 12% would give ₹56,000 and would omit interest earned on earlier interest.',
    sections: [
      {
        heading: 'Nominal and effective rates are different descriptions',
        text: 'A nominal annual rate is divided across the selected compounding periods. With positive interest, repeated compounding produces an effective annual growth above that nominal figure. If a product quotes an effective annual yield, entering it as a nominal rate with monthly compounding would count part of the effect twice. Determine which convention a document uses before comparing results. This page does not convert an advertised yield automatically or verify a provider’s quoted rate.',
      },
      {
        heading: 'Use the controls to isolate one assumption',
        text: 'Hold principal and term constant while switching frequency to inspect the mathematical effect. Then keep frequency fixed and adjust the horizon or assumed rate separately. Changing several inputs at once makes it difficult to understand why the output moved. The model includes no regular contributions, withdrawals, taxes, fees or inflation adjustment. It also uses a fractional exponent for incomplete compounding periods, which may differ from the day-count rules of an actual savings product. Use the SIP page for equal monthly contributions and the FD page for a deposit-oriented explanation of the same core formula.',
      },
    ],
    faq: [
      {
        question: 'How is compound interest different from simple interest?',
        answer:
          'Simple interest applies only to the initial principal in each period. Compound growth applies to the accumulated balance, allowing earlier interest to contribute to later growth when it remains invested.',
      },
      {
        question: 'Does selecting monthly compounding guarantee a better product?',
        answer:
          'No. The mathematical comparison holds a nominal rate and all other assumptions constant. Real products can differ in risk, fees, withdrawal terms, taxes and the way their quoted rates are defined.',
      },
      {
        question: 'Can I include recurring contributions here?',
        answer:
          'This page models one opening amount. Use the SIP calculator for equal monthly contributions, or a dated cash-flow calculation when deposits and withdrawals occur irregularly.',
      },
      {
        question: 'Why is the result not inflation-adjusted?',
        answer:
          'Inflation is a separate assumption about purchasing power. This calculation reports nominal money, so a higher future amount should not be interpreted as an equivalent increase in what it can buy.',
      },
      {
        question: 'What happens when inputs produce an extremely large result?',
        answer:
          'The function rejects results outside its supported numerical range rather than displaying infinity or an unreliable giant value. Reduce the term, rate or principal and check whether the scenario is meaningful.',
      },
    ],
    sources: [investing],
  },
};
