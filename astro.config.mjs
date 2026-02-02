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
import { fromHtml } from "hast-util-from-html";

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
  // Rehype plugins for transforming markdown HTML output.
  markdown: {
    rehypePlugins: [
      // Add id attributes to headings for anchor links
      rehypeSlug,

      // Transform relative asset links (images, videos, docs) for proper handling
      rehypeAssetLinks,

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
