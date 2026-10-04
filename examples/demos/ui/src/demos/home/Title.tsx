import { useEffect, useRef, useState } from "react";
import { useSharedValue, withDelay, withTiming } from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { Colors, Fonts } from "@/theme";
import { useIsMobile, useWindowSize } from "@/hooks";
import { Beats } from "./beats";

/** The tag words the headline cycles; the last is the library's own name. Every
 * entry must fit the fixed morph rect (see `Title`). */
const BRAND = "bevy-react";
const TAG_WORDS = ["Fast", "Reactive", "Hot reloaded", BRAND] as const;

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
          key: word,
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
      <Word text={word} font={isMobile ? wordFontMobile : wordFont} />
    </node>
  );
}

/** A tag word in display type; the brand name lit like the nav's wordmark —
 * "bevy" in Bevy's ember, "react" in React's cyan. */
function Word({ text, font }: { text: string; font: BevyStyle }) {
  const root: BevyStyle = { ...font, lineBreak: "noWrap" };
  if (text !== BRAND) return <text style={root}>{text}</text>;
  // Spans take element defaults for unset fields — each restates the face.
  return (
    <text style={root}>
      <text style={{ ...font, color: Colors.ember }}>bevy</text>
      <text style={{ ...font, color: Colors.textFaint }}>-</text>
      <text style={{ ...font, color: Colors.cyan }}>react</text>
    </text>
  );
}

const lineStyle: BevyStyle = {
  alignItems: "center",
  justifyContent: "center",
};

const wordFont: BevyStyle = {
  fontFamily: Fonts.display,
  fontSize: 56,
  fontWeight: "semibold",
  letterSpacing: -1.2,
  color: Colors.text,
};

const wordFontMobile: BevyStyle = {
  ...wordFont,
  fontSize: 40,
  letterSpacing: -0.8,
};
