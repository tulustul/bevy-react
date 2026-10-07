import { useEffect, useState } from "react";
import {
  interpolate,
  useSharedValue,
  withRepeat,
  withTiming,
} from "bevy-react";
import { useKeys } from "../hooks";
import { sfx } from "../sound";
import { C, F, T } from "../theme";
import { DataNoise, Rule } from "../ui/decor";
import { FILL, Keycap } from "../ui/kit";
import { Wordmark } from "../ui/Wordmark";

/** The title screen: the wordmark laid on the datascape at an angle (a
 *  `transform3d` on its layer — still React, still a glitch filter), and
 *  "PRESS [SPACE] TO CONTINUE." Space, Enter or a click starts BREACHING…,
 *  then the main menu. */
export function Title({ onContinue }: { onContinue: () => void }) {
  const [breaching, setBreaching] = useState(false);
  const go = () => {
    if (breaching) return;
    sfx("confirm");
    setBreaching(true);
    setTimeout(onContinue, 1500);
  };
  useKeys((e) => {
    if (e.key === "Space" || e.key === "Enter") go();
  });
  // The plane the wordmark lies on sways a little, never still.
  const sway = useSharedValue(0);
  useEffect(() => {
    sway.value = withRepeat(
      withTiming(1, { duration: 7000, easing: "easeInOut" }),
      { reverse: true },
    );
  }, [sway]);

  return (
    <button style={{ ...FILL, backgroundColor: C.clear }} onClick={go}>
      <Wordmark
        width={1240}
        glitch={0.22}
        style={{
          positionType: "absolute",
          left: 300,
          top: 300,
          transform3d: {
            perspective: 1500,
            rotateX: { animated: interpolate(sway, [0, 1], [22, 26]) },
            rotateY: { animated: interpolate(sway, [0, 1], [-20, -15]) },
            rotateZ: -7,
          },
        }}
      />
      <node
        style={{
          positionType: "absolute",
          left: 0,
          right: 0,
          top: 842,
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <node style={{ width: 320, flexDirection: "column", gap: 3 }}>
          <text style={{ ...T.micro, color: C.redDim }}>
            {"MODEL LINE        1.2001A"}
          </text>
          <node
            style={{
              height: 50,
              border: 2,
              borderColor: C.red,
              backgroundColor: "rgba(20, 6, 10, 0.55)",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {breaching ? (
              <text
                style={{
                  fontSize: 30,
                  fontFamily: F.semibold,
                  color: C.cyan,
                  letterSpacing: 1,
                  filter: {
                    name: "glitch",
                    params: { intensity: 0.5, frequency: 0.6, tear: 10 },
                  },
                }}
              >
                BREACHING...
              </text>
            ) : (
              <>
                <text style={{ ...T.menu, fontFamily: F.semibold }}>PRESS</text>
                <Keycap k="space" />
                <text style={{ ...T.menu, fontFamily: F.semibold }}>
                  TO CONTINUE.
                </text>
              </>
            )}
          </node>
        </node>
        <node
          style={{
            width: 230,
            height: 20,
            border: 1,
            borderColor: C.redDim,
            padding: { horizontal: 6 },
            justifyContent: "center",
          }}
        >
          <DataNoise seed={3} lines={2} groups={6} style={{ fontSize: 6 }} />
        </node>
        <Rule width={1100} color={C.redDim} style={{ margin: { top: 10 } }} />
      </node>
    </button>
  );
}
