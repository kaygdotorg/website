/**
 * Rename and Fix Markdown Posts
 * 
 * 1. Renames files to YYYY-MM-DD-posttitle.md format
 * 2. Adds slug field to frontmatter for URL routing
 * 3. Cleans up description field
 * 
 * Usage: node scripts/rename-posts.mjs
 */

import fs from 'fs/promises';
import path from 'path';

const WRITING_DIR = './src/content/writing';

// Slugify a string
function slugify(str) {
    return str
        .toLowerCase()
        .replace(/['']/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 60); // Limit length
}

// Extract date from frontmatter
function extractDate(content) {
    const match = content.match(/date:\s*["']?([^"'\n]+)["']?/);
    if (match) {
        const date = new Date(match[1]);
        if (!isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
    }
    return '0000-00-00';
}

// Extract title from frontmatter
function extractTitle(content) {
    const match = content.match(/title:\s*["'](.+?)["']/);
    return match ? match[1] : 'untitled';
}

// Clean up description (remove newlines, truncate)
function cleanDescription(desc) {
    if (!desc) return '';
    return desc
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 160);
}

// Process a single file
async function processFile(filepath) {
    const content = await fs.readFile(filepath, 'utf-8');
    const filename = path.basename(filepath, '.md');

    // Extract metadata
    const date = extractDate(content);
    const title = extractTitle(content);
    const titleSlug = slugify(title);
    const originalSlug = filename; // Current filename is the slug

    // New filename
    const newFilename = `${date}-${titleSlug}.md`;
    const newFilepath = path.join(WRITING_DIR, newFilename);

    // Check if slug field already exists
    const hasSlug = /^slug:/m.test(content);

    let newContent = content;

    // Add slug field after title if not present
    if (!hasSlug) {
        newContent = content.replace(
            /^(title:\s*["'].+?["'])\n/m,
            `$1\nslug: "${originalSlug}"\n`
        );
    }

    // Clean up description if it has newlines
    const descMatch = newContent.match(/description:\s*["']([^]*?)["']\ndate:/);
    if (descMatch && descMatch[1].includes('\n')) {
        const cleanedDesc = cleanDescription(descMatch[1]);
        newContent = newContent.replace(
            /description:\s*["'][^]*?["']\ndate:/,
            `description: "${cleanedDesc.replace(/"/g, '\\"')}"\ndate:`
        );
    }

    // Write updated content to original file (we'll rename after)
    await fs.writeFile(filepath, newContent);

    // Rename file if different
    if (filepath !== newFilepath && filename !== newFilename.replace('.md', '')) {
        try {
            await fs.rename(filepath, newFilepath);
            console.log(`✅ ${filename}.md → ${newFilename}`);
            return { old: filename, new: newFilename.replace('.md', ''), slug: originalSlug };
        } catch (err) {
            console.log(`⚠️  Could not rename ${filename}: ${err.message}`);
            return null;
        }
    } else {
        console.log(`⏭️  ${filename}.md (no rename needed)`);
        return null;
    }
}

async function main() {
    console.log('🔄 Renaming and fixing posts...\n');

    const files = await fs.readdir(WRITING_DIR);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    console.log(`Found ${mdFiles.length} posts\n`);

    const renames = [];

    for (const file of mdFiles) {
        const result = await processFile(path.join(WRITING_DIR, file));
        if (result) renames.push(result);
    }

    console.log(`\n✨ Done! Renamed ${renames.length} files.`);
    console.log('\nSlug field added to all posts for URL routing.');
}

main().catch(console.error);
