---
{"title":"Understand RD maturity by following each monthly deposit","summary":"See why recurring deposits have different earning periods, how the quarterly-to-monthly model works and which real-world terms are outside the estimate.","author":"Daykit editorial","published":"2026-10-13","updated":"2026-10-13","faq":[{"question":"Why not apply the FD formula to all RD contributions?","answer":"Because the contributions arrive at different times. Treating the total as an opening deposit gives later contributions too much time to grow in the model."},{"question":"What timing convention does this RD calculator use?","answer":"It assumes beginning-of-month deposits and converts a nominal quarterly-compounded annual rate into an equivalent monthly factor. Actual institutions may calculate differently."},{"question":"Are missed installments or late charges included?","answer":"No. The model assumes equal contributions arrive as scheduled. Check the product agreement for irregular-payment and other institution-specific rules."}]}
---
A recurring deposit is easier to understand when viewed as a series of smaller deposits made at different times. The first contribution remains in the model longer than the last. That timing difference is why multiplying the total contributions by a single full-term growth factor generally misrepresents the arrangement.

The [RD calculator](/calculators/rd/) models equal monthly contributions at the beginning of each month. It uses a quarterly compounding convention expressed as an equivalent monthly factor. Its rate is an editable example, not a current bank quote. The result is a gross estimate under those stated assumptions.

## Count the contributions first

If you contribute INR 1,000 per month for twelve months, the total contributed is INR 12,000. Establish this amount before considering interest. At a modeled 0% rate, maturity equals INR 12,000. This simple case is a useful check on both the inputs and the interpretation of the result.

If you accidentally enter an annual contribution as a monthly one, the arithmetic can still run successfully while describing a very different plan. Check the contribution frequency and the month count explicitly. The calculator cannot infer which figure you intended from a plausible-looking number.

## Follow the timing of individual deposits

Under beginning-of-month timing, the first deposit receives growth over the full modeled term. The second has one fewer month, and the final deposit has one month. Each contribution therefore has its own exponent. The total future value is the sum of all those separately grown contributions.

This timing convention differs from end-of-month contributions, where the last payment has no subsequent growth period before the endpoint. The [SIP calculator](/calculators/sip/) offers a timing choice that makes this distinction visible. Similar cash-flow mathematics does not mean that an RD and a market-linked investment have the same risk or contractual features.

## Translate quarterly compounding into a monthly factor

Let j be the hypothetical nominal annual decimal rate. A quarter's growth factor in this model is 1 + j / 4. The equivalent monthly factor is the cube root of that quarterly factor. Subtract one to obtain the monthly rate used in the contribution sum.

The cube root matters because three modeled monthly factors should combine to the quarter's factor. Simply dividing the annual rate by twelve would describe a different convention. Neither convention should be silently substituted for an institution's actual rules. The purpose is to make this calculator's assumption explicit and reproducible.

## Check a small example without claiming an offer

At a 0% rate, twelve beginning-of-month deposits of INR 1,000 mature at INR 12,000, with zero interest. At a positive hypothetical rate, the first deposit earns more modeled interest than the last because it remains longer. You can inspect this relationship by changing only the term while keeping the monthly amount and rate fixed.

For another sanity check, a one-month term contains one contribution and one modeled month of growth under beginning timing. It is not a twelve-contribution year. These small cases help catch unit and timing mistakes before you rely on a larger multi-year projection.

## Compare an RD with an FD carefully

The [FD calculator](/calculators/fd/) assumes one initial principal. If INR 12,000 is available immediately, that is a different cash-flow pattern from INR 1,000 becoming available each month. Comparing their maturity values without stating the funding difference can produce a misleading conclusion.

Write down when money is available and when it is committed. If the comparison changes both timing and total principal, explain both changes. A calculator can show the arithmetic under each plan, but it does not establish which arrangement is suitable for an individual's budget or liquidity needs.

## Recognize real-world differences

Actual deposit products can include exact-day calculations, rounding conventions, missed-installment rules, payout terms and early-closure conditions. This simplified model does not reproduce every institution's schedule. A mismatch should prompt a comparison of assumptions rather than an automatic conclusion that a quote is wrong.

Taxes and other costs are also outside the displayed gross estimate. Obtain current terms from the institution and appropriate current sources for applicable obligations. No rate or threshold in this guide is presented as a verified market fact. The example values are chosen to explain the mechanics.

## Keep the estimate understandable later

Record monthly amount, number of months, annual rate and timing convention with the maturity result. Separate contributions from interest when discussing the outcome. The [percentage calculator](/calculators/percentage/) can express interest relative to contributions, but that ratio is not automatically an annualized return because contributions arrive over time.

Use several labeled scenarios to understand sensitivity. A larger monthly amount increases the contribution total directly; a longer term changes both contributions and earning time. Keeping those effects separate makes the estimate more informative than simply choosing the largest final number on the screen.
