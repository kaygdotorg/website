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
 * Extract a short excerpt from markdown content.
 * Priority:
 * 1. Text after first H1 heading (if article starts with H1)
 * 2. First few lines of content
 * 
 * @param {string} content - Raw markdown content (without frontmatter)
 * @param {number} maxLength - Maximum length of excerpt
 */
function extractExcerpt(content, maxLength = 150) {
  // Remove frontmatter if present
  const withoutFrontmatter = content.replace(/^---[\s\S]*?---/, "").trim();
  
  // Check if content starts with an H1 heading
  const h1Match = withoutFrontmatter.match(/^#\s+.+\n+([\s\S]*)/);
  let textToProcess = h1Match ? h1Match[1] : withoutFrontmatter;
  
  // Clean markdown syntax
  const plainText = textToProcess
    .replace(/```[\s\S]*?```/g, "") // code blocks first
    .replace(/!\[.*?\]\(.*?\)/g, "") // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links - keep text
    .replace(/^#{1,6}\s+.*$/gm, "") // heading lines
    .replace(/[*_~`]/g, "") // emphasis markers
    .replace(/^>\s+/gm, "") // blockquotes
    .replace(/^\s*[-*+]\s+/gm, "") // list markers
    .replace(/^\s*\d+\.\s+/gm, "") // numbered list markers
    .replace(/\n+/g, " ") // collapse newlines
    .replace(/\s+/g, " ") // collapse whitespace
    .trim();

  if (!plainText) return null;
  if (plainText.length <= maxLength) return plainText;
  
  // Truncate at word boundary and add ellipsis
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
    
    // Use frontmatter description if available, otherwise extract from content
    let description = frontmatter.description;
    if (!description) {
      description = extractExcerpt(body);
    }
    
    return {
      slug,
      title: frontmatter.title || null,
      description,
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
