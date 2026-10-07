import type { AttributeId, Lifepath } from "../../store";
import { C } from "../../theme";

// The new game's line-art glyphs.

/** The mouse with its wheel lit: the SCROLL hint. */
export function WheelIcon({ color = C.cyan }: { color?: string }) {
  return (
    <svg viewBox="0 0 22 24" style={{ width: 24, height: 26 }}>
      <path
        d="M8 1.5 C4 1.5 1.8 4 1.8 8 L1.8 16 C1.8 20 4.4 22.5 8 22.5 C11.6 22.5 14.2 20 14.2 16 L14.2 8 C14.2 4 12 1.5 8 1.5 Z"
        fill="none"
        stroke={color}
        strokeWidth={1.6}
      />
      <rect x={6.6} y={4.5} width={2.8} height={5.5} fill={color} />
      <polygon points={[18, 1, 21, 5, 15, 5]} fill={color} />
      <polygon points={[18, 11, 21, 7, 15, 7]} fill={color} />
    </svg>
  );
}

/** The badges left of the step titles (36 px, cyan line art). */
export function StepIcon({
  kind,
}: {
  kind:
    | "difficulty"
    | "lifepath"
    | "body"
    | "appearance"
    | "attributes"
    | "summary";
}) {
  const s = { fill: "none", stroke: C.cyan, strokeWidth: 2 } as const;
  const thin = { fill: "none", stroke: C.cyan, strokeWidth: 1.4 } as const;
  return (
    <svg viewBox="0 0 36 36" style={{ width: 36, height: 36 }}>
      {kind === "difficulty" && (
        <>
          <polygon points={[2, 5, 34, 5, 18, 33]} {...s} />
          <polygon points={[11, 13, 25, 13, 18, 25]} {...thin} />
          <rect x={10} y={7.5} width={16} height={2} fill={C.cyan} />
        </>
      )}
      {kind === "lifepath" && (
        <>
          <polygon
            points={[18, 1, 33, 9.5, 33, 26.5, 18, 35, 3, 26.5, 3, 9.5]}
            {...s}
          />
          <polyline points={[18, 27, 18, 19, 11, 12]} {...thin} />
          <line x1={18} y1={19} x2={25} y2={12} {...thin} />
          <circle cx={18} cy={27} r={2.4} fill={C.cyan} />
          <circle cx={11} cy={11.5} r={2.4} fill={C.cyan} />
          <circle cx={25} cy={11.5} r={2.4} fill={C.cyan} />
        </>
      )}
      {kind === "body" && (
        <>
          <rect x={2} y={2} width={32} height={32} rx={3} {...s} />
          <circle cx={18} cy={9} r={3} fill={C.cyan} />
          <polyline points={[11, 18, 14, 14, 22, 14, 25, 18]} {...thin} />
          <polyline points={[15, 14, 15, 22, 13, 30]} {...thin} />
          <polyline points={[21, 14, 21, 22, 23, 30]} {...thin} />
        </>
      )}
      {kind === "appearance" && (
        <>
          <rect x={2} y={2} width={32} height={32} {...s} />
          <path
            d="M18 7 C12 7 10 11 10 16 C10 22 13 28 18 29 C23 28 26 22 26 16 C26 11 24 7 18 7 Z"
            {...thin}
          />
          <line
            x1={6}
            y1={15}
            x2={30}
            y2={15}
            stroke={C.cyan}
            strokeWidth={1}
          />
          <line
            x1={6}
            y1={21}
            x2={30}
            y2={21}
            stroke={C.cyan}
            strokeWidth={1}
          />
        </>
      )}
      {kind === "attributes" && (
        <>
          <polygon
            points={[18, 2, 34, 13.6, 27.9, 32.4, 8.1, 32.4, 2, 13.6]}
            {...s}
          />
          <polygon
            points={[18, 9, 26, 15, 23, 26, 12, 25, 11, 15]}
            fill={C.cyan}
            opacity={0.55}
          />
        </>
      )}
      {kind === "summary" && (
        <>
          <polygon points={[18, 1, 35, 18, 18, 35, 1, 18]} {...s} />
          <circle cx={18} cy={18} r={8} {...thin} />
          <polyline points={[14, 18, 17, 21, 23, 14]} {...s} />
        </>
      )}
    </svg>
  );
}

/** Each attribute's badge: a hexagon round a glyph — a dumbbell, a chip, a
 *  bolt, a gear, a crosshair. */
export function AttributeIcon({
  id,
  color = C.red,
}: {
  id: AttributeId;
  color?: string;
}) {
  const s = { fill: "none", stroke: color, strokeWidth: 2 } as const;
  return (
    <svg viewBox="0 0 40 42" style={{ width: 40, height: 42 }}>
      <polygon
        points={[20, 2, 37, 11.5, 37, 30.5, 20, 40, 3, 30.5, 3, 11.5]}
        {...s}
      />
      {id === "body" && (
        <>
          <rect x={11} y={19.5} width={18} height={3} fill={color} />
          <rect x={9} y={14} width={4} height={14} fill={color} />
          <rect x={27} y={14} width={4} height={14} fill={color} />
        </>
      )}
      {id === "intelligence" && (
        <>
          <rect x={13} y={14} width={14} height={14} {...s} strokeWidth={1.6} />
          <rect x={17.5} y={18.5} width={5} height={5} fill={color} />
          <path
            d="M16 11V14M20 11V14M24 11V14M16 28V31M20 28V31M24 28V31M10 17H13M10 21H13M10 25H13M27 17H30M27 21H30M27 25H30"
            {...s}
            strokeWidth={1.2}
          />
        </>
      )}
      {id === "reflexes" && (
        <polygon
          points={[22, 9, 13, 23, 19, 23, 17, 33, 27, 18, 21, 18]}
          fill={color}
        />
      )}
      {id === "tech" && (
        <>
          <polygon
            points={[
              17, 10, 23, 10, 24, 14, 28, 12, 31, 17, 27, 20, 31, 25, 28, 30,
              24, 28, 23, 32, 17, 32, 16, 28, 12, 30, 9, 25, 13, 21, 9, 17, 12,
              12, 16, 14,
            ]}
            {...s}
            strokeWidth={1.4}
          />
          <circle cx={20} cy={21} r={4} fill={color} />
        </>
      )}
      {id === "cool" && (
        <>
          <circle cx={20} cy={21} r={8} {...s} strokeWidth={1.6} />
          <path
            d="M20 9V16M20 26V33M8 21H15M25 21H32"
            {...s}
            strokeWidth={1.6}
          />
          <circle cx={20} cy={21} r={1.8} fill={color} />
        </>
      )}
    </svg>
  );
}

/** A small glyph per lifepath: a mesa and a sun, a skyline, a tower. */
export function LifepathIcon({
  id,
  color = C.cyan,
}: {
  id: Lifepath;
  color?: string;
}) {
  const s = { fill: "none", stroke: color, strokeWidth: 1.6 } as const;
  return (
    <svg viewBox="0 0 24 24" style={{ width: 22, height: 22 }}>
      <rect x={1} y={1} width={22} height={22} {...s} strokeWidth={1} />
      {id === "nomad" && (
        <>
          <polyline points={[3, 19, 9, 10, 13, 15, 16, 11, 21, 19]} {...s} />
          <circle cx={16} cy={6} r={2.2} fill={color} />
        </>
      )}
      {id === "streetkid" && (
        <path d="M3 21V12H7V8H11V14H14V5H18V11H21V21" {...s} />
      )}
      {id === "corpo" && (
        <>
          <polygon points={[9, 21, 10, 7, 12, 3, 14, 7, 15, 21]} {...s} />
          <line x1={4} y1={21} x2={20} y2={21} {...s} />
        </>
      )}
    </svg>
  );
}

/** The grid button's glyph: two rows of three cells. */
export function GridIcon() {
  return (
    <svg viewBox="0 0 26 20" style={{ width: 26, height: 20 }}>
      {[0, 1].flatMap((r) =>
        [0, 1, 2].map((c) => (
          <rect
            key={`${r}${c}`}
            x={1 + c * 9}
            y={1 + r * 10}
            width={6}
            height={8}
            rx={1}
            fill="none"
            stroke={C.cyan}
            strokeWidth={1.4}
          />
        )),
      )}
    </svg>
  );
}
