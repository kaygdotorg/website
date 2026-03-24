/**
 * =============================================================================
 * CONTENT PATH RESOLUTION HELPERS
 * =============================================================================
 *
 * Centralizes how markdown and asset paths are resolved from source markdown
 * files into public site URLs. This exists because the site's output URLs do
 * not mirror the source tree directly:
 *
 * - Markdown entries live in src/content/<collection>/<entry>.md
 * - Published pages live at /<collection>/<slug>
 * - Referenced assets are copied to public/<collection>/<slug>/<filename>
 *
 * Authors also write links in multiple valid CommonMark/Obsidian forms:
 * - ./sibling-post.md
 * - sibling-post.md
 * - ../notes/other-post.md
 * - images/screenshot.png
 * - ./images/screenshot.png
 *
 * The rule is simple: resolve local paths relative to the source markdown file
 * first, then translate that resolved target into the site's public URL shape.
 * That preserves CommonMark semantics while still honoring the site's
 * slug-based routing and asset-copy conventions.
 *
 * AUTHORING SPEC
 * --------------
 * In markdown body content:
 * - Page links support both ./post.md and post.md
 * - Cross-collection page links support ../notes/post.md style paths
 * - Asset links and embeds support both ./image.png and image.png
 * - Fragments are preserved, so post.md#Heading remains anchored after rewrite
 *
 * In frontmatter:
 * - Only asset-like values are resolved and copied
 * - Frontmatter is not treated as a markdown-page-link surface
 * - Detection is stricter than markdown body parsing so labels like
 *   "Twitter/X" and email addresses are not mistaken for files
 *
 * Published output:
 * - Markdown entry links become absolute page URLs like /blog/post-slug
 * - Relative assets become copied public URLs like /blog/post-slug/file.png
 * - Legacy notes links now resolve to /blog so older authored paths continue
 *   to work after the notes-to-blog merge
 */

import fs from "fs";
import path from "path";

// Content collections that map to routed pages or copied content assets.
export const CONTENT_COLLECTIONS = [
  "blog",
  "notes",
  "uses",
  "now",
  "talks",
  "changelog",
  "about",
  "contact",
  "homelab",
  "photography",
  "home",
];

// Legacy collection aliases keep old authored paths working after structural
// moves. A markdown link such as ../notes/post.md should now land on /blog/post
// even if the notes source folder is removed.
const ROUTE_COLLECTION_ALIASES = {
  notes: "blog",
};

const slugCache = new Map();

/**
 * Convert filesystem paths to POSIX separators so path parsing behaves
 * consistently across dev machines and CI.
 */
function toPosixPath(filePath) {
  return filePath.split(path.sep).join("/");
}

/**
 * Split a URL-like string into its pathname and trailing query/hash suffix.
 * Rewriters preserve the suffix so heading anchors and block refs survive.
 */
export function splitUrlSuffix(url) {
  const queryIndex = url.indexOf("?");
  const hashIndex = url.indexOf("#");
  const suffixStart =
    queryIndex === -1
      ? hashIndex
      : hashIndex === -1
        ? queryIndex
        : Math.min(queryIndex, hashIndex);

  if (suffixStart === -1) {
    return { pathname: url, suffix: "" };
  }

  return {
    pathname: url.slice(0, suffixStart),
    suffix: url.slice(suffixStart),
  };
}

/**
 * External, root-absolute, and non-content URLs are never resolved against the
 * source markdown file.
 */
export function isExternalLikeHref(href) {
  if (!href) return true;

  return (
    href.startsWith("#") ||
    href.startsWith("/") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("data:") ||
    href.startsWith("javascript:") ||
    /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(href)
  );
}

/**
 * Only relative, non-external paths should be resolved against the source
 * markdown file. This covers both "./file" and the CommonMark/Obsidian bare
 * "file" form that the user wants supported.
 */
export function isResolvableRelativeHref(href) {
  if (!href) return false;
  const { pathname } = splitUrlSuffix(href);
  return Boolean(pathname) && !isExternalLikeHref(pathname);
}

/**
 * Extract build-time context from a markdown file path under src/content.
 */
export function getContentFileContext(filePath) {
  if (!filePath) return null;

  const normalizedFilePath = toPosixPath(path.resolve(filePath));
  const match = normalizedFilePath.match(/^(.*\/src\/content)\/(.+)$/);
  if (!match) return null;

  const [, contentRoot, relativeFilePath] = match;
  const segments = relativeFilePath.split("/").filter(Boolean);
  const collection = segments[0] || null;

  if (!collection || !CONTENT_COLLECTIONS.includes(collection)) {
    return null;
  }

  return {
    contentRoot,
    collection,
    relativeFilePath,
    relativeDirectory: path.posix.dirname(relativeFilePath),
  };
}

/**
 * Strip the YYYYMMDD- prefix used by most content filenames.
 */
export function stripDatePrefix(name) {
  return name.replace(/^\d{8}-/, "");
}

/**
 * Read a target entry's explicit frontmatter slug once and cache it. Content
 * builds traverse many links, so caching avoids repeated disk reads while
 * keeping the implementation straightforward.
 */
export function getEntrySlugFromFile(filePath) {
  if (!filePath) return null;
  if (slugCache.has(filePath)) return slugCache.get(filePath);

  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      slugCache.set(filePath, null);
      return null;
    }

    const slugMatch = frontmatterMatch[1].match(/^slug:\s*(.+)$/m);
    if (!slugMatch) {
      slugCache.set(filePath, null);
      return null;
    }

    const slug = slugMatch[1].trim().replace(/^["']|["']$/g, "");

    // Collection index pages use route-like slugs such as "/notes". Those are
    // handled by filename-based routing logic, so only cache concrete entry
    // slugs here.
    if (!slug || slug.startsWith("/")) {
      slugCache.set(filePath, null);
      return null;
    }

    slugCache.set(filePath, slug);
    return slug;
  } catch {
    slugCache.set(filePath, null);
    return null;
  }
}

/**
 * Resolve a local href against the current markdown file and return a target
 * inside src/content. If the path escapes src/content or lands outside a known
 * collection, we leave it alone instead of fabricating a public URL.
 */
export function resolveContentTarget(href, sourceFilePath) {
  const context = getContentFileContext(sourceFilePath);
  if (!context) return null;

  const { pathname, suffix } = splitUrlSuffix(href);
  if (!pathname) return null;

  let resolvedRelativePath = null;

  if (pathname.startsWith("/")) {
    resolvedRelativePath = path.posix.normalize(pathname.slice(1));
  } else if (isResolvableRelativeHref(pathname)) {
    resolvedRelativePath = path.posix.normalize(
      path.posix.join(context.relativeDirectory, pathname)
    );
  } else {
    return null;
  }

  if (
    !resolvedRelativePath ||
    resolvedRelativePath === "." ||
    resolvedRelativePath.startsWith("../")
  ) {
    return null;
  }

  const segments = resolvedRelativePath.split("/").filter(Boolean);
  const collection = segments[0] || null;
  if (!collection || !CONTENT_COLLECTIONS.includes(collection)) {
    return null;
  }

  return {
    context,
    pathname,
    suffix,
    collection,
    resolvedRelativePath,
    targetFilePath: path.join(context.contentRoot, ...segments),
  };
}

/**
 * Resolve a markdown file link to the final routed page URL.
 *
 * Successful rewrites always become absolute site paths. That avoids browser-
 * relative directory bugs such as /blog/post/other-post when the intended
 * target is /blog/other-post. The same rule also keeps cross-collection links
 * stable, for example:
 * - ../notes/20240713-x-forwarded-for.md -> /blog/x-forwarded-for
 * - ../blog/20240602-virtual-router-proxmox-skullsaints-onyx.md#Heading
 *   -> /blog/virtual-router-proxmox-skullsaints-onyx#Heading
 */
export function resolveMarkdownEntryUrl(href, sourceFilePath) {
  const target = resolveContentTarget(href, sourceFilePath);
  if (!target || !target.pathname.endsWith(".md")) return href;

  const targetBaseName = path.basename(target.targetFilePath);
  if (targetBaseName === "index.md") {
    return target.collection === "home"
      ? `/${target.suffix}`
      : `/${target.collection}${target.suffix}`;
  }

  const explicitSlug = getEntrySlugFromFile(target.targetFilePath);
  const derivedSlug = stripDatePrefix(path.basename(target.targetFilePath, ".md"));
  const slug = explicitSlug || derivedSlug;
  const routedCollection = ROUTE_COLLECTION_ALIASES[target.collection] || target.collection;

  if (routedCollection === "home") {
    return `/${slug}${target.suffix}`;
  }

  return `/${routedCollection}/${slug}${target.suffix}`;
}

/**
 * Resolve a local asset reference into the copied public asset URL.
 *
 * Asset copying intentionally flattens source subpaths to the filename under
 * /<collection>/<entry-slug>/, so the public URL follows that same layout.
 */
export function toPublicAssetUrl(href, sourceFilePath) {
  if (!isResolvableRelativeHref(href)) return href;

  const context = getContentFileContext(sourceFilePath);
  if (!context) return href;

  const { pathname, suffix } = splitUrlSuffix(href);
  const filename = path.posix.basename(pathname);
  if (!filename) return href;

  const entrySlug =
    getEntrySlugFromFile(sourceFilePath) ||
    stripDatePrefix(path.basename(sourceFilePath, ".md"));

  if (context.collection === "home") {
    return `/${filename}${suffix}`;
  }

  return `/${context.collection}/${entrySlug}/${filename}${suffix}`;
}
