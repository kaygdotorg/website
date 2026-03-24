/**
 * =============================================================================
 * REHYPE VIDEO EMBEDS PLUGIN
 * =============================================================================
 *
 * Converts markdown image syntax with video extensions to proper <video>
 * elements.
 *
 * Markdown does not have native video syntax, so authors use image syntax:
 *   ![alt text](./video.mp4)
 *   ![alt text](video.mp4)
 *
 * This plugin transforms those <img> tags into <video> elements with controls
 * and rewrites local relative paths to the copied public asset URL. Supporting
 * both dot-relative and bare-relative forms keeps authored markdown compatible
 * with CommonMark and Obsidian.
 */

import { visit } from "unist-util-visit";
import {
  isResolvableRelativeHref,
  toPublicAssetUrl,
} from "../utils/content-paths.mjs";

const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|avi|mkv|m4v)$/i;

/**
 * Rehype plugin to convert video embeds from img to video elements.
 */
export default function rehypeVideoEmbeds() {
  return (tree, file) => {
    const filePath = file.history?.[0] || file.path || "";

    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "img") return;

      const src = node.properties?.src;
      if (!src || typeof src !== "string") return;
      if (!VIDEO_EXTENSIONS.test(src)) return;

      // Video files are served directly from public/, so relative authored
      // paths must be rewritten to that public URL shape here.
      const videoSrc = isResolvableRelativeHref(src)
        ? toPublicAssetUrl(src, filePath)
        : src;
      const alt = node.properties?.alt || "";

      const videoNode = {
        type: "element",
        tagName: "video",
        properties: {
          src: videoSrc,
          controls: true,
          preload: "metadata",
          class: "video-embed",
          title: alt,
        },
        children: [
          {
            type: "text",
            value: "Your browser does not support the video tag.",
          },
        ],
      };

      if (alt) {
        const figureNode = {
          type: "element",
          tagName: "figure",
          properties: { class: "video-figure" },
          children: [
            videoNode,
            {
              type: "element",
              tagName: "figcaption",
              properties: {},
              children: [{ type: "text", value: alt }],
            },
          ],
        };
        parent.children[index] = figureNode;
      } else {
        parent.children[index] = videoNode;
      }
    });
  };
}
