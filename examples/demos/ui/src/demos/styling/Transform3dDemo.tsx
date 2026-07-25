import { useEffect, useState } from "react";
import {
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "bevy-react";
import { DemoRow, Example, Slider } from "@/components";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { controlColumn } from "./shared";
import { TestBanner } from "@/components/TestBanner";

const PAGE: ExplanationData = {
  title: "transform3d",
  description: `transform3d applies a real 3D perspective transform to the
subtree's rendered result at composite time: its presence (even an identity
{}) promotes the subtree to a composited layer, and animating it never
re-captures. Fields apply in a fixed order — scale, rotateX/Y/Z (degrees),
translate, perspective — around origin. Picking, hover styling, and the
cursor all follow the transformed visual. transition: { transform3d } eases
field-wise, but unsetting the whole field demotes the layer and snaps — keep
an identity {} in the base style when removal should ease. An { animated }
wrapper on any field drives it from the animation engine.`,
};

export function Transform3dDemo() {
  useDemoPage(PAGE);
  return (
    <>
      <DemoRow>
        <PerspectiveDemo />
        <OrthographicDemo />
      </DemoRow>
      <DemoRow>
        <OriginDemo />
        <FlipCardDemo />
        <SpinningDemo />
      </DemoRow>
    </>
  );
}

function PerspectiveDemo() {
  const [rx, setRx] = useState(14);
  const [ry, setRy] = useState(40);
  const [persp, setPersp] = useState(600);
  return (
    <Example
      title="Perspective"
      description="perspective sets the focal distance of the projection: small values put the camera close (dramatic divergence, near edges balloon), large values flatten toward orthographic. Match the tilt on the orthographic card next door to compare the projections."
      tsx={`transform3d: {
  perspective: 600,
  rotateX: 14,
  rotateY: 40,
}`}
    >
      <node style={controlColumn}>
        <TestBanner
          style={{
            transform3d: {
              perspective: persp,
              rotateX: rx,
              rotateY: ry,
            },
          }}
        />

        <Slider
          value={rx}
          min={-80}
          max={80}
          onChange={setRx}
          label={`rotateX ${rx.toFixed(0)}°`}
        />
        <Slider
          value={ry}
          min={-80}
          max={80}
          onChange={setRy}
          label={`rotateY ${ry.toFixed(0)}°`}
        />
        <Slider
          value={persp}
          min={200}
          max={1000}
          onChange={setPersp}
          label={`perspective ${persp.toFixed(0)}`}
        />
      </node>
    </Example>
  );
}

function OrthographicDemo() {
  const [rx, setRx] = useState(14);
  const [ry, setRy] = useState(40);
  return (
    <Example
      title="Orthographic"
      description="The same tilt without a perspective field: an orthographic projection foreshortens (the rotated face gets narrower) but parallel edges never diverge — no vanishing point, no near-edge magnification."
      tsx={`transform3d: {
  // no perspective field
  rotateX: 14,
  rotateY: 40,
}`}
    >
      <node style={controlColumn}>
        <TestBanner
          style={{
            transform3d: {
              rotateX: rx,
              rotateY: ry,
            },
          }}
        />

        <Slider
          value={rx}
          min={-80}
          max={80}
          onChange={setRx}
          label={`rotateX ${rx.toFixed(0)}°`}
        />
        <Slider
          value={ry}
          min={-80}
          max={80}
          onChange={setRy}
          label={`rotateY ${ry.toFixed(0)}°`}
        />
      </node>
    </Example>
  );
}

function OriginDemo() {
  const swing = useSharedValue(0);
  const [origin, setOrigin] = useState(0);

  useEffect(() => {
    swing.value = withRepeat(
      withSequence(
        withDelay(600, withTiming(55, { duration: 700, easing: "easeInOut" })),
        withDelay(600, withTiming(0, { duration: 700, easing: "easeInOut" })),
      ),
    );
  }, [swing]);

  return (
    <Example
      title="Origin"
      description="origin sets the pivot (and the vanishing point). The door swings on an endless animated loop — pause, open, pause, close — while the slider drags the hinge from the left edge to the right: at 0% it swings like a door, at 50% it flips in place."
      tsx={`transform3d: {
  perspective: 800,
  rotateY: { animated: swing },
  origin: {
    x: \`\${origin}%\`, y: "0%",
  },
}`}
    >
      <node style={controlColumn}>
        <TestBanner
          style={{
            transform3d: {
              perspective: 800,
              rotateY: { animated: swing },
              origin: { x: `${origin}%`, y: "0%" },
            },
          }}
        />

        <Slider
          value={origin}
          min={0}
          max={100}
          onChange={setOrigin}
          label={`origin ${origin.toFixed(0)}%`}
        />
      </node>
    </Example>
  );
}

function FlipCardDemo() {
  const flip = useSharedValue(0);

  useEffect(() => {
    flip.value = withRepeat(
      withSequence(
        withDelay(700, withTiming(180, { duration: 600, easing: "easeInOut" })),
        withDelay(700, withTiming(0, { duration: 600, easing: "easeInOut" })),
      ),
    );
  }, [flip]);

  return (
    <Example
      title="Flip card"
      description="An endless flip loop: rest, flip to the back, rest, flip home. Past 90° the mirrored backface still renders and picks — hover the banner mid-flip and the interaction follows the transformed visual, not the layout rect."
      tsx={`flip.value = withRepeat(
  withSequence(
    withDelay(700,
      withTiming(180)),
    withDelay(700,
      withTiming(0)),
  ),
);
transform3d: {
  perspective: 700,
  rotateY: { animated: flip },
}`}
    >
      <node style={controlColumn}>
        <TestBanner
          style={{
            transform3d: {
              perspective: 700,
              rotateY: { animated: flip },
            },
          }}
        />
      </node>
    </Example>
  );
}

function SpinningDemo() {
  const spin = useSharedValue(0);

  const start = () => {
    spin.value = 0;
    spin.value = withRepeat(
      withTiming(360, { duration: 2400, easing: "linear" }),
    );
  };
  useEffect(start, [spin]);

  return (
    <Example
      title="Spinning"
      description="An { animated } wrapper drives single fields (degrees for rotations) straight from the animation engine — one shared value spins both axes indefinitely, and every frame is a composite-time cache hit, never a re-capture."
      tsx={`spin.value = withRepeat(
  withTiming(360, {
    duration: 2400,
    easing: "linear",
  }),
);
transform3d: {
  perspective: 600,
  rotateX: { animated: spin },
  rotateY: { animated: spin },
}`}
    >
      <node style={controlColumn}>
        <TestBanner
          style={{
            transform3d: {
              perspective: 600,
              rotateX: { animated: spin },
              rotateY: { animated: spin },
            },
          }}
        />
      </node>
    </Example>
  );
}
