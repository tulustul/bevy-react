import { useEffect, useState } from "react";
import { AnchorScaling } from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { bevy } from "@/bevy";
import type { CubeInfo } from "@/bevy";
import { Checkbox, Example, Slider } from "@/components";
import { Code, InlineCode, P } from "@/components/docs";
import { Colors, FontSizes } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

const TYPESCRIPT = `<anchor
  entity={cube.entity}
  offset={[0, 0.8, 0]}
  onClick={() => select(cube)}
>
  <node style={dot} />
  <text>{cube.label}</text>
</anchor>`;

const PAGE: ExplanationData = {
  title: "<anchor>",
  startCollapsed: true,
  info: (
    <>
      <P>
        <InlineCode>{"<anchor>"}</InlineCode> pins a UI subtree to a 3D entity:
        the node tracks the entity on screen every frame, with a world-space{" "}
        <InlineCode>offset</InlineCode> and an optional{" "}
        <InlineCode>scale</InlineCode> config (min/max/factor/baseDistance) that
        shrinks or grows it with camera distance.
      </P>
      <Code lang="tsx">{TYPESCRIPT}</Code>
      <P>
        The entity id comes from the Bevy side — here the CrowdedCubes scene
        reports its cubes over a typed{" "}
        <InlineCode>bevy.on("crowdedCubes.spawned")</InlineCode> event, and the
        page maps each one to a badge whose accent dot matches the cube's
        palette color. Orbit the camera and watch the badges track their cubes.
      </P>
      <P>
        Anchored subtrees are ordinary, interactive UI: every badge here has a
        hover style and an <InlineCode>onClick</InlineCode>. Clicking one sends
        a typed <InlineCode>crowdedCubes.select</InlineCode> message back to
        Bevy, which swaps that cube onto an emissive material so it glows in its
        own color. Click the same badge again to clear the selection.
      </P>
    </>
  ),
};

export function AnchorDemo() {
  useDemoPage(PAGE);

  const [cubes, setCubes] = useState<CubeInfo[]>([]);
  const [selected, setSelected] = useState<bigint | null>(null);
  const [scalingEnabled, setScalingEnabled] = useState(true);
  const [baseDistance, setBaseDistance] = useState(24);
  const [scaleFactor, setScaleFactor] = useState(1);

  useEffect(() => {
    const off = bevy.on("crowdedCubes.spawned", (e) => {
      setCubes(e.cubes);
      // Fresh entities: whatever was selected no longer exists.
      setSelected(null);
    });

    return () => {
      off();
    };
  }, []);

  const toggleSelect = (entity: bigint) => {
    const next = selected === entity ? null : entity;
    setSelected(next);
    // Entity bits cross as a plain number (serde_v8 rejects BigInt payloads;
    // lossless under 2^53 — the same convention as `<anchor entity>`).
    bevy.crowdedCubes.select(next === null ? null : Number(next));
  };

  const scaling: AnchorScaling | undefined = scalingEnabled
    ? {
        min: 0.4,
        max: 3,
        factor: scaleFactor,
        baseDistance: baseDistance,
      }
    : undefined;

  return (
    <>
      {/* The live example is the scene itself (every badge is an anchor), so
          this card carries docs + controls but no second modal instance —
          duplicating world-anchored badges would just double-draw them. */}
      <Example
        title="Distance scaling"
        info={
          <>
            <P>
              The <InlineCode>scale</InlineCode> config makes badges shrink and
              grow with camera distance: <InlineCode>factor</InlineCode> sets
              how strongly distance affects size,{" "}
              <InlineCode>baseDistance</InlineCode> is where scale is exactly 1,
              and min/max clamp the result. Toggle it off and every badge
              renders at its natural size regardless of depth.
            </P>
            <Code lang="tsx">{`<anchor
  entity={cube.entity}
  offset={[0, 0.8, 0]}
  scale={{ min: 0.4, max: 3, factor, baseDistance }}
>
  <text>{cube.label}</text>
</anchor>`}</Code>
          </>
        }
      >
        <Checkbox
          label="Scale with distance"
          enabled={scalingEnabled}
          onChange={setScalingEnabled}
        />

        {scalingEnabled && (
          <>
            <Slider
              value={scaleFactor}
              onChange={setScaleFactor}
              label={`Scale factor ${scaleFactor.toFixed(1)}`}
              min={0}
              max={3}
            />
            <Slider
              value={baseDistance}
              onChange={setBaseDistance}
              label={`Base distance ${baseDistance.toFixed(1)}`}
              min={1}
              max={50}
            />
          </>
        )}
      </Example>

      {cubes.map((cube) => (
        <Badge
          key={String(cube.entity)}
          cube={cube}
          scaling={scaling}
          selected={cube.entity === selected}
          onSelect={() => toggleSelect(cube.entity)}
        />
      ))}
    </>
  );
}

// Mirror of the cube palette in `scenes/crowded_cubes.rs` (`setup_cube_assets`):
// cube `i` is labeled `#i` and wears `palette[i % 8]`, so a badge can derive
// its cube's color from the label index with no extra wire data. Keep the two
// lists in sync.
const CUBE_PALETTE = [
  "#7aa3f7",
  "#f7758f",
  "#9ecc6b",
  "#f7c95c",
  "#ba8ced",
  "#66d9d6",
  "#f29966",
  "#ccccd9",
] as const;

function cubeAccent(label: string): string {
  const index = Number.parseInt(label.slice(1), 10);
  return CUBE_PALETTE[(Number.isNaN(index) ? 0 : index) % CUBE_PALETTE.length];
}

type BadgeProps = {
  cube: CubeInfo;
  scaling: AnchorScaling | undefined;
  selected: boolean;
  onSelect: () => void;
};

function Badge({ cube, scaling, selected, onSelect }: BadgeProps) {
  const accent = cubeAccent(cube.label);
  return (
    <anchor
      entity={cube.entity}
      offset={[0, 0.8, 0]}
      scale={scaling}
      style={
        selected
          ? { ...badgeStyle, outline: { width: 2, offset: 2, color: accent } }
          : badgeStyle
      }
      hoverStyle={badgeHover}
      onClick={onSelect}
    >
      <node style={{ ...dotStyle, backgroundColor: accent }} />
      <text style={badgeText}>{cube.label}</text>
    </anchor>
  );
}

// A dark HUD nameplate: neutral plate + the cube's palette color as an accent
// dot, so the crowd stays calm while each badge still pairs with its cube.
const badgeStyle: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 5,
  padding: { top: 3, right: 9, bottom: 3, left: 7 },
  backgroundColor: Colors.surface200 + "e6",
  border: 1,
  borderColor: "#ffffff1f",
  borderRadius: 999,
  boxShadow: {
    color: Colors.shadow100,
    blurRadius: 4,
    spreadRadius: 1,
  },
  cursor: "pointer",
};

const badgeHover: BevyStyle = {
  backgroundColor: Colors.surface400 + "f2",
  borderColor: "#ffffff47",
};

const dotStyle: BevyStyle = {
  width: 6,
  height: 6,
  borderRadius: 999,
};

const badgeText: BevyStyle = {
  color: Colors.textColor100,
  fontSize: FontSizes.xs,
  fontWeight: "bold",
};
