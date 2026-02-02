/**
 * =============================================================================
 * COPY CONTENT ASSETS TO PUBLIC (Reference-Based Discovery)
 * =============================================================================
 *
 * Scans markdown files in src/content/ to discover referenced assets and copies
 * them to public/ for direct URL access. This is necessary because:
 *
 * 1. Astro optimizes embedded images (![](./img.jpg)) to /_astro/ URLs
 * 2. But linked assets (<a href="./file.ext">) need to exist at predictable URLs
 * 3. Lightbox feature loads full-res originals from these copied files
 *
 * DISCOVERY METHOD:
 * -----------------
 * Instead of using an extension whitelist, this script scans markdown files for:
 * - Frontmatter values containing relative paths (./path/to/file.ext)
 * - Markdown links: [text](./path/to/file.ext)
 * - Markdown embeds: ![alt](./path/to/file.ext)
 *
 * This approach:
 * - Automatically handles ANY file format (.bttpreset, .cr3, etc.)
 * - Only copies files that are actually referenced
 * - Reduces public/ clutter from unused assets
 *
 * OUTPUT STRUCTURE:
 * -----------------
 * src/content/blog/20240101-my-post/image.jpg
 *   → public/blog/my-post/image.jpg
 *   → accessible at /blog/my-post/image.jpg
 *
 * @see /src/pages/image-manifest.json.ts - maps paths to optimized URLs for hover
 * @see /src/layouts/BaseLayout.astro - initImageZoom() uses originals for lightbox
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, '../src/content');
const PUBLIC_DIR = path.join(__dirname, '../public');

// Collections to scan for referenced assets
const COLLECTIONS = ['home', 'uses', 'blog', 'notes', 'talks', 'now', 'photography', 'homelab', 'about', 'changelog'];

let copiedCount = 0;
let skippedCount = 0;
let discoveredAssets = new Set();

/**
 * Extract relative paths from a value (string, array, or object).
 * Looks for paths starting with ./ which indicate local assets.
 */
function extractRelativePaths(value, paths = new Set()) {
  if (typeof value === 'string') {
    // Match relative paths like ./image.jpg or ./folder/file.ext
    if (value.startsWith('./') && !value.endsWith('.md')) {
      paths.add(value);
    }
  } else if (Array.isArray(value)) {
    value.forEach(item => extractRelativePaths(item, paths));
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach(v => extractRelativePaths(v, paths));
  }
  return paths;
}

/**
 * Extract asset references from markdown body.
 * Finds both links [text](./path) and embeds ![alt](./path).
 */
function extractMarkdownAssets(content) {
  const paths = new Set();
  
  // Match markdown links and embeds: [text](./path) or ![alt](./path)
  // Also handles angle bracket syntax: [text](<./path with spaces>)
  const linkRegex = /!?\[([^\]]*)\]\(<?([^)>\s]+)>?\)/g;
  let match;
  
  while ((match = linkRegex.exec(content)) !== null) {
    const href = match[2];
    // Only capture relative paths that aren't markdown files
    if (href.startsWith('./') && !href.endsWith('.md')) {
      paths.add(href);
    }
  }
  
  return paths;
}

/**
 * Strip date prefix from entry ID/slug.
 * Matches the generateId function in content.config.ts.
 */
function stripDatePrefix(name) {
  return name.replace(/^\d{8}-/, '');
}

/**
 * Get the public URL path for an asset.
 * Handles the date prefix stripping to match how URLs are generated.
 */
function getPublicPath(collection, mdFilePath, relativePath) {
  // Get the directory containing the markdown file
  const mdDir = path.dirname(mdFilePath);
  
  // Resolve the relative path from the markdown file's directory
  const absoluteAssetPath = path.resolve(mdDir, relativePath);
  
  // Get the path relative to the collection directory
  const collectionDir = path.join(CONTENT_DIR, collection);
  const relativeToCollection = path.relative(collectionDir, absoluteAssetPath);
  
  // For the public URL, we need to handle the entry slug (with date stripped)
  // If the asset is in a dated directory, strip the date from the directory name
  const parts = relativeToCollection.split(path.sep);
  if (parts.length > 0 && /^\d{8}-/.test(parts[0])) {
    parts[0] = stripDatePrefix(parts[0]);
  }
  
  return path.join(collection, ...parts);
}

/**
 * Process a single markdown file to discover referenced assets.
 */
async function processMarkdownFile(mdFilePath, collection) {
  try {
    const content = await fs.readFile(mdFilePath, 'utf-8');
    const { data: frontmatter, content: body } = matter(content);
    
    // Extract paths from frontmatter
    const frontmatterPaths = extractRelativePaths(frontmatter);
    
    // Extract paths from markdown body
    const bodyPaths = extractMarkdownAssets(body);
    
    // Combine all paths
    const allPaths = new Set([...frontmatterPaths, ...bodyPaths]);
    
    // For each relative path, resolve to absolute and add to discovered assets
    for (const relativePath of allPaths) {
      const mdDir = path.dirname(mdFilePath);
      const absoluteAssetPath = path.resolve(mdDir, relativePath);
      
      // Verify the file exists
      try {
        await fs.access(absoluteAssetPath);
        
        // Calculate the public destination path
        const publicPath = getPublicPath(collection, mdFilePath, relativePath);
        
        discoveredAssets.add({
          src: absoluteAssetPath,
          dest: path.join(PUBLIC_DIR, publicPath),
          publicPath
        });
      } catch {
        // Asset doesn't exist, skip it
        console.warn(`⚠️  Referenced asset not found: ${relativePath} (in ${path.basename(mdFilePath)})`);
      }
    }
  } catch (error) {
    console.error(`❌ Error processing ${mdFilePath}:`, error.message);
  }
}

/**
 * Recursively find all markdown files in a directory.
 */
async function findMarkdownFiles(dir, files = []) {
  try {
    const items = await fs.readdir(dir, { withFileTypes: true });
    
    for (const item of items) {
      if (item.name.startsWith('.')) continue;
      
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        await findMarkdownFiles(fullPath, files);
      } else if (item.isFile() && item.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(`❌ Error scanning ${dir}:`, error.message);
    }
  }
  
  return files;
}

/**
 * Copy a single asset file if needed.
 */
async function copyAsset(asset) {
  try {
    // Check if destination already exists and is up to date
    try {
      const [srcStat, destStat] = await Promise.all([
        fs.stat(asset.src),
        fs.stat(asset.dest)
      ]);
      
      // Skip if destination is newer or same age
      if (destStat.mtime >= srcStat.mtime) {
        skippedCount++;
        return;
      }
    } catch {
      // Destination doesn't exist, will copy
    }
    
    // Ensure destination directory exists
    await fs.mkdir(path.dirname(asset.dest), { recursive: true });
    
    // Copy the file
    await fs.copyFile(asset.src, asset.dest);
    copiedCount++;
    console.log(`📦 Copied: ${asset.publicPath}`);
  } catch (error) {
    console.error(`❌ Error copying ${asset.publicPath}:`, error.message);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('� Discovering referenced assets in markdown files...\n');
  
  // Phase 1: Discover all referenced assets
  for (const collection of COLLECTIONS) {
    const collectionDir = path.join(CONTENT_DIR, collection);
    
    try {
      await fs.access(collectionDir);
      const mdFiles = await findMarkdownFiles(collectionDir);
      
      for (const mdFile of mdFiles) {
        await processMarkdownFile(mdFile, collection);
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error(`❌ Error with collection ${collection}:`, error.message);
      }
    }
  }
  
  console.log(`\n📋 Found ${discoveredAssets.size} referenced assets\n`);
  
  // Phase 2: Copy all discovered assets
  console.log('📦 Copying assets to public/...\n');
  
  for (const asset of discoveredAssets) {
    await copyAsset(asset);
  }
  
  console.log(`\n✅ Done! Copied ${copiedCount} files, skipped ${skippedCount} up-to-date files.`);
}

main().catch(console.error);
