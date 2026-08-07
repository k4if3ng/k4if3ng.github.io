import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n/config';

export type PageContent = CollectionEntry<'pages'>;

export async function getPage(contentKey: string, locale: Locale): Promise<PageContent> {
  const entryId = `${contentKey}/${locale}`;
  const entries = await getCollection('pages', entry => entry.id === entryId);
  if (entries.length !== 1) throw new Error(`Expected exactly one ${locale} ${contentKey} page at ${entryId}, found ${entries.length}.`);
  return entries[0];
}
