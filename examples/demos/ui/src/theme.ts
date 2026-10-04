import { FilterChainValue } from "bevy-react";
import type {
  BevyTransitionSpec,
  Gradient,
  ScrollbarStyle,
} from "bevy-react/jsx";

// --- Lumen ------------------------------------------------------------------
// A dark studio lit by two lights: React's cyan and Bevy's ember. Surfaces
// stay quiet and neutral; color is light — it marks what is live, active or
// under the pointer. Cyan is the interactive accent (React's side), ember the
// engine's (Bevy's side: Rust tabs, section eyebrows).
//
// Tints are OPAQUE on purpose: bevy blends UI in linear light, where a CSS
// habit like "8% white" (`#ffffff14`) lands about three times brighter than
// on the web. Each tint below is that habit pre-mixed in sRGB over the
// surface it sits on.

export const Colors = {
  // Surfaces, deepest first. The backdrop (ambient.wgsl) sits below `stage`.
  stage: "#0b0c10aa",
  card: "#111218",
  raised: "#171820",
  well: "#1e2029",
  // Controls on those surfaces: a slider's track, a switch at rest, a box's
  // rim — and their hover / strong steps.
  control: "#2a2d38",
  controlHover: "#383c49",
  controlStrong: "#4a4f5f",
  // Hairlines, and the hover tint of quiet rows.
  line: "#24262d",
  lineStrong: "#33353d",
  hover: "#191a20",
  // Text.
  text: "#edeff4",
  textBody: "#b6bcc8",
  textDim: "#7f8697",
  textFaint: "#555b69",
  /** Text and glyphs on a bright fill (any hue below). */
  ink: "#04161e",
  // The two lights.
  cyan: "#5cd9ff",
  cyanBright: "#8ae6ff",
  cyanDeep: "#2fb4e6",
  cyanGlow: "#5cd9ff59",
  /** The "selected" wash: cyan pre-mixed over a `well` (a segmented
   *  control's chosen option, a menu's picked tab). */
  cyanWash: "#294150",
  ember: "#ff8a4c",
  emberBright: "#ffaa78",
  emberDeep: "#e2602b",
  emberGlow: "#ff8a4c59",
  // The primary fill: a low, warm brass.
  brass: "#d0913c",
  brassBright: "#dea350",
  brassDeep: "#b9782a",
  // The demo-subject palette: hues of one lightness, so any of them can be
  // the box, swatch or series a demo shows. Cyan and ember above join them.
  sky: "#6ea8ff",
  violet: "#a88bff",
  rose: "#ff6b8b",
  amber: "#ffc857",
  mint: "#5ee6a8",

  shadow: "#00000099",
  transparent: "#00000000",
} as const;

/** Font families (registered in `examples/demos/main.rs`). Body text is the
 *  app's default font, Inter, and needs no family. */
export const Fonts = {
  display: "Space Grotesk",
  mono: "JetBrains Mono",
} as const;

// --- Gradient presets -------------------------------------------------------
// Built from the palette above so the whole app shares one tunable set. Each is
// a `backgroundGradient`/`borderGradient` value; tweak here to retune app-wide.

const linear = (angle: number, ...colors: string[]): Gradient => ({
  type: "linear",
  angle,
  stops: colors.map((color) => ({ color })),
});

export const Gradients = {
  // The primary fill — a low, warm brass, brighter at the top edge.
  primary: linear(180, "#e3ad62", Colors.brass, Colors.brassDeep),
  primaryHover: linear(180, "#efc07c", Colors.brassBright, "#c98936"),
  // Quiet controls: a whisper of white over whatever is behind.
  transparent: linear(180, Colors.transparent),
  surface: linear(180, "#25272e", "#1f2026"),
  surfaceHover: linear(180, "#30323a", "#292a31"),
  // The ember twin of `primary` — a Bevy-side action.
  ember: linear(180, "#ffab7c", Colors.ember, "#f2713a"),
  emberHover: linear(180, "#ffc4a1", Colors.emberBright, "#ff8a4c"),
  // A slider's filled run: a deep cyan, so the light label inside the bar
  // reads over the filled part and the empty track alike.
  trackFilled: linear(180, "#1f8ab8", "#145e7e"),
  // The brand light, cyan through violet to ember — signature moments only.
  brand: linear(90, Colors.cyan, Colors.violet, Colors.ember),
  // The sidebar's glass: dark, with the cyan gel bleeding in from the top.
  navBackdrop: [
    linear(180, "#0d0e13e6", "#0b0c10f0"),
    {
      type: "radial",
      position: "topLeft",
      stops: [
        { color: "#5cd9ff1a" },
        { color: Colors.transparent, position: 320 },
      ],
    },
  ] satisfies Gradient[],
  // Four distinct two-hue fills, for demos that need several subjects.
  spectrum: [
    linear(135, Colors.rose, Colors.ember),
    linear(135, Colors.cyan, Colors.mint),
    linear(135, Colors.violet, Colors.sky),
    linear(135, Colors.amber, Colors.ember),
  ] satisfies Gradient[],
} as const;

export const Scrollbar: ScrollbarStyle = {
  track: { backgroundColor: Colors.transparent, borderRadius: 6 },
  thumb: {
    backgroundColor: Colors.control,
    borderRadius: 6,
    hover: { backgroundColor: Colors.controlHover },
    pressed: { backgroundColor: Colors.controlStrong },
  },
  thickness: 6,
  position: "float",
};

/** The page switch: the content's light-sweep morph (`App`) and the nav
 *  pill's flight (`Navigation`) share it, so both land together. */
export const PageSwitch = {
  duration: 560,
  easing: "easeInOut",
} satisfies BevyTransitionSpec;

/** The page docs' fold ("Hide docs"): the card's fade and the examples'
 *  glide (`HeaderCard`, `App`) share it. */
export const DocsFold = {
  duration: 300,
  easing: "easeInOut",
} satisfies BevyTransitionSpec;

export const FontSizes = {
  xxs: 11,
  xs: 12,
  /** Code, inline or in blocks — the mono face reads larger than Inter. */
  code: 13.5,
  sm: 14,
  /** Reading text: docs paragraphs and lists. */
  body: 15,
  base: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  display: 44,
} as const;

export const Filters = {
  backdrop: [
    {
      name: "blur",
      params: { radius: 24 },
    },
  ] satisfies FilterChainValue,
};

export const Responsiveness = {
  desktop: 720,
  /** The content area's padding (`App.tsx`), per shell. */
  contentPadding: 40,
  contentPaddingMobile: 12,
  /** The widest the content column grows (page header, docs, examples). */
  contentMaxWidth: 1000,
  /** The sidebar's width on the regular shell. Lives here rather than in
   * `Navigation` because pages that size themselves against the content area
   * (the home page's tile grid) need it too — and `Navigation` renders from
   * `DEMOS`, which imports those pages, so importing it from one would close a
   * cycle. */
  navWidth: 248,
};
