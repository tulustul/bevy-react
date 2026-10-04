// Markdown → HTML for one page: syntax highlighting, TSX/Rust tab groups,
// heading anchors, and link/image rewriting with validation.

import { existsSync } from "node:fs";
import { dirname, posix, relative, resolve } from "node:path";
import type { Root, RootContent } from "hast";
import { Marked, type Token, type Tokens } from "marked";
import { refractor } from "refractor/core";
import bash from "refractor/bash";
import json from "refractor/json";
import rust from "refractor/rust";
import toml from "refractor/toml";
import tsx from "refractor/tsx";
import wgsl from "refractor/wgsl";
import type { Page } from "./pages";

for (const lang of [bash, json, rust, toml, tsx, wgsl]) {
  refractor.register(lang);
}

const LANG_ALIASES: Record<string, string> = {
  sh: "bash",
  ts: "tsx",
  typescript: "tsx",
  rs: "rust",
};
const TAB_LABELS: Record<string, string> = { tsx: "TSX", rust: "Rust" };

export interface RenderCtx {
  /** The page's guide-relative path (links resolve against its directory). */
  file: string;
  /** The page's absolute source path (images resolve against its directory). */
  abs: string;
  /** `../` prefix from the page back to the site root. */
  rootRel: string;
  /** Guide-relative file → page, for `.md` links. */
  pages: Map<string, Page>;
  /** Plain (non-`.md`) repo files link to GitHub. */
  repoRoot: string;
  repoUrl: string;
  /** Registers a file to copy into the site; returns its site path. */
  asset: (abs: string) => string;
  /** Collected broken links/images. */
  errors: string[];
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function hastToHtml(node: Root | RootContent): string {
  switch (node.type) {
    case "text":
      return escapeHtml(node.value);
    case "root":
      return node.children.map(hastToHtml).join("");
    case "element": {
      const cls = [node.properties.className ?? []].flat().join(" ");
      return `<span class="${cls}">${node.children.map(hastToHtml).join("")}</span>`;
    }
    default:
      return "";
  }
}

function highlight(code: string, lang = ""): string {
  const name = LANG_ALIASES[lang] ?? lang;
  const body = refractor.registered(name)
    ? hastToHtml(refractor.highlight(code, name))
    : escapeHtml(code);
  const cls = lang ? ` class="language-${escapeHtml(lang)}"` : "";
  return `<pre><code${cls}>${body}</code></pre>`;
}

/**
 * An adjacent ```tsx + ```rust pair → one tab group. Both panels stay in the
 * HTML (crawlers read both); client.ts upgrades the group to ARIA tabs.
 */
function tabGroup(blocks: Tokens.Code[]): string {
  const panels = blocks
    .map(
      (b) =>
        `<div class="tab-panel" data-lang="${b.lang}">` +
        `<p class="tab-label">${TAB_LABELS[b.lang ?? ""]}</p>${highlight(b.text, b.lang)}</div>`,
    )
    .join("");
  return `<div class="tabs">${panels}</div>\n`;
}

function groupTabs(tokens: Token[]): Token[] {
  const out: Token[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    let j = i + 1;
    while (tokens[j]?.type === "space") j++;
    const next = tokens[j];
    if (
      t.type === "code" &&
      next?.type === "code" &&
      TAB_LABELS[t.lang ?? ""] &&
      TAB_LABELS[next.lang ?? ""] &&
      t.lang !== next.lang
    ) {
      const html = tabGroup([t as Tokens.Code, next as Tokens.Code]);
      out.push({ type: "html", block: true, pre: false, raw: "", text: html });
      i = j;
    } else {
      out.push(t);
    }
  }
  return out;
}

/** GitHub-style heading id. */
function headingId(text: string, used: Set<string>): string {
  const base =
    text
      .replace(/<a id="[^"]*"><\/a>/g, "") // generated exact-case anchors
      .toLowerCase()
      .replace(/[^\w\- ]/g, "")
      .trim()
      .replace(/ /g, "-") || "section";
  let id = base;
  for (let n = 1; used.has(id); n++) id = `${base}-${n}`;
  used.add(id);
  return id;
}

/** Render one page's Markdown body to HTML. */
export function renderMarkdown(body: string, ctx: RenderCtx): string {
  const used = new Set<string>();
  const dir = posix.dirname(ctx.file);
  const marked = new Marked({ gfm: true });
  marked.use({
    renderer: {
      code({ text, lang }) {
        return highlight(text, lang);
      },
      heading({ tokens, depth, text }) {
        const id = headingId(text, used);
        const inner = this.parser.parseInline(tokens);
        if (depth === 1) return `<h1 id="${id}">${inner}</h1>\n`;
        return `<h${depth} id="${id}"><a class="anchor" href="#${id}" aria-hidden="true">#</a>${inner}</h${depth}>\n`;
      },
      link({ href, title, tokens }) {
        const inner = this.parser.parseInline(tokens);
        const t = title ? ` title="${escapeHtml(title)}"` : "";
        return `<a href="${escapeHtml(rewriteLink(href, ctx, dir))}"${t}>${inner}</a>`;
      },
      image({ href, text }) {
        if (!text.trim()) {
          ctx.errors.push(`${ctx.file}: image ${href} has no alt text`);
        }
        const src = rewriteImage(href, ctx);
        return `<img src="${escapeHtml(src)}" alt="${escapeHtml(text)}" loading="lazy">`;
      },
    },
  });
  const html = marked.parser(groupTabs(marked.lexer(body)));
  // Wide tables scroll inside their own box instead of the page.
  return html
    .replace(/<table>/g, '<div class="table-wrap"><table>')
    .replace(/<\/table>/g, "</table></div>");
}

function isExternal(href: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//");
}

function rewriteLink(href: string, ctx: RenderCtx, dir: string): string {
  if (isExternal(href) || href.startsWith("#")) return href;
  const [path, hash] = href.split("#");
  const anchor = hash ? `#${hash}` : "";
  if (path.endsWith(".md")) {
    const page = ctx.pages.get(posix.normalize(posix.join(dir, path)));
    if (!page) {
      ctx.errors.push(`${ctx.file}: broken link ${href}`);
      return href;
    }
    return (ctx.rootRel + page.url || "./") + anchor;
  }
  // Any other repo file: link it on GitHub.
  const abs = resolve(dirname(ctx.abs), path);
  if (!existsSync(abs)) {
    ctx.errors.push(`${ctx.file}: broken link ${href}`);
    return href;
  }
  return `${ctx.repoUrl}/blob/main/${relative(ctx.repoRoot, abs)}${anchor}`;
}

function rewriteImage(href: string, ctx: RenderCtx): string {
  if (isExternal(href)) return href;
  const abs = resolve(dirname(ctx.abs), href);
  if (!existsSync(abs)) {
    ctx.errors.push(`${ctx.file}: missing image ${href}`);
    return href;
  }
  return ctx.rootRel + ctx.asset(abs);
}
