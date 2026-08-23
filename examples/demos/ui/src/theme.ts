export const Colors = {
  primary100: "#7aa2f7",
  primary200: "#89b4fa",
  primary300: "#5a7fd6",
  primary400: "#2b4685",
  primary500: "#213563",
  primary600: "#111b33",
  primaryOverlay: "#7aa2f733",

  textColor100: "#cdd6f4",
  textColor200: "#a6adc8",
  textColor300: "#6c7086",
  textColor400: "#1e1e2e",

  surface100: "#11111b",
  surface200: "#1e1e2e",
  surface300: "#2a2a3c",
  surface400: "#313244",
  surface500: "#42425e",
  surface600: "#505072",
  surface700: "#676792ff",

  green100: "#9ece6a",
  green200: "#79a84e",
  green300: "#5c8438",
  green400: "#405f25ff",
  red100: "#f7768e",
  red200: "#ff8fa3",
  red300: "#d65a72",
  yellow100: "#e0af68",
  purple100: "#bb9af7",
  sky100: "#7dcfff",
  amber100: "#f9e2af",
  orange100: "#ff9e64",
  teal100: "#73daca",

  shadow100: "#00000088",
  shadow200: "#ffffff33",
  transparent: "#00000000",
} as const;

import { FilterChainValue } from "bevy-react";
// --- Gradient presets -------------------------------------------------------
// Built from the palette above so the whole app shares one tunable set. Each is
// a `backgroundGradient`/`borderGradient` value; tweak here to retune app-wide.
import type { Gradient, ScrollbarStyle } from "bevy-react/jsx";

const linear = (angle: number, ...colors: string[]): Gradient => ({
  type: "linear",
  angle,
  stops: colors.map((color) => ({ color })),
});

const cardBase = linear(
  160,
  Colors.surface200 + "cc",
  Colors.surface100 + "cc",
);
const cardLift = linear(
  160,
  Colors.surface300 + "cc",
  Colors.surface200 + "cc",
);

export const Gradients = {
  // accent — active nav item, radio "selected", progress fill, primary buttons
  primary: linear(135, Colors.primary300, Colors.primary100, Colors.primary200),
  primaryHover: linear(
    135,
    Colors.primary100,
    Colors.primary200,
    Colors.sky100,
  ),
  // neutral surface lifts — unselected pills, generic buttons, code toggle
  surface: linear(180, Colors.surface600, Colors.surface400),
  surfaceHover: linear(180, Colors.surface600, Colors.surface700),
  // affirmative accent — modal "Close", confirm-style buttons; hover keeps
  // the top-down direction and just lifts the shade a step
  success: linear(180, Colors.green200, Colors.green400),
  successHover: linear(180, Colors.green100, Colors.green400),
  // card / panel depth; hover lifts one surface step, selected adds a primary
  // tint on top of the lift so it reads clearly stronger than hover
  card: cardBase,
  cardHover: cardLift,
  cardSelected: [
    linear(160, Colors.surface200 + "ee", Colors.surface100 + "ee"),
  ] satisfies Gradient[],
  track: linear(180, Colors.surface500, Colors.surface500),
  trackFilled: linear(180, Colors.primary300, Colors.primary400),
  // showy multi-hue border for cards (borderGradient)
  accentBorder: linear(135, Colors.primary300, Colors.sky100, Colors.purple100),
  // resting Example cards; hover brightens partway, full accentBorder marks
  // the selected one
  accentBorderDim: linear(
    135,
    Colors.primary300 + "44",
    Colors.sky100 + "44",
    Colors.purple100 + "44",
  ),
  accentBorderHover: linear(
    135,
    Colors.primary300 + "ff",
    Colors.sky100 + "ff",
    Colors.purple100 + "ff",
  ),
  // immersive nav backdrop: dark vertical base + faint primary glow at top
  navBackdrop: [
    linear(180, Colors.surface100, Colors.surface200),
    {
      type: "radial",
      position: "top",
      stops: [
        { color: Colors.primaryOverlay },
        { color: Colors.transparent, position: 300 },
      ],
    },
  ] satisfies Gradient[],
  spectrum: [
    linear(135, Colors.red100, Colors.orange100),
    linear(135, Colors.sky100, Colors.teal100),
    linear(135, Colors.purple100, Colors.primary100),
    linear(135, Colors.green100, Colors.amber100),
  ] satisfies Gradient[],
} as const;

export const Scrollbar: ScrollbarStyle = {
  track: { backgroundColor: Colors.transparent, borderRadius: 6 },
  thumb: {
    backgroundColor: Colors.surface500,
    borderRadius: 6,
    hover: { backgroundColor: Colors.surface600 },
    pressed: { backgroundColor: Colors.surface700 },
  },
  thickness: 6,
};

export const FontSizes = {
  xxs: 11,
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 50,
} as const;

export const Filters = {
  backdrop: [
    {
      name: "blur",
      params: { radius: 20 },
    },
  ] satisfies FilterChainValue,
};
