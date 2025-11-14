#!/usr/bin/env tsx
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "src/content");
const OUTPUT_FILE = path.join(process.cwd(), "unsplash-ids.json");

async function run() {
  const files = await fs.promises.readdir(CONTENT_DIR);

  const ids: string[] = [];

  for (const file of files) {
    if (!file.endsWith(".md") && !file.endsWith(".mdx")) continue;

    const fullPath = path.join(CONTENT_DIR, file);
    const raw = await fs.promises.readFile(fullPath, "utf8");

    const { data } = matter(raw);

    if (typeof data.unsplashId === "string") {
      ids.push(data.unsplashId);
    }
  }

  await fs.promises.writeFile(
    OUTPUT_FILE,
    JSON.stringify(ids, null, 2),
    "utf8"
  );

  console.log(`Extracted ${ids.length} IDs → ${OUTPUT_FILE}`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
