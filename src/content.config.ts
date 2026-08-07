import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Content paths are the source of truth for entry identity and locale.
const markdownEntryId = ({ entry }: { entry: string }) => entry.replace(/\.(?:md|mdx)$/, '');

const posts = defineCollection({
  loader: glob({
    base: './src/content/posts',
    pattern: '*/*/*/{en,zh}.{md,mdx}',
    generateId: markdownEntryId,
  }),
  schema: z.object({
    title: z.string(),
    publishedAt: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  // Project directory names are unique entity keys; zh.md and en.md are localized variants.
  loader: glob({ base: './src/content/projects', pattern: '*/{en,zh}.{md,mdx}', generateId: markdownEntryId }),
  schema: ({ image }) => z.object({
    name: z.string(),
    href: z.string().url(),
    stack: z.array(z.string()).default([]),
    status: z.string().nullish(),
    image: image().optional(),
    order: z.number().int().default(0),
    draft: z.boolean().default(false),
  }),
});

const pages = defineCollection({
  // Page copy is exactly src/content/<page-key>/{en,zh}.md.
  loader: glob({
    base: './src/content',
    pattern: '*/{en,zh}.{md,mdx}',
    generateId: markdownEntryId,
  }),
  schema: z.object({
    title: z.string().default(''),
    heroTitle: z.string().default(''),
    kicker: z.string().default(''),
    lead: z.string().default(''),
    recentKicker: z.string().default(''),
    recentTitle: z.string().default(''),
    projectsKicker: z.string().default(''),
    projectsTitle: z.string().default(''),
    emptyState: z.string().default(''),
    searchPlaceholder: z.string().default(''),
    searchAria: z.string().default(''),
    searchNoMatch: z.string().default(''),
    searchShortcut: z.string().default('/'),
  }),
});

export const collections = { posts, projects, pages };
