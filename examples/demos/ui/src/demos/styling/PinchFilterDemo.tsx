import { useState } from "react";
import { Example, Slider } from "@/components";
import { Code, InlineCode, P } from "@/components/docs";
import { cardTitle, productCard } from "./shared";

export function PinchDemo() {
  return (
    <Example
      title="Pinch"
      info={
        <>
          <P>
            <InlineCode>pinch</InlineCode> radially squeezes the content toward
            a point (or bulges it away at negative strength). Every param is
            normalized — <InlineCode>x</InlineCode>/<InlineCode>y</InlineCode>{" "}
            are 0..1 across the node, <InlineCode>radius</InlineCode> a fraction
            of its larger dimension — exactly what pointer events deliver, so
            the effect anchors to the cursor with zero px math. The gallery's{" "}
            <InlineCode>{"<Pinchable>"}</InlineCode> wrapper presses every
            button and nav item through it: strength animates in on pointer-down
            and springs back (with a bulge wobble) on release, pinched at the
            click point and following the cursor while you drag pressed. A bulge
            displacing past the 16px outset clips at the layer edge.
          </P>
          <P>
            <InlineCode>light</InlineCode> shades the pinch as a lit surface —
            the displacement curve doubles as a height field, so a dent and a
            bulge light oppositely — from <InlineCode>lightAngle</InlineCode>{" "}
            (degrees clockwise from +X, where the light comes from; -135 is
            top-left). <InlineCode>gloss</InlineCode> adds a white specular
            highlight, <InlineCode>glossSize</InlineCode> its size (0 a
            pinpoint, 1 a broad sheen). Both default to 0, and a flat pinch
            (strength 0) shades nothing. <InlineCode>outerSoftness</InlineCode>{" "}
            sets how the effect meets its rim (0 a linear crease, 0.5 the
            classic fade, 1 imperceptible) and{" "}
            <InlineCode>innerSoftness</InlineCode> how it peaks at the center (0
            a cone tip, 0.5 a rounded bowl, 1 a flat floor) — independently,
            with no seam between them.
          </P>
          <Code lang="tsx">{`<node
  style={{
    filter: {
      name: "pinch",
      params: {
        x, y,          // 0..1
        strength,      // -1..1
        radius,        // × size
        light,         // 0..1
        lightAngle,    // deg
        gloss,         // 0..1
        glossSize,     // 0..1
        outerSoftness, // 0..1
        innerSoftness, // 0..1
      },
    },
  }}
>
  …
</node>`}</Code>
        </>
      }
      demo={PinchCard}
    />
  );
}

function PinchCard() {
  const [x, setX] = useState(0.5);
  const [y, setY] = useState(0.5);
  const [strength, setStrength] = useState(0.8);
  const [radius, setRadius] = useState(0.3);
  const [light, setLight] = useState(0.65);
  const [lightAngle, setLightAngle] = useState(-90);
  const [gloss, setGloss] = useState(0.7);
  const [glossSize, setGlossSize] = useState(0.1);
  const [outerSoftness, setOuterSoftness] = useState(0.4);
  const [innerSoftness, setInnerSoftness] = useState(0.3);
  return (
    <>
      <node
        style={{
          ...productCard,
          filter: {
            name: "pinch",
            params: {
              x,
              y,
              strength,
              radius,
              light,
              lightAngle,
              gloss,
              glossSize,
              outerSoftness,
              innerSoftness,
            },
          },
        }}
      >
        <image
          src="images/parrot.png"
          style={{ width: 130, borderRadius: 8 }}
        />
        <text style={cardTitle}>Squeezed!</text>
      </node>
      <Slider
        value={x}
        min={0}
        max={1}
        onChange={setX}
        label={`x ${x.toFixed(2)}`}
      />
      <Slider
        value={y}
        min={0}
        max={1}
        onChange={setY}
        label={`y ${y.toFixed(2)}`}
      />
      <Slider
        value={strength}
        min={-1}
        max={1}
        onChange={setStrength}
        label={`strength ${strength.toFixed(2)}`}
      />
      <Slider
        value={radius}
        min={0}
        max={1}
        onChange={setRadius}
        label={`radius ${radius.toFixed(2)}`}
      />
      <Slider
        value={light}
        min={0}
        max={1}
        onChange={setLight}
        label={`light ${light.toFixed(2)}`}
      />
      <Slider
        value={lightAngle}
        min={-180}
        max={180}
        onChange={setLightAngle}
        label={`lightAngle ${lightAngle.toFixed(0)}°`}
      />
      <Slider
        value={gloss}
        min={0}
        max={1}
        onChange={setGloss}
        label={`gloss ${gloss.toFixed(2)}`}
      />
      <Slider
        value={glossSize}
        min={0}
        max={1}
        onChange={setGlossSize}
        label={`glossSize ${glossSize.toFixed(2)}`}
      />
      <Slider
        value={outerSoftness}
        min={0}
        max={1}
        onChange={setOuterSoftness}
        label={`outerSoftness ${outerSoftness.toFixed(2)}`}
      />
      <Slider
        value={innerSoftness}
        min={0}
        max={1}
        onChange={setInnerSoftness}
        label={`innerSoftness ${innerSoftness.toFixed(2)}`}
      />
    </>
  );
}
