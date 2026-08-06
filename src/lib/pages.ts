import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n/config';

export type PageContent = CollectionEntry<'pages'>;

export async function getPage(pageKey: string, locale: Locale): Promise<PageContent> {
  const entries = await getCollection('pages', ({ data }) => data.pageKey === pageKey && data.lang === locale);
  if (entries.length !== 1) throw new Error(`Expected exactly one ${locale} ${pageKey} page, found ${entries.length}.`);
  return entries[0];
}
