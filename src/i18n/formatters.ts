import { localeMeta, type Locale } from './ui';

export function formatDate(date: Date, locale: Locale, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(localeMeta[locale].intl, options).format(date);
}
