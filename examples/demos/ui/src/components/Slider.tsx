import { BevyStyle, PointerEventData } from "bevy-react/jsx";
import { ProgressBar } from "./ProgressBar";
import { Colors, Gradients } from "@/theme";

export type SliderProps = {
  /** Current value (controlled — the parent owns it). */
  value: number;
  /** Range minimum (default 0). */
  min?: number;
  /** Range maximum (default 1). */
  max?: number;
  /** What the value is. Given one, the slider formats its own label as
   *  `name value+unit` — the caller never builds the string. */
  name?: string;
  /** Digits after the point. Defaults to 2 for a range of 2 or less
   *  (normalised 0..1 values) and 0 for anything wider (angles, pixels). */
  decimals?: number;
  /** Appended to the value with no space — `"px"`, `"°"`. Include the space
   *  yourself when the unit reads as a word (`" ms"`). */
  unit?: string;
  /** A fully explicit label, for the rare one that isn't `name value`.
   *  Overrides `name`/`decimals`/`unit`. */
  label?: string;
  /** Called with the new value on click and during a drag. */
  onChange: (value: number) => void;
};

/** The one place a slider value becomes text. `ParamControls` drives the
 *  `Slider` props rather than formatting ahead of it, so every slider in the
 *  gallery rounds and suffixes identically. */
export function formatSliderValue(
  value: number,
  {
    min = 0,
    max = 1,
    decimals,
    unit = "",
  }: Omit<SliderProps, "value" | "onChange">,
): string {
  const digits = decimals ?? (max - min <= 2 ? 2 : 0);
  return `${value.toFixed(digits)}${unit}`;
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(Math.max(v, lo), hi);

/** A draggable slider built on `ProgressBar`. Maps the cursor's normalized x
 *  (0..1 across the track) to a value in `[min, max]`. Mirrors the Slint
 *  `Slider`: click-to-set plus drag, clamped to the ends.
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
  unit,
  label,
  onChange,
}: SliderProps) {
  const text =
    label ??
    (name === undefined
      ? ""
      : `${name} ${formatSliderValue(value, { min, max, decimals, unit })}`);
  const progress = max > min ? clamp((value - min) / (max - min), 0, 1) : 0;
  const setFromX = (e: PointerEventData) =>
    onChange(min + (max - min) * clamp(e.x, 0, 1));

  return (
    <node style={sliderTrack} onPointerDown={setFromX} onPointerMove={setFromX}>
      <ProgressBar progress={progress} label={text} />
    </node>
  );
}

const sliderTrack: BevyStyle = {
  width: "100%",
  height: 20,
  borderRadius: 6,
  backgroundColor: Colors.surface400,
  backgroundGradient: Gradients.track,
  cursor: "pointer",
  focusPolicy: "block",
};
