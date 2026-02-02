/**
 * =============================================================================
 * REHYPE IMAGE ORIGINALS PLUGIN
 * =============================================================================
 *
 * Adds data-original-src attribute to embedded images so the lightbox can
 * access the full-resolution original image instead of the Astro-optimized
 * WebP version.
 *
 * Astro optimizes embedded markdown images to WebP format. While this is
 * great for page load performance, the lightbox should show the original
 * high-quality image when zoomed in.
 *
 * This plugin:
 * 1. Detects <img> tags with Astro-optimized src (containing /_astro/ or /@fs/)
 * 2. Extracts the original filename from the src path
 * 3. Uses the page's collection and slug to construct the public path
 * 4. Adds data-original-src pointing to the original in public/
 *
 * The lightbox JS should use data-original-src when available for zoom view.
 */

import { visit } from "unist-util-visit";

/**
 * Extract the original filename from an Astro-optimized image path.
 * 
 * In dev mode: /@fs/Users/.../workspace.jpg?origWidth=...
 * In build mode: /_astro/workspace.D8f3kL2.webp
 * 
 * We need to extract "workspace" (or "workspace.jpg") from these.
 */
function extractOriginalFilename(src) {
  if (!src) return null;
  
  // Get the last path segment
  const lastSegment = src.split("/").pop() || "";
  
  // Remove query params
  const withoutQuery = lastSegment.split("?")[0];
  
  // For Astro build output like "workspace.D8f3kL2.webp", extract base name
  // Pattern: name.hash.ext where hash is alphanumeric
  const astroHashMatch = withoutQuery.match(/^(.+)\.[\w-]+\.(webp|avif|png|jpg|jpeg)$/i);
  if (astroHashMatch) {
    return astroHashMatch[1]; // Return just the base name without extension
  }
  
  // For dev mode paths, just return the filename without extension
  const extMatch = withoutQuery.match(/^(.+)\.(jpg|jpeg|png|gif|webp|avif|heic|bmp|tiff?)$/i);
  if (extMatch) {
    return extMatch[1]; // Return just the base name
  }
  
  return withoutQuery;
}

import fs from "fs";

/**
 * Strip date prefix from a string (YYYYMMDD-).
 */
function stripDatePrefix(name) {
  return name.replace(/^\d{8}-/, '');
}

/**
 * Extract slug from frontmatter by reading the raw file.
 * Returns explicit slug if present, otherwise null.
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
 * Rehype plugin to add data-original-src to embedded images.
 * 
 * Reads frontmatter to get the proper slug for constructing public paths.
 */
export default function rehypeImageOriginals() {
  return (tree, file) => {
    // Get file path to extract collection info
    const filePath = file.history?.[0] || "";
    
    // Extract collection and filename from file path
    // Path looks like: .../src/content/uses/20240402-uses.md
    const contentMatch = filePath.match(/src\/content\/([^/]+)\/([^/]+)\.md$/);
    if (!contentMatch) return; // Not a content collection file
    
    const [, collection, filename] = contentMatch;
    
    // Get slug from frontmatter (read raw file) or derive from filename
    const explicitSlug = extractSlugFromFile(filePath);
    const slug = explicitSlug || stripDatePrefix(filename);
    
    visit(tree, "element", (node) => {
      // Only process <img> tags
      if (node.tagName !== "img") return;
      
      const src = node.properties?.src;
      if (!src || typeof src !== "string") return;
      
      // Check if this is an Astro-optimized image
      const isAstroOptimized = src.includes("/_astro/") || src.includes("/@fs/");
      if (!isAstroOptimized) return;
      
      // Extract the original filename
      const baseName = extractOriginalFilename(src);
      if (!baseName) return;
      
      // Try to find the original extension from the src path
      // In dev mode, the original extension is preserved
      let originalExt = "jpg"; // Default fallback
      
      // Check for original extension in query params (dev mode)
      const origFormatMatch = src.match(/origFormat=(\w+)/);
      if (origFormatMatch) {
        const format = origFormatMatch[1];
        // Map format names to extensions
        const formatToExt = { jpg: "jpg", jpeg: "jpg", png: "png", gif: "gif", webp: "webp" };
        originalExt = formatToExt[format] || format;
      } else {
        // Try to extract from the path itself (dev mode shows original path)
        const pathExtMatch = src.match(/\.(\w+)\?/);
        if (pathExtMatch) {
          originalExt = pathExtMatch[1];
        }
      }
      
      // Construct the public path to the original
      // Format: /collection/slug/filename.ext
      const originalPath = `/${collection}/${slug}/${baseName}.${originalExt}`;
      
      // Add the data attribute
      node.properties["data-original-src"] = originalPath;
      node.properties["data-lightbox"] = "true";
    });
  };
}
