import { useState, type ReactNode } from "react";
import type { BevyStyle } from "bevy-react";
import type { CivInfo } from "../bevy";
import { C, Fonts, caps, gilt, tone } from "../theme";
import { Icon, type IconName } from "./Icon";

/** A filled ring: `progress` (0..1) of `color` over a dim track, as a
 *  conic gradient. */
export function conic(
  progress: number,
  color: string,
): BevyStyle["backgroundGradient"] {
  const deg = Math.max(0, Math.min(1, progress)) * 360;
  const track = "rgba(0, 0, 0, 0.55)";
  return {
    type: "conic",
    stops: [
      { color, angle: 0 },
      { color, angle: deg },
      { color: track, angle: deg },
      { color: track, angle: 360 },
    ],
  };
}

export function radial(
  inner: string,
  outer: string,
): BevyStyle["backgroundGradient"] {
  return { type: "radial", stops: [{ color: inner }, { color: outer }] };
}

/** The round gilt frame the great 4X games put every portrait in, with an
 *  optional progress ring inside the gold. */
export function Medallion({
  size,
  inner = C.slateHi,
  outer = C.navy,
  progress,
  ring = C.science,
  children,
  style,
}: {
  size: number;
  inner?: string;
  outer?: string;
  progress?: number;
  ring?: string;
  children?: ReactNode;
  style?: BevyStyle;
}) {
  const r = size / 2;
  const frame = Math.max(2, Math.round(size * 0.06));
  const face = (
    <node
      style={{
        flexGrow: 1,
        borderRadius: r,
        backgroundGradient: radial(inner, outer),
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </node>
  );
  return (
    <node
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: r,
        backgroundGradient: gilt,
        padding: frame,
        ...style,
      }}
    >
      {progress === undefined ? (
        face
      ) : (
        <node
          style={{
            flexGrow: 1,
            borderRadius: r,
            padding: Math.max(3, size * 0.075),
            backgroundGradient: conic(progress, ring),
          }}
        >
          {face}
        </node>
      )}
    </node>
  );
}

/** A round gilt icon button with a caption on hover. */
export function RoundButton({
  icon,
  size = 38,
  color = C.goldHi,
  tip,
  tipSide = "bottom",
  active = false,
  onClick,
}: {
  icon: IconName;
  size?: number;
  color?: string;
  tip?: string;
  tipSide?: "bottom" | "top" | "left";
  active?: boolean;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  const r = size / 2;
  return (
    <button
      onClick={onClick}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      style={{
        width: size,
        height: size,
        borderRadius: r,
        padding: 2,
        backgroundGradient: gilt,
        boxShadow: active
          ? { color: "rgba(246, 228, 168, 0.55)", blurRadius: 10 }
          : { color: "rgba(0, 0, 0, 0.5)", blurRadius: 6, yOffset: 2 },
      }}
      hoverStyle={{
        boxShadow: { color: "rgba(246, 228, 168, 0.45)", blurRadius: 12 },
      }}
      pressStyle={{ transform: { scale: 0.93 } }}
    >
      <node
        style={{
          flexGrow: 1,
          borderRadius: r,
          alignItems: "center",
          justifyContent: "center",
          backgroundGradient: active
            ? radial("#3f6a92", C.slate)
            : radial(C.slateHi, C.navy),
        }}
      >
        <Icon name={icon} size={size * 0.5} color={color} />
      </node>
      {hover && tip && <Tip text={tip} side={tipSide} offset={size + 6} />}
    </button>
  );
}

/** A small caption plate beside its (relatively positioned) parent. */
export function Tip({
  text,
  side,
  offset,
}: {
  text: string;
  side: "bottom" | "top" | "left";
  offset: number;
}) {
  const place: BevyStyle =
    side === "left"
      ? { right: offset, top: "50%", transform: { translateY: "-50%" } }
      : {
          left: "50%",
          transform: { translateX: "-50%" },
          ...(side === "bottom" ? { top: offset } : { bottom: offset }),
        };
  return (
    <node
      style={{
        positionType: "absolute",
        ...place,
        padding: { horizontal: 10, vertical: 5 },
        backgroundColor: "rgba(6, 13, 21, 0.94)",
        border: 1,
        borderColor: C.goldLo,
        borderRadius: 3,
        globalZIndex: 10,
      }}
    >
      <text style={{ fontSize: 12, color: C.text, lineBreak: "noWrap" }}>
        {text}
      </text>
    </node>
  );
}

/** A section title between two fading gold rules. */
export function Header({
  children,
  color = C.gold,
}: {
  children: string;
  color?: string;
}) {
  const rule = (angle: number): BevyStyle => ({
    flexGrow: 1,
    height: 1,
    backgroundGradient: {
      type: "linear",
      angle,
      stops: [{ color: "rgba(217, 183, 108, 0)" }, { color: C.goldLine }],
    },
  });
  return (
    <node style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <node style={rule(90)} />
      <text style={{ ...caps, color }}>{children.toUpperCase()}</text>
      <node style={rule(270)} />
    </node>
  );
}

/** A progress bar that eases to its new value. */
export function Bar({
  value,
  width,
  color,
  height = 6,
}: {
  value: number;
  width: number;
  color: string;
  height?: number;
}) {
  return (
    <node
      style={{
        width,
        height,
        flexShrink: 0,
        borderRadius: height / 2,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        border: 1,
        borderColor: "rgba(255, 255, 255, 0.06)",
      }}
    >
      <node
        style={{
          width: Math.max(0, Math.min(1, value)) * (width - 2),
          height: height - 2,
          borderRadius: height / 2,
          backgroundColor: color,
          transition: { size: { duration: 600, easing: "easeOut" } },
        }}
      />
    </node>
  );
}

/** An icon and a number in the yield's color. */
export function Amount({
  icon,
  color,
  value,
  size = 13,
}: {
  icon: IconName;
  color: string;
  value: string;
  size?: number;
}) {
  return (
    <node style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      <Icon name={icon} size={size + 3} color={color} />
      <text style={{ fontSize: size, fontWeight: "semibold", color }}>
        {value}
      </text>
    </node>
  );
}

/** The ✕ in a panel's corner. */
export function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        border: 1,
        borderColor: C.goldLo,
        backgroundColor: "rgba(6, 13, 21, 0.6)",
      }}
      hoverStyle={{ backgroundColor: C.slateHi, borderColor: C.gold }}
      pressStyle={{ transform: { scale: 0.92 } }}
    >
      <Icon name="close" size={14} color={C.goldHi} />
    </button>
  );
}

/** A civilization's round crest: its initial on its color. */
export function Crest({ civ, size }: { civ: CivInfo; size: number }) {
  return (
    <Medallion
      size={size}
      inner={tone(civ.color, 1.25)}
      outer={tone(civ.color, 0.4)}
    >
      <text
        style={{
          fontFamily: Fonts.display,
          fontWeight: "bold",
          fontSize: size * 0.42,
          color: "#ffffff",
          textShadow: { color: "rgba(0, 0, 0, 0.6)", offsetX: 0, offsetY: 1 },
        }}
      >
        {civ.name[0]}
      </text>
    </Medallion>
  );
}
