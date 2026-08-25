import { BevyStyle } from "bevy-react/jsx";
import { Colors, FontSizes, Gradients } from "@/theme";
import { Button } from "./Button";

export type CheckboxProps = {
  label: string;
  enabled?: boolean;
  onChange: (enabled: boolean) => void;
};

export function Checkbox({ label, enabled, onChange }: CheckboxProps) {
  function _onChange() {
    onChange(!enabled);
  }

  return (
    <Button
      pinch={{
        light: 0.1,
        gloss: 0.05,
      }}
      style={wrapper}
      hoverStyle={wrapperHovered}
      onClick={_onChange}
    >
      <node style={box}>
        <node
          style={{
            backgroundColor: Colors.textColor100,
            backgroundGradient: Gradients.primary,
            width: 21,
            height: 21,
            borderRadius: 5,
            transform: { scale: enabled ? 1 : 0 },
            transition: {
              transform: { duration: 150 },
            },
          }}
        />
      </node>
      <text style={checkboxLabel}>{label}</text>
    </Button>
  );
}

const wrapper: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  padding: { top: 8, right: 12, bottom: 8, left: 12 },
  borderRadius: 8,
  backgroundGradient: Gradients.transparent,
  cursor: "pointer",
};

const wrapperHovered: BevyStyle = {
  backgroundGradient: Gradients.surface,
};

const box: BevyStyle = {
  width: 30,
  height: 30,
  borderRadius: 7,
  borderColor: Colors.surface600,
  borderGradient: Gradients.accentBorder,
  border: 2,
  alignItems: "center",
  justifyContent: "center",
};

const checkboxLabel: BevyStyle = {
  color: Colors.textColor100,
  fontSize: FontSizes.sm,
};
