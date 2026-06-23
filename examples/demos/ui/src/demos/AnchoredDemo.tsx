import { useEffect, useState } from "react";
import { Anchored, AnchorScaling } from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { bevy } from "../generated";
import type { CubeInfo } from "../generated";
import { headingStyle, labelStyle } from "./styles";
import { Card, Checkbox } from "../components";

const HINT = "<Anchored.node entity={cube}>";

export function AnchoredDemo() {
  const [cubes, setCubes] = useState<CubeInfo[]>([]);
  const [scaleEnabled, setScaleEnabled] = useState(true);

  useEffect(() => {
    const off = bevy.on("anchoredDemo.cubesSpawned", (e) => setCubes(e.cubes));

    return () => {
      off();
    };
  }, []);

  const scaling: AnchorScaling | undefined = scaleEnabled
    ? {
        min: 0.001,
        max: 20.0,
        factor: 1,
        baseDistance: 24.0,
      }
    : undefined;

  return (
    <>
      <Card>
        <text style={headingStyle}>World-anchored UI</text>
        <text style={labelStyle}>{HINT}</text>

        <Checkbox
          label="Scale with distance"
          enabled={scaleEnabled}
          onChange={setScaleEnabled}
        />
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
