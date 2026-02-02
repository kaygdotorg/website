/**
 * =============================================================================
 * IMAGE MANIFEST ENDPOINT
 * =============================================================================
 *
 * Generates a JSON manifest mapping original asset paths to their optimized URLs.
 * Used by the hover preview feature to load optimized thumbnails instead of
 * full-resolution originals.
 *
 * FLOW:
 * -----
 * 1. Scans all content collections for frontmatter images
 * 2. For each local image (ImageMetadata), generates optimized URL via getImage()
 * 3. Returns mapping: { "/blog/post/image.jpg": "/_astro/image.hash.webp" }
 *
 * USAGE:
 * ------
 * The hover preview JS fetches this manifest and uses it to resolve image URLs:
 *   const manifest = await fetch("/image-manifest.json").then(r => r.json());
 *   const optimizedUrl = manifest[pathname] || originalHref;
 *
 * WHY THIS EXISTS:
 * ----------------
 * - Astro optimizes images in templates via <Image /> component
 * - But <a href="./image.jpg"> links don't go through optimization
 * - The hover preview needs to load optimized versions for fast thumbnails
 * - This manifest provides the mapping from original paths to optimized URLs
 *
 * NOTE: GIFs are excluded from the manifest since they should use originals
 * to preserve animation.
 *
 * @see /src/layouts/BaseLayout.astro - initImagePreview() uses this manifest
 * @see /scripts/copy-content-assets.mjs - copies originals for lightbox access
 */

import type { APIRoute } from "astro";
import { getImage } from "astro:assets";
import { IMAGE_QUALITY } from "../config/images";

/**
 * Image extensions that should be optimized.
 * GIFs are excluded to preserve animation.
 */
const OPTIMIZABLE_EXTENSIONS = /\.(jpe?g|png|webp|avif|tiff?)$/i;

/**
 * Import all images from content directories using Vite's glob import.
 */
const contentImages = import.meta.glob<{ default: ImageMetadata }>(
  "/src/content/**/*.{jpg,jpeg,png,webp,avif,tiff}",
  { eager: true }
);

/**
 * Import all markdown files to read their frontmatter for slugs.
 */
const contentMarkdown = import.meta.glob<string>(
  "/src/content/**/*.md",
  { eager: true, query: "?raw", import: "default" }
);

/**
 * Strip date prefix from a string (YYYYMMDD-).
 */
function stripDatePrefix(name: string): string {
  return name.replace(/^\d{8}-/, '');
}

/**
 * Extract slug from markdown frontmatter content.
 * Returns explicit slug if present, otherwise null.
 */
function extractSlugFromFrontmatter(content: string): string | null {
  // Simple frontmatter parsing - find slug field
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return null;
  
  const frontmatter = frontmatterMatch[1];
  const slugMatch = frontmatter.match(/^slug:\s*(.+)$/m);
  if (!slugMatch) return null;
  
  let slug = slugMatch[1].trim();
  // Remove quotes if present
  slug = slug.replace(/^["']|["']$/g, '');
  
  // Handle date format (YAML may parse as date string)
  return slug;
}

/**
 * Build a map from directory names to their proper slugs.
 * This reads frontmatter from all markdown files to get explicit slugs.
 */
function buildSlugMap(): Map<string, string> {
  const slugMap = new Map<string, string>();
  
  for (const [mdPath, content] of Object.entries(contentMarkdown)) {
    // Extract collection and filename from path
    // Path: /src/content/{collection}/{filename}.md
    const match = mdPath.match(/\/src\/content\/([^/]+)\/([^/]+)\.md$/);
    if (!match) continue;
    
    const [, collection, filename] = match;
    
    // Try to get explicit slug from frontmatter
    const explicitSlug = extractSlugFromFrontmatter(content);
    
    // Determine the slug (explicit or derived)
    const slug = explicitSlug || stripDatePrefix(filename);
    
    // Map the directory key to the slug
    // Key format: collection/filename (without .md)
    slugMap.set(`${collection}/${filename}`, slug);
  }
  
  return slugMap;
}

/**
 * Convert a glob import path to the public URL path.
 * Uses the slug map to get proper slugs from frontmatter.
 */
function globPathToPublicPath(globPath: string, slugMap: Map<string, string>): string | null {
  // Match: /src/content/{collection}/{dirname}/{filename}
  const match = globPath.match(/\/src\/content\/([^/]+)\/([^/]+)\/([^/]+)$/);
  if (!match) return null;
  
  const [, collection, dirname, filename] = match;
  
  // Look up the slug for this entry
  const mapKey = `${collection}/${dirname}`;
  const slug = slugMap.get(mapKey) || stripDatePrefix(dirname);
  
  return `/${collection}/${slug}/${filename}`;
}

export const GET: APIRoute = async () => {
  const manifest: Record<string, string> = {};

  try {
    // Build slug map from frontmatter
    const slugMap = buildSlugMap();
    
    // Process all images from content directories
    for (const [globPath, imageModule] of Object.entries(contentImages)) {
      const imageMetadata = imageModule.default;
      
      // Skip if not optimizable
      if (!OPTIMIZABLE_EXTENSIONS.test(globPath)) continue;
      
      // Get the public path for this image using the slug map
      const publicPath = globPathToPublicPath(globPath, slugMap);
      if (!publicPath) continue;
      
      try {
        // Generate optimized version
        const optimized = await getImage({
          src: imageMetadata,
          format: "webp",
          quality: IMAGE_QUALITY,
        });
        
        manifest[publicPath] = optimized.src;
      } catch (e) {
        // Skip images that fail to optimize
        console.warn(`Failed to optimize ${globPath}:`, e);
      }
    }
  } catch (e) {
    console.error("Error generating image manifest:", e);
  }

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: {
      "Content-Type": "application/json",
      // Cache for 1 hour in production, no cache in dev
      "Cache-Control": import.meta.env.PROD 
        ? "public, max-age=3600" 
        : "no-cache",
    },
  });
};
