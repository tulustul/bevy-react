import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Example, TextMono } from "@/components";
import { Colors } from "@/theme";
import { box, caption, row, stage } from "./shared";

// A cross-cutting reference for the unit *strings* the style props accept. Each
// section shows several notations side by side; where the units are equivalent
// (angles, time) the results are visibly identical. Colors get their own
// interactive mixer in the Colors demo — here just a compact swatch row.
export function UnitsDemo() {
  return (
    <>
      <Example
        description="Lengths: a bare number is px; strings carry a unit. % is relative to the parent, vw/vh/vmin/vmax to the viewport, plus auto."
        tsx={`width: "80px" | "50%" | "10vw"`}
      >
        <LengthSection />
      </Example>

      <Example
        description="Font size: a bare number is px; strings carry px, viewport units (vw/vh/vmin/vmax), or rem (relative to Bevy's RemSize, default 20px)."
        tsx={`fontSize: "14px" | "1.5rem" | "2vw"`}
      >
        <FontSizeSection />
      </Example>

      <Example
        description="Angles: a bare number is degrees; strings carry deg/rad/turn/grad. These four are the same 45° written four ways."
        tsx={`rotate: "45deg" | "0.785rad" | "0.125turn" | "50grad"`}
      >
        <AngleSection />
      </Example>

      <Example
        description="Time: a bare number is milliseconds; strings carry ms/s. Both boxes ease identically — click either to toggle."
        tsx={`duration: "300ms"  ≡  duration: "0.3s"`}
      >
        <TimeSection />
      </Example>
    </>
  );
}

const LENGTHS = ["80px", "50%", "10vw"];

function LengthSection() {
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

function FontSizeSection() {
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

function AngleSection() {
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

function TimeSection() {
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
