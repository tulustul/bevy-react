import { useState } from "react";
import { useDebug, useKeys } from "../../hooks";
import { sfx } from "../../sound";
import { C, F, T } from "../../theme";
import { rng } from "../../ui/decor";
import { FILL, Header, Hint, Hints } from "../../ui/kit";
import { handleOf } from "./data";
import { Figure } from "./Figure";
import { StepIcon } from "./glyphs";
import { Chrome, ColdFrame, HotFrame } from "./parts";
import type { StepProps } from "./NewGame";

const CARD = { width: 372, height: 872, top: 125, lefts: [537, 1015] };

/** The genome the cards are printed over: rows of codon triplets. */
function genome(seed: number) {
  const r = rng(seed);
  const base = () => "ACGT"[Math.floor(r() * 4)];
  return Array.from({ length: 79 }, () =>
    Array.from({ length: 12 }, () => base() + base() + base()).join(" "),
  ).join("\n");
}
const GENOME = [genome(21), genome(34)];

/** BODY TYPE: two tall cards, each a figure in line art over its genome.
 *  The hovered card is lit red; a click (or Enter) chooses it. */
export function BodyType({ character, onChange, next, back }: StepProps) {
  const [hot, setHot] = useState(character.body);
  const hover = (i: number) => {
    if (i === hot) return;
    sfx("hover");
    setHot(i);
  };
  const pick = (i: number) => {
    onChange({ ...character, body: i });
    next();
  };
  useKeys((e) => {
    if (e.key === "Escape") back();
    else if (e.key === "ArrowLeft") hover(0);
    else if (e.key === "ArrowRight") hover(1);
    else if (e.key === "Enter" || e.code === "KeyF") pick(hot);
  });
  useDebug("hover", (n) => setHot(Number(n)));

  return (
    <node style={FILL}>
      <Chrome />
      <Header
        title="BODY TYPE"
        caption={`PICK A FRAME FOR ${handleOf(character)}. THE WAY YOU LOOK CAN CHANGE HOW SOME PEOPLE IN SABLE CITY TREAT YOU.`}
        icon={<StepIcon kind="body" />}
        step={1}
      />
      {CARD.lefts.map((left, i) => {
        const lit = i === hot;
        return (
          <button
            key={i}
            onPointerEnter={() => hover(i)}
            onClick={() => pick(i)}
            style={{
              positionType: "absolute",
              left,
              top: CARD.top,
              width: CARD.width,
              height: CARD.height,
              backgroundGradient: lit
                ? {
                    type: "linear",
                    angle: 180,
                    stops: [{ color: "#5a1d20" }, { color: "#2e1418" }],
                  }
                : undefined,
            }}
          >
            {lit && (
              <text
                style={{
                  positionType: "absolute",
                  left: 6,
                  top: 30,
                  fontSize: 10.5,
                  fontFamily: F.mono,
                  color: "#76282b",
                  lineHeight: 1.0,
                  letterSpacing: 1.5,
                  lineBreak: "noWrap",
                }}
              >
                {GENOME[i]}
              </text>
            )}
            <text
              style={{
                ...T.micro,
                positionType: "absolute",
                left: 8,
                top: 8,
                fontSize: 11,
                color: lit ? "#d7a29b" : "#6b3a3a",
              }}
            >
              {i === 0
                ? "SC2091100704511836900420"
                : "SC2091100704517290361185"}
            </text>
            <text
              style={{
                ...T.micro,
                positionType: "absolute",
                left: 262,
                top: 8,
                fontSize: 11,
                color: lit ? "#d7a29b" : "#6b3a3a",
              }}
            >
              07.10.2091
            </text>
            <node
              style={{
                ...FILL,
                alignItems: "center",
                padding: { top: 56 },
              }}
            >
              <Figure
                build={i}
                height={780}
                color={lit ? C.cyan : "#3a7680"}
                accent={lit ? "#ffe4dc" : "#5a3236"}
              />
            </node>
            <Mark lit={lit} />
            {lit ? (
              <HotFrame bar={22} cut={50} step={160} />
            ) : (
              <ColdFrame cut={50} line="#4a1c1f" />
            )}
          </button>
        );
      })}
      <Hints>
        <Hint k="mouse" label="SELECT" />
        <Hint k="ESC" label="BACK" onClick={back} />
      </Hints>
    </node>
  );
}

/** The registry's mark on each card's foot: a four-point star, SC91 and
 *  the template's small print. */
function Mark({ lit }: { lit: boolean }) {
  const color = lit ? C.red : "#7a2b2b";
  return (
    <node
      style={{
        positionType: "absolute",
        left: 14,
        bottom: 14,
        flexDirection: "column",
        gap: 1,
      }}
    >
      <node style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <svg viewBox="0 0 20 20" style={{ width: 20, height: 20 }}>
          <polygon
            points={[
              10, 0, 12.5, 7.5, 20, 10, 12.5, 12.5, 10, 20, 7.5, 12.5, 0, 10,
              7.5, 7.5,
            ]}
            fill={color}
          />
        </svg>
        <text
          style={{
            fontSize: 28,
            fontFamily: F.bold,
            color,
            lineBreak: "noWrap",
          }}
        >
          SC91
        </text>
      </node>
      <text style={{ ...T.micro, fontSize: 7, color }}>
        {"BIOMETRIC TEMPLATE\nSTANDARD 91-A"}
      </text>
    </node>
  );
}
