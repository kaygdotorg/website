import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OBSIDIAN_PATH = process.env.OBSIDIAN_PATH;
const TARGET_BASE_DIR = path.join(__dirname, '../src/content');

if (!OBSIDIAN_PATH) {
    console.error('❌ OBSIDIAN_PATH is not defined in .env file');
    console.log('👉 Please add OBSIDIAN_PATH=/your/absolute/path/to/obsidian to .env');
    process.exit(1);
}

// Ensure the Obsidian path exists
try {
    await fs.access(OBSIDIAN_PATH);
} catch (error) {
    console.error(`❌ Obsidian path does not exist: ${OBSIDIAN_PATH}`);
    process.exit(1);
}

console.log(`🚀 Syncing Obsidian content from: ${OBSIDIAN_PATH}`);

// Helper to slugify a string (for filenames if no slug is present)
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-');  // Replace multiple - with single -
}

// Function to process a single file (Markdown)
async function processFile(filePath, itemRelativePath, collectionName) {
    try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const { data, content } = matter(fileContent);
        const fileName = path.basename(filePath, '.md');
        const fileDir = path.dirname(itemRelativePath); // Relative path inside the collection

        // 1. Determine local destination filename
        // Priority: frontmatter.slug > filename
        let destFileName;
        if (data.slug) {
            destFileName = `${data.slug}.md`;
        } else {
            destFileName = `${slugify(fileName)}.md`;
        }

        // 2. Transform Frontmatter
        if (data.created && !data.date) {
            data.date = data.created;
            delete data.created;
        }
        if (data.updated && !data['last-edited']) {
            data['last-edited'] = data.updated;
            delete data.updated;
        }

        // Ensure date (fallback to stats)
        if (!data.date) {
            const stats = await fs.stat(filePath);
            data.date = stats.birthtime;
        }

        // 3. Link cleanup with Asset Resolution
        let newContent = content;

        // Find all Wikilink matches: ![[image.png]] or ![[image.png|alt]]
        const wikiRegex = /!\[\[([^|\]]+)(?:\|([^\]]+))?\]\]/g;
        const wikiMatches = [...content.matchAll(wikiRegex)];

        for (const match of wikiMatches) {
            const fullMatch = match[0];
            const src = match[1];
            const alt = match[2] || '';

            let finalSrc = src;

            // Check 1: Is the asset in the same directory?
            const localDirectPath = path.join(path.dirname(filePath), src);

            // Check 2: Is the asset in a subfolder named after the file? (Obsidian Bundle pattern)
            const localBundlePath = path.join(path.dirname(filePath), fileName, src);

            try {
                await fs.access(localDirectPath);
                // It exists locally, use bare filename (Astro handles relative ./ implicitly)
                finalSrc = src;
            } catch {
                try {
                    await fs.access(localBundlePath);
                    // It exists in the bundle subfolder!
                    // We need to point to it relative to the markdown file.
                    // Since we are mirroring structure, the asset will be in `fileName/src`.
                    finalSrc = `${fileName}/${src}`;
                    // Note: We use `fileName` (original name) matching the folder name.
                } catch {
                    // Not found in either standard location. Keep original.
                }
            }

            // Replace with standard markdown: ![alt](src)
            // We use Replace on the string. To avoid replacing ALL instances incorrectly if multiple same images exist but different contexts (rare),
            // we should arguably match better, but global replace of exact string is usually safe for Wikilinks.
            // Actually, replacing one by one is safer if we track indices, but simply replacing the string is okay for now.
            newContent = newContent.replace(fullMatch, `![${alt}](${finalSrc})`);
        }

        const processedContent = matter.stringify(newContent, data);

        // 4. Ensure target directory exists (mirroring structure)
        // If fileDir is "." it means root of collection
        const targetDir = path.join(TARGET_BASE_DIR, collectionName, fileDir);
        await fs.mkdir(targetDir, { recursive: true });

        // 5. Write file
        const destPath = path.join(targetDir, destFileName);
        await fs.writeFile(destPath, processedContent);

        console.log(`📝 Synced MD: ${collectionName}/${fileDir !== '.' ? fileDir + '/' : ''}${destFileName}`);

    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
    }
}

// Function to copy an asset file (Image, etc.)
async function copyAsset(filePath, itemRelativePath, collectionName) {
    try {
        const fileDir = path.dirname(itemRelativePath);
        const targetDir = path.join(TARGET_BASE_DIR, collectionName, fileDir);
        await fs.mkdir(targetDir, { recursive: true });

        const destPath = path.join(targetDir, path.basename(filePath));
        await fs.copyFile(filePath, destPath);
        console.log(`🖼️  Synced Asset: ${collectionName}/${itemRelativePath}`);
    } catch (error) {
        console.error(`❌ Error copying asset ${filePath}:`, error.message);
    }
}

// Helper to recursively walk and sync a collection folder
async function syncCollectionFolder(dirPath, collectionName, relativePath = '') {
    const items = await fs.readdir(dirPath, { withFileTypes: true });

    for (const item of items) {
        if (item.name.startsWith('.')) continue;

        const fullPath = path.join(dirPath, item.name);
        // Construct the relative path from the collection root
        const splitRelPath = relativePath ? path.join(relativePath, item.name) : item.name;

        if (item.isDirectory()) {
            await syncCollectionFolder(fullPath, collectionName, splitRelPath);
        } else if (item.isFile()) {
            if (item.name.endsWith('.md')) {
                await processFile(fullPath, splitRelPath, collectionName);
            } else {
                // It's an asset (image, etc) - copy it as is
                await copyAsset(fullPath, splitRelPath, collectionName);
            }
        }
    }
}

// Main Sync Function
async function startSync() {
    const items = await fs.readdir(OBSIDIAN_PATH, { withFileTypes: true });

    for (const item of items) {
        if (item.name.startsWith('.')) continue;
        const fullPath = path.join(OBSIDIAN_PATH, item.name);

        if (item.isDirectory()) {
            // Top level folder = Collection Name (e.g. Writing, Now)
            const collectionName = item.name.toLowerCase();
            console.log(`📂 Processing Collection: ${collectionName}`);

            // Start processing this collection's content
            await syncCollectionFolder(fullPath, collectionName);
        } else {
            console.warn(`⚠️  Skipping root file: ${item.name} (Please organize into folders like Writing, Now, Uses)`);
        }
    }
}

startSync().catch(console.error);
