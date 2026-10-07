import type { BevyStyle } from "bevy-react";
import { Colors } from "./theme";

/** A star polygon's flat point list: `count` tips at `outer`, valleys at
 *  `inner`, first tip straight up. */
function star(count: number, outer: number, inner: number): number[] {
  const points: number[] = [];
  for (let k = 0; k < count * 2; k++) {
    const a = (k * Math.PI) / count - Math.PI / 2;
    const r = k % 2 === 0 ? outer : inner;
    points.push(Math.cos(a) * r, Math.sin(a) * r);
  }
  return points;
}

function triangle(r: number, turn: number): number[] {
  return [0, 1, 2].flatMap((k) => {
    const a = turn + (k * 2 * Math.PI) / 3 - Math.PI / 2;
    return [Math.cos(a) * r, Math.sin(a) * r];
  });
}

const TICKS = Array.from({ length: 36 }, (_, k) => (k * Math.PI) / 18);
const ORBS = [1, 3, 5, 7].map((k) => (k * Math.PI) / 4);

const STAR = star(12, 82, 38);
const UP = triangle(34, 0);
const DOWN = triangle(34, Math.PI);

/** The card-back mandala — vector art, drawn by `<svg>` (resvg on the CPU,
 *  re-rasterized at whatever size it lays out). */
export function Sigil({
  size,
  color = Colors.gold,
  style,
}: {
  size: number;
  color?: string;
  style?: BevyStyle;
}) {
  return (
    <svg
      viewBox="-100 -100 200 200"
      style={{ width: size, height: size, ...style }}
    >
      <circle r={96} fill="none" stroke={color} strokeWidth={1.4} />
      <circle
        r={88}
        fill="none"
        stroke={color}
        strokeWidth={0.6}
        opacity={0.7}
      />
      {TICKS.map((a) => (
        <line
          key={a}
          x1={Math.cos(a) * 88}
          y1={Math.sin(a) * 88}
          x2={Math.cos(a) * 96}
          y2={Math.sin(a) * 96}
          stroke={color}
          strokeWidth={0.8}
          opacity={0.8}
        />
      ))}
      <polygon
        points={STAR}
        fill="none"
        stroke={color}
        strokeWidth={1.1}
        strokeLinejoin="round"
      />
      <circle
        r={38}
        fill="none"
        stroke={color}
        strokeWidth={0.8}
        opacity={0.8}
      />
      <polygon points={UP} fill="none" stroke={color} strokeWidth={0.9} />
      <polygon points={DOWN} fill="none" stroke={color} strokeWidth={0.9} />
      <circle
        r={20}
        fill="none"
        stroke={color}
        strokeWidth={0.6}
        opacity={0.7}
      />
      <circle r={7} fill={color} />
      {ORBS.map((a) => (
        <circle
          key={a}
          cx={Math.cos(a) * 62}
          cy={Math.sin(a) * 62}
          r={4.5}
          fill={color}
          opacity={0.9}
        />
      ))}
    </svg>
  );
}
