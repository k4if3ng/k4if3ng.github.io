import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import type { Locale } from '../i18n/config';
import { parseProjectId } from './content-paths';

type Project = CollectionEntry<'projects'>;

export async function getProjects(locale: Locale) {
  const projects = await getCollection('projects');
  const groups = new Map<string, Partial<Record<Locale, Project>>>();

  for (const project of projects) {
    const path = parseProjectId(project.id);
    const variants = groups.get(path.key) ?? {};
    if (variants[path.locale]) throw new Error(`Duplicate ${path.locale} project "${path.key}".`);
    variants[path.locale] = project;
    groups.set(path.key, variants);
  }

  return projects
    .filter(project => !project.data.draft && parseProjectId(project.id).locale === locale)
    .sort((a, b) => a.data.order - b.data.order || a.id.localeCompare(b.id));
}

/** Build a readable project summary from the first prose paragraph in its Markdown body. */
export function getProjectExcerpt(project: Project, limit = 180) {
  const source = (project.body ?? '')
    .replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  const paragraph = source
    .split(/\n\s*\n/)
    .map(block => block.trim())
    .find(block => block && !/^(?:#{1,6}\s|>|[-*+]\s|\d+[.)]\s|\| |<|!\[)/.test(block)) ?? '';

  const plain = paragraph
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[*_~=`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return plain.length > limit ? `${plain.slice(0, limit).trimEnd()}…` : plain;
}
