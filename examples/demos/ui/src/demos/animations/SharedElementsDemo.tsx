import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";

import { Button, DemoRow, Example } from "@/components";
import { B, Code, InlineCode, P } from "@/components/docs";
import { Colors, FontSizes } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

// Shared elements: a `sharedTag` on two nodes that swap in one commit (the
// grid's thumbnail unmounts, the detail's hero mounts) makes the incoming
// node start where the outgoing one was and fly to its own layout. Nothing
// imperative — the commit is the trigger.

const PAGE: ExplanationData = {
  title: "Shared elements",
  info: (
    <>
      <P>
        Give two nodes that swap in one commit the same{" "}
        <InlineCode>sharedTag</InlineCode> and the incoming one{" "}
        <B>starts where the outgoing one was</B> — rect, color, opacity,
        transforms, filters — then eases to its own layout and style. React has
        no reparenting (a "move" is an unmount plus a mount), so identity is the
        tag and the commit is the trigger: no hooks, no measuring.
      </P>
      <Code lang="tsx">{`// grid
<image sharedTag="hero-1" src={thumb} />

// detail, mounted in the same commit
<image
  sharedTag="hero-1"
  src={full}
  style={{
    width: 200,
    transition: {
      sharedElement: { duration: 450 },
    },
  }}
/>`}</Code>
      <P>
        <InlineCode>{"transition: { sharedElement }"}</InlineCode> is the one
        timing for every seeded channel (required). Pairs need the same tag,
        element type and UI root; the first mounted match wins, silently.
      </P>
    </>
  ),
};

export function SharedElementsDemo() {
  useDemoPage(PAGE);

  return (
    <DemoRow>
      <GridToDetail />
      <MoveBetweenCards />
    </DemoRow>
  );
}

function GridToDetail() {
  return (
    <Example
      title="Grid to detail"
      info={
        <>
          <P>
            Click a thumbnail: the grid unmounts and the detail screen mounts in
            the same commit. The hero image carries the thumbnail's tag, so it
            takes off from the thumbnail's rect — mid-flight if you go back
            early — and lands in its own layout. Back reverses it the same way:
            the thumbnail is now the incoming node.
          </P>
          <P>
            The outgoing node unmounts instantly and the flight lives inside the
            new parent (its <InlineCode>overflow</InlineCode> clips it like any
            layout transition), so keep the flight path unclipped.
          </P>
        </>
      }
      demo={GalleryCard}
    />
  );
}

function MoveBetweenCards() {
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
            borderRadius: side === "todo" ? 5 : 20,
            globalZIndex: 1,
            transition: {
              sharedElement: { duration: 4000, easing: "easeOut" },
              layout: { duration: 4000, easing: "easeOut" },
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

const ITEMS = [
  { id: "parrot", src: "images/parrot.png", title: "Parrot" },
  { id: "wheat", src: "images/wheat.png", title: "Wheat" },
  { id: "logo", src: "bevy-react-logo.png", title: "bevy-react" },
];

function GalleryCard() {
  const [open, setOpen] = useState<string | null>(null);
  const item = ITEMS.find((i) => i.id === open);

  return (
    <node style={stage}>
      {item ? (
        <node style={detail}>
          <image src={item.src} sharedTag={`hero-${item.id}`} style={hero} />
          <text style={caption}>{item.title}</text>
          <Button onClick={() => setOpen(null)}>Back</Button>
        </node>
      ) : (
        <node style={grid}>
          {ITEMS.map((i) => (
            <button
              key={i.id}
              onClick={() => setOpen(i.id)}
              style={thumbButton}
            >
              <image src={i.src} sharedTag={`hero-${i.id}`} style={thumb} />
            </button>
          ))}
        </node>
      )}
    </node>
  );
}

// Both halves carry the spec: each is the incoming node in one direction.
const flight: BevyStyle["transition"] = {
  sharedElement: { duration: 450, easing: "easeInOut" },
};

const stage: BevyStyle = {
  width: 320,
  height: 300,
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 8,
  backgroundColor: Colors.surface100,
};

const grid: BevyStyle = {
  flexDirection: "row",
  gap: 16,
};

const thumbButton: BevyStyle = {
  padding: 0,
  borderRadius: 8,
};

const thumb: BevyStyle = {
  width: 72,
  height: 72,
  borderRadius: 8,
  transition: flight,
};

const detail: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
};

const hero: BevyStyle = {
  width: 200,
  height: 200,
  borderRadius: 16,
  transition: flight,
};

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

const caption: BevyStyle = {
  color: Colors.textColor400,
  fontSize: FontSizes.base,
  fontWeight: "bold",
};
