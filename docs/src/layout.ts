// The HTML shell around every page: head (SEO), header, nav, footer.

import { escapeHtml } from "./markdown";
import { mdUrlFor, type NavNode, type Page } from "./pages";

export interface Site {
  nav: NavNode[];
  siteUrl: string;
  repoUrl: string;
  version: string;
}

/** What the shell needs of a page; the 404 page has no source `file`. */
export type PageView = Pick<Page, "url" | "title" | "description"> &
  Partial<Pick<Page, "file" | "html" | "footer">>;

function navList(
  nodes: NavNode[],
  current: string | undefined,
  rootRel: string,
): string {
  const items = nodes.map((node) => {
    const children = node.children.length
      ? navList(node.children, current, rootRel)
      : "";
    if (!node.file) {
      return `<li class="nav-section"><span>${escapeHtml(node.title)}</span>${children}</li>`;
    }
    const here = node.file === current ? ' aria-current="page"' : "";
    const href = rootRel + node.url || "./";
    return `<li><a href="${href}"${here}>${escapeHtml(node.title)}</a>${children}</li>`;
  });
  return `<ul>${items.join("")}</ul>`;
}

/** The nav tree with each page's URL filled in. */
export function withUrls(nav: NavNode[], pages: Map<string, Page>): NavNode[] {
  return nav.map((node) => ({
    ...node,
    url: node.file ? pages.get(node.file)?.url : undefined,
    children: withUrls(node.children, pages),
  }));
}

/**
 * One page. `rootRel` is the `../` prefix from the page to the site root (an
 * absolute base path for the 404 page, which GitHub Pages serves at any depth).
 */
export function renderPage(
  page: PageView,
  site: Site,
  rootRel: string,
): string {
  const title =
    page.url === ""
      ? "bevy-react — drive Bevy UI from React"
      : `${page.title} · bevy-react`;
  const head = page.file
    ? `<link rel="canonical" href="${site.siteUrl}${page.url}">
<link rel="alternate" type="text/markdown" href="${rootRel}${mdUrlFor(page.url)}">`
    : "";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(page.description)}">
${head}
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(page.description)}">
<link rel="icon" href="${rootRel}logo.png">
<link rel="stylesheet" href="${rootRel}style.css">
<script src="${rootRel}docs.js" defer></script>
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
<a class="brand" href="${rootRel || "./"}"><img src="${rootRel}logo.png" alt="" width="74" height="74"> bevy-react</a>
<span class="version">v${site.version}</span>
<nav class="site-links" aria-label="Project">
<a href="${rootRel}demo/">Live demo</a>
<a href="${site.repoUrl}">GitHub</a>
<a href="https://docs.rs/bevy-react">docs.rs</a>
<a href="https://www.npmjs.com/package/bevy-react">npm</a>
</nav>
</header>
<div class="layout">
<nav class="sidebar" aria-label="Documentation">
<details class="nav-menu" open>
<summary>Menu</summary>
${navList(site.nav, page.file, rootRel)}
</details>
</nav>
<main id="main">
<article>
${page.html ?? ""}
</article>
${page.footer ? `<footer class="page-links">${page.footer}</footer>` : ""}
</main>
</div>
<footer class="site-footer">
<p>bevy-react is dual-licensed under MIT or Apache-2.0. <a href="${site.repoUrl}">Source on GitHub</a>.</p>
</footer>
</body>
</html>
`;
}
