import type { Lifepath } from "../../store";
import { C } from "../../theme";

// The datashard, drawn in isometric: a slab whose length runs down-right
// and whose width runs up-right (30°), seen from above its near long side.
const L = 92;
const W = 34;
const T = 7;
/** A point on the slab: `u` along its length, `v` across it (both 0..1),
 *  `z` px down its thickness. */
const at = (u: number, v: number, z = 0) => [
  8 + 0.866 * (u * L + v * W),
  31 + 0.5 * (u * L - v * W) + z,
];
/** A patch of the top face. */
const patch = (u0: number, u1: number, v0: number, v1: number) => [
  ...at(u0, v0),
  ...at(u1, v0),
  ...at(u1, v1),
  ...at(u0, v1),
];
/** The face hanging under the top edge from `(u0, v0)` to `(u1, v1)`. */
const side = (u0: number, v0: number, u1: number, v1: number) => [
  ...at(u0, v0),
  ...at(u1, v1),
  ...at(u1, v1, T),
  ...at(u0, v0, T),
];

const INK = "#4a0f12";

/** A red datashard, the save game's own icon. */
export function Datashard({ width = 118 }: { width?: number }) {
  return (
    <svg viewBox="0 0 126 90" style={{ width, height: (width * 90) / 126 }}>
      <polygon points={side(0, 0, 1, 0)} fill="#a8302b" />
      <polygon points={side(1, 0, 1, 1)} fill="#d3463c" />
      <polygon points={patch(0, 1, 0, 1)} fill="#ff6457" />
      {/* The contacts, the label strip, the printed lines. */}
      <polygon points={patch(0.03, 0.12, 0.12, 0.42)} fill={INK} />
      <polygon points={patch(0.05, 0.1, 0.55, 0.88)} fill={INK} opacity={0.7} />
      <polygon points={patch(0.36, 0.96, 0.1, 0.36)} fill={INK} />
      <polygon points={patch(0.17, 0.66, 0.8, 0.85)} fill={INK} opacity={0.8} />
      <polygon
        points={patch(0.17, 0.52, 0.68, 0.72)}
        fill={INK}
        opacity={0.6}
      />
      <polygon
        points={patch(0.17, 0.3, 0.48, 0.58)}
        fill={INK}
        opacity={0.55}
      />
      <polygon points={patch(0.88, 0.9, 0, 1)} fill="#b8362f" />
      <polyline
        points={[...at(0, 1), ...at(1, 1), ...at(1, 0)]}
        fill="none"
        stroke="#ff9a8f"
        strokeWidth={0.8}
      />
    </svg>
  );
}

/** The lifepaths' badges: a red disc with a dark glyph — a road for the
 *  Nomad, a tag for the Streetkid, a globe for the Corpo. */
export function LifepathIcon({
  lifepath,
  size = 20,
}: {
  lifepath: Lifepath;
  size?: number;
}) {
  return (
    <svg viewBox="0 0 20 20" style={{ width: size, height: size }}>
      <circle cx={10} cy={10} r={9.5} fill={C.red} />
      {lifepath === "nomad" && (
        <>
          <polygon
            points={[8.6, 4.5, 11.4, 4.5, 16, 15.5, 4, 15.5]}
            fill={INK}
          />
          <polyline
            points={[10, 6.5, 10, 8.5]}
            stroke={C.red}
            strokeWidth={1.2}
            fill="none"
          />
          <polyline
            points={[10, 10.5, 10, 13.5]}
            stroke={C.red}
            strokeWidth={1.4}
            fill="none"
          />
        </>
      )}
      {lifepath === "streetkid" && (
        <polyline
          points={[4.5, 13, 8, 6, 10, 11, 12.5, 5.5, 15.5, 12.5]}
          stroke={INK}
          strokeWidth={2.2}
          strokeLinejoin="miter"
          fill="none"
        />
      )}
      {lifepath === "corpo" && (
        <>
          <circle
            cx={10}
            cy={10}
            r={5.6}
            stroke={INK}
            strokeWidth={1.5}
            fill="none"
          />
          <ellipse
            cx={10}
            cy={10}
            rx={2.3}
            ry={5.6}
            stroke={INK}
            strokeWidth={1.2}
            fill="none"
          />
          <polyline
            points={[4.4, 10, 15.6, 10]}
            stroke={INK}
            strokeWidth={1.2}
            fill="none"
          />
        </>
      )}
    </svg>
  );
}
