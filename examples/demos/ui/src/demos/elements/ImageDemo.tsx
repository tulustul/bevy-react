import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Button, Example, Slider } from "@/components";
import { Colors, Gradients } from "@/theme";

// Demos of the `<image>` host element, one Example per feature:
//   1. an asset loaded by `src`, with `tint`, `flipX`, and `flipY`;
//   2. 9-slice scaling — a single `modal.png` frame whose ornate corners stay
//      crisp while the edges stretch, resized live by width/height sliders;
//   3. `sourceRect` — crop a sub-rectangle of the texture (here one quadrant of
//      the 400×220 logo);
//   4. `atlas` — treat the logo as a 2×2 sprite-sheet grid and select a cell by
//      `index` (the sprite-animation primitive), cycled by a button.

const FLIP_TSX = `<image src="bevy-react-logo.png" tint="#7aa2f7" flipX flipY />`;

const SLICE_TSX = `<image
  src="modal.png"
  imageMode={{ type: "sliced", border: 60 }}
  style={{ width, height }}
/>`;

const RECT_TSX = `<image
  src="bevy-react-logo.png"
  sourceRect={{ x: 0, y: 0, width: 200, height: 110 }}
/>`;

const ATLAS_TSX = `<image
  src="bevy-react-logo.png"
  atlas={{ tileWidth: 200, tileHeight: 110, columns: 2, rows: 2, index }}
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

      <Example
        description="sourceRect crops a sub-rectangle of the texture. Drag to pan the 200×110 window across the 400×220 logo — only that region is drawn."
        tsx={RECT_TSX}
      >
        <SourceRectControl />
      </Example>

      <Example
        description="atlas treats src as a uniform sprite-sheet grid; index selects a cell (here a 2×2 grid over the logo). Step the index to flip frames — the layout asset is built once and reused."
        tsx={ATLAS_TSX}
      >
        <AtlasControl />
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

function SourceRectControl() {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  return (
    <node style={{ flexDirection: "column", alignItems: "center", gap: 12 }}>
      <node style={cellBox}>
        <image
          src="bevy-react-logo.png"
          style={{ width: 200, height: 110 }}
          sourceRect={{ x, y, width: 200, height: 110 }}
        />
      </node>

      <Slider
        value={x}
        min={0}
        max={200}
        onChange={(v) => setX(Math.round(v))}
        label={`x ${Math.round(x)}`}
      />
      <Slider
        value={y}
        min={0}
        max={110}
        onChange={(v) => setY(Math.round(v))}
        label={`y ${Math.round(y)}`}
      />
    </node>
  );
}

function AtlasControl() {
  const [index, setIndex] = useState(0);

  return (
    <node style={{ flexDirection: "column", alignItems: "center", gap: 12 }}>
      <node style={cellBox}>
        <image
          src="bevy-react-logo.png"
          style={{ width: 200, height: 110 }}
          atlas={{
            tileWidth: 200,
            tileHeight: 110,
            columns: 2,
            rows: 2,
            index,
          }}
        />
      </node>

      <Button onClick={() => setIndex((i) => (i + 1) % 4)}>
        cell {index} of 4 — next
      </Button>
    </node>
  );
}

const logoStyle: BevyStyle = {
  width: 120,
  height: 120,
};

// A fixed 200×110 viewport so the cropped/atlas cell sits in a stable box.
const cellBox: BevyStyle = {
  width: 200,
  height: 110,
  alignItems: "center",
  justifyContent: "center",
  backgroundGradient: Gradients.spectrum,
  borderRadius: 12,
};

// A fixed box so the frame's box can grow/shrink within it without shifting the
// surrounding layout (sliders stay put).
const frameBox: BevyStyle = {
  alignItems: "center",
  justifyContent: "center",
  backgroundGradient: Gradients.spectrum,
  borderRadius: 100,
};
