import { useEffect, useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
// Typed `emit` + the `bevy` proxy, generated from the Rust `#[react_message]` /
// `#[react_request]` / `#[react_event]` types. Regenerate with `npm run gen:bindings`.
import { bevy, emit } from "./generated";

const MAX = 8;

export function App() {
  const [count, setCount] = useState(3);

  // React -> Bevy notify: push the count whenever it changes.
  useEffect(() => {
    emit("count", count);
  }, [count]);

  // Bevy -> React event: log whenever Bevy reports the cube count changed.
  useEffect(
    () => bevy.on("cubes.changed", (e) => console.log("cubes ->", e.count)),
    [],
  );

  // React -> Bevy request: ask Bevy for the authoritative cube count.
  const checkCubes = async () => {
    const report = await bevy.cubes.get();
    console.log("bevy says cubes =", report.count);
  };

  return (
    <node style={modalStyle}>
      <image src="bevy-logo.png" style={{ width: 100 }} />

      <text style={{ color: "#cdd6f4", fontSize: 22, fontWeight: "bold" }}>
        Cubes: <text style={{ color: "#7aa2f7" }}>{count}</text>
      </text>

      <node style={{ flexDirection: "row", gap: 12 }}>
        <button
          onClick={() => setCount((c) => Math.min(MAX, c + 1))}
          style={{ ...buttonStyle, backgroundColor: "#7aa2f7" }}
        >
          +
        </button>
        <button
          onClick={() => setCount((c) => Math.max(0, c - 1))}
          style={{ ...buttonStyle, backgroundColor: "#f7768e" }}
        >
          -
        </button>
        <button
          onClick={() => setCount(3)}
          style={{ ...buttonStyle, width: 96, backgroundColor: "#414868" }}
        >
          reset
        </button>
        <button
          onClick={checkCubes}
          style={{ ...buttonStyle, width: 96, backgroundColor: "#9ece6a" }}
        >
          check
        </button>
      </node>
    </node>
  );
}

const modalStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 20,
  padding: 24,
  margin: 24,
  backgroundColor: "#1e1e2e",
  borderRadius: 16,
  border: 2,
  borderColor: "#7aa2f7",
};

const buttonStyle: BevyStyle = {
  width: 64,
  height: 56,
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 8,
};
