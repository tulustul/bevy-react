import { BevyStyle } from "bevy-react/jsx";

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
      <node
        style={{
          ...box,
          ...(enabled ? boxChecked : {}),
        }}
      />
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
};

const wrapperHovered: BevyStyle = {
  backgroundColor: "#2a2a3c",
};

const box: BevyStyle = {
  width: 30,
  height: 30,
  borderRadius: 7,
  borderColor: "#505072",
  border: 2,
};

const boxChecked: BevyStyle = {
  backgroundColor: "#c7c7e6ff",
  border: 0,
};

const checkboxLabel: BevyStyle = {
  color: "#cdd6f4",
  fontSize: 15,
};
