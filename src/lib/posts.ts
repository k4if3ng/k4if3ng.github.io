import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import type { Locale } from '../i18n/ui';

export function getPostSlug(post: CollectionEntry<'posts'>) {
  // Preserve existing URLs created with legacy -zh/-en suffixes.
  const slug = post.data.slug;
  return slug.replace(/-(?:zh|en)$/, '');
}

export function getPostPath(post: CollectionEntry<'posts'>) {
  const year = post.data.publishedAt.getFullYear();
  const month = String(post.data.publishedAt.getMonth() + 1).padStart(2, '0');
  const prefix = post.data.lang === 'en' ? '/en' : '';
  return `${prefix}/posts/${year}/${month}/${getPostSlug(post)}/`;
}

export async function getPosts(locale: Locale) {
  const posts = await getCollection('posts', ({ data }) => !data.draft && data.lang === locale);
  return posts.sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf() || a.id.localeCompare(b.id));
}

export async function getPostTranslations(post: CollectionEntry<'posts'>) {
  if (!post.data.translationKey) return { [post.data.lang]: post } as Partial<Record<Locale, CollectionEntry<'posts'>>>;
  const matches = await getCollection('posts', ({ data }) => !data.draft && data.translationKey === post.data.translationKey);
  const translations: Partial<Record<Locale, CollectionEntry<'posts'>>> = {};
  for (const entry of matches) {
    if (translations[entry.data.lang]) throw new Error(`Duplicate ${entry.data.lang} post translationKey: ${entry.data.translationKey}`);
    translations[entry.data.lang] = entry;
  }
  return translations;
}

export async function getPostStaticPaths(locale: Locale) {
  const posts = await getPosts(locale);
  const paths = posts.map(getPostPath);
  if (new Set(paths).size !== paths.length) throw new Error(`Duplicate ${locale} post URL. Use a unique slug for posts published in the same month.`);
  const routePrefix = locale === 'en' ? '/en/posts/' : '/posts/';
  const canonical = posts.map((post, index) => ({
    params: { id: getPostPath(post).replace(routePrefix, '').replace(/\/$/, '') },
    props: { post, redirectTo: null, older: posts[index + 1], newer: posts[index - 1] },
  }));
  const aliases = posts.flatMap(post => {
    const legacySlug = post.data.legacyPath?.split('/').filter(Boolean).pop();
    return legacySlug && getPostPath(post) !== `${routePrefix}${legacySlug}/`
      ? [{ params: { id: legacySlug }, props: { post, redirectTo: getPostPath(post), older: undefined, newer: undefined } }]
      : [];
  });
  return [...canonical, ...aliases];
}

/** Build one consistent list/SEO/RSS excerpt from the first prose paragraph. */
export function getPostExcerpt(post: CollectionEntry<'posts'>, limit = 112) {
  const source = (post.body ?? '')
    .replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  const paragraph = source.split(/\n\s*\n/).map(block => block.trim()).find(block =>
    block &&
    !/^(?:#{1,6}\s|>|[-*+]\s|\d+[.)]\s|\| |<|!\[)/.test(block)
  ) ?? '';
  const plain = paragraph
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[*_~=`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > limit ? `${plain.slice(0, limit).trimEnd()}…` : plain;
}
