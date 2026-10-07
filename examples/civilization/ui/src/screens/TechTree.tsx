import { useState } from "react";
import { income, plural, turnsLeft, type Action, type Game } from "../game";
import { ERAS, TECHS, tech, type Tech } from "../techs";
import { C, Fonts, caps, tone } from "../theme";
import { Icon } from "../ui/Icon";
import { Medallion, Tip } from "../ui/kit";

const COL = 266;
const NODE_W = 226;
const NODE_H = 60;
const PAD = 26;
const HEAD = 46;
const ROWS = 7;
const COLUMNS = ERAS.reduce((n, e) => n + e.columns, 0);
const WIDTH = PAD * 2 + COLUMNS * COL - (COL - NODE_W);

type State = "done" | "current" | "open" | "locked";

/** Rows share the screen's height (within reason). */
const rowFor = (height: number) =>
  Math.max(72, Math.min(104, (height - HEAD - 60) / ROWS));

const at = (t: Tech, row: number) => ({
  x: PAD + t.col * COL,
  y: HEAD + 14 + t.row * row,
});

/** The technology tree: eras left to right, each tech a pill wired to what
 *  it needs. Click one you can study to research it. Scroll with the
 *  wheel. */
export function TechTree({
  game,
  player,
  dispatch,
  width,
  height,
}: {
  game: Game;
  player: string;
  dispatch: (a: Action) => void;
  width: number;
  height: number;
}) {
  const current = game.research ? tech(game.research) : null;
  const row = rowFor(height);
  const max = Math.max(0, WIDTH - width);
  const [scroll, setScroll] = useState(() =>
    Math.min(
      max,
      Math.max(0, at(current ?? tech("machinery"), row).x - width * 0.45),
    ),
  );
  const science = income(game, player).science;
  const state = (t: Tech): State =>
    game.researched.includes(t.id)
      ? "done"
      : t.id === game.research
        ? "current"
        : t.requires.every((r) => game.researched.includes(r))
          ? "open"
          : "locked";
  return (
    <node
      onWheel={(e) =>
        setScroll((s) =>
          Math.min(max, Math.max(0, s - (e.deltaY + e.deltaX) * 90)),
        )
      }
      scrollLeft={scroll}
      style={{
        flexGrow: 1,
        overflowX: "scroll",
        overflowY: "hidden",
        scrollbar: {
          thickness: 8,
          thumb: { backgroundColor: C.goldLo, borderRadius: 4 },
          track: { backgroundColor: "rgba(0, 0, 0, 0.3)" },
        },
        transition: { scroll: { duration: 260, easing: "easeOut" } },
        backgroundGradient: {
          type: "linear",
          angle: 180,
          stops: [{ color: "#10243a" }, { color: "#0a1522" }],
        },
      }}
    >
      <node style={{ width: WIDTH, height: "100%", flexShrink: 0 }}>
        <Eras />
        {TECHS.flatMap((t) =>
          t.requires.map((r) => (
            <Wire
              key={`${r}-${t.id}`}
              from={tech(r)}
              to={t}
              row={row}
              lit={game.researched.includes(r)}
            />
          )),
        )}
        {TECHS.map((t) => (
          <TechNode
            key={t.id}
            t={t}
            row={row}
            state={state(t)}
            progress={(game.progress[t.id] ?? 0) / t.cost}
            turns={turnsLeft(t.cost, game.progress[t.id] ?? 0, science)}
            onClick={() => dispatch({ type: "research", tech: t.id })}
          />
        ))}
      </node>
    </node>
  );
}

/** Where column `c` begins: mid-way through the gap before it. */
const edge = (c: number) =>
  c === 0 ? 0 : c === COLUMNS ? WIDTH : PAD + c * COL - (COL - NODE_W) / 2;

function Eras() {
  let col = 0;
  return (
    <>
      {ERAS.map((era, i) => {
        const left = edge(col);
        const right = edge((col += era.columns));
        return (
          <node
            key={era.name}
            style={{
              positionType: "absolute",
              left,
              width: right - left,
              top: 0,
              bottom: 0,
              flexDirection: "column",
              alignItems: "center",
              backgroundColor:
                i % 2 ? "rgba(255, 255, 255, 0.025)" : "rgba(0, 0, 0, 0)",
              border: { right: 1 },
              borderColor: C.goldLine,
            }}
          >
            <text
              style={{
                fontFamily: Fonts.display,
                fontWeight: "bold",
                fontSize: 15,
                letterSpacing: 3,
                color: C.gold,
                margin: { top: 14 },
              }}
            >
              {era.name.toUpperCase()}
            </text>
          </node>
        );
      })}
    </>
  );
}

/** An elbowed wire from `from`'s right edge to `to`'s left edge. */
function Wire({
  from,
  to,
  row,
  lit,
}: {
  from: Tech;
  to: Tech;
  row: number;
  lit: boolean;
}) {
  const a = at(from, row);
  const b = at(to, row);
  const x1 = a.x + NODE_W;
  const y1 = a.y + NODE_H / 2;
  const x2 = b.x;
  const y2 = b.y + NODE_H / 2;
  const elbow = x2 - (COL - NODE_W) / 2;
  const color = lit ? "rgba(217, 183, 108, 0.75)" : "rgba(98, 119, 141, 0.55)";
  const seg = (left: number, top: number, width: number, height: number) => (
    <node
      style={{
        positionType: "absolute",
        left,
        top,
        width,
        height,
        backgroundColor: color,
      }}
    />
  );
  return (
    <>
      {seg(x1, y1 - 1, elbow - x1, 2)}
      {seg(elbow - 1, Math.min(y1, y2) - 1, 2, Math.abs(y2 - y1) + 2)}
      {seg(elbow, y2 - 1, x2 - elbow, 2)}
    </>
  );
}

const LOOK: Record<
  State,
  { top: string; bottom: string; border: string; text: string }
> = {
  done: { top: "#4b3c1e", bottom: "#251c0e", border: C.gold, text: C.goldHi },
  current: {
    top: "#245b88",
    bottom: "#123150",
    border: C.science,
    text: "#ffffff",
  },
  open: { top: "#1f3954", bottom: "#101f30", border: C.slateHi, text: C.text },
  locked: {
    top: "#141e2a",
    bottom: "#0b1119",
    border: "#273443",
    text: C.faint,
  },
};

function TechNode({
  t,
  row,
  state,
  progress,
  turns,
  onClick,
}: {
  t: Tech;
  row: number;
  state: State;
  progress: number;
  turns: number;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  const look = LOOK[state];
  const { x, y } = at(t, row);
  const status =
    state === "done"
      ? "Researched"
      : state === "locked"
        ? `${plural(turns, "turn")} · locked`
        : plural(turns, "turn");
  return (
    <button
      onClick={state === "done" ? undefined : onClick}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      style={{
        positionType: "absolute",
        left: x,
        top: y,
        width: NODE_W,
        height: NODE_H,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        padding: { left: 5, right: 10 },
        borderRadius: NODE_H / 2,
        border: 1.5,
        borderColor: look.border,
        backgroundGradient: {
          type: "linear",
          angle: 180,
          stops: [{ color: look.top }, { color: look.bottom }],
        },
        boxShadow:
          state === "current"
            ? { color: "rgba(95, 191, 244, 0.55)", blurRadius: 16 }
            : { color: "rgba(0, 0, 0, 0.45)", blurRadius: 6, yOffset: 2 },
      }}
      hoverStyle={{ borderColor: C.goldHi }}
    >
      <Medallion
        size={48}
        inner={state === "done" ? "#6d5426" : C.slateHi}
        outer={state === "done" ? "#2d220f" : C.ink}
        progress={state === "current" ? progress : undefined}
        ring={C.science}
      >
        <Icon
          name={state === "done" ? "check" : t.icon}
          size={20}
          color={
            state === "done"
              ? C.goldHi
              : state === "locked"
                ? C.faint
                : C.science
          }
        />
      </Medallion>
      <node
        style={{ flexDirection: "column", gap: 2, flexGrow: 1, flexShrink: 1 }}
      >
        <text
          style={{
            ...caps,
            fontSize: 11,
            letterSpacing: 1.1,
            color: look.text,
            lineBreak: "noWrap",
          }}
        >
          {t.name.toUpperCase()}
        </text>
        <text
          style={{
            fontSize: 11,
            color: state === "current" ? C.science : C.muted,
          }}
        >
          {status}
        </text>
        <node style={{ flexDirection: "row", gap: 3 }}>
          {t.unlocks.map((u) => (
            <node
              key={u.name}
              style={{
                width: 18,
                height: 18,
                borderRadius: 3,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: tone(look.bottom, 0.6),
                border: 1,
                borderColor: "rgba(255, 255, 255, 0.12)",
              }}
            >
              <Icon
                name={u.icon}
                size={12}
                color={state === "locked" ? C.faint : C.goldHi}
              />
            </node>
          ))}
        </node>
      </node>
      {hover && (
        <Tip
          text={`${t.unlocks.map((u) => u.name).join(", ")} · Boost: ${t.boost}`}
          side="bottom"
          offset={NODE_H + 4}
        />
      )}
    </button>
  );
}
