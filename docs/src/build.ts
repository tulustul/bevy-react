// Build the static docs site into docs/dist/:
//   - every page listed in docs/guide/SUMMARY.md (hand-written Markdown) plus
//     the generated reference pages (reference.ts),
//   - a `.md` copy of each page, llms.txt + llms-full.txt, sitemap.xml,
//     robots.txt, 404.html, and the static assets.
// Fails on broken links/images, unknown `demo:` labels, and bad `covers`.
//
// Usage (from the repo root):
//   npm run docs                   build
//   npm run docs -- --serve        build, then serve docs/dist/
//   npm run docs -- --uncovered    also list reference keys no page covers
//   npm run docs -- --out <dir>    build into <dir> instead of docs/dist/
//
// Deploying (`npm run deploy:site`) adds the wasm demo under docs/dist/demo/.

import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

import { llmsIndex, robots, sitemap } from "./crawlers";
import { readDemos } from "./demos";
import { renderPage, withUrls, type Site } from "./layout";
import { renderMarkdown } from "./markdown";
import {
  clip,
  flattenNav,
  mdUrlFor,
  parseFrontmatter,
  parseSummary,
  plainText,
  rootRelFor,
  urlFor,
  type Page,
} from "./pages";
import { buildReference } from "./reference";

const SITE_URL = "https://tulustul.github.io/bevy-react/";
const REPO_URL = "https://github.com/tulustul/bevy-react";

const srcDir = dirname(fileURLToPath(import.meta.url));
const docsDir = join(srcDir, "..");
const repoRoot = join(docsDir, "..");
const guideDir = join(docsDir, "guide");
const outArg = process.argv.indexOf("--out");
const dist =
  outArg > 0 ? resolve(process.argv[outArg + 1]) : join(docsDir, "dist");
const cargoToml = readFileSync(join(repoRoot, "Cargo.toml"), "utf8");
const version = /\nversion = "([^"]+)"/.exec(cargoToml)?.[1] ?? "0.0.0";

const errors: string[] = [];
const nav = parseSummary(join(guideDir, "SUMMARY.md"));
const navPages = flattenNav(nav);
const demos = readDemos(repoRoot);
const pages = new Map<string, Page>();

// 1. The hand-written pages; their `covers` feed the reference.
const covers = new Map<string, Page>();
for (const { file, section } of navPages) {
  if (file.startsWith("reference/")) continue;
  const abs = join(guideDir, file);
  if (!existsSync(abs)) continue; // reported below
  const { meta, body } = parseFrontmatter(readFileSync(abs, "utf8"), file);
  if (meta.demo && !demos.has(meta.demo)) {
    errors.push(`${file}: unknown demo label "${meta.demo}"`);
  }
  const page = addPage(file, abs, section, meta, body, false);
  for (const key of meta.covers ?? []) {
    const owner = covers.get(key);
    if (owner)
      errors.push(`${file}: "${key}" is already covered by ${owner.file}`);
    covers.set(key, page);
  }
}

// 2. The generated reference pages.
const reference = buildReference(repoRoot, covers);
for (const { file, body } of reference.pages) {
  const section = navPages.find((p) => p.file === file)?.section ?? null;
  const parsed = parseFrontmatter(body, file);
  addPage(file, join(guideDir, file), section, parsed.meta, parsed.body, true);
}
for (const [key, page] of covers) {
  if (!reference.keys.has(key)) {
    errors.push(`${page.file}: covers unknown key "${key}"`);
  }
}
for (const { file } of navPages) {
  if (!pages.has(file)) errors.push(`SUMMARY.md: ${file} does not exist`);
}
failOnErrors();

// 3. Render.
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
const assets = new Map<string, string>(); // absolute source path → site path
const site: Site = {
  nav: withUrls(nav, pages),
  siteUrl: SITE_URL,
  repoUrl: REPO_URL,
  version,
};
for (const page of pages.values()) {
  const rootRel = rootRelFor(page.url);
  page.html = renderMarkdown(page.body, {
    file: page.file,
    abs: page.abs,
    rootRel,
    pages,
    repoRoot,
    repoUrl: REPO_URL,
    errors,
    asset: (abs) => {
      const sitePath = relative(repoRoot, abs);
      assets.set(abs, sitePath);
      return sitePath;
    },
  });
  page.footer = footerLinks(page, rootRel);
  writeOut(join(page.url, "index.html"), renderPage(page, site, rootRel));
  writeOut(mdUrlFor(page.url), markdownCopy(page));
}
failOnErrors();

const notFound = {
  url: "404/",
  title: "Page not found",
  description: "This page does not exist.",
  html: `<h1>Page not found</h1><p>This page does not exist. Start from the <a href="${SITE_URL}">introduction</a>.</p>`,
};
writeOut("404.html", renderPage(notFound, site, new URL(SITE_URL).pathname));

// 4. Assets and the crawler files.
for (const [abs, sitePath] of assets) cpSync(abs, join(dist, sitePath));
cpSync(join(docsDir, "assets"), dist, { recursive: true });
cpSync(
  join(repoRoot, "examples/assets/bevy-react-logo.png"),
  join(dist, "logo.png"),
);
const client = readFileSync(join(srcDir, "client.ts"), "utf8");
writeOut(
  "docs.js",
  ts.transpileModule(client, {
    compilerOptions: { target: ts.ScriptTarget.ES2022 },
  }).outputText,
);
const ordered = navPages.map(({ file }) => pages.get(file)!);
writeOut(".nojekyll", "");
writeOut("robots.txt", robots(SITE_URL));
writeOut("sitemap.xml", sitemap(ordered, SITE_URL));
writeOut("llms.txt", llmsIndex(ordered, SITE_URL));
writeOut("llms-full.txt", ordered.map(markdownCopy).join("\n\n"));

const uncovered = [...reference.keys].filter((k) => !covers.has(k));
console.log(
  `[docs] ${pages.size} pages → ${relative(process.cwd(), dist) || "."}` +
    ` (${uncovered.length} of ${reference.keys.size} reference keys have no guide page yet)`,
);
if (process.argv.includes("--uncovered")) console.log(uncovered.join("\n"));
if (process.argv.includes("--serve")) {
  execFileSync("npx", ["serve", dist], { stdio: "inherit" });
}

// --- helpers ---------------------------------------------------------------

/** Register a page with its title (the `# H1`), URL, and description. */
function addPage(
  file: string,
  abs: string,
  section: string | null,
  meta: Page["meta"],
  body: string,
  generated: boolean,
): Page {
  const h1 = /^# (.+)$/m.exec(body);
  if (!h1) errors.push(`${file}: no "# Title" heading`);
  const title = plainText(h1?.[1] ?? file);
  const firstParagraph = body
    .replace(/^# .+$/m, "")
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .find((b) => b && !/^(#|```|!\[|\||-|\*|>|<)/.test(b));
  const page: Page = {
    file,
    abs,
    section,
    meta,
    body,
    generated,
    title,
    url: urlFor(file),
    description: meta.description ?? clip(plainText(firstParagraph ?? title)),
  };
  pages.set(file, page);
  return page;
}

function failOnErrors(): void {
  if (!errors.length) return;
  console.error(`[docs] ${errors.length} error(s):\n  ${errors.join("\n  ")}`);
  process.exit(1);
}

function writeOut(path: string, content: string): void {
  const abs = join(dist, path);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content);
}

function footerLinks(page: Page, rootRel: string): string {
  const links: string[] = [];
  const demo = page.meta.demo ? demos.get(page.meta.demo) : undefined;
  if (demo) {
    links.push(
      `<a href="${rootRel}demo/?page=${demo.slug}">Open live demo</a>`,
    );
    if (demo.file) {
      links.push(
        `<a href="${REPO_URL}/blob/v${version}/${demo.file}">Demo source</a>`,
      );
    }
  }
  links.push(
    page.generated
      ? "<span>Generated from the code</span>"
      : `<a href="${REPO_URL}/edit/main/docs/guide/${page.file}">Edit this page</a>`,
  );
  return links.join("\n");
}

/** The page's Markdown as served at `<url>.md`: frontmatter dropped, images absolute. */
function markdownCopy(page: Page): string {
  const body = page.body.replace(
    /!\[([^\]]*)\]\((?![a-z]+:)([^)]+)\)/g,
    (m, alt: string, src: string) => {
      const sitePath = assets.get(join(dirname(page.abs), src));
      return sitePath ? `![${alt}](${SITE_URL}${sitePath})` : m;
    },
  );
  return body.trim() + "\n";
}
