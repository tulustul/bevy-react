// What search engines and AI models read besides the HTML: sitemap.xml,
// robots.txt, and llms.txt (https://llmstxt.org) over the `.md` page copies.

import { escapeHtml } from "./markdown";
import { mdUrlFor, type Page } from "./pages";

export function sitemap(pages: Page[], siteUrl: string): string {
  const urls = pages.map(
    (p) => `  <url><loc>${escapeHtml(siteUrl + p.url)}</loc></url>`,
  );
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;
}

export function robots(siteUrl: string): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}sitemap.xml\n`;
}

/** A Markdown index of the `.md` copies, grouped by nav section. */
export function llmsIndex(pages: Page[], siteUrl: string): string {
  const home = pages.find((p) => p.url === "");
  const sections = new Map<string, string[]>();
  for (const page of pages) {
    const name = page.section ?? "Overview";
    const lines = sections.get(name) ?? [];
    lines.push(
      `- [${page.title}](${siteUrl}${mdUrlFor(page.url)}): ${page.description}`,
    );
    sections.set(name, lines);
  }
  const body = [...sections].map(
    ([name, lines]) => `## ${name}\n\n${lines.join("\n")}`,
  );
  return `# bevy-react

> ${home?.description ?? ""}

The whole documentation in one file: ${siteUrl}llms-full.txt

${body.join("\n\n")}
`;
}
