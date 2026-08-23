import { PropsWithChildren } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Colors, FontSizes } from "@/theme";

// The documentation typography kit. Doc content (page header cards, example
// modals, the Getting started / How it works pages) is authored as JSX from
// these pieces, freely interleaved with `<Code>` / `<CodeTabs>` blocks.

/** Section heading inside a doc card. */
export function H2({ children }: PropsWithChildren) {
  return <text style={h2Style}>{children}</text>;
}

/** Sub-heading inside a doc card. */
export function H3({ children }: PropsWithChildren) {
  return <text style={h3Style}>{children}</text>;
}

/** A paragraph. Inline pieces (`<B>`, `<InlineCode>`) nest inside. */
export function P({ children }: PropsWithChildren) {
  return <text style={pStyle}>{children}</text>;
}

/** Bold inline run (use inside `<P>`). */
export function B({ children }: PropsWithChildren) {
  return <text style={bStyle}>{children}</text>;
}

/** Inline code run (use inside `<P>`). */
export function InlineCode({ children }: PropsWithChildren) {
  return <text style={inlineCodeStyle}>{children}</text>;
}

/** Bullet list; each child of `<Ul>` should be a `<Li>`. */
export function Ul({ children }: PropsWithChildren) {
  return <node style={ulStyle}>{children}</node>;
}

export function Li({ children }: PropsWithChildren) {
  return (
    <node style={liStyle}>
      <text style={bulletStyle}>•</text>
      <text style={liTextStyle}>{children}</text>
    </node>
  );
}

const h2Style: BevyStyle = {
  fontSize: FontSizes.lg,
  fontWeight: "semibold",
  color: Colors.textColor100,
  margin: { top: 8 },
};

const h3Style: BevyStyle = {
  fontSize: FontSizes.base,
  fontWeight: "semibold",
  color: Colors.textColor100,
  margin: { top: 4 },
};

const pStyle: BevyStyle = {
  fontSize: FontSizes.sm,
  color: Colors.textColor200,
  lineHeight: 1.55,
};

// Spans take element defaults for unset fields, so B pins the paragraph size
// (its realistic host — inside a heading, restate the size inline).
const bStyle: BevyStyle = {
  fontWeight: "semibold",
  fontSize: FontSizes.sm,
  color: Colors.textColor100,
};

// Spans don't inherit the parent's fontSize (unset fields take element
// defaults), so the inline-code run pins the paragraph size explicitly.
const inlineCodeStyle: BevyStyle = {
  fontFamily: "Noto Sans Mono",
  fontSize: FontSizes.sm,
  color: Colors.sky100,
};

const ulStyle: BevyStyle = {
  flexDirection: "column",
  gap: 6,
};

const liStyle: BevyStyle = {
  flexDirection: "row",
  gap: 8,
  alignItems: "flexStart",
};

const bulletStyle: BevyStyle = {
  color: Colors.primary100,
  fontSize: FontSizes.sm,
  lineHeight: 1.55,
};

const liTextStyle: BevyStyle = {
  ...pStyle,
  flexShrink: 1,
};
