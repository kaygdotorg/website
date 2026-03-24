---
title: Changelog
date: 2026-01-22 00:00:00
description: A log of notable changes, updates, and improvements to this website.
last-edited: 2026-03-24 06:50:00
---

## 2026-03-24 Tuesday

- **Dependency Refresh**
  - Upgraded Astro from `6.0.5` to `6.0.8`
  - Upgraded Tailwind CSS from `4.2.1` to `4.2.2`
  - Upgraded `@tailwindcss/vite` from `4.2.1` to `4.2.2`
  - `@astrojs/sitemap` was already current and did not need a version bump

- **Transitive Security Fix**
  - Ran `npm audit fix` after the direct dependency refresh
  - This lifted Astro's transitive `h3` dependency from `1.15.5` to `1.15.10`
  - Removes the remaining high-severity advisory without changing site code or configuration

## 2026-03-17 Monday

- **Astro 6 Migration**
  - Upgraded from Astro 5 to Astro 6 with Vite 7, Zod 4, and Shiki 4
  - Zero code changes required — the site was already using modern APIs
  - Build still produces 89 pages with no errors or deprecation warnings

- **Self-Hosted Fonts via Fonts API**
  - Replaced manual @fontsource npm packages with Astro 6's built-in Fonts API
  - Fonts are downloaded at build time and served from the site itself — no external CDN requests
  - Automatic fallback font generation with metric adjustments to prevent layout shift
  - Removed 5 @fontsource packages and 12 CSS import lines

- **Maple Mono — New Monospace Font**
  - Replaced Cascadia Code with Maple Mono for all code and monospace text
  - Round corners, programming ligatures, and a beautiful cursive italic variant
  - Used for inline code, code blocks, language labels, and the copy button

- **Code Block Overhaul**
  - New Catppuccin syntax themes: warm charcoal in dark mode, clean white in light mode
  - Language label in Maple Mono cursive italic (top-left of each block)
  - One-click copy-to-clipboard button (top-right) with toast confirmation
  - Code blocks now span the full card width, matching TOC and other sections
  - Themes adapt automatically when switching between light and dark mode

- **Internal Link Previews Fixed**
  - Hovering over links to other posts within the same section (e.g. blog-to-blog) now shows the preview popup
  - Previously only cross-section links (e.g. blog-to-notes) worked
  - Also fixed the page manifest and link index not being generated during builds

- **Build Pipeline Improvements**
  - Added automatic prebuild step that copies images, generates the page manifest, and builds the link index
  - A fresh `npm run build` now works out of the box — no manual script running needed
  - Images, videos, link previews, and backlinks all work on first build

- **Accessibility**
  - Added aria-labels to all icon-only buttons (heading links, theme toggle, search, etc.)
  - Keyboard focus indicators: pink ring appears when tabbing through interactive elements
  - Heading anchor links no longer show a faint underline when not hovered

- **UI Polish**
  - Fixed Telegram icon (was corrupted, now shows the correct paper plane)
  - Tags now look the same on list page cards and inside articles ("Filed under")
  - "Updated 2mo ago" badges on content cards when a post has been edited
  - Table of contents is automatically hidden on pages with one or no headings
  - Toast notifications now animate smoothly from the very first click
  - Removed unused font packages (dm-sans, tangerine)

- **Umami Analytics**
  - Integrated self-hosted Umami analytics (umami.kayg.org)
  - Cookie-free, GDPR compliant, no external tracking
  - Tracks page views across View Transitions

## 2026-02-04 Tuesday

- **Sidebar Table of Contents**
  - Scrollable mini ToC in left sidebar (desktop only)
  - Shows all headings with faded gradient mask at edges
  - Active heading centered and highlighted (larger font, pink color, full text wrap)
  - Auto-scrolls to center active item while reading
  - Click any item to navigate and scroll both main page and mini ToC
  - Hidden scrollbar for clean appearance

- **Sidebar Local Graph**
  - Moved local graph visualization to right sidebar
  - Compact view with expand button for fullscreen lightbox
  - Node labels only appear on hover (including in lightbox)
  - Removed sidebar headings for minimal look

- **Sidebar Visibility**
  - Both sidebars faded (25% opacity) by default for focused reading
  - Full opacity (100%) on hover for interaction
  - Smooth fade transitions

- **Navigation Links**
  - Previous link (←) left-aligned, next link (→) right-aligned
  - Proper spacing when links wrap to two lines
  - Chronological ordering: previous = older, next = newer

- **Backlinks & Graph Infrastructure**
  - Link index generation script for tracking internal links
  - True backlinks section showing pages that link TO current page
  - Graph data with nodes and edges for visualization
  - Collection-based node coloring

## 2026-02-02 Sunday

- **Image Captions**
  - Markdown image descriptions now display as captions below images
  - Uses semantic `<figure>` and `<figcaption>` HTML elements
  - Matches the existing video caption styling

- **Video Embed Support**
  - New rehype plugin converts `![alt](video.mp4)` syntax to proper `<video>` elements
  - Supports mp4, webm, mov, avi, mkv, m4v formats
  - Videos include controls, metadata preloading, and optional captions

- **Shared Image Quality Setting**
  - Centralized image quality constant (70) in `src/config/images.ts`
  - Used by both Astro's global config and the image manifest endpoint
  - Ensures consistent WebP output quality across the site

- **OG Image Optimization**
  - Homepage cover image now properly optimized for social sharing
  - Converted from 1.4MB PNG to ~73KB WebP automatically
  - Fixed OG image resolution in BaseLayout to use `getImage()`

- **Home Collection Asset Handling**
  - Assets in `src/content/home/` now resolve to root path (`/resume.pdf` not `/home/index/resume.pdf`)
  - Resume download link works correctly
  - Reorganized home assets into `assets/` subdirectory

- **Asset Link Fixes**
  - Added `.bttpreset` to recognized document extensions
  - Fixed broken download links for custom file types

## 2026-01-23 Friday

- **SEO Improvements**
  - Added JSON-LD structured data for Person, WebSite, and BreadcrumbList schemas
  - Added Article schema with rich snippets for blog posts
  - Fixed Open Graph image URL to be absolute
  - Verified robots.txt and sitemap generation

- **Performance**
  - Implemented lazy-loading for Remark42 comments (saves ~50-100KB initial load)
  - Updated Astro to v5.16.15

- **Content & Refactoring**
  - Refactored footer copyright text and social links to be data-driven (in home content)
  - Moved resume.pdf to public folder for proper static serving
  - Added Mastodon, Telegram, and LinkedIn icons to UI
  - Added generic Link icon fallback for future proofing

## 2026-01-22 Thursday

- **Remark42 Comment System**
  - Integrated self-hosted remark42 comments on homepage and all posts
  - "What People Say About This Website" section on homepage
  - Separate frosted card for comments on blog/notes posts
  - Controlled via `display-comments` frontmatter (default: true for posts, false for pages)
  - Auto theme sync - comments switch between light/dark with site theme

- **Work Experience Timeline Refinements**
  - Fixed dot vertical centering on timeline line
  - Reduced spacing between entries for tighter layout
  - Company names now use monospace font (Cascadia Code)
  - Removed pink accent from company names for cleaner aesthetic

- **Gallery Zoom Overlay Improvements**
  - Arrows and counter now aligned in flex container below image
  - Mobile touch handling fixed - no more "flash" when tapping to dismiss
  - Touch events use document delegation to survive View Transitions
  - Added `-webkit-tap-highlight-color: transparent` to prevent visual feedback
  - Horizontal scroll and mouse drag navigation for gallery

- **Progressive Navbar Blur**
  - Blur effect for content scrolling behind navbar
  - Strongest at top, fades to transparent at bottom
  - Horizontally constrained to navbar width with soft edges
  - Rounded bottom corners to avoid boxy appearance

- **SEO & Metadata**
  - Added Open Graph tags for social sharing
  - Added Twitter Card meta tags
  - Implemented canonical URLs
  - Integrated @astrojs/sitemap for automatic sitemap generation

- **Accessibility**
  - Added "Skip to main content" link for keyboard navigation
  - Added `prefers-reduced-motion` fallbacks for animations
  - Added `@supports` fallbacks for backdrop-filter

- **Performance Optimizations**
  - Removed unused font weights and families
  - Added lazy loading for images
  - Added preconnect hints for Unsplash CDN
  - Astro image optimization for local assets
  - Removed ~150 lines of unused bento grid CSS
  - Consolidated duplicate CSS class definitions

- **Code Quality**
  - Documented ~230 `!important` instances with usage guide
  - Consolidated 3 `astro:page-load` listeners into single handler
  - Extracted duplicated theme toggle logic into shared function
  - Fixed event listener stacking on View Transitions navigation

- **Bug Fixes**
  - Fixed image zoom breaking after page navigation
  - Replaced deprecated `navigator.platform` API
  - Prevented IntersectionObserver stacking on homepage

## 2026-01-21 Wednesday

- **Work Experience Timeline**
  - Added timeline component for work history
  - Resume download button integration

- **Navbar Enhancements**
  - Logo expands from @kayg to @kaygdotorg on hover
  - Theme toggle shows "Theme CMD+D" on hover
  - Menu toggle shows "Menu CMD+/" on hover
  - Glass-pill structure for grouped controls

- **Local Fonts**
  - Switched from CDN to self-hosted fonts via @fontsource
  - Resolved CSS import order warnings

- **Component Refactoring**
  - Extracted inline SVG icons into reusable Icon component
  - Extracted tag filter UI into reusable TagFilter component
  - Consolidated month arrays and improved TypeScript types
  - Added 404 page with in-progress content feature

## 2026-01-20 Tuesday

- **Bento Grid Homepage**
  - Implemented mymind-style fluid bento grid layout
  - 6-column grid with 60/40 splits
  - Content-driven card heights
  - Dark mode pastel color palette
  - Obsidian graph canvas animation with IntersectionObserver optimization

- **Search UI Redesign**
  - Opaque capsule design matching navbar aesthetic
  - Improved result card styling and highlighting
  - Fixed clear button positioning
  - Mobile-responsive text scaling

- **Navbar Redesign**
  - Hamburger menu for secondary navigation links
  - Search icon integration
  - Progressive blur effect (later refined)

## 2026-01-19 Sunday

- **Content Migration**
  - Migrated talks from Ghost to Astro
  - Integrated /notes section
  - Changed /writing route to /blog

- **UI Enhancements**
  - Image zoom feature for all prose images
  - Callouts transformed into premium floating cards
  - Table of contents card styling refined
  - Internal link aesthetics improved

- **View Transitions**
  - Added page fade transitions with ClientRouter
  - Fixed theme persistence after navigation
  - Fixed interactive element re-initialization

- **Typography & Styling**
  - Reduced line-height for better readability
  - Tighter list spacing
  - Frosted card effect (renamed from grain effect)
