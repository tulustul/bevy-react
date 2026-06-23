import { BevyStyle, PointerEventData } from "bevy-react/jsx";
import { ProgressBar } from "./ProgressBar";

export type SliderProps = {
  /** Current value (controlled — the parent owns it). */
  value: number;
  /** Range minimum (default 0). */
  min?: number;
  /** Range maximum (default 1). */
  max?: number;
  /** Optional label centered over the bar. */
  label?: string;
  /** Called with the new value on click and during a drag. */
  onChange: (value: number) => void;
};

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
  label = "",
  onChange,
}: SliderProps) {
  const progress = max > min ? clamp((value - min) / (max - min), 0, 1) : 0;
  const setFromX = (e: PointerEventData) =>
    onChange(min + (max - min) * clamp(e.x, 0, 1));

  return (
    <node style={sliderTrack} onPointerDown={setFromX} onPointerMove={setFromX}>
      <ProgressBar progress={progress} label={label} />
    </node>
  );
}

const sliderTrack: BevyStyle = {
  width: 240,
  height: 20,
  borderRadius: 4,
  backgroundColor: "#888",
};
