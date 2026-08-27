import { useState } from "react";
import { InlineCode, ListItem, Paragraph, List } from "@/components/typography";
import { BevyStyle } from "bevy-react/jsx";
import { Button, DemoRow, Example, Figure, Slider } from "@/components";
import { Code } from "@/components/docs";
import { Colors, Gradients } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

const PAGE: ExplanationData = {
  title: "<image>",
  info: (
    <>
      <Paragraph>
        <InlineCode>{"<image>"}</InlineCode> draws a texture asset loaded by{" "}
        <InlineCode>src</InlineCode> (a path under your asset folder). With no
        explicit size it lays out at the texture's intrinsic size.
      </Paragraph>
      <Code lang="tsx">{`<image src="bevy-react-logo.png" style={{ width: 120 }} />`}</Code>
      <List>
        <ListItem>
          tint multiplies the texture color; flipX / flipY mirror it.
        </ListItem>
        <ListItem>
          imageMode {'{ type: "sliced" }'} enables 9-slice scaling — frames
          resize without distorting their corners.
        </ListItem>
        <ListItem>
          sourceRect crops a sub-rectangle; atlas treats the texture as a
          sprite-sheet grid selected by index — the sprite-animation primitive.
        </ListItem>
        <ListItem>
          An .svg src renders as a vector: parsed once, re-rasterized at the
          laid-out size × DPI, crisp at every size.
        </ListItem>
      </List>
    </>
  ),
};

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
  return (
    <Example
      title="Tint and flips"
      info={
        <>
          <Paragraph>
            <InlineCode>tint</InlineCode> multiplies the texture's color (white
            = unchanged), and <InlineCode>flipX</InlineCode> /{" "}
            <InlineCode>flipY</InlineCode> mirror it per axis — all plain props,
            cheap to toggle from state.
          </Paragraph>
          <Code lang="tsx">{`<image
  src="bevy-react-logo.png"
  tint="#7aa2f7"
  flipX
  flipY
/>`}</Code>
        </>
      }
      demo={FlipCard}
    />
  );
}

function FlipCard() {
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
          {`flipX: ${flipX ? "on" : "off"}`}
        </Button>
        <Button onClick={() => setFlipY((f) => !f)}>
          {`flipY: ${flipY ? "on" : "off"}`}
        </Button>
      </node>
    </>
  );
}

function SlicedDemo() {
  return (
    <Example
      title="9-slice scaling"
      info={
        <>
          <Paragraph>
            9-slice scaling resizes a frame without distorting its corners:{" "}
            <InlineCode>border</InlineCode> marks the corner region in texture
            pixels, and only the edges and center stretch. Drag the sliders —
            the ornate corners stay crisp at any size.
          </Paragraph>
          <Code lang="tsx">{`<image
  src="modal.png"
  imageMode={{ type: "sliced", border: 120, maxCornerScale: 0.7 }}
  style={{ width, height }}
/>`}</Code>
        </>
      }
      demo={SlicedCard}
    />
  );
}

function SlicedCard() {
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
        name="width"
      />
      <Slider
        value={height}
        min={80}
        max={240}
        onChange={(v) => setHeight(Math.round(v))}
        name="height"
      />
    </node>
  );
}

function SourceRectDemo() {
  return (
    <Example
      title="Source rectangles"
      info={
        <>
          <Paragraph>
            <InlineCode>sourceRect</InlineCode> crops a sub-rectangle of the
            texture — only that region is drawn. Drag to pan a 200×110 window
            across the 400×220 logo.
          </Paragraph>
          <Code lang="tsx">{`<image
  src="bevy-react-logo.png"
  sourceRect={{ x: 0, y: 0, width: 200, height: 110 }}
/>`}</Code>
        </>
      }
      demo={SourceRectCard}
    />
  );
}

function SourceRectCard() {
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
        name="x"
      />
      <Slider
        value={y}
        min={0}
        max={110}
        onChange={(v) => setY(Math.round(v))}
        name="y"
      />
    </node>
  );
}

function AtlasDemo() {
  return (
    <Example
      title="Texture atlases"
      info={
        <>
          <Paragraph>
            <InlineCode>atlas</InlineCode> treats <InlineCode>src</InlineCode>{" "}
            as a uniform sprite-sheet grid; <InlineCode>index</InlineCode>{" "}
            selects a cell (here a 2×2 grid over the logo). Step the index from
            state — or a timer — to flip frames; the atlas layout asset is built
            once and reused.
          </Paragraph>
          <Code lang="tsx">{`<image
  src="bevy-react-logo.png"
  atlas={{
    tileWidth: 200,
    tileHeight: 110,
    columns: 2,
    rows: 2,
    index,
  }}
/>`}</Code>
        </>
      }
      demo={AtlasCard}
    />
  );
}

function AtlasCard() {
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
        {`cell ${index} of 4 — next`}
      </Button>
    </node>
  );
}

// --- SVG-file cards: an .svg src re-rasterized at laid-out size ------------

const SIZES = [64, 160];

function SvgDemo() {
  return (
    <Example
      title="SVG images"
      info={
        <>
          <Paragraph>
            An <InlineCode>.svg</InlineCode> src is detected by extension and
            rendered as a vector: the document parses once, and each node
            re-rasterizes it at its own laid-out size (× DPI). The same{" "}
            <InlineCode>gear.svg</InlineCode> at three sizes is equally crisp —
            the large one is not a scaled-up small one. With no width/height,
            the file's viewBox is the intrinsic size. For building vector
            graphics from JSX shapes, see the <InlineCode>{"<svg>"}</InlineCode>{" "}
            page.
          </Paragraph>
          <Code lang="tsx">{`<image src="gear.svg" style={{ width: 160 }} />`}</Code>
        </>
      }
      demo={SvgFileCard}
    />
  );
}

function SvgFileCard() {
  return (
    <node style={svgRowStyle}>
      <Figure caption="Intrinsic size">
        <image src="gear.svg" />
      </Figure>
      {SIZES.map((size) => (
        <Figure key={size} caption={`${size}px`}>
          <image src="gear.svg" style={{ width: size }} />
        </Figure>
      ))}
    </node>
  );
}

const svgRowStyle: BevyStyle = {
  flexDirection: "row",
  alignItems: "flexEnd",
  justifyContent: "center",
  gap: 24,
  padding: 12,
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
