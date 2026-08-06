import { defineConfig, passthroughImageService } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkExtensions from './src/markdown/remark-extensions.mjs';
import shikiToolbar from './src/markdown/shiki-toolbar.mjs';
import { defaultLocale, locales } from './src/i18n/config.ts';
import { site as siteConfig } from './src/config.ts';

export default defineConfig({
  // Used for canonical URLs, sitemap entries, RSS links, and locale alternates.
  // The domain itself has one source of truth in src/config.ts.
  site: siteConfig.url,
  integrations: [sitemap()],
  i18n: {
    locales: [...locales],
    defaultLocale,
    routing: { prefixDefaultLocale: false },
  },
  markdown: {
    smartypants: false,
    remarkPlugins: [remarkExtensions],
    shikiConfig: {
      // Keep syntax highlighting and the code toolbar in the same build pass,
      // so the complete block is present before the page is painted.
      themes: { light: 'github-light', dark: 'github-dark' },
      transformers: [shikiToolbar()],
    },
  },
  image: {
    // Content assets are emitted as-is; this keeps local and CI builds free of native Sharp dependencies.
    service: passthroughImageService(),
  },
});
