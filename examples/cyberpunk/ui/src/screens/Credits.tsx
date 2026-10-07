import { useEffect, useRef, useState } from "react";
import {
  cancelAnimation,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "bevy-react";
import { useDebug, useEvent, useKeys } from "../hooks";
import { sfx } from "../sound";
import { C, F } from "../theme";
import { FILL, Keycap } from "../ui/kit";
import { modalOpen } from "./Dialog";

/** A section title, a role with its names (one row each; a role may break
 *  over lines with `\n`), or empty space. */
type Block =
  | { title: string }
  | { role: string; names: string[] }
  | { space: number };

const CREDITS: Block[] = [
  { title: "A FRONT END BUILT WITH BEVY-REACT" },
  { space: 60 },
  { title: "SET IN SABLE CITY, WHERE NOBODY LOGS OFF" },
  { role: "BEVY-REACT", names: ["MATEUSZ TOMCZYK"] },
  {
    role: "GAME ENGINE: BEVY",
    names: ["CARTER ANDERSON", "AND THE BEVY CONTRIBUTORS"],
  },
  {
    role: "UI LIBRARY: REACT",
    names: ["META OPEN SOURCE", "AND THE REACT CONTRIBUTORS"],
  },
  { role: "JAVASCRIPT ENGINE: V8", names: ["THE V8 PROJECT AUTHORS"] },
  { role: "EMBEDDING: DENO_CORE", names: ["THE DENO AUTHORS"] },
  {
    role: "LAYOUT: TAFFY",
    names: ["DIOXUSLABS", "AND THE TAFFY CONTRIBUTORS"],
  },
  { role: "TEXT SHAPING: COSMIC-TEXT", names: ["SYSTEM76"] },
  { role: "GRAPHICS: WGPU", names: ["THE WGPU CONTRIBUTORS"] },
  {
    role: "TYPEFACE: RAJDHANI\nSIL OPEN FONT LICENSE",
    names: ["INDIAN TYPE FOUNDRY"],
  },
  {
    role: "MONOSPACE: JETBRAINS MONO\nSIL OPEN FONT LICENSE",
    names: ["JETBRAINS"],
  },
  { space: 110 },
  { title: "ON THE STREETS OF SABLE CITY" },
  { role: "FIXER, KESSLER DISTRICT", names: ["MAMA ODUYA"] },
  { role: "RIPPERDOC, LANTERN ALLEY", names: ["DR. IVO KALNINS"] },
  { role: "NETRUNNERS", names: ["SPARROW-9", "GHOSTWIRE", "LITTLE MERCY"] },
  { role: "BLACK ICE CONSULTANT", names: ["NOBODY YOU HAVE MET"] },
  { role: "NOMAD CONVOY LEAD,\nRED MESA PASS", names: ["JUNO VASQUEZ-HALE"] },
  { role: "STREET MEDIC ON CALL", names: ["SAINT MAGS"] },
  { role: "MEMORY REPLAY EDITOR", names: ["OKSANA RIVE"] },
  { role: "RADIO, 91.4 STATIC FM", names: ["DJ LOW BATTERY"] },
  { role: "CHROME FITTINGS", names: ["TWIN BLADES CLINIC"] },
  { role: "CATERING", names: ["THE NOODLE CART ON 5TH AND DORSET"] },
  { space: 110 },
  { title: "TENKAI CORPORATION" },
  { role: "COUNTERINTELLIGENCE", names: ["[REDACTED]", "[REDACTED]"] },
  { role: "LEGAL REVIEW OF\nTHESE CREDITS", names: ["TENKAI LEGAL, FLOOR 88"] },
  { role: "SCPD INCIDENT REPORTS", names: ["SGT. DALE PRUITT (RET.)"] },
  { space: 110 },
  { title: "SPECIAL THANKS" },
  {
    role: "FOR EVERY LINE OF CODE\nUNDER THESE MENUS",
    names: ["THE OPEN-SOURCE CONTRIBUTORS"],
  },
  { role: "FOR READING THIS FAR", names: ["YOU"] },
  { space: 110 },
  { title: "INSPIRED BY THE MENUS OF CYBERPUNK 2077 BY CD PROJEKT RED" },
  { space: 60 },
  { title: "NO SAVE FILES WERE HARMED IN THE MAKING OF THESE MENUS" },
];

const TITLE = 84;
const ROW = 64;
const LINE = 26;

const height = (b: Block) =>
  "title" in b
    ? TITLE
    : "space" in b
      ? b.space
      : Math.max(
          b.names.length * ROW,
          ROW + (b.role.split("\n").length - 1) * LINE,
        );

/** The column's height. */
const H = CREDITS.reduce((h, b) => h + height(b), 0);
/** Roles end left of this line, names start right of it. */
const SPLIT = 682;

/** Scroll speeds, px/s. */
const NORMAL = 48;
const FAST = 520;
/** The first pass opens with the column already up (its top here)… */
const START = 150;
/** …later passes rise from under the screen. */
const ENTER = 1090;

const role = {
  fontSize: 22,
  fontFamily: F.semibold,
  color: "#48c3bd",
  letterSpacing: 1,
  lineHeight: { px: LINE },
  textAlign: "right",
} as const;
const name = {
  fontSize: 25,
  fontFamily: F.bold,
  color: "#b2f4f3",
  letterSpacing: 1,
  lineHeight: { px: ROW },
  lineBreak: "noWrap",
} as const;
const title = {
  fontSize: 36,
  color: "#b2f4f3",
  letterSpacing: 1.6,
  lineHeight: { px: TITLE },
  textAlign: "center",
} as const;

/** The credits: two columns rising over the datascape forever. Hold F (or
 *  Enter) to fast-forward; Esc closes. */
export function Credits({ onClose }: { onClose: () => void }) {
  const y = useSharedValue(START);
  const [fast, setFast] = useState(false);
  // Bevy owns the live offset; this is enough to estimate it when the
  // speed changes (each new driver starts from Bevy's own reading).
  const clock = useRef({ from: START, at: 0, speed: NORMAL });

  const run = (from: number, speed: number) => {
    clock.current = { from, at: Date.now(), speed };
    const ms = (px: number) => (px / speed) * 1000;
    y.value = withSequence(
      withTiming(-H, { duration: ms(from + H) }),
      withTiming(ENTER, { duration: 0 }),
      withRepeat(withTiming(-H, { duration: ms(ENTER + H) })),
    );
  };
  const offset = () => {
    const { from, at, speed } = clock.current;
    const px = ((Date.now() - at) / 1000) * speed;
    return px <= from + H ? from - px : ENTER - ((px - from - H) % (ENTER + H));
  };
  const speed = (on: boolean) => {
    if (on === fast) return;
    setFast(on);
    run(offset(), on ? FAST : NORMAL);
  };

  useEffect(() => {
    run(START, NORMAL);
    // The repeat never ends on its own.
    return () => cancelAnimation(y);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const close = () => {
    sfx("back");
    onClose();
  };
  const forward = (key: string) =>
    key === "f" || key === "F" || key === "Enter";
  useKeys((e) => {
    if (modalOpen()) return;
    if (e.key === "Escape") close();
    else if (forward(e.key)) speed(true);
  });
  useEvent("keyUp", (e) => {
    if (forward(e.key)) speed(false);
  });
  // `--shoot` step: `ff on|off`.
  useDebug("ff", (arg) => speed(arg !== "off"));

  return (
    <node
      style={{
        ...FILL,
        // A shade over the datascape's brightest streaks, not a panel.
        backgroundGradient: {
          type: "linear",
          angle: 90,
          stops: [
            { color: "rgba(2, 4, 8, 0.62)" },
            { color: "rgba(2, 4, 8, 0.5)", position: "50%" },
            { color: "rgba(2, 4, 8, 0)", position: "85%" },
          ],
        },
      }}
    >
      <node
        style={{
          positionType: "absolute",
          left: 0,
          top: 0,
          width: 2 * SPLIT,
          flexDirection: "column",
          transform: { translateY: { animated: y } },
        }}
      >
        {CREDITS.map((b, i) =>
          "title" in b ? (
            <text key={i} style={title}>
              {b.title}
            </text>
          ) : "space" in b ? (
            <node key={i} style={{ height: b.space }} />
          ) : (
            <node
              key={i}
              style={{
                height: height(b),
                flexDirection: "row",
                gap: 2 * (SPLIT - 672),
              }}
            >
              <text
                style={{
                  ...role,
                  width: 672,
                  margin: { top: (ROW - LINE) / 2 },
                }}
              >
                {b.role}
              </text>
              <text style={name}>{b.names.join("\n")}</text>
            </node>
          ),
        )}
      </node>
      <node
        style={{
          positionType: "absolute",
          right: 76,
          bottom: 60,
          flexDirection: "column",
          alignItems: "flexEnd",
          gap: 20,
        }}
      >
        <button
          onClick={() => speed(!fast)}
          style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
          hoverStyle={{ opacity: 0.8 }}
        >
          <Keycap k="F" color={C.red} />
          <Keycap k="enter" color={C.red} />
          <text
            style={{
              fontSize: 25,
              color: fast ? C.cyan : C.red,
              lineBreak: "noWrap",
            }}
          >
            Fast-Forward Credits
          </text>
        </button>
        <button
          onClick={close}
          style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
          hoverStyle={{ opacity: 0.8 }}
        >
          <Keycap k="ESC" color={C.red} />
          <text style={{ fontSize: 25, color: C.red, lineBreak: "noWrap" }}>
            CLOSE
          </text>
        </button>
      </node>
    </node>
  );
}
