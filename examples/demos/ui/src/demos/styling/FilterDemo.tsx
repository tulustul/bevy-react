import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Button, Checkbox, DemoRow, Example, Slider } from "@/components";
import { Colors, FontSizes } from "@/theme";
import { caption, controlColumn } from "./shared";
import { TestBanner } from "@/components/TestBanner";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

const PAGE: ExplanationData = {
  title: "Filters",
  description: `The filter style applies post-processing passes to a node's
rendered subtree. A value is one { name, params } object or an ordered array —
an array is a pass chain, run in order. A non-empty chain promotes the subtree
to a composited layer: it is captured once, and dragging a param re-runs only
the filter passes. Built-ins: blur, grayscale, sepia, invert, hueRotate,
bloom, chromaticAberration. transition: { filter } eases params, but easing to
an empty chain snaps (the layer demotes) — keep an identity entry, e.g.
{ name: "blur", params: { radius: 0 } }, when removal should fade.
animatedStyle drives single params via "filter[<i>].<param>" keys.`,
};

export function FilterDemo() {
  useDemoPage(PAGE);
  return (
    <>
      <DemoRow>
        <GrayscaleDemo />
        <SepiaDemo />
        <InvertDemo />
        <HueDemo />
      </DemoRow>

      <DemoRow>
        <SubtreeFilterDemo />
        <MultipleFiltersDemo />
      </DemoRow>

      <DemoRow>
        <BloomDemo />
        <ChromaticAberrationDemo />
      </DemoRow>
    </>
  );
}

function GrayscaleDemo() {
  const [grayscale, setGrayscale] = useState(1);

  return (
    <Example title="Grayscale">
      <image
        src="images/parrot.png"
        style={{
          width: 150,
          filter: { name: "grayscale", params: { amount: grayscale } },
        }}
      />
      <Slider
        value={grayscale}
        min={0}
        max={1}
        onChange={setGrayscale}
        label={`grayscale ${grayscale.toFixed(1)}`}
      />
    </Example>
  );
}

function SepiaDemo() {
  const [sepia, setSepia] = useState(1);

  return (
    <Example title="Sepia">
      <image
        src="images/parrot.png"
        style={{
          width: 150,
          filter: { name: "sepia", params: { amount: sepia } },
        }}
      />
      <Slider
        value={sepia}
        min={0}
        max={1}
        onChange={setSepia}
        label={`sepia ${sepia.toFixed(1)}`}
      />
    </Example>
  );
}

function InvertDemo() {
  const [invert, setInvert] = useState(1);

  return (
    <Example title="Invert">
      <image
        src="images/parrot.png"
        style={{
          width: 150,
          filter: { name: "invert", params: { amount: invert } },
        }}
      />
      <Slider
        value={invert}
        min={0}
        max={1}
        onChange={setInvert}
        label={`invert ${invert.toFixed(1)}`}
      />
    </Example>
  );
}

function ChromaticAberrationDemo() {
  const [offset, setOffset] = useState(4);
  const [angle, setAngle] = useState(0);

  return (
    <Example
      title="Chromatic abberation"
      description="chromaticAberration is a directional RGB split: the red
channel shifts offset px along angle (degrees, clockwise from +X), blue the
same distance opposite, green stays put — the whole layer splits uniformly.
Identity is offset 0, so it transitions and animates like blur's radius; the
angle lerps shortest-arc like hueRotate's."
      tsx={`<image
  src="images/parrot.png"
  style={{ filter: {
    name: "chromaticAberration",
    params: { offset: 4, angle: 0 },
  } }}
/>`}
    >
      <node style={controlColumn}>
        <TestBanner
          style={{
            filter: { name: "chromaticAberration", params: { offset, angle } },
          }}
        />
        <Slider
          value={offset}
          min={0}
          max={10}
          onChange={setOffset}
          label={`offset ${offset.toFixed(1)}px`}
        />
        <Slider
          value={angle}
          min={0}
          max={360}
          onChange={setAngle}
          label={`angle ${angle.toFixed(0)}°`}
        />
      </node>
    </Example>
  );
}

// Bright text on a dark card, glowing. The sliders sit outside the filtered
// card so only the sign blooms.
function BloomDemo() {
  const [radius, setRadius] = useState(3);
  const [threshold, setThreshold] = useState(0.45);
  const [intensity, setIntensity] = useState(6);

  return (
    <Example
      title="Bloom"
      description="bloom makes bright content bleed light: a bright-pass
(everything above threshold), blurred by radius, added back scaled by
intensity. threshold is a cut on 0–1 luminance — 1 blooms nothing, 0 blooms
everything. The glow spreads past the card's border box, like blur."
      tsx={`<node style={{ filter: {
  name: "bloom",
  params: {
    radius: 14,
    threshold: 0.6,
    intensity: 1.2,
  },
} }}>
  <text>NEON</text>
</node>`}
    >
      <node style={controlColumn}>
        <node
          style={{
            ...neonCard,
            filter: { name: "bloom", params: { radius, threshold, intensity } },
          }}
        >
          <text style={neonText}>NEON</text>
          <text style={{ ...caption, color: Colors.textColor300 }}>
            dim text
          </text>
        </node>
        <Slider
          value={radius}
          min={0}
          max={15}
          onChange={setRadius}
          label={`radius ${radius.toFixed(1)}px`}
        />
        <Slider
          value={threshold}
          min={0}
          max={1}
          onChange={setThreshold}
          label={`threshold ${threshold.toFixed(2)}`}
        />
        <Slider
          value={intensity}
          min={0}
          max={10}
          onChange={setIntensity}
          label={`intensity ${intensity.toFixed(2)}`}
        />
      </node>
    </Example>
  );
}

function SubtreeFilterDemo() {
  const [soldOut, setSoldOut] = useState(true);
  const [cart, setCart] = useState(0);
  return (
    <Example
      title="Subtree filter"
      description="filter applies to the node's whole composited subtree: one
grayscale on the card desaturates the image, text and button as a group — the
classic disabled-card look. Toggle it to promote/demote the layer live; the
button keeps working underneath."
      tsx={`<node style={{
  filter: soldOut
    ? { name: "grayscale" }
    : [],
}}>
  <image src="images/parrot.png" />
  <text>Parrot, deluxe</text>
  <Button>Add to cart</Button>
</node>`}
    >
      <node style={controlColumn}>
        <node
          style={{
            ...productCard,
            filter: soldOut ? { name: "grayscale" } : [],
          }}
        >
          <Parrot />
          <text style={cardTitle}>Parrot, deluxe</text>
          <text style={caption}>Vivid plumage, limited stock.</text>
          <Button onClick={() => setCart((c) => c + 1)}>
            {cart > 0 ? `In cart × ${cart}` : "Add to cart"}
          </Button>
        </node>
        <Checkbox
          label="grayscale (sold out)"
          enabled={soldOut}
          onChange={setSoldOut}
        />
      </node>
    </Example>
  );
}

function MultipleFiltersDemo() {
  const [radius, setRadius] = useState(4);
  const [sepia, setSepia] = useState(1);

  return (
    <Example
      title="Multiple filters"
      description="An array is a pass chain, run in order: blur first, then
sepia over the blurred result. The capture is reused — dragging the slider
re-runs only the filter passes. Crank the radius and watch the blur bleed
softly past the card's border box."
      tsx={`<node style={{ filter: [
  { name: "blur", params: { radius } },
  { name: "sepia" },
] }}>…</node>`}
    >
      <node style={controlColumn}>
        <node
          style={{
            ...productCard,
            backgroundColor: Colors.surface500,
            filter: [
              { name: "blur", params: { radius } },
              { name: "sepia", params: { amount: sepia } },
            ],
          }}
        >
          <Parrot />
          <text style={cardTitle}>Old photograph</text>
        </node>

        <Slider
          value={radius}
          min={0}
          max={24}
          onChange={setRadius}
          label={`blur ${radius.toFixed(1)}px`}
        />
        <Slider
          value={sepia}
          min={0}
          max={1}
          onChange={setSepia}
          label={`sepia ${sepia.toFixed(1)}`}
        />
      </node>
    </Example>
  );
}

function HueDemo() {
  const [hue, setHue] = useState(180);

  return (
    <Example title="Hue">
      <node style={controlColumn}>
        <Parrot
          style={{ filter: { name: "hueRotate", params: { angle: hue } } }}
        />
        <Slider
          value={hue}
          min={0}
          max={360}
          onChange={setHue}
          label={`hueRotate ${hue.toFixed(0)}°`}
        />
      </node>
    </Example>
  );
}

function Parrot({ style }: { style?: BevyStyle }) {
  return (
    <image
      src="images/parrot.png"
      style={{
        width: 150,
        borderRadius: 12,
        ...style,
      }}
    />
  );
}

const neonCard: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 6,
  padding: 20,
  borderRadius: 12,
  backgroundColor: Colors.surface100,
  border: 2,
  borderColor: Colors.purple100,
};

const neonText: BevyStyle = {
  color: Colors.red100,
  fontSize: FontSizes.xl,
  fontWeight: "bold",
};

const productCard: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
  padding: 14,
  borderRadius: 12,
  backgroundColor: Colors.surface300,
};

const cardTitle: BevyStyle = {
  color: Colors.textColor100,
  fontSize: FontSizes.base,
  fontWeight: "bold",
};
