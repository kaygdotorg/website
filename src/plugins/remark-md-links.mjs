/**
 * =============================================================================
 * REMARK MD LINKS PLUGIN
 * =============================================================================
 *
 * Transforms relative .md links to correct URL slugs at the remark (markdown AST)
 * level, before conversion to HTML.
 *
 * Example: [text](./20240713-file.md) → [text](./file)
 *
 * This runs earlier in the pipeline than rehype plugins, ensuring the
 * transformation happens before any other processing.
 */

import { visit } from "unist-util-visit";

// Known content collections for cross-collection link detection
const COLLECTIONS = ["blog", "notes", "uses", "now", "talks", "changelog", "about", "contact", "homelab", "photography"];

/**
 * Transforms a .md link to the correct URL.
 * - Strips date prefix (YYYYMMDD-) and .md extension
 * - Converts cross-collection links (../notes/...) to absolute paths (/notes/...)
 */
function transformMdLink(href) {
  if (!href || !href.endsWith(".md")) return href;
  
  // Skip external URLs
  if (href.startsWith("http://") || href.startsWith("https://")) return href;
  
  // Get the filename part
  const lastSlash = href.lastIndexOf("/");
  const dirPart = lastSlash >= 0 ? href.substring(0, lastSlash + 1) : "";
  const filename = lastSlash >= 0 ? href.substring(lastSlash + 1) : href;
  
  // Remove .md extension
  let slug = filename.replace(/\.md$/, "");
  
  // Strip date prefix if present (YYYYMMDD-)
  const dateMatch = slug.match(/^\d{8}-(.+)$/);
  if (dateMatch) {
    slug = dateMatch[1];
  }
  
  // Check for cross-collection links (e.g., ../notes/file.md)
  // These need to be converted to absolute paths because relative paths
  // don't work correctly with directory-style URLs (/blog/post/ vs /blog/post)
  if (dirPart.startsWith("../") || dirPart.startsWith("..\\")) {
    // Extract collection name from path like "../notes/" or "../../notes/"
    const parts = dirPart.split("/").filter(p => p && p !== "..");
    if (parts.length > 0) {
      const potentialCollection = parts[0];
      if (COLLECTIONS.includes(potentialCollection)) {
        // Convert to absolute path: /collection/slug
        return `/${potentialCollection}/${slug}`;
      }
    }
  }
  
  return dirPart + slug;
}

/**
 * Remark plugin to transform .md links
 */
export default function remarkMdLinks() {
  return (tree) => {
    visit(tree, "link", (node) => {
      if (node.url && node.url.endsWith(".md")) {
        node.url = transformMdLink(node.url);
      }
    });
  };
}
