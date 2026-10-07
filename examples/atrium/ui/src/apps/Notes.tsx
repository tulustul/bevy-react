import { useState } from "react";
import { Colors, SNAP } from "../theme";
import { Header } from "./Header";

export type Step = "look" | "move" | "sky" | "lens" | "note";

export const STEPS: { id: Step; text: string }[] = [
  { id: "look", text: "Look around — drag with the right mouse button" },
  { id: "move", text: "Move a window by the bar beneath it" },
  { id: "sky", text: "Borrow the sky of another place in Skies" },
  { id: "lens", text: "Find yourself through one of the Lenses" },
  { id: "note", text: "Leave a note below — it's a real text field" },
];

/** Notes: the welcome, and a tour that ticks itself off as you go — the
 *  look-around and window-moving steps are reported by Bevy (`tour.*`
 *  events), the rest by the other apps. */
export function Notes({
  done,
  onTyped,
}: {
  done: Set<Step>;
  onTyped: () => void;
}) {
  const [note, setNote] = useState("");
  const all = done.size === STEPS.length;
  return (
    <node style={{ flexGrow: 1, flexDirection: "column", padding: 26 }}>
      <Header label="Notes" title="Welcome to Atrium" />
      <text
        style={{
          fontSize: 14.5,
          lineHeight: 1.45,
          color: Colors.muted,
          margin: { top: 10 },
        }}
      >
        Every window here is a React app, drawn by Bevy onto glass in a living
        world. None of it is a web page.
      </text>

      <node
        style={{
          margin: { top: 18, bottom: 6 },
          flexDirection: "row",
          justifyContent: "spaceBetween",
        }}
      >
        <text
          style={{
            fontSize: 12,
            fontWeight: "semibold",
            letterSpacing: 1.6,
            color: Colors.faint,
          }}
        >
          {all ? "ALL DONE — LOOK AT THE LAKE" : "TRY THIS"}
        </text>
        <text style={{ fontSize: 12, color: Colors.faint }}>
          {`${done.size} of ${STEPS.length}`}
        </text>
      </node>
      {STEPS.map((s) => (
        <Check key={s.id} text={s.text} checked={done.has(s.id)} />
      ))}

      <node
        style={{
          margin: { top: 14 },
          height: 74,
          borderRadius: 16,
          padding: { horizontal: 14, vertical: 10 },
          backgroundColor: Colors.platter,
        }}
      >
        {note === "" && (
          <text
            style={{
              positionType: "absolute",
              left: 14,
              top: 10,
              fontSize: 14.5,
              color: Colors.faint,
            }}
          >
            Write something…
          </text>
        )}
        <editableText
          multiline
          maxLength={160}
          value={note}
          onChange={(v) => {
            setNote(v);
            if (v.trim() !== "") onTyped();
          }}
          style={{ flexGrow: 1, fontSize: 14.5, color: Colors.text }}
        />
      </node>
    </node>
  );
}

function Check({ text, checked }: { text: string; checked: boolean }) {
  return (
    <node
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        height: 34,
      }}
    >
      <node
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          border: 1.5,
          alignItems: "center",
          justifyContent: "center",
          borderColor: checked ? Colors.ok : "rgba(255, 255, 255, 0.45)",
          backgroundColor: checked ? Colors.ok : "rgba(255, 255, 255, 0)",
          transition: { backgroundColor: SNAP },
        }}
      >
        {checked && (
          <svg viewBox="0 0 20 20" style={{ width: 14, height: 14 }}>
            <path
              d="M5 10.5l3.2 3.2L15 7"
              fill="none"
              stroke="#0d1a14"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </node>
      <text
        style={{
          fontSize: 14.5,
          color: checked ? Colors.faint : Colors.text,
        }}
      >
        {text}
      </text>
    </node>
  );
}
