import type { ReactNode } from "react";
import type { BevyStyle } from "bevy-react";
import { Colors, Fonts } from "./theme";

/** Liquid glass: the `liquidGlass` backdrop filter refracts the live 3D
 *  world behind the node through a rounded bezel (dispersion, lit rim).
 *  `bend` scales the refraction — hover a glass button and it swells. */
export function glass(radius: number, bend = 1): BevyStyle {
  return {
    borderRadius: radius,
    backdropFilter: {
      name: "liquidGlass",
      params: {
        radius,
        bezel: Math.min(20, radius),
        refraction: 16 * bend,
        dispersion: 0.7,
        frost: 0.12,
        highlight: 0.8,
        tint: "rgba(160, 130, 255, 0.07)",
      },
    },
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    transition: { backdropFilter: { duration: 260, easing: "easeOut" } },
  };
}

export function GlassButton({
  onClick,
  children,
  radius = 26,
  style,
}: {
  onClick?: () => void;
  children: ReactNode;
  radius?: number;
  style?: BevyStyle;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        ...glass(radius),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: { horizontal: 26, vertical: 14 },
        cursor: "pointer",
        ...style,
      }}
      hoverStyle={{
        ...glass(radius, 1.7),
        backgroundColor: "rgba(255, 255, 255, 0.06)",
      }}
      pressStyle={{
        ...glass(radius, 0.6),
        backgroundColor: "rgba(255, 255, 255, 0.1)",
      }}
    >
      {children}
    </button>
  );
}

export function Label({
  children,
  style,
}: {
  children: ReactNode;
  style?: BevyStyle;
}) {
  return (
    <text
      style={{
        fontFamily: Fonts.display,
        fontSize: 15,
        fontWeight: "medium",
        letterSpacing: 2.5,
        color: Colors.text,
        ...style,
      }}
    >
      {children}
    </text>
  );
}
