import { useState, type ReactNode } from "react";
import { useDebug, useKeys } from "../../hooks";
import { sfx } from "../../sound";
import type { Character } from "../../store";
import { C, F, T, chamfer } from "../../theme";
import { Arrow, WarningIcon } from "../../ui/icons";
import { FILL, Header, Hint, Hints } from "../../ui/kit";
import { LOOK_OPTIONS, PRESETS, VOICE, handleOf, look, two } from "./data";
import { IdCard } from "./IdCard";
import { GridIcon, StepIcon, WheelIcon } from "./glyphs";
import { Chrome, IconHint, NavButtons } from "./parts";
import { Portrait } from "./Portrait";
import { Swatches } from "./Swatches";
import type { StepProps } from "./NewGame";

const PLATE = "#1c0a0e";
const STEP = "#2a090c";
const EDGE = "#5a1c1f";

/** APPEARANCE: presets down the left, the live ID card in the middle, and
 *  the option list on the right, each row a value and its ◁ ▷ stepper
 *  (color rows open a swatch grid). */
export function Appearance({ character, onChange, next, back }: StepProps) {
  const [grid, setGrid] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [scroll, setScroll] = useState(0);
  const setLook = (id: string, value: number) =>
    onChange({ ...character, look: { ...character.look, [id]: value } });
  const step = (id: string, count: number, by: number) => {
    sfx("tab");
    setLook(id, (look(character, id) + by + count) % count);
  };
  const option = LOOK_OPTIONS.find((o) => o.id === grid);
  useKeys((e) => {
    if (editing) return;
    if (e.key === "Escape") {
      if (grid) {
        sfx("back");
        setGrid(null);
      } else back();
    } else if (e.code === "KeyF" && !grid) next();
  });
  // `swatch <option>` opens a grid, `look <option> <n>` sets a value,
  // `scroll <px>` scrolls the list.
  useDebug("swatch", (id) => setGrid(id || null));
  useDebug("look", (arg) => {
    const [id, n] = arg.split(" ");
    setLook(id, Number(n));
  });
  useDebug("scroll", (px) => setScroll(Number(px)));

  return (
    <node style={FILL}>
      <Chrome />
      <Header
        title="APPEARANCE"
        caption="IN SABLE CITY, EVERY CAMERA KNOWS YOUR FACE. MAKE IT ONE WORTH FILING."
        icon={<StepIcon kind="appearance" />}
        step={2}
      />
      <Presets character={character} onChange={onChange} />
      <IdCard
        character={character}
        onChange={onChange}
        onEditing={setEditing}
        style={{ positionType: "absolute", left: 560, top: 196 }}
      />
      {option && (
        <Swatches
          option={option}
          value={look(character, option.id)}
          onPick={(i) => setLook(option.id, i)}
          onClose={() => {
            sfx("back");
            setGrid(null);
          }}
        />
      )}
      {/* Hidden, not unmounted, under the grid: it keeps its scroll. */}
      <node
        scrollTop={scroll}
        style={{
          display: option ? "none" : "flex",
          positionType: "absolute",
          right: 146,
          top: 214,
          width: 491,
          height: 660,
          flexDirection: "column",
          gap: 10,
          overflowY: "scroll",
          scrollbar: {
            track: { backgroundColor: "#4e1717" },
            thumb: {
              backgroundColor: "#ff5e52",
              hover: { backgroundColor: C.redHi },
            },
            thickness: 8,
            minThumbLength: 60,
          },
        }}
      >
        <Pronouns name={handleOf(character)} voice={character.voice} />
        <Row
          label={VOICE.label}
          value={VOICE.names[character.voice]}
          onStep={() => {
            sfx("tab");
            onChange({ ...character, voice: 1 - character.voice });
          }}
        />
        {LOOK_OPTIONS.map((o) => {
          const value = look(character, o.id);
          return (
            <Row
              key={o.id}
              label={o.label}
              value={two(value)}
              swatch={o.swatches?.[value]}
              onStep={(by) => step(o.id, o.count, by)}
              onGrid={
                o.swatches
                  ? () => {
                      sfx("click");
                      setGrid(o.id);
                    }
                  : undefined
              }
            />
          );
        })}
      </node>
      <NavButtons onBack={back} onNext={next} />
      <Hints>
        <Hint k="mouse" label="SELECT" />
        <IconHint icon={<WheelIcon />} label="SCROLL" />
      </Hints>
    </node>
  );
}

/** The warning over the voice row: who the city will take you for. */
function Pronouns({ name, voice }: { name: string; voice: number }) {
  return (
    <node
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        width: 455,
        height: 44,
      }}
    >
      <WarningIcon size={18} />
      <text
        style={{ ...T.micro, fontSize: 5.5, color: C.red, lineBreak: "noWrap" }}
      >
        {"VOX MOD\nREG 2091\nSC 44-A"}
      </text>
      <node style={{ width: 390 }}>
        <text style={{ fontSize: 19, color: C.red, lineHeight: 1.05 }}>
          {`OTHER CHARACTERS WILL REFER TO\n${name} AS ${voice === 0 ? "HE/HIM" : "SHE/HER"}.`}
        </text>
      </node>
    </node>
  );
}

/** One option: its name and value (or swatch) on a plate, the stepper
 *  plate under it. */
function Row({
  label,
  value,
  swatch,
  onStep,
  onGrid,
}: {
  label: string;
  value: string;
  swatch?: string;
  onStep: (by: number) => void;
  onGrid?: () => void;
}) {
  return (
    <node style={{ flexDirection: "column", gap: 4, width: 455 }}>
      <node
        style={{
          ...chamfer(PLATE, 14, EDGE, 1, "bl"),
          height: 62,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "spaceBetween",
          padding: { left: 10, right: 8 },
        }}
        hoverStyle={chamfer("#2a0d13", 14, "rgba(255, 93, 81, 0.75)", 1, "bl")}
        onPointerEnter={() => sfx("hover")}
      >
        <text style={{ fontSize: 25, color: C.red, lineBreak: "noWrap" }}>
          {label}
        </text>
        {swatch ? (
          <node
            style={{ ...chamfer(swatch, 8, EDGE, 1), width: 50, height: 50 }}
          />
        ) : (
          <text style={{ fontSize: 25, color: C.red, lineBreak: "noWrap" }}>
            {value}
          </text>
        )}
      </node>
      <node style={{ flexDirection: "row", gap: 4, height: 38 }}>
        <StepButton side="left" onClick={() => onStep(-1)}>
          <Arrow dir="left" size={22} />
        </StepButton>
        {onGrid && (
          <StepButton onClick={onGrid}>
            <GridIcon />
          </StepButton>
        )}
        <StepButton side="right" onClick={() => onStep(1)}>
          <Arrow dir="right" size={22} />
        </StepButton>
      </node>
    </node>
  );
}

/** A stepper plate: ◁, ▷ or the swatch-grid button. */
function StepButton({
  side,
  onClick,
  children,
}: {
  side?: "left" | "right";
  onClick: () => void;
  children: ReactNode;
}) {
  const corner = side === "left" ? "bl" : "br";
  return (
    <button
      onPointerEnter={() => sfx("hover")}
      onClick={onClick}
      style={{
        ...(side
          ? chamfer(STEP, 12, EDGE, 1, corner)
          : { backgroundColor: STEP, border: 1, borderColor: EDGE }),
        flexGrow: 1,
        flexBasis: 0,
        alignItems: "center",
        justifyContent:
          side === "left" ? "flexStart" : side ? "flexEnd" : "center",
        padding: {
          left: side === "left" ? 60 : 0,
          right: side === "right" ? 70 : 0,
        },
      }}
      hoverStyle={
        side
          ? chamfer("#48121a", 12, C.red, 1, corner)
          : { backgroundColor: "#48121a", borderColor: C.red }
      }
    >
      {children}
    </button>
  );
}

/** The four ready-made faces: a click puts one on the card. */
function Presets({
  character,
  onChange,
}: {
  character: Character;
  onChange: (character: Character) => void;
}) {
  return (
    <node
      style={{
        positionType: "absolute",
        left: 76,
        top: 194,
        flexDirection: "column",
        gap: 5,
      }}
    >
      <text
        style={{
          ...T.menu,
          fontSize: 31,
          fontFamily: F.semibold,
          margin: { bottom: 4 },
        }}
      >
        PRESETS
      </text>
      {PRESETS.map((p, i) => {
        const on = Object.entries(p).every(
          ([id, v]) => look(character, id) === v,
        );
        return (
          <button
            key={i}
            onPointerEnter={() => sfx("hover")}
            onClick={() => {
              sfx("click");
              onChange({ ...character, look: { ...character.look, ...p } });
            }}
            style={{
              ...chamfer("#240a0e", 16, on ? C.red : EDGE, 1),
              width: 110,
              height: 160,
              flexDirection: "column",
              alignItems: "center",
              padding: { top: 4 },
            }}
            hoverStyle={chamfer("#3a1016", 16, C.red, 1)}
          >
            <Portrait
              look={{ ...character.look, ...p }}
              body={character.body}
              width={100}
            />
            <node
              style={{
                width: 100,
                height: 1,
                margin: { top: 3, bottom: 4 },
                backgroundColor: EDGE,
              }}
            />
            <node style={{ width: 96, flexDirection: "column" }}>
              <text
                style={{
                  fontSize: 15,
                  fontFamily: F.bold,
                  color: C.red,
                  lineBreak: "noWrap",
                }}
              >
                {`SC+ ${two(i)}`}
              </text>
              <text style={{ ...T.micro, fontSize: 5.5 }}>
                TEMPLATE // RESIDENT
              </text>
            </node>
          </button>
        );
      })}
    </node>
  );
}
