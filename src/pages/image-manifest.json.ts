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
import { getCollection } from "astro:content";
import { getImage } from "astro:assets";

/**
 * Collections that may contain images in their frontmatter.
 * These are scanned to build the manifest.
 */
const COLLECTIONS_WITH_IMAGES = [
  "blog",
  "notes", 
  "talks",
  "now",
  "uses",
  "home",
  "photography",
] as const;

/**
 * Image extensions that should be optimized.
 * GIFs are excluded to preserve animation.
 * Note: In dev mode, imageMetadata.src includes query params, so we match before the ?
 */
const OPTIMIZABLE_EXTENSIONS = /\.(jpe?g|png|webp|avif|tiff?)(\?|$)/i;

/**
 * Extract the public URL path from an ImageMetadata src.
 * Astro's ImageMetadata.src contains the path like "/@fs/..." in dev
 * or "/_astro/..." in production. We need the original relative path
 * that was used in frontmatter to create the manifest mapping.
 *
 * Since we don't have direct access to the original path, we'll use
 * the collection structure to reconstruct it.
 */
function getPublicPath(collection: string, entryId: string, filename: string): string {
  // For blog entries, the path structure is /blog/[entry-id]/[filename]
  // The entry ID already has the date prefix stripped by generateId
  // But the original files use the full directory name with date prefix
  // 
  // We need to match what copy-content-assets.mjs produces in public/
  // which preserves the original directory structure
  return `/${collection}/${entryId}/${filename}`;
}

export const GET: APIRoute = async () => {
  const manifest: Record<string, string> = {};

  try {
    for (const collectionName of COLLECTIONS_WITH_IMAGES) {
      try {
        const entries = await getCollection(collectionName);

        for (const entry of entries) {
          const data = entry.data as Record<string, any>;

          // Check for cover-image field (common in blog, talks, notes)
          if (data["cover-image"]) {
            if (typeof data["cover-image"] === "string") continue;
            
            const imageMetadata = data["cover-image"];
            
            // Skip GIFs to preserve animation
            if (imageMetadata.format === "gif") continue;
            
            // Skip if not an optimizable format
            if (!OPTIMIZABLE_EXTENSIONS.test(imageMetadata.src)) continue;

            try {
              // Generate optimized version
              const optimized = await getImage({
                src: imageMetadata,
                format: "webp",
                quality: 80,
              });

              // The original path needs to match what the browser will request
              // when clicking a link like [text](./image.jpg)
              // This is tricky because we need to know the original filename
              // For now, we'll extract it from the ImageMetadata.src
              const srcPath = imageMetadata.src;
              
              // ImageMetadata.src in dev is like "/@fs/absolute/path/image.jpg"
              // In build it's the hashed path. We need the public URL.
              // The copy script creates /blog/entry-id/image.jpg
              // So we need to map that path to the optimized URL.
              
              // Extract filename from the metadata (strip query params)
              const rawFilename = srcPath.split("/").pop() || "";
              const filename = rawFilename.split("?")[0]; // Remove query params
              if (filename) {
                const publicPath = `/${collectionName}/${entry.id}/${filename}`;
                manifest[publicPath] = optimized.src;
              }
            } catch (e) {
              // Skip images that fail to optimize
              console.warn(`Failed to optimize image for ${entry.id}:`, e);
            }
          }

          // Check for profile-image (home collection)
          if (data["profile-image"] && typeof data["profile-image"] !== "string") {
            const imageMetadata = data["profile-image"];
            if (imageMetadata.format !== "gif" && OPTIMIZABLE_EXTENSIONS.test(imageMetadata.src)) {
              try {
                const optimized = await getImage({
                  src: imageMetadata,
                  format: "webp",
                  quality: 80,
                });
                const rawFilename = imageMetadata.src.split("/").pop() || "";
                const filename = rawFilename.split("?")[0];
                if (filename) {
                  const publicPath = `/${collectionName}/${entry.id}/${filename}`;
                  manifest[publicPath] = optimized.src;
                }
              } catch (e) {
                console.warn(`Failed to optimize profile-image for ${entry.id}:`, e);
              }
            }
          }

          // Check for card-photos array (home collection)
          if (Array.isArray(data["card-photos"])) {
            for (const card of data["card-photos"]) {
              if (card.src && typeof card.src !== "string") {
                const imageMetadata = card.src;
                if (imageMetadata.format !== "gif" && OPTIMIZABLE_EXTENSIONS.test(imageMetadata.src)) {
                  try {
                    const optimized = await getImage({
                      src: imageMetadata,
                      format: "webp",
                      quality: 80,
                    });
                    const rawFilename = imageMetadata.src.split("/").pop() || "";
                    const filename = rawFilename.split("?")[0];
                    if (filename) {
                      const publicPath = `/${collectionName}/${entry.id}/${filename}`;
                      manifest[publicPath] = optimized.src;
                    }
                  } catch (e) {
                    console.warn(`Failed to optimize card-photo:`, e);
                  }
                }
              }
            }
          }

          // Check for bento-cards array (home collection)
          if (Array.isArray(data["bento-cards"])) {
            for (const card of data["bento-cards"]) {
              if (card.image && typeof card.image !== "string") {
                const imageMetadata = card.image;
                if (imageMetadata.format !== "gif" && OPTIMIZABLE_EXTENSIONS.test(imageMetadata.src)) {
                  try {
                    const optimized = await getImage({
                      src: imageMetadata,
                      format: "webp",
                      quality: 80,
                    });
                    const rawFilename = imageMetadata.src.split("/").pop() || "";
                    const filename = rawFilename.split("?")[0];
                    if (filename) {
                      const publicPath = `/${collectionName}/${entry.id}/${filename}`;
                      manifest[publicPath] = optimized.src;
                    }
                  } catch (e) {
                    console.warn(`Failed to optimize bento-card image:`, e);
                  }
                }
              }
            }
          }
        }
      } catch (e) {
        // Collection might not exist, skip it
        console.warn(`Skipping collection ${collectionName}:`, e);
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
