import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";

import { Example } from "@/components";
import { Code, InlineCode, P } from "@/components/docs";
import { Colors, FontSizes } from "@/theme";

export function MoveBetweenCards() {
  return (
    <Example
      title="Tickets board"
      info={
        <>
          <P>
            Click an item to move it to the other card. React re-renders both
            lists: the item unmounts from one and mounts in the other — a
            different parent — in the same commit, so the tag pairs them and the
            new item takes off from where the old one sat, easing its width and
            color to the new card's on the way. The siblings it leaves behind
            close the gap with their own{" "}
            <InlineCode>{"transition: { layout }"}</InlineCode>.
          </P>
          <Code lang="tsx">{`<button
  sharedTag={\`item-\${id}\`}
  onClick={() => move(id)}
  style={{
    backgroundColor: color[side],
    transition: {
      sharedElement: { duration: 400, easing: "easeOut" },
      layout: { duration: 400, easing: "easeOut" },
    },
  }}
/>`}</Code>
        </>
      }
      demo={TicketsBoard}
    />
  );
}

const KANBAN_IDS = ["Alpha", "Bravo", "Charlie", "Delta"];

function TicketsBoard() {
  const [done, setDone] = useState<string[]>(["Delta"]);
  const todo = KANBAN_IDS.filter((id) => !done.includes(id));

  function move(id: string) {
    setDone((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));
  }

  const column = (side: "todo" | "done", ids: string[]) => (
    <node style={kanbanColumn}>
      <text style={kanbanTitle}>{side === "todo" ? "To do" : "Done"}</text>
      {ids.map((id) => (
        <button
          key={id}
          sharedTag={`item-${id}`}
          onClick={() => move(id)}
          style={{
            ...kanbanItem,
            width: "100%",
            backgroundColor:
              side === "todo" ? Colors.primary100 : Colors.green100,
            globalZIndex: 1,
            transition: {
              sharedElement: { duration: 400, easing: "easeOut" },
              layout: { duration: 400, easing: "easeOut" },
            },
          }}
        >
          <text style={kanbanLabel}>{id}</text>
        </button>
      ))}
    </node>
  );

  return (
    <node style={kanbanStage}>
      {column("todo", todo)}
      {column("done", done)}
    </node>
  );
}

const kanbanStage: BevyStyle = {
  flexDirection: "row",
  gap: 16,
};

const kanbanColumn: BevyStyle = {
  flexDirection: "column",
  width: 170,
  minHeight: 250,
  padding: 10,
  gap: 8,
  borderRadius: 8,
  backgroundColor: Colors.surface100,
  transition: { layout: { duration: 300 } },
};

const kanbanTitle: BevyStyle = {
  color: Colors.textColor200,
  fontSize: FontSizes.sm,
  fontWeight: "bold",
  margin: { bottom: 4 },
};

// Both cards' items carry the spec (each is the incoming node in one
// direction); `layout` closes the gap the mover leaves behind.
const kanbanItem: BevyStyle = {
  height: 36,
  padding: 0,
  borderRadius: 8,
  justifyContent: "center",
  alignItems: "center",
  transition: {
    sharedElement: { duration: 400, easing: "easeOut" },
    layout: { duration: 400, easing: "easeOut" },
  },
};

const kanbanLabel: BevyStyle = {
  color: Colors.surface100,
  fontSize: FontSizes.sm,
  fontWeight: "bold",
};
