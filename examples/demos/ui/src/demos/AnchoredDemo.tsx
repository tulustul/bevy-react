import { useEffect, useState } from "react";
import { Anchored, AnchorScaling } from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { bevy } from "../generated";
import type { CubeInfo } from "../generated";
import { headingStyle, labelStyle } from "./styles";
import { Card, Checkbox, Slider } from "../components";

const HINT = "<Anchored.node entity={cube}>";

export function AnchoredDemo() {
  const [cubes, setCubes] = useState<CubeInfo[]>([]);
  const [scalingEnabled, setScalingEnabled] = useState(true);
  const [baseDistance, setBaseDistance] = useState(24);
  const [scaleFactor, setScaleFactor] = useState(1);

  useEffect(() => {
    const off = bevy.on("anchoredDemo.cubesSpawned", (e) => setCubes(e.cubes));

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
      <Card>
        <text style={headingStyle}>World-anchored UI</text>
        <text style={labelStyle}>{HINT}</text>

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
      </Card>

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
    <Anchored.node
      entity={cube.entity}
      offset={[0, 0.8, 0]}
      scale={scaling}
      style={badgeStyle}
    >
      <text style={badgeText}>{cube.label}</text>
    </Anchored.node>
  );
}

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
