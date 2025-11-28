// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://theo-harris-dev.com',
  image: {
    domains: ['images.unsplash.com'], // Allow external blog post images
  },
  markdown: {
    shikiConfig: {
      theme: 'dracula',
    },
  },
  integrations: [sitemap()],
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
  },
  prefetch: {
    defaultStrategy: 'hover',
    prefetchAll: true,
  },
});