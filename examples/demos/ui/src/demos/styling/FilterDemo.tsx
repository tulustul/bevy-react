import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Button, Checkbox, DemoRow, Example, Slider } from "@/components";
import { B, Code, InlineCode, Li, P, Ul } from "@/components/docs";
import { Colors, FontSizes } from "@/theme";
import { caption, controlColumn } from "./shared";
import { TestBanner } from "@/components/TestBanner";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

const PAGE: ExplanationData = {
  title: "Filters",
  info: (
    <>
      <P>
        The <InlineCode>filter</InlineCode> style applies post-processing shader
        passes to a node's rendered subtree. A value is one{" "}
        <InlineCode>{"{ name, params }"}</InlineCode> object or an ordered array
        — an array is a <B>pass chain</B>, run in order:
      </P>
      <Code lang="tsx">{`<node
  style={{
    filter: [
      { name: "blur", params: { radius: 4 } },
      { name: "sepia" },
    ],
  }}
>
  …
</node>`}</Code>
      <P>
        A non-empty chain promotes the subtree to a <B>composited layer</B>: its
        pixels are captured once into a texture, and dragging a param re-runs
        only the filter passes — the content itself is not re-rendered. That
        makes animating filter params cheap by design.
      </P>
      <Ul>
        <Li>
          Built-ins: blur, grayscale, sepia, invert, hueRotate, brightness,
          contrast, saturate, bloom, chromaticAberration, gradientMap, outline,
          shadow.
        </Li>
        <Li>
          transition: {"{ filter }"} eases params — but easing to an EMPTY chain
          snaps (the layer demotes). Keep an identity entry, e.g.{" "}
          {'{ name: "blur", params: { radius: 0 } }'}, when removal should fade.
        </Li>
        <Li>
          An {"{ animated }"} wrapper on any param drives it from the animation
          engine, per frame, off the React render path.
        </Li>
        <Li>
          Your own WGSL passes plug in the same way — see the Custom filters
          page.
        </Li>
      </Ul>
    </>
  ),
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
  return (
    <Example
      title="Grayscale"
      info={
        <>
          <P>
            <InlineCode>grayscale</InlineCode> desaturates the subtree;{" "}
            <InlineCode>amount</InlineCode> 0–1 blends from full color to
            monochrome. Omitting params means full strength.
          </P>
          <Code lang="tsx">{`filter: { name: "grayscale", params: { amount } }`}</Code>
        </>
      }
      demo={GrayscaleCard}
    />
  );
}

function GrayscaleCard() {
  const [grayscale, setGrayscale] = useState(1);
  return (
    <>
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
    </>
  );
}

function SepiaDemo() {
  return (
    <Example
      title="Sepia"
      info={
        <>
          <P>
            <InlineCode>sepia</InlineCode> warms the subtree toward an
            old-photograph brown; <InlineCode>amount</InlineCode> 0–1 blends the
            effect in.
          </P>
          <Code lang="tsx">{`filter: { name: "sepia", params: { amount } }`}</Code>
        </>
      }
      demo={SepiaCard}
    />
  );
}

function SepiaCard() {
  const [sepia, setSepia] = useState(1);
  return (
    <>
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
    </>
  );
}

function InvertDemo() {
  return (
    <Example
      title="Invert"
      info={
        <>
          <P>
            <InlineCode>invert</InlineCode> flips every color to its negative;{" "}
            <InlineCode>amount</InlineCode> 0–1 blends toward the inverted
            image.
          </P>
          <Code lang="tsx">{`filter: { name: "invert", params: { amount } }`}</Code>
        </>
      }
      demo={InvertCard}
    />
  );
}

function InvertCard() {
  const [invert, setInvert] = useState(1);
  return (
    <>
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
    </>
  );
}

function HueDemo() {
  return (
    <Example
      title="Hue"
      info={
        <>
          <P>
            <InlineCode>hueRotate</InlineCode> spins every color around the hue
            wheel by <InlineCode>angle</InlineCode> degrees; 360 is a full turn
            back to the original. Transitions lerp the angle along the shortest
            arc.
          </P>
          <Code lang="tsx">{`filter: { name: "hueRotate", params: { angle } }`}</Code>
        </>
      }
      demo={HueCard}
    />
  );
}

function HueCard() {
  const [hue, setHue] = useState(180);
  return (
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
  );
}

function SubtreeFilterDemo() {
  return (
    <Example
      title="Subtree filter"
      info={
        <>
          <P>
            <InlineCode>filter</InlineCode> applies to the node's whole
            composited subtree: one grayscale on the card desaturates the image,
            text and button <B>as a group</B> — the classic disabled-card look.
            Toggling promotes/demotes the layer live, and the button keeps
            working underneath (filters change pixels, not picking).
          </P>
          <Code lang="tsx">{`<node style={{ filter: soldOut ? { name: "grayscale" } : [] }}>
  <image src="images/parrot.png" />
  <text>Parrot, deluxe</text>
  <Button>Add to cart</Button>
</node>`}</Code>
        </>
      }
      demo={SubtreeFilterCard}
    />
  );
}

function SubtreeFilterCard() {
  const [soldOut, setSoldOut] = useState(true);
  const [cart, setCart] = useState(0);
  return (
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
  );
}

function MultipleFiltersDemo() {
  return (
    <Example
      title="Multiple filters"
      info={
        <>
          <P>
            An array is a pass chain, run in order: blur first, then sepia over
            the blurred result. The capture is reused — dragging a slider
            re-runs only the filter passes. Crank the radius and watch the blur
            bleed softly past the card's border box.
          </P>
          <Code lang="tsx">{`<node
  style={{
    filter: [
      { name: "blur", params: { radius } },
      { name: "sepia" },
    ],
  }}
>
  …
</node>`}</Code>
        </>
      }
      demo={MultipleFiltersCard}
    />
  );
}

function MultipleFiltersCard() {
  const [radius, setRadius] = useState(4);
  const [sepia, setSepia] = useState(1);
  return (
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
  );
}

// Bright text on a dark card, glowing. The sliders sit outside the filtered
// card so only the sign blooms.
function BloomDemo() {
  return (
    <Example
      title="Bloom"
      info={
        <>
          <P>
            <InlineCode>bloom</InlineCode> makes bright content bleed light: a
            bright-pass keeps everything above{" "}
            <InlineCode>threshold</InlineCode>, blurs it by{" "}
            <InlineCode>radius</InlineCode>, and adds it back scaled by{" "}
            <InlineCode>intensity</InlineCode>. threshold cuts on 0–1 luminance
            — 1 blooms nothing, 0 blooms everything. The glow spreads past the
            card's border box, like blur.
          </P>
          <Code lang="tsx">{`<node
  style={{
    filter: {
      name: "bloom",
      params: { radius: 3, threshold: 0.45, intensity: 6 },
    },
  }}
>
  <text>NEON</text>
</node>`}</Code>
        </>
      }
      demo={BloomCard}
    />
  );
}

function BloomCard() {
  const [radius, setRadius] = useState(3);
  const [threshold, setThreshold] = useState(0.45);
  const [intensity, setIntensity] = useState(6);
  return (
    <node style={controlColumn}>
      <node
        style={{
          ...neonCard,
          filter: { name: "bloom", params: { radius, threshold, intensity } },
        }}
      >
        <text style={neonText}>NEON</text>
        <text style={{ ...caption, color: Colors.textColor300 }}>dim text</text>
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
  );
}

function ChromaticAberrationDemo() {
  return (
    <Example
      title="Chromatic aberration"
      info={
        <>
          <P>
            <InlineCode>chromaticAberration</InlineCode> is a directional RGB
            split: the red channel shifts <InlineCode>offset</InlineCode> px
            along <InlineCode>angle</InlineCode> (degrees, clockwise from +X),
            blue the same distance opposite, green stays put. Identity is offset
            0, so it transitions and animates like blur's radius.
          </P>
          <Code lang="tsx">{`filter: {
  name: "chromaticAberration",
  params: { offset: 4, angle: 0 },
}`}</Code>
        </>
      }
      demo={ChromaticAberrationCard}
    />
  );
}

function ChromaticAberrationCard() {
  const [offset, setOffset] = useState(4);
  const [angle, setAngle] = useState(0);
  return (
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
  );
}

// Gradient text: bevy paints glyphs in one flat color, so the gradient is a
// recolor filter over the wrapping node's capture (<text> itself can't
// promote to a layer).
function GradientTextDemo() {
  return (
    <Example
      title="Gradient text"
      info={
        <>
          <P>
            <InlineCode>gradientMap</InlineCode> recolors the subtree's pixels
            with a multi-stop linear gradient, keeping alpha — put it on a node
            wrapping a <InlineCode>{"<text>"}</InlineCode> for gradient type.{" "}
            <InlineCode>angle</InlineCode> matches backgroundGradient; stops
            take optional 0–1 positions and auto-distribute like CSS.{" "}
            <InlineCode>amount</InlineCode> mixes the original color toward the
            gradient (identity is 0, so it fades in transitions).
          </P>
          <Code lang="tsx">{`<node
  style={{
    filter: {
      name: "gradientMap",
      params: {
        angle: 120,
        stops: [
          { color: "#38bdf8" },
          { color: "#a78bfa", position: 0.6 },
          { color: "#f472b6" },
        ],
      },
    },
  }}
>
  <text>Gradient</text>
</node>`}</Code>
        </>
      }
      demo={GradientTextCard}
    />
  );
}

function GradientTextCard() {
  const [angle, setAngle] = useState(120);
  const [amount, setAmount] = useState(1);
  return (
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
  );
}

function OutlineTextDemo() {
  return (
    <Example
      title="Outlined text"
      info={
        <>
          <P>
            <InlineCode>outline</InlineCode> dilates the subtree's alpha
            silhouette into a colored ring painted under the content — text
            outlines, sticker-style icon rings. <InlineCode>width</InlineCode>{" "}
            is the crisp ring in px; <InlineCode>softness</InlineCode> feathers
            its outer edge and doubles as a glow. Practical text outlines are
            1–6px; the ring bleeds past the border box like blur.
          </P>
          <Code lang="tsx">{`<node
  style={{
    filter: {
      name: "outline",
      params: { width: 2, color: "#7aa2f7", softness: 0 },
    },
  }}
>
  <text>Outlined</text>
</node>`}</Code>
        </>
      }
      demo={OutlineTextCard}
    />
  );
}

function OutlineTextCard() {
  const [width, setWidth] = useState(2);
  const [softness, setSoftness] = useState(0);
  const [accent, setAccent] = useState(true);
  return (
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
  );
}

function DropShadowDemo() {
  return (
    <Example
      title="Drop shadow"
      info={
        <>
          <P>
            <InlineCode>shadow</InlineCode> is a CSS drop-shadow: the subtree's
            alpha silhouette, tinted <InlineCode>color</InlineCode>, shifted by{" "}
            <InlineCode>offsetX/offsetY</InlineCode>, Gaussian-blurred by{" "}
            <InlineCode>spread</InlineCode>, layered under the content — it
            follows the glyphs' shape, unlike boxShadow's rectangle. Identity is
            a transparent color, so the shadow fades in transitions.
          </P>
          <Code lang="tsx">{`<node
  style={{
    filter: {
      name: "shadow",
      params: { color: "#000000aa", offsetX: 0, offsetY: 6, spread: 6 },
    },
  }}
>
  <text>Shadow</text>
</node>`}</Code>
        </>
      }
      demo={DropShadowCard}
    />
  );
}

function DropShadowCard() {
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(6);
  const [spread, setSpread] = useState(6);
  return (
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
  );
}

// The chain card: outline's outset inflates the capture, and the gradient
// must NOT stretch over that ring — gradientMap anchors its line to the node
// rect via the pass uniforms' content inset.
function GradientOutlineDemo() {
  return (
    <Example
      title="Gradient + outline"
      info={
        <>
          <P>
            The two compose as a chain: gradientMap recolors the glyphs, then
            outline rings the recolored result. The gradient stays locked to the
            text's box even as the outline's width grows the captured area —
            filter shaders see the node rect through the pass uniforms.
          </P>
          <Code lang="tsx">{`<node
  style={{
    filter: [
      { name: "gradientMap" },
      { name: "outline", params: { width: 3 } },
    ],
  }}
>
  <text>Sticker</text>
</node>`}</Code>
        </>
      }
      demo={GradientOutlineCard}
    />
  );
}

function GradientOutlineCard() {
  const [width, setWidth] = useState(3);
  return (
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
