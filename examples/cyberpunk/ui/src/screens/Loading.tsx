import { useEffect, useRef } from "react";
import { interpolate, useSharedValue, withTiming } from "bevy-react";
import { sfx } from "../sound";
import type { Lifepath } from "../store";
import { C, F, T } from "../theme";
import { Rule } from "../ui/decor";
import { FILL } from "../ui/kit";
import { Wordmark } from "../ui/Wordmark";
import { announceArrival } from "./InGame";
import { LifepathIcon } from "./saves/icons";

const DURATION = 2400;
const SEGMENTS = 24;

/** What the street says while the world loads. */
const TIPS: Record<Lifepath, string> = {
  nomad:
    "Out in the Badlands the clan is your armor. In Sable City, keep your car close and your exits closer.",
  streetkid:
    "Kessler runs on favors. Owe the wrong fixer and the whole block knows by sundown.",
  corpo:
    "At Tenkai every elevator has ears. Speak like the board is listening, because it is.",
};

/** The load into the game: the wordmark tilted over the datascape,
 *  BREACHING… in its red box, the progress filling segment by segment (one
 *  shared value, Bevy-driven), a tip for the chosen lifepath. */
export function Loading({
  lifepath,
  onDone,
}: {
  lifepath: Lifepath;
  onDone: () => void;
}) {
  const progress = useSharedValue(0);
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    sfx("boot");
    announceArrival();
    progress.value = withTiming(1, {
      duration: DURATION - 200,
      easing: "easeIn",
    });
    const t = setTimeout(() => done.current(), DURATION);
    return () => clearTimeout(t);
  }, [progress]);

  return (
    <node style={FILL}>
      <Wordmark
        width={1240}
        glitch={0.3}
        style={{
          positionType: "absolute",
          left: 300,
          top: 300,
          transform3d: {
            perspective: 1500,
            rotateX: 24,
            rotateY: -18,
            rotateZ: -7,
          },
        }}
      />
      <node
        style={{
          positionType: "absolute",
          left: 0,
          right: 0,
          top: 826,
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <node style={{ width: 186, flexDirection: "column", gap: 3 }}>
          <text style={{ ...T.micro, color: C.redDim }}>
            {"MODEL LINE       1.2001A"}
          </text>
          <node
            style={{
              height: 46,
              border: 2,
              borderColor: C.red,
              backgroundColor: "rgba(20, 6, 10, 0.6)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <text
              style={{
                fontSize: 30,
                fontFamily: F.semibold,
                color: C.cyan,
                letterSpacing: 1,
                lineBreak: "noWrap",
                cache: "never",
                filter: {
                  name: "glitch",
                  params: { intensity: 0.5, frequency: 0.6, tear: 10 },
                },
              }}
            >
              BREACHING...
            </text>
          </node>
        </node>
        <node style={{ flexDirection: "row", gap: 2 }}>
          {Array.from({ length: SEGMENTS }, (_, i) => (
            <node
              key={i}
              style={{
                width: 8,
                height: 4,
                backgroundColor: C.cyan,
                opacity: {
                  animated: interpolate(
                    progress,
                    [i / SEGMENTS, (i + 1) / SEGMENTS],
                    [0.12, 1],
                  ),
                },
              }}
            />
          ))}
        </node>
        <node
          style={{
            width: 640,
            border: 1,
            borderColor: C.redDim,
            backgroundColor: "rgba(20, 6, 10, 0.5)",
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            padding: { horizontal: 12, vertical: 7 },
          }}
        >
          <LifepathIcon lifepath={lifepath} size={22} />
          <text
            style={{
              fontSize: 17,
              color: C.red,
              lineHeight: 1.2,
              flexShrink: 1,
            }}
          >
            {TIPS[lifepath]}
          </text>
        </node>
        <text style={{ ...T.micro, color: C.redDim }}>
          {"█ SC_DB_943503.4308839456"}
        </text>
        <Rule width={1100} color={C.redDim} />
      </node>
    </node>
  );
}
