#!/usr/bin/env node
/**
 * fix-internal-links.mjs
 * 
 * Fixes internal markdown links by converting filename references
 * to the correct URL format based on the site's routing rules.
 * 
 * URL format: /{collection}/{slug} where slug is filename without date prefix
 * Example: 20240713-forwarded-ip-cloudflare.md → /blog/forwarded-ip-cloudflare
 */

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

// Map of all markdown files: normalizedName -> { collection, slug, fullPath }
const fileMap = new Map();

function normalizeName(filename) {
  return filename.toLowerCase().replace(/\.md$/, "");
}

function extractSlug(filename) {
  // Pattern: YYYYMMDD-slug.md -> slug
  const match = filename.match(/^\d{8}-(.+)\.md$/);
  if (match) {
    return match[1];
  }
  // No date prefix, just remove .md
  return filename.replace(/\.md$/, "");
}

async function buildFileMap() {
  const contentDir = path.join(ROOT, "src/content");
  const collections = await fs.readdir(contentDir);
  
  for (const collection of collections) {
    const collectionPath = path.join(contentDir, collection);
    const stat = await fs.stat(collectionPath).catch(() => null);
    if (!stat || !stat.isDirectory()) continue;
    
    const files = await fs.readdir(collectionPath);
    
    for (const file of files) {
      if (!file.endsWith(".md") || file === "index.md") continue;
      
      const normalized = normalizeName(file);
      const slug = extractSlug(file);
      
      fileMap.set(normalized, {
        collection,
        slug,
        filename: file,
        fullPath: path.join(collectionPath, file)
      });
    }
  }
}

function findMarkdownLinks(content) {
  const links = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const [fullMatch, text, url] = match;
    
    // Skip non-markdown links
    if (!url.endsWith(".md")) continue;
    
    // Skip external URLs
    if (url.startsWith("http://") || url.startsWith("https://")) continue;
    
    links.push({
      fullMatch,
      text,
      url,
      index: match.index,
      length: fullMatch.length
    });
  }
  
  return links;
}

function resolveLink(url, sourceCollection) {
  // Parse the URL
  // Could be: ./filename.md, ../other/filename.md, filename.md
  
  let targetName = path.basename(url);
  let targetCollection = sourceCollection;
  
  // Check if URL specifies a different collection
  const dirPart = path.dirname(url);
  if (dirPart.startsWith("../")) {
    // Going up to a different collection
    const parts = dirPart.split("/").filter(Boolean);
    if (parts.length > 0 && parts[0] !== ".") {
      targetCollection = parts[parts.length - 1];
    }
  }
  
  const normalized = normalizeName(targetName);
  const fileInfo = fileMap.get(normalized);
  
  if (!fileInfo) {
    return { found: false, reason: "Target file not found" };
  }
  
  // Build the correct URL
  const isSameCollection = sourceCollection === fileInfo.collection;
  
  if (isSameCollection) {
    // Same collection: use relative path ./slug
    return {
      found: true,
      correctUrl: `./${fileInfo.slug}`,
      fileInfo
    };
  } else {
    // Different collection: use absolute path /collection/slug
    return {
      found: true,
      correctUrl: `/${fileInfo.collection}/${fileInfo.slug}`,
      fileInfo
    };
  }
}

async function processFile(filePath, collection) {
  const content = await fs.readFile(filePath, "utf-8");
  const links = findMarkdownLinks(content);
  
  if (links.length === 0) return null;
  
  const fixes = [];
  let newContent = content;
  let offset = 0;
  
  for (const link of links) {
    const resolution = resolveLink(link.url, collection);
    
    if (resolution.found && resolution.correctUrl !== link.url) {
      fixes.push({
        original: link.url,
        corrected: resolution.correctUrl,
        text: link.text
      });
      
      // Apply fix
      const startIdx = link.index + offset;
      const endIdx = startIdx + link.length;
      const newLink = `[${link.text}](${resolution.correctUrl})`;
      
      newContent = newContent.slice(0, startIdx) + newLink + newContent.slice(endIdx);
      
      // Update offset for subsequent replacements
      offset += newLink.length - link.length;
    }
  }
  
  if (fixes.length === 0) return null;
  
  return { filePath, fixes, newContent };
}

async function main() {
  console.log("🔧 Fixing internal markdown links...\n");
  
  await buildFileMap();
  console.log(`Indexed ${fileMap.size} markdown files\n`);
  
  const results = [];
  
  for (const [normalized, info] of fileMap) {
    const result = await processFile(info.fullPath, info.collection);
    if (result) {
      results.push(result);
    }
  }
  
  if (results.length === 0) {
    console.log("✅ No broken internal links found!");
    return;
  }
  
  console.log(`Found ${results.length} files with broken links:\n`);
  
  for (const result of results) {
    const relativePath = path.relative(ROOT, result.filePath);
    console.log(`${relativePath}:`);
    for (const fix of result.fixes) {
      console.log(`  "${fix.text}": ${fix.original} → ${fix.corrected}`);
    }
    console.log();
  }
  
  // Apply fixes
  console.log("💾 Applying fixes...\n");
  
  for (const result of results) {
    await fs.writeFile(result.filePath, result.newContent, "utf-8");
    console.log(`✓ ${path.relative(ROOT, result.filePath)}`);
  }
  
  console.log(`\n✅ Fixed ${results.reduce((sum, r) => sum + r.fixes.length, 0)} links in ${results.length} files`);
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
