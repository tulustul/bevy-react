import { useMemo, useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Checkbox, DemoRow, Example, Radio, RadioOption } from "@/components";
import { Code, InlineCode, P } from "@/components/docs";
import { Colors, Gradients } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import {
  AlignIcon,
  DirectionIcon,
  JustifyIcon,
  type AlignItems,
  type FlexDirection,
  type JustifyContent,
} from "./flexIcons";

// `<node>` is a flexbox container by default. These snippets show the main flex
// knobs; see Layout → Grid for `display: "grid"`.

const PAGE: ExplanationData = {
  title: "Flexbox",
  info: (
    <>
      <P>
        A <InlineCode>{"<node>"}</InlineCode> is a flexbox container by default
        — no display property needed. <InlineCode>flexDirection</InlineCode>,{" "}
        <InlineCode>justifyContent</InlineCode>, and{" "}
        <InlineCode>alignItems</InlineCode> are the main knobs;{" "}
        <InlineCode>gap</InlineCode> spaces children.
      </P>
      <Code lang="tsx">{`<node style={{ flexDirection: "row", justifyContent: "center", gap: 10 }}>
  <node style={{ width: 40, height: 40 }} />
  <node style={{ width: 40, height: 40 }} />
</node>`}</Code>
      <P>
        One naming subtlety: <InlineCode>"start"</InlineCode>/
        <InlineCode>"end"</InlineCode> are physical (writing-direction relative)
        while <InlineCode>"flexStart"</InlineCode>/
        <InlineCode>"flexEnd"</InlineCode> follow{" "}
        <InlineCode>flexDirection</InlineCode> — they diverge under{" "}
        <InlineCode>"rowReverse"</InlineCode>. For grid layout, see the Grid
        page.
      </P>
    </>
  ),
};

const SWATCHES = Gradients.spectrum;

// The knob types come from the icon module: the subsets of bevy's unions the
// playground offers (it skips the physical `start`/`end`, which the info
// panel explains instead).
const DIRECTIONS: FlexDirection[] = [
  "row",
  "rowReverse",
  "column",
  "columnReverse",
];

// `start`/`end` are physical (writing-direction relative); `flexStart`/`flexEnd`
// follow `flexDirection`. They diverge under `rowReverse` — pick it above to see
// `start` (visually left) part ways from `flexStart` (the reversed flow start).
const JUSTIFIES: JustifyContent[] = [
  "center",
  "flexStart",
  "flexEnd",
  "spaceBetween",
  "spaceEvenly",
  "spaceAround",
];

const ALIGNS: AlignItems[] = [
  "baseline",
  "center",
  "flexStart",
  "flexEnd",
  "stretch",
];

// The pills are icon-only: each label is a render function so the glyph can
// tint with the pill's selection, and the justify/align glyphs rotate with the
// active direction (their axis depends on it), hence the rebuild per direction.
function useFlexOptions(direction: FlexDirection) {
  return useMemo(() => {
    const directions: RadioOption<FlexDirection>[] = DIRECTIONS.map((d) => ({
      value: d,
      label: ({ selected }) => (
        <DirectionIcon selected={selected} direction={d} />
      ),
    }));
    const justifies: RadioOption<JustifyContent>[] = JUSTIFIES.map((j) => ({
      value: j,
      label: ({ selected }) => (
        <JustifyIcon value={j} selected={selected} direction={direction} />
      ),
    }));
    const aligns: RadioOption<AlignItems>[] = ALIGNS.map((a) => ({
      value: a,
      label: ({ selected }) => (
        <AlignIcon value={a} selected={selected} direction={direction} />
      ),
    }));
    return { directions, justifies, aligns };
  }, [direction]);
}

export function FlexDemo() {
  useDemoPage(PAGE);
  return (
    <>
      <DemoRow>
        <FlexPlaygroundDemo />
      </DemoRow>

      <DemoRow>
        <FlexWrapDemo />
        <FlexGrowDemo />
      </DemoRow>
    </>
  );
}

// `animate` toggles `transition: { layout }`: with it, every rearrangement
// eases the swatches to their new slots instead of snapping.
function Swatches({
  count = 4,
  animate = true,
}: {
  count?: number;
  animate?: boolean;
}) {
  return (
    <>
      {SWATCHES.slice(0, count).map((g, i) => (
        <node
          key={i}
          style={{
            ...(animate ? animatedSwatch : swatch),
            backgroundGradient: g,
          }}
        />
      ))}
    </>
  );
}

// An interactive container: flip the three main flex knobs and watch the swatches
// rearrange live.
function FlexPlaygroundDemo() {
  return (
    <Example
      title="Flexbox playground"
      info={
        <>
          <P>
            Flip the three main flex knobs live and watch the swatches
            rearrange. Try <InlineCode>rowReverse</InlineCode> and compare{" "}
            <InlineCode>start</InlineCode> vs <InlineCode>flexStart</InlineCode>{" "}
            — physical vs flow-relative.
          </P>
          <Code lang="tsx">{`<node style={{ flexDirection, justifyContent, alignItems }}>
  {swatches}
</node>`}</Code>
          <P>
            The swatches carry{" "}
            <InlineCode>{"transition: { layout }"}</InlineCode>, so each
            rearrangement eases them to their new slots (FLIP) — untick the box
            to see the snap.
          </P>
        </>
      }
      demo={FlexPlaygroundCard}
    />
  );
}

function FlexPlaygroundCard() {
  const [flexDirection, setFlexDirection] = useState<FlexDirection>("row");
  const [justifyContent, setJustifyContent] =
    useState<JustifyContent>("center");
  const [alignItems, setAlignItems] = useState<AlignItems>("center");
  const [animate, setAnimate] = useState(true);
  const options = useFlexOptions(flexDirection);

  return (
    <node style={{ flexDirection: "column", gap: 12, alignItems: "center" }}>
      <node
        style={{ ...playground, flexDirection, justifyContent, alignItems }}
      >
        <Swatches animate={animate} />
      </node>

      <Radio
        pinch={{ radius: 0.7 }}
        options={options.directions}
        value={flexDirection}
        onChange={setFlexDirection}
      />
      <Radio
        pinch={{ radius: 0.7 }}
        options={options.justifies}
        value={justifyContent}
        onChange={setJustifyContent}
      />
      <Radio
        pinch={{ radius: 0.7 }}
        options={options.aligns}
        value={alignItems}
        onChange={setAlignItems}
      />

      <node
        style={{
          flexDirection: "column",
          gap: 10,
          padding: 12,
          backgroundColor: Colors.surface100,
          borderRadius: 12,
        }}
      >
        <InlineCode>{`flexDirection: ${flexDirection}`}</InlineCode>
        <InlineCode>{`justifyContent: ${justifyContent}`}</InlineCode>
        <InlineCode>{`alignItems: ${alignItems}`}</InlineCode>
      </node>

      <Checkbox
        label="Animate layout changes"
        enabled={animate}
        onChange={setAnimate}
      />
    </node>
  );
}

function FlexWrapDemo() {
  return (
    <Example
      title="Wrapping"
      info={
        <>
          <P>
            <InlineCode>flexWrap: "wrap"</InlineCode> pushes overflowing
            children onto the next line instead of squeezing them — eight
            fixed-size swatches in a narrow container become a 3-row grid.
          </P>
          <Code lang="tsx">{`<node style={{ width: 152, flexWrap: "wrap", gap: 8 }}>
  {swatches}
</node>`}</Code>
        </>
      }
      demo={FlexWrapCard}
    />
  );
}

function FlexWrapCard() {
  return (
    <node style={{ ...frame, width: 152, flexWrap: "wrap", gap: 8 }}>
      {Array.from({ length: 8 }, (_, i) => (
        <node
          key={i}
          style={{
            ...animatedSwatch,
            backgroundGradient: SWATCHES[i % SWATCHES.length],
          }}
        />
      ))}
    </node>
  );
}

function FlexGrowDemo() {
  return (
    <Example
      title="Growing to fill"
      info={
        <>
          <P>
            <InlineCode>flexGrow: 1</InlineCode> lets a child absorb the
            remaining space — the middle swatch stretches while its fixed-size
            siblings keep their width.
          </P>
          <Code lang="tsx">{`<node style={{ width: 260, gap: 8 }}>
  <node style={{ width: 40 }} />
  <node style={{ flexGrow: 1 }} />
  <node style={{ width: 40 }} />
</node>`}</Code>
        </>
      }
      demo={FlexGrowCard}
    />
  );
}

function FlexGrowCard() {
  return (
    <node style={{ ...frame, width: 260, gap: 8 }}>
      <node style={{ ...animatedSwatch, backgroundGradient: SWATCHES[0] }} />
      <node style={{ ...grow, backgroundGradient: SWATCHES[1] }} />
      <node style={{ ...animatedSwatch, backgroundGradient: SWATCHES[2] }} />
    </node>
  );
}

const playground: BevyStyle = {
  width: 350,
  height: 350,
  gap: 10,
  padding: 12,
  backgroundColor: Colors.surface100,
  borderRadius: 12,
};

const frame: BevyStyle = {
  alignItems: "center",
  padding: 12,
  backgroundColor: Colors.surface100,
  borderRadius: 12,
};

const swatch: BevyStyle = {
  minWidth: 40,
  minHeight: 40,
  borderRadius: 8,
};

// The page's swatches ease to their new slots (FLIP); the playground's
// checkbox swaps back to the plain `swatch`. The Wrapping and Growing
// cards are static, so there it only ever shows on a window resize.
const animatedSwatch: BevyStyle = {
  ...swatch,
  transition: { layout: { duration: 350, easing: "easeInOut" } },
};

const grow: BevyStyle = {
  flexGrow: 1,
  height: 40,
  borderRadius: 8,
};
