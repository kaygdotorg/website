---
title: Changelog
date: 2026-01-22 00:00:00
description: A log of notable changes, updates, and improvements to this website.
last edited: 2026-01-23 12:44:23
---

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
