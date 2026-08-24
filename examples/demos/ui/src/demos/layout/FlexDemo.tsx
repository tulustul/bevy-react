import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { DemoRow, Example, Radio, RadioOption } from "@/components";
import { Code, InlineCode, P } from "@/components/docs";
import { Colors, Gradients } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

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

type FlexDirection = Required<BevyStyle>["flexDirection"];
type JustifyContent = Required<BevyStyle>["justifyContent"];
type AlignItems = Required<BevyStyle>["alignItems"];

const DIRECTION_OPTIONS: RadioOption<FlexDirection>[] = [
  { label: "row", value: "row" },
  { label: "rowReverse", value: "rowReverse" },
  { label: "column", value: "column" },
];

// `start`/`end` are physical (writing-direction relative); `flexStart`/`flexEnd`
// follow `flexDirection`. They diverge under `rowReverse` — pick it above to see
// `start` (visually left) part ways from `flexStart` (the reversed flow start).
const JUSTIFY_OPTIONS: RadioOption<JustifyContent>[] = [
  { label: "center", value: "center" },
  { label: "start", value: "start" },
  { label: "flexStart", value: "flexStart" },
  { label: "flexEnd", value: "flexEnd" },
  { label: "spaceBetween", value: "spaceBetween" },
];

const ALIGN_OPTIONS: RadioOption<AlignItems>[] = [
  { label: "center", value: "center" },
  { label: "start", value: "start" },
  { label: "flexStart", value: "flexStart" },
  { label: "flexEnd", value: "flexEnd" },
  { label: "stretch", value: "stretch" },
];

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

function Swatches({ count = 4 }: { count?: number }) {
  return (
    <>
      {SWATCHES.slice(0, count).map((g, i) => (
        <node key={i} style={{ ...swatch, backgroundGradient: g }} />
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

  return (
    <node style={{ flexDirection: "column", gap: 12, alignItems: "center" }}>
      <node
        style={{ ...playground, flexDirection, justifyContent, alignItems }}
      >
        <Swatches />
      </node>

      <Radio
        options={DIRECTION_OPTIONS}
        value={flexDirection}
        onChange={setFlexDirection}
      />
      <Radio
        options={JUSTIFY_OPTIONS}
        value={justifyContent}
        onChange={setJustifyContent}
      />
      <Radio
        options={ALIGN_OPTIONS}
        value={alignItems}
        onChange={setAlignItems}
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
            ...swatch,
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
      <node style={{ ...swatch, backgroundGradient: SWATCHES[0] }} />
      <node style={{ ...grow, backgroundGradient: SWATCHES[1] }} />
      <node style={{ ...swatch, backgroundGradient: SWATCHES[2] }} />
    </node>
  );
}

const playground: BevyStyle = {
  width: 320,
  height: 160,
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
  width: 40,
  height: 40,
  borderRadius: 8,
};

const grow: BevyStyle = {
  flexGrow: 1,
  height: 40,
  borderRadius: 8,
};
