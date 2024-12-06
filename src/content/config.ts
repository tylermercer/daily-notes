import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const notes = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./notes" }),
    schema: z.object({
    }),
});

export const collections = {
    'notes': notes,
};