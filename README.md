# Personal Website

Personal site built with Astro 7, content collections, and a custom UI layer.

For everyday edits, start with [the editing guide](docs/editing.md).

## Tech Stack

- [Astro 7](https://astro.build)
- [Tailwind CSS v4](https://tailwindcss.com)
- [DaisyUI](https://daisyui.com)
- [Pagefind](https://pagefind.app) for on-site search

## Project Layout

```text
src/
  content/                 # Collection content (markdown + local assets)
    blog/
    talks/
    now/
    uses/
    photography/
    home/
    apps/
    about/
    homelab/
    changelog/
  content.config.ts        # Astro content collection schemas/loaders
  pages/
    index.astro
    apps.astro
    blog.astro
    notes.astro
    talks.astro
    photography.astro
    changelog.astro
    now/index.astro
    uses/index.astro
    [page].astro
    [collection]/[slug].astro
  layouts/
    BaseLayout.astro
    MarkdownLayout.astro
    TimelineLayout.astro
  components/
  styles/global.css
scripts/
  sync-obsidian.mjs
public/
  favicon.svg
  robots.txt
  resume.pdf
```

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

`npm run build` generates the Astro output and runs Pagefind against `dist/`.

## Search in Dev Mode

Pagefind needs a built index. To test search while running dev server:

```bash
npm run build:search
npm run dev
```

This writes the index to `public/pagefind/` (git-ignored).

## Content Workflow

- Markdown content lives under `src/content/<collection>/`.
- Collection schemas and frontmatter validation live in `src/content.config.ts`.
- Use `scripts/sync-obsidian.mjs` to sync from an Obsidian vault (requires `OBSIDIAN_PATH` in `.env`).

## Assets

- Put assets in `src/content/...` when you want Astro/Vite optimization.
- Put assets in `public/` when you need exact, unprocessed files (for example PDFs or files that should bypass optimization).

## License

- Code: MIT (`LICENSE`)
- Content: CC BY-NC 4.0 (`src/content/LICENSE`)
