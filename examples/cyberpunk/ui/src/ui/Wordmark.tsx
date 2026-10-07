import type { BevyStyle } from "bevy-react";
import { useSettings } from "../screens/settings/store";
import { C, F } from "../theme";
import {
  WORDMARK_ASPECT,
  WORDMARK_PATH,
  WORDMARK_VIEWBOX,
} from "./wordmark-path";

/** The title: CYBERPUNK in slashed acid-yellow capitals over the year line,
 *  breaking up now and then (a `glitch` filter in burst mode — the shader
 *  decides when, React renders once). */
export function Wordmark({
  width,
  glitch: chance = 0.1,
  style,
}: {
  width: number;
  /** Chance a quarter second glitches; 0 = never. */
  glitch?: number;
  style?: BevyStyle;
}) {
  // UI glitch effects can be switched off (INTERFACE settings).
  const glitch = useSettings().uiGlitch ? chance : 0;
  const height = width / WORDMARK_ASPECT;
  const digit = width * 0.052;
  return (
    <node
      style={{
        width,
        height: height + digit * 0.6,
        filter:
          glitch > 0
            ? {
                name: "glitch",
                params: { intensity: 0.9, frequency: glitch, seed: 7 },
              }
            : undefined,
        ...style,
      }}
    >
      <svg viewBox={WORDMARK_VIEWBOX} style={{ width, height }}>
        <path d={WORDMARK_PATH} fill={C.yellow} />
      </svg>
      <Year
        size={digit}
        style={{
          positionType: "absolute",
          left: width * 0.47,
          top: height * 0.78,
        }}
      />
    </node>
  );
}

/** The year line under the wordmark: spaced digits strung on a wire. */
function Year({ size, style }: { size: number; style: BevyStyle }) {
  return (
    <node
      style={{
        flexDirection: "row",
        alignItems: "flexEnd",
        gap: size * 0.35,
        ...style,
      }}
    >
      {["2", "0", "9", "1"].map((d, i) => (
        <node
          key={d + i}
          style={{
            flexDirection: "row",
            alignItems: "flexEnd",
            gap: size * 0.35,
          }}
        >
          <text
            style={{
              fontFamily: F.semibold,
              fontSize: size,
              color: C.cyanDim,
              lineBreak: "noWrap",
            }}
          >
            {d}
          </text>
          {i < 3 && (
            <node
              style={{
                width: size * 1.1,
                height: 1.5,
                margin: { bottom: size * 0.22 },
                backgroundColor: C.cyanDim,
              }}
            />
          )}
        </node>
      ))}
    </node>
  );
}
