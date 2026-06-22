import { useEffect, useState } from "react";
import { Anchored } from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { bevy } from "../generated";
import type { CubeInfo } from "../generated";
import { cardStyle, headingStyle, labelStyle } from "./styles";

// Distance-scaling constants (the demo only toggles it on/off; these stay fixed).
const SCALE_MIN = 0.001;
const SCALE_MAX = 20.0;
const SCALE_FACTOR = 0.01;
const HINT = "<Anchored.node entity={cube}>";

export function AnchoredDemo() {
  const [cubes, setCubes] = useState<CubeInfo[]>([]);
  const [scaleEnabled, setScaleEnabled] = useState(true);

  // Fetch the cube entities once they exist. The cubes spawn when Bevy enters this
  // demo's state, which may land just after we mount — so poll until the list is
  // non-empty, then stop (the entities are stable for the demo's lifetime).
  useEffect(() => {
    let alive = true;
    let handle: ReturnType<typeof setTimeout>;
    const load = async () => {
      try {
        const list = await bevy.cubes.list();
        if (!alive) {
          return;
        }
        if (list.length) {
          setCubes(list);
          return;
        }
      } catch {
        // Switched away mid-flight — the cleanup below stops the loop.
      }
      if (alive) {
        handle = setTimeout(load, 100);
      }
    };
    load();
    return () => {
      alive = false;
      clearTimeout(handle);
    };
  }, []);

  const scale = scaleEnabled
    ? { min: SCALE_MIN, max: SCALE_MAX, factor: SCALE_FACTOR }
    : undefined;

  return (
    <>
      <node style={cardStyle}>
        <text style={headingStyle}>World-anchored UI</text>
        <text style={labelStyle}>{HINT}</text>

        <button style={checkboxRow} onClick={() => setScaleEnabled((v) => !v)}>
          <text style={checkboxBox}>{scaleEnabled ? "[x]" : "[ ]"}</text>
          <text style={checkboxLabel}>Scale with distance</text>
        </button>
      </node>

      {cubes.map((c) => (
        <Anchored.node
          key={String(c.entity)}
          entity={c.entity}
          offset={[0, 0.8, 0]}
          scale={scale}
          style={badgeStyle}
        >
          <text style={badgeText}>{c.label}</text>
        </Anchored.node>
      ))}
    </>
  );
}

const checkboxRow: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  padding: { top: 8, right: 12, bottom: 8, left: 12 },
  backgroundColor: "#2a2a3c",
  borderRadius: 8,
};

const checkboxBox: BevyStyle = {
  color: "#7aa2f7",
  fontSize: 16,
  fontWeight: "bold",
};

const checkboxLabel: BevyStyle = {
  color: "#cdd6f4",
  fontSize: 15,
};

const badgeStyle: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  padding: { top: 3, right: 8, bottom: 3, left: 8 },
  backgroundColor: "#7aa2f7",
  borderRadius: 999,
  boxShadow: {
    color: "#000000",
    blurRadius: 4,
    spreadRadius: 2,
  },
};

const badgeText: BevyStyle = {
  color: "#1e1e2e",
  fontSize: 12,
  fontWeight: "bold",
};
