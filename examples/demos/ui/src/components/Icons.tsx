import type { PropsWithChildren } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Colors } from "@/theme";

/** A square, borderless tap target for one icon (the shell's menu/close). */
export function IconButton({
  size = 36,
  style,
  onClick,
  children,
}: PropsWithChildren<{
  size?: number;
  style?: BevyStyle;
  onClick: () => void;
}>) {
  return (
    <node
      style={{ ...iconButtonStyle, width: size, height: size, ...style }}
      hoverStyle={iconButtonHoverStyle}
      pressStyle={iconButtonPressStyle}
      onClick={onClick}
    >
      {children}
    </node>
  );
}

const iconButtonStyle: BevyStyle = {
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 8,
  cursor: "pointer",
};

const iconButtonHoverStyle: BevyStyle = {
  backgroundColor: Colors.surface300,
};

const iconButtonPressStyle: BevyStyle = {
  backgroundColor: Colors.surface400,
};

type IconProps = { size?: number; color?: string };

// Shell icons as inline <svg>: the demo font lacks several symbol glyphs
// (they render as tofu), so nothing here rides on a text glyph.

/** Three bars — the compact shell's "open the nav drawer" button. */
export function MenuIcon({
  size = 24,
  color = Colors.textColor100,
}: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size }}>
      <rect x={3} y={5} width={18} height={2} rx={1} fill={color} />
      <rect x={3} y={11} width={18} height={2} rx={1} fill={color} />
      <rect x={3} y={17} width={18} height={2} rx={1} fill={color} />
    </svg>
  );
}

/** A cross — the drawer's close button. */
export function CloseIcon({
  size = 24,
  color = Colors.textColor100,
}: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size }}>
      <line
        x1={6}
        y1={6}
        x2={18}
        y2={18}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <line
        x1={18}
        y1={6}
        x2={6}
        y2={18}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}
