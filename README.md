# Personal Landing Page

A personal website built with Astro, Tailwind CSS, and DaisyUI.

## Structure

```
src/
├── content/           # Markdown content (from Obsidian)
│   ├── pages/         # Content pages (now.md, uses.md)
│   └── config.ts      # Content collection schemas
├── layouts/
│   └── BaseLayout.astro
├── pages/             # Route pages
│   ├── index.astro    # Landing page
│   ├── now.astro      # /now page
│   ├── uses.astro     # /uses page
│   ├── photography.astro
│   └── writing.astro
└── styles/
    └── global.css     # Tailwind + DaisyUI + custom styles
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Using Obsidian Content

1. Write your content in Obsidian using standard markdown
2. Copy the `.md` files to `src/content/pages/`
3. Add frontmatter with required fields:

```md
---
title: Page Title
description: Optional description
lastUpdated: December 2024
---

Your markdown content here...
```

## Customization

### Changing the theme

Edit `src/styles/global.css` to customize:
- Colors (the `--color-warm-*` variables)
- Fonts (currently using Instrument Serif for display)
- DaisyUI theme (dark by default)

### Adding pages

1. Create a `.md` file in `src/content/pages/`
2. Create a corresponding `.astro` file in `src/pages/`
3. Use `getEntry()` to fetch and render the markdown

### Photography page

Replace the placeholder Unsplash images with your own:
1. Add images to `public/photos/`
2. Update the `photos` array in `src/pages/photography.astro`

## Adding Quartz for /writing

To add your Obsidian vault as a digital garden:

1. Clone Quartz into a `/writing` subdirectory
2. Configure your deployment to serve both builds
3. Update the navigation link in `BaseLayout.astro` to point to `/writing/`

## Deployment

This site can be deployed to:
- **Vercel**: Connect repo, it auto-detects Astro
- **Netlify**: Same, auto-detection works
- **GitHub Pages**: Use the `@astrojs/github-pages` adapter

## Tech Stack

- [Astro](https://astro.build) - Static site generator
- [Tailwind CSS v4](https://tailwindcss.com) - Utility CSS
- [DaisyUI](https://daisyui.com) - Component library
- [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) - Display font
