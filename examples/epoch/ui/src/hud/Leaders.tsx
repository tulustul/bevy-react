import { useState } from "react";
import type { CivInfo } from "../bevy";
import type { Game } from "../game";
import { C, Fonts, panel } from "../theme";
import { Crest } from "../ui/kit";

const MOODS = [
  { name: "Friendly", color: C.good, note: "Declared friendship 12 turns ago" },
  { name: "Guarded", color: C.coin, note: "Covets your coastal cities" },
  { name: "Unfriendly", color: C.bad, note: "Denounced you for your borders" },
  { name: "Neutral", color: C.muted, note: "Trades with you now and then" },
];

/** The rivals you have met, top right: hover one for their leader and
 *  standing, click for the world rankings. */
export function Leaders({
  rivals,
  game,
  onOpen,
}: {
  rivals: CivInfo[];
  game: Game;
  onOpen: () => void;
}) {
  return (
    <node
      style={{
        positionType: "absolute",
        right: 14,
        top: 42,
        flexDirection: "row",
        gap: 10,
      }}
    >
      {rivals.map((civ, i) => {
        const score = game.history[civ.id].score;
        return (
          <Leader
            key={civ.id}
            civ={civ}
            mood={MOODS[i % MOODS.length]}
            score={Math.round(score[score.length - 1])}
            onClick={onOpen}
          />
        );
      })}
    </node>
  );
}

function Leader({
  civ,
  mood,
  score,
  onClick,
}: {
  civ: CivInfo;
  mood: (typeof MOODS)[number];
  score: number;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      style={{ width: 54, height: 60, alignItems: "flexStart" }}
      hoverStyle={{ transform: { scale: 1.06 } }}
    >
      <Crest civ={civ} size={54} />
      <node
        style={{
          positionType: "absolute",
          left: 20,
          top: 48,
          width: 14,
          height: 14,
          borderRadius: 7,
          border: 2,
          borderColor: C.navy,
          backgroundColor: mood.color,
        }}
      />
      {hover && (
        <node
          style={{
            ...panel,
            positionType: "absolute",
            right: 0,
            top: 66,
            width: 250,
            padding: 12,
            flexDirection: "column",
            gap: 4,
            globalZIndex: 10,
          }}
        >
          <text
            style={{
              fontFamily: Fonts.display,
              fontWeight: "bold",
              fontSize: 16,
              color: C.goldHi,
            }}
          >
            {civ.leader}
          </text>
          <text style={{ fontSize: 12, color: civ.color }}>{civ.name}</text>
          <node style={{ flexDirection: "row", gap: 6, margin: { top: 6 } }}>
            <text
              style={{
                fontSize: 12,
                fontWeight: "semibold",
                color: mood.color,
              }}
            >
              {mood.name}
            </text>
            <text
              style={{ fontSize: 12, color: C.muted }}
            >{`· score ${score}`}</text>
          </node>
          <text style={{ fontSize: 12, color: C.muted }}>{mood.note}</text>
        </node>
      )}
    </button>
  );
}
