import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Button, DemoRow, Example, TextMono } from "@/components";
import { Code, InlineCode, Li, P, Ul } from "@/components/docs";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { Colors } from "@/theme";
import { box, caption, row, stage } from "./shared";

const PAGE: ExplanationData = {
  title: "Units",
  info: (
    <>
      <P>
        Style values accept units. A bare number picks a sensible default per
        field — px for lengths and font sizes, degrees for angles, milliseconds
        for durations. Strings carry an explicit unit:
      </P>
      <Code lang="tsx">{`width: 80            // px
width: "50%"         // of the parent
width: "10vw"        // of the viewport
fontSize: "1.5rem"   // of Bevy's RemSize (default 20px)
rotate: "0.25turn"   // deg / rad / turn / grad
duration: "0.3s"     // ms / s`}</Code>
      <Ul>
        <Li>Lengths: px, %, vw/vh/vmin/vmax, auto.</Li>
        <Li>fontSize adds rem.</Li>
        <Li>Angles: deg (bare-number default), rad, turn, grad.</Li>
        <Li>Time: ms (bare-number default), s.</Li>
      </Ul>
    </>
  ),
};

export function UnitsDemo() {
  useDemoPage(PAGE);
  return (
    <>
      <DemoRow>
        <LengthDemo />
        <FontSizeDemo />
      </DemoRow>
      <DemoRow>
        <AngleDemo />
        <TimeDemo />
      </DemoRow>
    </>
  );
}

const LENGTHS = ["80px", "50%", "10vw"];

function LengthDemo() {
  return (
    <Example
      title="Lengths"
      info={
        <>
          <P>
            A bare number is px; strings carry a unit.{" "}
            <InlineCode>%</InlineCode> is relative to the parent,{" "}
            <InlineCode>vw/vh/vmin/vmax</InlineCode> to the viewport, plus{" "}
            <InlineCode>auto</InlineCode>. Resize the window and the vw bar
            follows it.
          </P>
          <Code lang="tsx">{`<node style={{ width: "80px" }} />
<node style={{ width: "50%" }} />
<node style={{ width: "10vw" }} />`}</Code>
        </>
      }
      demo={LengthCard}
    />
  );
}

function LengthCard() {
  return (
    <node style={{ flexDirection: "column", gap: 10, width: 360 }}>
      {LENGTHS.map((w) => (
        <node key={w} style={{ flexDirection: "column", gap: 4 }}>
          <TextMono style={caption}>{w}</TextMono>
          <node
            style={{
              width: w,
              height: 28,
              borderRadius: 6,
              backgroundColor: Colors.primary100,
            }}
          />
        </node>
      ))}
    </node>
  );
}

const FONT_SIZES = ["14px", "1.5rem", "2vw"];

function FontSizeDemo() {
  return (
    <Example
      title="Font sizes"
      info={
        <>
          <P>
            Font size takes px, viewport units, or <InlineCode>rem</InlineCode>{" "}
            — relative to Bevy's <InlineCode>RemSize</InlineCode> resource
            (default 20px), the knob for app-wide text scaling.
          </P>
          <Code lang="tsx">{`<text style={{ fontSize: "14px" }} />
<text style={{ fontSize: "1.5rem" }} />
<text style={{ fontSize: "2vw" }} />`}</Code>
        </>
      }
      demo={FontSizeCard}
    />
  );
}

function FontSizeCard() {
  return (
    <node style={{ flexDirection: "column", gap: 12 }}>
      {FONT_SIZES.map((size) => (
        <node
          key={size}
          style={{ flexDirection: "row", alignItems: "center", gap: 14 }}
        >
          <node style={{ width: 90 }}>
            <TextMono style={caption}>{size}</TextMono>
          </node>
          <text
            style={{
              fontSize: size,
              color: Colors.textColor100,
              fontWeight: "bold",
            }}
          >
            Aa Bb Cc
          </text>
        </node>
      ))}
    </node>
  );
}

const ANGLES = ["45deg", "0.785rad", "0.125turn", "50grad"];

function AngleDemo() {
  return (
    <Example
      title="Angles"
      info={
        <>
          <P>
            A bare number is degrees; strings carry{" "}
            <InlineCode>deg/rad/turn/grad</InlineCode>. These four boxes are the
            same 45° written four ways.
          </P>
          <Code lang="tsx">{`transform: { rotate: "45deg" }     // = 45
transform: { rotate: "0.785rad" }
transform: { rotate: "0.125turn" }
transform: { rotate: "50grad" }`}</Code>
        </>
      }
      demo={AngleCard}
    />
  );
}

function AngleCard() {
  return (
    <node style={{ ...row, gap: 24 }}>
      {ANGLES.map((angle) => (
        <node
          key={angle}
          style={{ flexDirection: "column", alignItems: "center", gap: 10 }}
        >
          <node style={stage}>
            <node
              style={{
                ...box,
                width: 48,
                height: 48,
                backgroundColor: Colors.purple100,
                transform: { rotate: angle },
              }}
            />
          </node>
          <TextMono style={caption}>{angle}</TextMono>
        </node>
      ))}
    </node>
  );
}

function TimeDemo() {
  return (
    <Example
      title="Durations"
      info={
        <>
          <P>
            A bare number is milliseconds; strings carry{" "}
            <InlineCode>ms/s</InlineCode>. Both boxes ease identically — click
            either to toggle.
          </P>
          <Code lang="tsx">{`transition: { transform: { duration: "300ms" } }
transition: { transform: { duration: "0.3s" } } // the same`}</Code>
        </>
      }
      demo={TimeCard}
    />
  );
}

function TimeCard() {
  const [on, setOn] = useState(false);

  return (
    <node style={{ ...row, gap: 20 }}>
      <TimeBox
        label="300ms"
        duration="300ms"
        on={on}
        onToggle={() => setOn((v) => !v)}
      />
      <TimeBox
        label="0.3s"
        duration="0.3s"
        on={on}
        onToggle={() => setOn((v) => !v)}
      />
    </node>
  );
}

type TimeBoxProps = {
  label: string;
  duration: string;
  on: boolean;
  onToggle: () => void;
};

function TimeBox({ label, duration, on, onToggle }: TimeBoxProps) {
  return (
    <node style={{ flexDirection: "column", alignItems: "center", gap: 10 }}>
      <Button
        unstyled
        pinch={{ strength: 0 }}
        onClick={onToggle}
        style={timeTrack}
      >
        <node
          style={{
            ...box,
            width: 44,
            height: 44,
            backgroundColor: Colors.green100,
            transform: { translateX: on ? 96 : 0 },
            transition: { transform: { duration, easing: "easeOut" } },
          }}
        />
      </Button>
      <TextMono style={caption}>{label}</TextMono>
    </node>
  );
}

const timeTrack: BevyStyle = {
  width: 160,
  height: 64,
  borderRadius: 12,
  padding: 10,
  justifyContent: "start",
  alignItems: "center",
  backgroundColor: Colors.surface100,
};
