import { useState } from "react";
import { BevyStyle, ScrollbarStyle } from "bevy-react/jsx";
import { Button, Example, Radio, RadioOption } from "@/components";
import { Colors, FontSizes } from "@/theme";
import { caption, controlColumn } from "./shared";

type OverflowValue = "visible" | "clip" | "hidden" | "scroll";

const OPTIONS: RadioOption<OverflowValue>[] = [
  { label: "visible", value: "visible" },
  { label: "clip", value: "clip" },
  { label: "hidden", value: "hidden" },
  { label: "scroll", value: "scroll" },
];

export function OverflowDemo() {
  return (
    <>
      <Example
        description="overflowX/overflowY decide what happens to a child that is bigger than its box: visible spills out, clip/hidden cut it off, scroll clips it and adds a wheel scrollbar."
        tsx={`overflowX: value,
overflowY: value,  // visible | clip | hidden | scroll
scrollbarWidth: value === "scroll" ? 8 : 0,`}
      >
        <OverflowControl />
      </Example>

      <Example
        description="clip and hidden clip the same pixels — the difference is layout. As a flex item, a clip box keeps its content width as a minimum (so it overflows the row), while a hidden box may shrink to 0 and let the row compress it. Both boxes hold the same 220px-wide child and sit in the same 300px row next to a fixed sibling."
        tsx={`// flex row, width 300
<node style={{ overflowX: "clip" }}>   // stays 220 wide, overflows
<node style={{ overflowX: "hidden" }}> // shrinks, content clipped`}
      >
        <ClipVsHidden />
      </Example>

      <Example
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

      <Example
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
        <ScrollbarShowcase />
      </Example>

      <Example
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
        <HScrollShowcase />
      </Example>

      <Example
        description="A controlled scroll container: scrollTop is React state. onScroll syncs it from the wheel; the buttons jump the offset by writing scrollTop back. The readout shows the live value."
        tsx={`const [scrollTop, setScrollTop] = useState(0);
<node
  style={{ overflowY: "scroll" }}
  scrollTop={scrollTop}
  onScroll={(e) => setScrollTop(e.scrollTop)}
>`}
      >
        <ControlledScrollList />
      </Example>

      <Example
        description="Smooth scroll: a scroll transition eases the offset instead of snapping. The buttons set a target and it animates there; the wheel eases too (scrollStep sets the per-line distance). onScroll feeds a separate readout — feeding it back into scrollTop would fight the ease."
        tsx={`<node
  style={{ overflowY: "scroll",
    transition: { scroll: { duration: 200, easing: "easeOut" } } }}
  scrollStep={50}
  scrollTop={target}              // set by buttons only
  onScroll={(e) => setReadout(e.scrollTop)}
>`}
      >
        <SmoothScrollList />
      </Example>
    </>
  );
}

// Smooth (eased) scroll. The `transition: { scroll }` style eases `ScrollPosition`
// toward its target, so the buttons animate to the ends and the wheel glides
// (`scrollStep` sets the per-line distance). Per the easing caveat, `scrollTop` is
// driven only by the buttons; `onScroll` updates a *separate* readout so the
// round-trip doesn't keep resetting the target mid-ease.
function SmoothScrollList() {
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

// A row of scrollable lists that differ only in their `scrollbar` style: the
// built-in "default" bar, a custom-styled gutter bar, a floating bar, and a
// left-side bar. Each is draggable (thumb) and pages on a track click.
function ScrollbarShowcase() {
  return (
    <node style={{ flexDirection: "column", gap: 16 }}>
      <ScrollList label={'scrollbar: "default"'} scrollbar="default" />
      <ScrollList label="custom (gutter)" scrollbar={customBar} />
      <ScrollList label='position: "float"' scrollbar={floatBar} />
      <ScrollList label='verticalSide: "left"' scrollbar={leftBar} />
      <ScrollList label="hover + pressed" scrollbar={statesBar} />
    </node>
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
function HScrollShowcase() {
  return (
    <node style={{ flexDirection: "column", gap: 16 }}>
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

// A controlled scroll container: `scrollTop` is React state, kept in sync from the
// wheel via `onScroll` and jumped programmatically by the buttons. The readout
// proves the round trip (Bevy → React on wheel, React → Bevy on a button press).
function ControlledScrollList() {
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

function OverflowControl() {
  const [value, setValue] = useState<OverflowValue>("clip");
  return (
    <node style={controlColumn}>
      <node
        style={{
          ...boxStyle,
          overflowX: value,
          overflowY: value,
          scrollbarWidth: value === "scroll" ? 8 : 0,
        }}
      >
        <node style={oversizedStyle}>
          <text style={{ color: Colors.textColor100, fontSize: FontSizes.sm }}>
            This block is wider and taller than its 220×140 box. Switch the
            overflow value to watch it spill out, get clipped, or scroll.
          </text>
        </node>
      </node>
      <Radio value={value} options={OPTIONS} onChange={setValue} />
    </node>
  );
}

// Two identical flex rows that differ only in the subject box's overflow value.
// `clip` keeps the 220px content as the box's flex-item minimum, so the row
// overflows its 300px container and the sibling is pushed past the clipped edge.
// `hidden` drops that minimum to 0, so flexbox shrinks the box (clipping its
// content) and the sibling keeps its full width.
function ClipVsHidden() {
  return (
    <node style={{ flexDirection: "column", gap: 16 }}>
      <SqueezeRow mode="clip" />
      <SqueezeRow mode="hidden" />
    </node>
  );
}

function SqueezeRow({ mode }: { mode: "clip" | "hidden" }) {
  return (
    <node style={{ flexDirection: "column", gap: 6 }}>
      <text style={caption}>{`overflowX: ${mode}`}</text>
      <node style={squeezeContainer}>
        <node style={{ ...subjectStyle, overflowX: mode }}>
          <node style={wideChildStyle}>
            <text
              style={{ color: Colors.textColor100, fontSize: FontSizes.xs }}
            >
              220px child
            </text>
          </node>
        </node>
        <node style={siblingStyle}>
          <text style={{ color: Colors.textColor100, fontSize: FontSizes.xs }}>
            sibling
          </text>
        </node>
      </node>
    </node>
  );
}

// A longer-than-its-box list to demonstrate wheel scrolling. The container sets
// `overflowY: "scroll"`; hovering anywhere over it (including a row) scrolls it.
const ITEMS = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);

const boxStyle: BevyStyle = {
  width: 220,
  height: 140,
  padding: 12,
  backgroundColor: Colors.surface100,
  borderRadius: 12,
};

const oversizedStyle: BevyStyle = {
  width: 320,
  height: 220,
  padding: 12,
  borderRadius: 8,
  backgroundColor: Colors.primary100,
};

// Fixed-width row that clips, so an overflowing subject visibly pushes the
// sibling past the right edge.
const squeezeContainer: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  width: 300,
  padding: 8,
  overflowX: "clip",
  backgroundColor: Colors.surface100,
  borderRadius: 10,
};

// Flexible subject: no fixed width, so flexbox sizes it — and the overflow value
// decides whether its 220px content acts as a minimum.
const subjectStyle: BevyStyle = {
  height: 56,
  alignItems: "center",
  padding: 8,
  borderRadius: 8,
  backgroundColor: Colors.surface400,
};

const wideChildStyle: BevyStyle = {
  width: 220,
  height: 40,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 6,
  backgroundColor: Colors.primary100,
};

// Fixed-size sibling that refuses to shrink, so it competes with the subject for
// the row's width.
const siblingStyle: BevyStyle = {
  width: 110,
  height: 56,
  flexShrink: 0,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 8,
  backgroundColor: Colors.red100,
};

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
