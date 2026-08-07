import type { Locale } from '../i18n/config';

const POST_ID_PATTERN = /^(\d{4})\/(0[1-9]|1[0-2])\/([a-z0-9]+(?:-[a-z0-9]+)*)\/(zh|en)$/;
const LOCALIZED_ENTITY_ID_PATTERN = /^([a-z0-9]+(?:-[a-z0-9]+)*)\/(zh|en)$/;

export interface PostIdParts {
  year: number;
  yearSegment: string;
  month: number;
  monthSegment: string;
  slug: string;
  locale: Locale;
  stem: string;
}

export function parsePostId(id: string): PostIdParts {
  const match = POST_ID_PATTERN.exec(id);
  if (!match) throw new Error(`Invalid post id "${id}". Expected YYYY/MM/slug/{zh,en}.`);

  const [, yearSegment, monthSegment, slug, locale] = match;
  return {
    year: Number(yearSegment),
    yearSegment,
    month: Number(monthSegment),
    monthSegment,
    slug,
    locale: locale as Locale,
    stem: `${yearSegment}/${monthSegment}/${slug}`,
  };
}

export function parseProjectId(id: string) {
  const match = LOCALIZED_ENTITY_ID_PATTERN.exec(id);
  if (!match) throw new Error(`Invalid project id "${id}". Expected project-key/{zh,en}.`);

  return { key: match[1], locale: match[2] as Locale };
}
