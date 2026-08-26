import { useRef, useState } from "react";
import { BevyStyle, PointerEventData } from "bevy-react/jsx";
import { Button, Example } from "@/components";
import { CodeTabs, InlineCode, P } from "@/components/docs";
import { Colors, FontSizes } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

// A demo of the `name` prop: React names plain nodes, Bevy finds them through
// `ReactNodes` / `Query<(Entity, &Name), With<ReactNode>>` and does its own
// thing with them — here, a 3D pin (tube + glowing ball with inertia) hanging
// off each named card.

const TSX = `// Every card is a plain node; the only
// thing crossing the wire is its name.
{cards.map((id) => (
  <node
    key={id}
    name="pin"
    style={card}
    hoverStyle={cardHover}
  >
    <text>{"#" + id}</text>
  </node>
))}`;

const RUST = `// One 3D pin per node named "pin".
fn sync_pins(
    nodes: ReactNodes,
    cards: Query<(
        &ComputedNode,
        &UiGlobalTransform,
        Option<&Interaction>,
    )>,
) {
    for &card in nodes.all("pin") {
        let Ok(layout) = cards.get(card)
        else { continue };
        // project the card's center onto
        // the ground; pin the tube there,
        // spring the ball after it
    }
}

// sees this frame's mounts/unmounts
app.add_systems(Update,
    sync_pins.after(ReactApplySet));`;

const PAGE: ExplanationData = {
  title: "Named nodes",
  startCollapsed: true,
  info: (
    <>
      <P>
        Any element takes a <InlineCode>name</InlineCode> prop. It lands on the
        entity as a Bevy <InlineCode>Name</InlineCode> component, so Rust code
        can find React-created entities and do whatever it wants with them:
        attach its own components, read layout or{" "}
        <InlineCode>Interaction</InlineCode>, spawn 3D things that follow them.
        Nothing else crosses the wire — no messages, no entity ids.
      </P>
      <CodeTabs tsx={TSX} rust={RUST} />
      <P>
        Two ways in from Bevy: the <InlineCode>ReactNodes</InlineCode> system
        param (<InlineCode>get</InlineCode>, <InlineCode>all</InlineCode>) is a
        hash lookup by name, and a plain{" "}
        <InlineCode>{"Query<(Entity, &Name), With<ReactNode>>"}</InlineCode>{" "}
        composes with <InlineCode>Added</InlineCode> /{" "}
        <InlineCode>RemovedComponents</InlineCode> for mount and unmount. Order
        such systems <InlineCode>.after(ReactApplySet)</InlineCode> to see the
        current frame. Names are not unique: every card here is{" "}
        <InlineCode>{'name="pin"'}</InlineCode> and Bevy keeps one pin per
        match.
      </P>
      <P>
        Here the scene projects each card's screen center onto the ground and
        fixes one end of a tube there; the ball on the other end is a
        spring-damper body, so it lags and swings after the card. Drag the cards
        or switch the container between flexbox and grid — Bevy only ever reads
        the laid-out position (<InlineCode>UiGlobalTransform</InlineCode>, which
        includes a <InlineCode>transform</InlineCode> translation), so it never
        needs to know why a card moved. The bridge owns the components it writes
        (<InlineCode>Node</InlineCode>, colors, text, children); everything else
        on a named entity is yours.
      </P>
    </>
  ),
};

type Offset = { x: number; y: number };

const CARD_IDS = [1, 2, 3, 4, 5, 6];

export function NamedNodesDemo() {
  useDemoPage(PAGE);

  // Per-card drag offsets (logical px), applied as a `transform` translation
  // so the layout box stays put and only the painted/picked rect moves.
  const [offsets, setOffsets] = useState<Record<number, Offset>>({});

  const move = (id: number, dx: number, dy: number) =>
    setOffsets((o) => {
      const prev = o[id] ?? { x: 0, y: 0 };
      return { ...o, [id]: { x: prev.x + dx, y: prev.y + dy } };
    });

  return (
    <>
      <Example
        title="Pinned cards"
        style={{ maxWidth: 400 }}
        info={
          <>
            <P>
              Each card below is <InlineCode>{'<node name="pin">'}</InlineCode>.
              The Bevy side runs <InlineCode>ReactNodes::all("pin")</InlineCode>{" "}
              every frame, spawns a pin for a card it hasn't seen, despawns the
              pin of one that is gone, and keeps the rest pinned under their
              cards — wherever layout or a drag put them.
            </P>
            <CodeTabs tsx={TSX} rust={RUST} />
          </>
        }
      >
        <text style={blurb}>
          Every card below is a plain node named <InlineCode>pin</InlineCode>.
          Bevy looks the cards up by name, pins a tube to each one and lets a
          ball with inertia swing after it.
        </text>

        <text style={{ textAlign: "center" }}>Drag the cards</text>

        <node style={controls}>
          <Button onClick={() => setOffsets({})}>Reset positions</Button>
        </node>
      </Example>

      {/* The draggable cards live outside the card, over the bare scene, so
          the pins are seen unobstructed. */}
      <node style={flexArea}>
        {CARD_IDS.map((id) => (
          <DraggableCard key={id} id={id} offset={offsets[id]} onMove={move} />
        ))}
      </node>
    </>
  );
}

type DraggableCardProps = {
  id: number;
  offset: Offset | undefined;
  onMove: (id: number, dx: number, dy: number) => void;
};

// A named card that can be dragged around: `onPointerMove` fires only while
// the button is held on this node, and `clientX`/`clientY` are absolute window
// px (unclamped), so the deltas between moves are the drag.
function DraggableCard({ id, offset, onMove }: DraggableCardProps) {
  const last = useRef<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const down = (e: PointerEventData) => {
    if (e.button !== 0) return;
    last.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
  };
  const moved = (e: PointerEventData) => {
    if (!last.current) return;
    onMove(id, e.clientX - last.current.x, e.clientY - last.current.y);
    last.current = { x: e.clientX, y: e.clientY };
  };
  const up = () => {
    last.current = null;
    setDragging(false);
  };

  const style: BevyStyle = {
    ...card,
    width: 110,
    transform: { translateX: offset?.x ?? 0, translateY: offset?.y ?? 0 },
    // A dragged card paints over its siblings.
    zIndex: dragging ? 1 : 0,
    cursor: dragging ? "grabbing" : "grab",
  };

  return (
    <node
      name="pin"
      style={style}
      hoverStyle={cardHover}
      onPointerDown={down}
      onPointerMove={moved}
      onPointerUp={up}
    >
      <text style={cardText}>{"#" + id}</text>
    </node>
  );
}

const blurb: BevyStyle = {
  color: Colors.textColor200,
  fontSize: FontSizes.sm,
};

const controls: BevyStyle = {
  flexDirection: "row",
  gap: 10,
  flexWrap: "wrap",
  justifyContent: "center",
};

// The drag space under the card: a roomy, roughly square, otherwise empty
// region over the bare scene. Cards wrap along its top; the rest is room to
// drag them around in.
const areaBase: BevyStyle = {
  padding: 10,
  gap: 12,
  justifyContent: "center",
};

const flexArea: BevyStyle = {
  ...areaBase,
  flexDirection: "row",
  flexWrap: "wrap",
};

const card: BevyStyle = {
  height: 72,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 12,
  border: 1,
  borderColor: "#ffffff1f",
  backgroundColor: Colors.surface300,
  boxShadow: { blurRadius: 10, spreadRadius: 1, color: Colors.shadow100 },
  // Own the press so a drag never starts anything behind the card.
  focusPolicy: "block",
};

const cardHover: BevyStyle = {
  backgroundColor: Colors.surface500,
  borderColor: Colors.primary100,
};

const cardText: BevyStyle = {
  color: Colors.textColor100,
  fontSize: FontSizes.base,
  fontWeight: "bold",
};
