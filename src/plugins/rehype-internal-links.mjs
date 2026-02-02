/**
 * =============================================================================
 * REHYPE INTERNAL LINKS PLUGIN
 * =============================================================================
 *
 * Adds data attributes for the internal link preview feature:
 * - data-internal-link="true" for CSS styling and JS targeting
 * - data-link-path for manifest lookup
 *
 * NOTE: .md link transformation is handled by remark-md-links.mjs
 */

import { visit } from "unist-util-visit";

// Asset extensions to exclude
const ASSET_EXTENSIONS = /\.(jpe?g|png|gif|webp|svg|avif|heic|bmp|tiff?|mp4|webm|mov|avi|mkv|m4v|pdf|docx?|xlsx?|pptx?|txt|md|csv|rtf|mp3|wav|flac|ogg|m4a|aac)$/i;

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
      
      const href = node.properties?.href;
      if (!href || typeof href !== "string") return;
      
      // Add data attributes for internal link preview feature
      const { isInternal, path } = parseInternalLink(href);
      
      if (isInternal && path) {
        node.properties["data-internal-link"] = "true";
        node.properties["data-link-path"] = path;
      }
    });
  };
}
