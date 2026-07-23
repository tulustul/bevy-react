import { useState } from "react";
import {
  Animated,
  cancelAnimation,
  useSharedValue,
  withRepeat,
  withTiming,
} from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { Button, Example, Slider } from "@/components";
import { Colors, FontSizes } from "@/theme";
import { box, caption, controlColumn } from "./shared";

// transform3d applies a real 3D perspective transform to the subtree's
// RENDERED RESULT at composite time: its presence promotes the subtree to a
// composited layer, and animating it never re-captures (composite-time cost,
// like translation). Picking, hover styling, and the cursor all follow the
// transformed visual — the button inside the flipped card below really works.

export function Transform3dDemo() {
  return (
    <>
      <Example
        description="rotateX/rotateY tilt the rendered subtree in 3D. perspective sets the focal distance (smaller = more dramatic); without it the projection is orthographic — foreshortening only, no divergence."
        tsx={`transform3d: { perspective: 600, rotateY: 40 }`}
      >
        <TiltControl />
      </Example>

      <Example
        description="A click-to-flip card easing through transition.transform3d. The counter button INSIDE the card stays clickable at its transformed position — past 90° the mirrored backface still renders and picks. The base style keeps an identity transform3d so the flip-back eases instead of snapping."
        tsx={`transform3d: { perspective: 700, rotateY: flipped ? 180 : 0 },
transition: { transform3d: { duration: 0.6, easing: "easeInOut" } }`}
      >
        <FlipCard />
      </Example>

      <Example
        description="origin sets the pivot (and the vanishing point): a left-edge hinge swings like a door, the center flips in place."
        tsx={`transform3d: { rotateY: 60, origin: { x: "0%", y: "50%" } }`}
      >
        <OriginControl />
      </Example>

      <Example
        description="animatedStyle drives single fields (degrees for rotations) straight from the animation engine — a continuous wobble is a composite-time cache hit, never a re-capture."
        tsx={`animatedStyle={{ "transform3d.rotateY": wobble }}`}
      >
        <WobbleControl />
      </Example>

      <Example
        description="An ancestor's overflow clips the transformed RESULT (web semantics): the tilted card clamps at the clipping container's edge, not at its layout rect."
        tsx={`overflowX: "clip"  // on the parent`}
      >
        <ClipStage />
      </Example>
    </>
  );
}

function TiltControl() {
  const [rx, setRx] = useState(14);
  const [ry, setRy] = useState(40);
  const [persp, setPersp] = useState(true);
  return (
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
        {persp ? "→ orthographic" : "→ perspective"}
      </Button>
    </node>
  );
}

function FlipCard() {
  const [flipped, setFlipped] = useState(false);
  const [count, setCount] = useState(0);
  return (
    <node style={controlColumn}>
      <node style={stage}>
        <node
          style={{
            ...card,
            backgroundColor: flipped ? Colors.purple100 : Colors.primary100,
            // Identity when resting — presence keeps the layer (and the ease
            // back) alive; unsetting the field entirely would demote + snap.
            transform3d: { perspective: 700, rotateY: flipped ? 180 : 0 },
            transition: { transform3d: { duration: 0.6, easing: "easeInOut" } },
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
  );
}

function OriginControl() {
  const [hinged, setHinged] = useState(true);
  const [open, setOpen] = useState(true);
  return (
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
  );
}

function WobbleControl() {
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
  );
}

function ClipStage() {
  const [clipped, setClipped] = useState(true);
  return (
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
  fontSize: FontSizes.md,
  color: Colors.textColor100,
};
