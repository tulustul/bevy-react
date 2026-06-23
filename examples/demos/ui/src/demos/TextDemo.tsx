import { headingStyle, labelStyle } from "./styles";
import { Card } from "../components";

// A pure-UI demo of the `<text>` host element: `color`, `fontSize`, and
// `fontWeight` styling, plus nested `<text>` spans that restyle a slice of a
// sentence inline. No 3D scene: the viewport stays empty.

export function TextDemo() {
  return (
    <Card>
      <text style={headingStyle}>Text</text>
      <text style={labelStyle}>
        {"<text style={{ color, fontSize, fontWeight }} />"}
      </text>

      <node style={{ flexDirection: "column", gap: 8, alignItems: "center" }}>
        <text style={{ fontSize: 28, fontWeight: "bold", color: "#cdd6f4" }}>
          Big &amp; bold
        </text>
        <text style={{ fontSize: 18, fontWeight: "normal", color: "#a6adc8" }}>
          Medium &amp; muted
        </text>
        <text style={{ fontSize: 13, fontWeight: "light", color: "#6c7086" }}>
          Small &amp; light
        </text>
      </node>

      <text style={{ fontSize: 18, color: "#cdd6f4" }}>
        Nested spans color{" "}
        <text style={{ color: "#7aa2f7", fontWeight: "bold" }}>part</text> of a{" "}
        <text style={{ color: "#f7768e", fontWeight: "bold" }}>sentence</text>.
      </text>
    </Card>
  );
}
