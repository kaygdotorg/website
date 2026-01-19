/**
 * Extracts a URL from a markdown link string.
 * Supports:
 * - [label](url)
 * - ([label](url))
 * - (url)
 * - (<url>)
 * - plain url
 */
export function extractUrlFromMarkdown(link: string | undefined | null): string | undefined {
    if (!link) return undefined;

    // Handle ([label](url)) or [label](url)
    const markdownLinkMatch = link.match(/\[.*\]\((.*)\)/);
    if (markdownLinkMatch && markdownLinkMatch[1]) {
        return markdownLinkMatch[1].replace(/[<>]/g, '').trim();
    }

    // Handle (<url>) or (url)
    const parenMatch = link.match(/\((.*)\)/);
    if (parenMatch && parenMatch[1]) {
        return parenMatch[1].replace(/[<>]/g, '').trim();
    }

    // Handle plain <url>
    const angleMatch = link.match(/<(.*)>/);
    if (angleMatch && angleMatch[1]) {
        return angleMatch[1].trim();
    }

    return link.trim();
}
