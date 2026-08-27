import { Colors } from "@/theme";

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

/** A left-pointing chevron — the home page's "back to the wall" control. The
 * font has no arrow glyph (it renders as tofu), so every arrow in this app is
 * drawn. */
export function ChevronLeftIcon({
  size = 16,
  color = Colors.textColor100,
}: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size }}>
      <path
        d="M15 5 L8 12 L15 19"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
