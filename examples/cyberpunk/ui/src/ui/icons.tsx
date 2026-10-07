import { C } from "../theme";

/** A mouse, its left button lit: the "click" glyph of every hint bar. */
export function MouseIcon({
  color = C.cyan,
  size = 26,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <svg viewBox="0 0 16 24" style={{ width: (size * 16) / 24, height: size }}>
      <path
        d="M8 1.5 C4 1.5 1.8 4 1.8 8 L1.8 16 C1.8 20 4.4 22.5 8 22.5 C11.6 22.5 14.2 20 14.2 16 L14.2 8 C14.2 4 12 1.5 8 1.5 Z"
        fill="none"
        stroke={color}
        strokeWidth={1.6}
      />
      <path
        d="M8 2.5 L8 9.5 L2.8 9.5 L2.8 8 C2.8 4.6 4.6 2.6 8 2.5 Z"
        fill={color}
      />
      <line
        x1={1.8}
        y1={10}
        x2={14.2}
        y2={10}
        stroke={color}
        strokeWidth={1.2}
      />
    </svg>
  );
}

/** The little stacked-bars mark that rides inside a selected menu item. */
export function ProtocolGlyph({
  color = C.cyan,
  width = 30,
}: {
  color?: string;
  width?: number;
}) {
  return (
    <svg viewBox="0 0 30 22" style={{ width, height: (width * 22) / 30 }}>
      <rect x={0} y={0} width={12} height={2.2} fill={color} />
      <rect x={14} y={0} width={16} height={2.2} fill={color} />
      <rect x={0} y={4} width={20} height={2.2} fill={color} />
      <rect x={22} y={4} width={8} height={2.2} fill={color} />
      <rect x={0} y={8} width={8} height={2.2} fill={color} />
      <rect x={10} y={8} width={20} height={2.2} fill={color} />
      <polyline
        points={[0, 14, 10, 14, 13, 11, 17, 17, 20, 14, 30, 14]}
        fill="none"
        stroke={color}
        strokeWidth={1.4}
      />
      <rect x={0} y={19} width={30} height={1.2} fill={color} opacity={0.6} />
    </svg>
  );
}

/** A warning triangle with an exclamation mark. */
export function WarningIcon({
  color = C.red,
  size = 18,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <svg viewBox="0 0 20 18" style={{ width: size, height: (size * 18) / 20 }}>
      <polygon points={[10, 1, 19, 17, 1, 17]} fill={color} />
      <rect x={9} y={6} width={2} height={6} fill="#120a0c" />
      <rect x={9} y={13.5} width={2} height={2} fill="#120a0c" />
    </svg>
  );
}

/** The step-selector arrows: hollow triangles. */
export function Arrow({
  dir,
  color = C.cyan,
  size = 20,
}: {
  dir: "left" | "right";
  color?: string;
  size?: number;
}) {
  const points =
    dir === "left" ? [17, 2, 3, 10, 17, 18] : [3, 2, 17, 10, 3, 18];
  return (
    <svg viewBox="0 0 20 20" style={{ width: size, height: size }}>
      <polygon points={points} fill="none" stroke={color} strokeWidth={2} />
    </svg>
  );
}
