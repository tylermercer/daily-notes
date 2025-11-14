import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const notes = defineCollection({
    loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/" }),
    schema: z.object({
        unsplashId: z.string().optional(),
    }),
});

export const collections = {
    'notes': notes,
};
