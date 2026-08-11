import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Button, DemoRow, Example, Slider } from "@/components";
import { Colors, Gradients } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

// Demos of the `<image>` host element, one Example per feature:
//   1. an asset loaded by `src`, with `tint`, `flipX`, and `flipY`;
//   2. 9-slice scaling — a single `modal.png` frame whose ornate corners stay
//      crisp while the edges stretch, resized live by width/height sliders;
//   3. `sourceRect` — crop a sub-rectangle of the texture (here one quadrant of
//      the 400×220 logo);
//   4. `atlas` — treat the logo as a 2×2 sprite-sheet grid and select a cell by
//      `index` (the sprite-animation primitive), cycled by a button;
//   5. an `.svg` src — extension-detected, parsed once into an SvgDocument
//      asset, and re-rasterized at the laid-out size (times DPI), so one file
//      stays crisp at every size (and the viewBox is the intrinsic size).

const PAGE: ExplanationData = {
  title: "<image>",
  description:
    'The <image> host element draws a texture asset loaded by src. tint multiplies the texture color; flipX/flipY mirror it per axis. imageMode { type: "sliced" } enables 9-slice scaling, so a frame resizes without distorting its corners. sourceRect crops a sub-rectangle of the texture, and atlas treats the texture as a uniform sprite-sheet grid whose cell is selected by index — the sprite-animation primitive (the atlas layout asset is built once and reused). An .svg src renders as a vector instead: the document parses once into an SvgDocument asset and re-rasterizes at the laid-out size (times DPI), pixel-crisp at every size, with the file\'s viewBox as the intrinsic size when no width/height is set.',
};

const FLIP_TSX = `<image
  src="bevy-react-logo.png"
  tint="#7aa2f7"
  flipX
  flipY
/>`;

const SLICE_TSX = `<image
  src="modal.png"
  imageMode={{
    type: "sliced",
    border: 120,
    maxCornerScale: 0.7,
  }}
  style={{ width, height }}
/>`;

const RECT_TSX = `<image
  src="bevy-react-logo.png"
  sourceRect={{
    x: 0,
    y: 0,
    width: 200,
    height: 110,
  }}
/>`;

const ATLAS_TSX = `<image
  src="bevy-react-logo.png"
  atlas={{
    tileWidth: 200,
    tileHeight: 110,
    columns: 2,
    rows: 2,
    index,
  }}
/>`;

const SVG_TSX = `<image
  src="gear.svg"
  style={{
    width: 160,
  }}
/>`;

export function ImageDemo() {
  useDemoPage(PAGE);
  return (
    <>
      <DemoRow>
        <FlipDemo />
        <SlicedDemo />
      </DemoRow>

      <DemoRow>
        <SourceRectDemo />
        <AtlasDemo />
      </DemoRow>

      <DemoRow>
        <SvgDemo />
      </DemoRow>
    </>
  );
}

function FlipDemo() {
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);

  return (
    <Example
      title="tint & flips"
      description="An image asset loaded by src, with an optional tint and per-axis flips."
      tsx={FLIP_TSX}
    >
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
    </Example>
  );
}

function SlicedDemo() {
  const [width, setWidth] = useState(280);
  const [height, setHeight] = useState(160);

  return (
    <Example
      title="9-slice"
      description="9-slice scaling resizes a frame without distorting its corners. Drag the sliders: the corners stay crisp while the edges stretch."
      tsx={SLICE_TSX}
    >
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
    </Example>
  );
}

function SourceRectDemo() {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  return (
    <Example
      title="sourceRect"
      description="sourceRect crops a sub-rectangle of the texture. Drag to pan the 200×110 window across the 400×220 logo — only that region is drawn."
      tsx={RECT_TSX}
    >
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
    </Example>
  );
}

function AtlasDemo() {
  const [index, setIndex] = useState(0);

  return (
    <Example
      title="atlas"
      description="atlas treats src as a uniform sprite-sheet grid; index selects a cell (here a 2×2 grid over the logo). Step the index to flip frames — the layout asset is built once and reused."
      tsx={ATLAS_TSX}
    >
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
    </Example>
  );
}

// --- SVG-file cards: an .svg src re-rasterized at laid-out size ------------

const SIZES = [64, 160];

function SvgDemo() {
  return (
    <Example
      title="Svg image"
      description="The same gear.svg laid out at three sizes. Each re-rasterizes at its own laid-out size, so all three are equally crisp — the large one is not a scaled-up small one."
      tsx={SVG_TSX}
    >
      <node style={svgRowStyle}>
        <node style={svgItemStyle}>
          <image src="gear.svg" />
          <text style={svgCaptionStyle}>Intrinsic size</text>
        </node>
        {SIZES.map((size) => (
          <node key={size} style={svgItemStyle}>
            <image src="gear.svg" style={{ width: size }} />
            <text style={svgCaptionStyle}>{size}px</text>
          </node>
        ))}
      </node>
    </Example>
  );
}

const svgRowStyle: BevyStyle = {
  flexDirection: "row",
  alignItems: "flexEnd",
  justifyContent: "center",
  gap: 24,
  padding: 12,
};

const svgItemStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
};

const svgCaptionStyle: BevyStyle = {
  fontSize: 12,
  color: Colors.textColor200,
};

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
