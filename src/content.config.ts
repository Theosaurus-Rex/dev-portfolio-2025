import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(), // Format: "YYYY/MM/DD"
    imageUrl: z.string().url(),
  }),
});

const talks = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    videoUrl: z.string().url(),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    description: z.string(),
    githubUrl: z.string().url(),
    liveUrl: z.string().url().optional(),
    imageSrc: z.string(),
  }),
});

export const collections = { blog, talks, projects };
