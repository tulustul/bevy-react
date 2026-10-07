import { useState } from "react";
import type { Note } from "../game";
import { useSlideIn } from "../hooks";
import { C, gilt, panel } from "../theme";
import { Icon } from "../ui/Icon";
import { radial } from "../ui/kit";

/** The stack of round notices down the right edge. New ones slide in on
 *  top and push the rest down; hover one to read it, click to dismiss. */
export function Notifications({
  notes,
  onDismiss,
}: {
  notes: Note[];
  onDismiss: (id: number) => void;
}) {
  return (
    <node
      style={{
        positionType: "absolute",
        right: 16,
        top: 128,
        flexDirection: "column",
        alignItems: "flexEnd",
        gap: 10,
      }}
    >
      {notes.map((n) => (
        <Notice key={n.id} note={n} onDismiss={() => onDismiss(n.id)} />
      ))}
    </node>
  );
}

function Notice({ note, onDismiss }: { note: Note; onDismiss: () => void }) {
  const [hover, setHover] = useState(false);
  const enter = useSlideIn(90, 0);
  return (
    <node
      style={{
        ...enter,
        transition: { layout: { duration: 300, easing: "easeOut" } },
      }}
    >
      {hover && (
        <node
          style={{
            ...panel,
            positionType: "absolute",
            right: 56,
            top: "50%",
            transform: { translateY: "-50%" },
            flexDirection: "column",
            padding: { horizontal: 12, vertical: 7 },
            gap: 2,
          }}
        >
          <text
            style={{ fontSize: 12, fontWeight: "semibold", color: note.color }}
          >
            {note.title}
          </text>
          <text style={{ fontSize: 12, color: C.text, lineBreak: "noWrap" }}>
            {note.body}
          </text>
        </node>
      )}
      <button
        onClick={onDismiss}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        style={{
          width: 46,
          height: 46,
          borderRadius: 23,
          padding: 2,
          backgroundGradient: gilt,
          boxShadow: { color: "rgba(0, 0, 0, 0.5)", blurRadius: 8, yOffset: 2 },
        }}
        hoverStyle={{ transform: { scale: 1.08 } }}
      >
        <node
          style={{
            flexGrow: 1,
            borderRadius: 21,
            alignItems: "center",
            justifyContent: "center",
            backgroundGradient: radial(C.slateHi, C.ink),
          }}
        >
          <Icon name={note.icon} size={22} color={note.color} />
        </node>
      </button>
    </node>
  );
}
