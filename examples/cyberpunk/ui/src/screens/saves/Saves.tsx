import { useState } from "react";
import { useDebug, useKeys } from "../../hooks";
import { sfx } from "../../sound";
import type { Save } from "../../store";
import { C, F, T } from "../../theme";
import { ProtocolStamp } from "../../ui/decor";
import { FILL, Hint, Hints } from "../../ui/kit";
import { Plate, modalOpen } from "../Dialog";
import { Datashard } from "./icons";
import {
  NewSaveRow,
  ROW_HEIGHT,
  ROW_PITCH,
  ROW_WIDTH,
  SaveRow,
  TEXT_LEFT,
} from "./Row";

const LIST_TOP = 190;
/** Seven rows; more scroll. */
const LIST_HEIGHT = 7 * ROW_PITCH - 4;
/** Both sides of the list, so the rows stay centered with the scrollbar in
 *  the right one. */
const GUTTER = 24;

/** The question a plate is asking about a slot. */
type Ask = { kind: "overwrite" | "delete"; index: number } | null;

const QUESTIONS = {
  overwrite:
    "Write over this save?\nWhatever was on this shard gets flatlined.",
  delete: "Delete this save for good?\nThere is no backup. Nobody keeps one.",
};

/** LOAD GAME / SAVE GAME: the save slots (newest first), each with a
 *  snapshot of its world. Hover selects, a click loads or saves (asking
 *  before overwriting), X deletes the selected slot, Esc closes. */
export function Saves({
  mode,
  saves,
  onLoad,
  onSave,
  onDelete,
  onClose,
}: {
  mode: "load" | "save";
  saves: Save[];
  /** In game, loading asks first (unsaved progress is lost). */
  inGame: boolean;
  onLoad: (save: Save) => void;
  /** Save into a new slot (`null`) or over `overwrite`. */
  onSave: (overwrite: Save | null) => void;
  onDelete: (save: Save) => void;
  onClose: () => void;
}) {
  const saving = mode === "save";
  /** In save mode the blank slot comes first. */
  const slots: (Save | null)[] = saving ? [null, ...saves] : saves;
  const [selected, setSelected] = useState(0);
  const [ask, setAsk] = useState<Ask>(null);
  /** The list's scroll offset, to lay the plate over the right row. */
  const [scroll, setScroll] = useState(0);

  const select = (i: number) => {
    if (i === selected) return;
    sfx("hover");
    setSelected(i);
  };
  const pick = (i: number) => {
    const save = slots[i];
    sfx("click");
    setSelected(i);
    if (!saving) {
      if (save) onLoad(save);
    } else if (save) {
      setAsk({ kind: "overwrite", index: i });
    } else {
      // The fresh save lands on top of the list, under the blank slot.
      onSave(null);
      setSelected(1);
    }
  };
  const askDelete = () => {
    if (!slots[selected]) return sfx("error");
    sfx("click");
    setAsk({ kind: "delete", index: selected });
  };
  const answer = () => {
    const save = ask && slots[ask.index];
    if (!save) return;
    if (ask.kind === "overwrite") {
      onSave(save);
      setSelected(1);
    } else {
      onDelete(save);
      setSelected(Math.min(selected, slots.length - 2));
    }
    setAsk(null);
  };
  const close = () => {
    sfx("back");
    onClose();
  };

  useKeys((e) => {
    if (modalOpen()) return;
    if (e.key === "Escape") close();
    else if (e.code === "KeyX") askDelete();
  });
  // `--shoot` steps: `hover <row>`, `pick <row>`, `delete` (the selected).
  useDebug("hover", (i) => setSelected(Number(i)));
  useDebug("pick", (i) => pick(Number(i)));
  useDebug("delete", askDelete);

  return (
    <node style={{ ...FILL, backgroundColor: "rgba(3, 5, 9, 0.42)" }}>
      <Decor />
      <node
        style={{
          positionType: "absolute",
          left: 0,
          right: 0,
          top: LIST_TOP,
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <node
          onScroll={(e) => setScroll(e.scrollTop)}
          style={{
            width: ROW_WIDTH + 2 * GUTTER,
            height: LIST_HEIGHT,
            padding: { left: GUTTER },
            flexDirection: "column",
            gap: ROW_PITCH - ROW_HEIGHT,
            overflowY: "scroll",
            scrollbarWidth: GUTTER,
            scrollbar: {
              track: { backgroundColor: "rgba(255, 93, 81, 0.14)" },
              thumb: {
                backgroundColor: C.red,
                hover: { backgroundColor: C.redHi },
              },
              thickness: 3,
            },
          }}
        >
          {slots.map((save, i) =>
            save ? (
              <SaveRow
                key={save.id}
                save={save}
                index={i}
                selected={i === selected}
                onSelect={() => select(i)}
                onClick={() => pick(i)}
              />
            ) : (
              <NewSaveRow
                key="new"
                selected={i === selected}
                onSelect={() => select(i)}
                onClick={() => pick(i)}
              />
            ),
          )}
          {slots.length === 0 && (
            <text
              style={{ fontSize: 24, color: C.redDim, margin: { top: 40 } }}
            >
              No save data on this deck.
            </text>
          )}
        </node>
      </node>
      <Hints>
        <Hint k="mouse" label="Select" />
        <Hint k="X" label="Delete Save" onClick={askDelete} />
        <Hint k="ESC" label="Close" onClick={close} />
      </Hints>
      {ask && (
        <node
          style={{
            ...FILL,
            backgroundColor: "rgba(1, 2, 5, 0.88)",
            flexDirection: "column",
            alignItems: "center",
            focusPolicy: "block",
          }}
          hoverStyle={{}}
        >
          {/* The asked-about row's place; the plate covers its text. */}
          <node
            style={{
              width: ROW_WIDTH,
              margin: { top: LIST_TOP + ask.index * ROW_PITCH - scroll + 1 },
            }}
          >
            <Plate
              text={QUESTIONS[ask.kind]}
              icon={<Datashard width={118} />}
              onConfirm={answer}
              onCancel={() => setAsk(null)}
              style={{ margin: { left: TEXT_LEFT - 8 } }}
            />
          </node>
        </node>
      )}
      <Header title={saving ? "SAVE GAME" : "LOAD GAME"} />
    </node>
  );
}

/** The title centered under a long red arc, the protocol stamp top left. */
function Header({ title }: { title: string }) {
  return (
    <>
      <svg
        viewBox="0 0 1920 100"
        style={{
          positionType: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 100,
        }}
      >
        <path
          d="M 200 61.7 Q 1041.7 115.3 1878 47"
          stroke={C.red}
          strokeWidth={1.6}
          fill="none"
        />
      </svg>
      <ProtocolStamp style={{ left: 36, top: 4 }} />
      <node
        style={{
          positionType: "absolute",
          left: 0,
          right: 0,
          top: 36,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 4,
        }}
      >
        <svg viewBox="0 0 26 26" style={{ width: 26, height: 26 }}>
          <polygon
            points={[13, 1.5, 24.5, 13, 13, 24.5, 1.5, 13]}
            stroke={C.red}
            strokeWidth={2}
            fill="none"
          />
          <rect x={6} y={10.5} width={14} height={5} rx={1} fill={C.red} />
        </svg>
        <text
          style={{ ...T.micro, fontSize: 5, color: C.red, lineHeight: 1.15 }}
        >
          {"0110 101\n1001 110\n0111 001\n1010 011"}
        </text>
        <text
          style={{
            fontSize: 34,
            fontFamily: F.semibold,
            color: C.red,
            lineBreak: "noWrap",
            margin: { left: 4, top: 6 },
          }}
        >
          {title}
        </text>
      </node>
    </>
  );
}

/** The rails: faint dashes down an edge (one path). */
const DASHES = Array.from(
  { length: 135 },
  (_, i) => `M0 ${i * 8}h2v4h-2z`,
).join("");

/** The small print: dotted rails down the edges with a readout turned up
 *  the left one, readouts along the bottom. */
function Decor() {
  const micro = { ...T.micro, fontSize: 11, color: C.redDim };
  const rail = (side: "left" | "right") => (
    <svg
      style={{
        positionType: "absolute",
        [side]: 18,
        top: 0,
        width: 2,
        height: 1080,
      }}
    >
      <path d={DASHES} fill="rgba(255, 93, 81, 0.2)" />
    </svg>
  );
  return (
    <>
      {rail("left")}
      {rail("right")}
      <node
        style={{
          positionType: "absolute",
          left: 13,
          top: 425,
          width: 6,
          height: 6,
          backgroundColor: C.redDim,
        }}
      />
      <node
        style={{
          positionType: "absolute",
          left: 27,
          top: 423,
          width: 16,
          height: 17,
          backgroundColor: C.redDeep,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <text
          style={{
            ...micro,
            fontFamily: F.bold,
            fontSize: 12,
            color: "#ffb3ad",
          }}
        >
          1
        </text>
      </node>
      <text
        style={{
          ...micro,
          fontSize: 13,
          lineBreak: "noWrap",
          positionType: "absolute",
          left: 16 - 150,
          top: 574,
          width: 300,
          textAlign: "center",
          transform: { rotate: -90 },
        }}
      >
        00032 05 54 08 CP 00032 05 54 08 CP
      </text>
      <text
        style={{
          ...micro,
          positionType: "absolute",
          left: 52,
          bottom: 26,
          transform: { rotate: -2 },
        }}
      >
        {"00032 05 54 08 CP  00032 05 54 08 CP\n00032 05 54 08"}
      </text>
      <node
        style={{
          positionType: "absolute",
          left: 0,
          right: 0,
          bottom: 8,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
        }}
      >
        <node style={{ width: 6, height: 6, backgroundColor: C.redDim }} />
        <node
          style={{
            width: 16,
            height: 16,
            border: 1,
            borderColor: C.redDim,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <text style={{ ...micro, fontFamily: F.bold, fontSize: 10 }}>B</text>
        </node>
        <text style={{ ...micro, margin: { left: 36 } }}>
          SBL 102 TNK 151 CC10 A55
        </text>
        <text style={micro}>10 A55 ←</text>
      </node>
    </>
  );
}
