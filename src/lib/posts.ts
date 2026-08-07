import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import { localeMeta, type Locale } from '../i18n/config';
import { parsePostId } from './content-paths';

type Post = CollectionEntry<'posts'>;

function assertPostMetadata(post: Post) {
  const path = parsePostId(post.id);
  const publishedAt = post.data.publishedAt;
  if (publishedAt.getUTCFullYear() !== path.year || publishedAt.getUTCMonth() + 1 !== path.month) {
    throw new Error(`Post "${post.id}" path date must match publishedAt ${publishedAt.toISOString().slice(0, 10)}.`);
  }
  return path;
}

async function getValidatedPosts() {
  const posts = await getCollection('posts');
  const variants = new Map<string, Set<Locale>>();

  for (const post of posts) {
    const path = assertPostMetadata(post);
    const locales = variants.get(path.stem) ?? new Set<Locale>();
    if (locales.has(path.locale)) throw new Error(`Duplicate ${path.locale} post at "${path.stem}".`);
    locales.add(path.locale);
    variants.set(path.stem, locales);
  }

  return posts;
}

export function getPostLocale(post: Post) {
  return parsePostId(post.id).locale;
}

export function getPostPath(post: Post) {
  const { yearSegment, monthSegment, slug, locale } = assertPostMetadata(post);
  return `${localeMeta[locale].prefix}/posts/${yearSegment}/${monthSegment}/${slug}/`;
}

export async function getPosts(locale: Locale) {
  const posts = await getValidatedPosts();
  return posts
    .filter(post => !post.data.draft && getPostLocale(post) === locale)
    .sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf() || a.id.localeCompare(b.id));
}

export async function getPostTranslations(post: Post) {
  const { stem } = assertPostMetadata(post);
  const posts = await getValidatedPosts();
  const translations: Partial<Record<Locale, Post>> = {};

  for (const entry of posts) {
    const path = parsePostId(entry.id);
    if (entry.data.draft || path.stem !== stem) continue;
    translations[path.locale] = entry;
  }

  return translations;
}

export async function getPostStaticPaths(locale: Locale) {
  const posts = await getPosts(locale);
  const paths = posts.map(getPostPath);
  if (new Set(paths).size !== paths.length) throw new Error(`Duplicate ${locale} post URL.`);

  return posts.map((post, index) => {
    const { yearSegment, monthSegment, slug } = parsePostId(post.id);
    return {
      params: { id: `${yearSegment}/${monthSegment}/${slug}` },
      props: { post, older: posts[index + 1], newer: posts[index - 1] },
    };
  });
}

/** Build one consistent list/SEO/RSS excerpt from the first prose paragraph. */
export function getPostExcerpt(post: Post, limit = 112) {
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
