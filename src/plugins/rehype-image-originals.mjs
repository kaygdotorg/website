/**
 * =============================================================================
 * REHYPE IMAGE ORIGINALS PLUGIN
 * =============================================================================
 *
 * Adds data-original-src to embedded markdown images so the lightbox can open
 * the copied original asset instead of Astro's optimized output.
 *
 * Astro optimizes embedded markdown images, which is good for page load
 * performance, but the lightbox should still know where the unoptimized source
 * image lives in public/.
 *
 * This plugin:
 * 1. Detects local embedded images before Astro's image optimization runs
 * 2. Accepts both "./image.png" and "image.png" authored forms
 * 3. Adds data-original-src matching the copied public asset URL
 * 4. Wraps images with alt text in figure/figcaption for captions
 */

import { visit } from "unist-util-visit";
import {
  getContentFileContext,
  isResolvableRelativeHref,
  toPublicAssetUrl,
} from "../utils/content-paths.mjs";

/**
 * Rehype plugin to add data-original-src to embedded images and wrap them in
 * semantic figure markup when a caption is available.
 */
export default function rehypeImageOriginals() {
  return (tree, file) => {
    const filePath = file.history?.[0] || file.path || "";
    const context = getContentFileContext(filePath);
    if (!context) return;

    const replacements = [];

    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "img") return;

      const src = node.properties?.src;
      if (!src || typeof src !== "string") return;

      // Rehype runs before Astro rewrites markdown images, so relative authored
      // paths are still visible here and can be mapped to the copied original.
      if (!isResolvableRelativeHref(src)) return;

      // Video syntax is handled by rehype-video-embeds, not the image lightbox.
      if (/\.(mp4|webm|mov|avi|mkv|m4v)$/i.test(src)) return;

      node.properties["data-original-src"] = toPublicAssetUrl(src, filePath);
      node.properties["data-lightbox"] = "true";

      const alt = node.properties?.alt;
      if (alt && parent && typeof index === "number") {
        replacements.push({ parent, index, node, alt });
      }
    });

    for (let i = replacements.length - 1; i >= 0; i--) {
      const { parent, index, node, alt } = replacements[i];
      parent.children[index] = {
        type: "element",
        tagName: "figure",
        properties: { class: "image-figure" },
        children: [
          node,
          {
            type: "element",
            tagName: "figcaption",
            properties: {},
            children: [{ type: "text", value: alt }],
          },
        ],
      };
    }
  };
}
