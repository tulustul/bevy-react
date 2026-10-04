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
  /** Let the pills wrap onto more lines in a narrow container. Off by
   *  default: taffy breaks flex lines with a strict float compare, so at a
   *  fractional scale factor a group sized to its own content can spuriously
   *  wrap its last pill. Opt in only where the row really can outgrow the card. */
  wrap?: boolean;
  onChange: (value: T) => void;
};

// A segmented control: the options sit in one recessed well, and the selected
// one takes the gallery's "active" look — a cyan wash with cyan text (the nav
// row's pill). Selection eases the wash via the `transition` style.
export function Radio<T extends RadioValue>({
  options,
  value,
  pinch,
  wrap = false,
  onChange,
}: RadioProps<T>) {
  return (
    <node style={{ ...groupStyle, flexWrap: wrap ? "wrap" : "noWrap" }}>
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
      shadow={null}
      onClick={onClick}
      style={{
        ...(isText ? pillStyle : iconPillStyle),
        backgroundColor: selected ? Colors.cyanWash : Colors.transparent,
      }}
      hoverStyle={{
        backgroundGradient: Gradients.transparent,
        backgroundColor: selected ? Colors.cyanWash : Colors.controlHover,
      }}
      labelStyle={{
        ...pillLabel,
        color: selected ? Colors.cyanBright : Colors.textBody,
      }}
    >
      {label}
    </Button>
  );
}

const groupStyle: BevyStyle = {
  // Never wider than the container: the `wrap` prop only engages against a
  // constraint, and a max-content group would overflow a narrow card.
  maxWidth: "100%",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 2,
  padding: 3,
  borderRadius: 10,
  border: 1,
  borderColor: Colors.line,
  backgroundColor: Colors.well,
};

// `minWidth: 0` overrides Button's base min width; `border: 0` its rim.
const pillStyle: BevyStyle = {
  minWidth: 0,
  justifyContent: "center",
  alignItems: "center",
  padding: { horizontal: 12, vertical: 5 },
  borderRadius: 7,
  border: 0,
  backgroundGradient: Gradients.transparent,
  cursor: "pointer",
  transition: { backgroundColor: { duration: 150 } },
};

const iconPillStyle: BevyStyle = {
  ...pillStyle,
  padding: 5,
};

const pillLabel: BevyStyle = {
  fontSize: FontSizes.xs + 1,
  fontWeight: "medium",
};
