// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://theo-harris-dev.com',
  image: {
    domains: ['images.unsplash.com'], // Allow external blog post images
  },
  integrations: [sitemap()],
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
  prefetch: {
    defaultStrategy: 'hover',
    prefetchAll: true,
  },
});