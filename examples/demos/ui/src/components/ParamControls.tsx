import { useCallback, useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Checkbox } from "./Checkbox";
import { Slider } from "./Slider";

/**
 * A declarative parameter panel. Demos that expose a filter's (or a
 * transform's) knobs describe them once as a spec record and get the state,
 * the controls and the labels from it — instead of one `useState` plus one
 * hand-labelled `<Slider>` per knob.
 *
 * The spec keys are the parameter names, so the values object drops straight
 * into a filter:
 *
 * ```tsx
 * const PINCH = { x: slider(0, 1, 0.5), strength: slider(-1, 1, 0.8) };
 *
 * const [params, controls] = useParams(PINCH);
 * <node style={{ filter: { name: "pinch", params } }} />
 * <ParamControls {...controls} />
 * ```
 */
export type SliderSpec = {
  kind: "slider";
  min: number;
  max: number;
  initial: number;
  /** Digits after the point in the label — see `Slider` for the default. */
  decimals?: number;
  /** Appended to the label with no space — `"px"`, `"°"`, `"ms"`. */
  unit?: string;
};

export type CheckboxSpec = {
  kind: "checkbox";
  initial: boolean;
  label?: string;
};

export type ParamSpec = SliderSpec | CheckboxSpec;
export type ParamSpecs = Record<string, ParamSpec>;

export type ParamValues<T extends ParamSpecs> = {
  [K in keyof T]: T[K] extends CheckboxSpec ? boolean : number;
};

export const slider = (
  min: number,
  max: number,
  initial: number,
  opts: Omit<SliderSpec, "kind" | "min" | "max" | "initial"> = {},
): SliderSpec => ({ kind: "slider", min, max, initial, ...opts });

export const checkbox = (
  initial = false,
  opts: Omit<CheckboxSpec, "kind" | "initial"> = {},
): CheckboxSpec => ({ kind: "checkbox", initial, ...opts });

export type ParamControlsProps<T extends ParamSpecs> = {
  specs: T;
  values: ParamValues<T>;
  onChange: <K extends keyof T>(key: K, value: ParamValues<T>[K]) => void;
};

/** Owns the values behind a spec record. Returns them plus the binding to
 *  spread onto `<ParamControls>`. */
export function useParams<T extends ParamSpecs>(
  specs: T,
): [ParamValues<T>, ParamControlsProps<T>] {
  const [values, setValues] = useState<ParamValues<T>>(() => {
    const out = {} as ParamValues<T>;
    for (const key in specs) {
      out[key] = specs[key].initial as ParamValues<T>[typeof key];
    }
    return out;
  });
  const onChange = useCallback(
    <K extends keyof T>(key: K, value: ParamValues<T>[K]) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    [],
  );
  return [values, { specs, values, onChange }];
}

export function ParamControls<T extends ParamSpecs>({
  specs,
  values,
  onChange,
}: ParamControlsProps<T>) {
  const keys = Object.keys(specs);
  const sliders = keys.filter((key) => specs[key].kind === "slider");
  const checkboxes = keys.filter((key) => specs[key].kind === "checkbox");
  return (
    <>
      {sliders.map((key) => {
        const spec = specs[key] as SliderSpec;
        return (
          <Slider
            key={key}
            value={values[key] as number}
            min={spec.min}
            max={spec.max}
            name={key}
            decimals={spec.decimals}
            unit={spec.unit}
            onChange={(v) => onChange(key, v as ParamValues<T>[typeof key])}
          />
        );
      })}
      {/* One left-aligned list, so the boxes line up instead of each
          centring on its own label. */}
      {checkboxes.length > 0 && (
        <node style={checkboxListStyle}>
          {checkboxes.map((key) => {
            const spec = specs[key] as CheckboxSpec;
            return (
              <Checkbox
                key={key}
                label={spec.label ?? key}
                enabled={values[key] as boolean}
                onChange={(on) =>
                  onChange(key, on as ParamValues<T>[typeof key])
                }
              />
            );
          })}
        </node>
      )}
    </>
  );
}

const checkboxListStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "flexStart",
  alignSelf: "stretch",
  gap: 2,
};
