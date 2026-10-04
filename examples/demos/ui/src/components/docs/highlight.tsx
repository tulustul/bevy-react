import { Fragment, type ReactNode } from "react";
import { refractor } from "refractor/core";
import langTsx from "refractor/tsx";
import langRust from "refractor/rust";
import langBash from "refractor/bash";
import { BevyStyle } from "bevy-react/jsx";
import { Fonts, FontSizes } from "@/theme";

refractor.register(langTsx);
refractor.register(langRust);
refractor.register(langBash);

export type CodeLang = "tsx" | "rust" | "sh";

const REFRACTOR_LANG: Record<CodeLang, string> = {
  tsx: "tsx",
  rust: "rust",
  sh: "bash",
};

// Prism token type → span color: the two lights again — cyan for the
// React-side structure (tags, calls), ember for keywords and macros — with
// violet types, mint strings and amber literals between them. The innermost
// token wins (spans nest); anything unlisted inherits the root's code color.
const SYNTAX = {
  text: "#d5d9e2",
  keyword: "#ff9f6b",
  literal: "#ffc98b",
  string: "#9ee6b8",
  comment: "#5f6677",
  call: "#7fd6ff",
  type: "#c3a8ff",
  tag: "#5cd9ff",
  attr: "#a9b8ff",
  macro: "#ff8a4c",
  lifetime: "#ff7a9a",
  operator: "#9aa3b5",
  punctuation: "#7f8697",
};

const TOKEN_COLORS: Record<string, string> = {
  keyword: SYNTAX.keyword,
  boolean: SYNTAX.literal,
  number: SYNTAX.literal,
  constant: SYNTAX.literal,
  string: SYNTAX.string,
  char: SYNTAX.string,
  "template-string": SYNTAX.string,
  "attr-value": SYNTAX.string,
  comment: SYNTAX.comment,
  doc: SYNTAX.comment,
  prolog: SYNTAX.comment,
  function: SYNTAX.call,
  "function-definition": SYNTAX.call,
  "class-name": SYNTAX.type,
  "type-definition": SYNTAX.type,
  builtin: SYNTAX.type,
  namespace: SYNTAX.type,
  tag: SYNTAX.tag,
  "attr-name": SYNTAX.attr,
  attribute: SYNTAX.attr,
  macro: SYNTAX.macro,
  "macro-name": SYNTAX.macro,
  lifetime: SYNTAX.lifetime,
  operator: SYNTAX.operator,
  punctuation: SYNTAX.punctuation,
  "punctuation-definition": SYNTAX.punctuation,
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
}: {
  lang: CodeLang;
  code: string;
}) {
  const tree = refractor.highlight(code, REFRACTOR_LANG[lang]) as HastNode;
  return (
    <text style={codeTextStyle}>
      {tree.type === "root" ? tree.children.map(renderNode) : code}
    </text>
  );
}

const spanFontStyle: BevyStyle = {
  fontFamily: Fonts.mono,
  fontSize: FontSizes.code,
};

const codeTextStyle: BevyStyle = {
  ...spanFontStyle,
  color: SYNTAX.text,
  lineHeight: 1.6,
};
