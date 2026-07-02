import { BevyStyle } from "bevy-react/jsx";
import { Example } from "@/components";
import { Colors, FontSizes } from "@/theme";
import { caption } from "./shared";

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

// A custom image cursor is loaded upfront on the Rust side (like a font family),
// then selected by name from React with `cursor: "<name>"`.
const CUSTOM_RUST = `ReactUiPlugin::new(bundle)
    .cursor(
        "hand",             // name React selects with cursor: "hand"
        "cursor-hand.png",  // image path (relative to the asset root)
        (0, 0),            // hotspot: the click-point pixel in the image
    );`;

const CUSTOM_TS = `<node style={{ cursor: "hand" }}>`;

export function CursorDemo() {
  return (
    <>
      <Example
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

      <Example
        description="Custom image cursors: register a PNG by name on the Rust side (ReactUiPlugin::cursor), then reference it like any keyword. Hover the swatch."
        rust={CUSTOM_RUST}
        tsx={CUSTOM_TS}
      >
        <node style={{ ...swatch, width: 200, cursor: "hand" }}>
          <text style={label}>cursor: "hand" (custom PNG)</text>
        </node>
      </Example>
    </>
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
