// The generated reference pages — style properties, elements, filters — as
// Markdown, read straight from the library's generated TypeScript:
//   js/src/generated/style.ts     the core style properties (`BevyStyle`)
//   js/src/generated/elements.ts  the core elements
//   docs/reference/bevy.ts        the feature crates' elements + the built-in
//                                 filters and morphs (a library-only export,
//                                 kept current by crates/bevy-react/tests/library_ts.rs)
//   js/src/jsx.d.ts, filters.ts   common props and value types
// Each documented key (`style.x`, `element.x`, `filter.x`, `morph.x`) links to
// the guide page whose frontmatter `covers` it.

import { readFileSync } from "node:fs";
import { join, posix } from "node:path";
import ts from "typescript";

const SOURCES = [
  "js/src/generated/style.ts",
  "js/src/generated/elements.ts",
  "docs/reference/bevy.ts",
  "js/src/jsx.d.ts",
  "js/src/filters.ts",
  "js/src/animated.ts",
];

const COMMON_GROUPS: [iface: string, title: string][] = [
  ["BevyAttributes", "Identity"],
  ["BevyVariantProps", "State styles"],
  ["BevyPointerProps", "Pointer events"],
  ["BevyScrollProps", "Scrolling"],
  ["BevyWheelProps", "Wheel"],
];

interface Decl {
  node: ts.InterfaceDeclaration | ts.TypeAliasDeclaration;
  sf: ts.SourceFile;
}
/** name → every declaring node (an interface may be declared + augmented). */
type Decls = Map<string, Decl[]>;

interface Member {
  name: string;
  type: string;
  optional: boolean;
  doc: string;
}

export interface ReferencePage {
  file: string;
  body: string;
}

/** A guide page as the reference links it. */
export interface GuideLink {
  file: string;
  title: string;
}

type Guide = (key: string, from: string) => string;

function readDecls(repoRoot: string): Decls {
  const decls: Decls = new Map();
  for (const rel of SOURCES) {
    const path = join(repoRoot, rel);
    const sf = ts.createSourceFile(
      path,
      readFileSync(path, "utf8"),
      ts.ScriptTarget.Latest,
      true,
    );
    const visit = (st: ts.Statement): void => {
      if (ts.isModuleDeclaration(st) && st.body && ts.isModuleBlock(st.body)) {
        st.body.statements.forEach(visit);
      } else if (
        ts.isInterfaceDeclaration(st) ||
        ts.isTypeAliasDeclaration(st)
      ) {
        const list = decls.get(st.name.text) ?? [];
        list.push({ node: st, sf });
        decls.set(st.name.text, list);
      }
    };
    sf.statements.forEach(visit);
  }
  return decls;
}

const squash = (text: string) => text.replace(/\s+/g, " ").trim();

function docOf(node: ts.Node): string {
  return squash(
    ts
      .getJSDocCommentsAndTags(node)
      .map((d) => (ts.isJSDoc(d) ? ts.getTextOfJSDocComment(d.comment) : ""))
      .join(" "),
  );
}

/** The property members of an interface (every declaration) or object type alias. */
function members(decls: Decls, name: string): Member[] {
  return (decls.get(name) ?? []).flatMap(({ node, sf }) => {
    const list: readonly ts.TypeElement[] = ts.isInterfaceDeclaration(node)
      ? node.members
      : ts.isTypeLiteralNode(node.type)
        ? node.type.members
        : [];
    return list.filter(ts.isPropertySignature).map((m) => ({
      name: m.name.getText(sf).replace(/^"|"$/g, ""),
      type: squash(m.type?.getText(sf) ?? "unknown"),
      optional: !!m.questionToken,
      doc: docOf(m),
    }));
  });
}

function heritage(decls: Decls, name: string): string[] {
  const decl = decls.get(name)?.[0];
  if (!decl || !ts.isInterfaceDeclaration(decl.node)) return [];
  return (decl.node.heritageClauses ?? []).flatMap((h) =>
    h.types.map((t) => t.getText(decl.sf)),
  );
}

/** A Markdown table cell: pipes escaped, one line. */
const cell = (text: string) => squash(text).replace(/\|/g, "\\|");
const code = (text: string) => `\`${cell(text)}\``;
/** An exact-case anchor where the auto heading id (lowercased) would differ. */
const anchor = (id: string) =>
  id === id.toLowerCase() ? "" : `<a id="${id}"></a>`;

/** A Markdown table, dropping columns no row fills. */
function table(head: string[], rows: string[][]): string {
  if (rows.length === 0) return "";
  const keep = head.map((_, i) => rows.some((r) => r[i]));
  const pick = (cells: string[]) => cells.filter((_, i) => keep[i]);
  return [
    `| ${pick(head).join(" | ")} |`,
    `| ${pick(head)
      .map(() => "---")
      .join(" | ")} |`,
    ...rows.map((r) => `| ${pick(r).join(" | ")} |`),
    "",
  ].join("\n");
}

/** Build the reference pages; `keys` is every documentable reference key. */
export function buildReference(
  repoRoot: string,
  covers: Map<string, GuideLink>,
): { keys: Set<string>; pages: ReferencePage[] } {
  const decls = readDecls(repoRoot);
  const keys = new Set<string>();
  const guide: Guide = (key, from) => {
    keys.add(key);
    const page = covers.get(key);
    return page
      ? `[${cell(page.title)}](${posix.relative(posix.dirname(from), page.file)})`
      : "";
  };
  return {
    keys,
    pages: [
      stylePage(decls, guide),
      elementsPage(decls, guide),
      filtersPage(decls, guide),
    ],
  };
}

function stylePage(decls: Decls, guide: Guide): ReferencePage {
  const file = "reference/style-properties.md";
  const referenced = new Set<string>();
  const rows = members(decls, "BevyStyle").map((p) => {
    const wrapped = /^Animatable<(.*)>$/.exec(p.type);
    const type = wrapped ? wrapped[1] : p.type;
    for (const id of type.match(/\b[A-Z]\w*/g) ?? []) referenced.add(id);
    const nested =
      !wrapped && /Animatable</.test(typeClosure(decls, type).text);
    return [
      `<span id="${p.name}"></span>${code(p.name)}`,
      code(type),
      wrapped ? "yes" : nested ? "per field" : "",
      guide(`style.${p.name}`, file),
    ];
  });
  const valueTypes = typeClosure(decls, [...referenced].join(" ")).decls;
  return {
    file,
    body: `---
description: Every style property bevy-react accepts, with its type and whether it can be animated. Generated from the code.
---

# Style properties

Every property the \`style\` prop (and the \`hoverStyle\`/\`pressStyle\`/\`focusStyle\`
state styles) accepts, generated from the library's style registry. An app
can register its own properties on top of these.

**Animatable** properties accept an inline \`{ animated: sharedValue }\`
binding in place of the value; "per field" means the value is an object whose
individual fields accept one.

${table(["Property", "Type", "Animatable", "Guide"], rows)}
## Value types

The named types used above, as declared in the \`bevy-react\` package.

${valueTypes.map((d) => `### \`${d.name}\`\n\n\`\`\`ts\n${d.text}\n\`\`\`\n`).join("\n")}`,
  };
}

/** The declarations of every named type reachable from `text`, in discovery order. */
function typeClosure(
  decls: Decls,
  text: string,
): { decls: { name: string; text: string }[]; text: string } {
  // The filter registries are documented on the filters page instead.
  const seen = new Set(["Animatable", "BevyFilters", "BevyMorphFilters"]);
  const out: { name: string; text: string }[] = [];
  const queue: string[] = [...(text.match(/\b[A-Z]\w*/g) ?? [])];
  for (let id = queue.shift(); id !== undefined; id = queue.shift()) {
    const decl = decls.get(id)?.[0];
    if (seen.has(id) || !decl) continue;
    seen.add(id);
    out.push({ name: id, text: decl.node.getFullText(decl.sf).trim() });
    queue.push(...(decl.node.getText(decl.sf).match(/\b[A-Z]\w*/g) ?? []));
  }
  return { decls: out, text: out.map((d) => d.text).join("\n") };
}

function elementsPage(decls: Decls, guide: Guide): ReferencePage {
  const file = "reference/elements.md";
  const groups = COMMON_GROUPS.map(([iface, title]) => {
    const props = [
      ...members(decls, iface),
      ...heritage(decls, iface).flatMap((h) => members(decls, h)),
    ];
    return `### ${title}\n\n\`${iface}\`\n\n${table(
      ["Prop", "Type", "Description"],
      props
        .filter((p) => p.name !== "key")
        .map((p) => [code(p.name), code(p.type), cell(p.doc)]),
    )}`;
  }).join("\n");

  const elements = members(decls, "BevyIntrinsicElements").sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const sections = elements.map(({ name, type: iface }) => {
    const props = members(decls, iface).filter(
      (p) => !["style", "children", "ref"].includes(p.name),
    );
    const isEvent = (p: Member) => /^on[A-Z]/.test(p.name);
    const common = heritage(decls, iface)
      .map((h) => COMMON_GROUPS.find(([i]) => i === h)?.[1])
      .filter((t): t is string => !!t);
    const link = guide(`element.${name}`, file);
    const intro = common.length ? `Common props: ${common.join(", ")}.` : "";
    const attrs = props.filter((p) => !isEvent(p));
    return [
      `## ${anchor(name)}\`<${name}>\``,
      intro + (link ? ` Guide: ${link}.` : ""),
      attrs.length
        ? table(
            ["Attribute", "Type", "Required", "Description"],
            attrs.map((p) => [
              code(p.name),
              code(p.type),
              p.optional ? "" : "yes",
              cell(p.doc),
            ]),
          )
        : "No element-specific attributes.\n",
      table(
        ["Event", "Handler type", "Description"],
        props
          .filter(isEvent)
          .map((p) => [code(p.name), code(p.type), cell(p.doc)]),
      ),
    ]
      .filter(Boolean)
      .join("\n\n");
  });

  return {
    file,
    body: `---
description: Every bevy-react JSX element with its attributes, events, and the common props it accepts. Generated from the code.
---

# Elements

Every intrinsic element the library registers, generated from its element
registry: the core elements and those of the default cargo features. Each
element also takes \`style\` and \`children\` (unless noted) and the common
prop groups listed below.

## Common props

${groups}
${sections.join("\n")}`,
  };
}

function filtersPage(decls: Decls, guide: Guide): ReferencePage {
  const file = "reference/filters.md";
  const family = (registry: string, prefix: string) =>
    members(decls, registry)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(({ name, type }) => {
        const params = members(decls, type);
        const link = guide(`${prefix}.${name}`, file);
        return `### ${anchor(name)}\`${name}\`\n\n${link ? `Guide: ${link}.\n\n` : ""}${
          params.length
            ? table(
                ["Param", "Type", "Description"],
                params.map((p) => [code(p.name), code(p.type), cell(p.doc)]),
              )
            : "No params.\n"
        }`;
      })
      .join("\n");

  return {
    file,
    body: `---
description: The built-in filters and morph filters with their params. Generated from the code.
---

# Filters

The filters the library ships, generated from its filter registry. Every param
is optional (an omitted param takes the filter's default) and accepts an inline
\`{ animated: sharedValue }\` binding. Apps register their own filters on top
of these.

## Filters

Usable in \`filter\` and \`backdropFilter\` chains.

${family("BevyFilters", "filter")}
## Morph filters

Usable in \`morphFilter\`.

${family("BevyMorphFilters", "morph")}`,
  };
}
