import { useEffect, useState } from "react";
import {
  Animated,
  cancelAnimation,
  useSharedValue,
  withRepeat,
  withTiming,
} from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { Button, Checkbox, Example, Slider } from "@/components";
import { Colors, FontSizes } from "@/theme";
import { caption, column, controlColumn } from "./shared";

// `filter` is a chain of named filter passes: one { name, params } entry or an
// ordered array of them (chain order = pass order). Omitted params take the
// filter's CSS-shorthand default ({ name: "grayscale" } is full grayscale).
// Like CSS `filter`, it applies to the node's whole composited subtree: the
// node is promoted to a layer, its contents are captured as one image, and the
// passes run over that image — so a single entry on a parent restyles
// everything inside it (images, text, buttons, nested nodes).
export function FilterDemo() {
  return (
    <>
      <Example
        description="filter applies to the node's whole composited subtree: one
grayscale on the card desaturates the image, text and button as a group — the
classic disabled-card look. Toggle it to promote/demote the layer live; the
button keeps working underneath."
        tsx={`<node style={{ filter: soldOut ? { name: "grayscale" } : [] }}>
  <image src="images/parrot.png" />
  <text>Parrot, deluxe</text>
  <Button>Add to cart</Button>
</node>`}
      >
        <SubtreeFilterControl />
      </Example>

      <Example
        description="An array is a pass chain, run in order: blur first, then
sepia over the blurred result. The capture is reused — dragging the slider
re-runs only the filter passes. Crank the radius and watch the blur bleed
softly past the card's border box."
        tsx={`<node style={{ filter: [
  { name: "blur", params: { radius } },
  { name: "sepia" },
] }}>…</node>`}
      >
        <ChainFilterControl />
      </Example>

      <Example
        description="On a leaf <image> the subtree is just the texture itself —
the smallest layer there is. Drag to blur and desaturate."
        tsx={`<image src="images/parrot.png"
  style={{ filter: [{ name: "blur", params: { radius } },
    { name: "grayscale", params: { amount } }] }} />`}
      >
        <ImageFilterControl />
      </Example>

      <Example
        description="The color-filter vocabulary: brightness, contrast,
saturate, grayscale, sepia, invert, hueRotate. Omitted params take the
CSS-shorthand default — { name: 'sepia' } is the full effect."
        tsx={`<image style={{ filter: { name: "sepia" } }} />`}
      >
        <node style={column}>
          <Swatch label="none" filter={[]} />
          <Swatch label="grayscale" filter={{ name: "grayscale" }} />
          <Swatch label="sepia" filter={{ name: "sepia" }} />
          <Swatch label="invert" filter={{ name: "invert" }} />
          <Swatch
            label="hue 120°"
            filter={{ name: "hueRotate", params: { angle: 120 } }}
          />
        </node>
      </Example>

      <Example
        description="Filters don't need a texture: on a plain colored node,
hueRotate spins the background color. Drag to rotate."
        tsx={`<node style={{ backgroundColor: "#f7768e",
  filter: { name: "hueRotate", params: { angle: 180 } } }} />`}
      >
        <NodeFilterControl />
      </Example>

      <Example
        description="transition: { filter } eases the chain between style
states — with one sharp edge: easing to an EMPTY chain snaps, because the
resolved chain detaches and the fade has nothing left to write into. The
two-way pattern (left card): keep an identity pass in the BASE style — blur
radius 0 — and put the real value in hoverStyle. Same-name chains interpolate
their params, so hover-on AND hover-off both ease; the cost is a resident
identity pass running at rest. The right card has an empty base instead:
hover fades in (the added blur is identity-extended), but un-hover snaps
back. (Both cards stay promoted at rest — a hover filter promotes eagerly so
the layer is ready before the first hover.)"
        tsx={`// fades both ways: identity blur in the base style
<node
  style={{ filter: [{ name: "blur", params: { radius: 0 } }],
    transition: { filter: { duration: 250, easing: "easeOut" } } }}
  hoverStyle={{ filter: [{ name: "blur", params: { radius: 6 } }] }} />

// empty base: fades IN, but un-hover eases to [] → snap
<node
  style={{ filter: [],
    transition: { filter: { duration: 250, easing: "easeOut" } } }}
  hoverStyle={{ filter: [{ name: "blur", params: { radius: 6 } }] }} />`}
      >
        <HoverFadeControl />
      </Example>

      <Example
        description="animatedStyle reaches into the chain: filter[0].radius
binds blur's radius (chain entry 0) to a shared value, evaluated every frame
on the Bevy side — a focus pulse with zero React re-renders. The subtree is
captured once; each frame only the blur pass re-runs with the new radius.
Wire units are the param's own: logical px for lengths, degrees for angles."
        tsx={`const radius = useSharedValue(0);
radius.value = withRepeat(
  withTiming(7, { duration: 900, easing: "easeInOut" }),
  -1, true);

<Animated.image src="images/parrot.png"
  style={{ filter: [{ name: "blur", params: { radius: 0 } }] }}
  animatedStyle={{ "filter[0].radius": radius }} />`}
      >
        <FocusPulseControl />
      </Example>
    </>
  );
}

// The two-way-fade lesson, side by side: identity-in-base eases both ways;
// empty base fades in but snaps out.
function HoverFadeControl() {
  return (
    <node style={{ flexDirection: "row", gap: 16 }}>
      <node
        style={{
          ...hoverCard,
          filter: [{ name: "blur", params: { radius: 0 } }],
          transition: { filter: { duration: 250, easing: "easeOut" } },
        }}
        hoverStyle={{ filter: [{ name: "blur", params: { radius: 6 } }] }}
      >
        <image
          src="images/parrot.png"
          style={{ width: 110, borderRadius: 8 }}
        />
        <text style={caption}>fades both ways</text>
      </node>
      <node
        style={{
          ...hoverCard,
          filter: [],
          transition: { filter: { duration: 250, easing: "easeOut" } },
        }}
        hoverStyle={{ filter: [{ name: "blur", params: { radius: 6 } }] }}
      >
        <image
          src="images/parrot.png"
          style={{ width: 110, borderRadius: 8 }}
        />
        <text style={caption}>fades in, snaps out</text>
      </node>
    </node>
  );
}

// An endless ping-pong on one filter param. The repeat starts on mount and is
// cancelled on unmount; the driver lives Bevy-side, so no renders happen here.
function FocusPulseControl() {
  const radius = useSharedValue(0);
  useEffect(() => {
    radius.value = withRepeat(
      withTiming(7, { duration: 900, easing: "easeInOut" }),
      -1,
      true,
    );
    return () => cancelAnimation(radius);
  }, [radius]);
  return (
    <node style={controlColumn}>
      <Animated.image
        src="images/parrot.png"
        style={{
          width: 150,
          filter: [{ name: "blur", params: { radius: 0 } }],
        }}
        animatedStyle={{ "filter[0].radius": radius }}
      />
      <text style={caption}>breathing focus — hands off, Bevy drives it</text>
    </node>
  );
}

// The headline: mixed content (image + text + interactive button) filtered as
// one group by a single `filter` on the parent card.
function SubtreeFilterControl() {
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
        <image
          src="images/parrot.png"
          style={{ width: 130, borderRadius: 8 }}
        />
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

// A two-pass chain over a subtree; the slider lives outside the filtered card
// so only the "photograph" blurs.
function ChainFilterControl() {
  const [radius, setRadius] = useState(8);
  return (
    <node style={controlColumn}>
      <node
        style={{
          ...productCard,
          backgroundColor: Colors.surface500,
          filter: [{ name: "blur", params: { radius } }, { name: "sepia" }],
        }}
      >
        <image
          src="images/parrot.png"
          style={{ width: 130, borderRadius: 8 }}
        />
        <text style={cardTitle}>Old photograph</text>
      </node>
      <Slider
        value={radius}
        min={0}
        max={24}
        onChange={setRadius}
        label={`blur ${radius.toFixed(1)}px`}
      />
    </node>
  );
}

function ImageFilterControl() {
  const [blur, setBlur] = useState(3);
  const [grayscale, setGrayscale] = useState(1);
  return (
    <node style={controlColumn}>
      <image
        src="images/parrot.png"
        style={{
          width: 150,
          filter: [
            { name: "blur", params: { radius: blur } },
            { name: "grayscale", params: { amount: grayscale } },
          ],
        }}
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
  const [hue, setHue] = useState(180);
  return (
    <node style={controlColumn}>
      <node
        style={{
          width: 150,
          height: 90,
          borderRadius: 12,
          backgroundColor: Colors.red100,
          filter: { name: "hueRotate", params: { angle: hue } },
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

const hoverCard: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
  padding: 12,
  borderRadius: 12,
  backgroundColor: Colors.surface300,
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
