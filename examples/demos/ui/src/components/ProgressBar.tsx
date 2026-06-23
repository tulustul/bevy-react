import { BevyStyle } from "bevy-react/jsx";

export type ProgressBarProps = {
  /** Fill end, 0..1. */
  progress: number;
  /** Fill start, 0..1 (default 0). The filled segment runs from `from` to
   *  `progress`, so a non-zero `from` shows a sub-range. */
  from?: number;
  /** Optional label centered over the bar. */
  label?: string;
};

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(Math.max(v, lo), hi);

/** A horizontal bar with a colored fill segment and an optional centered label.
 *  Mirrors the Slint `ProgressBar`: track `#888`, fill `#007acc`, white label. */
export function ProgressBar({
  progress,
  from = 0,
  label = "",
}: ProgressBarProps) {
  const start = clamp(from, 0, 1);
  const fill = clamp(progress - start, 0, 1 - start);
  return (
    <node style={track}>
      <node
        style={{
          ...fillStyle,
          left: `${start * 100}%`,
          width: `${fill * 100}%`,
        }}
      />
      {label ? (
        <node style={labelWrap}>
          <text style={labelText}>{label}</text>
        </node>
      ) : null}
    </node>
  );
}

const track: BevyStyle = {
  positionType: "relative",
  width: "100%",
  height: 20,
  borderRadius: 4,
  backgroundColor: "#888",
};

const fillStyle: BevyStyle = {
  positionType: "absolute",
  top: 0,
  height: "100%",
  borderRadius: 4,
  backgroundColor: "#007acc",
};

const labelWrap: BevyStyle = {
  positionType: "absolute",
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
  alignItems: "center",
  justifyContent: "center",
};

const labelText: BevyStyle = {
  color: "white",
  fontSize: 12,
  fontWeight: "semibold",
  textAlign: "center",
};
