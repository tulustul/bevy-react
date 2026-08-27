import { useEffect } from "react";
import {
  interpolate,
  interpolateColor,
  useSharedValue,
  withRepeat,
  withTiming,
  type FilterUse,
  type SharedValue,
} from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { bevy } from "@/bevy";
import { Button } from "@/components";
import { Colors, FontSizes } from "@/theme";
import { growTransition } from "../beats";
import { Extra } from "../Extra";
import {
  controlsStyle,
  PanelCaption,
  useCardContentWidth,
  vignetteStyle,
  type VignetteProps,
} from "../shared";

const TRAVEL_MS = 900;
/** How far the arrival glow spreads at its brightest, in px. */
const GLOW_SPREAD = 11;
/** Fraction of the trip over which a mark lights up. Narrow on purpose:
 * `travel` eases in and out, so it dwells near each end. */
const GLOW_WINDOW = 0.15;

/** The wire at tile size. `SPAN` is the pulse's travel, centre to centre. */
const MARK = 50;
const WIRE = 200;
const SPAN = WIRE - MARK;
const DOT = 9;
/** How much bigger the panel shows the wire. */
const PANEL_SCALE = 1.6;
/** Room the button and its caption take at rest, including the gap above. */
const CONTROLS_HEIGHT = 140;

/** A mark's arrival glow, peaking when the pulse touches its end of the wire
 * (`at` = 0 for React, 1 for Bevy). The `seed` matters: `spread` feeds the
 * capture outset, sized from the seed — seeding 0 would clip the glow. */
function arrivalGlow(travel: SharedValue, at: 0 | 1): FilterUse {
  return {
    name: "shadow",
    params: {
      color: {
        animated:
          at === 0
            ? interpolateColor(
                travel,
                [0.75, 1],
                [Colors.sky100 + "FF", Colors.sky100 + "00"],
              )
            : interpolateColor(
                travel,
                [0.75, 1.0],
                [Colors.sky100 + "00", Colors.sky100 + "FF"],
              ),
      },
      offsetX: 0,
      offsetY: 0,
      spread: {
        animated:
          at === 0
            ? interpolate(travel, [0, GLOW_WINDOW, 1], [GLOW_SPREAD, 0, 0])
            : interpolate(travel, [0, 1 - GLOW_WINDOW, 1], [0, 0, GLOW_SPREAD]),
        seed: GLOW_SPREAD,
      },
    },
  };
}

/** Typed messages: the tile is a pulse running React → Bevy; the panel's
 * button emits `bevy.nebula.burst`, a `#[react_message]` a Bevy system answers
 * by lighting the aurora behind the app (it decays on its own, ~2s).
 *
 * The diagram grows by ONE `transform.scale` on the whole wire: the pulse's
 * travel is a px range from the rail's width, and a rail easing in real layout
 * would run the pulse off its end mid-grow. */
export function TypedMessagesVignette({ grown }: VignetteProps) {
  const travel = useSharedValue(0);
  const contentWidth = useCardContentWidth();

  useEffect(() => {
    travel.value = withRepeat(
      withTiming(1, { duration: TRAVEL_MS, easing: "easeInOut" }),
      { reverse: true },
    );
  }, [travel]);

  const scale = grown ? PANEL_SCALE : 1;

  return (
    <node style={vignetteStyle}>
      <node
        style={{
          ...reserveStyle,
          height: MARK * scale,
          transition: { size: growTransition },
        }}
      >
        <node
          style={{
            ...wireStyle,
            transform: { scale },
            transition: { transform: growTransition },
          }}
        >
          <node style={trackStyle}>
            <node style={railStyle} />
            <node
              style={{
                ...pulseStyle,
                transform: {
                  translateX: {
                    animated: interpolate(
                      travel,
                      [0, 1],
                      [-SPAN / 2, SPAN / 2],
                    ),
                  },
                },
              }}
            />
          </node>
          <image
            src="images/react-logo.png"
            style={{ ...markStyle, filter: arrivalGlow(travel, 0) }}
          />
          <image
            src="images/bevy-logo.png"
            style={{ ...markStyle, filter: arrivalGlow(travel, 1) }}
          />
        </node>
      </node>

      <Extra grown={grown} maxHeight={CONTROLS_HEIGHT}>
        <node style={controlsStyle}>
          <Button
            style={buttonStyle}
            labelStyle={{ fontSize: FontSizes.lg }}
            onClick={() => bevy.nebula.burst({ hue: Math.random() })}
          >
            Light up the sky
          </Button>
          <PanelCaption
            style={
              contentWidth === undefined ? undefined : { width: contentWidth }
            }
          >
            The aurora behind this page is a Bevy system
          </PanelCaption>
        </node>
      </Extra>
    </node>
  );
}

const reserveStyle: BevyStyle = {
  width: "100%",
  alignItems: "center",
  justifyContent: "center",
};

const wireStyle: BevyStyle = {
  width: WIRE,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "spaceBetween",
};

const markStyle: BevyStyle = {
  width: MARK,
  height: MARK,
  zIndex: 1,
};

/** Under the marks, across the whole wire. */
const trackStyle: BevyStyle = {
  positionType: "absolute",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  alignItems: "center",
  justifyContent: "center",
};

const railStyle: BevyStyle = {
  positionType: "absolute",
  width: "100%",
  height: 2,
  borderRadius: 1,
  backgroundColor: Colors.surface500,
};

const pulseStyle: BevyStyle = {
  width: DOT,
  height: DOT,
  borderRadius: DOT / 2,
  backgroundColor: Colors.sky100,
  filter: {
    name: "bloom",
    params: { radius: 6, threshold: 0.2, intensity: 1.6 },
  },
};

const buttonStyle: BevyStyle = {
  padding: { horizontal: 18, vertical: 9 },
  borderRadius: 8,
  backgroundGradient: {
    type: "linear",
    angle: 180,
    stops: [{ color: Colors.primary200 }, { color: Colors.primary300 }],
  },
  cursor: "pointer",
};
