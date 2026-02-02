/**
 * =============================================================================
 * REHYPE VIDEO EMBEDS PLUGIN
 * =============================================================================
 *
 * Converts markdown image syntax with video extensions to proper <video> elements.
 * 
 * Markdown doesn't have native video syntax, so authors use image syntax:
 *   ![alt text](./video.mp4)
 * 
 * This plugin transforms those <img> tags into <video> elements with controls.
 * 
 * Also transforms relative paths to use slug-based public paths, matching
 * the copy-content-assets.mjs output structure.
 */

import { visit } from "unist-util-visit";
import path from "path";
import fs from "fs";

const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|avi|mkv|m4v)$/i;

/**
 * Strip date prefix from a string (YYYYMMDD-).
 */
function stripDatePrefix(name) {
  return name.replace(/^\d{8}-/, '');
}

/**
 * Extract slug from frontmatter by reading the raw file.
 */
function extractSlugFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) return null;
    
    const frontmatter = frontmatterMatch[1];
    const slugMatch = frontmatter.match(/^slug:\s*(.+)$/m);
    if (!slugMatch) return null;
    
    let slug = slugMatch[1].trim();
    slug = slug.replace(/^["']|["']$/g, '');
    
    return slug;
  } catch {
    return null;
  }
}

/**
 * Transform a relative video path to the public URL path.
 */
function transformVideoPath(src, collection, slug) {
  if (!src.startsWith("./")) return src;
  
  const filename = path.basename(src);
  return `/${collection}/${slug}/${filename}`;
}

/**
 * Rehype plugin to convert video embeds from img to video elements.
 */
export default function rehypeVideoEmbeds() {
  return (tree, file) => {
    const filePath = file.history?.[0] || "";
    
    // Extract collection and filename from file path
    const contentMatch = filePath.match(/src\/content\/([^/]+)\/([^/]+)\.md$/);
    if (!contentMatch) return;
    
    const [, collection, filename] = contentMatch;
    const explicitSlug = extractSlugFromFile(filePath);
    const slug = explicitSlug || stripDatePrefix(filename);

    visit(tree, "element", (node, index, parent) => {
      // Only process <img> tags
      if (node.tagName !== "img") return;

      const src = node.properties?.src;
      if (!src || typeof src !== "string") return;

      // Check if this is a video file
      if (!VIDEO_EXTENSIONS.test(src)) return;

      // Transform the path
      const videoSrc = transformVideoPath(src, collection, slug);
      const alt = node.properties?.alt || "";

      // Create video element with controls
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
            value: `Your browser does not support the video tag.`,
          },
        ],
      };

      // Create figure wrapper with caption if alt text exists
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
