# Editing the website

Edit source content in `src/content/`. Do not edit generated copies in `public/`
or output in `dist/`: the build recreates those files.

## Where to edit

| Change | Source |
| --- | --- |
| Homepage text, navigation, social links, work history | `src/content/home/index.md` |
| Homepage deck cards | `card-photos` in that same file |
| Homepage Apps graphic | `src/content/home/assets/apps-card.svg` |
| Apps page title, introduction and body | `src/content/apps/index.md` |
| Public guide for language-model tools | `public/llms.txt` |
| About or homelab | `src/content/about/index.md`, `src/content/homelab/index.md` |
| Writing | `src/content/blog/` |
| Talks, Now, Uses | Matching folder under `src/content/` |
| Photographs and photo decks | `src/content/photography/`; see `docs/photography.md` |
| Shared colors and typography | `src/styles/global.css` |
| Component behavior and layout | `src/components/`, `src/layouts/`, `src/pages/` |

Markdown begins with YAML between `---` lines. Those fields supply titles,
dates, images and other metadata. Everything below is the page body.
`src/content.config.ts` defines which fields each collection accepts.

`public/llms.txt` is a manually curated, plain-text Markdown overview following
the llms.txt proposal. Keep its section links and preview/placeholder notes in
sync with the site. It is served directly at `/llms.txt` and linked from the
HTML head; it does not grant crawler access or replace `robots.txt`.

## Add an article

Create `src/content/blog/YYYYMMDD-my-article.md`:

```markdown
---
title: My article
date: 2026-10-02
description: A short description for the listing and search engines.
tags: [software]
draft: true
---

Write the article here.
```

The date prefix is removed from the URL, yielding `/blog/my-article`. Remove
`draft: true` when ready to publish. Put local images in a matching adjacent
folder, for example `src/content/blog/YYYYMMDD-my-article/photo.jpg`, and embed
them as `![Useful alt text](./YYYYMMDD-my-article/photo.jpg)`.

List-page `index.md` files control the collection's title and description; they
are not ordinary entries. Photography is different: one entry is one glass
card, and a `photos` array gives that card multiple photographs.

## Preview and publish

Run `npm run dev` for live reload while editing. Use the URL printed by Astro;
an existing server can make it select a different port.

`npm run preview` serves the last production build and does **not** update when
you edit files. Run `npm run build` again before reviewing that preview.
Pagefind search also needs a built index; use `npm run build:search` to test it
in development.

Before publishing, run `npm run check` and `npm run build`. Commit source edits
and push to GitHub's `main` branch; the connected Cloudflare Pages project
builds that commit. Deployment success must still be checked.

## How the pieces fit

`content.config.ts` loads Markdown collections. A route in `src/pages/` reads
the appropriate collection, then passes content to reusable layouts and
components. `BaseLayout` supplies shared navigation, background and controls;
`MarkdownLayout` renders article pages; `TimelineLayout` renders Now/Uses/Talks
lists. Plugins in `src/plugins/` transform Markdown links, media and images.

The prebuild scripts copy referenced original assets and generate link/preview
indexes. Astro builds pages and optimized image previews; Pagefind indexes the
finished pages. Keep original assets beside their Markdown or use `public/`
for exact files such as PDFs. Local photography currently needs an explicit
`thumb` for a smaller preview; a public path alone is not image optimization.

`npm run sync` is an optional import from an Obsidian vault configured with
`OBSIDIAN_PATH` in `.env`. It writes repository content, so review its diff before
committing, especially if you also edit the same files directly.
