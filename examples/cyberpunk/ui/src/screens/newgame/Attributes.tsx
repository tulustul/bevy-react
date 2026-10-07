import { useState } from "react";
import { useDebug, useKeys } from "../../hooks";
import { sfx } from "../../sound";
import { NEW_CHARACTER, type AttributeId } from "../../store";
import { C, F, T, chamfer } from "../../theme";
import { FILL, Header, Hint, Hints, Keycap } from "../../ui/kit";
import { ATTRIBUTES, ATTR_MAX, ATTR_MIN, ATTR_POINTS } from "./data";
import { IdCard } from "./IdCard";
import { AttributeIcon, StepIcon } from "./glyphs";
import { Chrome, LevelBadge, NavButtons } from "./parts";
import type { StepProps } from "./NewGame";

const DARK = "#0d0f16";
const EDGE = "rgba(255, 93, 81, 0.42)";
const LIT = "#5a1a1e";

/** ATTRIBUTES: five attributes from 3 to 6 and seven points to spend
 *  (right), the hovered one explained (left), the ID card's radar
 *  following along (middle). A and D take and give a point. */
export function Attributes({ character, onChange, next, back }: StepProps) {
  const [hot, setHot] = useState(0);
  const [editing, setEditing] = useState(false);
  const values = character.attributes;
  const spent = ATTRIBUTES.reduce((n, a) => n + values[a.id] - ATTR_MIN, 0);
  const points = ATTR_POINTS - spent;
  const change = (id: AttributeId, by: number) => {
    const v = values[id] + by;
    if (v < ATTR_MIN || v > ATTR_MAX || (by > 0 && points === 0))
      return sfx("error");
    sfx("tab");
    onChange({ ...character, attributes: { ...values, [id]: v } });
  };
  const hover = (i: number) => {
    if (i === hot) return;
    sfx("hover");
    setHot(i);
  };
  useKeys((e) => {
    // Hold A or D to keep spending; Esc and F act once.
    if (editing || (e.repeat && (e.key === "Escape" || e.code === "KeyF")))
      return;
    if (e.key === "Escape") back();
    else if (e.code === "KeyF") next();
    else if (e.code === "KeyA") change(ATTRIBUTES[hot].id, -1);
    else if (e.code === "KeyD") change(ATTRIBUTES[hot].id, 1);
    else if (e.key === "ArrowUp") hover(Math.max(0, hot - 1));
    else if (e.key === "ArrowDown")
      hover(Math.min(ATTRIBUTES.length - 1, hot + 1));
  }, true);
  useDebug("hover", (n) => setHot(Number(n)));
  // `attrs 3 4 6 6 3`: body, intelligence, reflexes, tech, cool.
  useDebug("attrs", (arg) => {
    const n = arg.split(" ").map(Number);
    onChange({
      ...character,
      attributes: Object.fromEntries(
        ATTRIBUTES.map((a, i) => [a.id, n[i]]),
      ) as typeof values,
    });
  });

  const a = ATTRIBUTES[hot];
  return (
    <node style={FILL}>
      <Chrome />
      <Header
        title="ATTRIBUTES"
        caption="SPEND YOUR POINTS. WHAT YOU START WITH DECIDES HOW YOU SURVIVE YOUR FIRST NIGHT."
        icon={<StepIcon kind="attributes" />}
        step={3}
      />
      <Explainer
        name={a.name}
        text={a.text}
        effects={a.effects}
        value={values[a.id]}
      />
      <IdCard
        character={character}
        onChange={onChange}
        onEditing={setEditing}
        style={{ positionType: "absolute", left: 560, top: 196 }}
      />
      <text
        style={{
          ...T.menu,
          positionType: "absolute",
          right: 200,
          top: 178,
          fontSize: 27,
          fontFamily: F.semibold,
        }}
      >
        POINTS AVAILABLE
      </text>
      <button
        onClick={() => {
          sfx("click");
          onChange({ ...character, attributes: NEW_CHARACTER.attributes });
        }}
        style={{
          ...chamfer(DARK, 14, EDGE, 1, "bl"),
          positionType: "absolute",
          right: 408,
          top: 213,
          width: 249,
          height: 50,
          alignItems: "center",
          justifyContent: "center",
        }}
        hoverStyle={chamfer("#2a0d12", 14, C.red, 1, "bl")}
      >
        <text
          style={{
            fontSize: 22,
            fontFamily: F.semibold,
            color: C.red,
            lineBreak: "noWrap",
          }}
        >
          RESET TO DEFAULT
        </text>
        <node
          style={{
            positionType: "absolute",
            right: -2,
            top: 23,
            width: 24,
            height: 3,
            border: 1,
            borderColor: EDGE,
          }}
        />
      </button>
      <node
        style={{
          ...chamfer(DARK, 12, EDGE, 1, "bl"),
          positionType: "absolute",
          right: 200,
          top: 210,
          width: 110,
          height: 53,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <text
          style={{
            fontSize: 42,
            fontFamily: F.semibold,
            color: C.red,
            lineBreak: "noWrap",
          }}
        >
          {points.toString()}
        </text>
      </node>
      {ATTRIBUTES.map((attr, i) => (
        <AttributeRow
          key={attr.id}
          id={attr.id}
          name={attr.name}
          value={values[attr.id]}
          lit={i === hot}
          canAdd={values[attr.id] < ATTR_MAX && points > 0}
          top={278 + i * 121}
          onEnter={() => hover(i)}
          onChange={(by) => change(attr.id, by)}
        />
      ))}
      <NavButtons onBack={back} onNext={next} />
      <Hints>
        <node style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Keycap k="A" />
          <text style={{ fontSize: 25, color: C.red, lineBreak: "noWrap" }}>
            - / +
          </text>
          <Keycap k="D" />
        </node>
        <Hint k="mouse" label="SELECT" />
      </Hints>
    </node>
  );
}

/** One attribute: its plate (icon, name, MIN/MAX badge) over − value +. */
function AttributeRow({
  id,
  name,
  value,
  lit,
  canAdd,
  top,
  onEnter,
  onChange,
}: {
  id: AttributeId;
  name: string;
  value: number;
  lit: boolean;
  canAdd: boolean;
  top: number;
  onEnter: () => void;
  onChange: (by: number) => void;
}) {
  const fill = lit ? LIT : DARK;
  const edge = lit ? "rgba(255, 93, 81, 0.75)" : EDGE;
  const box = (corner?: "bl" | "br") =>
    corner
      ? chamfer(fill, 12, edge, 1, corner)
      : { backgroundColor: fill, border: 1, borderColor: edge };
  const badge =
    value === ATTR_MAX ? "MAX LEVEL" : value === ATTR_MIN ? "MIN LEVEL" : null;
  return (
    <button
      onPointerEnter={onEnter}
      style={{
        positionType: "absolute",
        right: 200,
        top,
        width: 457,
        flexDirection: "column",
        gap: 6,
      }}
    >
      <node
        style={{
          ...chamfer(fill, 16, edge, 1, "bl"),
          height: 62,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <node style={{ positionType: "absolute", left: 32, top: 10 }}>
          <AttributeIcon id={id} />
        </node>
        <text
          style={{
            fontSize: 25,
            fontFamily: F.semibold,
            color: C.red,
            lineBreak: "noWrap",
          }}
        >
          {name}
        </text>
        {badge && (
          <node style={{ positionType: "absolute", right: 10, top: 18 }}>
            <LevelBadge label={badge} />
          </node>
        )}
      </node>
      <node style={{ flexDirection: "row", gap: 4, height: 46 }}>
        <button
          onPointerEnter={onEnter}
          onClick={() => onChange(-1)}
          style={{
            ...box("bl"),
            width: 110,
            alignItems: "center",
            justifyContent: "center",
          }}
          hoverStyle={chamfer("#6e2228", 12, C.red, 1, "bl")}
        >
          <Sign plus={false} off={value <= ATTR_MIN} />
        </button>
        <node
          style={{
            ...box(),
            flexGrow: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <text
            style={{
              fontSize: 27,
              fontFamily: F.semibold,
              color: C.cyan,
              lineBreak: "noWrap",
            }}
          >
            {value.toString()}
          </text>
        </node>
        <button
          onPointerEnter={onEnter}
          onClick={() => onChange(1)}
          style={{
            ...box("br"),
            width: 111,
            alignItems: "center",
            justifyContent: "center",
          }}
          hoverStyle={chamfer("#6e2228", 12, C.red, 1, "br")}
        >
          <Sign plus off={!canAdd} />
        </button>
      </node>
    </button>
  );
}

/** − or +; struck through (a slanted bar over a box) when unavailable. */
function Sign({ plus, off }: { plus: boolean; off: boolean }) {
  const color = off ? "#a3332b" : C.red;
  return (
    <svg viewBox="0 0 58 16" style={{ width: 58, height: 16 }}>
      {off && (
        <>
          <rect
            x={1}
            y={3}
            width={56}
            height={10}
            fill="none"
            stroke={color}
            strokeWidth={1}
          />
          <line x1={1} y1={3} x2={57} y2={13} stroke={color} strokeWidth={1} />
        </>
      )}
      <rect x={23} y={7} width={12} height={2.4} fill={color} />
      {plus && <rect x={27.8} y={2} width={2.4} height={12} fill={color} />}
    </svg>
  );
}

/** The hovered attribute, explained: name and level badge, what each
 *  level gives (in cyan), and the current level. */
function Explainer({
  name,
  text,
  effects,
  value,
}: {
  name: string;
  text: string;
  effects: string[];
  value: number;
}) {
  return (
    <node
      style={{
        positionType: "absolute",
        left: 75,
        top: 178,
        width: 397,
        minHeight: 368,
        flexDirection: "row",
      }}
    >
      <node
        style={{
          ...chamfer("#160a0f", 12, EDGE, 1, "bl"),
          width: 40,
          margin: { right: 3 },
        }}
      >
        <node
          style={{
            positionType: "absolute",
            left: 26,
            top: 16,
            bottom: 16,
            width: 1,
            backgroundColor: EDGE,
          }}
        />
        <node
          style={{
            positionType: "absolute",
            left: 4,
            top: 175,
            width: 22,
            height: 4,
            border: 1,
            borderColor: EDGE,
          }}
        />
      </node>
      <node
        style={{
          ...chamfer(DARK, 18, EDGE, 1),
          flexGrow: 1,
          flexDirection: "column",
          padding: { left: 16, right: 12, top: 10, bottom: 10 },
          gap: 10,
        }}
      >
        <node
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "spaceBetween",
            height: 32,
          }}
        >
          <text
            style={{
              fontSize: 26,
              fontFamily: F.semibold,
              color: C.red,
              lineBreak: "noWrap",
            }}
          >
            {name}
          </text>
          {value === ATTR_MAX && <LevelBadge label="MAX LEVEL" />}
        </node>
        <node style={{ height: 1, backgroundColor: EDGE }} />
        <node style={{ width: 322 }}>
          <text style={{ fontSize: 22, color: C.cyan, lineHeight: 1.12 }}>
            {`${text}\n\n${effects.map((e) => `- ${e}`).join("\n")}`}
          </text>
        </node>
        <node style={{ flexGrow: 1 }} />
        <node style={{ height: 1, backgroundColor: EDGE }} />
        <node
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            height: 48,
          }}
        >
          <text style={{ fontSize: 40, color: C.red, lineBreak: "noWrap" }}>
            {value.toString()}
          </text>
          <text
            style={{
              fontSize: 17,
              fontFamily: F.bold,
              color: C.red,
              lineBreak: "noWrap",
            }}
          >
            ATTRIBUTE LEVEL
          </text>
          <node
            style={{
              width: 1,
              height: 48,
              margin: { left: 10 },
              backgroundColor: EDGE,
            }}
          />
        </node>
      </node>
    </node>
  );
}
