/**
 * =============================================================================
 * REHYPE ASSET LINKS PLUGIN
 * =============================================================================
 *
 * Transforms local asset links in markdown to work correctly with Astro's
 * content collections. When markdown contains links like:
 *   [Sony WH-1000XM5](<./20240402-uses/sony-wh1000xm5.jpg>)
 *   [Sony WH-1000XM5](20240402-uses/sony-wh1000xm5.jpg)
 *
 * Astro renders these as <a> tags, but the relative path does not resolve
 * correctly from the final page URL because the page lives at
 * /collection/slug while the source markdown lives in src/content/.
 *
 * This plugin:
 * 1. Detects <a> tags with local asset hrefs (images, videos, documents, audio)
 * 2. Rewrites relative asset paths to the copied public asset URL
 * 3. Adds data attributes used by CSS and the lightbox behavior
 *
 * Asset URLs intentionally follow the same flattened structure as
 * copy-content-assets.mjs:
 *   src/content/blog/post/images/foo.png -> /blog/post-slug/foo.png
 */

import { visit } from "unist-util-visit";
import {
  isResolvableRelativeHref,
  toPublicAssetUrl,
} from "../utils/content-paths.mjs";

// Asset type detection patterns
const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|svg|avif|heic|bmp|tiff?)$/i;
const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|avi|mkv|m4v)$/i;
// .md is intentionally excluded here because markdown entry links are routed
// pages in this site, not downloadable document assets.
const DOCUMENT_EXTENSIONS = /\.(pdf|docx?|xlsx?|pptx?|txt|csv|rtf|bttpreset)$/i;
const AUDIO_EXTENSIONS = /\.(mp3|wav|flac|ogg|m4a|aac)$/i;

/**
 * Determine the asset type from an href so downstream CSS can style different
 * media links distinctly.
 */
function getAssetType(href) {
  if (!href) return null;
  if (IMAGE_EXTENSIONS.test(href)) return "image";
  if (VIDEO_EXTENSIONS.test(href)) return "video";
  if (DOCUMENT_EXTENSIONS.test(href)) return "document";
  if (AUDIO_EXTENSIONS.test(href)) return "audio";
  return null;
}

/**
 * Local paths include both:
 * - relative content-authored paths (./file.png, file.png, ../other/file.pdf)
 * - already-public absolute paths (/resume.pdf)
 *
 * External URLs and non-navigation schemes are excluded.
 */
function isLocalPath(href) {
  if (!href) return false;
  if (href.startsWith("http://") || href.startsWith("https://")) return false;
  if (href.startsWith("#")) return false;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  if (href.includes("://")) return false;
  return true;
}

/**
 * Rehype plugin to normalize asset links after markdown has been converted to
 * HTML. This only touches anchor tags; embedded media is handled by the other
 * dedicated rehype plugins.
 */
export default function rehypeAssetLinks() {
  return (tree, file) => {
    const filePath = file.history?.[0] || file.path || "";

    visit(tree, "element", (node) => {
      if (node.tagName !== "a") return;

      const href = node.properties?.href;
      if (!href || typeof href !== "string") return;
      if (!isLocalPath(href)) return;

      const assetType = getAssetType(href);
      if (!assetType) return;

      // Only source-relative asset paths need rewriting. Public-root paths such
      // as /resume.pdf are already valid and must remain untouched.
      const publicHref = isResolvableRelativeHref(href)
        ? toPublicAssetUrl(href, filePath)
        : href;

      node.properties.href = publicHref;
      node.properties["data-asset-type"] = assetType;

      if (assetType === "image") {
        node.properties["data-image-src"] = publicHref;
        node.properties["data-lightbox"] = "true";
        node.properties["data-astro-prefetch"] = "false";
      }

      node.properties["data-internal-asset"] = "true";
    });
  };
}
