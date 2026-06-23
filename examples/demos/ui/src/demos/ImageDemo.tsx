import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { headingStyle, labelStyle } from "./styles";
import { Card } from "../components";

// A pure-UI demo of the `<image>` host element: an asset loaded by `src`, plus
// `tint`, `flipX`, and `flipY`. The same `bevy-logo.png` is shown untinted and
// tinted, and the toggles flip it on either axis. No 3D scene: viewport empty.

export function ImageDemo() {
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);

  return (
    <Card>
      <text style={headingStyle}>Image</text>
      <text style={labelStyle}>{"<image src tint flipX flipY />"}</text>

      <node style={{ flexDirection: "row", gap: 24, alignItems: "center" }}>
        <node style={{ flexDirection: "column", alignItems: "center", gap: 6 }}>
          <image
            src="bevy-logo.png"
            style={logoStyle}
            flipX={flipX}
            flipY={flipY}
          />
          <text style={captionStyle}>src</text>
        </node>

        <node style={{ flexDirection: "column", alignItems: "center", gap: 6 }}>
          <image
            src="bevy-logo.png"
            style={logoStyle}
            tint="#7aa2f7"
            flipX={flipX}
            flipY={flipY}
          />
          <text style={captionStyle}>tint #7aa2f7</text>
        </node>
      </node>

      <node style={{ flexDirection: "row", gap: 12 }}>
        <button
          onClick={() => setFlipX((f) => !f)}
          style={toggleStyle}
          hoverStyle={toggleHoverStyle}
        >
          <text style={toggleLabelStyle}>flipX: {flipX ? "on" : "off"}</text>
        </button>
        <button
          onClick={() => setFlipY((f) => !f)}
          style={toggleStyle}
          hoverStyle={toggleHoverStyle}
        >
          <text style={toggleLabelStyle}>flipY: {flipY ? "on" : "off"}</text>
        </button>
      </node>
    </Card>
  );
}

const logoStyle: BevyStyle = {
  width: 120,
  height: 120,
};

const captionStyle: BevyStyle = {
  color: "#a6adc8",
  fontSize: 13,
};

const toggleStyle: BevyStyle = {
  padding: { top: 8, right: 12, bottom: 8, left: 12 },
  borderRadius: 8,
  backgroundColor: "#2a2a3c",
};

const toggleHoverStyle: BevyStyle = {
  backgroundColor: "#42425e",
};

const toggleLabelStyle: BevyStyle = {
  color: "#cdd6f4",
  fontSize: 14,
  fontWeight: "bold",
};
