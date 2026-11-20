import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const notes = defineCollection({
    loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/" }),
    schema: z.object({
        unsplashId: z.string().optional(),
    }),
});

export const collections = {
    'notes': notes,
};
