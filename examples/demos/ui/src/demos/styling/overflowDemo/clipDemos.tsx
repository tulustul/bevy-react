import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Example, Radio, RadioOption } from "@/components";
import { Code, InlineCode, P } from "@/components/docs";
import { Colors, FontSizes } from "@/theme";
import { caption, controlColumn } from "../shared";

type OverflowValue = "visible" | "clip" | "hidden" | "scroll";

const OPTIONS: RadioOption<OverflowValue>[] = [
  { label: "visible", value: "visible" },
  { label: "clip", value: "clip" },
  { label: "hidden", value: "hidden" },
  { label: "scroll", value: "scroll" },
];

export function OverflowModesDemo() {
  return (
    <Example
      title="Clipping axes"
      info={
        <>
          <P>
            <InlineCode>overflowX</InlineCode>/
            <InlineCode>overflowY</InlineCode> decide what happens to a child
            that is bigger than its box: <InlineCode>visible</InlineCode> spills
            out, <InlineCode>clip</InlineCode> and{" "}
            <InlineCode>hidden</InlineCode> cut it off, and{" "}
            <InlineCode>scroll</InlineCode> clips it and adds a wheel scrollbar.
          </P>
          <Code lang="tsx">{`const [value, setValue] = useState<OverflowValue>("clip");

<node
  style={{
    overflowX: value, // "visible" | "clip" | "hidden" | "scroll"
    overflowY: value,
    scrollbarWidth: value === "scroll" ? 8 : 0,
  }}
>
  <node style={oversized} />
</node>`}</Code>
        </>
      }
      demo={OverflowModesCard}
    />
  );
}

function OverflowModesCard() {
  const [value, setValue] = useState<OverflowValue>("clip");
  return (
    <node style={controlColumn}>
      <node
        style={{
          ...boxStyle,
          overflowX: value,
          overflowY: value,
          scrollbarWidth: value === "scroll" ? 8 : 0,
        }}
      >
        <node style={oversizedStyle}>
          <text style={{ color: Colors.textColor100, fontSize: FontSizes.sm }}>
            This block is wider and taller than its 220×140 box. Switch the
            overflow value to watch it spill out, get clipped, or scroll.
          </text>
        </node>
      </node>
      <Radio value={value} options={OPTIONS} onChange={setValue} />
    </node>
  );
}

// Two identical flex rows that differ only in the subject box's overflow value.
// `clip` keeps the 220px content as the box's flex-item minimum, so the row
// overflows its 300px container and the sibling is pushed past the clipped edge.
// `hidden` drops that minimum to 0, so flexbox shrinks the box (clipping its
// content) and the sibling keeps its full width.
export function ClipVsHiddenDemo() {
  return (
    <Example
      title="Clip vs hidden"
      info={
        <>
          <P>
            <InlineCode>clip</InlineCode> and <InlineCode>hidden</InlineCode>{" "}
            clip the same pixels — the difference is layout. As a flex item, a
            clip box keeps its content width as a minimum (so it overflows the
            row), while a hidden box may shrink to 0 and let the row compress
            it. Both boxes hold the same 220px-wide child and sit in the same
            300px row next to a fixed sibling.
          </P>
          <Code lang="tsx">{`// The same 300px flex row, twice — only the subject's
// overflow value differs.

// Keeps its 220px content as a flex minimum, overflows the row:
<node style={{ overflowX: "clip" }}>
  <node style={{ width: 220 }} />
</node>

// May shrink to 0 — flexbox compresses it, content is clipped:
<node style={{ overflowX: "hidden" }}>
  <node style={{ width: 220 }} />
</node>`}</Code>
        </>
      }
      demo={ClipVsHiddenCard}
    />
  );
}

function ClipVsHiddenCard() {
  return (
    <node style={{ flexDirection: "column", gap: 16 }}>
      <SqueezeRow mode="clip" />
      <SqueezeRow mode="hidden" />
    </node>
  );
}

function SqueezeRow({ mode }: { mode: "clip" | "hidden" }) {
  return (
    <node style={{ flexDirection: "column", gap: 6 }}>
      <text style={caption}>{`overflowX: ${mode}`}</text>
      <node style={squeezeContainer}>
        <node style={{ ...subjectStyle, overflowX: mode }}>
          <node style={wideChildStyle}>
            <text
              style={{ color: Colors.textColor100, fontSize: FontSizes.xs }}
            >
              220px child
            </text>
          </node>
        </node>
        <node style={siblingStyle}>
          <text style={{ color: Colors.textColor100, fontSize: FontSizes.xs }}>
            sibling
          </text>
        </node>
      </node>
    </node>
  );
}

const boxStyle: BevyStyle = {
  width: 220,
  height: 140,
  padding: 12,
  backgroundColor: Colors.surface100,
  borderRadius: 12,
};

const oversizedStyle: BevyStyle = {
  width: 320,
  height: 220,
  padding: 12,
  borderRadius: 8,
  backgroundColor: Colors.primary100,
};

// Fixed-width row that clips, so an overflowing subject visibly pushes the
// sibling past the right edge.
const squeezeContainer: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  width: 300,
  padding: 8,
  overflowX: "clip",
  backgroundColor: Colors.surface100,
  borderRadius: 10,
};

// Flexible subject: no fixed width, so flexbox sizes it — and the overflow value
// decides whether its 220px content acts as a minimum.
const subjectStyle: BevyStyle = {
  height: 56,
  alignItems: "center",
  padding: 8,
  borderRadius: 8,
  backgroundColor: Colors.surface400,
};

const wideChildStyle: BevyStyle = {
  width: 220,
  height: 40,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 6,
  backgroundColor: Colors.primary100,
};

// Fixed-size sibling that refuses to shrink, so it competes with the subject for
// the row's width.
const siblingStyle: BevyStyle = {
  width: 110,
  height: 56,
  flexShrink: 0,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 8,
  backgroundColor: Colors.red100,
};
