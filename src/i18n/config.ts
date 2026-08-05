export const locales = ['zh', 'en'] as const;
export const defaultLocale = 'zh' as const;
export type Locale = (typeof locales)[number];

export const localeMeta: Record<Locale, { intl: string; prefix: string; htmlLang: string }> = {
  zh: { intl: 'zh-CN', prefix: '', htmlLang: 'zh-CN' },
  en: { intl: 'en-US', prefix: '/en', htmlLang: 'en' },
};
