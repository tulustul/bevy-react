import { BevyStyle } from "bevy-react/jsx";
import { Colors, FontSizes, Gradients } from "@/theme";
import { Button } from "./Button";
import { CheckIcon } from "./Icons";

export type CheckboxProps = {
  label: string;
  enabled?: boolean;
  onChange: (enabled: boolean) => void;
};

/** A labelled checkbox: a rounded box that fills with the cyan light and
 *  pops its tick in when checked. The whole row is the hit target. */
export function Checkbox({ label, enabled, onChange }: CheckboxProps) {
  return (
    <Button
      pinch={{ light: 0.1, gloss: 0.05 }}
      shadow={null}
      style={wrapper}
      hoverStyle={wrapperHovered}
      onClick={() => onChange(!enabled)}
    >
      <node style={{ ...box, ...(enabled ? boxOn : null) }}>
        <node
          style={{
            transform: { scale: enabled ? 1 : 0 },
            transition: { transform: { stiffness: 500, damping: 22 } },
          }}
        >
          <CheckIcon size={14} />
        </node>
      </node>
      <text
        style={{
          ...checkboxLabel,
          color: enabled ? Colors.text : Colors.textBody,
        }}
      >
        {label}
      </text>
    </Button>
  );
}

const wrapper: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
  minWidth: 0,
  padding: { horizontal: 10, vertical: 6 },
  borderRadius: 8,
  border: 0,
  backgroundGradient: Gradients.transparent,
  cursor: "pointer",
};

const wrapperHovered: BevyStyle = {
  backgroundGradient: Gradients.transparent,
  backgroundColor: Colors.hover,
};

const box: BevyStyle = {
  width: 20,
  height: 20,
  borderRadius: 6,
  border: 1.5,
  borderColor: Colors.controlStrong,
  backgroundColor: Colors.transparent,
  alignItems: "center",
  justifyContent: "center",
  transition: { backgroundColor: { duration: 150 } },
};

const boxOn: BevyStyle = {
  borderColor: Colors.brass,
  backgroundColor: Colors.brass,
  boxShadow: { blurRadius: 4, color: Colors.emberGlow },
};

const checkboxLabel: BevyStyle = {
  fontSize: FontSizes.sm,
};
