/**
 * =============================================================================
 * REHYPE INTERNAL LINKS PLUGIN
 * =============================================================================
 *
 * Detects internal page links in markdown and adds data attributes for the
 * link preview feature. An internal link is one that points to another page
 * on the same site (e.g., /blog/..., /uses/..., or kayg.org/...).
 *
 * This plugin:
 * 1. Detects <a> tags with internal page hrefs (not assets, not external)
 * 2. Adds data-internal-link attribute for CSS styling and JS targeting
 * 3. Adds data-link-path attribute with normalized path for manifest lookup
 */

import { visit } from "unist-util-visit";

// Asset extensions to exclude (these are handled by rehype-asset-links)
const ASSET_EXTENSIONS = /\.(jpe?g|png|gif|webp|svg|avif|heic|bmp|tiff?|mp4|webm|mov|avi|mkv|m4v|pdf|docx?|xlsx?|pptx?|txt|md|csv|rtf|mp3|wav|flac|ogg|m4a|aac)$/i;

// Site domains to treat as internal
const SITE_DOMAINS = ["kayg.org", "www.kayg.org", "localhost"];

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
    // Relative path - skip these for now as they're usually assets
    // Internal page links are typically absolute (/blog/...) or full URLs
    return { isInternal: false, path: null };
  }
  
  if (!path) return { isInternal: false, path: null };
  
  // Normalize path: remove trailing slash, remove hash/query
  path = path.split("#")[0].split("?")[0];
  if (path.endsWith("/") && path.length > 1) {
    path = path.slice(0, -1);
  }
  
  // Must point to a content page (not root, not static assets)
  const contentPrefixes = ["/blog", "/uses", "/changelog", "/now", "/about"];
  const isContentPage = contentPrefixes.some(prefix => path.startsWith(prefix));
  
  return { isInternal: isContentPage, path: isContentPage ? path : null };
}

/**
 * Rehype plugin to mark internal page links for preview feature
 */
export default function rehypeInternalLinks() {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "a") return;
      
      const href = node.properties?.href;
      if (!href || typeof href !== "string") return;
      
      const { isInternal, path } = parseInternalLink(href);
      
      if (isInternal && path) {
        node.properties["data-internal-link"] = "true";
        node.properties["data-link-path"] = path;
      }
    });
  };
}
