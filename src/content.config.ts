import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// File paths, rather than frontmatter slugs, identify entries inside a collection.
// This lets zh.md and en.md share one public slug while remaining distinct entries.
const markdownEntryId = ({ entry }: { entry: string }) => entry.replace(/\.(?:md|mdx)$/, '');

const posts = defineCollection({
  loader: glob({
    base: './src/content/posts',
    pattern: ['**/*.{md,mdx}', '!{en,zh}.{md,mdx}'],
    generateId: markdownEntryId,
  }),
  schema: z.object({
    title: z.string(),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    lang: z.enum(['zh', 'en']).default('zh'),
    translationKey: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  // The direct en.md/zh.md files are page copy for /projects/; project entities live in child directories.
  loader: glob({ base: './src/content/projects', pattern: ['**/*.{md,mdx}', '!{en,zh}.md'], generateId: markdownEntryId }),
  schema: ({ image }) => z.object({
    name: z.string(),
    lang: z.enum(['zh', 'en']),
    translationKey: z.string(),
    description: z.string(),
    href: z.string().url(),
    stack: z.array(z.string()).default([]),
    status: z.string(),
    image: image().optional(),
    order: z.number().int().default(0),
    draft: z.boolean().default(false),
  }),
});

const pages = defineCollection({
  // Page copy is identified by its path: src/content/<page-key>/{en,zh}.md.
  // Posts and project entities use their own schemas and are excluded here.
  loader: glob({
    base: './src/content',
    pattern: ['**/*.{md,mdx}', '!posts/*/*.{md,mdx}', '!projects/*/*.{md,mdx}'],
    generateId: markdownEntryId,
  }),
  schema: z.object({
    lang: z.enum(['zh', 'en']),
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
