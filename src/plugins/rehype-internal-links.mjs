/**
 * =============================================================================
 * REHYPE INTERNAL LINKS PLUGIN
 * =============================================================================
 *
 * Transforms and enhances internal page links in markdown:
 *
 * 1. TRANSFORMS relative .md links to correct URL format:
 *    - ./20240713-forwarded-ip-cloudflare.md → ./forwarded-ip-cloudflare
 *    - Strips date prefix (YYYYMMDD-) and .md extension
 *
 * 2. ADDS data attributes for the link preview feature:
 *    - data-internal-link="true" for CSS styling and JS targeting
 *    - data-link-path for manifest lookup
 */

import { visit } from "unist-util-visit";

// Asset extensions to exclude (but NOT .md - we handle those specially)
const ASSET_EXTENSIONS = /\.(jpe?g|png|gif|webp|svg|avif|heic|bmp|tiff?|mp4|webm|mov|avi|mkv|m4v|pdf|docx?|xlsx?|pptx?|txt|csv|rtf|mp3|wav|flac|ogg|m4a|aac)$/i;

// Site domains to treat as internal
const SITE_DOMAINS = ["kayg.org", "www.kayg.org", "localhost"];

// Content prefixes for internal page detection
const CONTENT_PREFIXES = ["/blog", "/uses", "/changelog", "/now", "/about", "/notes"];

/**
 * Transforms a .md filename to the correct URL slug.
 * Strips date prefix (YYYYMMDD-) and .md extension.
 * 
 * @param {string} filename - The .md filename (e.g., "20240713-forwarded-ip-cloudflare.md")
 * @returns {string} - The URL slug (e.g., "forwarded-ip-cloudflare")
 */
function mdFilenameToSlug(filename) {
  // Remove .md extension
  let slug = filename.replace(/\.md$/, "");
  
  // Strip date prefix if present (YYYYMMDD-)
  const dateMatch = slug.match(/^\d{8}-(.+)$/);
  if (dateMatch) {
    slug = dateMatch[1];
  }
  
  return slug;
}

/**
 * Checks if href is a relative .md link that needs transformation
 * @param {string} href - The href to check
 * @returns {{ needsTransform: boolean, newHref: string | null }}
 */
function checkMdLink(href) {
  if (!href) return { needsTransform: false, newHref: null };
  
  // Must end with .md and be a relative path
  if (!href.endsWith(".md")) return { needsTransform: false, newHref: null };
  
  // Skip external URLs
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return { needsTransform: false, newHref: null };
  }
  
  // Handle relative paths: ./filename.md or ../folder/filename.md
  const filename = href.split("/").pop();
  const slug = mdFilenameToSlug(filename);
  
  // Preserve the directory part of the path
  const dirPart = href.substring(0, href.lastIndexOf("/") + 1);
  const newHref = dirPart + slug;
  
  return { needsTransform: true, newHref };
}

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
      
      // STEP 1: Transform .md links to correct URL format
      const { needsTransform, newHref } = checkMdLink(href);
      if (needsTransform && newHref) {
        node.properties.href = newHref;
        href = newHref; // Use transformed href for further processing
      }
      
      // STEP 2: Add data attributes for internal link preview feature
      const { isInternal, path } = parseInternalLink(href);
      
      if (isInternal && path) {
        node.properties["data-internal-link"] = "true";
        node.properties["data-link-path"] = path;
      }
    });
  };
}
