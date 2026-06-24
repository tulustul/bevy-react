import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Button, Example } from "@/components";
import { Colors } from "@/theme";

// A pure-UI demo of the `<image>` host element: an asset loaded by `src`, plus
// `tint`, `flipX`, and `flipY`. The same `bevy-logo.png` is shown untinted and
// tinted, and the toggles flip it on either axis. No 3D scene: viewport empty.

const TYPESCRIPT = `<image src="bevy-logo.png" tint="#7aa2f7" flipX flipY />`;

export function ImageDemo() {
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);

  return (
    <Example
      description="An image asset loaded by src, with an optional tint and per-axis flips."
      typescript={TYPESCRIPT}
    >
      <node style={{ flexDirection: "row", gap: 24, alignItems: "center" }}>
        <node style={{ flexDirection: "column", alignItems: "center", gap: 6 }}>
          <image
            src="bevy-logo.png"
            style={logoStyle}
            flipX={flipX}
            flipY={flipY}
          />
        </node>

        <node style={{ flexDirection: "column", alignItems: "center", gap: 6 }}>
          <image
            src="bevy-logo.png"
            style={logoStyle}
            tint={Colors.primary100}
            flipX={flipX}
            flipY={flipY}
          />
        </node>
      </node>

      <node style={{ flexDirection: "row", gap: 12 }}>
        <Button onClick={() => setFlipX((f) => !f)}>
          flipX: {flipX ? "on" : "off"}
        </Button>
        <Button onClick={() => setFlipY((f) => !f)}>
          flipY: {flipY ? "on" : "off"}
        </Button>
      </node>
    </Example>
  );
}

const logoStyle: BevyStyle = {
  width: 120,
  height: 120,
};
