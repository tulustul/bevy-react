import type { BevyStyle } from "bevy-react";

/** Liquid glass on the screen-space UI: the `liquidGlass` backdrop filter
 *  refracts the live 3D world behind the node through a rounded bezel. */
export function glass(radius: number, bend = 1): BevyStyle {
  return {
    borderRadius: radius,
    backdropFilter: {
      name: "liquidGlass",
      params: {
        radius,
        bezel: Math.min(18, radius),
        refraction: 14 * bend,
        dispersion: 0.6,
        frost: 0.55,
        highlight: 0.75,
        tint: "rgba(20, 24, 34, 0.32)",
      },
    },
    transition: { backdropFilter: { duration: 220, easing: "easeOut" } },
  };
}
