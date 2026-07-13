// The devtools panel's palette (Chrome-devtools-like dark theme). Hex only —
// every color crosses the bridge as a wire string parsed by the Rust side.
export const theme = {
  /** Panel background. */
  bg: "#202124",
  /** Slightly raised surfaces (header, footer, hovered rows). */
  bgAlt: "#292a2d",
  /** Row/selection highlight. */
  bgActive: "#37383d",
  /** Hairline borders between panel regions. */
  border: "#3c4043",
  /** Primary text. */
  text: "#e8eaed",
  /** Secondary text (labels, dim values). */
  textDim: "#9aa0a6",
  /** Accent (active tab, selection, links). */
  accent: "#8ab4f8",
  /** Accent for attribute/value text. */
  accentAlt: "#5db0d7",
  /** Errors / invalid input. */
  danger: "#f28b82",
  /** Warnings (invalid property values Bevy fell back on). */
  warn: "#fdd663",
  /** Success / ok badges. */
  ok: "#81c995",
  /** Monospace family for node kinds, values, and the log. */
  mono: "Noto Sans Mono",
} as const;
