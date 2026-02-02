/**
 * =============================================================================
 * REHYPE ASSET LINKS PLUGIN
 * =============================================================================
 *
 * Transforms relative asset links in markdown to work correctly with Astro's
 * content collections. When markdown contains links like:
 *   [Sony WH-1000XM5](<./20240402-uses/sony-wh1000xm5.jpg>)
 *
 * Astro renders this as an <a> tag, but the relative path doesn't resolve
 * correctly because the page URL differs from the source file location.
 *
 * This plugin:
 * 1. Detects <a> tags with relative asset hrefs (images, videos, documents)
 * 2. Adds data attributes for asset type detection (used by CSS for icons)
 * 3. For image links, adds a data-image-src attribute so JS can open them
 *    in the lightbox instead of navigating
 *
 * SUPPORTED ASSET TYPES:
 * - Images: jpg, jpeg, png, gif, webp, svg, avif, heic
 * - Videos: mp4, webm, mov, avi, mkv
 * - Documents: pdf, doc, docx, xls, xlsx, ppt, pptx, txt, md
 * - Audio: mp3, wav, flac, ogg, m4a
 */

import { visit } from "unist-util-visit";

// Asset type detection patterns
const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|svg|avif|heic|bmp|tiff?)$/i;
const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|avi|mkv|m4v)$/i;
const DOCUMENT_EXTENSIONS = /\.(pdf|docx?|xlsx?|pptx?|txt|md|csv|rtf)$/i;
const AUDIO_EXTENSIONS = /\.(mp3|wav|flac|ogg|m4a|aac)$/i;

/**
 * Determines the asset type from a URL/path
 * @param {string} href - The href to check
 * @returns {string|null} - Asset type or null if not an asset
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
 * Checks if href is a local path (relative or absolute, but not external)
 * @param {string} href - The href to check
 * @returns {boolean}
 */
function isLocalPath(href) {
  if (!href) return false;
  // Skip external URLs, anchors, mailto, tel, etc.
  if (href.startsWith("http://") || href.startsWith("https://")) return false;
  if (href.startsWith("#")) return false;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  if (href.includes("://")) return false;
  // Accept both relative (./) and absolute (/) local paths
  return true;
}

/**
 * Rehype plugin to transform asset links
 */
export default function rehypeAssetLinks() {
  return (tree, file) => {
    // Get the file's directory path from Astro's file data
    // This helps us understand where the markdown file is located
    const filePath = file.history?.[0] || "";

    visit(tree, "element", (node) => {
      // Only process <a> tags
      if (node.tagName !== "a") return;

      const href = node.properties?.href;
      if (!href || typeof href !== "string") return;

      // Check if this is a local asset link (not external)
      if (!isLocalPath(href)) return;

      const assetType = getAssetType(href);
      if (!assetType) return;

      // Add data attribute for CSS styling (per-asset-type icons)
      node.properties["data-asset-type"] = assetType;

      // For images, add data-image-src so the lightbox JS can intercept clicks
      if (assetType === "image") {
        // Store the original href for the lightbox to use
        // The JS will need to resolve this relative path
        node.properties["data-image-src"] = href;
        node.properties["data-lightbox"] = "true";
      }

      // Mark as internal asset link for CSS styling
      node.properties["data-internal-asset"] = "true";
    });
  };
}
