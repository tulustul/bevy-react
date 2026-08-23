import { BevyStyle } from "bevy-react/jsx";
import { Colors, FontSizes, Gradients } from "@/theme";
import { Button } from "./Button";

export type RadioValue = string | number;

export type RadioOption<T extends RadioValue = RadioValue> = {
  label: string;
  value: T;
};

export type RadioProps<T extends RadioValue = RadioValue> = {
  value: T;
  options: RadioOption<T>[];
  /** Pinch-on-press intensity, forwarded to `Pinchable` (0 disables). */
  pinch?: number;
  onChange: (value: T) => void;
};

// A segmented pill control: each option is a pill, the selected one filled with
// the accent. Selection eases the fill via the `transition` style (like Button).
export function Radio<T extends RadioValue>({
  options,
  value,
  pinch = 1,
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
  pinch: number;
  onClick: () => void;
};

// The pinch replaces the old pressStyle scale squish (like Button).
function Option({ option, selected, pinch, onClick }: OptionProps) {
  return (
    <Button
      unstyled
      pinch={pinch}
      onClick={onClick}
      style={{
        ...pillStyle,
        backgroundColor: selected ? ACCENT : SURFACE,
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
      {option.label}
    </Button>
  );
}

const ACCENT = Colors.primary100;
const SURFACE = Colors.surface300;

const groupStyle: BevyStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 6,
};

const pillStyle: BevyStyle = {
  justifyContent: "center",
  alignItems: "center",
  padding: { top: 6, right: 14, bottom: 6, left: 14 },
  borderRadius: 8,
  transform: { scale: 1 },
  transition: {
    backgroundColor: { duration: 150 },
    transform: { duration: 120, easing: "easeOut" },
  },
  cursor: "pointer",
};

const pillLabel: BevyStyle = {
  fontSize: FontSizes.sm,
};
