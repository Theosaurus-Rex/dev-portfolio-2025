import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(), // Format: "YYYY/MM/DD"
    imageUrl: z.string().url(),
  }),
});

const talks = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/talks' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    videoUrl: z.string().url(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    githubUrl: z.string().url(),
    liveUrl: z.string().url().optional(),
    imageSrc: z.string(),
  }),
});

export const collections = { blog, talks, projects };
