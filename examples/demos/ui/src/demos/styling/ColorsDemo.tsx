import { useState } from "react";
import { BoxLabel, InlineCode, Paragraph } from "@/components/typography";
import { BevyStyle } from "bevy-react/jsx";
import {
  Box,
  ControlColumn,
  DemoRow,
  Example,
  Radio,
  RadioOption,
  Slider,
} from "@/components";
import { Code } from "@/components/docs";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { Colors, Fonts, FontSizes } from "@/theme";
import { useIsMobile } from "@/hooks";

const PAGE: ExplanationData = {
  title: "Colors",
  info: (
    <>
      <Paragraph>
        The color-valued style props: <InlineCode>backgroundColor</InlineCode>{" "}
        fills a node, <InlineCode>borderColor</InlineCode> paints the edge laid
        out by <InlineCode>border</InlineCode>, and{" "}
        <InlineCode>color</InlineCode> sets text color (inheriting into
        bare-string children).
      </Paragraph>
      <Code lang="tsx">{`backgroundColor: "#5cd9ff"
backgroundColor: "tomato"
backgroundColor: "rgb(255 255 255 / 5%)"
backgroundColor: "hsl(140 70% 45%)"
backgroundColor: "oklch(0.7 0.15 30)"`}</Code>
      <Paragraph>
        Any CSS color string works — hex, named colors,{" "}
        <InlineCode>rgb()/hsl()/oklch()</InlineCode>, or{" "}
        <InlineCode>transparent</InlineCode>. An invalid string falls back with
        a devtools warning, never a crash.
      </Paragraph>
    </>
  ),
};

const toHex = (n: number) => Math.round(n).toString(16).padStart(2, "0");

export function ColorsDemo() {
  useDemoPage(PAGE);
  return (
    <>
      <DemoRow>
        <BackgroundColorDemo />
        <BorderColorDemo />
        <TextColorDemo />
      </DemoRow>
      <DemoRow>
        <ColorFormatsDemo />
      </DemoRow>
    </>
  );
}

const COLOR_FORMATS: string[] = [
  "tomato",
  "rgb(92 217 255)",
  "rgb(122, 62, 247)",
  "rgb(255 255 255 / 5%)",
  "hsl(140 70% 45%)",
  "oklch(0.7 0.15 30)",
  "#a88bff",
];

function ColorFormatsDemo() {
  return (
    <Example
      title="Color formats"
      info={
        <>
          <Paragraph>
            One swatch per syntax family — hex, named colors, modern and legacy{" "}
            <InlineCode>rgb()</InlineCode>, <InlineCode>hsl()</InlineCode>,{" "}
            <InlineCode>oklch()</InlineCode>, and percentage alpha.
          </Paragraph>
          <Code lang="tsx">{`<node style={{ backgroundColor: "oklch(0.7 0.15 30)" }} />`}</Code>
        </>
      }
      demo={ColorFormatsCard}
    />
  );
}

function ColorFormatsCard() {
  const isMobile = useIsMobile();

  return (
    <node
      style={{
        gap: 10,
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        ...(isMobile && {
          gridTemplateColumns: "repeat(2, 1fr)",
        }),
      }}
    >
      {COLOR_FORMATS.map((color) => (
        <node
          key={color}
          style={{
            width: 150,
            height: 76,
            borderRadius: 10,
            backgroundColor: color,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BoxLabel style={swatchLabel}>{color}</BoxLabel>
        </node>
      ))}
    </node>
  );
}

function BackgroundColorDemo() {
  return (
    <Example
      title="Background color"
      info={
        <>
          <Paragraph>
            <InlineCode>backgroundColor</InlineCode> fills the node's box. Mix
            it live from R/G/B channels — a plain string prop, cheap to change
            every frame.
          </Paragraph>
          <Code lang="tsx">{`<node style={{ backgroundColor: \`#\${r}\${g}\${b}\` }} />`}</Code>
        </>
      }
      demo={BackgroundColorCard}
    />
  );
}

function BackgroundColorCard() {
  const [r, setR] = useState(122);
  const [g, setG] = useState(162);
  const [b, setB] = useState(247);
  const color = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  return (
    <ControlColumn>
      <Box style={{ width: 110, height: 72, backgroundColor: color }}>
        <BoxLabel style={swatchLabel}>{color}</BoxLabel>
      </Box>

      <Slider value={r} min={0} max={255} onChange={setR} name="R" />
      <Slider value={g} min={0} max={255} onChange={setG} name="G" />
      <Slider value={b} min={0} max={255} onChange={setB} name="B" />
    </ControlColumn>
  );
}

const BORDER_OPTIONS: RadioOption<string>[] = [
  { label: "blue", value: Colors.sky },
  { label: "green", value: Colors.mint },
  { label: "red", value: Colors.rose },
  { label: "purple", value: Colors.violet },
];

function BorderColorDemo() {
  return (
    <Example
      title="Border color"
      info={
        <>
          <Paragraph>
            <InlineCode>border</InlineCode> lays out the edge width;{" "}
            <InlineCode>borderColor</InlineCode> paints it. See the Borders page
            for per-side widths and radius.
          </Paragraph>
          <Code lang="tsx">{`<node style={{ border: 4, borderColor: "#a88bff" }} />`}</Code>
        </>
      }
      demo={BorderColorCard}
    />
  );
}

function BorderColorCard() {
  const [c, setC] = useState<string>(Colors.violet);
  return (
    <ControlColumn>
      <Box
        style={{
          backgroundColor: Colors.card,
          border: 4,
          borderColor: c,
        }}
      />
      <Radio options={BORDER_OPTIONS} value={c} onChange={setC} />
    </ControlColumn>
  );
}

const TEXT_OPTIONS: RadioOption<string>[] = [
  { label: "amber", value: Colors.amber },
  { label: "sky", value: Colors.sky },
  { label: "green", value: Colors.mint },
  { label: "red", value: Colors.rose },
];

function TextColorDemo() {
  return (
    <Example
      title="Text color"
      info={
        <>
          <Paragraph>
            <InlineCode>color</InlineCode> sets the text color. Nested{" "}
            <InlineCode>{"<text>"}</InlineCode> spans can override it for inline
            runs.
          </Paragraph>
          <Code lang="tsx">{`<text style={{ color: "#ffc857" }}>Colored text</text>`}</Code>
        </>
      }
      demo={TextColorCard}
    />
  );
}

function TextColorCard() {
  const [c, setC] = useState<string>(Colors.amber);
  return (
    <ControlColumn>
      <text style={{ ...coloredText, color: c }}>Colored text</text>
      <Radio options={TEXT_OPTIONS} value={c} onChange={setC} />
    </ControlColumn>
  );
}

// A swatch's label is the color value itself, so it takes the mono face.
const swatchLabel: BevyStyle = {
  fontFamily: Fonts.mono,
  fontSize: FontSizes.xxs,
};

const coloredText: BevyStyle = {
  fontFamily: Fonts.display,
  fontSize: FontSizes.xxl,
  fontWeight: "semibold",
};
