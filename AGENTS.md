- Always thoroughly describe changes as comments/documentation within the file.
- With every change made, include a commit that has a conventional commit conforming title and descriptive message.
- Always prefer simplicity over clever tricks in code.
- Performance is always a priority.

## Assets & Search

### Unoptimized Assets
For assets that should bypass the Astro/Vite optimization pipeline (e.g., PDFs, large RAW images, or files where you need precise control), place them in the `public/` directory.
- Access them via root-relative paths like `/path/to/asset.jpg`.
- Optimization (WebP conversion, resizing) only happens for assets in `src/`.

### Dev Mode Search
Search (Pagefind) requires a build to work. To test search UI/UX during development:
1. Run `npm run build:search`.
2. This generates the index and places it in `public/pagefind/`.
3. The search bar will now function in `npm run dev`.
4. This directory is git-ignored and should be deleted if no longer needed for dev testing.