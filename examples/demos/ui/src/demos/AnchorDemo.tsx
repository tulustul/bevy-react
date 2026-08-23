import { useEffect, useState } from "react";
import { AnchorScaling } from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { bevy } from "@/bevy";
import type { CubeInfo } from "@/bevy";
import { Checkbox, Example, Slider } from "@/components";
import { Code, InlineCode, P } from "@/components/docs";
import { Colors, FontSizes, Gradients } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

const TYPESCRIPT = `<anchor entity={cube.entity} offset={[0, 0.8, 0]}>
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
        page maps each one to a badge. Orbit the camera and watch the badges
        track their cubes.
      </P>
    </>
  ),
};

export function AnchorDemo() {
  useDemoPage(PAGE);

  const [cubes, setCubes] = useState<CubeInfo[]>([]);
  const [scalingEnabled, setScalingEnabled] = useState(true);
  const [baseDistance, setBaseDistance] = useState(24);
  const [scaleFactor, setScaleFactor] = useState(1);

  useEffect(() => {
    const off = bevy.on("crowdedCubes.spawned", (e) => setCubes(e.cubes));

    return () => {
      off();
    };
  }, []);

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
        <Badge key={String(cube.entity)} cube={cube} scaling={scaling} />
      ))}
    </>
  );
}

type BadgeProps = {
  cube: CubeInfo;
  scaling: AnchorScaling | undefined;
};

function Badge({ cube, scaling }: BadgeProps) {
  return (
    <anchor
      entity={cube.entity}
      offset={[0, 0.8, 0]}
      scale={scaling}
      style={badgeStyle}
    >
      <text style={badgeText}>{cube.label}</text>
    </anchor>
  );
}

const badgeStyle: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  padding: { top: 3, right: 8, bottom: 3, left: 8 },
  backgroundColor: Colors.primary100,
  backgroundGradient: Gradients.primary,
  borderRadius: 999,
  boxShadow: {
    color: Colors.shadow100,
    blurRadius: 4,
    spreadRadius: 2,
  },
};

const badgeText: BevyStyle = {
  color: Colors.textColor400,
  fontSize: FontSizes.xs,
  fontWeight: "bold",
};
