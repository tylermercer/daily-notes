import { Glob } from "bun";
import path from "node:path";

// 1. Define the directory to process
const targetDir = "./src/content-demo/"; 

const glob = new Glob("**/*.md");

console.log(`Scanning for files in: ${targetDir}...`);

let processedCount = 0;

for await (const file of glob.scan(targetDir)) {
  const filePath = path.join(targetDir, file);
  const content = await Bun.file(filePath).text();

  /**
   * Regex Breakdown:
   * ^---       -> Start with triple dashes
   * [\s\S]+?   -> Match any character (including newlines) non-greedily
   * ---        -> Until the closing triple dashes
   * \s* -> Consume any trailing whitespace/newlines
   */
  const frontmatterRegex = /^---[\s\S]+?---\s*/;
  
  if (frontmatterRegex.test(content)) {
    const cleanedContent = content.replace(frontmatterRegex, "");
    await Bun.write(filePath, cleanedContent);
    console.log(`✅ Removed frontmatter from: ${file}`);
    processedCount++;
  } else {
    console.log(`# No frontmatter found in: ${file}`);
  }
}

console.log(`\nDone! Processed ${processedCount} files.`);