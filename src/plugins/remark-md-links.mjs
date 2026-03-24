/**
 * =============================================================================
 * REMARK MD LINKS PLUGIN
 * =============================================================================
 *
 * Transforms local markdown entry links into absolute routed URLs at the
 * remark (markdown AST) level, before conversion to HTML.
 *
 * Examples:
 * - [text](./20250729-placement-rules-ceph-s3.md)
 *   -> [text](/blog/placement-rules-ceph-s3)
 * - [text](20250729-placement-rules-ceph-s3.md)
 *   -> [text](/blog/placement-rules-ceph-s3)
 * - [text](../notes/20240713-x-forwarded-for.md)
 *   -> [text](/notes/x-forwarded-for)
 *
 * The important behavioral choice is that successful markdown-entry rewrites
 * always become absolute site URLs. Relative slug rewrites were the root cause
 * of broken links such as:
 *   /blog/storage-classes-ceph-s3/placement-rules-ceph-s3
 * instead of:
 *   /blog/placement-rules-ceph-s3
 *
 * This runs earlier in the pipeline than rehype plugins, ensuring the
 * normalized URL is available to downstream HTML transforms and client-side
 * features such as internal-link previews.
 */

import { visit } from "unist-util-visit";
import {
  resolveMarkdownEntryUrl,
  splitUrlSuffix,
} from "../utils/content-paths.mjs";

/**
 * Remark plugin to transform markdown entry links on both <a> links and image
 * references. Image references that point to .md files are unusual, but
 * handling both node types keeps the rule complete and predictable.
 */
export default function remarkMdLinks() {
  return (tree, file) => {
    const sourceFilePath =
      file?.history?.[0] || file?.path || file?.data?.astro?.filePath || "";

    visit(tree, ["link", "image"], (node) => {
      const url = node.url;
      if (!url || typeof url !== "string") return;

      const { pathname } = splitUrlSuffix(url);
      if (!pathname.endsWith(".md")) return;

      node.url = resolveMarkdownEntryUrl(url, sourceFilePath);
    });
  };
}
