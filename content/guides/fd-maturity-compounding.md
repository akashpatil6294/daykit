---
{"title":"Check an FD maturity estimate by rate, frequency and term","summary":"Use a worked fixed-deposit example to understand nominal compounding, partial periods and why a generic estimate may differ from an institution's maturity quote.","author":"Daykit editorial","published":"2026-10-13","updated":"2026-10-13","faq":[{"question":"Are the displayed FD rates current bank rates?","answer":"No. They are editable examples marked unverified. Obtain current terms directly from the institution and check how the quoted rate is defined."},{"question":"Does the estimate include tax or early-withdrawal adjustments?","answer":"No. It models gross growth under the entered constant nominal rate. Taxes, penalties, payout options and institution-specific rules need separate consideration."},{"question":"Why can a bank quote differ from this calculator?","answer":"Day counts, rounding, incomplete compounding periods and payout conventions can differ. Compare the assumptions before deciding that either calculation is wrong."}]}
---
A fixed-deposit maturity estimate is a calculation under a set of terms. The principal, quoted rate, compounding frequency and duration all matter. A generic calculator is useful for understanding those inputs, but it should not be confused with an institution's current offer or a personalized net-of-tax quote.

Use the [FD calculator](/calculators/fd/) with a rate you have deliberately chosen for a hypothetical scenario or checked from a relevant source. The initial value shown on the page is an example. The tool supports monthly, quarterly, half-yearly and yearly compounding under a nominal-rate model, and it explains the assumptions behind the result.

## Identify the principal and the intended term

Principal is the amount placed at the beginning of this model. The term is entered in months. A twelve-month term and a twelve-year term are not close alternatives, so confirm the unit before interpreting the result. If money is added regularly, a recurring-contribution model is more appropriate than a single-deposit formula.

The [RD calculator](/calculators/rd/) handles monthly contributions under its stated convention. Do not use an FD formula on the total planned RD contributions as if they were all present at the start. That would give later deposits more time to earn interest than they actually have in the model.

## Work through a simple annual example

Take a hypothetical principal of INR 10,000, a nominal annual rate of 10%, annual compounding and a two-year term. The modeled amount after the first year is INR 11,000. After the second year it is INR 12,100. Gross modeled interest is INR 2,100. This is an arithmetic illustration, not a statement that such a deposit is currently offered.

The example also shows why maturity and interest are different figures. Maturity includes the original principal. Comparing a maturity amount from one scenario with the interest amount from another produces a meaningless comparison. Keep the labels visible when saving or discussing results.

## Read the compounding formula

The model uses principal multiplied by (1 + annual rate divided by compounding frequency), raised to the number of compounding periods. The annual rate must be written as a decimal in the formula. Quarterly compounding uses four periods per year, while monthly compounding uses twelve.

At a 0% rate, maturity equals principal. That edge case is useful when checking the calculator and your understanding. If a supposed zero-rate example shows growth, another setting or an input may be wrong. The [compound-interest calculator](/calculators/compound-interest/) lets you explore the same relationship outside the deposit-specific presentation.

## Compare frequency without changing hidden assumptions

If you hold a nominal annual rate constant and increase frequency, the modeled effective growth changes because interest is added to the base more often. This is a mathematical comparison. It does not establish that one real deposit is better than another, because their quoted rates, access conditions and costs may differ.

Read whether an institution's rate is nominal or effective and whether interest is reinvested or paid out. A payout product does not follow the same balance path as a cumulative product that retains interest. Entering a familiar percentage without checking its meaning can make the result look precise while describing the wrong arrangement.

## Pay attention to incomplete periods

Daykit expresses the month-based term using fractional exponents when it does not align with a whole compounding period. A real institution can use different rules for an incomplete quarter or an exact number of days. The difference can become visible even when principal and headline rate match.

For a real quote, compare the opening date, maturity date, compounding rules and rounding convention. Do not silently change the rate to force a match. Understanding the convention difference is more useful than producing an unexplained number that happens to resemble the quote.

## Separate gross interest from your net outcome

The output does not deduct taxes, account for tax withholding, model early withdrawal or include other charges. Those depend on the product and circumstances. This guide does not supply current tax thresholds or advise how a deposit should be structured. Verify applicable terms from appropriate current sources.

You can still use the calculator to compare clean mathematical scenarios: a different principal, a shorter term or another assumed rate. Change one input at a time and label the comparison. Currency selection changes the label rather than converting exchange rates, so keep the currency consistent across scenarios.

## Save inputs with the result

A maturity figure without its rate, term and frequency is difficult to interpret later. Record those inputs and note that the result is gross and modeled. Before committing money, obtain the institution's actual terms and maturity illustration. The calculator's role is to make the working understandable, not to replace the product agreement.
