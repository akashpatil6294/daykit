import { calculatorText as t } from '../../i18n/calculators';
export default function Breakdown({
  principal,
  interest,
}: {
  principal: number;
  interest: number;
}) {
  const total = principal + Math.max(0, interest),
    share = total ? (principal / total) * 100 : 0;
  return (
    <figure className="finance-chart">
      <figcaption>{t.chart}</figcaption>
      <svg
        viewBox="0 0 100 12"
        role="img"
        aria-label={`${t.invested}: ${share.toFixed(1)}%; ${t.interest}: ${(100 - share).toFixed(1)}%`}
      >
        <rect width="100" height="12" rx="2" fill="#d5b46d" />
        <rect width={share} height="12" rx="2" fill="#315f43" />
      </svg>
      <div>
        <span>
          <i className="principal-key" />
          {t.invested}
        </span>
        <span>
          <i className="interest-key" />
          {t.interest}
        </span>
      </div>
    </figure>
  );
}
