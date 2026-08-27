import { useCallback, useState } from "react";
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
  /** Overrides the key as the label's name. */
  label?: string;
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
  return (
    <>
      {Object.keys(specs).map((key) => {
        const spec = specs[key];
        const name = spec.label ?? key;
        if (spec.kind === "checkbox") {
          return (
            <Checkbox
              key={key}
              label={name}
              enabled={values[key] as boolean}
              onChange={(on) => onChange(key, on as ParamValues<T>[typeof key])}
            />
          );
        }
        return (
          <Slider
            key={key}
            value={values[key] as number}
            min={spec.min}
            max={spec.max}
            name={name}
            decimals={spec.decimals}
            unit={spec.unit}
            onChange={(v) => onChange(key, v as ParamValues<T>[typeof key])}
          />
        );
      })}
    </>
  );
}
