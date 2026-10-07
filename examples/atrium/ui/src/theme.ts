/** Atrium's look: white type on dark frosted glass, soft platters for
 *  controls, generous radii — calm enough to float in a landscape. */
export const Colors = {
  text: "#ffffff",
  muted: "rgba(255, 255, 255, 0.62)",
  faint: "rgba(255, 255, 255, 0.38)",
  hairline: "rgba(255, 255, 255, 0.12)",
  platter: "rgba(255, 255, 255, 0.08)",
  platterHover: "rgba(255, 255, 255, 0.16)",
  platterPress: "rgba(255, 255, 255, 0.24)",
  selected: "rgba(255, 255, 255, 0.92)",
  onSelected: "#101218",
  accent: "#8fd3ff",
  warm: "#ffc98a",
  ok: "#7be3a8",
};

export const Fonts = {
  mono: "JetBrains Mono",
};

/** The strip under every window holding its grab bar and close button —
 *  keep equal to `CHROME_PX` in `examples/atrium/panes/mod.rs`. */
export const CHROME = 54;

/** A soft, quick spring for things that react to the pointer. */
export const SNAP = { duration: 160, easing: "easeOut" } as const;
