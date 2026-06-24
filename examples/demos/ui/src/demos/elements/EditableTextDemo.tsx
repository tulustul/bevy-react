import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Example } from "../../components";
import { Colors, FontSizes } from "../../theme";

const TYPESCRIPT = `<editableText
  value={text}
  onChange={setText}
  maxLength={40}
/>`;

export function EditableTextDemo() {
  const [text, setText] = useState("");

  return (
    <Example
      description="A focusable text input: a controlled value with onChange."
      typescript={TYPESCRIPT}
    >
      <text>What's your name?</text>
      <editableText
        value={text}
        onChange={setText}
        maxLength={40}
        style={inputStyle}
      />

      <text style={{ fontSize: FontSizes.xxl, opacity: text ? 1 : 0 }}>
        Hello {text}
      </text>
    </Example>
  );
}

const inputStyle: BevyStyle = {
  width: 280,
  height: 40,
  justifyContent: "center",
  padding: { top: 8, right: 12, bottom: 8, left: 12 },
  backgroundColor: Colors.surface100,
  borderRadius: 8,
  border: 1,
  borderColor: Colors.primary100,
  color: Colors.textColor100,
  fontSize: FontSizes.base,
};
