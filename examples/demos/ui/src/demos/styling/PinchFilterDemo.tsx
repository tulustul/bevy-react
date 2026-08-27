import { CardTitle, InlineCode, Paragraph } from "@/components/typography";
import {
  Example,
  ParamControls,
  ProductCard,
  slider,
  useParams,
} from "@/components";
import { Code } from "@/components/docs";

export function PinchDemo() {
  return (
    <Example
      title="Pinch"
      info={
        <>
          <Paragraph>
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
          </Paragraph>
          <Paragraph>
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
          </Paragraph>
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
  const [params, controls] = useParams(PINCH);
  return (
    <>
      <ProductCard style={{ filter: { name: "pinch", params } }}>
        <image
          src="images/parrot.png"
          style={{ width: 130, borderRadius: 8 }}
        />
        <CardTitle>Squeezed!</CardTitle>
      </ProductCard>
      <ParamControls {...controls} />
    </>
  );
}

const PINCH = {
  x: slider(0, 1, 0.5),
  y: slider(0, 1, 0.5),
  strength: slider(-1, 1, 0.8),
  radius: slider(0, 1, 0.3),
  light: slider(0, 1, 0.65),
  lightAngle: slider(-180, 180, -90, { unit: "\u00b0" }),
  gloss: slider(0, 1, 0.7),
  glossSize: slider(0, 1, 0.1),
  outerSoftness: slider(0, 1, 0.4),
  innerSoftness: slider(0, 1, 0.3),
};
