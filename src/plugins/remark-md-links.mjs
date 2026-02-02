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
 * Normalize a potentially-relative path into its path segments.
 *
 * Notes:
 * - Keeps leading `..` segments (so we can detect cross-collection patterns)
 * - Strips a single leading `./`
 */
function getPathSegments(href) {
  const cleaned = href.startsWith("./") ? href.slice(2) : href;
  return cleaned.split("/").filter(Boolean);
}

/**
 * Transforms a .md link to the correct URL.
 * - Strips date prefix (YYYYMMDD-) and .md extension
 * - Converts any collection-targeting link to an absolute path (/notes/...)
 *   to avoid incorrect resolution under directory-style URLs (e.g. /blog/post/)
 */
function transformMdLink(href) {
  if (!href || !href.endsWith(".md")) return href;
  
  // Skip external URLs
  if (href.startsWith("http://") || href.startsWith("https://")) return href;

  // If link is already absolute, keep it absolute; only rewrite the filename.
  const isAbsolute = href.startsWith("/");
  const hrefForParsing = isAbsolute ? href.slice(1) : href;

  // Get the filename part
  const lastSlash = hrefForParsing.lastIndexOf("/");
  const dirPart = lastSlash >= 0 ? hrefForParsing.substring(0, lastSlash + 1) : "";
  const filename = lastSlash >= 0 ? hrefForParsing.substring(lastSlash + 1) : hrefForParsing;
  
  // Remove .md extension
  let slug = filename.replace(/\.md$/, "");
  
  // Strip date prefix if present (YYYYMMDD-)
  const dateMatch = slug.match(/^\d{8}-(.+)$/);
  if (dateMatch) {
    slug = dateMatch[1];
  }

  // Determine if the link is targeting a known collection folder.
  // This covers:
  // - ../notes/20240713-x.md
  // - ../../notes/20240713-x.md
  // - notes/20240713-x.md
  // - ./notes/20240713-x.md
  const segments = getPathSegments(hrefForParsing);
  const nonDotSegments = segments.filter((s) => s !== "..");
  const potentialCollection = nonDotSegments[0] ?? null;

  if (potentialCollection && COLLECTIONS.includes(potentialCollection)) {
    return `/${potentialCollection}/${slug}`;
  }

  // Same-folder / same-collection relative link: keep relative form.
  // Re-apply absolute prefix if it was absolute originally.
  const rebuilt = dirPart + slug;
  return isAbsolute ? `/${rebuilt}` : rebuilt;
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