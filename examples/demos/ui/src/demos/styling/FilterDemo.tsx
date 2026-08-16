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
bloom, chromaticAberration, gradientMap, outline, shadow. transition: { filter } eases params, but easing to
an empty chain snaps (the layer demotes) — keep an identity entry, e.g.
{ name: "blur", params: { radius: 0 } }, when removal should fade.
An { animated } wrapper on a param drives it from the animation engine.`,
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

      <DemoRow>
        <GradientTextDemo />
        <OutlineTextDemo />
        <DropShadowDemo />
        <GradientOutlineDemo />
      </DemoRow>
    </>
  );
}

function GrayscaleDemo() {
  const [grayscale, setGrayscale] = useState(1);

  return (
    <Example
      title="Grayscale"
      description="grayscale desaturates the subtree; amount 0–1 blends from full color to monochrome."
      tsx={`filter: {
  name: "grayscale",
  params: { amount },
}`}
    >
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
    <Example
      title="Sepia"
      description="sepia warms the subtree toward an old-photograph brown; amount 0–1 blends the effect in."
      tsx={`filter: {
  name: "sepia",
  params: { amount },
}`}
    >
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
    <Example
      title="Invert"
      description="invert flips every color to its negative; amount 0–1 blends toward the inverted image."
      tsx={`filter: {
  name: "invert",
  params: { amount },
}`}
    >
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
      title="Chromatic aberration"
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
    radius: 3,
    threshold: 0.45,
    intensity: 6,
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
    <Example
      title="Hue"
      description="hueRotate spins every color around the hue wheel by angle degrees; 360 is a full turn back to the original."
      tsx={`filter: {
  name: "hueRotate",
  params: { angle },
}`}
    >
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

// Gradient text: bevy paints glyphs in one flat color, so the gradient is a
// recolor filter over the wrapping node's capture (<text> itself can't
// promote to a layer).
function GradientTextDemo() {
  const [angle, setAngle] = useState(120);
  const [amount, setAmount] = useState(1);

  return (
    <Example
      title="Gradient text"
      description="gradientMap recolors the subtree's pixels with a multi-stop
linear gradient, keeping alpha — put it on a node wrapping a <text> for
gradient type. angle matches backgroundGradient (degrees, 0 = to top); stops
take optional 0–1 positions and auto-distribute like CSS. amount mixes the
original color toward the gradient (identity is 0, so it fades in
transitions)."
      tsx={`<node style={{ filter: {
  name: "gradientMap",
  params: {
    angle: 120,
    stops: [
      { color: "#38bdf8" },
      { color: "#a78bfa",
        position: 0.6 },
      { color: "#f472b6" },
    ],
  },
} }}>
  <text>Gradient</text>
</node>`}
    >
      <node style={controlColumn}>
        <node
          style={{
            filter: {
              name: "gradientMap",
              params: {
                angle,
                amount,
                stops: [
                  { color: "#38bdf8" },
                  { color: "#a78bfa", position: 0.6 },
                  { color: "#f472b6" },
                ],
              },
            },
          }}
        >
          <text style={effectText}>Gradient</text>
        </node>
        <Slider
          value={angle}
          min={0}
          max={360}
          onChange={setAngle}
          label={`angle ${angle.toFixed(0)}°`}
        />
        <Slider
          value={amount}
          min={0}
          max={1}
          onChange={setAmount}
          label={`amount ${amount.toFixed(2)}`}
        />
      </node>
    </Example>
  );
}

function OutlineTextDemo() {
  const [width, setWidth] = useState(2);
  const [softness, setSoftness] = useState(0);
  const [accent, setAccent] = useState(true);

  return (
    <Example
      title="Outlined text"
      description="outline dilates the subtree's alpha silhouette into a
colored ring painted under the content — text outlines, sticker-style icon
rings. width is the crisp ring in px; softness feathers its outer edge and
doubles as a glow. Identity is width 0 + softness 0. Practical text outlines
are 1–6px; the ring bleeds past the border box like blur."
      tsx={`<node style={{ filter: {
  name: "outline",
  params: {
    width: 2,
    color: "#7aa2f7",
    softness: 0,
  },
} }}>
  <text>Outlined</text>
</node>`}
    >
      <node style={controlColumn}>
        <node
          style={{
            filter: {
              name: "outline",
              params: {
                width,
                softness,
                color: accent ? Colors.red300 : "#000000",
              },
            },
          }}
        >
          <text style={effectText}>Outlined</text>
        </node>
        <Slider
          value={width}
          min={0}
          max={8}
          onChange={setWidth}
          label={`width ${width.toFixed(1)}px`}
        />
        <Slider
          value={softness}
          min={0}
          max={8}
          onChange={setSoftness}
          label={`softness ${softness.toFixed(1)}px`}
        />
        <Checkbox label="accent color" enabled={accent} onChange={setAccent} />
      </node>
    </Example>
  );
}

function DropShadowDemo() {
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(6);
  const [spread, setSpread] = useState(6);

  return (
    <Example
      title="Drop shadow"
      description="shadow is a CSS-drop-shadow: the subtree's alpha
silhouette, tinted color, shifted by offsetX/offsetY (positive = right/down,
negative allowed), Gaussian-blurred by spread, layered under the content — it
follows the glyphs' shape, unlike boxShadow's rectangle. Same pass structure
as bloom (the middle passes literally run blur's shader). Identity is a
transparent color, so the shadow fades in transitions."
      tsx={`<node style={{ filter: {
  name: "shadow",
  params: {
    color: "#000000aa",
    offsetX: 0,
    offsetY: 6,
    spread: 6,
  },
} }}>
  <text>Shadow</text>
</node>`}
    >
      <node style={controlColumn}>
        <node
          style={{
            filter: {
              name: "shadow",
              params: { color: "#000000aa", offsetX, offsetY, spread },
            },
          }}
        >
          <text style={effectText}>Shadow</text>
        </node>
        <Slider
          value={offsetX}
          min={-12}
          max={12}
          onChange={setOffsetX}
          label={`offsetX ${offsetX.toFixed(0)}px`}
        />
        <Slider
          value={offsetY}
          min={-12}
          max={12}
          onChange={setOffsetY}
          label={`offsetY ${offsetY.toFixed(0)}px`}
        />
        <Slider
          value={spread}
          min={0}
          max={12}
          onChange={setSpread}
          label={`spread ${spread.toFixed(1)}px`}
        />
      </node>
    </Example>
  );
}

// The chain card: outline's outset inflates the capture, and the gradient
// must NOT stretch over that ring — gradientMap anchors its line to the node
// rect via the pass uniforms' content inset.
function GradientOutlineDemo() {
  const [width, setWidth] = useState(3);

  return (
    <Example
      title="Gradient + outline"
      description="The two compose as a chain: gradientMap recolors the
glyphs, then outline rings the recolored result. The gradient stays locked to
the text's box even as the outline's width grows the captured area — filter
shaders see the node rect through the pass uniforms."
      tsx={`<node style={{ filter: [
  { name: "gradientMap" },
  { name: "outline",
    params: { width: 3 } },
] }}>
  <text>Sticker</text>
</node>`}
    >
      <node style={controlColumn}>
        <node
          style={{
            filter: [
              {
                name: "gradientMap",
                params: {
                  angle: 160,
                  stops: [{ color: "#caf9afff" }, { color: "#c72e00ff" }],
                },
              },
              { name: "outline", params: { width, color: "#0051ffff" } },
            ],
          }}
        >
          <text style={effectText}>Sticker</text>
        </node>
        <Slider
          value={width}
          min={0}
          max={8}
          onChange={setWidth}
          label={`outline ${width.toFixed(1)}px`}
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

// Big flat-white type for the text-effect cards — the filters supply the
// color.
const effectText: BevyStyle = {
  color: Colors.textColor100,
  fontSize: FontSizes.xl,
  fontWeight: "black",
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
