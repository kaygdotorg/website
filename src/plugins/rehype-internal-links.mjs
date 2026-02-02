/**
 * =============================================================================
 * REHYPE INTERNAL LINKS PLUGIN
 * =============================================================================
 *
 * 1. Transforms .md links to correct URL slugs:
 *    - Strips date prefix (YYYYMMDD-) and .md extension
 *    - Converts cross-collection links to absolute paths
 *
 * 2. Adds data attributes for the internal link preview feature:
 *    - data-internal-link="true" for CSS styling and JS targeting
 *    - data-link-path for manifest lookup
 */

import { visit } from "unist-util-visit";

// Asset extensions to exclude (note: .md is handled specially, not excluded here)
const ASSET_EXTENSIONS = /\.(jpe?g|png|gif|webp|svg|avif|heic|bmp|tiff?|mp4|webm|mov|avi|mkv|m4v|pdf|docx?|xlsx?|pptx?|txt|csv|rtf|mp3|wav|flac|ogg|m4a|aac)$/i;

// Known content collections for cross-collection link detection
const COLLECTIONS = ["blog", "notes", "uses", "now", "talks", "changelog", "about", "contact", "homelab", "photography"];

/**
 * Transforms a .md link to the correct URL slug.
 * - Strips date prefix (YYYYMMDD-) and .md extension
 * - Converts cross-collection links (../notes/file.md) to absolute paths (/notes/file)
 *
 * @param {string} href - The original href value
 * @returns {string} - The transformed href
 */
function transformMdLink(href) {
  if (!href || !href.endsWith(".md")) return href;
  
  // Skip external URLs
  if (href.startsWith("http://") || href.startsWith("https://")) return href;

  // Parse the path to extract directory and filename
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

  // Check if link targets a known collection (handles ../notes/, ./notes/, notes/)
  // Strip leading ./ and ../ segments to find the first real directory name
  const cleanedPath = hrefForParsing.replace(/^(\.\.\/)+/, "").replace(/^\.\//, "");
  const firstDir = cleanedPath.split("/")[0];
  
  if (firstDir && COLLECTIONS.includes(firstDir)) {
    // Convert to absolute path to avoid incorrect relative resolution
    return `/${firstDir}/${slug}`;
  }

  // Same-folder relative link: keep relative form but with transformed slug
  const rebuilt = dirPart + slug;
  return isAbsolute ? `/${rebuilt}` : rebuilt;
}

// Site domains to treat as internal
const SITE_DOMAINS = ["kayg.org", "www.kayg.org", "localhost"];

// Content prefixes for internal page detection
const CONTENT_PREFIXES = ["/blog", "/uses", "/changelog", "/now", "/about", "/notes"];

/**
 * Checks if href is an internal page link (not asset, not external)
 * @param {string} href - The href to check
 * @returns {{ isInternal: boolean, path: string | null }}
 */
function parseInternalLink(href) {
  if (!href) return { isInternal: false, path: null };
  
  // Skip anchors, mailto, tel
  if (href.startsWith("#")) return { isInternal: false, path: null };
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return { isInternal: false, path: null };
  
  // Skip asset files
  if (ASSET_EXTENSIONS.test(href)) return { isInternal: false, path: null };
  
  let path = null;
  
  // Handle absolute URLs to same site
  if (href.startsWith("http://") || href.startsWith("https://")) {
    try {
      const url = new URL(href);
      const hostname = url.hostname.toLowerCase();
      
      if (SITE_DOMAINS.some(domain => hostname === domain || hostname.endsWith("." + domain))) {
        path = url.pathname;
      } else {
        return { isInternal: false, path: null };
      }
    } catch {
      return { isInternal: false, path: null };
    }
  } else if (href.startsWith("/")) {
    // Absolute path
    path = href;
  } else if (!href.includes("://")) {
    // Relative path - these could be internal page links
    // We can't determine the full path without knowing the source file location
    // So we'll just mark them as potentially internal
    return { isInternal: false, path: null };
  }
  
  if (!path) return { isInternal: false, path: null };
  
  // Normalize path: remove trailing slash, remove hash/query
  path = path.split("#")[0].split("?")[0];
  if (path.endsWith("/") && path.length > 1) {
    path = path.slice(0, -1);
  }
  
  // Must point to a content page (not root, not static assets)
  const isContentPage = CONTENT_PREFIXES.some(prefix => path.startsWith(prefix));
  
  return { isInternal: isContentPage, path: isContentPage ? path : null };
}

/**
 * Rehype plugin to:
 * 1. Transform .md links to correct URL slugs (strips date prefix and .md extension)
 * 2. Mark internal page links for the preview feature
 */
export default function rehypeInternalLinks() {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "a") return;
      
      let href = node.properties?.href;
      if (!href || typeof href !== "string") return;
      
      // Step 1: Transform .md links to URL slugs (backup for any missed by remark)
      if (href.endsWith(".md")) {
        href = transformMdLink(href);
        node.properties.href = href;
      }
      
      // Step 2: Add data attributes for internal link preview feature
      const { isInternal, path } = parseInternalLink(href);
      
      if (isInternal && path) {
        node.properties["data-internal-link"] = "true";
        node.properties["data-link-path"] = path;
      }
    });
  };
}
