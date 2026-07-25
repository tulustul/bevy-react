import { useState } from "react";
import {
  Animated,
  cancelAnimation,
  useSharedValue,
  withRepeat,
  withTiming,
} from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { Button, DemoRow, Example, Slider } from "@/components";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { Colors, FontSizes } from "@/theme";
import { box, caption, controlColumn } from "./shared";

// transform3d applies a real 3D perspective transform to the subtree's
// RENDERED RESULT at composite time: its presence promotes the subtree to a
// composited layer, and animating it never re-captures (composite-time cost,
// like translation). Picking, hover styling, and the cursor all follow the
// transformed visual — the button inside the flipped card below really works.

const PAGE: ExplanationData = {
  title: "transform3d",
  description: `transform3d applies a real 3D perspective transform to the
subtree's rendered result at composite time: its presence (even an identity
{}) promotes the subtree to a composited layer, and animating it never
re-captures. Fields apply in a fixed order — scale, rotateX/Y/Z (degrees),
translate, perspective — around origin. Picking, hover styling, and the
cursor all follow the transformed visual. transition: { transform3d } eases
field-wise, but unsetting the whole field demotes the layer and snaps — keep
an identity {} in the base style when removal should ease. animatedStyle
drives single fields via "transform3d.<field>" keys.`,
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
        <ClipDemo />
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
        <node style={stage}>
          <node
            style={{
              ...card,
              transform3d: {
                perspective: persp ? 600 : undefined,
                rotateX: rx,
                rotateY: ry,
              },
            }}
          >
            <text style={cardTitle}>3D</text>
            <text style={caption}>
              {persp ? "perspective 600" : "orthographic"}
            </text>
          </node>
        </node>
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
  const [count, setCount] = useState(0);
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
        <node style={stage}>
          <node
            style={{
              ...card,
              backgroundColor: flipped ? Colors.purple100 : Colors.primary100,
              // Identity when resting — presence keeps the layer (and the ease
              // back) alive; unsetting the field entirely would demote + snap.
              transform3d: { perspective: 700, rotateY: flipped ? 180 : 0 },
              transition: {
                transform3d: { duration: 0.6, easing: "easeInOut" },
              },
            }}
          >
            <text style={cardTitle}>{flipped ? "BACK" : "front"}</text>
            <Button onClick={() => setCount((c) => c + 1)}>
              clicks: {count}
            </Button>
          </node>
        </node>
        <Button onClick={() => setFlipped((v) => !v)}>
          {flipped ? "Flip back" : "Flip"}
        </Button>
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
        <node style={stage}>
          <node
            style={{
              ...card,
              backgroundColor: Colors.amber100,
              transform3d: {
                perspective: 800,
                rotateY: open ? 55 : 0,
                origin: hinged ? { x: "0%", y: "50%" } : { x: "50%", y: "50%" },
              },
              transition: { transform3d: { duration: 0.4, easing: "easeOut" } },
            }}
          >
            <text style={cardTitle}>{hinged ? "hinge left" : "center"}</text>
          </node>
        </node>
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
      withTiming(25, { duration: 900, easing: "easeInOut" }),
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
      title="animatedStyle"
      description="animatedStyle drives single fields (degrees for rotations) straight from the animation engine — a continuous wobble is a composite-time cache hit, never a re-capture."
      tsx={`animatedStyle={{
  "transform3d.rotateY": wobble,
}}`}
    >
      <node style={controlColumn}>
        <node style={stage}>
          <Animated.node
            style={{
              ...card,
              backgroundColor: Colors.green100,
              transform3d: { perspective: 600 },
            }}
            animatedStyle={{
              "transform3d.rotateY": wobble,
              "transform3d.rotateX": wobble,
            }}
          >
            <text style={cardTitle}>wobble</text>
          </Animated.node>
        </node>
        <Button onClick={spinning ? stop : start}>
          {spinning ? "Stop" : "Wobble"}
        </Button>
      </node>
    </Example>
  );
}

function ClipDemo() {
  const [clipped, setClipped] = useState(true);
  return (
    <Example
      title="Ancestor clip"
      description="An ancestor's overflow clips the transformed RESULT (web semantics): the tilted card clamps at the clipping container's edge, not at its layout rect."
      tsx={`overflowX: "clip"  // on the parent`}
    >
      <node style={controlColumn}>
        <node
          style={{
            ...stage,
            width: 170,
            overflowX: clipped ? "clip" : "visible",
            overflowY: clipped ? "clip" : "visible",
          }}
        >
          <node
            style={{
              ...card,
              width: 190,
              backgroundColor: Colors.red100,
              transform3d: { perspective: 500, rotateY: -35 },
            }}
          >
            <text style={cardTitle}>clipped</text>
          </node>
        </node>
        <Button onClick={() => setClipped((v) => !v)}>
          overflow: {clipped ? '"clip"' : '"visible"'}
        </Button>
      </node>
    </Example>
  );
}

const stage: BevyStyle = {
  alignItems: "center",
  justifyContent: "center",
  width: 220,
  height: 170,
  backgroundColor: Colors.surface100,
  borderRadius: 12,
};

const card: BevyStyle = {
  ...box,
  width: 130,
  height: 110,
  flexDirection: "column",
  gap: 8,
};

const cardTitle: BevyStyle = {
  fontSize: FontSizes.lg,
  color: Colors.textColor100,
};
