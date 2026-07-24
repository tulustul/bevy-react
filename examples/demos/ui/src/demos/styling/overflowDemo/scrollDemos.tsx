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
      tsx={`const [scrollTop, setScrollTop] = useState(0);
<node
  style={{ overflowY: "scroll" }}
  scrollTop={scrollTop}
  onScroll={(e) => setScrollTop(e.scrollTop)}
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
// toward its target, so the buttons animate to the ends and the wheel glides
// (`scrollStep` sets the per-line distance). Per the easing caveat, `scrollTop` is
// driven only by the buttons; `onScroll` updates a *separate* readout so the
// round-trip doesn't keep resetting the target mid-ease.
export function SmoothScrollDemo() {
  return (
    <Example
      title="Smooth scroll"
      description="Smooth scroll: a scroll transition eases the offset instead of snapping. The buttons set a target and it animates there; the wheel eases too (scrollStep sets the per-line distance). onScroll feeds a separate readout — feeding it back into scrollTop would fight the ease."
      tsx={`<node
  style={{ overflowY: "scroll",
    transition: { scroll: { duration: 200, easing: "easeOut" } } }}
  scrollStep={50}
  scrollTop={target}              // set by buttons only
  onScroll={(e) => setReadout(e.scrollTop)}
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

// A row of scrollable lists that differ only in their `scrollbar` style: the
// built-in "default" bar, a custom-styled gutter bar, a floating bar, and a
// left-side bar. Each is draggable (thumb) and pages on a track click.
export function ScrollbarShowcaseDemo() {
  return (
    <Example
      title="scrollbar"
      description="A visible, draggable scrollbar. Set style.scrollbar to 'default' for a built-in bar, or an object to style the track/thumb, pick a side, and reserve a gutter (content shrinks) vs float over content. Drag the thumb or click the track to page."
      tsx={`style={{ overflowY: "scroll", scrollbar: "default" }}

// or fully styled:
scrollbar: {
  track: { backgroundColor: "#00000022", borderRadius: 6 },
  thumb: { backgroundColor: "#8b5cf6", borderRadius: 6 },
  thickness: 10,
  position: "float",      // or "gutter" (default)
  verticalSide: "left",   // or "right"
}`}
    >
      <node style={{ flexDirection: "column", gap: 16 }}>
        <ScrollList label={'scrollbar: "default"'} scrollbar="default" />
        <ScrollList label="custom (gutter)" scrollbar={customBar} />
        <ScrollList label='position: "float"' scrollbar={floatBar} />
        <ScrollList label='verticalSide: "left"' scrollbar={leftBar} />
        <ScrollList label="hover + pressed" scrollbar={statesBar} />
      </node>
    </Example>
  );
}

function ScrollList({
  label,
  scrollbar,
}: {
  label: string;
  scrollbar: "none" | "default" | ScrollbarStyle;
}) {
  return (
    <node style={{ flexDirection: "column", gap: 6 }}>
      <text style={caption}>{label}</text>
      <node style={{ ...showcaseList, scrollbar }}>
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
    thumb: { backgroundColor: "#7aa2f7", borderRadius: 8 },
    thickness: 10,
    horizontalSide: "bottom",  // or "top"
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

// The thumb brightens on hover and turns violet while dragging (pressed > hover).
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
