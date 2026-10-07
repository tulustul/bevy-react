import type { BevyStyle } from "bevy-react";

/** Civilization's look, after the great 4X interfaces: deep navy panels in fine
 *  gold frames, parchment-white type, carved capitals for titles, and one
 *  color per kind of yield. */
export const C = {
  ink: "#060d15",
  navy: "#0d1826",
  navyHi: "#1b2d44",
  slate: "#22384f",
  slateHi: "#2e4b69",
  gold: "#d9b76c",
  goldHi: "#f6e4a8",
  goldLo: "#8a6b35",
  goldLine: "rgba(217, 183, 108, 0.45)",
  text: "#f0e8d6",
  muted: "#a2b3c6",
  faint: "#62778d",
  good: "#7ad35e",
  bad: "#ec6450",
  // The yields.
  food: "#8fd34f",
  production: "#f09b3d",
  coin: "#f6cf4a",
  science: "#5fbff4",
  culture: "#d08aef",
  faith: "#e4defe",
};

export const Fonts = {
  /** Carved Roman capitals, for titles. */
  display: "Cinzel",
};

export type YieldKey =
  | "food"
  | "production"
  | "gold"
  | "science"
  | "culture"
  | "faith";

export const YIELDS: { key: YieldKey; name: string; color: string }[] = [
  { key: "food", name: "Food", color: C.food },
  { key: "production", name: "Production", color: C.production },
  { key: "gold", name: "Gold", color: C.coin },
  { key: "science", name: "Science", color: C.science },
  { key: "culture", name: "Culture", color: C.culture },
  { key: "faith", name: "Faith", color: C.faith },
];

/** The framed navy panel nearly everything sits on. */
export const panel: BevyStyle = {
  backgroundGradient: {
    type: "linear",
    angle: 180,
    stops: [{ color: C.navyHi }, { color: C.navy }],
  },
  border: 1,
  borderColor: C.goldLo,
  borderRadius: 3,
  boxShadow: { color: "rgba(0, 0, 0, 0.55)", blurRadius: 16, yOffset: 5 },
};

/** Brushed gold, for rings and frames. */
export const gilt: BevyStyle["backgroundGradient"] = {
  type: "linear",
  angle: 160,
  stops: [
    { color: C.goldHi },
    { color: C.gold },
    { color: C.goldLo },
    { color: C.gold },
  ],
};

/** Small spaced capitals: section titles and labels. */
export const caps: BevyStyle = {
  fontSize: 11,
  fontWeight: "semibold",
  letterSpacing: 1.6,
  color: C.gold,
  lineBreak: "noWrap",
};

/** A panel's `hoverStyle`. Any hover style makes a node interactive, and
 *  hovering an interactive node is what `PointerCapture` reports as the
 *  pointer being the UI's — so the map underneath a panel ignores it. */
export const OWNS_POINTER = {};

/** A yield: whole above a hundred or when it is one, else one decimal. */
export const fmt = (n: number) =>
  Math.abs(n) >= 100 || Math.abs(n - Math.round(n)) < 0.05
    ? Math.round(n).toString()
    : n.toFixed(1);

export const signed = (n: number) => (n >= 0 ? `+${fmt(n)}` : fmt(n));

/** `hex` lightened toward white (`k > 1`) or darkened (`k < 1`). */
export function tone(hex: string, k: number) {
  const n = parseInt(hex.slice(1, 7), 16);
  return (
    "#" +
    [(n >> 16) & 255, (n >> 8) & 255, n & 255]
      .map((c) => (k >= 1 ? c + (255 - c) * (k - 1) : c * k))
      .map((c) =>
        Math.round(Math.min(255, Math.max(0, c)))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

/** `a` blended `t` of the way to `b` (opaque hex colors). */
export function mix(a: string, b: string, t: number) {
  const ch = (hex: string) => {
    const n = parseInt(hex.slice(1, 7), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const [x, y] = [ch(a), ch(b)];
  return (
    "#" +
    x
      .map((c, i) =>
        Math.round(c + (y[i] - c) * t)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}
