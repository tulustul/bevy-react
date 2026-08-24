import { useState } from "react";
import { DemoRow, Example, Slider } from "@/components";
import { B, Code, InlineCode, Li, P, Ul } from "@/components/docs";
import { Colors, FontSizes } from "@/theme";
import { controlColumn } from "./shared";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

const PAGE: ExplanationData = {
  title: "Backdrop filters",
  info: (
    <>
      <P>
        <InlineCode>backdropFilter</InlineCode> takes the same{" "}
        <InlineCode>{"{ name, params }"}</InlineCode> chains as{" "}
        <InlineCode>filter</InlineCode>, but filters what is rendered{" "}
        <B>behind</B> the node and composites the result under the node's own
        background — a semi-transparent background over it is the classic
        frosted-glass card:
      </P>
      <Code lang="tsx">{`<node
  style={{
    backgroundColor: "rgba(26, 27, 38, 0.35)",
    backdropFilter: { name: "blur", params: { radius: 8 } },
  }}
>
  <text>frosted glass</text>
</node>`}</Code>
      <Ul>
        <Li>
          The backdrop source is currently the camera's post-processed 3D frame
          — UI painted beneath the node is not included.
        </Li>
        <Li>
          The frosted quad covers the node's border box and respects{" "}
          <InlineCode>borderRadius</InlineCode>.
        </Li>
        <Li>
          The backdrop is live, so its passes re-run every frame; the node's own
          content still caches.
        </Li>
        <Li>
          Transitions and {"{ animated }"} param wrappers mirror{" "}
          <InlineCode>filter</InlineCode>, including the snap when easing to an
          empty chain on removal.
        </Li>
      </Ul>
    </>
  ),
};

export function BackdropFilterDemo() {
  useDemoPage(PAGE);
  return (
    <>
      <DemoRow>
        <GlassCardDemo />
        <HueDemo />
      </DemoRow>

      <DemoRow>
        <BothChainsDemo />
        <CustomFilterDemo />
      </DemoRow>
    </>
  );
}

const glass = {
  width: 300,
  height: 200,
  borderRadius: 12,
  justifyContent: "center" as const,
  alignItems: "center" as const,
  gap: 6,
  backgroundColor: "rgba(26, 27, 38, 0.35)",
};

function GlassCardDemo() {
  return (
    <Example
      title="Blurred backdrop"
      info={
        <>
          <P>
            A semi-transparent panel with a <InlineCode>blur</InlineCode>{" "}
            backdrop is the classic glass card: the moving cubes stay readable
            as soft shapes behind it. Drag the radius — only the backdrop passes
            re-run; the panel's own content never re-captures. The frost
            respects <InlineCode>borderRadius</InlineCode>: it is masked to the
            panel's rounded border box with the same antialiased edge the
            background paints.
          </P>
          <Code lang="tsx">{`<node
  style={{
    backgroundColor: "rgba(26, 27, 38, 0.35)",
    backdropFilter: { name: "blur", params: { radius: 8 } },
  }}
>
  <text>frosted glass</text>
</node>`}</Code>
        </>
      }
      demo={GlassCard}
    />
  );
}

function GlassCard() {
  const [radius, setRadius] = useState(40);
  return (
    <node style={controlColumn}>
      <node
        style={{
          ...glass,
          backdropFilter: { name: "blur", params: { radius } },
        }}
      >
        <text
          style={{
            color: Colors.textColor100,
            fontSize: FontSizes.xl,
            fontWeight: "bold",
          }}
        >
          FROSTED GLASS
        </text>
      </node>
      <Slider
        value={radius}
        min={0}
        max={50}
        onChange={setRadius}
        label={`radius ${radius.toFixed(1)}px`}
      />
    </node>
  );
}

function HueDemo() {
  return (
    <Example
      title="Hue rotation"
      info={
        <>
          <P>
            Any built-in works on the backdrop: here{" "}
            <InlineCode>hueRotate</InlineCode> recolors the scene behind the
            panel while the UI in front keeps its colors. Drag the slider to
            spin the hue.
          </P>
          <Code lang="tsx">{`<node
  style={{
    backdropFilter: [{ name: "hueRotate", params: { angle } }],
  }}
>
  …
</node>`}</Code>
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
      <node
        style={{
          ...glass,
          backdropFilter: [{ name: "hueRotate", params: { angle: hue } }],
        }}
      ></node>
      <Slider
        value={hue}
        min={0}
        max={360}
        onChange={setHue}
        label={`hue ${hue.toFixed(1)}`}
      />
    </node>
  );
}

function BothChainsDemo() {
  return (
    <Example
      title="Filter and backdrop filter"
      info={
        <>
          <P>
            <InlineCode>backdropFilter</InlineCode> and{" "}
            <InlineCode>filter</InlineCode> are independent chains on one node:
            the backdrop blurs the scene while the content chain (ripple +
            chromaticAberration) warps and fringes the panel's own children.
            Each resolves, transitions, and animates on its own.
          </P>
          <Code lang="tsx">{`<node
  style={{
    backdropFilter: { name: "blur", params: { radius: 20 } },
    filter: [
      {
        name: "ripple",
        params: { amplitude: 2, frequency: 30, speed: 2 },
      },
      { name: "chromaticAberration" },
    ],
  }}
>
  …
</node>`}</Code>
        </>
      }
      demo={BothChainsCard}
    />
  );
}

function BothChainsCard() {
  return (
    <node style={controlColumn}>
      <node
        style={{
          ...glass,
          backdropFilter: { name: "blur", params: { radius: 20 } },
          filter: [
            {
              name: "ripple",
              params: { amplitude: 2, frequency: 30, speed: 2 },
            },
            {
              name: "chromaticAberration",
              params: { rotation: 1 },
            },
          ],
        }}
      >
        <text
          style={{
            color: Colors.textColor100,
            fontSize: FontSizes.xl,
            fontWeight: "bold",
          }}
        >
          FILTERED CONTENT
        </text>
      </node>
    </node>
  );
}

function CustomFilterDemo() {
  return (
    <Example
      title="Custom backdrop filters"
      info={
        <>
          <P>
            Custom <InlineCode>#[react_filter]</InlineCode>s run on the backdrop
            unchanged — this glass warps, fringes, and glitches the scene behind
            it (ripple + chromaticAberration + glitch).
          </P>
          <Code lang="tsx">{`<node
  style={{
    backdropFilter: [
      {
        name: "ripple",
        params: { amplitude: 5, frequency: 12, speed: 2 },
      },
      { name: "chromaticAberration", params: { offset: 5, angle: 0 } },
      { name: "glitch", params: { intensity: 0.5 } },
    ],
  }}
/>`}</Code>
        </>
      }
      demo={CustomFilterCard}
    />
  );
}

function CustomFilterCard() {
  return (
    <node
      style={{
        ...glass,
        backdropFilter: [
          {
            name: "ripple",
            params: { amplitude: 5, frequency: 12, speed: 2 },
          },
          { name: "chromaticAberration", params: { offset: 5, angle: 0 } },
          { name: "glitch", params: { intensity: 0.5 } },
        ],
      }}
    ></node>
  );
}
