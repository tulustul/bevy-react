import { useState } from "react";
import { useDebug, useKeys } from "../../hooks";
import { sfx } from "../../sound";
import { LIFEPATHS } from "../../store";
import { C } from "../../theme";
import { FILL, Header, Hint, Hints } from "../../ui/kit";
import { LIFEPATH_TEXT } from "./data";
import { StepIcon } from "./glyphs";
import { Chrome, ColdFrame, HotFrame } from "./parts";
import type { StepProps } from "./NewGame";

const CARD = { width: 374, height: 551, pitch: 448, left: 313, top: 169 };

/** LIFEPATH: three tall cards, each a little world filmed into a portal.
 *  The hovered one lights up and tells its story underneath; a click (or
 *  Enter) chooses it. */
export function Lifepath({ character, onChange, next, back }: StepProps) {
  const [hot, setHot] = useState(
    Math.max(
      0,
      LIFEPATHS.findIndex((l) => l.id === character.lifepath),
    ),
  );
  const hover = (i: number) => {
    if (i === hot) return;
    sfx("hover");
    setHot(i);
  };
  const pick = (i: number) => {
    onChange({ ...character, lifepath: LIFEPATHS[i].id });
    next();
  };
  useKeys((e) => {
    if (e.key === "Escape") back();
    else if (e.key === "ArrowLeft") hover(Math.max(0, hot - 1));
    else if (e.key === "ArrowRight")
      hover(Math.min(LIFEPATHS.length - 1, hot + 1));
    else if (e.key === "Enter" || e.code === "KeyF") pick(hot);
  });
  useDebug("hover", (n) => setHot(Number(n)));

  return (
    <node style={FILL}>
      <Chrome />
      <Header
        title="LIFEPATH"
        caption="WHERE YOU COME FROM DECIDES WHO OPENS THE DOOR FOR YOU. SOME JOBS AND CONVERSATIONS IN SABLE CITY WILL CHANGE WITH THIS CHOICE."
        icon={<StepIcon kind="lifepath" />}
        step={0}
      />
      {LIFEPATHS.map((l, i) => (
        <button
          key={l.id}
          onPointerEnter={() => hover(i)}
          onClick={() => pick(i)}
          style={{
            positionType: "absolute",
            left: CARD.left + i * CARD.pitch,
            top: CARD.top,
            width: CARD.width,
            height: CARD.height,
          }}
        >
          <text
            style={{
              positionType: "absolute",
              left: 9,
              top: -46,
              fontSize: 33,
              color: C.red,
              lineBreak: "noWrap",
            }}
          >
            {l.name}
          </text>
          <node style={{ ...FILL, backgroundColor: "#0c0b12" }} />
          <portal target={`card-${l.id}`} style={{ ...FILL, cache: "never" }} />
          {i === hot ? <HotFrame bar={20} cut={46} step={96} /> : <ColdFrame />}
          {i === hot && (
            <text
              style={{
                positionType: "absolute",
                left: -2,
                top: CARD.height + 14,
                width: CARD.width + 24,
                fontSize: 24,
                color: C.red,
                lineHeight: 1.18,
              }}
            >
              {LIFEPATH_TEXT[l.id]}
            </text>
          )}
        </button>
      ))}
      <Hints>
        <Hint k="mouse" label="SELECT" />
        <Hint k="ESC" label="BACK" onClick={back} />
      </Hints>
    </node>
  );
}
