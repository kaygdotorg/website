/**
 * =============================================================================
 * ASTRO 5 CONTENT COLLECTIONS CONFIGURATION
 * =============================================================================
 *
 * This file defines all content collections for the site using Astro 5's
 * Content Layer API with the built-in glob() loader.
 *
 * ARCHITECTURE OVERVIEW:
 * ----------------------
 * Content is stored in `src/content/` within the repository.
 * The path is computed dynamically relative to this config file.
 *
 * Each collection corresponds to a content type:
 * - blog: Long-form articles
 * - notes: Short technical notes (Digital Garden style)
 * - talks: Presentation slides and talk content
 * - now: "What I'm doing now" updates
 * - uses: Tools and setup documentation
 * - home/about/contact/homelab/changelog: Static pages
 * - photography: Gallery page + photo entries (combined)
 *
 * FILE NAMING CONVENTION:
 * ----------------------
 * Most content files use the pattern: YYYYMMDD-slug.md
 * Example: 20240713-my-article-title.md
 *
 * The generateId function strips the date prefix for cleaner URLs:
 * - File: 20240713-my-article-title.md
 * - Generated ID: my-article-title
 * - URL: /blog/my-article-title
 *
 * ASTRO 5 CHANGES FROM v4:
 * ------------------------
 * - Config file location: src/content.config.ts (not src/content/config.ts)
 * - Uses glob() loader instead of type: 'content'
 * - render() is imported from astro:content, not called on entry
 * - Entry IDs are customizable via generateId option
 *
 * @see https://docs.astro.build/en/guides/content-collections/
 * @see https://docs.astro.build/en/reference/content-loader-reference/
 */

import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// =============================================================================
// CONTENT BASE PATH
// =============================================================================

/**
 * Dynamically computed path to the content directory.
 *
 * Uses import.meta.url to get the current file's location, then resolves
 * the 'content' folder relative to it. This approach:
 * - Works regardless of where the project is cloned
 * - Doesn't break when moving/renaming the project folder
 * - Is the standard ESM way to replace __dirname
 */
const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_BASE = join(__dirname, "content");

// =============================================================================
// SCHEMAS
// =============================================================================

/**
 * Schema for static pages (about, contact, homelab, etc.)
 * These pages have minimal frontmatter requirements.
 *
 * .passthrough() allows additional fields in frontmatter without validation,
 * enabling flexibility for page-specific settings like display-comments.
 */
const pageSchema = z
  .object({
    /** Page title (required) */
    title: z.string(),

    /** Page description for SEO/previews (optional) */
    description: z.string().optional(),

    /** Original creation date (optional, coerced to Date) */
    date: z.coerce.date().optional(),

    /** Last modification date (optional, coerced to Date) */
    "last edited": z.coerce.date().optional(),

    /** Whether to hide this page (optional, defaults to false) */
    draft: z.boolean().optional().default(false),
  })
  .passthrough();

/**
 * Schema for content posts (blog, notes, talks, now, uses)
 * These have richer metadata including tags, cover images, and excerpts.
 */
const postSchema = ({ image }: { image: () => z.ZodObject<any> }) =>
  z.object({
    /** Post title (required) */
    title: z.string(),

    /** Post description for SEO/previews (optional) */
    description: z.string().optional(),

    /** Publication date (required, coerced to Date) */
    date: z.coerce.date(),

    /** Last modification date (optional, coerced to Date) */
    "last edited": z.coerce.date().optional(),

    /** Array of tags for categorization (optional, nullable for YAML compatibility) */
    tags: z.array(z.string()).nullable().optional(),

    /** Cover image path or URL (optional) */
    "cover-image": z.union([image(), z.string()]).optional(),

    /** Whether to hide this post (optional, defaults to false) */
    draft: z.boolean().optional().default(false),

    /**
     * Custom URL slug override (optional, otherwise derived from filename).
     * Accepts either a string or a Date (YAML parses "2024-04-02" as Date).
     * Dates are converted to YYYY-MM-DD string format.
     */
    slug: z
      .union([z.string(), z.date()])
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        if (val instanceof Date) {
          // Convert Date to YYYY-MM-DD string
          return val.toISOString().split("T")[0];
        }
        return val;
      }),

    /** Manual excerpt override (optional, otherwise extracted from content) */
    excerpt: z.string().optional(),

    /** Whether to show comments section (optional) */
    "display-comments": z.boolean().optional(),
  })
    .passthrough();

/**
 * Schema for photo gallery entries.
 * Each photo is a markdown file with metadata about the image.
 */
const photoSchema = z.object({
  /** Full-resolution image path/URL (required) */
  src: z.string(),

  /** Thumbnail image path/URL (optional, falls back to src) */
  thumb: z.string().optional(),

  /** Alt text for accessibility (required) */
  alt: z.string(),

  /** Photo title (optional) */
  title: z.string().optional(),

  /** Category for filtering (required) */
  category: z.string(),

  /** Location where photo was taken (optional) */
  location: z.string().optional(),

  /** Date photo was taken (optional) */
  date: z.coerce.date().optional(),

  /** Camera/equipment used (optional) */
  camera: z.string().optional(),
});

// =============================================================================
// ID GENERATOR
// =============================================================================

/**
 * Custom ID generator for content entries.
 *
 * Transforms filenames into URL-friendly IDs by:
 * 1. Removing the .md extension
 * 2. Stripping the YYYYMMDD- date prefix (if present)
 *
 * EXAMPLES:
 * - "20240713-my-article.md" → "my-article"
 * - "index.md" → "index"
 * - "about-page.md" → "about-page"
 *
 * @param entry - The file path relative to the collection's base directory
 * @returns Clean ID suitable for URLs
 */
const generateId = ({ entry }: { entry: string }): string => {
  return entry
    .replace(/\.md$/, "") // Remove .md extension
    .replace(/^\d{8}-/, ""); // Remove YYYYMMDD- date prefix
};

// =============================================================================
// COLLECTION DEFINITIONS
// =============================================================================

/**
 * Helper to create a collection with consistent configuration.
 * Reduces repetition and ensures all collections use the same settings.
 *
 * @param folder - Subfolder name within CONTENT_BASE
 * @param schema - Zod schema for validation
 * @returns Collection definition object
 */
const createCollection = (folder: string, schema: any) =>
  defineCollection({
    loader: glob({
      pattern: "*.md",
      base: `${CONTENT_BASE}/${folder}`,
      generateId,
    }),
    schema,
  });

// -----------------------------------------------------------------------------
// Post Collections (blog, notes, talks, now, uses)
// These have dates, tags, and full content features
// -----------------------------------------------------------------------------

const blog = createCollection("blog", postSchema);
const notes = createCollection("notes", postSchema);
const talks = createCollection("talks", postSchema);
const now = createCollection("now", postSchema);
const uses = createCollection("uses", postSchema);

// -----------------------------------------------------------------------------
// Page Collections (home, about, contact, homelab, changelog)
// These are simpler static pages
// -----------------------------------------------------------------------------

/**
 * Schema for the home page with complex frontmatter structure.
 *
 * IMAGE HANDLING:
 * ---------------
 * Uses z.union([image(), z.string()]) for image fields to support both:
 * - Local files (./image.jpeg) → processed by Astro, returns ImageMetadata
 * - External URLs (https://...) → passed through as strings
 * - Special identifiers ("obsidian-graph") → passed through as strings
 *
 * The page component checks `typeof image === 'string'` to handle both cases.
 *
 * NOTE: The schema is a function that receives { image } from Astro.
 * This is required for the image() helper to work in content collections.
 */
const homeSchema = ({ image }: { image: () => z.ZodObject<any> }) =>
  z
    .object({
      title: z.string(),
      name: z.string().optional(),
      tagline: z.string().optional(),
      email: z.string().optional(),
      date: z.coerce.date().optional(),
      "last edited": z.coerce.date().optional(),

      /** Profile image - local file or URL */
      profileImage: z.union([image(), z.string()]).optional(),

      /** Card photos for the hero section polaroid stack */
      cardPhotos: z
        .array(
          z.object({
            src: z.union([image(), z.string()]),
            label: z.string(),
            href: z.string(),
            date: z.string().optional(),
          })
        )
        .optional(),

      /** Bento grid cards with images and display configuration */
      bentoCards: z
        .array(
          z.object({
            id: z.string(),
            title: z.string(),
            category: z.string(),
            summary: z.string(),
            href: z.string(),
            image: z.union([image(), z.string()]),
            /**
             * Display variant for card layout.
             * "default" - Standard card with image above content
             * "graph" - Canvas animation instead of static image
             * "photostack" - Stack of photos (auto-selected for photography card)
             */
            layoutVariant: z.enum(["default", "graph", "photostack"]).optional().default("default"),
            /** Show pulsing dot indicator (for "now" style cards) */
            showPulse: z.boolean().optional().default(false),
            /** Override the displayed category text (optional) */
            displayCategory: z.string().optional(),
            /** Show title in meta area instead of main heading area */
            titleInMeta: z.boolean().optional().default(false),
          })
        )
        .optional(),

      interests: z.array(z.string()).optional(),
      socialLinks: z
        .array(z.object({ label: z.string(), url: z.string() }))
        .optional(),
      recentWriting: z
        .array(z.object({ title: z.string(), date: z.string(), href: z.string() }))
        .optional(),
      projects: z
        .array(z.object({ title: z.string(), description: z.string(), link: z.string() }))
        .optional(),
      quote: z.string().optional(),
      workExperience: z
        .array(
          z.object({
            role: z.string(),
            company: z.string(),
            startDate: z.string(),
            endDate: z.string(),
            isCurrent: z.boolean().optional(),
          })
        )
        .optional(),
      resumeUrl: z.string().optional(),
      footerText: z.string().optional(),

      /**
       * Cover image for the home page, usable as OG image.
       * Provides consistency with postSchema's cover-image field.
       * Can be used as pageOgImage source in index.astro.
       */
      "cover-image": z.union([image(), z.string()]).optional(),

      /**
       * Site-wide metadata for SEO and social sharing.
       * cover-image is used as the default OG image for pages that don't specify one.
       */
      "site-name": z.string().optional(),

      /**
       * Navigation configuration for the site header.
       * Replaces hardcoded navLinks arrays in BaseLayout.astro.
       */
      navLinks: z
        .array(
          z.object({
            href: z.string(),
            label: z.string(),
            /** Whether to show in main nav (false = mobile menu only) */
            visible: z.boolean().optional().default(true),
          })
        )
        .optional(),

      /**
       * Homepage section labels and headings.
       * Content-driven UI text replaces hardcoded strings in index.astro.
       */
      heroHint: z.string().optional(),
      bentoSectionLabel: z.string().optional(),
      bentoSectionTitle: z.string().optional(),
      commentsSectionLabel: z.string().optional(),
      commentsSectionTitle: z.string().optional(),
    })
    .passthrough();

/**
 * Home collection - uses function-form schema to access image() helper.
 * Cannot use createCollection helper because schema needs to be a function.
 */
const home = defineCollection({
  loader: glob({
    pattern: "*.md",
    base: `${CONTENT_BASE}/home`,
    generateId,
  }),
  schema: homeSchema,
});
const about = createCollection("about", pageSchema);
const contact = createCollection("contact", pageSchema);
const homelab = createCollection("homelab", pageSchema);
const changelog = createCollection("changelog", pageSchema);

// -----------------------------------------------------------------------------
// Photography Collection
// Uses a combined schema - index.md uses pageSchema fields, photos use photoSchema.
// The union allows both types in the same folder.
// -----------------------------------------------------------------------------

/**
 * Combined schema for photography collection.
 * - index.md: Uses title, description (pageSchema-like)
 * - photo files: Use src, alt, category, etc. (photoSchema)
 *
 * Using passthrough() to allow flexible frontmatter across both types.
 */
const photographySchema = z
  .object({
    // Common fields
    title: z.string().optional(),
    description: z.string().optional(),
    date: z.coerce.date().optional(),
    "last edited": z.coerce.date().optional(),
    draft: z.boolean().optional().default(false),

    // Photo-specific fields (optional for index.md)
    src: z.string().optional(),
    thumb: z.string().optional(),
    alt: z.string().optional(),
    category: z.string().optional(),
    location: z.string().optional(),
    camera: z.string().optional(),

    // Page-specific fields
    "display-in-progress": z.boolean().optional(),
  })
  .passthrough();

const photography = createCollection("photography", photographySchema);

// =============================================================================
// EXPORTS
// =============================================================================

/**
 * All collections exported for use throughout the site.
 * Import in pages/components with: import { getCollection } from "astro:content"
 */
export const collections = {
  // Post collections
  blog,
  notes,
  talks,
  now,
  uses,
  // Page collections
  home,
  about,
  contact,
  homelab,
  changelog,
  // Photography (includes both page metadata and photo entries)
  photography,
};
