const DAY = 86400000;
function parse(text: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) throw new RangeError('date');
  const date = new Date(`${text}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== text)
    throw new RangeError('date');
  return date;
}
function at(year: number, month: number, day: number) {
  const last = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(day, last)));
}
/** Calendar arithmetic uses UTC dates, not elapsed local hours. Feb 29 anniversaries use Feb 28. */
export function age(birthText: string, asOfText: string) {
  const birth = parse(birthText),
    asOf = parse(asOfText);
  if (birth > asOf || birth.getUTCFullYear() < 1900 || asOf.getUTCFullYear() > 2200)
    throw new RangeError('date');
  let years = asOf.getUTCFullYear() - birth.getUTCFullYear();
  if (at(birth.getUTCFullYear() + years, birth.getUTCMonth(), birth.getUTCDate()) > asOf) years--;
  const anniversary = at(birth.getUTCFullYear() + years, birth.getUTCMonth(), birth.getUTCDate());
  let count = 0;
  while (
    count < 11 &&
    at(
      anniversary.getUTCFullYear(),
      anniversary.getUTCMonth() + count + 1,
      anniversary.getUTCDate(),
    ) <= asOf
  )
    count++;
  const anchor = at(
    anniversary.getUTCFullYear(),
    anniversary.getUTCMonth() + count,
    anniversary.getUTCDate(),
  );
  let next = at(asOf.getUTCFullYear(), birth.getUTCMonth(), birth.getUTCDate());
  if (next < asOf) next = at(asOf.getUTCFullYear() + 1, birth.getUTCMonth(), birth.getUTCDate());
  return {
    years,
    months: count,
    days: Math.round((asOf.getTime() - anchor.getTime()) / DAY),
    totalDays: Math.round((asOf.getTime() - birth.getTime()) / DAY),
    nextBirthdayDays: Math.round((next.getTime() - asOf.getTime()) / DAY),
  };
}
