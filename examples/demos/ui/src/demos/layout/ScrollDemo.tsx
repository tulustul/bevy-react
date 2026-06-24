import { BevyStyle } from "bevy-react/jsx";
import { Example } from "../../components";
import { Colors, FontSizes } from "../../theme";

// A longer-than-its-box list to demonstrate wheel scrolling. The container sets
// `overflowY: "scroll"`; hovering anywhere over it (including a row) scrolls it.
const ITEMS = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);

export function ScrollDemo() {
  return (
    <Example
      description="overflowY: scroll clips a tall child and adds a wheel scrollbar. Hover the list and scroll."
      typescript={`<node style={{
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
