// The demos app's nav (examples/demos/ui/src/demos.ts): label → URL slug and
// the page component's source file, for the "Open live demo" / "Demo source"
// links and the `demo:` frontmatter check.

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import ts from "typescript";
import { slugify } from "./pages";

export interface Demo {
  /** The demos app's `?page=` value. */
  slug: string;
  /** The page component's file, repo-relative. */
  file?: string;
}

/** Map nav label → demo, for every selectable demo page. */
export function readDemos(repoRoot: string): Map<string, Demo> {
  const path = join(repoRoot, "examples/demos/ui/src/demos.ts");
  const sf = ts.createSourceFile(
    path,
    readFileSync(path, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );

  const imports = new Map<string, string>();
  for (const st of sf.statements) {
    if (!ts.isImportDeclaration(st)) continue;
    const bindings = st.importClause?.namedBindings;
    if (!bindings || !ts.isNamedImports(bindings)) continue;
    const spec = (st.moduleSpecifier as ts.StringLiteral).text;
    for (const el of bindings.elements) imports.set(el.name.text, spec);
  }

  const demos = new Map<string, Demo>();
  const slugs = new Set<string>();
  const visit = (node: ts.Node): void => {
    if (ts.isObjectLiteralExpression(node)) {
      const prop = (name: string) =>
        node.properties
          .filter(ts.isPropertyAssignment)
          .find((p) => p.name.getText(sf) === name)?.initializer;
      const label = prop("label");
      const component = prop("component");
      if (
        label &&
        ts.isStringLiteral(label) &&
        component &&
        ts.isIdentifier(component)
      ) {
        const slug = slugify(label.text);
        if (slugs.has(slug)) {
          throw new Error(`demos.ts: two demos share the slug "${slug}"`);
        }
        slugs.add(slug);
        const spec = imports.get(component.text);
        demos.set(label.text, {
          slug,
          file: spec && resolveModule(dirname(path), spec, repoRoot),
        });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return demos;
}

function resolveModule(
  dir: string,
  spec: string,
  repoRoot: string,
): string | undefined {
  for (const suffix of [".tsx", ".ts", "/index.tsx", "/index.ts"]) {
    const file = join(dir, spec + suffix);
    if (existsSync(file)) return relative(repoRoot, file);
  }
  return undefined;
}
