import { useEffect, useState } from "react";
import { bevy } from "../../bevy";
import { useDebug, useKeys } from "../../hooks";
import { sfx } from "../../sound";
import { DIFFICULTIES } from "../../store";
import { C, T } from "../../theme";
import { FILL, Hint, Hints } from "../../ui/kit";
import { DIFFICULTY_TEXT } from "./data";
import { StepIcon } from "./glyphs";
import { Barcode, HotFrame } from "./parts";
import type { StepProps } from "./NewGame";

/** SELECT DIFFICULTY LEVEL: the burning street in a lit frame, the level's
 *  blurb under it and the four levels. Hovering a level previews it (the
 *  street burns hotter); a click or Enter picks it. */
export function Difficulty({ character, onChange, next, back }: StepProps) {
  const [hot, setHot] = useState(
    Math.max(
      0,
      DIFFICULTIES.findIndex((d) => d.id === character.difficulty),
    ),
  );
  useEffect(() => {
    bevy.dioramas.difficulty({ level: hot });
  }, [hot]);
  const hover = (i: number) => {
    if (i === hot) return;
    sfx("hover");
    setHot(i);
  };
  const pick = (i: number) => {
    onChange({ ...character, difficulty: DIFFICULTIES[i].id });
    next();
  };
  useKeys((e) => {
    if (e.key === "Escape") back();
    else if (e.key === "ArrowLeft") hover(Math.max(0, hot - 1));
    else if (e.key === "ArrowRight")
      hover(Math.min(DIFFICULTIES.length - 1, hot + 1));
    else if (e.key === "Enter" || e.code === "KeyF") pick(hot);
  });
  useDebug("hover", (n) => setHot(Number(n)));

  return (
    <node style={FILL}>
      <CenteredHeader title="SELECT DIFFICULTY LEVEL" />
      <node
        style={{
          positionType: "absolute",
          left: 381,
          top: 107,
          width: 1159,
          height: 577,
        }}
      >
        <node style={{ ...FILL, backgroundColor: "#0c0b12" }} />
        <portal target="card-difficulty" style={{ ...FILL, cache: "never" }} />
        <HotFrame bar={22} cut={22} step={98} />
      </node>
      <text
        style={{
          ...T.body,
          positionType: "absolute",
          left: 378,
          top: 706,
          width: 1180,
          fontSize: 27,
          lineHeight: 1.22,
        }}
      >
        {DIFFICULTY_TEXT[DIFFICULTIES[hot].id]}
      </text>
      <node
        style={{
          positionType: "absolute",
          left: 366,
          top: 847,
          flexDirection: "row",
          gap: 10,
        }}
      >
        {DIFFICULTIES.map((d, i) => (
          <LevelButton
            key={d.id}
            label={d.name}
            hot={i === hot}
            seed={i + 4}
            onEnter={() => hover(i)}
            onClick={() => pick(i)}
          />
        ))}
      </node>
      <Hints>
        <Hint k="mouse" label="SELECT" />
        <Hint k="ESC" label="BACK" onClick={back} />
      </Hints>
    </node>
  );
}

/** A level plate: a notched top edge, a cut foot, a tab on the left. Lit
 *  red with a code strip under it while hot. */
const PLATE = [
  1, 5, 22, 5, 27, 10, 172, 10, 178, 1, 291, 1, 291, 71, 15, 71, 1, 57,
];

function LevelButton({
  label,
  hot,
  seed,
  onEnter,
  onClick,
}: {
  label: string;
  hot: boolean;
  seed: number;
  onEnter: () => void;
  onClick: () => void;
}) {
  const line = hot ? "#f0524a" : "#5c1c1e";
  return (
    <button
      onPointerEnter={onEnter}
      onClick={onClick}
      style={{
        width: 292,
        height: 72,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        viewBox="0 0 292 72"
        style={{
          positionType: "absolute",
          left: 0,
          top: 0,
          width: 292,
          height: 72,
          filter: hot
            ? {
                name: "shadow",
                params: {
                  color: "rgba(255, 60, 52, 0.55)",
                  offsetX: 0,
                  offsetY: 0,
                  spread: 10,
                },
              }
            : undefined,
        }}
      >
        <polygon
          points={PLATE}
          fill={hot ? "#6d2221" : "#0d0f16"}
          stroke={line}
          strokeWidth={hot ? 2 : 1.2}
        />
        <rect
          x={1}
          y={34}
          width={24}
          height={4}
          fill="none"
          stroke={line}
          strokeWidth={1}
        />
      </svg>
      <text
        style={{
          fontSize: 25,
          color: C.cyan,
          letterSpacing: 0.5,
          lineBreak: "noWrap",
        }}
      >
        {label}
      </text>
      {hot && (
        <node
          style={{
            positionType: "absolute",
            left: 0,
            top: 78,
            width: 292,
            flexDirection: "column",
            gap: 2,
          }}
        >
          <node style={{ flexDirection: "row", gap: 5 }}>
            <Barcode seed={1} width={14} height={18} />
            <Barcode seed={seed} width={254} height={18} />
            <Barcode seed={2} width={14} height={18} />
          </node>
          <node
            style={{ flexDirection: "row", justifyContent: "spaceBetween" }}
          >
            {[
              "REF",
              "5415210 1056845 51",
              "850541030 540454",
              "485151 59078709",
              "20JG8W4",
              "NC",
            ].map((t) => (
              <text
                key={t}
                style={{
                  ...T.micro,
                  fontSize: 7,
                  color: C.red,
                  lineBreak: "noWrap",
                }}
              >
                {t}
              </text>
            ))}
          </node>
        </node>
      )}
    </button>
  );
}

/** The difficulty step's header: the red rule and its five (unlit)
 *  segments, the title centered over them. */
function CenteredHeader({ title }: { title: string }) {
  const left = 606;
  const width = 5 * 138 + 4 * 6;
  const rule = "rgba(255, 93, 81, 0.75)";
  const faint = "rgba(255, 93, 81, 0.35)";
  return (
    <node
      style={{
        positionType: "absolute",
        left: 0,
        right: 0,
        top: 0,
        height: 60,
      }}
    >
      <node
        style={{
          positionType: "absolute",
          left: 0,
          width: left - 8,
          top: 44,
          height: 2,
          backgroundGradient: {
            type: "linear",
            angle: 90,
            stops: [{ color: faint }, { color: rule }],
          },
        }}
      />
      <node
        style={{
          positionType: "absolute",
          left: left + width + 8,
          right: 0,
          top: 44,
          height: 2,
          backgroundGradient: {
            type: "linear",
            angle: 90,
            stops: [{ color: rule }, { color: faint }],
          },
        }}
      />
      <node
        style={{
          positionType: "absolute",
          left,
          top: 50,
          flexDirection: "row",
          gap: 6,
        }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <node
            key={i}
            style={{ width: 138, height: 2, backgroundColor: C.redLine }}
          />
        ))}
      </node>
      <node
        style={{
          positionType: "absolute",
          left,
          width,
          top: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <StepIcon kind="difficulty" />
        <text
          style={{ ...T.micro, fontSize: 7, color: C.cyan, lineHeight: 1.1 }}
        >
          {"00100000\n01000111\n01001111"}
        </text>
        <text style={T.title}>{title}</text>
      </node>
    </node>
  );
}
