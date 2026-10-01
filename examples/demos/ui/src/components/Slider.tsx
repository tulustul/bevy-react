import { BevyStyle, PointerEventData } from "bevy-react/jsx";
import { Colors, FontSizes, Gradients } from "@/theme";

export type SliderProps = {
  /** Current value (controlled — the parent owns it). */
  value: number;
  /** Range minimum (default 0). */
  min?: number;
  /** Range maximum (default 1). */
  max?: number;
  /** What the value is: the slider labels itself `name value+unit` — the
   *  caller never builds the string. */
  name: string;
  /** Digits after the point. Defaults to 2 for a range of 2 or less
   *  (normalised 0..1 values) and 0 for anything wider (angles, pixels). */
  decimals?: number;
  /** Appended to the value with no space — `"px"`, `"°"`. Include the space
   *  yourself when the unit reads as a word (`" ms"`). */
  unit?: string;
  /** Called with the new value on click and during a drag. */
  onChange: (value: number) => void;
};

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(Math.max(v, lo), hi);

/** A draggable slider: a track with a filled segment and a centered label.
 *  Maps the cursor's normalized x (0..1 across the track) to a value in
 *  `[min, max]`. Mirrors the Slint `Slider`: click-to-set plus drag, clamped
 *  to the ends.
 *
 *  Drag works via the native pointer events: `onPointerDown` covers Slint's
 *  `clicked`, and `onPointerMove` (which fires only while the button is held)
 *  covers `moved`-while-pressed and keeps following the cursor past the ends. */
export function Slider({
  value,
  min = 0,
  max = 1,
  name,
  decimals,
  unit = "",
  onChange,
}: SliderProps) {
  const digits = decimals ?? (max - min <= 2 ? 2 : 0);
  const progress = max > min ? clamp((value - min) / (max - min), 0, 1) : 0;
  const setFromX = (e: PointerEventData) =>
    onChange(min + (max - min) * clamp(e.x, 0, 1));

  return (
    <node style={track} onPointerDown={setFromX} onPointerMove={setFromX}>
      <node style={{ ...fillStyle, width: `${progress * 100}%` }} />
      <node style={labelWrap}>
        <text style={labelText}>
          {`${name} ${value.toFixed(digits)}${unit}`}
        </text>
      </node>
    </node>
  );
}

const track: BevyStyle = {
  positionType: "relative",
  width: "100%",
  height: 20,
  borderRadius: 6,
  backgroundColor: Colors.surface500,
  backgroundGradient: Gradients.track,
  cursor: "pointer",
  focusPolicy: "block",
};

const fillStyle: BevyStyle = {
  positionType: "absolute",
  left: 0,
  top: 0,
  height: "100%",
  borderRadius: 6,
  backgroundGradient: Gradients.trackFilled,
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
  color: Colors.textColor100,
  fontSize: FontSizes.xs,
  fontWeight: "semibold",
  textAlign: "center",
};
