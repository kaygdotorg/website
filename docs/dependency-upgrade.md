# Astro 7 and TypeScript 7

Upgraded on 2026-09-13 to Astro 7.3.2 and TypeScript 7.0.2, with all
direct dependencies checked against npm's stable `latest` tag. Node 22.12+
is required. The lockfile includes refreshed compatible transitive packages.

Run `npm run check` for Astro content synchronization and native TypeScript
checking of `.ts`/checked JavaScript files. This does **not** type-check `.astro`
frontmatter or templates. `@astrojs/check` 0.9.10 supports TypeScript 5/6 and
cannot use TypeScript 7's native compiler APIs. It is deliberately not installed
with incompatible peers. `npm run build` compiles templates and builds search.

Astro 7's supported `unified()` Markdown processor retains the existing custom
remark/rehype link, original-image, video and heading transforms. Plugin options
now live inside that processor. `compressHTML: true` retains previous inline
whitespace behavior. Sharp encoder configuration now sets the intended default
image quality through supported service options.

References:
- https://docs.astro.build/en/guides/upgrade-to/v7/
- https://docs.astro.build/en/guides/typescript/#type-checking
- https://github.com/withastro/roadmap/discussions/1321
