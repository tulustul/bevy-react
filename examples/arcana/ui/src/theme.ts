import type { BevyStyle } from "bevy-react";

export const Fonts = {
  display: "Space Grotesk",
  script: "Dancing Script",
};

export const Colors = {
  gold: "#f3d58a",
  goldDeep: "#b9872f",
  goldFaint: "rgba(243, 213, 138, 0.45)",
  ink: "#07050d",
  text: "#f6efff",
  muted: "rgba(236, 226, 255, 0.62)",
  faint: "rgba(236, 226, 255, 0.38)",
};

/** The gilded frame every card and the pack share. */
export const GILT: BevyStyle["backgroundGradient"] = {
  type: "linear",
  angle: 155,
  stops: [
    { color: "#fbe9b0" },
    { color: "#c99a45" },
    { color: "#7c5620" },
    { color: "#e9c77a" },
    { color: "#8a6224" },
  ],
};

export const TEXT_DISPLAY: BevyStyle = {
  fontFamily: Fonts.display,
  color: Colors.text,
};

/** Fast-in, soft-landing spring for things that fly. */
export const FLY = { stiffness: 120, damping: 16, mass: 1 };
