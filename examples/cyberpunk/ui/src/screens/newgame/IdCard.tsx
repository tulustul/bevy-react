import { useEffect, useState, type ReactNode } from "react";
import type { BevyStyle } from "bevy-react";
import {
  interpolate,
  useSharedValue,
  withSequence,
  withTiming,
} from "bevy-react";
import { useKeys } from "../../hooks";
import { DIFFICULTIES, LIFEPATHS, type Character } from "../../store";
import { C, F, T, chamfer } from "../../theme";
import { VOICE, hash, residentId } from "./data";
import { LifepathIcon } from "./glyphs";
import { Barcode } from "./parts";
import { Portrait } from "./Portrait";
import { RULE, Radar } from "./Radar";

const W = 480;
const H = 640;

/** The Sable City resident ID of the character being made — every field
 *  live: the scanned portrait (re-scanned on each change), the handle
 *  (click to edit; Enter or Esc to finish), the ID number and barcode
 *  derived from it, the lifepath, body, voice, difficulty and an
 *  attribute radar. `onEditing` reports the handle field's focus, so the
 *  step's shortcuts stay out of the way while typing. */
export function IdCard({
  character,
  onChange,
  onEditing,
  style,
}: {
  character: Character;
  onChange: (character: Character) => void;
  onEditing: (editing: boolean) => void;
  style?: BevyStyle;
}) {
  // Focus only leaves a text field for another focusable, so finishing an
  // edit remounts the field (a despawned field drops the focus).
  const [field, setField] = useState(0);
  const [editing, setEditing] = useState(false);
  const edit = (on: boolean) => {
    setEditing(on);
    onEditing(on);
  };
  useKeys((e) => {
    if (editing && (e.key === "Enter" || e.key === "Escape")) {
      setField(field + 1);
      edit(false);
    }
  });

  const scan = useSharedValue(1);
  const lookKey = JSON.stringify(character.look) + character.body;
  useEffect(() => {
    scan.value = withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(1, { duration: 650, easing: "easeInOut" }),
    );
  }, [lookKey, scan]);

  const lifepath = LIFEPATHS.find((l) => l.id === character.lifepath)!;
  const difficulty = DIFFICULTIES.find((d) => d.id === character.difficulty)!;
  return (
    <node
      style={{
        ...chamfer("#0d0a10", 34, "rgba(255, 93, 81, 0.6)", 1),
        width: W,
        height: H,
        ...style,
      }}
    >
      <Head />
      <node
        style={{
          positionType: "absolute",
          left: 20,
          top: 78,
          width: 190,
          height: 238,
          border: 1,
          borderColor: "rgba(94, 246, 255, 0.28)",
          backgroundColor: "#07090e",
          overflowX: "clip",
          overflowY: "clip",
        }}
      >
        <Portrait look={character.look} body={character.body} width={188} />
        <node
          style={{
            positionType: "absolute",
            left: 0,
            right: 0,
            top: -3,
            height: 3,
            backgroundColor: C.cyan,
            opacity: {
              animated: interpolate(scan, [0, 0.04, 0.9, 1], [0, 0.9, 0.9, 0]),
            },
            transform: {
              translateY: { animated: interpolate(scan, [0, 1], [0, 240]) },
            },
          }}
        />
      </node>
      <text
        style={{
          ...T.micro,
          positionType: "absolute",
          left: 20,
          top: 320,
          color: C.cyanDim,
        }}
      >
        BIOMETRIC SCAN 01 // LIVE
      </text>
      <node
        style={{
          positionType: "absolute",
          left: 228,
          top: 72,
          width: 232,
          flexDirection: "column",
          gap: 6,
        }}
      >
        <node style={{ flexDirection: "column", gap: 2 }}>
          <node
            style={{ flexDirection: "row", justifyContent: "spaceBetween" }}
          >
            <Label>HANDLE</Label>
            <Label color={editing ? C.cyan : C.redDim}>
              {editing ? "ENTER TO CONFIRM" : "CLICK TO EDIT"}
            </Label>
          </node>
          <editableText
            key={field}
            value={character.handle}
            maxLength={12}
            onChange={(v) =>
              onChange({ ...character, handle: v.toUpperCase() })
            }
            onFocus={() => edit(true)}
            onBlur={() => edit(false)}
            style={{
              width: 232,
              height: 44,
              padding: { horizontal: 4 },
              border: { bottom: 2 },
              borderColor: "rgba(255, 93, 81, 0.6)",
              fontSize: 36,
              fontFamily: F.bold,
              color: C.cyan,
              letterSpacing: 1,
              cursor: "text",
            }}
            focusStyle={{ borderColor: C.cyan, backgroundColor: "#0f1d24" }}
          />
        </node>
        <Field label="RESIDENT NO.">
          <text
            style={{
              fontSize: 15,
              fontFamily: F.mono,
              color: C.white,
              lineBreak: "noWrap",
            }}
          >
            {residentId(character.handle)}
          </text>
        </Field>
        <Field label="LIFEPATH">
          <node style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <LifepathIcon id={lifepath.id} />
            <Value>{lifepath.name.toUpperCase()}</Value>
          </node>
        </Field>
        <Field label="BODY TYPE">
          <Value>
            {character.body === 0 ? "FRAME A // BROAD" : "FRAME B // SLIGHT"}
          </Value>
        </Field>
        <Field label="VOICE TONE">
          <Value>{VOICE.names[character.voice]}</Value>
        </Field>
        <Field label="DIFFICULTY">
          <Value>{difficulty.name}</Value>
        </Field>
      </node>
      <node
        style={{
          positionType: "absolute",
          left: 20,
          right: 20,
          top: RULE,
          height: 1,
          backgroundColor: "rgba(255, 93, 81, 0.45)",
        }}
      />
      <Radar attributes={character.attributes} />
      <node
        style={{
          positionType: "absolute",
          left: 20,
          top: RULE + 210,
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Barcode seed={hash(character.handle)} width={300} height={30} />
        <text style={{ ...T.micro, color: C.red, lineBreak: "noWrap" }}>
          {`${residentId(character.handle).replace(/-/g, " ")}  ${hash(
            character.handle + "#",
          )
            .toString(16)
            .toUpperCase()}`}
        </text>
      </node>
      <text
        style={{
          ...T.micro,
          positionType: "absolute",
          left: 340,
          top: RULE + 213,
          width: 110,
          fontSize: 7.5,
          color: C.redDim,
        }}
      >
        {
          "PROPERTY OF THE CITY\nOF SABLE. VOID IF\nTAMPERED WITH. CARRY\nAT ALL TIMES."
        }
      </text>
    </node>
  );
}

/** The card's head: the registry mark, the title and its small print,
 *  and a chip. */
function Head() {
  return (
    <>
      <node
        style={{
          positionType: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 60,
          backgroundGradient: {
            type: "linear",
            angle: 90,
            stops: [{ color: "#3c1218" }, { color: "#1a0c12" }],
          },
          border: { bottom: 1 },
          borderColor: "rgba(255, 93, 81, 0.6)",
        }}
      />
      <svg
        viewBox="0 0 60 40"
        style={{
          positionType: "absolute",
          left: 16,
          top: 12,
          width: 48,
          height: 32,
        }}
      >
        <polygon
          points={[2, 38, 16, 8, 26, 26, 32, 14, 40, 28, 46, 6, 58, 38]}
          fill="none"
          stroke={C.red}
          strokeWidth={3}
        />
      </svg>
      <text
        style={{
          positionType: "absolute",
          left: 74,
          top: 8,
          fontSize: 24,
          fontFamily: F.bold,
          color: C.red,
          letterSpacing: 1,
          lineBreak: "noWrap",
        }}
      >
        SABLE CITY RESIDENT ID
      </text>
      <text
        style={{
          ...T.micro,
          positionType: "absolute",
          left: 75,
          top: 38,
          fontSize: 8,
        }}
      >
        {
          "CITIZEN REGISTRY // DISTRICT 04 // ISSUED 10.07.91\nGRIDWATCH CLEARED // CLASS C // VALID UNTIL REVOKED"
        }
      </text>
      <svg
        viewBox="0 0 34 26"
        style={{
          positionType: "absolute",
          right: 16,
          top: 16,
          width: 34,
          height: 26,
        }}
      >
        <rect
          x={1}
          y={1}
          width={32}
          height={24}
          rx={4}
          fill="#1e2a2e"
          stroke={C.cyanDim}
          strokeWidth={1.2}
        />
        <path
          d="M1 9H11V17H1M33 9H23V17H33M11 1V25M23 1V25M11 13H23"
          fill="none"
          stroke={C.cyanDim}
          strokeWidth={1}
        />
      </svg>
    </>
  );
}

/** A field's name: tiny, spaced, mono. */
function Label({
  children,
  color = C.redDim,
}: {
  children: string;
  color?: string;
}) {
  return (
    <text
      style={{
        ...T.micro,
        fontSize: 10,
        color,
        letterSpacing: 1,
        lineBreak: "noWrap",
      }}
    >
      {children}
    </text>
  );
}

/** A field's value: semibold cyan. */
function Value({ children }: { children: string }) {
  return (
    <text
      style={{
        fontSize: 21,
        fontFamily: F.semibold,
        color: C.cyan,
        lineBreak: "noWrap",
      }}
    >
      {children}
    </text>
  );
}

/** A labelled field. */
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <node style={{ flexDirection: "column", gap: 1 }}>
      <Label>{label}</Label>
      {children}
    </node>
  );
}
