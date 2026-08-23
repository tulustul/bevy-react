import { Fragment, type ReactNode } from "react";
import { refractor } from "refractor/core";
import langTsx from "refractor/tsx";
import langRust from "refractor/rust";
import langBash from "refractor/bash";
import { BevyStyle } from "bevy-react/jsx";
import { Colors, FontSizes } from "@/theme";

refractor.register(langTsx);
refractor.register(langRust);
refractor.register(langBash);

export type CodeLang = "tsx" | "rust" | "sh";

const REFRACTOR_LANG: Record<CodeLang, string> = {
  tsx: "tsx",
  rust: "rust",
  sh: "bash",
};

// Prism token type → span color, Tokyo-night-ish from the shared palette.
// The innermost token wins (spans nest); anything unlisted inherits the
// root's default code color.
const TOKEN_COLORS: Record<string, string> = {
  keyword: Colors.purple100,
  boolean: Colors.orange100,
  number: Colors.orange100,
  constant: Colors.orange100,
  string: Colors.green100,
  char: Colors.green100,
  "template-string": Colors.green100,
  "attr-value": Colors.green100,
  comment: Colors.textColor300,
  doc: Colors.textColor300,
  prolog: Colors.textColor300,
  function: Colors.primary200,
  "function-definition": Colors.primary200,
  "class-name": Colors.teal100,
  "type-definition": Colors.teal100,
  builtin: Colors.teal100,
  namespace: Colors.teal100,
  tag: Colors.primary100,
  "attr-name": Colors.yellow100,
  attribute: Colors.yellow100,
  macro: Colors.yellow100,
  "macro-name": Colors.yellow100,
  lifetime: Colors.red100,
  operator: Colors.sky100,
  punctuation: Colors.textColor200,
  "punctuation-definition": Colors.textColor200,
};

type HastNode =
  | { type: "text"; value: string }
  | {
      type: "element";
      properties?: { className?: string[] };
      children: HastNode[];
    }
  | { type: "root"; children: HastNode[] };

function colorFor(node: HastNode): string | undefined {
  if (node.type !== "element") return undefined;
  const classes = node.properties?.className ?? [];
  // className is ["token", <type>, ...aliases]; the most specific listed
  // entry (scanning from the end) picks the color.
  for (let i = classes.length - 1; i >= 1; i--) {
    const color = TOKEN_COLORS[classes[i]];
    if (color !== undefined) return color;
  }
  return undefined;
}

function renderNode(node: HastNode, key: number): ReactNode {
  if (node.type === "text") return node.value;
  const children = node.children.map(renderNode);
  const color = colorFor(node);
  // Colorless wrappers contribute nothing — flatten them instead of emitting
  // a span per token, keeping the TextSpan count low.
  if (color === undefined) return <Fragment key={key}>{children}</Fragment>;
  // Nested `<text>` spans do NOT inherit the root's font settings (unset
  // fields fall back to the element defaults), so each span restates the
  // code font explicitly or colored tokens would render at 16px sans.
  return (
    <text key={key} style={{ ...spanFontStyle, color }}>
      {children}
    </text>
  );
}

/**
 * A syntax-highlighted code block body: one root `<text>` whose nested spans
 * carry the token colors. Rendering is pure — highlight cost is per render,
 * which is fine for doc-sized snippets.
 */
export function HighlightedCode({
  lang,
  code,
  style,
}: {
  lang: CodeLang;
  code: string;
  style?: BevyStyle;
}) {
  const tree = refractor.highlight(code, REFRACTOR_LANG[lang]) as HastNode;
  return (
    <text style={{ ...codeTextStyle, ...style }}>
      {tree.type === "root" ? tree.children.map(renderNode) : code}
    </text>
  );
}

const spanFontStyle: BevyStyle = {
  fontFamily: "Noto Sans Mono",
  fontSize: FontSizes.xs,
};

const codeTextStyle: BevyStyle = {
  ...spanFontStyle,
  color: Colors.textColor100,
  lineHeight: 1.5,
};
