import type { ReactNode } from "react";
import type { BevyStyle } from "bevy-react";
import { C, F, T, chamfer } from "../theme";
import { MouseIcon } from "./icons";

/** The glyphs drawn inside a keycap instead of a letter. */
const GLYPHS: Record<string, number[]> = {
  space: [1.5, 1, 1.5, 8, 16.5, 8, 16.5, 1],
  enter: [16, 1, 16, 7, 3, 7, 7, 3.5, 3, 7, 7, 10],
};

/** A key as the hints draw it: a bracketed letter, a tiny word ("ESC"), or
 *  a glyph (`k: "space"`, `"enter"`). */
export function Keycap({ k, color = C.cyan }: { k: string; color?: string }) {
  const glyph = GLYPHS[k];
  if (glyph) {
    return (
      <node
        style={{
          width: 27,
          height: 27,
          border: 2,
          borderColor: color,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg viewBox="0 0 18 10" style={{ width: 16, height: 9 }}>
          <polyline points={glyph} fill="none" stroke={color} strokeWidth={2} />
        </svg>
      </node>
    );
  }
  const word = k.length > 1;
  return (
    <node
      style={{
        minWidth: 27,
        height: 27,
        padding: { horizontal: word ? 3 : 0 },
        border: 2,
        borderColor: color,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <text
        style={{
          fontSize: word ? 11 : 20,
          fontFamily: F.bold,
          color,
          lineBreak: "noWrap",
        }}
      >
        {k}
      </text>
    </node>
  );
}

/** One hint: a key (or the mouse, `k: "mouse"`) and what it does. Clickable,
 *  like the game's. */
export function Hint({
  k,
  label,
  onClick,
  color = C.red,
}: {
  k: string;
  label: string;
  onClick?: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: C.clear,
      }}
      hoverStyle={{ opacity: 0.8 }}
    >
      {k === "mouse" ? <MouseIcon /> : <Keycap k={k} />}
      <text style={{ fontSize: 25, color, lineBreak: "noWrap" }}>{label}</text>
    </button>
  );
}

/** The hint bar, bottom right of every screen. */
export function Hints({ children }: { children: ReactNode }) {
  return (
    <node
      style={{
        positionType: "absolute",
        right: 52,
        bottom: 46,
        flexDirection: "row",
        alignItems: "center",
        gap: 30,
      }}
    >
      {children}
    </node>
  );
}

/** A cut-corner button: cyan label on a dark plate in a dim red frame;
 *  brighter on hover. `hot` keeps it lit (keyboard focus). */
export function CutButton({
  label,
  onClick,
  width,
  height = 52,
  k,
  hot = false,
  disabled = false,
  style,
}: {
  label: string;
  onClick?: () => void;
  width?: number;
  height?: number;
  k?: string;
  hot?: boolean;
  disabled?: boolean;
  style?: BevyStyle;
}) {
  const frame = hot ? C.cyan : "rgba(255, 93, 81, 0.45)";
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{
        ...chamfer(C.button, 12, frame, 1),
        width,
        height,
        padding: { horizontal: 24 },
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        opacity: disabled ? 0.4 : 1,
        ...style,
      }}
      hoverStyle={disabled ? undefined : chamfer("#1a1a2c", 12, C.cyan, 1)}
    >
      <text
        style={{
          ...T.menu,
          fontSize: 25,
          color: C.cyan,
          letterSpacing: 0.6,
        }}
      >
        {label}
      </text>
      {k && <Keycap k={k} />}
    </button>
  );
}

/** The header of the full-screen menus: a long red rule across the top,
 *  the title in cyan with its badge and a stack of binary, a row of segments
 *  under it (the current step lit cyan) and a red caption below. */
export function Header({
  title,
  caption,
  icon,
  step = 0,
  steps = 5,
  left = 606,
}: {
  title: string;
  caption?: string;
  /** The badge left of the title (a small `<svg>`, ~34 px). */
  icon?: ReactNode;
  /** The lit segment (0-based); `-1` lights none. */
  step?: number;
  steps?: number;
  /** Where the title block starts, px. */
  left?: number;
}) {
  const segment = 138;
  const gap = 6;
  const width = steps * segment + (steps - 1) * gap;
  const rule = "rgba(255, 93, 81, 0.75)";
  return (
    <node
      style={{
        positionType: "absolute",
        left: 0,
        right: 0,
        top: 0,
        height: 120,
      }}
    >
      <node
        style={{
          positionType: "absolute",
          left: 0,
          width: left - 8,
          top: 44,
          height: 2,
          backgroundGradient: {
            type: "linear",
            angle: 90,
            stops: [{ color: "rgba(255, 93, 81, 0.35)" }, { color: rule }],
          },
        }}
      />
      <node
        style={{
          positionType: "absolute",
          left: left + width + 8,
          right: 0,
          top: 44,
          height: 2,
          backgroundGradient: {
            type: "linear",
            angle: 90,
            stops: [{ color: rule }, { color: "rgba(255, 93, 81, 0.35)" }],
          },
        }}
      />
      <node
        style={{
          positionType: "absolute",
          left,
          top: 8,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        {icon}
        <text
          style={{ ...T.micro, fontSize: 7, color: C.cyan, lineHeight: 1.1 }}
        >
          {"01100011\n01101000\n01100001\n01110010"}
        </text>
        <text style={T.title}>{title}</text>
      </node>
      <node
        style={{
          positionType: "absolute",
          left,
          top: 50,
          flexDirection: "row",
          gap,
        }}
      >
        {Array.from({ length: steps }, (_, i) => (
          <node
            key={i}
            style={{
              width: segment,
              height: i === step ? 3 : 2,
              backgroundColor: i === step ? C.cyan : "rgba(255, 93, 81, 0.45)",
            }}
          />
        ))}
      </node>
      {caption && (
        <text
          style={{
            ...T.caption,
            positionType: "absolute",
            left,
            top: 64,
            width: 760,
          }}
        >
          {caption}
        </text>
      )}
    </node>
  );
}

/** Fill the screen (screens are absolutely positioned layers). */
export const FILL: BevyStyle = {
  positionType: "absolute",
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
};
