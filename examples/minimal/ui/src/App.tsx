import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";

// Talk to the Bevy side through the generated, typed client:
//
//   import { bevy } from "./bevy";
//   bevy.someMessage(payload);            // React → Bevy, fire-and-forget
//   const reply = await bevy.someRequest(); // React → Bevy, awaited
//   useEffect(() => bevy.on("someEvent", handle), []); // Bevy → React
//
// Define the channels in Rust with #[react_message] / #[react_request] /
// #[react_event], then run `npm run bevy:generate` to (re)create src/bevy.ts.

export function App() {
  const [count, setCount] = useState(0);

  return (
    <node style={appStyle}>
      <text style={titleStyle}>Hello from bevy-react</text>
      <button
        style={btnStyle}
        hoverStyle={btnHover}
        pressStyle={btnPress}
        onClick={() => setCount((c) => c + 1)}
      >
        <text style={btnTextStyle}>{`Clicked ${count} times`}</text>
      </button>
    </node>
  );
}

const appStyle: BevyStyle = {
  width: "100%",
  height: "100%",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: 16,
  padding: 24,
  backgroundColor: "#1e1e2e",
};

const titleStyle: BevyStyle = {
  color: "#cdd6f4",
  fontSize: 28,
  fontWeight: "bold",
};

const btnStyle: BevyStyle = {
  padding: { top: 10, bottom: 10, left: 18, right: 18 },
  borderRadius: 8,
  backgroundColor: "#313244",
  justifyContent: "center",
  alignItems: "center",
};

const btnHover: BevyStyle = {
  backgroundColor: "#89b4fa",
};

const btnPress: BevyStyle = {
  backgroundColor: "#5a7fd6",
};

const btnTextStyle: BevyStyle = {
  color: "#cdd6f4",
  fontSize: 16,
  fontWeight: "bold",
};
