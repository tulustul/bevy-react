import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { headingStyle, labelStyle } from "./styles";
import { Card } from "../components";

export function EditableTextDemo() {
  const [text, setText] = useState("");

  return (
    <Card>
      <text style={headingStyle}>Editable text</text>
      <text style={labelStyle}>{"<editableText value onChange />"}</text>

      <editableText
        value={text}
        onChange={setText}
        maxLength={40}
        style={inputStyle}
      />

      {text && <text style={{ fontSize: 18 }}>Hello {text}</text>}
    </Card>
  );
}

const inputStyle: BevyStyle = {
  width: 280,
  height: 40,
  justifyContent: "center",
  padding: { top: 8, right: 12, bottom: 8, left: 12 },
  backgroundColor: "#11111b",
  borderRadius: 8,
  border: 1,
  borderColor: "#7aa2f7",
  color: "#cdd6f4",
  fontSize: 16,
};
