/**
 * =============================================================================
 * ASTRO CONFIGURATION
 * =============================================================================
 *
 * Configuration file for the Astro 6 site.
 *
 * KEY FEATURES CONFIGURED:
 * - Site URL for sitemap and canonical URLs
 * - Sitemap generation via @astrojs/sitemap
 * - Tailwind CSS v4 via Vite plugin
 * - Fonts API with fontsource provider (replaces manual @fontsource imports)
 * - Markdown processing with rehype plugins
 *
 * @see https://docs.astro.build/en/reference/configuration-reference/
 */

// @ts-check
import { defineConfig, fontProviders } from "astro/config";
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
  // FONTS
  // ---------------------------------------------------------------------------
  // Astro 6 Fonts API — replaces manual @fontsource CSS imports.
  // Fonts are downloaded, cached locally, and served from the site itself
  // (no third-party requests). Preload links and fallbacks are automatic.
  //
  // The cssVariable names match the Tailwind @theme variables defined in
  // global.css (--font-heading, --font-body, etc.) so existing styles
  // continue to work without changes.
  //
  // Font roles:
  //   --font-heading:  Playfair Display — article titles, section headings
  //   --font-body:     Outfit — body text, cards, descriptions
  //   --font-ui:       SN Pro — navigation, buttons, UI chrome
  //   --font-mono:     Cascadia Code — code blocks, inline code
  //   --font-cursive:  Mrs Saint Delafield — decorative/signature accents
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Playfair Display",
      cssVariable: "--font-heading",
      weights: [400, 500, 600],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Outfit",
      cssVariable: "--font-body",
      weights: [400, 500, 600, 700],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "SN Pro",
      cssVariable: "--font-ui",
      weights: [500, 600, 700],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Cascadia Code",
      cssVariable: "--font-mono",
      weights: [400],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Mrs Saint Delafield",
      cssVariable: "--font-cursive",
      weights: [400],
      subsets: ["latin"],
    },
  ],

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
    // Vite 7 blocks unrecognized hostnames by default (DNS rebinding protection).
    // Allow all hosts so the site is accessible via Tailscale MagicDNS ("code")
    // and other network names in both dev and preview modes.
    server: {
      allowedHosts: true,
    },
    preview: {
      allowedHosts: true,
    },
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

          // Accessible label for the icon-only anchor link
          properties: {
            ariaLabel: "Copy link to section",
          },

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
