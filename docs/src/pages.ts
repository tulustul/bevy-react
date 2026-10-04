// Guide pages: SUMMARY.md (the nav and the only page order), frontmatter,
// titles, descriptions, and the file → URL mapping.

import { readFileSync } from "node:fs";

export interface NavNode {
  title: string;
  /** Guide-relative `.md` path; absent on a section heading. */
  file?: string;
  url?: string;
  children: NavNode[];
}

export interface Meta {
  description?: string;
  /** A demos-app nav label (`examples/demos/ui/src/demos.ts`). */
  demo?: string;
  /** Reference keys this page documents: `style.x`, `element.x`, `filter.x`, `morph.x`. */
  covers?: string[];
}

export interface Page {
  /** Guide-relative `.md` path (`elements/image.md`). */
  file: string;
  /** Absolute source path (images resolve against its directory). */
  abs: string;
  section: string | null;
  meta: Meta;
  body: string;
  generated: boolean;
  title: string;
  url: string;
  description: string;
  html?: string;
  footer?: string;
}

/** A guide-relative `.md` path → its site URL (no leading slash). */
export function urlFor(file: string): string {
  if (file === "index.md") return "";
  return file.replace(/(^|\/)index\.md$/, "$1").replace(/\.md$/, "/");
}

/** The `../` prefix that climbs from a page URL back to the site root. */
export function rootRelFor(url: string): string {
  return "../".repeat(url.split("/").filter(Boolean).length);
}

/** Where a page's Markdown copy is served: `elements/image/` → `elements/image.md`. */
export function mdUrlFor(url: string): string {
  return url ? url.replace(/\/$/, ".md") : "index.md";
}

/** Lowercase, alphanumerics and dashes — `"3D transforms"` → `"3d-transforms"`. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Parse SUMMARY.md: a nested Markdown list where `- [Title](file.md)` is a
 * page and a plain `- Title` is a section heading. Two-space indentation.
 */
export function parseSummary(path: string): NavNode[] {
  const root: NavNode = { title: "", children: [] };
  const stack = [{ depth: -1, node: root }];
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = /^( *)- (.*)$/.exec(line);
    if (!m) continue;
    const depth = m[1].length / 2;
    const link = /^\[(.+)\]\((.+\.md)\)$/.exec(m[2].trim());
    const node: NavNode = link
      ? { title: plainText(link[1]), file: link[2], children: [] }
      : { title: m[2].trim(), children: [] };
    while (stack[stack.length - 1].depth >= depth) stack.pop();
    stack[stack.length - 1].node.children.push(node);
    stack.push({ depth, node });
  }
  return root.children;
}

/** Every page node of the nav tree, in order, each with its section title. */
export function flattenNav(
  nav: NavNode[],
  section: string | null = null,
): { file: string; section: string | null }[] {
  return nav.flatMap((node) => [
    ...(node.file ? [{ file: node.file, section }] : []),
    ...flattenNav(node.children, node.file ? section : node.title),
  ]);
}

/**
 * Split `---`-fenced frontmatter off a page: `key: value` lines, where a value
 * may continue on indented lines and `[a, b]` is a list — the subset of YAML
 * the pages use, including prettier's wrapped form of a long list.
 */
export function parseFrontmatter(
  src: string,
  file: string,
): { meta: Meta; body: string } {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(src);
  if (!m) return { meta: {}, body: src };
  const meta: Meta = {};
  for (const entry of m[1].split(/\n(?=\S)/)) {
    if (!entry.trim()) continue;
    const kv = /^(\w+):([\s\S]*)$/.exec(entry);
    const value = kv?.[2].replace(/\s+/g, " ").trim() ?? "";
    switch (kv?.[1]) {
      case "description":
      case "demo":
        meta[kv[1]] = value.replace(/^"(.*)"$/, "$1");
        break;
      case "covers":
        meta.covers = value
          .replace(/^\[|\]$/g, "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        break;
      default:
        throw new Error(`${file}: unknown frontmatter entry "${entry}"`);
    }
  }
  return { meta, body: src.slice(m[0].length) };
}

/** Inline Markdown → plain text (titles, descriptions). */
export function plainText(md: string): string {
  return md
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[`*_]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Clip to ≤ max chars on a word boundary. */
export function clip(text: string, max = 160): string {
  if (text.length <= max) return text;
  return text.slice(0, text.lastIndexOf(" ", max - 1)) + "…";
}
