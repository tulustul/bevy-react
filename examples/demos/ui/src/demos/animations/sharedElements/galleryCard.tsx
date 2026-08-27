import { useEffect, useRef, useState } from "react";
import { CardTitle, InlineCode, Paragraph } from "@/components/typography";
import { useSharedValue, withTiming } from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";

import { Button, Example, Stage } from "@/components";
import { Code } from "@/components/docs";

export function Gallery() {
  return (
    <Example
      title="Gallery"
      info={
        <>
          <Paragraph>
            Click a thumbnail: the grid unmounts and the detail screen mounts in
            the same commit. The hero image carries the thumbnail's tag, so it
            takes off from the thumbnail's rect — mid-flight if you go back
            early — and lands in its own layout. Back reverses it the same way:
            the thumbnail is now the incoming node.
          </Paragraph>
          <Paragraph>
            The rest of each screen is not shared, so it fades and scales
            instead: the outgoing screen lingers, absolutely positioned, with
            its shared node swapped for a same-size placeholder (the unmount
            still pairs), and unmounts once its exit animation completes.
          </Paragraph>
          <Code lang="tsx">{`// the outgoing screen lingers, absolute,
// its shared node a placeholder
{exiting ? (
  <node style={heroBox} />
) : (
  <image
    sharedTag={\`hero-\${id}\`}
    style={hero}
  />
)}
<node
  style={{
    ...chrome,
    opacity: { animated: presence },
  }}
/>`}</Code>
          <Paragraph>
            The stage sets <InlineCode>layoutRounding: false</InlineCode>: the
            hero's size flies through real layout, and with pixel rounding on,
            its box and the caption below would grow in whole pixel hops.
          </Paragraph>
          <Paragraph>
            The outgoing node unmounts instantly and the flight lives inside the
            new parent (its <InlineCode>overflow</InlineCode> clips it like any
            layout transition), so keep the flight path unclipped.
          </Paragraph>
        </>
      }
      demo={GalleryCard}
    />
  );
}

const ITEMS = [
  { id: "parrot", src: "images/parrot.png", title: "Parrot" },
  { id: "wheat", src: "images/wheat.png", title: "Wheat" },
  { id: "logo", src: "bevy-react-logo.png", title: "bevy-react" },
];

type Item = (typeof ITEMS)[number];

/// One mounted screen: the grid (`item: null`) or an item's detail. A
/// navigation marks the live screen `exiting` and appends the new one; the
/// exiting screen's shared node (`hero`) becomes a placeholder — its image
/// unmounts in the navigation commit, which is what pairs it with the
/// incoming one — and the screen unmounts once its fade-out completes.
type Screen = {
  id: number;
  item: string | null;
  hero: string | null;
  exiting: boolean;
};

function GalleryCard() {
  const [screens, setScreens] = useState<Screen[]>([
    { id: 0, item: null, hero: null, exiting: false },
  ]);
  const nextId = useRef(1);

  function go(item: string | null, hero: string) {
    const id = nextId.current++;
    setScreens((s) => [
      ...s.map((x) => (x.exiting ? x : { ...x, exiting: true, hero })),
      { id, item, hero, exiting: false },
    ]);
  }
  const exited = (id: number) =>
    setScreens((s) => s.filter((x) => x.id !== id));

  return (
    <Stage style={stage}>
      {screens.map((s) => {
        const item = ITEMS.find((i) => i.id === s.item);
        return item ? (
          <DetailScreen
            key={s.id}
            item={item}
            exiting={s.exiting}
            onBack={() => go(null, item.id)}
            onExited={() => exited(s.id)}
          />
        ) : (
          <GridScreen
            key={s.id}
            hero={s.hero}
            enter={s.id !== 0}
            exiting={s.exiting}
            onOpen={(id) => go(id, id)}
            onExited={() => exited(s.id)}
          />
        );
      })}
    </Stage>
  );
}

function GridScreen({
  hero,
  enter,
  exiting,
  onOpen,
  onExited,
}: {
  hero: string | null;
  enter: boolean;
  exiting: boolean;
  onOpen: (id: string) => void;
  onExited: () => void;
}) {
  const fade = usePresence(enter, exiting, onExited);
  const flying = useFlying(enter);
  return (
    <node style={exiting ? { ...grid, ...overlay } : grid}>
      {ITEMS.map((i) => {
        const shared = i.id === hero;
        return (
          <button
            key={i.id}
            onClick={exiting ? undefined : () => onOpen(i.id)}
            style={shared ? thumbButton : { ...thumbButton, ...fade }}
          >
            {shared && exiting ? null : (
              <image
                src={i.src}
                sharedTag={`hero-${i.id}`}
                style={shared && flying ? { ...thumb, ...aloft } : thumb}
                hoverStyle={{ transform: { scale: 1.1 } }}
              />
            )}
          </button>
        );
      })}
    </node>
  );
}

function DetailScreen({
  item,
  exiting,
  onBack,
  onExited,
}: {
  item: Item;
  exiting: boolean;
  onBack: () => void;
  onExited: () => void;
}) {
  const fade = usePresence(true, exiting, onExited);
  const flying = useFlying(true);
  return (
    <node style={exiting ? { ...detail, ...overlay } : detail}>
      {exiting ? (
        <node style={heroBox} />
      ) : (
        <image
          src={item.src}
          sharedTag={`hero-${item.id}`}
          onClick={onBack}
          style={flying ? { ...hero, ...aloft } : hero}
        />
      )}
      <node style={{ ...detailChrome, ...fade }}>
        <CardTitle>{item.title}</CardTitle>
        <Button onClick={exiting ? undefined : onBack}>Back</Button>
      </node>
    </node>
  );
}

const FADE_MS = 450;
const FLIGHT_MS = 450;

/// Whether a screen's shared node is still in flight: true for the flight's
/// duration after an entering mount. The flyer gets [`aloft`] meanwhile, so
/// it passes over the exiting screen and its siblings.
function useFlying(enter: boolean): boolean {
  const [flying, setFlying] = useState(enter);
  useEffect(() => {
    if (!enter) return;
    const t = setTimeout(() => setFlying(false), FLIGHT_MS);
    return () => clearTimeout(t);
  }, [enter]);
  return flying;
}

/// A screen's presence, 0..1, driven Bevy-side: `enter` fades it in on
/// mount, `exiting` fades it out and reports completion. Returns the style
/// fragment to spread on every non-shared node (opacity + scale bindings).
function usePresence(
  enter: boolean,
  exiting: boolean,
  onExited: () => void,
): BevyStyle {
  const presence = useSharedValue(enter ? 0 : 1);
  const exited = useRef(onExited);
  useEffect(() => {
    exited.current = onExited;
  });
  useEffect(() => {
    if (exiting) {
      presence.value = withTiming(0, {
        duration: FADE_MS,
        easing: "easeInOut",
        onComplete: () => exited.current(),
      });
    } else if (enter) {
      presence.value = withTiming(1, { duration: FADE_MS, easing: "easeOut" });
    }
  }, [presence, enter, exiting]);
  return {
    opacity: { animated: presence },
    transform: { scale: { animated: presence } },
  };
}

// Both halves carry the spec: each is the incoming node in one direction.
const flight: BevyStyle["transition"] = {
  sharedElement: { duration: FLIGHT_MS, easing: "easeInOut" },
  layout: { duration: FLIGHT_MS, easing: "easeInOut" },
};

// Above everything while flying; dropped (unset) once landed.
const aloft: BevyStyle = {
  globalZIndex: 1,
};

// The stage lays both screens out unrounded (inherited): the hero's size
// flies through real layout, and with pixel rounding on, its box and
// everything re-flowing around it would hop in whole pixels (see the
// "Layout rounding" page).
const stage: BevyStyle = {
  width: 320,
  height: 300,
  justifyContent: "center",
  alignItems: "center",
  layoutRounding: false,
};

// An exiting screen leaves the flow: it covers the stage and centers its own
// content — the same spots it had in flow — so the incoming screen lays out
// as if alone.
const overlay: BevyStyle = {
  positionType: "absolute",
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
  justifyContent: "center",
  alignItems: "center",
};

const grid: BevyStyle = {
  flexDirection: "row",
  justifyContent: "center",
  gap: 16,
  padding: 10,
  focusPolicy: "block",
};

// Sized explicitly so the button keeps its slot once its image has flown.
const thumbButton: BevyStyle = {
  width: 72,
  height: 92,
  borderRadius: "50%",
  padding: { horizontal: 0, vertical: 10 },
};

const thumb: BevyStyle = {
  width: 72,
  height: 72,
  borderRadius: 36,
  transform: { scale: 1 },
  transition: { ...flight, transform: { duration: 200 } },
  imageRendering: "trilinear",
};

const detail: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
};

const detailChrome: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
};

const hero: BevyStyle = {
  width: 200,
  height: 200,
  borderRadius: 16,
  transition: flight,
  imageRendering: "trilinear",
};

// The exiting detail's stand-in for the hero: keeps the caption and Back
// where they were while they fade.
const heroBox: BevyStyle = {
  width: 200,
  height: 200,
};
