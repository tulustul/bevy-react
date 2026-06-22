import { useEffect, useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
// Typed `emit` + the `bevy` proxy, generated from the Rust `#[react_message]` /
// `#[react_request]` / `#[react_event]` types. Regenerate with `npm run gen:bindings`.
import { emit } from "./generated";
import type { DemoId } from "./generated";
import { BasicUiDemo } from "./demos/BasicUiDemo";
import { EventsDemo } from "./demos/EventsDemo";
import { RequestResponseDemo } from "./demos/RequestResponseDemo";

const DEMOS: { id: DemoId; label: string }[] = [
  { id: "BasicUi", label: "Basic UI" },
  { id: "Events", label: "Events" },
  { id: "RequestResponse", label: "Request/Response" },
];

export function App() {
  const [active, setActive] = useState<DemoId>("BasicUi");

  // React -> Bevy notify: tell Bevy which demo's scene should be live. Switching
  // also unmounts the previous demo component, so its effects (listeners, polling
  // loops) clean up on their own.
  useEffect(() => {
    emit("selectDemo", active);
  }, [active]);

  return (
    <node style={rootStyle}>
      <node style={navStyle}>
        <image src="bevy-logo.png" style={{ width: 100 }} />
        <text style={titleStyle}>bevy-react</text>
        {DEMOS.map((d) => {
          const selected = d.id === active;
          return (
            <button
              key={d.id}
              onClick={() => setActive(d.id)}
              style={{
                ...navButtonStyle,
                backgroundColor: selected ? "#7aa2f7" : "#2a2a3c",
              }}
              hoverStyle={{
                backgroundColor: selected ? "#7aa2f7" : "#42425e",
              }}
            >
              <text
                style={{
                  color: selected ? "#1e1e2e" : "#cdd6f4",
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                {d.label}
              </text>
            </button>
          );
        })}
      </node>

      <node style={contentStyle}>
        {active === "BasicUi" && <BasicUiDemo />}
        {active === "Events" && <EventsDemo />}
        {active === "RequestResponse" && <RequestResponseDemo />}
      </node>
    </node>
  );
}

const rootStyle: BevyStyle = {
  width: "100%",
  height: "100%",
  flexDirection: "row",
};

const navStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  width: 220,
  height: "100%",
  gap: 12,
  padding: 20,
  backgroundColor: "#181825",
};

const titleStyle: BevyStyle = {
  color: "#7aa2f7",
  fontSize: 22,
  fontWeight: "bold",
  margin: { top: 0, right: 0, bottom: 12, left: 0 },
};

const navButtonStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "start",
  gap: 2,
  padding: 12,
  borderRadius: 8,
  width: "100%",
};

const contentStyle: BevyStyle = {
  flexGrow: 1,
  height: "100%",
  alignItems: "flexStart",
  justifyContent: "center",
  padding: 24,
};
