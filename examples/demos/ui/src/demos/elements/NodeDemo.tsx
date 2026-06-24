import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Example, Slider } from "@/components";
import { Colors } from "@/theme";

// The `<node>` host element: a styleable, nestable box — the building block every
// other layout is made of. See Layout → Flex/Grid for arranging its children.

const TYPESCRIPT = `<node style={{ padding: 16, gap: 12 }}>
  <node style={{ width: 48, height: 48 }} />
</node>`;

export function NodeDemo() {
  const [gap, setGap] = useState(12);

  return (
    <Example
      description="A plain container you style and nest. Children flow inside it; drag to space them out."
      typescript={TYPESCRIPT}
    >
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
