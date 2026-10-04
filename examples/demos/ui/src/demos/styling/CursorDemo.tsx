import { BevyStyle } from "bevy-react/jsx";
import { Caption, InlineCode, Paragraph } from "@/components/typography";
import { DemoRow, Example } from "@/components";
import { Code, CodeTabs } from "@/components/docs";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { Colors, Fonts, FontSizes } from "@/theme";
import { useContentWidth } from "@/hooks";

const PAGE: ExplanationData = {
  title: "Cursors",
  info: (
    <>
      <Paragraph>
        The <InlineCode>cursor</InlineCode> style prop sets the OS mouse cursor
        while the pointer is over a node (CSS <InlineCode>cursor</InlineCode>).
        The topmost node under the pointer with a cursor set wins, so a child
        without one inherits its nearest cursor-bearing ancestor.
      </Paragraph>
      <Code lang="tsx">{`<node style={{ cursor: "pointer" }} />`}</Code>
      <Paragraph>
        Custom image cursors are registered upfront on the Rust side (
        <InlineCode>ReactUiPlugin::cursor</InlineCode> with an image path and a
        hotspot), then selected by name from React like any keyword.
      </Paragraph>
    </>
  ),
};

export function CursorDemo() {
  useDemoPage(PAGE);
  return (
    <>
      <DemoRow>
        <CursorKeywordsDemo />
      </DemoRow>
      <DemoRow>
        <CustomCursorDemo />
      </DemoRow>
    </>
  );
}

const CURSORS = [
  "default",
  "pointer",
  "text",
  "wait",
  "progress",
  "help",
  "move",
  "grab",
  "grabbing",
  "crosshair",
  "cell",
  "notAllowed",
  "noDrop",
  "copy",
  "alias",
  "zoomIn",
  "zoomOut",
  "colResize",
  "rowResize",
  "ewResize",
  "nsResize",
  "allScroll",
] as const;

function CursorKeywordsDemo() {
  return (
    <Example
      title="Built-in cursors"
      info={
        <>
          <Paragraph>
            One swatch per cursor keyword — hover each to feel the OS cursor
            change. A child without a <InlineCode>cursor</InlineCode> inherits
            its nearest cursor-bearing ancestor.
          </Paragraph>
          <Code lang="tsx">{`<node style={{ cursor: "pointer" }} />`}</Code>
        </>
      }
      demo={CursorKeywordsCard}
    />
  );
}

function CursorKeywordsCard() {
  // A px width, not `"100%"` + `maxWidth`: that pair under-measures a wrapping
  // row, and the swatches spill out of the card. 50 = the example stage's
  // padding plus the card's rim.
  const width = Math.min(GRID_WIDTH, useContentWidth() - 50);
  return (
    <>
      <node style={{ ...grid, width }}>
        {CURSORS.map((cursor) => (
          <node key={cursor} style={{ ...swatch, cursor }}>
            <text style={label}>{cursor}</text>
          </node>
        ))}
      </node>
      <Caption>
        A child without a cursor inherits its nearest cursor-bearing ancestor.
      </Caption>
    </>
  );
}

function CustomCursorDemo() {
  return (
    <Example
      title="Custom cursors"
      info={
        <>
          <Paragraph>
            A custom image cursor is loaded upfront on the Rust side (like a
            font family): register a PNG by name with{" "}
            <InlineCode>ReactUiPlugin::cursor</InlineCode>, then reference it
            from React like any keyword. Hover the swatch.
          </Paragraph>
          <CodeTabs
            tsx={`<node style={{ cursor: "hand" }} />`}
            rust={`let react_plugin = ReactUiPlugin::new(bundle)
    // name selected from React with cursor: "hand",
    // image path relative to the asset root,
    // hotspot pixel in the image
    .cursor("hand", "cursor-hand.png", (0, 0));`}
          />
        </>
      }
      demo={CustomCursorCard}
    />
  );
}

function CustomCursorCard() {
  return (
    <node style={{ ...swatch, width: 240, cursor: "hand" }}>
      <text style={label}>cursor: "hand" (custom PNG)</text>
    </node>
  );
}

// Four swatches a row at most.
const GRID_WIDTH = 420;

const grid: BevyStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 10,
  justifyContent: "center",
};

const swatch: BevyStyle = {
  width: 96,
  height: 44,
  borderRadius: 8,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: Colors.raised,
  border: 1,
  borderColor: Colors.line,
};

// Cursor names are identifiers: the mono face.
const label: BevyStyle = {
  color: Colors.textBody,
  fontFamily: Fonts.mono,
  fontSize: FontSizes.xs,
  textAlign: "center",
};
