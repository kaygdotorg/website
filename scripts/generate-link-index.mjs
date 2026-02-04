/**
 * =============================================================================
 * GENERATE LINK INDEX
 * =============================================================================
 *
 * Build-time script that extracts internal links from all markdown content
 * and generates:
 * 1. Backlinks index: Which pages link TO each page
 * 2. Graph data: Nodes and edges for local graph visualization
 *
 * Output: public/link-index.json
 *
 * This runs as part of the build pipeline alongside generate-page-manifest.mjs
 */

import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

// =============================================================================
// CONFIGURATION
// =============================================================================

// Content collections to process (all markdown collections)
const COLLECTIONS = ["blog", "notes", "talks", "uses", "now", "changelog", "about", "homelab"];

// Map collection folders to URL paths
const COLLECTION_URL_MAP = {
  blog: "/blog",
  notes: "/notes",
  talks: "/talks",
  uses: "/uses",
  now: "/now",
  changelog: "/changelog",
  about: "/about",
  homelab: "/homelab",
};

// Asset extensions to exclude from link extraction
const ASSET_EXTENSIONS = /\.(jpe?g|png|gif|webp|svg|avif|heic|bmp|tiff?|mp4|webm|mov|avi|mkv|m4v|pdf|docx?|xlsx?|pptx?|txt|csv|rtf|mp3|wav|flac|ogg|m4a|aac)$/i;

// =============================================================================
// LINK EXTRACTION
// =============================================================================

/**
 * Extract internal links from markdown content.
 * Finds all markdown links [text](url) and filters to internal content links.
 *
 * Excludes:
 * - External links (http://, https://)
 * - Asset links (images, videos, documents)
 * - Anchor-only links (#section)
 * - Tag links (/tags/...)
 * - mailto: and tel: links
 *
 * @param {string} content - Raw markdown content
 * @param {string} sourceCollection - The collection of the source file (for resolving relative links)
 * @returns {string[]} Array of internal link paths
 */
function extractInternalLinks(content, sourceCollection) {
  const links = [];

  // Match markdown links: [text](url)
  const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    let href = match[2].trim();

    // Handle angle bracket wrapped URLs: [text](<url>) -> url
    if (href.startsWith("<") && href.endsWith(">")) {
      href = href.slice(1, -1);
    }

    // Skip empty links
    if (!href) continue;

    // Skip external links
    if (href.startsWith("http://") || href.startsWith("https://")) continue;

    // Skip mailto and tel
    if (href.startsWith("mailto:") || href.startsWith("tel:")) continue;

    // Skip anchor-only links
    if (href.startsWith("#")) continue;

    // Skip asset files
    if (ASSET_EXTENSIONS.test(href)) continue;

    // Skip tag links
    if (href.startsWith("/tags/") || href.includes("/tags/")) continue;

    // Normalize the link with source collection context for relative paths
    const normalizedPath = normalizeLink(href, sourceCollection);
    if (normalizedPath) {
      links.push(normalizedPath);
    }
  }

  return [...new Set(links)]; // Deduplicate
}

/**
 * Normalize a link to a consistent URL path format.
 * Handles:
 * - Relative .md links (./file.md, ../notes/file.md)
 * - Date-prefixed filenames (20240713-slug.md -> slug)
 * - Absolute paths (/blog/post)
 *
 * @param {string} href - The original href
 * @param {string} sourceCollection - The collection of the source file
 * @returns {string|null} Normalized path or null if invalid
 */
function normalizeLink(href, sourceCollection) {
  // Remove anchor fragments
  let path = href.split("#")[0];
  if (!path) return null;

  // Handle .md links - strip extension and date prefix
  if (path.endsWith(".md")) {
    path = path.replace(/\.md$/, "");

    // Strip date prefix if present (YYYYMMDD-)
    const parts = path.split("/");
    const filename = parts[parts.length - 1];
    const dateMatch = filename.match(/^\d{8}-(.+)$/);
    if (dateMatch) {
      parts[parts.length - 1] = dateMatch[1];
      path = parts.join("/");
    }
  }

  // Handle relative paths pointing to other collections (../notes/file)
  if (path.startsWith("../")) {
    // Clean up relative prefixes
    const cleaned = path.replace(/^(\.\.\/)+/, "");
    const firstDir = cleaned.split("/")[0];

    // If it points to a known collection, make it absolute
    if (COLLECTION_URL_MAP[firstDir]) {
      const slug = cleaned.split("/").slice(1).join("/");
      return `${COLLECTION_URL_MAP[firstDir]}/${slug}`;
    }

    // Can't resolve - unknown collection
    return null;
  }

  // Handle same-directory relative paths (./file or just file.md after stripping)
  if (path.startsWith("./")) {
    const slug = path.slice(2); // Remove ./
    return `${COLLECTION_URL_MAP[sourceCollection]}/${slug}`;
  }

  // Already absolute
  if (path.startsWith("/")) {
    // Remove trailing slash
    if (path.endsWith("/") && path.length > 1) {
      path = path.slice(0, -1);
    }
    return path;
  }

  // Bare filename (no path) - assume same collection
  if (!path.includes("/") && sourceCollection) {
    return `${COLLECTION_URL_MAP[sourceCollection]}/${path}`;
  }

  // Can't determine path
  return null;
}

/**
 * Get URL slug from filename, with collection context for proper path resolution.
 *
 * @param {string} filename - The markdown filename
 * @param {string} collection - The collection name
 * @returns {string} Full URL path
 */
function getPathFromFilename(filename, collection) {
  const base = filename.replace(/\.mdx?$/, "");

  // Handle index files
  if (base === "index") {
    return COLLECTION_URL_MAP[collection] || `/${collection}`;
  }

  // Strip date prefix if present
  const dateMatch = base.match(/^\d{8}-(.+)$/);
  const slug = dateMatch ? dateMatch[1] : base;

  const baseUrl = COLLECTION_URL_MAP[collection] || `/${collection}`;
  return `${baseUrl}/${slug}`;
}

/**
 * Resolve a relative link from a source file's context.
 *
 * @param {string} href - The relative href
 * @param {string} sourceCollection - The source file's collection
 * @returns {string|null} Resolved absolute path
 */
function resolveRelativeLink(href, sourceCollection) {
  // Remove .md and date prefix
  let path = href.replace(/\.md$/, "");
  const parts = path.split("/");
  const filename = parts[parts.length - 1];
  const dateMatch = filename.match(/^\d{8}-(.+)$/);
  if (dateMatch) {
    parts[parts.length - 1] = dateMatch[1];
    path = parts.join("/");
  }

  // Handle same-directory links (./filename or just filename)
  if (path.startsWith("./")) {
    const slug = path.slice(2);
    return `${COLLECTION_URL_MAP[sourceCollection]}/${slug}`;
  }

  // Handle parent directory links (../collection/filename)
  if (path.startsWith("../")) {
    const cleaned = path.replace(/^(\.\.\/)+/, "");
    const firstDir = cleaned.split("/")[0];

    if (COLLECTION_URL_MAP[firstDir]) {
      const slug = cleaned.split("/").slice(1).join("/");
      return `${COLLECTION_URL_MAP[firstDir]}/${slug}`;
    }
  }

  // Bare filename - assume same collection
  if (!path.includes("/")) {
    return `${COLLECTION_URL_MAP[sourceCollection]}/${path}`;
  }

  return null;
}

// =============================================================================
// FILE PROCESSING
// =============================================================================

/**
 * Process a single markdown file and extract its metadata and outbound links.
 *
 * @param {string} filePath - Absolute path to the markdown file
 * @param {string} collection - Collection name
 * @returns {Object|null} File data with path, title, and links
 */
async function processFile(filePath, collection) {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const { data: frontmatter, content: body } = matter(content);

    // Skip drafts
    if (frontmatter.draft) return null;

    const filename = path.basename(filePath);
    const pagePath = getPathFromFilename(filename, collection);

    // Extract and resolve links from content (passing collection for relative path resolution)
    const links = extractInternalLinks(body, collection);

    return {
      path: pagePath,
      title: frontmatter.title || filename.replace(/\.mdx?$/, ""),
      collection,
      links,
    };
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err.message);
    return null;
  }
}

// =============================================================================
// INDEX GENERATION
// =============================================================================

/**
 * Generate the link index from all content files.
 */
async function generateLinkIndex() {
  console.log("🔗 Generating link index...\n");

  // Store all pages with their outbound links
  const pages = [];

  // Process each collection
  for (const collection of COLLECTIONS) {
    const collectionPath = path.join(ROOT, "src/content", collection);

    try {
      const entries = await fs.readdir(collectionPath, { withFileTypes: true });

      for (const entry of entries) {
        let filePath;

        if (entry.isDirectory()) {
          // Look for index.md in subdirectory
          const indexMd = path.join(collectionPath, entry.name, "index.md");
          try {
            await fs.access(indexMd);
            filePath = indexMd;
          } catch {
            continue;
          }
        } else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
          filePath = path.join(collectionPath, entry.name);
        } else {
          continue;
        }

        const pageData = await processFile(filePath, collection);
        if (pageData) {
          pages.push(pageData);
        }
      }
    } catch (err) {
      if (err.code !== "ENOENT") {
        console.error(`Error reading ${collection}:`, err.message);
      }
    }
  }

  // Build the backlinks index (inverted index)
  // For each page, find all pages that link TO it
  const backlinks = {};

  for (const page of pages) {
    for (const targetPath of page.links) {
      if (!backlinks[targetPath]) {
        backlinks[targetPath] = [];
      }

      // Add source page as a backlink
      backlinks[targetPath].push({
        source: page.path,
        title: page.title,
        collection: page.collection,
      });
    }
  }

  // Build graph data
  // Nodes: all pages
  // Links: all connections between pages
  const nodes = pages.map((page) => ({
    id: page.path,
    title: page.title,
    collection: page.collection,
  }));

  // Create a set of valid node IDs for filtering links
  const nodeIds = new Set(nodes.map((n) => n.id));

  // Build links array (only include links where both source and target exist)
  const links = [];
  for (const page of pages) {
    for (const targetPath of page.links) {
      // Only include if target is a known page
      if (nodeIds.has(targetPath)) {
        links.push({
          source: page.path,
          target: targetPath,
        });
      }
    }
  }

  // Create the final index
  const linkIndex = {
    // Backlinks: { targetPath: [{ source, title, collection }] }
    backlinks,

    // Graph data for visualization
    graph: {
      nodes,
      links,
    },

    // Metadata
    meta: {
      generatedAt: new Date().toISOString(),
      totalPages: pages.length,
      totalLinks: links.length,
    },
  };

  // Write to public directory
  const outputPath = path.join(ROOT, "public/link-index.json");
  await fs.writeFile(outputPath, JSON.stringify(linkIndex, null, 2));

  console.log(`✅ Generated link index:`);
  console.log(`   Pages: ${pages.length}`);
  console.log(`   Links: ${links.length}`);
  console.log(`   Backlink targets: ${Object.keys(backlinks).length}`);
  console.log(`   Output: ${outputPath}\n`);
}

// Run the script
generateLinkIndex().catch(console.error);
