import { BevyStyle } from "bevy-react/jsx";
import { DemoRow, Example } from "@/components";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { Colors, FontSizes } from "@/theme";
import { caption } from "./shared";

const PAGE: ExplanationData = {
  title: "cursor",
  description: `The cursor style prop sets the OS mouse cursor while the
pointer is over a node (CSS cursor). The topmost node under the pointer with
a cursor set wins, so a child without one inherits its nearest cursor-bearing
ancestor. Custom image cursors are registered upfront on the Rust side
(ReactUiPlugin::cursor with an image path and a hotspot), then selected by
name from React like any keyword.`,
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

// The `cursor` style prop sets the OS mouse cursor while the pointer is over a
// node (CSS `cursor`). The topmost node under the pointer with a `cursor` set
// wins, so a child without one inherits its nearest cursor-bearing ancestor.
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
      title="cursor"
      description="The cursor style prop sets the OS mouse cursor while the pointer is over a node (CSS cursor). Hover each swatch to feel it change."
      tsx={`<node style={{ cursor: "pointer" }} />`}
    >
      <node style={grid}>
        {CURSORS.map((cursor) => (
          <node key={cursor} style={{ ...swatch, cursor }}>
            <text style={label}>{cursor}</text>
          </node>
        ))}
      </node>
      <text style={caption}>
        A child without a cursor inherits its nearest cursor-bearing ancestor.
      </text>
    </Example>
  );
}

// A custom image cursor is loaded upfront on the Rust side (like a font family),
// then selected by name from React with `cursor: "<name>"`.
const CUSTOM_RUST = `ReactUiPlugin::new(bundle)
    .cursor(
        // selected from React with
        // cursor: "hand"
        "hand",
        // path relative to asset root
        "cursor-hand.png",
        // hotspot pixel in the image
        (0, 0),
    );`;

const CUSTOM_TS = `<node style={{ cursor: "hand" }}>`;

function CustomCursorDemo() {
  return (
    <Example
      title="Custom cursor"
      description="Custom image cursors: register a PNG by name on the Rust side (ReactUiPlugin::cursor), then reference it like any keyword. Hover the swatch."
      rust={CUSTOM_RUST}
      tsx={CUSTOM_TS}
    >
      <node style={{ ...swatch, width: 200, cursor: "hand" }}>
        <text style={label}>cursor: "hand" (custom PNG)</text>
      </node>
    </Example>
  );
}

const grid: BevyStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 10,
  width: 420,
  justifyContent: "center",
};

const swatch: BevyStyle = {
  width: 96,
  height: 44,
  borderRadius: 8,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: Colors.surface200,
  border: 1,
  borderColor: Colors.surface400,
};

const label: BevyStyle = {
  color: Colors.textColor100,
  fontSize: FontSizes.xs,
  fontWeight: "bold",
  textAlign: "center",
};
