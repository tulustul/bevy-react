import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Example, Slider } from "@/components";
import { Colors } from "@/theme";
import { caption, column, controlColumn } from "./shared";

// `filter` applies per-pixel visual effects to an element's own surface (its image
// or background) via a custom UiMaterial shader. Unlike CSS it does not cascade to
// children — it's most useful on an <image> or a leaf node.
export function FilterDemo() {
  return (
    <>
      <Example
        description="filter on an <image>: drag to blur and desaturate the texture."
        tsx={`<image src="images/parrot.png"
  style={{ filter: { blur: 4, grayscale: 1 } }} />`}
      >
        <ImageFilterControl />
      </Example>

      <Example
        description="The color filters: brightness, contrast, saturate, sepia, invert, hueRotate."
        tsx={`<image style={{ filter: { sepia: 1 } }} />`}
      >
        <node style={column}>
          <Swatch label="none" filter={{}} />
          <Swatch label="grayscale" filter={{ grayscale: 1 }} />
          <Swatch label="sepia" filter={{ sepia: 1 }} />
          <Swatch label="invert" filter={{ invert: 1 }} />
          <Swatch label="hue 120°" filter={{ hueRotate: 120 }} />
        </node>
      </Example>

      <Example
        description="filter on a solid node: hueRotate spins the background color. Drag to rotate."
        tsx={`<node style={{ backgroundColor: "#e5484d",
  filter: { hueRotate: 180 } }} />`}
      >
        <NodeFilterControl />
      </Example>
    </>
  );
}

function ImageFilterControl() {
  const [blur, setBlur] = useState(3);
  const [grayscale, setGrayscale] = useState(1);
  return (
    <node style={controlColumn}>
      <image
        src="images/parrot.png"
        style={{ width: 150, filter: { blur, grayscale } }}
      />
      <Slider
        value={blur}
        min={0}
        max={20}
        onChange={setBlur}
        label={`blur ${blur.toFixed(1)}px`}
      />
      <Slider
        value={grayscale}
        min={0}
        max={1}
        onChange={setGrayscale}
        label={`grayscale ${grayscale.toFixed(2)}`}
      />
    </node>
  );
}

function NodeFilterControl() {
  const [hue, setHue] = useState(0);
  return (
    <node style={controlColumn}>
      <image
        src="images/parrot.png"
        style={{
          width: 150,
          borderRadius: 12,
          backgroundColor: Colors.red100,
          filter: { hueRotate: hue },
        }}
      />
      <Slider
        value={hue}
        min={0}
        max={360}
        onChange={setHue}
        label={`hueRotate ${hue.toFixed(0)}°`}
      />
    </node>
  );
}

function Swatch({
  label,
  filter,
}: {
  label: string;
  filter: BevyStyle["filter"];
}) {
  return (
    <node style={{ flexDirection: "column", alignItems: "center", gap: 6 }}>
      <image src="images/parrot.png" style={{ width: 150, filter }} />
      <text style={caption}>{label}</text>
    </node>
  );
}
