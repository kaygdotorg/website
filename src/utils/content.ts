/**
 * =============================================================================
 * CONTENT UTILITIES
 * =============================================================================
 *
 * Reusable helper functions for working with Astro content collections.
 * These utilities consolidate common patterns across page components.
 *
 * ASTRO 5 COMPATIBILITY:
 * ----------------------
 * - Entries from getCollection() have `id` (our custom ID via generateId)
 * - The `id` already has the date prefix stripped (see content.config.ts)
 * - Frontmatter `slug` can override the URL slug if needed
 *
 * @see src/content.config.ts for collection definitions
 */

import { getCollection } from "astro:content";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Generic content entry type.
 * Using 'any' for flexibility across different collection schemas.
 * In a stricter setup, you could use Astro's CollectionEntry<T> type.
 */
export type ContentEntry = {
  id: string;
  slug?: string;
  body?: string;
  data: {
    title: string;
    slug?: string;
    date?: Date;
    draft?: boolean;
    [key: string]: unknown;
  };
};

/**
 * Backlink structure for navigation between entries.
 */
export interface Backlink {
  title: string;
  href: string;
}

/**
 * True backlink structure (pages that link TO a given page).
 */
export interface TrueBacklink {
  source: string;
  title: string;
  collection: string;
}

/**
 * Graph node structure for visualization.
 */
export interface GraphNode {
  id: string;
  title: string;
  collection: string;
}

/**
 * Graph link structure for visualization.
 */
export interface GraphLink {
  source: string;
  target: string;
}

/**
 * Graph data structure for local graph visualization.
 */
export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

/**
 * Full link index structure from public/link-index.json.
 */
interface LinkIndex {
  backlinks: Record<string, TrueBacklink[]>;
  graph: {
    nodes: GraphNode[];
    links: GraphLink[];
  };
  meta: {
    generatedAt: string;
    totalPages: number;
    totalLinks: number;
  };
}

// =============================================================================
// READING TIME
// =============================================================================

/**
 * Average reading speed in words per minute.
 * 200 WPM is a conservative estimate for technical content.
 */
const WORDS_PER_MINUTE = 200;

/**
 * Calculate reading time based on word count.
 *
 * @param body - The markdown body text (may be undefined)
 * @returns Reading time in minutes (minimum 1 minute)
 *
 * @example
 * const readingTime = calculateReadingTime(entry.body);
 * // Returns: 5 (for ~1000 words)
 */
export function calculateReadingTime(body: string | undefined): number {
  if (!body) return 1;

  const wordCount = body.split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE);

  // Always return at least 1 minute
  return Math.max(1, minutes);
}

// =============================================================================
// URL SLUGS
// =============================================================================

/**
 * Get the URL slug for a content entry.
 *
 * PRIORITY ORDER:
 * 1. Explicit frontmatter `slug` (allows manual override)
 * 2. Entry `id` (already has date prefix stripped via generateId)
 *
 * NOTE: In Astro 5 with our generateId config, entry.id is already clean:
 * - File: 20240713-my-article.md
 * - entry.id: "my-article" (date prefix stripped)
 * - URL: /blog/my-article
 *
 * @param entry - Content collection entry
 * @returns URL-safe slug string
 *
 * @example
 * const slug = getUrlSlug(entry);
 * const url = `/blog/${slug}`;
 */
export function getUrlSlug(entry: ContentEntry): string {
  // 1. Check for explicit frontmatter slug override
  if (entry.data.slug) {
    const slug = entry.data.slug;

    // Handle Date objects (YAML parses "2024-04-02" as Date)
    if (slug instanceof Date) {
      return slug.toISOString().split("T")[0];
    }

    return String(slug);
  }

  // 2. Use entry.id (already date-prefix-stripped via generateId)
  return entry.id;
}

// =============================================================================
// NAVIGATION BACKLINKS
// =============================================================================

/**
 * Build navigation backlinks for a content entry.
 *
 * Creates an array of navigation links including:
 * - Link back to collection index (e.g., "← All Writing")
 * - Link to previous entry (older, if exists)
 * - Link to next entry (newer, if exists)
 *
 * @param basePath - Base URL path (e.g., "/blog", "/notes")
 * @param label - Display label for the index link (e.g., "All Writing")
 * @param entries - All entries in the collection, sorted by date (newest first)
 * @param current - The current entry being viewed
 * @returns Array of backlink objects
 *
 * @example
 * const backlinks = buildBacklinks("/blog", "All Writing", sortedEntries, currentEntry);
 * // Returns:
 * // [
 * //   { title: "← All Writing", href: "/blog" },
 * //   { title: "← Previous Post", href: "/blog/older-post" },
 * //   { title: "Next Post →", href: "/blog/newer-post" }
 * // ]
 */
export function buildBacklinks(
  basePath: string,
  label: string,
  entries: ContentEntry[],
  current: ContentEntry
): Backlink[] {
  const backlinks: Backlink[] = [];

  // Find current entry's position in the sorted array (sorted newest first)
  const currentSlug = getUrlSlug(current);
  const currentIndex = entries.findIndex((e) => getUrlSlug(e) === currentSlug);

  if (currentIndex === -1) {
    // Current entry not found - return parent link only
    return [
      { title: `← ${label}`, href: basePath },
      { title: `${label} →`, href: basePath },
    ];
  }

  // Previous = older post (higher index) or parent if oldest
  // Next = newer post (lower index) or parent if newest
  const prevEntry = entries[currentIndex + 1]; // older
  const nextEntry = entries[currentIndex - 1]; // newer

  // ← Previous (older post, or parent page if this is the oldest)
  if (prevEntry) {
    backlinks.push({
      title: `← ${prevEntry.data.title}`,
      href: `${basePath}/${getUrlSlug(prevEntry)}`,
    });
  } else {
    // Oldest post - previous is parent page
    backlinks.push({
      title: `← ${label}`,
      href: basePath,
    });
  }

  // → Next (newer post, or parent page if this is the newest)
  if (nextEntry) {
    backlinks.push({
      title: `${nextEntry.data.title} →`,
      href: `${basePath}/${getUrlSlug(nextEntry)}`,
    });
  } else {
    // Newest post - next is parent page
    backlinks.push({
      title: `${label} →`,
      href: basePath,
    });
  }

  return backlinks;
}

// =============================================================================
// COLLECTION CONFIGURATION
// =============================================================================

/**
 * Configuration for each content collection.
 *
 * This map provides metadata about each collection type, used by:
 * - Dynamic routes ([collection]/[slug].astro)
 * - Navigation components
 * - Layout components
 *
 * Adding a new collection? Add an entry here with:
 * - label: Display name for "back to all" link
 * - basePath: URL base path
 * - hasTags: Whether entries support tag filtering
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

/**
 * Type for valid content collection names.
 * Derived from CONTENT_COLLECTIONS keys for type safety.
 */
export type ContentCollection = keyof typeof CONTENT_COLLECTIONS;

// =============================================================================
// COLLECTION HELPERS
// =============================================================================

/**
 * Get all entries from a collection, excluding drafts and index pages.
 *
 * This is a common pattern used across many pages:
 * - Excludes entries with id "index" (landing pages)
 * - Excludes entries with draft: true (unpublished content)
 * - Returns entries sorted by date (newest first)
 *
 * @param collectionName - Name of the collection to fetch
 * @returns Sorted array of published entries
 *
 * @example
 * const posts = await getPublishedEntries("blog");
 */
export async function getPublishedEntries(
  collectionName: ContentCollection
): Promise<ContentEntry[]> {
  const entries = await getCollection(
    collectionName,
    ({ id, data }) => id !== "index" && !data.draft
  );

  // Sort by date, newest first
  return entries.sort((a, b) => {
    const dateA = a.data.date?.getTime() ?? 0;
    const dateB = b.data.date?.getTime() ?? 0;
    return dateB - dateA;
  });
}

/**
 * Get the index/landing page entry for a collection.
 *
 * Each collection has an index.md that serves as the landing page.
 * This function retrieves that specific entry.
 *
 * @param collectionName - Name of the collection
 * @returns The index entry, or null if not found
 *
 * @example
 * const indexEntry = await getIndexEntry("blog");
 * if (!indexEntry) throw new Error("Blog index not found");
 */
export async function getIndexEntry(
  collectionName: string
): Promise<ContentEntry | null> {
  const entries = await getCollection(collectionName as any);
  const indexEntry = entries.find((e) => e.id === "index");
  return indexEntry ?? null;
}

/**
 * NOTE ON RENDERING CONTENT (Astro 5)
 * ====================================
 *
 * In Astro 5, the render() function must be imported directly in .astro files:
 *
 *   import { getCollection, render } from "astro:content";
 *   const { Content } = await render(entry);
 *
 * This is different from Astro 4 where you could call entry.render().
 *
 * We don't export a renderEntry helper here because render() is tightly
 * coupled with Astro's component rendering system and works best when
 * imported directly in the page/component that uses it.
 */

// =============================================================================
// BACKLINKS & GRAPH DATA
// =============================================================================

/**
 * Cached link index data.
 * Loaded once per build/request cycle.
 */
let linkIndexCache: LinkIndex | null = null;

/**
 * Load the link index from the generated JSON file.
 * Uses caching to avoid repeated file reads.
 *
 * In Astro, we read from the public directory using fs at build time.
 * The file is generated by scripts/generate-link-index.mjs before build.
 *
 * @returns The link index data, or null if not found
 */
async function loadLinkIndex(): Promise<LinkIndex | null> {
  if (linkIndexCache) return linkIndexCache;

  try {
    // Use dynamic import for fs to work in both Node and browser contexts
    const { readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const { fileURLToPath } = await import("node:url");

    // Get the project root (two levels up from src/utils/)
    const __dirname = fileURLToPath(new URL(".", import.meta.url));
    const publicPath = join(__dirname, "../../public/link-index.json");

    const content = readFileSync(publicPath, "utf-8");
    linkIndexCache = JSON.parse(content);
    return linkIndexCache;
  } catch {
    // File might not exist yet (first build)
    return null;
  }
}

/**
 * Get true backlinks for a page (pages that link TO this page).
 *
 * @param currentPath - The URL path of the current page (e.g., "/blog/my-post")
 * @returns Array of backlinks with source path, title, and collection
 *
 * @example
 * const backlinks = await getTrueBacklinks("/notes/my-note");
 * // Returns: [{ source: "/blog/post-a", title: "Post A", collection: "blog" }]
 */
export async function getTrueBacklinks(currentPath: string): Promise<TrueBacklink[]> {
  const linkIndex = await loadLinkIndex();
  if (!linkIndex) return [];

  return linkIndex.backlinks[currentPath] || [];
}

/**
 * Get local graph data centered on a specific page.
 * Returns nodes within N hops of the current page.
 *
 * @param currentPath - The URL path of the current page
 * @param depth - How many hops from the current page to include (default: 1)
 * @returns Graph data with nodes and links
 *
 * @example
 * const graphData = await getLocalGraphData("/blog/my-post", 1);
 * // Returns nodes directly connected to "/blog/my-post"
 */
export async function getLocalGraphData(
  currentPath: string,
  depth: number = 1
): Promise<GraphData> {
  const linkIndex = await loadLinkIndex();
  if (!linkIndex) return { nodes: [], links: [] };

  const { nodes: allNodes, links: allLinks } = linkIndex.graph;

  // Build adjacency map for efficient traversal
  const adjacency = new Map<string, Set<string>>();
  for (const link of allLinks) {
    // Add both directions for undirected traversal
    if (!adjacency.has(link.source)) adjacency.set(link.source, new Set());
    if (!adjacency.has(link.target)) adjacency.set(link.target, new Set());
    adjacency.get(link.source)!.add(link.target);
    adjacency.get(link.target)!.add(link.source);
  }

  // BFS to find nodes within depth hops
  const visited = new Set<string>();
  const queue: { id: string; dist: number }[] = [{ id: currentPath, dist: 0 }];
  visited.add(currentPath);

  while (queue.length > 0) {
    const { id, dist } = queue.shift()!;

    if (dist < depth) {
      const neighbors = adjacency.get(id) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push({ id: neighbor, dist: dist + 1 });
        }
      }
    }
  }

  // Filter nodes and links to only include visited nodes
  const nodeMap = new Map(allNodes.map((n) => [n.id, n]));
  const filteredNodes = Array.from(visited)
    .map((id) => nodeMap.get(id))
    .filter((n): n is GraphNode => n !== undefined);

  const filteredLinks = allLinks.filter(
    (link) => visited.has(link.source) && visited.has(link.target)
  );

  return {
    nodes: filteredNodes,
    links: filteredLinks,
  };
}
