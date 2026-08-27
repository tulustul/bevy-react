import { useEffect, useRef, useState } from "react";
import { useSharedValue, withDelay, withTiming } from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { Colors } from "@/theme";
import { useIsMobile, useWindowSize } from "@/hooks";
import { Beats } from "./beats";

/** The tag words the headline cycles; the last is the library's own name. Every
 * entry must fit the fixed morph rect (see `Title`). */
const TAG_WORDS = [
  { text: "Fast", stops: ["#c8ecff", Colors.sky100, "#3a78d6"] },
  { text: "Reactive", stops: ["#ffc9d4", Colors.red200, Colors.red300] },
  {
    text: "Hot reloaded",
    stops: ["#b7ccff", Colors.primary100, Colors.purple100],
  },
  { text: "bevy-react", stops: [Colors.amber100, Colors.orange100] },
] as const;

const STEP_MS = 1500;
const MORPH_MS = 2000;
const FADE_MS = 600;
const LINE_WIDTH = 560;

/** The headline: one line dusting through tag words, forever. */
export function Title() {
  const [step, setStep] = useState(0);
  const win = useWindowSize();
  const isMobile = useIsMobile();
  const appear = useSharedValue(0);
  const word = TAG_WORDS[step];

  useEffect(() => {
    appear.value = withDelay(
      Beats.titleLoop,
      withTiming(1, { duration: FADE_MS, easing: "easeOut" }),
    );
  }, [appear]);

  // The first wait is tracked explicitly: `step === 0` comes round every lap.
  const started = useRef(false);
  useEffect(() => {
    const wait = started.current ? STEP_MS : Beats.titleLoop;
    started.current = true;
    const id = setTimeout(
      () => setStep((s) => (s + 1) % TAG_WORDS.length),
      wait,
    );
    return () => clearTimeout(id);
  }, [step]);

  return (
    // The morph owns the outer node; the recolor lives on a NESTED layer — a
    // `gradientMap` chained after the morph would blend two recolored images.
    <node
      style={{
        ...lineStyle,
        // Fixed per viewport, never per step: a morph snapshot is layout-anchored,
        // so a rect changing with the word would stretch the frozen pixels.
        // `win` is 0×0 until the host answers, hence the floor.
        width: Math.max(240, Math.min(LINE_WIDTH, win.width - 60)),
        height: isMobile ? 56 : 78,
        opacity: { animated: appear },
        morphFilter: {
          key: word.text,
          name: "dustify",
          params: {
            direction: 0,
            softness: 100,
            turbulence: 0.5,
            wind: -180,
            drift: 60,
            grain: 6,
            raggedness: 0.6,
            evolution: 1,
          },
        },
        transition: { morphFilter: { duration: MORPH_MS, easing: "linear" } },
      }}
    >
      <node
        style={{
          ...lineInnerStyle,
          filter: {
            name: "gradientMap",
            params: {
              angle: 180,
              stops: word.stops.map((color) => ({ color })),
            },
          },
        }}
      >
        <text style={{ ...lineTextStyle, ...(isMobile && { fontSize: 40 }) }}>
          {word.text}
        </text>
      </node>
    </node>
  );
}

const lineStyle: BevyStyle = {
  alignItems: "center",
  justifyContent: "center",
};

const lineInnerStyle: BevyStyle = {
  width: "100%",
  height: "100%",
  alignItems: "center",
  justifyContent: "center",
};

const lineTextStyle: BevyStyle = {
  color: Colors.textColor100,
  fontFamily: "MetalMania",
  fontSize: 58,
  lineBreak: "noWrap",
};
