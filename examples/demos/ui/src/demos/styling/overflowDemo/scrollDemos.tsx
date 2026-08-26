import { useState } from "react";
import { BevyStyle, ScrollbarStyle } from "bevy-react/jsx";
import { Button, Example } from "@/components";
import { Code, InlineCode, P } from "@/components/docs";
import { Colors, FontSizes } from "@/theme";
import { caption, controlColumn } from "../shared";

export function WheelScrollDemo() {
  return (
    <Example
      title="Scrollports"
      info={
        <>
          <P>
            <InlineCode>overflowY: "scroll"</InlineCode> clips a tall child and
            makes the node a wheel-scrollable container. Hover the list and
            scroll — no extra props needed.
          </P>
          <Code lang="tsx">{`<node style={{ height: 180, overflowY: "scroll", scrollbarWidth: 8 }}>
  {items.map((item) => (
    <node key={item}>
      <text>{item}</text>
    </node>
  ))}
</node>`}</Code>
        </>
      }
      demo={WheelScrollCard}
    />
  );
}

function WheelScrollCard() {
  return (
    <node style={listStyle}>
      {ITEMS.map((item) => (
        <node key={item} style={rowStyle}>
          <text style={{ color: Colors.textColor100, fontSize: FontSizes.sm }}>
            {item}
          </text>
        </node>
      ))}
    </node>
  );
}

// A controlled scroll container: `scrollTop` is React state, kept in sync from the
// wheel via `onScroll` and jumped programmatically by the buttons. The readout
// proves the round trip (Bevy to React on wheel, React to Bevy on a button press).
export function ControlledScrollDemo() {
  return (
    <Example
      title="Controlled scroll position"
      info={
        <>
          <P>
            A controlled scroll container: <InlineCode>scrollTop</InlineCode> is
            React state. <InlineCode>onScroll</InlineCode> syncs it from the
            wheel; the buttons jump the offset by writing{" "}
            <InlineCode>scrollTop</InlineCode> back. The readout shows the live
            value.
          </P>
          <Code lang="tsx">{`const [scrollTop, setScrollTop] = useState(0);

<node
  style={{ overflowY: "scroll" }}
  scrollTop={scrollTop}
  onScroll={(e) => setScrollTop(e.scrollTop)}
>
  …
</node>

<Button onClick={() => setScrollTop(0)}>Top</Button>
<Button onClick={() => setScrollTop(10_000)}>Bottom</Button>`}</Code>
        </>
      }
      demo={ControlledScrollCard}
    />
  );
}

function ControlledScrollCard() {
  const [scrollTop, setScrollTop] = useState(0);
  return (
    <node style={controlColumn}>
      <node
        style={listStyle}
        scrollTop={scrollTop}
        onScroll={(e) => setScrollTop(e.scrollTop)}
      >
        {ITEMS.map((item) => (
          <node key={item} style={rowStyle}>
            <text
              style={{ color: Colors.textColor100, fontSize: FontSizes.sm }}
            >
              {item}
            </text>
          </node>
        ))}
      </node>
      <node style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Button onClick={() => setScrollTop(0)}>Top</Button>
        <Button onClick={() => setScrollTop(10_000)}>Bottom</Button>
        <text style={caption}>{`scrollTop: ${Math.round(scrollTop)}`}</text>
      </node>
    </node>
  );
}

// Smooth (eased) scroll. The `transition: { scroll }` style eases `ScrollPosition`
// toward its target instead of snapping, so each wheel notch glides
// (`scrollStep` sets the per-line distance).
export function SmoothScrollDemo() {
  return (
    <Example
      title="Smooth scrolling"
      info={
        <>
          <P>
            A <InlineCode>scroll</InlineCode> transition eases the offset
            instead of snapping: each wheel notch glides to its target (
            <InlineCode>scrollStep</InlineCode> sets the per-line distance).
            Compare with the plain wheel list, which jumps.
          </P>
          <Code lang="tsx">{`<node
  style={{
    overflowY: "scroll",
    transition: { scroll: { duration: 200, easing: "easeOut" } },
  }}
  scrollStep={50}
>`}</Code>
        </>
      }
      demo={SmoothScrollCard}
    />
  );
}

function SmoothScrollCard() {
  return (
    <node style={controlColumn}>
      <node
        style={{
          ...listStyle,
          transition: { scroll: { duration: 200, easing: "easeOut" } },
        }}
        scrollStep={50}
      >
        {ITEMS.map((item) => (
          <node key={item} style={rowStyle}>
            <text
              style={{ color: Colors.textColor100, fontSize: FontSizes.sm }}
            >
              {item}
            </text>
          </node>
        ))}
      </node>
    </node>
  );
}

// One card per scrollbar variant: the same scrollable list, differing only in
// its `scrollbar` style. Every bar is draggable (thumb) and pages on a track
// click.
export function ScrollbarDefaultDemo() {
  return (
    <Example
      title="Default scrollbars"
      info={
        <>
          <P>
            <InlineCode>style.scrollbar</InlineCode> adds a visible, draggable
            scrollbar; <InlineCode>"default"</InlineCode> is the built-in bar.
            Drag the thumb or click the track to page.
          </P>
          <Code lang="tsx">{`<node style={{ overflowY: "scroll", scrollbar: "default" }}>`}</Code>
        </>
      }
      demo={ScrollbarDefaultCard}
    />
  );
}

function ScrollbarDefaultCard() {
  return <ScrollList scrollbar="default" />;
}

export function ScrollbarStyledDemo() {
  return (
    <Example
      title="Styled scrollbars"
      info={
        <>
          <P>
            A fully styled bar: <InlineCode>track</InlineCode> and{" "}
            <InlineCode>thumb</InlineCode> take node-like styles (color,
            radius), and <InlineCode>thickness</InlineCode> sets its width. By
            default the bar reserves a gutter, so the content shrinks to make
            room.
          </P>
          <Code lang="tsx">{`scrollbar: {
  track: { backgroundColor: "#00000088", borderRadius: 8 },
  thumb: { backgroundColor: "#7aa2f7", borderRadius: 8 },
  thickness: 20,
}`}</Code>
        </>
      }
      demo={ScrollbarStyledCard}
    />
  );
}

function ScrollbarStyledCard() {
  return <ScrollList scrollbar={customBar} />;
}

export function ScrollbarFloatDemo() {
  return (
    <Example
      title="Floating scrollbars"
      info={
        <>
          <P>
            <InlineCode>position: "float"</InlineCode> overlays the bar on the
            content instead of reserving a gutter — the list keeps its full
            width and the bar rides on top. The default is{" "}
            <InlineCode>"gutter"</InlineCode>.
          </P>
          <Code lang="tsx">{`scrollbar: {
  track: { backgroundColor: "#00000088", borderRadius: 8 },
  thumb: { backgroundColor: "#7aa2f7", borderRadius: 8 },
  thickness: 20,
  position: "float",
}`}</Code>
        </>
      }
      demo={ScrollbarFloatCard}
    />
  );
}

function ScrollbarFloatCard() {
  return <ScrollList scrollbar={floatBar} />;
}

export function ScrollbarLeftDemo() {
  return (
    <Example
      title="Left-side scrollbars"
      info={
        <>
          <P>
            <InlineCode>verticalSide</InlineCode> picks the edge the vertical
            bar sits on: <InlineCode>"left"</InlineCode> moves it across from
            the default <InlineCode>"right"</InlineCode>.
          </P>
          <Code lang="tsx">{`scrollbar: {
  track: { backgroundColor: "#00000088", borderRadius: 8 },
  thumb: { backgroundColor: "#7aa2f7", borderRadius: 8 },
  thickness: 20,
  verticalSide: "left",
}`}</Code>
        </>
      }
      demo={ScrollbarLeftCard}
    />
  );
}

function ScrollbarLeftCard() {
  return <ScrollList scrollbar={leftBar} />;
}

export function ScrollbarStatesDemo() {
  return (
    <Example
      title="Thumb hover and press"
      info={
        <>
          <P>
            <InlineCode>hover</InlineCode> and <InlineCode>pressed</InlineCode>{" "}
            styles nest inside <InlineCode>thumb</InlineCode>: this one
            brightens on hover and turns blue while dragging (pressed wins over
            hover).
          </P>
          <Code lang="tsx">{`scrollbar: {
  thumb: {
    backgroundColor: "#313244",
    borderRadius: 8,
    hover: { backgroundColor: "#a6adc8" },
    pressed: { backgroundColor: "#7aa2f7" },
  },
  thickness: 10,
}`}</Code>
        </>
      }
      demo={ScrollbarStatesCard}
    />
  );
}

function ScrollbarStatesCard() {
  return <ScrollList scrollbar={statesBar} />;
}

function ScrollList({
  scrollbar,
}: {
  scrollbar: "none" | "default" | ScrollbarStyle;
}) {
  return (
    <node style={{ ...showcaseList, scrollbar }}>
      {ITEMS.map((item) => (
        <node key={item} style={rowStyle}>
          <text style={{ color: Colors.textColor100, fontSize: FontSizes.sm }}>
            {item}
          </text>
        </node>
      ))}
    </node>
  );
}

// Two horizontally-scrolling rows that differ only in which edge the bar sits on
// (bottom, reserving a gutter; top, floating over the content).
export function HorizontalScrollbarDemo() {
  return (
    <Example
      title="Horizontal scrollbars"
      info={
        <>
          <P>
            A horizontal scrollbar: <InlineCode>overflowX: "scroll"</InlineCode>{" "}
            on a fixed-width row whose tiles refuse to shrink, so the row
            overflows. The bar sits on the bottom edge by default;{" "}
            <InlineCode>horizontalSide: "top"</InlineCode> (with{" "}
            <InlineCode>position: "float"</InlineCode>) moves it above the
            content. Drag the thumb or click the track to page.
          </P>
          <Code lang="tsx">{`<node
  style={{
    width: 360,
    overflowX: "scroll",
    scrollbar: {
      thumb: { backgroundColor: "#7aa2f7", borderRadius: 8 },
      thickness: 10,
      horizontalSide: "bottom", // or "top"
    },
  }}
>`}</Code>
        </>
      }
      demo={HorizontalScrollbarCard}
    />
  );
}

function HorizontalScrollbarCard() {
  return (
    <node style={{ flexDirection: "column", gap: 16, width: "100%" }}>
      <HScrollList label='horizontalSide: "bottom"' scrollbar={hBottomBar} />
      <HScrollList label='horizontalSide: "top" (float)' scrollbar={hTopBar} />
    </node>
  );
}

function HScrollList({
  label,
  scrollbar,
}: {
  label: string;
  scrollbar: ScrollbarStyle;
}) {
  return (
    <node style={{ flexDirection: "column", gap: 6, width: "100%" }}>
      <text style={caption}>{label}</text>
      <node style={{ ...hScrollRow, scrollbar }}>
        {HTILES.map((n) => (
          <node key={n} style={hTileStyle}>
            <text
              style={{
                color: Colors.textColor400,
                fontSize: FontSizes.base,
                fontWeight: "bold",
              }}
            >
              {n}
            </text>
          </node>
        ))}
      </node>
    </node>
  );
}

// A longer-than-its-box list to demonstrate wheel scrolling. The container sets
// `overflowY: "scroll"`; hovering anywhere over it (including a row) scrolls it.
const ITEMS = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);

const listStyle: BevyStyle = {
  flexDirection: "column",
  gap: 6,
  width: 240,
  height: 180,
  padding: 8,
  overflowY: "scroll",
  scrollbarWidth: 8,
  backgroundColor: Colors.surface100,
  borderRadius: 8,
};

const rowStyle: BevyStyle = {
  padding: "10px 12px",
  borderRadius: 6,
  backgroundColor: Colors.surface400,
};

// Base for the visible-scrollbar showcase lists — no `scrollbarWidth`, so the
// `scrollbar` style controls the gutter itself.
const showcaseList: BevyStyle = {
  flexDirection: "column",
  gap: 6,
  width: 200,
  height: 180,
  padding: 8,
  overflowY: "scroll",
  backgroundColor: Colors.surface100,
  borderRadius: 8,
};

// A fully-styled bar: translucent rounded track, violet rounded thumb.
const customBar: ScrollbarStyle = {
  track: { backgroundColor: "#00000088", borderRadius: 8 },
  thumb: { backgroundColor: Colors.primary100, borderRadius: 8 },
  thickness: 20,
};

// Floats over the content instead of reserving a gutter.
const floatBar: ScrollbarStyle = {
  ...customBar,
  position: "float",
};

// The vertical bar on the left edge.
const leftBar: ScrollbarStyle = {
  ...customBar,
  verticalSide: "left",
};

// The thumb brightens on hover and turns blue while dragging (pressed > hover).
const statesBar: ScrollbarStyle = {
  track: { backgroundColor: "#00000022", borderRadius: 8 },
  thumb: {
    backgroundColor: Colors.surface400,
    borderRadius: 8,
    hover: { backgroundColor: Colors.textColor200 },
    pressed: { backgroundColor: Colors.primary100 },
  },
  thickness: 10,
};

// Numbered tiles for the horizontal-scroll demo.
const HTILES = Array.from({ length: 12 }, (_, i) => i + 1);

// A fixed-width row; `flexShrink: 0` on the tiles forces the row to overflow so a
// horizontal bar appears. No `scrollbarWidth` — the `scrollbar` style owns the gutter.
const hScrollRow: BevyStyle = {
  flexDirection: "row",
  gap: 8,
  width: 360,
  maxWidth: "100%",
  padding: 8,
  overflowX: "scroll",
  backgroundColor: Colors.surface100,
  borderRadius: 8,
};

const hTileStyle: BevyStyle = {
  width: 90,
  height: 70,
  flexShrink: 0,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 6,
  backgroundColor: Colors.primary100,
};

// Bottom bar (reserves a gutter, so content shifts up).
const hBottomBar: ScrollbarStyle = {
  track: { backgroundColor: "#00000088", borderRadius: 8 },
  thumb: {
    backgroundColor: Colors.primary100,
    borderRadius: 8,
    hover: { backgroundColor: Colors.sky100 },
  },
  thickness: 10,
  horizontalSide: "bottom",
};

// Top bar floating over the content (no reserved gutter, so it doesn't fight the
// bottom-reserved gutter Bevy would otherwise add).
const hTopBar: ScrollbarStyle = {
  ...hBottomBar,
  position: "float",
  horizontalSide: "top",
};
