import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// File paths, rather than frontmatter slugs, identify entries inside a collection.
// This lets zh.md and en.md share one public slug while remaining distinct entries.
const markdownEntryId = ({ entry }: { entry: string }) => entry.replace(/\.(?:md|mdx)$/, '');

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}', generateId: markdownEntryId }),
  schema: z.object({
    title: z.string(),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    lang: z.enum(['zh', 'en']).default('zh'),
    translationKey: z.string().optional(),
    draft: z.boolean().default(false),
    legacyPath: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}', generateId: markdownEntryId }),
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
  loader: glob({ base: './src/content/pages', pattern: '**/*.{md,mdx}', generateId: markdownEntryId }),
  schema: z.object({
    pageKey: z.string(),
    lang: z.enum(['zh', 'en']),
    title: z.string(),
    description: z.string(),
  }),
});

export const collections = { posts, projects, pages };
