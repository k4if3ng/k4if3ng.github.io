import { getCollection } from 'astro:content';
import type { Locale } from '../i18n/ui';

export async function getProjects(locale: Locale) {
  const projects = await getCollection('projects', ({ data }) => !data.draft);
  const groups = new Map<string, Set<Locale>>();
  for (const project of projects) {
    const languages = groups.get(project.data.translationKey) ?? new Set<Locale>();
    if (languages.has(project.data.lang)) throw new Error(`Duplicate ${project.data.lang} project translationKey: ${project.data.translationKey}`);
    languages.add(project.data.lang);
    groups.set(project.data.translationKey, languages);
  }
  for (const [key, languages] of groups) {
    if (!languages.has('zh') || !languages.has('en')) throw new Error(`Project "${key}" must provide both zh and en content.`);
  }
  return projects.filter(project => project.data.lang === locale).sort((a, b) => a.data.order - b.data.order || a.id.localeCompare(b.id));
}
