import { headingStyle, labelStyle } from "./styles";
import { Card } from "../components";

// A longer-than-its-box list to demonstrate wheel scrolling. The container sets
// `overflowY: "scroll"`; hovering anywhere over it (including a row) scrolls it.
const ITEMS = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);

export function ScrollDemo() {
  return (
    <Card>
      <text style={headingStyle}>Scrollable list</text>
      <text style={labelStyle}>Hover the list and use the mouse wheel</text>

      <node
        style={{
          flexDirection: "column",
          gap: 6,
          width: 240,
          height: 180,
          padding: 8,
          overflowY: "scroll",
          scrollbarWidth: 8,
          backgroundColor: "#11111b",
          borderRadius: 8,
        }}
      >
        {ITEMS.map((item) => (
          <node
            key={item}
            style={{
              padding: "10px 12px",
              borderRadius: 6,
              backgroundColor: "#313244",
            }}
          >
            <text style={{ color: "#cdd6f4", fontSize: 15 }}>{item}</text>
          </node>
        ))}
      </node>
    </Card>
  );
}
