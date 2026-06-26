import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Button, Example, Slider } from "@/components";
import { Colors, Gradients } from "@/theme";

// Demos of the `<image>` host element, one Example per feature:
//   1. an asset loaded by `src`, with `tint`, `flipX`, and `flipY`;
//   2. 9-slice scaling — a single `modal.png` frame whose ornate corners stay
//      crisp while the edges stretch, resized live by width/height sliders.

const FLIP_TSX = `<image src="bevy-react-logo.png" tint="#7aa2f7" flipX flipY />`;

const SLICE_TSX = `<image
  src="modal.png"
  imageMode={{ type: "sliced", border: 60 }}
  style={{ width, height }}
/>`;

export function ImageDemo() {
  return (
    <>
      <Example
        description="An image asset loaded by src, with an optional tint and per-axis flips."
        tsx={FLIP_TSX}
      >
        <FlipControl />
      </Example>

      <Example
        description="9-slice scaling resizes a frame without distorting its corners. Drag the sliders: the corners stay crisp while the edges stretch."
        tsx={SLICE_TSX}
      >
        <SliceControl />
      </Example>
    </>
  );
}

function FlipControl() {
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);

  return (
    <>
      <node style={{ flexDirection: "row", gap: 24, alignItems: "center" }}>
        <image
          src="bevy-react-logo.png"
          style={logoStyle}
          flipX={flipX}
          flipY={flipY}
        />
        <image
          src="bevy-react-logo.png"
          style={logoStyle}
          tint={Colors.primary100}
          flipX={flipX}
          flipY={flipY}
        />
      </node>

      <node style={{ flexDirection: "row", gap: 12 }}>
        <Button onClick={() => setFlipX((f) => !f)}>
          flipX: {flipX ? "on" : "off"}
        </Button>
        <Button onClick={() => setFlipY((f) => !f)}>
          flipY: {flipY ? "on" : "off"}
        </Button>
      </node>
    </>
  );
}

function SliceControl() {
  const [width, setWidth] = useState(280);
  const [height, setHeight] = useState(160);

  return (
    <node style={{ flexDirection: "column", alignItems: "center", gap: 12 }}>
      <node style={frameBox}>
        <image
          src="modal.png"
          style={{ width, height }}
          imageMode={{ type: "sliced", border: 120, maxCornerScale: 0.7 }}
        />
      </node>

      <Slider
        value={width}
        min={80}
        max={360}
        onChange={(v) => setWidth(Math.round(v))}
        label={`width ${Math.round(width)}`}
      />
      <Slider
        value={height}
        min={80}
        max={240}
        onChange={(v) => setHeight(Math.round(v))}
        label={`height ${Math.round(height)}`}
      />
    </node>
  );
}

const logoStyle: BevyStyle = {
  width: 120,
  height: 120,
};

// A fixed box so the frame's box can grow/shrink within it without shifting the
// surrounding layout (sliders stay put).
const frameBox: BevyStyle = {
  alignItems: "center",
  justifyContent: "center",
  backgroundGradient: Gradients.spectrum,
  borderRadius: 100,
};
