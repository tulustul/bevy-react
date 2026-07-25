import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Example, Slider } from "@/components";
import { Colors } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

// The `<node>` host element: a styleable, nestable box — the building block every
// other layout is made of. See Layout → Flex/Grid for arranging its children.

const TYPESCRIPT = `<node style={{ padding: 16, gap: 12 }}>
  <node
    style={{ width: 48, height: 48 }}
  />
</node>`;

const PAGE: ExplanationData = {
  title: "<node>",
  description:
    "The <node> host element is a styleable, nestable box — the building block every other layout is made of. It's a plain container you style and nest; children flow inside it (a flexbox container by default). Drag the slider to space the boxes out. See the Flex and Grid demos under Layout for arranging its children.",
  tsx: TYPESCRIPT,
};

export function NodeDemo() {
  useDemoPage(PAGE);
  const [gap, setGap] = useState(12);

  return (
    <Example>
      <node style={{ ...panelStyle, gap }}>
        <node style={{ ...boxStyle, backgroundColor: Colors.primary100 }} />
        <node style={{ ...boxStyle, backgroundColor: Colors.green100 }} />
        <node style={{ ...boxStyle, backgroundColor: Colors.red100 }} />
      </node>
      <Slider
        value={gap}
        min={0}
        max={32}
        onChange={setGap}
        label={`gap ${gap.toFixed(0)}`}
      />
    </Example>
  );
}

const panelStyle: BevyStyle = {
  flexDirection: "row",
  padding: 16,
  backgroundColor: Colors.surface100,
  borderRadius: 12,
};

const boxStyle: BevyStyle = {
  width: 48,
  height: 48,
  borderRadius: 8,
};
