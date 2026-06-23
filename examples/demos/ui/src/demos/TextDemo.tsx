import { codeStyle, labelStyle } from "./styles";
import { Example } from "../components";

const TYPESCRIPT = `<text style={{ fontSize: 28, fontWeight: "bold" }}>Big & bold</text>
<text style={{ fontSize: 18, fontWeight: "normal" }}>Medium & muted</text>
<text style={{ fontSize: 13, fontWeight: "light" }}>Small & light</text>

<text style={{ fontFamily: "DancingScript", fontSize: 34 }}>
  Styled with a custom font family
</text>

<text style={{ fontSize: 18, color: "#cdd6f4" }}>
  Nested spans color{" "}
  <text style={{ color: "#7aa2f7", fontWeight: "bold" }}>part</text> of a{" "}
  <text style={{ color: "#f7768e", fontWeight: "bold" }}>sentence</text>.
</text>`;

export function TextDemo() {
  return (
    <Example typescript={TYPESCRIPT}>
      <text style={{ fontSize: 28, fontWeight: "bold" }}>Big & bold</text>
      <text style={{ fontSize: 18, fontWeight: "normal" }}>Medium & muted</text>
      <text style={{ fontSize: 13, fontWeight: "light" }}>Small & light</text>

      <text
        style={{ fontFamily: "DancingScript", fontSize: 34, color: "#f9e2af" }}
      >
        Styled with a custom font family
      </text>

      <text style={{ fontSize: 18, color: "#cdd6f4" }}>
        Nested spans color{" "}
        <text style={{ color: "#7aa2f7", fontWeight: "bold" }}>part</text> of a{" "}
        <text style={{ color: "#f7768e", fontWeight: "bold" }}>sentence</text>.
      </text>
    </Example>
  );
}
