import type { BevyStyle, Gradient } from "bevy-react";

/** The front end's look, sampled from the game's menus: salmon-red type and
 *  frames on near-black, cyan for whatever you can act on, the wordmark in
 *  acid yellow. */
export const C = {
  red: "#ff5d51",
  redHi: "#ff8a7f",
  redDim: "#c72e2b",
  redDeep: "#912d2a",
  redLine: "rgba(255, 93, 81, 0.5)",
  redFaint: "rgba(255, 93, 81, 0.16)",
  cyan: "#5ef6ff",
  cyanHi: "#23f9ff",
  cyanDim: "#52bcd4",
  cyanDeep: "#0f3a44",
  cyanFaint: "rgba(94, 246, 255, 0.12)",
  yellow: "#fff002",
  white: "#e6fdf3",
  ink: "#050b10",
  // Panel fills.
  band: "rgba(58, 18, 24, 0.5)",
  section: "#22111c",
  row: "#1f0e15",
  field: "#16121f",
  button: "#11111e",
  shade: "rgba(5, 7, 12, 0.72)",
  clear: "rgba(0, 0, 0, 0)",
};

/** Rajdhani is the default font (Medium); its other weights are families of
 *  their own (static files). */
export const F = {
  semibold: "Rajdhani SemiBold",
  bold: "Rajdhani Bold",
  mono: "Mono",
};

/** Text styles. */
export const T = {
  /** Menu items, buttons: big uppercase. */
  menu: { fontSize: 30, color: C.red, lineBreak: "noWrap" } as BevyStyle,
  /** Screen titles ("SELECT DIFFICULTY LEVEL"). */
  title: {
    fontSize: 36,
    color: C.cyan,
    letterSpacing: 0.5,
    lineBreak: "noWrap",
  } as BevyStyle,
  /** Uppercase subtitles under a title. */
  caption: { fontSize: 19, color: C.red, letterSpacing: 0.4 } as BevyStyle,
  /** Settings labels, list text. */
  label: {
    fontSize: 22,
    fontFamily: F.semibold,
    color: C.red,
    lineBreak: "noWrap",
  } as BevyStyle,
  /** Section headers inside lists. */
  section: {
    fontSize: 22,
    fontFamily: F.semibold,
    color: C.white,
    lineBreak: "noWrap",
  } as BevyStyle,
  /** Body copy. */
  body: { fontSize: 22, color: C.cyan, lineHeight: 1.35 } as BevyStyle,
  /** The tiny data noise sprinkled around the frames. */
  micro: {
    fontSize: 9,
    fontFamily: F.mono,
    color: C.redDim,
    lineHeight: 1.3,
  } as BevyStyle,
};

export type Corner = "br" | "tl" | "tr" | "bl";

/** The gradient angle that starts at `corner` (CSS: `0` points up, angles
 *  grow clockwise; the line starts at the corner opposite its direction). */
const FROM: Record<Corner, number> = { br: 315, tl: 135, tr: 225, bl: 45 };

const transparent = "rgba(0, 0, 0, 0)";

/** A box with one corner cut off at 45° — the frame every panel, button and
 *  card is built from. No clip paths: a linear gradient whose line starts
 *  at the corner is transparent for its first `cut / √2` px and `fill` after
 *  (a 45° edge at any box size); `borderGradient` does the same to the
 *  border, so the two sides stop exactly at the cut, and a band of `line`
 *  draws the cut itself. The background paints inside the border, which is
 *  why its band starts `√2·width` earlier. */
export function chamfer(
  fill: string,
  cut: number,
  line?: string,
  width = 1,
  corner: Corner = "br",
): BevyStyle {
  const d = cut / Math.SQRT2;
  const angle = FROM[corner];
  if (!line) {
    return {
      backgroundGradient: {
        type: "linear",
        angle,
        stops: [
          { color: transparent, position: d - 0.6 },
          { color: fill, position: d + 0.6 },
        ],
      },
    };
  }
  const inner = d - Math.SQRT2 * width;
  return {
    border: width,
    backgroundGradient: {
      type: "linear",
      angle,
      stops: [
        { color: transparent, position: inner - 0.6 },
        { color: line, position: inner + 0.6 },
        { color: line, position: inner + width - 0.4 },
        { color: fill, position: inner + width + 0.6 },
      ],
    },
    borderGradient: {
      type: "linear",
      angle,
      stops: [
        { color: transparent, position: d - 0.6 },
        { color: line, position: d + 0.6 },
      ],
    },
  };
}

/** A soft horizontal fade, for the bands behind lists and headers. */
export function fade(color: string, angle = 90, from = 0, to = 1): Gradient {
  return {
    type: "linear",
    angle,
    stops: [{ color: alpha(color, from) }, { color: alpha(color, to) }],
  };
}

/** `#rrggbb` with an alpha. */
export function alpha(hex: string, a: number) {
  const n = parseInt(hex.slice(1, 7), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/** The faint scanlines laid over panels (a 4 px repeating texture). */
export const SCANLINES = {
  src: "images/scanlines.png",
  mode: "repeat",
  scale: 1,
} as const;

/** Any hover style makes a node interactive (it then owns the pointer). */
export const OWNS_POINTER = {};
