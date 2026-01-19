/**
 * Ghost Talks Migration Script
 * 
 * Fetches posts tagged with "talks" from Ghost and converts them to Astro-compatible markdown.
 * Assets are placed in a subfolder matching the markdown filename.
 * 
 * Usage: node scripts/migrate-talks.mjs
 */

import GhostContentAPI from '@tryghost/content-api';
import TurndownService from 'turndown';
import fs from 'fs/promises';
import path from 'path';
import https from 'https';
import http from 'http';

// Configuration
const GHOST_URL = 'https://ghost-admin.kayg.org';
const GHOST_KEY = 'd52fb62c8ac996778883dbee30';
const OUTPUT_DIR = './src/content/talks';

// Initialize Ghost API
const api = new GhostContentAPI({
    url: GHOST_URL,
    key: GHOST_KEY,
    version: 'v5.0'
});

// Initialize Turndown (HTML to Markdown converter)
const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
});

// Custom rules for better markdown output
turndown.addRule('figure', {
    filter: 'figure',
    replacement: function (content, node) {
        const img = node.querySelector('img');
        const figcaption = node.querySelector('figcaption');
        if (img) {
            const alt = img.alt || figcaption?.textContent || '';
            const src = img.src;
            return `\n![${alt}](${src})\n`;
        }
        return content;
    }
});

// Slugify a title for filename
function slugify(title) {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// Get filename prefix from date (YYYYMMDD)
function getDatePrefix(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

// Download an image to a specific folder and return relative path
async function downloadImage(url, assetsDir, basename) {
    if (!url || !url.startsWith('http')) return url;

    const urlObj = new URL(url);
    const ext = path.extname(urlObj.pathname) || '.jpg';
    const filename = `${basename}-${Date.now()}${ext}`;
    const localPath = path.join(assetsDir, filename);

    const protocol = url.startsWith('https') ? https : http;

    return new Promise((resolve) => {
        protocol.get(url, (response) => {
            // Handle redirects
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                downloadImage(response.headers.location, assetsDir, basename).then(resolve);
                return;
            }

            if (response.statusCode === 200) {
                const chunks = [];
                response.on('data', chunk => chunks.push(chunk));
                response.on('end', async () => {
                    try {
                        await fs.writeFile(localPath, Buffer.concat(chunks));
                        console.log(`  Downloaded: ${filename}`);
                        // Return just the filename for relative reference
                        resolve(`./${path.basename(assetsDir)}/${filename}`);
                    } catch (err) {
                        console.log(`  Failed to save: ${filename} - ${err.message}`);
                        resolve(url);
                    }
                });
            } else {
                console.log(`  Failed to fetch: ${url} (status ${response.statusCode})`);
                resolve(url);
            }
        }).on('error', (err) => {
            console.log(`  Network error: ${url} - ${err.message}`);
            resolve(url);
        });
    });
}

// Convert Ghost post to Astro markdown with co-located assets
async function convertPost(post) {
    const datePrefix = getDatePrefix(post.published_at || post.created_at);
    const titleSlug = slugify(post.title);
    const fileBasename = `${datePrefix}-${titleSlug}`;
    const assetsDir = path.join(OUTPUT_DIR, fileBasename);

    console.log(`\nProcessing: ${post.title}`);
    console.log(`  Filename: ${fileBasename}.md`);

    // Create assets directory for this post
    await fs.mkdir(assetsDir, { recursive: true });

    // Convert HTML to Markdown
    let markdown = post.html ? turndown.turndown(post.html) : '';

    // Download feature image
    let featureImage = post.feature_image;
    if (featureImage) {
        featureImage = await downloadImage(featureImage, assetsDir, 'cover');
    }

    // Download all images in content
    const imageMatches = [...markdown.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)];
    for (const match of imageMatches) {
        const originalUrl = match[2];
        if (originalUrl.startsWith('http')) {
            const localPath = await downloadImage(originalUrl, assetsDir, 'img');
            markdown = markdown.replace(originalUrl, localPath);
        }
    }

    // Check if assets directory is empty and remove if so
    const assetFiles = await fs.readdir(assetsDir);
    if (assetFiles.length === 0) {
        await fs.rmdir(assetsDir);
        console.log(`  No assets, removed empty folder`);
    }

    // Create frontmatter
    const frontmatter = {
        title: post.title,
        description: post.excerpt || post.custom_excerpt || '',
        date: post.published_at || post.created_at,
        'last edited': post.updated_at,
        tags: post.tags?.filter(t => t.name.toLowerCase() !== 'talks').map(t => t.name) || [],
        draft: post.status !== 'published',
    };

    if (featureImage) {
        frontmatter.image = featureImage;
    }

    // Build frontmatter string
    let frontmatterStr = '---\n';
    for (const [key, value] of Object.entries(frontmatter)) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
            if (value.length > 0) {
                frontmatterStr += `${key}:\n${value.map(v => `  - "${v}"`).join('\n')}\n`;
            }
        } else if (typeof value === 'boolean') {
            frontmatterStr += `${key}: ${value}\n`;
        } else {
            frontmatterStr += `${key}: "${String(value).replace(/"/g, '\\"')}"\n`;
        }
    }
    frontmatterStr += '---\n\n';

    return {
        filename: `${fileBasename}.md`,
        content: frontmatterStr + markdown,
    };
}

// Main migration function
async function migrate() {
    console.log('🚀 Starting Ghost Talks migration...\n');

    // Create output directory
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    try {
        // Fetch posts tagged with "talks"
        console.log('Fetching talks from Ghost (posts with "talks" tag)...');
        const posts = await api.posts.browse({
            limit: 'all',
            include: 'tags,authors',
            formats: ['html'],
            filter: 'tag:talks',
        });

        console.log(`Found ${posts.length} talks\n`);

        if (posts.length === 0) {
            console.log('No posts found with the "talks" tag.');
            console.log('Make sure your Ghost posts have the "talks" tag applied.');
            return;
        }

        // Convert each post
        let converted = 0;
        for (const post of posts) {
            try {
                const { filename, content } = await convertPost(post);
                const filepath = path.join(OUTPUT_DIR, filename);
                await fs.writeFile(filepath, content);
                console.log(`  ✅ Saved: ${filename}`);
                converted++;
            } catch (err) {
                console.log(`  ❌ Failed: ${post.title} - ${err.message}`);
            }
        }

        console.log(`\n✨ Migration complete! Converted ${converted}/${posts.length} talks.`);
        console.log(`\nOutput: ${OUTPUT_DIR}`);

    } catch (err) {
        console.error('Migration failed:', err.message);
        if (err.message.includes('filter')) {
            console.log('\nNote: If the filter is not working, the Ghost API may not support tag filtering.');
            console.log('Try fetching all posts and filtering locally.');
        }
        process.exit(1);
    }
}

// Run migration
migrate();
