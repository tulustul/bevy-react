import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { DemoRow, Example, TextMono } from "@/components";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { Colors } from "@/theme";
import { box, caption, row, stage } from "./shared";

const PAGE: ExplanationData = {
  title: "Units",
  description: `Style values accept units. A bare number picks a sensible
default per field — px for lengths and font sizes, degrees for angles,
milliseconds for durations. Strings carry an explicit unit: lengths take px,
% (relative to the parent), vw/vh/vmin/vmax (relative to the viewport), or
auto; fontSize adds rem (relative to Bevy's RemSize, default 20px); angles
take deg/rad/turn/grad; time takes ms/s.`,
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
      description="Lengths: a bare number is px; strings carry a unit. % is relative to the parent, vw/vh/vmin/vmax to the viewport, plus auto."
      tsx={`width: "80px" | "50%" | "10vw"`}
    >
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
    </Example>
  );
}

const FONT_SIZES = ["14px", "1.5rem", "2vw"];

function FontSizeDemo() {
  return (
    <Example
      title="fontSize"
      description="Font size: a bare number is px; strings carry px, viewport units (vw/vh/vmin/vmax), or rem (relative to Bevy's RemSize, default 20px)."
      tsx={`fontSize: "14px" | "1.5rem" | "2vw"`}
    >
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
    </Example>
  );
}

const ANGLES = ["45deg", "0.785rad", "0.125turn", "50grad"];

function AngleDemo() {
  return (
    <Example
      title="Angles"
      description="Angles: a bare number is degrees; strings carry deg/rad/turn/grad. These four are the same 45° written four ways."
      tsx={`rotate: "45deg" | "0.785rad" | "0.125turn" | "50grad"`}
    >
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
    </Example>
  );
}

function TimeDemo() {
  const [on, setOn] = useState(false);

  return (
    <Example
      title="Time"
      description="Time: a bare number is milliseconds; strings carry ms/s. Both boxes ease identically — click either to toggle."
      tsx={`duration: "300ms"  ≡  duration: "0.3s"`}
    >
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
    </Example>
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
      <button onClick={onToggle} style={timeTrack}>
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
      </button>
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
