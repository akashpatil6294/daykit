import { en } from './en';
export const defaultLocale = 'en' as const;
export const dictionaries = { en };
export type Locale = keyof typeof dictionaries;
export function translations(locale: Locale = defaultLocale) {
  return dictionaries[locale];
}
