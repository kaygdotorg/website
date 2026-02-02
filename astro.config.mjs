/**
 * =============================================================================
 * ASTRO CONFIGURATION
 * =============================================================================
 *
 * Configuration file for the Astro 5 site.
 *
 * KEY FEATURES CONFIGURED:
 * - Site URL for sitemap and canonical URLs
 * - Sitemap generation via @astrojs/sitemap
 * - Tailwind CSS v4 via Vite plugin
 * - Markdown processing with rehype plugins
 *
 * @see https://docs.astro.build/en/reference/configuration-reference/
 */

// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeAssetLinks from "./src/plugins/rehype-asset-links.mjs";
import rehypeInternalLinks from "./src/plugins/rehype-internal-links.mjs";
import rehypeImageOriginals from "./src/plugins/rehype-image-originals.mjs";
import rehypeVideoEmbeds from "./src/plugins/rehype-video-embeds.mjs";
import remarkMdLinks from "./src/plugins/remark-md-links.mjs";
import { fromHtml } from "hast-util-from-html";
import { IMAGE_QUALITY } from "./src/config/images.ts";

// =============================================================================
// CONFIGURATION
// =============================================================================

export default defineConfig({
  // ---------------------------------------------------------------------------
  // SITE URL
  // ---------------------------------------------------------------------------
  // Required for sitemap generation and canonical URL creation.
  // Should match your production domain.
  site: "https://kayg.org",

  // ---------------------------------------------------------------------------
  // IMAGE OPTIMIZATION
  // ---------------------------------------------------------------------------
  // Global settings for Astro's image processing pipeline.
  // Quality constant defined in src/config/images.ts for consistency.
  image: {
    quality: IMAGE_QUALITY,
  },

  // ---------------------------------------------------------------------------
  // INTEGRATIONS
  // ---------------------------------------------------------------------------
  // Official Astro integrations and plugins.
  integrations: [
    // Generates sitemap.xml at build time
    sitemap(),
  ],

  // ---------------------------------------------------------------------------
  // VITE CONFIGURATION
  // ---------------------------------------------------------------------------
  // Vite-specific plugins and configuration.
  vite: {
    plugins: [
      // Tailwind CSS v4 uses a Vite plugin instead of PostCSS
      tailwindcss(),
    ],
  },

  // ---------------------------------------------------------------------------
  // DEV SERVER
  // ---------------------------------------------------------------------------
  // Development server configuration.
  server: {
    // Listen on all interfaces (allows access from other devices on network)
    host: "0.0.0.0",
  },

  // ---------------------------------------------------------------------------
  // MARKDOWN PROCESSING
  // ---------------------------------------------------------------------------
  // Remark and Rehype plugins for transforming markdown.
  markdown: {
    // Remark plugins (run on markdown AST, before HTML conversion)
    remarkPlugins: [
      // Transform .md links to correct URL slugs (strips date prefix and .md extension)
      remarkMdLinks,
    ],
    // Rehype plugins (run on HTML AST, after conversion)
    rehypePlugins: [
      // Add id attributes to headings for anchor links
      rehypeSlug,

      // Transform relative asset links (images, videos, docs) for proper handling
      rehypeAssetLinks,

      // Convert video embeds (using image syntax) to proper <video> elements
      rehypeVideoEmbeds,

      // Add data-original-src to embedded images for lightbox access to originals
      rehypeImageOriginals,

      // Mark internal page links for preview feature
      rehypeInternalLinks,

      // Add clickable anchor links to headings
      [
        rehypeAutolinkHeadings,
        {
          // Append the link after the heading text (not before)
          behavior: "append",

          // Custom link icon (Lucide link icon)
          content: fromHtml(
            `<span class="heading-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </span>`,
            { fragment: true }
          ).children,
        },
      ],
    ],
  },
});
