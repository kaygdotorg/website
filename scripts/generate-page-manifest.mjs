/**
 * generate-page-manifest.mjs
 * 
 * Generates a JSON manifest of all content pages with their metadata.
 * Used by the internal link preview feature to show page previews on hover
 * without fetching each page individually.
 * 
 * Output: public/page-manifest.json
 */

import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

// Content collections to process
const COLLECTIONS = ["blog", "notes", "talks", "uses", "changelog", "now", "about", "home"];

// Map collection folders to URL paths
const COLLECTION_URL_MAP = {
  blog: "/blog",
  notes: "/notes",
  talks: "/talks",
  uses: "/uses", 
  changelog: "/changelog",
  now: "/now",
  about: "/about",
  home: "",
};

/**
 * Extract a short excerpt from markdown content
 */
function extractExcerpt(content, maxLength = 160) {
  // Remove frontmatter
  const withoutFrontmatter = content.replace(/^---[\s\S]*?---/, "").trim();
  
  // Remove markdown syntax
  const plainText = withoutFrontmatter
    .replace(/!\[.*?\]\(.*?\)/g, "") // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
    .replace(/#{1,6}\s+/g, "") // headings
    .replace(/[*_~`]/g, "") // emphasis
    .replace(/>\s+/g, "") // blockquotes
    .replace(/```[\s\S]*?```/g, "") // code blocks
    .replace(/`[^`]+`/g, "") // inline code
    .replace(/\n+/g, " ") // newlines
    .trim();

  if (plainText.length <= maxLength) return plainText;
  return plainText.slice(0, maxLength).replace(/\s+\S*$/, "") + "…";
}

/**
 * Get URL slug from filename
 */
function getSlugFromFilename(filename, collection) {
  // Remove extension
  const base = filename.replace(/\.mdx?$/, "");
  
  // Handle index files
  if (base === "index") {
    return COLLECTION_URL_MAP[collection] || `/${collection}`;
  }
  
  // Extract date and slug from filename patterns like:
  // 20240402-uses.md -> uses (slug only, date stripped)
  // 20240713-x-forwarded-for.md -> x-forwarded-for
  const dateMatch = base.match(/^\d{8}-(.+)$/);
  if (dateMatch) {
    const slug = dateMatch[1];
    const baseUrl = COLLECTION_URL_MAP[collection] || `/${collection}`;
    return `${baseUrl}/${slug}`;
  }
  
  // Default: use filename as slug
  const baseUrl = COLLECTION_URL_MAP[collection] || `/${collection}`;
  return `${baseUrl}/${base}`;
}

/**
 * Process a single markdown file
 */
async function processFile(filePath, collection) {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const { data: frontmatter, content: body } = matter(content);
    
    const filename = path.basename(filePath);
    const slug = getSlugFromFilename(filename, collection);
    
    return {
      slug,
      title: frontmatter.title || null,
      description: frontmatter.description || extractExcerpt(body),
      date: frontmatter.date || frontmatter.pubDate || null,
      collection,
    };
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err.message);
    return null;
  }
}

/**
 * Process all content collections
 */
async function generateManifest() {
  console.log("📄 Generating page manifest...\n");
  
  const manifest = {};
  let totalPages = 0;
  
  for (const collection of COLLECTIONS) {
    const collectionPath = path.join(ROOT, "src/content", collection);
    
    try {
      const entries = await fs.readdir(collectionPath, { withFileTypes: true });
      
      for (const entry of entries) {
        let filePath;
        
        if (entry.isDirectory()) {
          // Look for index.md or index.mdx in subdirectory
          const indexMd = path.join(collectionPath, entry.name, "index.md");
          const indexMdx = path.join(collectionPath, entry.name, "index.mdx");
          
          try {
            await fs.access(indexMd);
            filePath = indexMd;
          } catch {
            try {
              await fs.access(indexMdx);
              filePath = indexMdx;
            } catch {
              continue;
            }
          }
        } else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
          filePath = path.join(collectionPath, entry.name);
        } else {
          continue;
        }
        
        const pageData = await processFile(filePath, collection);
        if (pageData && pageData.slug) {
          manifest[pageData.slug] = pageData;
          totalPages++;
        }
      }
    } catch (err) {
      // Collection doesn't exist, skip
      if (err.code !== "ENOENT") {
        console.error(`Error reading ${collection}:`, err.message);
      }
    }
  }
  
  // Write manifest
  const outputPath = path.join(ROOT, "public/page-manifest.json");
  await fs.writeFile(outputPath, JSON.stringify(manifest, null, 2));
  
  console.log(`✅ Generated manifest with ${totalPages} pages`);
  console.log(`   Output: ${outputPath}\n`);
}

generateManifest().catch(console.error);
