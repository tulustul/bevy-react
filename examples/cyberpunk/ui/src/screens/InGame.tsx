import { useEffect, useState } from "react";
import {
  interpolate,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "bevy-react";
import { sfx } from "../sound";
import { PROLOGUE, type Lifepath, type Save } from "../store";
import { C, F, T, chamfer } from "../theme";
import { FILL, Hint, Hints } from "../ui/kit";

/** The game: the chosen lifepath's world, full screen (a `<portal>` of the
 *  `world` camera), blurred while paused. Rendered under the menus. */
export function World({ paused }: { lifepath: Lifepath; paused: boolean }) {
  return (
    <portal
      target="world"
      style={{
        ...FILL,
        cache: "never",
        filter: { name: "blur", params: { radius: paused ? 14 : 0 } },
        transition: { filter: { duration: 300 } },
      }}
    />
  );
}

/** Whether the next HUD announces where you are: every load does (see
 *  `Loading`), a resume from the pause menu doesn't. */
let arriving = true;
export const announceArrival = () => {
  arriving = true;
};

/** The in-game overlay (unpaused): where you are, sliding in top left for a
 *  few seconds after a load, and the hint to open the menu. */
export function GameHud({
  onPause,
  game,
}: {
  onPause: () => void;
  /** The running game, for the toast (without it: the street kid's first
   *  stop). */
  game?: Save;
}) {
  const [announce] = useState(arriving);
  useEffect(() => {
    arriving = false;
  }, []);
  const where = game ?? PROLOGUE.streetkid;

  return (
    <node style={FILL}>
      {announce && <Toast location={where.location} quest={where.quest} />}
      <Hints>
        <Hint
          k="ESC"
          label="Pause"
          onClick={() => {
            sfx("back");
            onPause();
          }}
        />
      </Hints>
    </node>
  );
}

/** "KESSLER / LANTERN ALLEY", the job under it: a HUD plate that slides in,
 *  holds, and slides back out (one shared value, Bevy-driven). */
function Toast({ location, quest }: { location: string; quest: string }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(
      600,
      withSequence(
        withTiming(1, { duration: 360, easing: "easeOut" }),
        withDelay(4200, withTiming(0, { duration: 420, easing: "easeIn" })),
      ),
    );
  }, [t]);
  const [district, place = ""] = location.split(": ");
  return (
    <node
      style={{
        positionType: "absolute",
        left: 64,
        top: 150,
        flexDirection: "column",
        gap: 8,
        opacity: { animated: t },
        transform: {
          translateX: { animated: interpolate(t, [0, 1], [-60, 0]) },
        },
      }}
    >
      <node
        style={{
          ...chamfer("rgba(10, 8, 14, 0.72)", 16, "rgba(255, 93, 81, 0.6)", 1),
          width: 460,
          flexDirection: "row",
          gap: 16,
          padding: { left: 0, right: 20, vertical: 12 },
        }}
      >
        <node style={{ width: 4, backgroundColor: C.cyan }} />
        <node style={{ flexDirection: "column", gap: 2 }}>
          <text style={{ ...T.micro, fontSize: 10, color: C.cyanDim }}>
            ENTERING DISTRICT
          </text>
          <text
            style={{
              fontSize: 40,
              fontFamily: F.bold,
              color: C.cyan,
              letterSpacing: 1.5,
              lineBreak: "noWrap",
            }}
          >
            {district.toUpperCase()}
          </text>
          <text style={{ ...T.label, fontSize: 22, letterSpacing: 1 }}>
            {place.toUpperCase()}
          </text>
        </node>
      </node>
      <node style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <node style={{ width: 8, height: 8, backgroundColor: C.yellow }} />
        <text
          style={{
            ...T.label,
            fontSize: 20,
            color: C.yellow,
            letterSpacing: 1,
          }}
        >
          {`JOB  ·  ${quest.toUpperCase()}`}
        </text>
      </node>
    </node>
  );
}
