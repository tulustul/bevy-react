import { useEffect, useState } from "react";
import {
  interpolateColor,
  useSharedValue,
  withRepeat,
  withTiming,
} from "bevy-react";
import { DemoRow, Example, Slider } from "@/components";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { Colors } from "@/theme";
import { box, controlColumn, stage } from "./shared";

const PAGE: ExplanationData = {
  title: "Background image",
  description: `backgroundImage paints a texture as part of a
node's own background: over backgroundColor
and backgroundGradient, under the content.
It never affects layout, and the color shows
through while the texture loads. src is an
asset path or { texture } naming a static
texture the app registered host-side (for
live content use a portal element). Repeat
modes tile at the texture's logical size
times scale. tint animates via an
interpolateColor binding; a hoverStyle swap
happens Bevy-side.`,
};

export function BackgroundImageDemo() {
  useDemoPage(PAGE);
  return (
    <>
      <DemoRow>
        <StretchDemo />
        <RepeatDemo />
      </DemoRow>
      <DemoRow>
        <TintHoverDemo />
        <HostTextureDemo />
      </DemoRow>
    </>
  );
}

function StretchDemo() {
  return (
    <Example
      title="stretch (default)"
      description="The texture fills the box exactly; borderRadius clips it. The backgroundColor underneath shows while the asset loads."
      tsx={`backgroundImage: {
  src: "images/parrot.png",
}`}
    >
      <node style={stage}>
        <node
          style={{
            ...box,
            backgroundColor: Colors.transparent,
            width: 150,
            height: 96,
            backgroundImage: { src: "images/parrot.png" },
          }}
        />
      </node>
    </Example>
  );
}

function RepeatDemo() {
  const [scale, setScale] = useState(0.25);
  return (
    <Example
      title="repeat + scale"
      description="Repeat modes tile the texture at its logical size times scale, DPI-corrected. Drag to retile."
      tsx={`backgroundImage: {
  src: "bevy-react-logo.png",
  mode: "repeat",
  scale: ${scale.toFixed(2)},
}`}
    >
      <node style={{ ...stage, ...controlColumn }}>
        <node
          style={{
            backgroundColor: Colors.transparent,
            width: 220,
            height: 110,
            borderRadius: 10,
            backgroundImage: {
              src: "bevy-react-logo.png",
              mode: "repeat",
              scale,
            },
          }}
        />
        <Slider
          value={scale}
          min={0.1}
          max={0.6}
          label={`scale ${scale.toFixed(2)}`}
          onChange={setScale}
        />
      </node>
    </Example>
  );
}

function TintHoverDemo() {
  // Drives the tint hue back and forth; the binding runs Bevy-side, so no
  // React re-render happens per frame.
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: 1600, easing: "easeInOut" }),
      { reverse: true },
    );
  }, [t]);
  return (
    <Example
      title="tint (animated) + hoverStyle"
      description="tint multiplies the texture and animates via an interpolateColor binding (base style only). Hovering swaps the whole backgroundImage to the untinted image."
      tsx={`style={{ backgroundImage: {
  src: "images/parrot.png",
  tint: { animated:
    interpolateColor(t, [0, 1],
      ["#7aa2f7", "#f7768e"]) },
} }}
hoverStyle={{ backgroundImage: {
  src: "images/parrot.png",
} }}`}
    >
      <node style={stage}>
        <node
          style={{
            ...box,
            backgroundColor: Colors.transparent,
            width: 120,
            height: 120,
            backgroundImage: {
              src: "images/parrot.png",
              tint: {
                animated: interpolateColor(t, [0, 1], ["#7aa2f7", "#f7768e"]),
              },
            },
          }}
        />
      </node>
    </Example>
  );
}

function HostTextureDemo() {
  return (
    <Example
      title="src: { texture }"
      description="A static texture the host generated once and registered under a name (RenderTargets::register) — here a 64px plaid painted CPU-side at startup, tiled. Unknown names stay transparent and bind late. For live content, use a portal element instead."
      tsx={`backgroundImage: {
  src: { texture: "checker" },
  mode: "repeat",
}`}
      rust={`// once, at startup
let image = Image::new(
    /* 64x64 plaid pixels */
);
let handle = images.add(image);
targets.register("checker", handle);`}
    >
      <node style={stage}>
        <node
          style={{
            width: 190,
            height: 130,
            borderRadius: 12,
            backgroundColor: Colors.surface400,
            backgroundImage: {
              src: { texture: "checker" },
              mode: "repeat",
            },
            justifyContent: "flexEnd",
            alignItems: "center",
            padding: 6,
          }}
        />
      </node>
    </Example>
  );
}
