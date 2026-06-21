// The PoC React app. Uses lowercase host elements (`node`, `button`) that the
// custom renderer maps to bevy_ui. Bare string children become text nodes.

import React, { useState } from "react";

export function App() {
  const [count, setCount] = useState(0);

  return (
    <node
      style={{
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        padding: 28,
        width: 360,
        height: 220,
      }}
      backgroundColor="#1e1e2e"
    >
      {`Count: ${count}`}
      <button
        onClick={() => setCount((c) => c + 1)}
        style={{
          width: 220,
          height: 56,
          justifyContent: "center",
          alignItems: "center",
        }}
        backgroundColor="#7aa2f7"
      >
        Click me
      </button>
    </node>
  );
}
