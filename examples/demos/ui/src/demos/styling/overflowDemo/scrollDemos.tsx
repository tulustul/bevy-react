import { useState } from "react";
import { BevyStyle, ScrollbarStyle } from "bevy-react/jsx";
import { Button, Example } from "@/components";
import { Colors, FontSizes } from "@/theme";
import { caption, controlColumn } from "../shared";

export function WheelScrollDemo() {
  return (
    <Example
      title="overflowY: scroll"
      description="overflowY: scroll clips a tall child and adds a wheel scrollbar. Hover the list and scroll."
      tsx={`<node style={{
  height: 180,
  overflowY: "scroll",
  scrollbarWidth: 8,
}}>`}
    >
      <node style={listStyle}>
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
    </Example>
  );
}

// A controlled scroll container: `scrollTop` is React state, kept in sync from the
// wheel via `onScroll` and jumped programmatically by the buttons. The readout
// proves the round trip (Bevy → React on wheel, React → Bevy on a button press).
export function ControlledScrollDemo() {
  const [scrollTop, setScrollTop] = useState(0);
  return (
    <Example
      title="Controlled scrollTop"
      description="A controlled scroll container: scrollTop is React state. onScroll syncs it from the wheel; the buttons jump the offset by writing scrollTop back. The readout shows the live value."
      tsx={`const [scrollTop, setScrollTop] =
  useState(0);
<node
  style={{ overflowY: "scroll" }}
  scrollTop={scrollTop}
  onScroll={(e) =>
    setScrollTop(e.scrollTop)}
>`}
    >
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
    </Example>
  );
}

// Smooth (eased) scroll. The `transition: { scroll }` style eases `ScrollPosition`
// toward its target instead of snapping, so each wheel notch glides
// (`scrollStep` sets the per-line distance).
export function SmoothScrollDemo() {
  return (
    <Example
      title="Smooth scroll"
      description="A scroll transition eases the offset instead of snapping: each wheel notch glides to its target (scrollStep sets the per-line distance). Compare with the plain wheel list, which jumps."
      tsx={`<node
  style={{
    overflowY: "scroll",
    transition: {
      scroll: {
        duration: 200,
        easing: "easeOut",
      },
    },
  }}
  scrollStep={50}
>`}
    >
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
    </Example>
  );
}

// One card per scrollbar variant: the same scrollable list, differing only in
// its `scrollbar` style. Every bar is draggable (thumb) and pages on a track
// click.
export function ScrollbarDefaultDemo() {
  return (
    <Example
      title='scrollbar: "default"'
      description="style.scrollbar adds a visible, draggable scrollbar; 'default' is the built-in bar. Drag the thumb or click the track to page."
      tsx={`<node style={{
  overflowY: "scroll",
  scrollbar: "default",
}}>`}
    >
      <ScrollList scrollbar="default" />
    </Example>
  );
}

export function ScrollbarStyledDemo() {
  return (
    <Example
      title="Styled scrollbar"
      description="A fully styled bar: track and thumb take node-like styles (color, radius), and thickness sets its width. By default the bar reserves a gutter, so the content shrinks to make room."
      tsx={`scrollbar: {
  track: {
    backgroundColor: "#00000088",
    borderRadius: 8,
  },
  thumb: {
    backgroundColor: "#7aa2f7",
    borderRadius: 8,
  },
  thickness: 20,
}`}
    >
      <ScrollList scrollbar={customBar} />
    </Example>
  );
}

export function ScrollbarFloatDemo() {
  return (
    <Example
      title='position: "float"'
      description='position: "float" overlays the bar on the content instead of reserving a gutter — the list keeps its full width and the bar rides on top. The default is "gutter".'
      tsx={`scrollbar: {
  // ...track, thumb, thickness
  position: "float",
}`}
    >
      <ScrollList scrollbar={floatBar} />
    </Example>
  );
}

export function ScrollbarLeftDemo() {
  return (
    <Example
      title='verticalSide: "left"'
      description='verticalSide picks the edge the vertical bar sits on: "left" moves it across from the default "right".'
      tsx={`scrollbar: {
  // ...track, thumb, thickness
  verticalSide: "left",
}`}
    >
      <ScrollList scrollbar={leftBar} />
    </Example>
  );
}

export function ScrollbarStatesDemo() {
  return (
    <Example
      title="Thumb hover & pressed"
      description="hover and pressed styles nest inside thumb: this one brightens on hover and turns blue while dragging (pressed wins over hover)."
      tsx={`scrollbar: {
  thumb: {
    backgroundColor: "#313244",
    borderRadius: 8,
    hover: {
      backgroundColor: "#a6adc8",
    },
    pressed: {
      backgroundColor: "#7aa2f7",
    },
  },
  thickness: 10,
}`}
    >
      <ScrollList scrollbar={statesBar} />
    </Example>
  );
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
      title="Horizontal scrollbar"
      description="A horizontal scrollbar: overflowX: scroll on a fixed-width row whose tiles refuse to shrink, so the row overflows. The bar sits on the bottom edge by default; horizontalSide: 'top' (with position: 'float') moves it above the content. Drag the thumb or click the track to page."
      tsx={`<node style={{
  overflowX: "scroll",
  scrollbar: {
    thumb: {
      backgroundColor: "#7aa2f7",
      borderRadius: 8,
    },
    thickness: 10,
    // or "top"
    horizontalSide: "bottom",
  },
}}>`}
    >
      <node style={{ flexDirection: "column", gap: 16 }}>
        <HScrollList label='horizontalSide: "bottom"' scrollbar={hBottomBar} />
        <HScrollList
          label='horizontalSide: "top" (float)'
          scrollbar={hTopBar}
        />
      </node>
    </Example>
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
    <node style={{ flexDirection: "column", gap: 6 }}>
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
