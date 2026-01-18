/**
 * Ghost to Astro Migration Script
 * 
 * Fetches all posts from Ghost and converts them to Astro-compatible markdown
 * 
 * Usage: node scripts/migrate-ghost.mjs
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
const OUTPUT_DIR = './src/content/writing';
const IMAGES_DIR = './public/images/ghost';

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

// Download an image and return local path
async function downloadImage(url, slug) {
    if (!url || !url.startsWith('http')) return url;

    const urlObj = new URL(url);
    const ext = path.extname(urlObj.pathname) || '.jpg';
    const filename = `${slug}-${Date.now()}${ext}`;
    const localPath = path.join(IMAGES_DIR, filename);

    const protocol = url.startsWith('https') ? https : http;

    return new Promise((resolve) => {
        protocol.get(url, (response) => {
            if (response.statusCode === 200) {
                const chunks = [];
                response.on('data', chunk => chunks.push(chunk));
                response.on('end', async () => {
                    try {
                        await fs.writeFile(localPath, Buffer.concat(chunks));
                        console.log(`  Downloaded: ${filename}`);
                        resolve(`/images/ghost/${filename}`);
                    } catch (err) {
                        console.log(`  Failed to save: ${filename}`);
                        resolve(url);
                    }
                });
            } else {
                resolve(url);
            }
        }).on('error', () => resolve(url));
    });
}

// Convert Ghost post to Astro markdown
async function convertPost(post) {
    console.log(`\nProcessing: ${post.title}`);

    // Convert HTML to Markdown
    let markdown = post.html ? turndown.turndown(post.html) : '';

    // Download feature image
    let featureImage = post.feature_image;
    if (featureImage) {
        featureImage = await downloadImage(featureImage, post.slug);
    }

    // Download all images in content
    const imageMatches = markdown.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g);
    for (const match of imageMatches) {
        const originalUrl = match[2];
        if (originalUrl.startsWith('http')) {
            const localPath = await downloadImage(originalUrl, post.slug);
            markdown = markdown.replace(originalUrl, localPath);
        }
    }

    // Create frontmatter
    const frontmatter = {
        title: post.title,
        description: post.excerpt || post.custom_excerpt || '',
        date: post.published_at || post.created_at,
        'last edited': post.updated_at,
        tags: post.tags?.map(t => t.name) || [],
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
        slug: post.slug,
        content: frontmatterStr + markdown,
    };
}

// Main migration function
async function migrate() {
    console.log('🚀 Starting Ghost to Astro migration...\n');

    // Create output directories
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    await fs.mkdir(IMAGES_DIR, { recursive: true });

    try {
        // Fetch all posts
        console.log('Fetching posts from Ghost...');
        const posts = await api.posts.browse({
            limit: 'all',
            include: 'tags,authors',
            formats: ['html'],
        });

        console.log(`Found ${posts.length} posts\n`);

        // Convert each post
        let converted = 0;
        for (const post of posts) {
            try {
                const { slug, content } = await convertPost(post);
                const filepath = path.join(OUTPUT_DIR, `${slug}.md`);
                await fs.writeFile(filepath, content);
                console.log(`  ✅ Saved: ${slug}.md`);
                converted++;
            } catch (err) {
                console.log(`  ❌ Failed: ${post.title} - ${err.message}`);
            }
        }

        console.log(`\n✨ Migration complete! Converted ${converted}/${posts.length} posts.`);
        console.log(`\nOutput:`);
        console.log(`  Posts: ${OUTPUT_DIR}`);
        console.log(`  Images: ${IMAGES_DIR}`);

    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
}

// Run migration
migrate();
