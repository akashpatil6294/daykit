---
{"title":"Calculate GST from an exclusive price or an inclusive total","summary":"Work through GST addition and reverse calculation, understand the illustrative CGST/SGST split and keep tax-rate selection separate from arithmetic.","author":"Akash Patil","published":"2026-10-13","updated":"2026-10-21","faq":[{"question":"Does the calculator choose the applicable GST rate?","answer":"No. You enter the rate after checking the relevant current rules. The default and examples are illustrative and do not classify a supply or establish its tax treatment."},{"question":"Why can I not subtract 18% from an 18%-inclusive total?","answer":"Because the 18% was applied to the pre-tax base, not the final total. Reverse the multiplication by dividing the total by 1.18 in that hypothetical example."},{"question":"Is the equal CGST/SGST split always applicable?","answer":"No. It is an intra-state illustration, not a determination of place of supply, registration, exemption, cess, IGST or UTGST treatment. Check the actual transaction rules."}]}
---


## Check the base with a simple example

With an illustrative 18 percent rate, adding tax to 100 yields 118. Removing that tax from 118 means dividing by 1.18, not subtracting 18 percent of 118. The example explains arithmetic only and does not establish which GST rate applies to a transaction.

GST arithmetic begins with a question about the amount you have: is it the price before tax or the final price including tax? The same percentage produces different operations depending on that answer. A calculator can perform those operations, but it cannot determine the legally applicable rate or tax treatment from an amount alone.

The [GST calculator](/calculators/gst/) therefore asks for both an amount and an inclusive-price choice. The rate is editable. All examples below are hypothetical arithmetic demonstrations, not statements that a particular good or service attracts the example rate. For current classification and treatment, use the appropriate official material or professional guidance.

## Add tax to an exclusive price

Let B be the pre-tax base and r the entered percentage. Tax is B × r / 100. The inclusive total is B + tax, equivalently B × (1 + r / 100). This is a direct percentage-of calculation, so the [percentage calculator](/calculators/percentage/) can be used as a simple cross-check of the tax component.

For an illustrative base of INR 1,000 and an assumed rate of 18%, tax is INR 180 and the total is INR 1,180. The example is intentionally easy to inspect. The original base, tax and final total should remain separately labeled so that one is not accidentally entered into a later calculation as another.

## Reverse an inclusive total correctly

If T already includes tax, recover the base using T / (1 + r / 100). Tax is then T minus that recovered base. In the example, INR 1,180 divided by 1.18 gives INR 1,000. The difference is INR 180. This reverses the multiplication used in the exclusive calculation.

Subtracting 18% of INR 1,180 would subtract INR 212.40, which is too much for this example. The error comes from using the final total as the percentage base when the original tax was calculated on the pre-tax amount. Reverse percentages require attention to what the percentage was applied to.

## Interpret the split as an illustration

The tool shows equal CGST and SGST halves for an intra-state illustration. At the assumed 18% total rate, each displayed half is 9% of the same base. That yields INR 90 plus INR 90 on an INR 1,000 example base. The split is not a legal classification of your transaction.

[CBIC's GST overview](https://cbic-gst.gov.in/about-gst.html) distinguishes the different GST components. Which treatment applies depends on the actual supply and relevant rules. This simple calculator does not establish place of supply, exemptions, cess, registration obligations or whether another component such as IGST or UTGST is relevant.

## Check the rate and price description independently

Read whether a quoted price is inclusive or exclusive before entering it. A statement such as “plus tax” describes a different starting amount from “including tax.” If the invoice or quotation is unclear, obtain clarification. Choosing the wrong mode can produce a mathematically correct result for the wrong question.

The applicable rate is another independent input. A remembered percentage or a calculator default is not a source. The tool deliberately does not label its example as a verified current rate. Keep the evidence for the rate separate from the arithmetic so that a later rule change does not invalidate your understanding of the formula itself.

## Be careful with discounts and multiple lines

The order and basis of adjustments can affect the amount on which a percentage is calculated. This guide does not determine the tax treatment of a particular discount, reimbursement or charge. First establish the correct taxable base for the transaction, then use the calculator for that base and rate.

If an invoice has multiple items with different treatment, one rate on the grand total may not reproduce it. Calculate the appropriate lines or groups separately under the applicable rules. Display rounding can also create small differences between summing rounded line amounts and rounding a total computed from unrounded values.

## Use a zero-rate example as a check

With an entered rate of 0%, the tax component is zero and the base equals the total in either mode. This tests the arithmetic, but it does not establish that a real supply is zero-rated, exempt or outside tax. Those labels have meanings beyond the numerical input and should not be inferred from a calculator scenario.

Similarly, changing the display currency does not perform an exchange conversion. Keep amounts in a consistent currency, and do not treat a currency label as evidence that cross-border tax issues have been handled. The calculator's scope is deliberately narrow: percentage addition and reversal under your inputs.

## Save enough context to reproduce the result

Record the amount, rate, inclusive setting and any separately established base adjustments. Review the labels before using the result in a quotation or reconciliation. For a real filing or invoice decision, verify current rules and the transaction facts. A precise arithmetic answer is useful only when the inputs describe the correct tax question.
