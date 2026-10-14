export const languages = {
  hi: 'हिन्दी',
  kn: 'ಕನ್ನಡ',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  mr: 'मराठी',
  bn: 'বাংলা',
};
export const normalize = (text) => text.replace(/\s+/g, ' ').trim();
export const isText = (text) =>
  /[a-zA-Z]/.test(text) &&
  !/^https?:|^blob:|^\/|^#[\da-f]+$/.test(text) &&
  ![
    'JPG, PNG',
    'Daykit',
    'INR',
    'USD',
    'GBP',
    'EUR',
    'X',
    'Y',
    'JPEG',
    'JPG',
    'PNG',
    'PDF',
    'HEIC',
    'WebP',
    'HEIF',
    'SSC',
    'UPSC',
    'NEET',
    'JEE Main',
    'IBPS',
    'SBI PO',
    'RRB',
    'KCET',
    'GATE',
    'en',
    'image/jpeg',
    'image/png',
    '__ARG0__',
  ].includes(text);
export function translate(source, strings) {
  const key = normalize(source);
  if (strings[key]) return strings[key];
  if (key.endsWith(' | Daykit')) return `${translate(key.slice(0, -9), strings)} | Daykit`;
  for (const [pattern, value] of Object.entries(strings)) {
    if (!pattern.includes('__ARG0__')) continue;
    const regex = pattern
      .split('__ARG0__')
      .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('(.+?)');
    const match = key.match(new RegExp(`^${regex}$`));
    if (match) return value.replaceAll('__ARG0__', match[1]);
  }
  return source;
}
