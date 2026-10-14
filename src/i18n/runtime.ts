/** English is rendered by Astro. The static localization pass inserts the matching
 * page dictionary before island hydration; no translation requests run in a browser. */
type Dictionary = Record<string, string>;
let cached: Dictionary | undefined;
const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();
function dictionary(): Dictionary {
  if (typeof document === 'undefined') return {};
  if (!cached) {
    try {
      cached = JSON.parse(document.getElementById('daykit-locale')?.textContent || '{}');
    } catch {
      cached = {};
    }
  }
  return cached!;
}
export function text(source: string): string {
  const key = normalize(source),
    translations = dictionary();
  const exact = translations[key];
  if (exact) return exact;
  for (const [pattern, value] of Object.entries(translations)) {
    if (!pattern.includes('__ARG0__')) continue;
    const escaped = pattern
      .split('__ARG0__')
      .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('(.+?)');
    const match = key.match(new RegExp(`^${escaped}$`));
    if (match) return value.replaceAll('__ARG0__', match[1]);
  }
  return source;
}
export function localize<T>(value: T): T {
  if (typeof window === 'undefined') return value;
  if (typeof value === 'string') return text(value) as T;
  if (typeof value === 'function') return ((...args: unknown[]) => localize(value(...args))) as T;
  if (Array.isArray(value)) return value.map(localize) as T;
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, localize(item)]),
    ) as T;
  return value;
}
export function localPath(path: string): string {
  const locale = typeof document !== 'undefined' ? document.documentElement.lang : 'en';
  return locale === 'en' ? path : `/${locale}${path}`;
}
