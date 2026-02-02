#!/usr/bin/env node
/**
 * scan-internal-links.mjs
 * 
 * Scans all markdown files for internal links to other markdown files
 * and identifies broken links (404s) due to date-in-filename issues.
 */

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

// All markdown files found
const allFiles = new Map(); // normalized name -> full path
const allUrls = new Map(); // slug -> { collection, filename }

function normalizeFilename(filename) {
  return filename.toLowerCase().replace(/\.md$/, "");
}

function extractDateAndSlug(filename) {
  // Pattern: YYYYMMDD-slug.md or YYYYMMDD-slug-with-dashes.md
  const match = filename.match(/^(\d{4})(\d{2})(\d{2})-(.+)$/);
  if (match) {
    const [, year, month, day, slug] = match;
    return {
      date: `${year}-${month}-${day}`,
      slug: slug,
      urlSlug: `/${year}-${month}-${day}`
    };
  }
  return null;
}

async function scanFiles() {
  const contentDir = path.join(ROOT, "src/content");
  const collections = await fs.readdir(contentDir);
  
  for (const collection of collections) {
    const collectionPath = path.join(contentDir, collection);
    const stat = await fs.stat(collectionPath).catch(() => null);
    if (!stat || !stat.isDirectory()) continue;
    
    const files = await fs.readdir(collectionPath);
    
    for (const file of files) {
      if (!file.endsWith(".md")) continue;
      
      const fullPath = path.join(collectionPath, file);
      const normalized = normalizeFilename(file);
      allFiles.set(normalized, { path: fullPath, collection, filename: file });
      
      // Extract URL slug
      const dateInfo = extractDateAndSlug(normalized);
      if (dateInfo) {
        const urlPath = `/${collection}${dateInfo.urlSlug}`;
        allUrls.set(urlPath, { collection, filename: file, dateInfo });
      }
    }
  }
}

function findLinks(content, filePath) {
  const links = [];
  
  // Match markdown links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  
  while ((match = linkRegex.exec(content)) !== null) {
    const [fullMatch, text, url] = match;
    
    // Skip external URLs, anchors, etc.
    if (url.startsWith("http://") || url.startsWith("https://") || 
        url.startsWith("#") || url.startsWith("mailto:") || url.startsWith("tel:")) {
      continue;
    }
    
    // Skip asset files (images, videos, etc.)
    const assetExts = /\.(jpe?g|png|gif|webp|svg|avif|pdf|mp4|webm|mp3|wav)$/i;
    if (assetExts.test(url)) {
      continue;
    }
    
    // This is potentially an internal markdown link
    links.push({
      fullMatch,
      text,
      url,
      index: match.index
    });
  }
  
  return links;
}

function resolveLink(url, sourceCollection) {
  // Remove ./ or ../ prefix
  const cleanUrl = url.replace(/^\.\.?\//, "");
  
  // Check if it's a direct filename reference with .md extension
  if (cleanUrl.endsWith(".md")) {
    const normalized = normalizeFilename(cleanUrl);
    
    // Try to find in same collection first
    for (const [key, info] of allFiles) {
      if (key === normalized || key.endsWith("-" + normalized) || key.includes(normalized)) {
        return {
          found: true,
          file: info,
          urlPath: null // Will compute below
        };
      }
    }
    
    return { found: false, url: cleanUrl };
  }
  
  // Check if it's already a URL path
  if (url.startsWith("/")) {
    // Check if this URL exists in our map
    if (allUrls.has(url)) {
      return { found: true, urlPath: url, file: allUrls.get(url) };
    }
    return { found: false, url };
  }
  
  return { found: false, url: cleanUrl };
}

async function main() {
  console.log("🔍 Scanning for internal markdown links...\n");
  
  await scanFiles();
  console.log(`Found ${allFiles.size} markdown files`);
  
  const brokenLinks = [];
  const fixableLinks = [];
  
  for (const [normalized, info] of allFiles) {
    const content = await fs.readFile(info.path, "utf-8");
    const links = findLinks(content, info.path);
    
    for (const link of links) {
      const resolution = resolveLink(link.url, info.collection);
      
      if (!resolution.found) {
        brokenLinks.push({
          file: info.path,
          ...link,
          reason: "Target not found"
        });
      } else if (link.url.endsWith(".md")) {
        // Found but using .md filename - needs fixing to URL format
        const targetInfo = resolution.file;
        const dateInfo = extractDateAndSlug(normalizeFilename(targetInfo.filename));
        
        if (dateInfo) {
          const correctUrl = info.collection === targetInfo.collection 
            ? `./${targetInfo.filename.replace(/\.md$/, "")}`
            : `/${targetInfo.collection}${dateInfo.urlSlug}`;
          
          fixableLinks.push({
            file: info.path,
            ...link,
            targetInfo,
            correctUrl,
            dateInfo
          });
        }
      }
    }
  }
  
  console.log(`\n📊 Results:`);
  console.log(`   Broken links: ${brokenLinks.length}`);
  console.log(`   Fixable links (using .md filenames): ${fixableLinks.length}\n`);
  
  if (fixableLinks.length > 0) {
    console.log("🔗 Links that need fixing:\n");
    
    // Group by file
    const byFile = new Map();
    for (const link of fixableLinks) {
      if (!byFile.has(link.file)) {
        byFile.set(link.file, []);
      }
      byFile.get(link.file).push(link);
    }
    
    for (const [file, links] of byFile) {
      console.log(`\n${path.relative(ROOT, file)}:`);
      for (const link of links) {
        console.log(`  Line: "${link.text}" -> ${link.url}`);
        console.log(`  Fix to: ${link.correctUrl}`);
      }
    }
  }
  
  // Export fixable links for automated fixing
  if (fixableLinks.length > 0) {
    const outputPath = path.join(ROOT, ".link-fixes.json");
    await fs.writeFile(outputPath, JSON.stringify(fixableLinks, null, 2));
    console.log(`\n💾 Fix data saved to: ${outputPath}`);
  }
  
  return fixableLinks;
}

main().catch(console.error);
