import { BevyStyle } from "bevy-react/jsx";
import { Colors, FontSizes } from "@/theme";

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
    <button style={wrapper} hoverStyle={wrapperHovered} onClick={_onChange}>
      <node style={box}>
        <node
          style={{
            backgroundColor: Colors.textColor100,
            width: 22,
            height: 22,
            borderRadius: 5,
            transform: { scale: enabled ? 1 : 0 },
            transition: {
              transform: { duration: 150 },
            },
          }}
        />
      </node>
      <text style={checkboxLabel}>{label}</text>
    </button>
  );
}

const wrapper: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  padding: { top: 8, right: 12, bottom: 8, left: 12 },
  borderRadius: 8,
  backgroundColor: Colors.transparent,
  transition: {
    backgroundColor: { duration: 150 },
  },
};

const wrapperHovered: BevyStyle = {
  backgroundColor: Colors.surface300,
};

const box: BevyStyle = {
  width: 30,
  height: 30,
  borderRadius: 7,
  borderColor: Colors.surface600,
  border: 2,
  alignItems: "center",
  justifyContent: "center",
};

const checkboxLabel: BevyStyle = {
  color: Colors.textColor100,
  fontSize: FontSizes.sm,
};
