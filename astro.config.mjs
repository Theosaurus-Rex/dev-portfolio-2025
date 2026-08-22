// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';

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
  integrations: [sitemap(), mdx()],
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      assetsInlineLimit: 0,
    },
  },
  prefetch: {
    defaultStrategy: 'hover',
    prefetchAll: true,
  },
});