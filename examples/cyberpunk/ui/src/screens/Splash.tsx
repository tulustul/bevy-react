import { useEffect, useRef, type ReactNode } from "react";
import {
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
  type BevyStyle,
} from "bevy-react";
import { useKeys } from "../hooks";
import { F } from "../theme";
import { FILL } from "../ui/kit";

/** The marks' red (one flat ink, like a licensing screen). */
const INK = "#db4f49";

/** In, hold, out (ms). */
const card = (delay: number, hold: number) =>
  withDelay(
    delay,
    withSequence(
      withTiming(1, { duration: 320, easing: "easeOut" }),
      withDelay(hold, withTiming(0, { duration: 280, easing: "easeIn" })),
    ),
  );

/** The boot: the marks of the stack this runs on, tinted red, then a line
 *  owning up to the homage. About three seconds; any key or a click skips. */
export function Splash({ onDone }: { onDone: () => void }) {
  const marks = useSharedValue(0);
  const notice = useSharedValue(0);
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    // A beat of black first: the app's first frames compile pipelines.
    marks.value = card(250, 800);
    notice.value = card(1700, 900);
    const t = setTimeout(() => done.current(), 3300);
    return () => clearTimeout(t);
  }, [marks, notice]);
  useKeys(() => done.current());

  const center: BevyStyle = {
    ...FILL,
    alignItems: "center",
    justifyContent: "center",
  };
  return (
    <button
      style={{ ...FILL, backgroundColor: "#000000" }}
      onClick={() => done.current()}
    >
      <node style={{ ...center, opacity: { animated: marks } }}>
        <node
          style={{
            width: 1240,
            flexDirection: "row",
            flexWrap: "wrap",
            rowGap: 80,
          }}
        >
          <Mark>
            <Logo src="images/bevy-logo.png" />
            <Word size={60}>bevy</Word>
          </Mark>
          <Mark>
            <Logo src="images/react-logo.png" />
            <Word size={56}>React</Word>
          </Mark>
          <Mark>
            <Word size={76}>wgpu</Word>
          </Mark>
          <Mark>
            <node
              style={{ flexDirection: "column", alignItems: "center", gap: 6 }}
            >
              <node
                style={{
                  width: 92,
                  height: 92,
                  borderRadius: 8,
                  backgroundColor: INK,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Word size={58} color="#000000">
                  V8
                </Word>
              </node>
              <Word size={19} font={F.semibold}>
                JAVASCRIPT ENGINE
              </Word>
            </node>
          </Mark>
          <Mark>
            <Word size={72}>taffy</Word>
          </Mark>
          <Mark>
            <Word size={46} font={F.mono}>
              deno_core
            </Word>
          </Mark>
          <Mark>
            <Word size={54} font={F.semibold}>
              cosmic-text
            </Word>
          </Mark>
          <Mark>
            <node style={{ flexDirection: "column", alignItems: "center" }}>
              <Word size={20} font={F.semibold}>
                powered by
              </Word>
              <Word size={54}>bevy-react</Word>
            </node>
          </Mark>
        </node>
      </node>
      <node style={{ ...center, opacity: { animated: notice } }}>
        {/* The width sits on a wrapper: a `<text>` with a width of its own,
            centered on the cross axis, measures zero tall. */}
        <node style={{ width: 1280 }}>
          <text
            style={{
              fontSize: 25,
              color: "#c9463f",
              lineHeight: 1.45,
              textAlign: "center",
            }}
          >
            {
              "CYBERPUNK 2091 is a fan homage to the menus of Cyberpunk 2077, built with bevy-react. It is not affiliated with or endorsed by CD PROJEKT RED. Sable City, Tenkai and everyone in them are made up. Bevy, React, wgpu, V8, taffy, deno_core and cosmic-text are the work of their authors, used under their open-source licenses."
            }
          </text>
        </node>
      </node>
    </button>
  );
}

/** One cell of the grid. */
function Mark({ children }: { children: ReactNode }) {
  return (
    <node
      style={{
        width: "25%",
        height: 120,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
      }}
    >
      {children}
    </node>
  );
}

/** A project's logo, flattened to the red ink. */
function Logo({ src }: { src: string }) {
  return <image src={src} tint={INK} style={{ width: 84, height: 84 }} />;
}

/** A wordmark set in type. */
function Word({
  size,
  font = F.bold,
  color = INK,
  children,
}: {
  size: number;
  font?: string;
  color?: string;
  children: string;
}) {
  return (
    <text
      style={{
        fontSize: size,
        fontFamily: font,
        color,
        lineHeight: 1,
        lineBreak: "noWrap",
      }}
    >
      {children}
    </text>
  );
}
