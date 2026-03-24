/**
 * =============================================================================
 * REHYPE INTERNAL LINKS PLUGIN
 * =============================================================================
 *
 * 1. Transforms any remaining .md links to correct absolute routed URLs:
 *    - Resolves relative paths against the source markdown file
 *    - Respects frontmatter slug overrides on the target file
 *    - Produces /collection/slug URLs so browser-relative directory bugs
 *      cannot occur
 *
 * 2. Adds data attributes for the internal link preview feature:
 *    - data-internal-link="true" for CSS styling and JS targeting
 *    - data-link-path for manifest lookup
 *
 * Remark should already rewrite normal markdown links before this stage, but
 * this plugin keeps a backup transform for raw HTML anchors that bypass remark.
 */

import { visit } from "unist-util-visit";
import {
  CONTENT_COLLECTIONS,
  getContentFileContext,
  resolveMarkdownEntryUrl,
  splitUrlSuffix,
} from "../utils/content-paths.mjs";

// Asset extensions to exclude from internal-page detection.
const ASSET_EXTENSIONS = /\.(jpe?g|png|gif|webp|svg|avif|heic|bmp|tiff?|mp4|webm|mov|avi|mkv|m4v|pdf|docx?|xlsx?|pptx?|txt|csv|rtf|mp3|wav|flac|ogg|m4a|aac)$/i;

// Site domains to treat as internal when absolute URLs point back to this site.
const SITE_DOMAINS = ["kayg.org", "www.kayg.org", "localhost"];

// Content page prefixes that should activate hover previews.
const CONTENT_PREFIXES = CONTENT_COLLECTIONS
  .filter((collection) => collection !== "home")
  .map((collection) => `/${collection}`);

/**
 * Checks whether an href points to an internal content page rather than an
 * asset, external site, or non-page URL.
 */
function parseInternalLink(href) {
  if (!href) return { isInternal: false, path: null };
  if (href.startsWith("#")) return { isInternal: false, path: null };
  if (href.startsWith("mailto:") || href.startsWith("tel:")) {
    return { isInternal: false, path: null };
  }
  if (ASSET_EXTENSIONS.test(href)) return { isInternal: false, path: null };

  let path = null;

  if (href.startsWith("http://") || href.startsWith("https://")) {
    try {
      const url = new URL(href);
      const hostname = url.hostname.toLowerCase();
      if (SITE_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))) {
        path = url.pathname;
      } else {
        return { isInternal: false, path: null };
      }
    } catch {
      return { isInternal: false, path: null };
    }
  } else if (href.startsWith("/")) {
    path = href;
  } else {
    return { isInternal: false, path: null };
  }

  path = path.split("#")[0].split("?")[0];
  if (path.endsWith("/") && path.length > 1) {
    path = path.slice(0, -1);
  }

  const isContentPage = CONTENT_PREFIXES.some((prefix) => path.startsWith(prefix));
  return { isInternal: isContentPage, path: isContentPage ? path : null };
}

/**
 * Rehype plugin to normalize any remaining markdown file links and mark true
 * internal content-page links for the preview feature.
 */
export default function rehypeInternalLinks() {
  return (tree, file) => {
    const filePath = file?.history?.[0] || file?.path || file?.data?.astro?.filePath || "";
    const hasContentContext = Boolean(getContentFileContext(filePath));

    visit(tree, "element", (node) => {
      if (node.tagName !== "a") return;

      let href = node.properties?.href;
      if (!href || typeof href !== "string") return;

      // Raw HTML anchors can bypass remark, so keep the markdown-file rewrite
      // here as a backup.
      if (splitUrlSuffix(href).pathname.endsWith(".md")) {
        href = resolveMarkdownEntryUrl(href, filePath);
        node.properties.href = href;
      }

      // Only content-collection markdown files should emit preview metadata.
      if (!hasContentContext) return;

      const { isInternal, path } = parseInternalLink(href);
      if (isInternal && path) {
        node.properties["data-internal-link"] = "true";
        node.properties["data-link-path"] = path;
      }
    });
  };
}
