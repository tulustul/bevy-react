import { useState } from "react";
import {
  Bold,
  Caption,
  CardTitle,
  InlineCode,
  ListItem,
  Paragraph,
  List,
} from "@/components/typography";
import { BevyStyle } from "bevy-react/jsx";
import {
  Button,
  Checkbox,
  ControlColumn,
  DemoRow,
  Example,
  ParamControls,
  ProductCard,
  Slider,
  checkbox,
  slider,
  useParams,
} from "@/components";
import { Code } from "@/components/docs";
import { Colors, FontSizes } from "@/theme";
import { PinchDemo } from "./PinchFilterDemo";
import { TestBanner } from "@/components/TestBanner";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

const PAGE: ExplanationData = {
  title: "Filters",
  info: (
    <>
      <Paragraph>
        The <InlineCode>filter</InlineCode> style applies post-processing shader
        passes to a node's rendered subtree. A value is one{" "}
        <InlineCode>{"{ name, params }"}</InlineCode> object or an ordered array
        — an array is a <Bold>pass chain</Bold>, run in order:
      </Paragraph>
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
      <Paragraph>
        A non-empty chain promotes the subtree to a{" "}
        <Bold>composited layer</Bold>: its pixels are captured once into a
        texture, and dragging a param re-runs only the filter passes — the
        content itself is not re-rendered. That makes animating filter params
        cheap by design.
      </Paragraph>
      <List>
        <ListItem>
          Built-ins: blur, grayscale, sepia, invert, hueRotate, brightness,
          contrast, saturate, bloom, chromaticAberration, gradientMap, outline,
          shadow, pinch.
        </ListItem>
        <ListItem>
          transition: {"{ filter }"} eases params — but easing to an EMPTY chain
          snaps (the layer demotes). Keep an identity entry, e.g.{" "}
          {'{ name: "blur", params: { radius: 0 } }'}, when removal should fade.
        </ListItem>
        <ListItem>
          An {"{ animated }"} wrapper on any param drives it from the animation
          engine, per frame, off the React render path.
        </ListItem>
        <ListItem>
          Your own WGSL passes plug in the same way — see the Custom filters
          page.
        </ListItem>
      </List>
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
        <PinchDemo />
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
          <Paragraph>
            <InlineCode>grayscale</InlineCode> desaturates the subtree;{" "}
            <InlineCode>amount</InlineCode> 0–1 blends from full color to
            monochrome. Omitting params means full strength.
          </Paragraph>
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
        name="grayscale"
        decimals={1}
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
          <Paragraph>
            <InlineCode>sepia</InlineCode> warms the subtree toward an
            old-photograph brown; <InlineCode>amount</InlineCode> 0–1 blends the
            effect in.
          </Paragraph>
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
        name="sepia"
        decimals={1}
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
          <Paragraph>
            <InlineCode>invert</InlineCode> flips every color to its negative;{" "}
            <InlineCode>amount</InlineCode> 0–1 blends toward the inverted
            image.
          </Paragraph>
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
        name="invert"
        decimals={1}
      />
    </>
  );
}

function HueDemo() {
  return (
    <Example
      title="Hue rotation"
      info={
        <>
          <Paragraph>
            <InlineCode>hueRotate</InlineCode> spins every color around the hue
            wheel by <InlineCode>angle</InlineCode> degrees; 360 is a full turn
            back to the original. Transitions lerp the angle along the shortest
            arc.
          </Paragraph>
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
    <ControlColumn>
      <Parrot
        style={{ filter: { name: "hueRotate", params: { angle: hue } } }}
      />
      <Slider
        value={hue}
        min={0}
        max={360}
        onChange={setHue}
        name="hueRotate"
        unit="°"
      />
    </ControlColumn>
  );
}

function SubtreeFilterDemo() {
  return (
    <Example
      title="Subtree filters"
      info={
        <>
          <Paragraph>
            <InlineCode>filter</InlineCode> applies to the node's whole
            composited subtree: one grayscale on the card desaturates the image,
            text and button <Bold>as a group</Bold> — the classic disabled-card
            look. Toggling promotes/demotes the layer live, and the button keeps
            working underneath (filters change pixels, not picking).
          </Paragraph>
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
    <ControlColumn>
      <ProductCard style={{ filter: soldOut ? { name: "grayscale" } : [] }}>
        <Parrot />
        <CardTitle>Parrot, deluxe</CardTitle>
        <Caption>Vivid plumage, limited stock.</Caption>
        <Button onClick={() => setCart((c) => c + 1)}>
          {cart > 0 ? `In cart × ${cart}` : "Add to cart"}
        </Button>
      </ProductCard>
      <Checkbox
        label="grayscale (sold out)"
        enabled={soldOut}
        onChange={setSoldOut}
      />
    </ControlColumn>
  );
}

function MultipleFiltersDemo() {
  return (
    <Example
      title="Multiple filters"
      info={
        <>
          <Paragraph>
            An array is a pass chain, run in order: blur first, then sepia over
            the blurred result. The capture is reused — dragging a slider
            re-runs only the filter passes. Crank the radius and watch the blur
            bleed softly past the card's border box.
          </Paragraph>
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
    <ControlColumn>
      <ProductCard
        style={{
          backgroundColor: Colors.surface500,
          filter: [
            { name: "blur", params: { radius } },
            { name: "sepia", params: { amount: sepia } },
          ],
        }}
      >
        <Parrot />
        <CardTitle>Old photograph</CardTitle>
      </ProductCard>

      <Slider
        value={radius}
        min={0}
        max={24}
        onChange={setRadius}
        name="blur"
        decimals={1}
        unit="px"
      />
      <Slider
        value={sepia}
        min={0}
        max={1}
        onChange={setSepia}
        name="sepia"
        decimals={1}
      />
    </ControlColumn>
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
          <Paragraph>
            <InlineCode>bloom</InlineCode> makes bright content bleed light: a
            bright-pass keeps everything above{" "}
            <InlineCode>threshold</InlineCode>, blurs it by{" "}
            <InlineCode>radius</InlineCode>, and adds it back scaled by{" "}
            <InlineCode>intensity</InlineCode>. threshold cuts on 0–1 luminance
            — 1 blooms nothing, 0 blooms everything. The glow spreads past the
            card's border box, like blur.
          </Paragraph>
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
  const [params, controls] = useParams(BLOOM);
  return (
    <ControlColumn>
      <node style={{ ...neonCard, filter: { name: "bloom", params } }}>
        <text style={neonText}>NEON</text>
        <Caption style={{ color: Colors.textColor300 }}>dim text</Caption>
      </node>
      <ParamControls {...controls} />
    </ControlColumn>
  );
}

const BLOOM = {
  radius: slider(0, 15, 3, { decimals: 1, unit: "px" }),
  threshold: slider(0, 1, 0.45),
  intensity: slider(0, 10, 6, { decimals: 2 }),
};

function ChromaticAberrationDemo() {
  return (
    <Example
      title="Chromatic aberration"
      info={
        <>
          <Paragraph>
            <InlineCode>chromaticAberration</InlineCode> is a directional RGB
            split: the red channel shifts <InlineCode>offset</InlineCode> px
            along <InlineCode>angle</InlineCode> (degrees, clockwise from +X),
            blue the same distance opposite, green stays put. A non-zero{" "}
            <InlineCode>rotation</InlineCode> adds a tangential swirl — red
            spins by +rotation degrees around the center, blue by −rotation, so
            the fringing grows toward the edges. Identity is offset 0, so it
            transitions and animates like blur's radius.
          </Paragraph>
          <Code lang="tsx">{`filter: {
  name: "chromaticAberration",
  params: {
    offset: 4,
    angle: 0,
    rotation: 0,
  },
}`}</Code>
        </>
      }
      demo={ChromaticAberrationCard}
    />
  );
}

function ChromaticAberrationCard() {
  const [params, controls] = useParams(CHROMATIC);
  return (
    <ControlColumn>
      <TestBanner style={{ filter: { name: "chromaticAberration", params } }} />
      <ParamControls {...controls} />
    </ControlColumn>
  );
}

const CHROMATIC = {
  offset: slider(0, 10, 2, { decimals: 1, unit: "px" }),
  angle: slider(0, 360, 0, { unit: "\u00b0" }),
  rotation: slider(0, 10, 1.5, { decimals: 1, unit: "\u00b0" }),
};

// Gradient text: bevy paints glyphs in one flat color, so the gradient is a
// recolor filter over the captured glyphs (directly on the <text>, or on a
// wrapping node when the effect should cover more than the text).
function GradientTextDemo() {
  return (
    <Example
      title="Gradient text"
      info={
        <>
          <Paragraph>
            <InlineCode>gradientMap</InlineCode> recolors the subtree's pixels
            with a multi-stop linear gradient, keeping alpha — put it straight
            on a <InlineCode>{"<text>"}</InlineCode> for gradient type.{" "}
            <InlineCode>angle</InlineCode> matches backgroundGradient; stops
            take optional 0–1 positions and auto-distribute like CSS.{" "}
            <InlineCode>amount</InlineCode> mixes the original color toward the
            gradient (identity is 0, so it fades in transitions).
          </Paragraph>
          <Code lang="tsx">{`<text
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
  Gradient
</text>`}</Code>
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
    <ControlColumn>
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
        name="angle"
        unit="°"
      />
      <Slider
        value={amount}
        min={0}
        max={1}
        onChange={setAmount}
        name="amount"
      />
    </ControlColumn>
  );
}

function OutlineTextDemo() {
  return (
    <Example
      title="Outlined text"
      info={
        <>
          <Paragraph>
            <InlineCode>outline</InlineCode> dilates the subtree's alpha
            silhouette into a colored ring painted under the content — text
            outlines, sticker-style icon rings. <InlineCode>width</InlineCode>{" "}
            is the crisp ring in px; <InlineCode>softness</InlineCode> feathers
            its outer edge and doubles as a glow. Practical text outlines are
            1–6px; the ring bleeds past the border box like blur.
          </Paragraph>
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
  const [{ width, softness, accent }, controls] = useParams(OUTLINE_TEXT);
  return (
    <ControlColumn>
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
      <ParamControls {...controls} />
    </ControlColumn>
  );
}

const OUTLINE_TEXT = {
  width: slider(0, 8, 2, { decimals: 1, unit: "px" }),
  softness: slider(0, 8, 0, { decimals: 1, unit: "px" }),
  accent: checkbox(true, { label: "accent color" }),
};

function DropShadowDemo() {
  return (
    <Example
      title="Drop shadows"
      info={
        <>
          <Paragraph>
            <InlineCode>shadow</InlineCode> is a CSS drop-shadow: the subtree's
            alpha silhouette, tinted <InlineCode>color</InlineCode>, shifted by{" "}
            <InlineCode>offsetX/offsetY</InlineCode>, Gaussian-blurred by{" "}
            <InlineCode>spread</InlineCode>, layered under the content — it
            follows the glyphs' shape, unlike boxShadow's rectangle. Identity is
            a transparent color, so the shadow fades in transitions.
          </Paragraph>
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
  const [params, controls] = useParams(DROP_SHADOW);
  return (
    <ControlColumn>
      <node
        style={{
          filter: { name: "shadow", params: { color: "#000000aa", ...params } },
        }}
      >
        <text style={effectText}>Shadow</text>
      </node>
      <ParamControls {...controls} />
    </ControlColumn>
  );
}

const DROP_SHADOW = {
  offsetX: slider(-12, 12, 0, { unit: "px" }),
  offsetY: slider(-12, 12, 6, { unit: "px" }),
  spread: slider(0, 12, 6, { decimals: 1, unit: "px" }),
};

// The chain card: outline's outset inflates the capture, and the gradient
// must NOT stretch over that ring — gradientMap anchors its line to the node
// rect via the pass uniforms' content inset.
function GradientOutlineDemo() {
  return (
    <Example
      title="Gradient and outline"
      info={
        <>
          <Paragraph>
            The two compose as a chain: gradientMap recolors the glyphs, then
            outline rings the recolored result. The gradient stays locked to the
            text's box even as the outline's width grows the captured area —
            filter shaders see the node rect through the pass uniforms.
          </Paragraph>
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
    <ControlColumn>
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
        name="outline"
        decimals={1}
        unit="px"
      />
    </ControlColumn>
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
