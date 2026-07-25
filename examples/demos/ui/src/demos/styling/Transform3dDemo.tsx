import { useState } from "react";
import {
  cancelAnimation,
  useSharedValue,
  withRepeat,
  withTiming,
} from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { Button, DemoRow, Example, Slider } from "@/components";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { box, controlColumn } from "./shared";
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
        <TiltDemo />
        <OriginDemo />
      </DemoRow>
      <DemoRow>
        <FlipCardDemo />
        <WobbleDemo />
      </DemoRow>
    </>
  );
}

function TiltDemo() {
  const [rx, setRx] = useState(14);
  const [ry, setRy] = useState(40);
  const [persp, setPersp] = useState(true);
  return (
    <Example
      title="rotateX / rotateY"
      description="rotateX/rotateY tilt the rendered subtree in 3D. perspective sets the focal distance (smaller = more dramatic); without it the projection is orthographic — foreshortening only, no divergence."
      tsx={`transform3d: {
  perspective: 600,
  rotateY: 40,
}`}
    >
      <node style={controlColumn}>
        <TestBanner
          style={{
            transform3d: {
              perspective: persp ? 600 : undefined,
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
        <Button onClick={() => setPersp((v) => !v)}>
          {persp ? "to orthographic" : "to perspective"}
        </Button>
      </node>
    </Example>
  );
}

function FlipCardDemo() {
  const [flipped, setFlipped] = useState(false);

  return (
    <Example
      title="Flip card"
      description="A click-to-flip card easing through transition.transform3d. The counter button INSIDE the card stays clickable at its transformed position — past 90° the mirrored backface still renders and picks. The base style keeps an identity transform3d so the flip-back eases instead of snapping."
      tsx={`transform3d: {
  perspective: 700,
  rotateY: flipped ? 180 : 0,
},
transition: {
  transform3d: {
    duration: 0.6,
    easing: "easeInOut",
  },
}`}
    >
      <node style={controlColumn}>
        <TestBanner
          style={{
            transform3d: { perspective: 700, rotateY: flipped ? 180 : 0 },
            transition: {
              transform3d: { duration: 0.6, easing: "easeInOut" },
            },
          }}
        />
        <Button onClick={() => setFlipped((v) => !v)}>"Flip"</Button>
      </node>
    </Example>
  );
}

function OriginDemo() {
  const [hinged, setHinged] = useState(true);
  const [open, setOpen] = useState(true);

  return (
    <Example
      title="origin"
      description="origin sets the pivot (and the vanishing point): a left-edge hinge swings like a door, the center flips in place."
      tsx={`transform3d: {
  rotateY: 60,
  origin: { x: "0%", y: "50%" },
}`}
    >
      <node style={controlColumn}>
        <TestBanner
          style={{
            transform3d: {
              perspective: 800,
              rotateY: open ? 55 : 0,
              origin: hinged ? { x: "0%", y: "50%" } : { x: "50%", y: "50%" },
            },
            transition: { transform3d: { duration: 0.4, easing: "easeOut" } },
          }}
        />

        <node style={{ flexDirection: "row", gap: 10 }}>
          <Button onClick={() => setOpen((v) => !v)}>
            {open ? "Close" : "Swing"}
          </Button>
          <Button onClick={() => setHinged((v) => !v)}>
            origin: {hinged ? '"0%"' : '"50%"'}
          </Button>
        </node>
      </node>
    </Example>
  );
}

function WobbleDemo() {
  const wobble = useSharedValue(0);
  const [spinning, setSpinning] = useState(false);

  const start = () => {
    wobble.value = withRepeat(
      withTiming(45, { duration: 900, easing: "easeInOut" }),
      -1,
      true, // ping-pong
    );
    setSpinning(true);
  };
  const stop = () => {
    cancelAnimation(wobble);
    setSpinning(false);
  };

  return (
    <Example
      title="Animated fields"
      description="An { animated } wrapper drives single fields (degrees for rotations) straight from the animation engine — a continuous wobble is a composite-time cache hit, never a re-capture."
      tsx={`style={{ transform3d: {
  perspective: 600,
  rotateY: { animated: wobble },
} }}`}
    >
      <node style={controlColumn}>
        <TestBanner
          style={{
            transform3d: {
              perspective: 600,
              rotateX: { animated: wobble },
              rotateY: { animated: wobble },
            },
          }}
        />
      </node>
      <Button onClick={spinning ? stop : start}>
        {spinning ? "Stop" : "Wobble"}
      </Button>
    </Example>
  );
}
