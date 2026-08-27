import { useEffect, useRef } from "react";
import {
  interpolate,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { Beats } from "./beats";

/** The source marks are 243×243 and the shipped composite overlaps them by
 * 36px at that scale; everything here is expressed at `SIZE`. */
const SOURCE_SIZE = 243;
const SOURCE_OVERLAP = 36;
const SIZE = 104;
const OVERLAP = Math.round((SOURCE_OVERLAP * SIZE) / SOURCE_SIZE);

/** How far apart the marks start, per side; `join` runs 0 → 1 across it. */
const APART = 64;
/** How far the idle flourish pulls them apart, as a fraction of `APART`. */
const FLOURISH_JOIN = 0.4;

/** Whole turns only: a half turn lands the image on its mirrored back face. */
const REACT_TURNS = 2;
const BEVY_TURNS = 1;

const JOIN_MS = 900;
/** The entrance spin runs until the join has settled. */
const SPIN_MS = Beats.logosJoin + JOIN_MS - Beats.logosIn;
const FADE_MS = 500;
const FLOURISH_EVERY_MS = 6000;
const FLOURISH_MS = 1200;
const SETTLED_MS = Beats.logosIn + SPIN_MS;

/** The React and Bevy marks swell in, spin at different speeds, and converge
 * into the composite logo; every few seconds they drift apart, turn once each
 * in opposite directions, and close again. Everything rides `transform3d`
 * (composite-time), so the endless motion never re-captures. */
export function Logos() {
  /** 0 → 1: opacity and scale together. */
  const enter = useSharedValue(0);
  /** 0 = held `APART` per side, 1 = the composite pose. */
  const join = useSharedValue(0);
  // Degrees, not turns through `interpolate`: the flourish adds to it forever.
  const reactSpin = useSharedValue(0);
  const bevySpin = useSharedValue(0);
  // The intended resting angles, so a flourish landing mid-animation still adds
  // exactly one turn.
  const reactAngle = useRef(REACT_TURNS * 360);
  const bevyAngle = useRef(BEVY_TURNS * 360);

  useEffect(() => {
    enter.value = withDelay(
      Beats.logosIn,
      withTiming(1, { duration: FADE_MS, easing: "easeOut" }),
    );
    join.value = withDelay(
      Beats.logosJoin,
      withTiming(1, { duration: JOIN_MS, easing: "easeInOut" }),
    );
    reactSpin.value = withDelay(
      Beats.logosIn,
      withTiming(reactAngle.current, { duration: SPIN_MS, easing: "easeOut" }),
    );
    bevySpin.value = withDelay(
      Beats.logosIn,
      withTiming(bevyAngle.current, { duration: SPIN_MS, easing: "easeOut" }),
    );
  }, [enter, join, reactSpin, bevySpin]);

  useEffect(() => {
    const flourish = () => {
      const leg = FLOURISH_MS / 2;
      join.value = withSequence(
        withTiming(FLOURISH_JOIN, { duration: leg, easing: "easeInOut" }),
        withTiming(1, { duration: leg, easing: "easeInOut" }),
      );
      reactAngle.current += 360;
      bevyAngle.current -= 360;
      const turn = (value: typeof reactSpin, to: number) =>
        (value.value = withTiming(to, {
          duration: FLOURISH_MS,
          easing: "easeInOut",
        }));
      turn(reactSpin, reactAngle.current);
      turn(bevySpin, bevyAngle.current);
    };

    // The first flourish waits out the entrance; the rest are on the clock.
    let interval: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      flourish();
      interval = setInterval(flourish, FLOURISH_EVERY_MS);
    }, SETTLED_MS + FLOURISH_EVERY_MS);

    return () => {
      clearTimeout(start);
      if (interval !== undefined) clearInterval(interval);
    };
  }, [join, reactSpin, bevySpin]);

  const pose = (spin: typeof reactSpin, side: number) =>
    ({
      opacity: { animated: enter },
      transform3d: {
        perspective: 700,
        scale: { animated: enter },
        rotateY: { animated: spin },
        translateX: {
          animated: interpolate(join, [0, 1], [side * APART, 0]),
        },
      },
    }) satisfies BevyStyle;

  return (
    <node style={clusterStyle}>
      <image
        src="images/react-logo.png"
        style={{ ...logoStyle, ...pose(reactSpin, -1) }}
      />
      {/* Painted after React so it lands on top, as in the composite. */}
      <image
        src="images/bevy-logo.png"
        style={{
          ...logoStyle,
          margin: { left: -OVERLAP },
          ...pose(bevySpin, 1),
        }}
      />
    </node>
  );
}

const clusterStyle: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
};

const logoStyle: BevyStyle = {
  width: SIZE,
  height: SIZE,
};
