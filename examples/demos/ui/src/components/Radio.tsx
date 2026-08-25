import { BevyStyle } from "bevy-react/jsx";
import type { ReactNode } from "react";
import type { PinchParams } from "@/bevy";
import { Colors, FontSizes, Gradients } from "@/theme";
import { Button } from "./Button";

export type RadioValue = string | number;

export type RadioOptionState = { selected: boolean };

/** A pill's label: a string gets the text treatment; any other node (an SVG
 *  icon, …) renders as-is inside a compact square pill. The function form
 *  receives the pill's selection state so a JSX label can tint itself — SVG
 *  fills don't inherit color, so the icon has to be told. */
export type RadioLabel = ReactNode | ((state: RadioOptionState) => ReactNode);

export type RadioOption<T extends RadioValue = RadioValue> = {
  label: RadioLabel;
  value: T;
};

export type RadioProps<T extends RadioValue = RadioValue> = {
  value: T;
  options: RadioOption<T>[];
  /** Pinch-on-press overrides, forwarded to `Button` (`{ strength: 0 }`
   *  disables). */
  pinch?: Partial<PinchParams>;
  onChange: (value: T) => void;
};

// A segmented pill control: each option is a pill, the selected one filled with
// the accent. Selection eases the fill via the `transition` style (like Button).
export function Radio<T extends RadioValue>({
  options,
  value,
  pinch,
  onChange,
}: RadioProps<T>) {
  return (
    <node style={groupStyle}>
      {options.map((option) => (
        <Option
          key={String(option.value)}
          option={option}
          selected={option.value === value}
          pinch={pinch}
          onClick={() => {
            if (option.value !== value) onChange(option.value);
          }}
        />
      ))}
    </node>
  );
}

type OptionProps = {
  option: RadioOption;
  selected: boolean;
  pinch?: Partial<PinchParams>;
  onClick: () => void;
};

// The pinch replaces the old pressStyle scale squish (like Button).
function Option({ option, selected, pinch, onClick }: OptionProps) {
  const label =
    typeof option.label === "function"
      ? option.label({ selected })
      : option.label;
  // Button gives string/number children the text label; anything else (an
  // icon) is rendered as-is, so the pill drops the text padding and goes square.
  const isText = typeof label === "string" || typeof label === "number";
  return (
    <Button
      pinch={pinch}
      onClick={onClick}
      style={{
        ...(isText ? pillStyle : iconPillStyle),
        backgroundGradient: selected ? Gradients.primary : Gradients.surface,
      }}
      hoverStyle={{
        backgroundGradient: selected
          ? Gradients.primaryHover
          : Gradients.surfaceHover,
      }}
      labelStyle={{
        ...pillLabel,
        color: selected ? Colors.textColor400 : Colors.textColor100,
        fontWeight: selected ? "bold" : "medium",
      }}
    >
      {label}
    </Button>
  );
}

const groupStyle: BevyStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 6,
};

const pillStyle: BevyStyle = {
  minWidth: 50,
  justifyContent: "center",
  alignItems: "center",
  padding: { top: 6, right: 14, bottom: 6, left: 14 },
  borderRadius: 8,
  cursor: "pointer",
};

// `minWidth: 0` overrides Button's base min width so the pill hugs the glyph.
const iconPillStyle: BevyStyle = {
  minWidth: 0,
  justifyContent: "center",
  alignItems: "center",
  padding: 6,
  borderRadius: 8,
  cursor: "pointer",
};

const pillLabel: BevyStyle = {
  fontSize: FontSizes.sm,
};
