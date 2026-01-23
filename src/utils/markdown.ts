/**
 * =============================================================================
 * MARKDOWN UTILITIES
 * =============================================================================
 *
 * Helper functions for processing and extracting content from markdown text.
 * Used primarily for generating excerpts and extracting URLs from markdown links.
 */

// =============================================================================
// URL EXTRACTION
// =============================================================================

/**
 * Extracts a URL from various markdown link formats.
 *
 * SUPPORTED FORMATS:
 * - Standard markdown: [label](url)
 * - Wrapped markdown: ([label](url))
 * - Wrapped URL: (url)
 * - Angle brackets: (<url>) or <url>
 * - Plain URL: https://example.com
 *
 * @param link - String that may contain a markdown link
 * @returns The extracted URL, or undefined if no valid URL found
 *
 * @example
 * extractUrlFromMarkdown("[Click here](https://example.com)")
 * // Returns: "https://example.com"
 *
 * extractUrlFromMarkdown("(<https://example.com>)")
 * // Returns: "https://example.com"
 */
export function extractUrlFromMarkdown(
  link: string | undefined | null
): string | undefined {
  if (!link) return undefined;

  // 1. Handle standard or wrapped markdown links: [label](url) or ([label](url))
  const markdownLinkMatch = link.match(/\[.*\]\((.*)\)/);
  if (markdownLinkMatch?.[1]) {
    return markdownLinkMatch[1].replace(/[<>]/g, "").trim();
  }

  // 2. Handle wrapped URLs: (url) or (<url>)
  const parenMatch = link.match(/\((.*)\)/);
  if (parenMatch?.[1]) {
    return parenMatch[1].replace(/[<>]/g, "").trim();
  }

  // 3. Handle angle bracket URLs: <url>
  const angleMatch = link.match(/<(.*)>/);
  if (angleMatch?.[1]) {
    return angleMatch[1].trim();
  }

  // 4. Return as-is (plain URL)
  return link.trim();
}

// =============================================================================
// EXCERPT EXTRACTION
// =============================================================================

/**
 * Maximum length for auto-generated excerpts (in characters).
 * Keeps excerpts concise for card displays and SEO descriptions.
 */
const MAX_EXCERPT_LENGTH = 200;

/**
 * Extracts an excerpt from markdown content.
 *
 * EXTRACTION PRIORITY:
 * 1. Look for explicit # Excerpt or # Description heading
 * 2. Fall back to first meaningful paragraph
 *
 * The excerpt is cleaned of markdown formatting and truncated if necessary.
 *
 * @param content - Raw markdown content
 * @returns Extracted excerpt text, or undefined if no content
 *
 * @example
 * const markdown = `
 * # My Post
 *
 * # Excerpt
 * This is the excerpt for my post.
 *
 * ## Content
 * Main content here...
 * `;
 *
 * getExcerpt(markdown);
 * // Returns: "This is the excerpt for my post."
 */
export function getExcerpt(content: string | undefined): string | undefined {
  if (!content) return undefined;

  // 1. Look for explicit # Excerpt or # Description heading (case insensitive)
  // Matches content between the heading and the next heading or end of file
  const excerptMatch = content.match(
    /^#+\s*(?:Excerpt|Description)\s*\n+([\s\S]*?)(?=\n#+|$)/im
  );

  if (excerptMatch?.[1]) {
    return cleanExcerpt(excerptMatch[1]);
  }

  // 2. Fall back to first paragraph after title
  // Skip the title heading and find the first paragraph
  const paragraphMatch = content.match(
    /^#.*\n+(?:>\s*\[.*\n+)?(.+?)(?:\n\n|\n#|$)/m
  );

  if (paragraphMatch?.[1]) {
    return cleanExcerpt(paragraphMatch[1]);
  }

  return undefined;
}

/**
 * Clean and truncate excerpt text.
 *
 * - Removes markdown formatting (links, bold, italic)
 * - Collapses whitespace
 * - Truncates to MAX_EXCERPT_LENGTH with ellipsis
 *
 * @param text - Raw excerpt text
 * @returns Cleaned excerpt
 */
function cleanExcerpt(text: string): string {
  let cleaned = text
    .trim()
    // Remove markdown links, keeping the text: [text](url) → text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove bold/italic markers
    .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, "$1")
    // Remove inline code
    .replace(/`([^`]+)`/g, "$1")
    // Collapse whitespace
    .replace(/\s+/g, " ")
    .trim();

  // Truncate if too long
  if (cleaned.length > MAX_EXCERPT_LENGTH) {
    cleaned = cleaned.substring(0, MAX_EXCERPT_LENGTH).trim();
    // Try to break at a word boundary
    const lastSpace = cleaned.lastIndexOf(" ");
    if (lastSpace > MAX_EXCERPT_LENGTH * 0.8) {
      cleaned = cleaned.substring(0, lastSpace);
    }
    cleaned += "...";
  }

  return cleaned;
}
