/**
 * =============================================================================
 * COPY CONTENT ASSETS TO PUBLIC
 * =============================================================================
 *
 * Copies non-markdown assets from src/content/ to public/ so they can be
 * served directly at predictable URLs. This is necessary because:
 *
 * 1. Astro processes <img> tags through its image pipeline (/_astro/ URLs)
 * 2. But <a href="./image.jpg"> links don't go through the pipeline
 * 3. The browser tries to load the relative URL which doesn't exist
 *
 * This script mirrors the content asset structure to public/, so:
 *   src/content/uses/20240402-uses/image.jpg
 * becomes available at:
 *   /uses/20240402-uses/image.jpg
 *
 * Run this before dev/build: npm run copy-assets
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, '../src/content');
const PUBLIC_DIR = path.join(__dirname, '../public');

// Asset extensions to copy (non-markdown files)
const ASSET_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif', '.heic', '.bmp', '.tiff', '.tif',
  '.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv', '.rtf',
  '.mp3', '.wav', '.flac', '.ogg', '.m4a', '.aac',
  '.zip', '.tar', '.gz', '.rar', '.7z'
]);

// Collections that contain linked assets (not all collections need this)
const COLLECTIONS_WITH_ASSETS = ['uses', 'blog', 'notes', 'talks', 'now', 'photography', 'homelab'];

let copiedCount = 0;
let skippedCount = 0;

/**
 * Recursively copy assets from a directory
 */
async function copyAssetsFromDir(srcDir, destDir, relativePath = '') {
  try {
    const items = await fs.readdir(srcDir, { withFileTypes: true });

    for (const item of items) {
      if (item.name.startsWith('.')) continue;

      const srcPath = path.join(srcDir, item.name);
      const destPath = path.join(destDir, item.name);
      const itemRelPath = path.join(relativePath, item.name);

      if (item.isDirectory()) {
        await copyAssetsFromDir(srcPath, destPath, itemRelPath);
      } else if (item.isFile()) {
        const ext = path.extname(item.name).toLowerCase();
        
        // Skip markdown files and non-asset files
        if (ext === '.md' || !ASSET_EXTENSIONS.has(ext)) {
          continue;
        }

        // Check if destination already exists and is up to date
        try {
          const [srcStat, destStat] = await Promise.all([
            fs.stat(srcPath),
            fs.stat(destPath)
          ]);
          
          // Skip if destination is newer or same age
          if (destStat.mtime >= srcStat.mtime) {
            skippedCount++;
            continue;
          }
        } catch {
          // Destination doesn't exist, will copy
        }

        // Ensure destination directory exists
        await fs.mkdir(path.dirname(destPath), { recursive: true });

        // Copy the file
        await fs.copyFile(srcPath, destPath);
        copiedCount++;
        console.log(`📦 Copied: ${itemRelPath}`);
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(`❌ Error processing ${srcDir}:`, error.message);
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Copying content assets to public/...\n');

  for (const collection of COLLECTIONS_WITH_ASSETS) {
    const srcDir = path.join(CONTENT_DIR, collection);
    const destDir = path.join(PUBLIC_DIR, collection);

    try {
      await fs.access(srcDir);
      await copyAssetsFromDir(srcDir, destDir, collection);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error(`❌ Error with collection ${collection}:`, error.message);
      }
    }
  }

  console.log(`\n✅ Done! Copied ${copiedCount} files, skipped ${skippedCount} up-to-date files.`);
}

main().catch(console.error);
