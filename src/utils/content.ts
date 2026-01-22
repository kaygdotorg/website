/**
 * Content Utilities
 * 
 * Reusable helper functions for working with Astro content collections.
 * These utilities consolidate common patterns found across page files.
 */
import { getCollection } from "astro:content";

/**
 * Calculate reading time based on word count.
 * Assumes average reading speed of 200 words per minute.
 * 
 * @param body - The markdown body text
 * @returns Reading time in minutes (minimum 1)
 */
export function calculateReadingTime(body: string | undefined): number {
    const wordCount = body?.split(/\s+/).length || 0;
    return Math.max(1, Math.ceil(wordCount / 200));
}

/**
 * Get URL slug from an entry, preferring frontmatter slug over file slug.
 * 
 * @param entry - Content collection entry
 * @returns URL-safe slug string
 */
export function getUrlSlug(entry: any): string {
    return entry.data.slug || entry.slug;
}

/**
 * Build navigation backlinks for a content entry.
 * Creates links to the collection index and prev/next entries.
 * 
 * @param basePath - Base URL path (e.g., "/blog", "/notes")
 * @param label - Display label (e.g., "All Writing", "All Notes")
 * @param entries - All entries in the collection, sorted
 * @param current - The current entry being viewed
 * @returns Array of backlink objects with title and href
 */
export function buildBacklinks(
    basePath: string,
    label: string,
    entries: any[],
    current: any
): Array<{ title: string; href: string }> {
    const backlinks = [{ title: `← ${label}`, href: basePath }];

    const currentIndex = entries.findIndex(
        (e) => getUrlSlug(e) === getUrlSlug(current)
    );

    // Previous entry (older, higher index in date-sorted array)
    const prevEntry = currentIndex < entries.length - 1
        ? entries[currentIndex + 1]
        : null;
    if (prevEntry) {
        backlinks.push({
            title: `← ${prevEntry.data.title}`,
            href: `${basePath}/${getUrlSlug(prevEntry)}`,
        });
    }

    // Next entry (newer, lower index in date-sorted array)
    const nextEntry = currentIndex > 0
        ? entries[currentIndex - 1]
        : null;
    if (nextEntry) {
        backlinks.push({
            title: `${nextEntry.data.title} →`,
            href: `${basePath}/${getUrlSlug(nextEntry)}`,
        });
    }

    return backlinks;
}

/**
 * Collection configuration for dynamic routes.
 * Maps collection names to their display labels and features.
 */
export const CONTENT_COLLECTIONS = {
    blog: {
        label: "All Writing",
        basePath: "/blog",
        hasTags: true,
    },
    notes: {
        label: "All Notes",
        basePath: "/notes",
        hasTags: true,
    },
    talks: {
        label: "All Talks",
        basePath: "/talks",
        hasTags: true,
    },
    now: {
        label: "All Now Entries",
        basePath: "/now",
        hasTags: false,
    },
    uses: {
        label: "All Uses Entries",
        basePath: "/uses",
        hasTags: false,
    },
} as const;

export type ContentCollection = keyof typeof CONTENT_COLLECTIONS;
