import { useEffect, useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
// Typed `bevy` proxy, generated from the Rust `#[react_message]` /
// `#[react_request]` / `#[react_event]` types. Regenerate with `npm run gen:bindings`.
import { bevy } from "./generated";
import type { DemoId } from "./generated";
import { BasicUiDemo } from "./demos/BasicUiDemo";
import { EventsDemo } from "./demos/EventsDemo";
import { PollingDataDemo } from "./demos/PollingDataDemo";
import { AnimationsDemo } from "./demos/AnimationsDemo";
import { AnchoredDemo } from "./demos/AnchoredDemo";
import { InteractionsDemo } from "./demos/InteractionsDemo";
import { CanvasDemo } from "./demos/CanvasDemo";

// A nav entry is a top-level demo; one (Animations) carries a submenu of
// React-side example variants that all share the same `Demo` scene.
type NavChild = { key: string; label: string };
type NavItem = { id: DemoId; label: string; children?: NavChild[] };

const DEMOS: NavItem[] = [
  { id: "BasicUi", label: "Basic UI" },
  { id: "BevyEvents", label: "Bevy Events" },
  { id: "Polling", label: "Polling data" },
  {
    id: "Animations",
    label: "Animations",
    children: [
      { key: "fade", label: "Fade" },
      { key: "bouncing", label: "Bouncing Squares" },
    ],
  },
  { id: "WorldAnchors", label: "World Anchors" },
  { id: "Interactions", label: "Interactions" },
  { id: "Canvas", label: "Canvas" },
];

export function App() {
  const [active, setActive] = useState<DemoId>("BasicUi");
  // Which Animations example is shown (purely React-side — no scene to gate).
  const [animExample, setAnimExample] = useState("fade");

  // React -> Bevy notify: tell Bevy which demo's scene should be live. Switching
  // also unmounts the previous demo component, so its effects (listeners, polling
  // loops) clean up on their own.
  useEffect(() => {
    bevy.selectDemo(active);
  }, [active]);

  return (
    <node style={rootStyle}>
      <node style={navStyle}>
        <image src="bevy-logo.png" style={{ width: 100 }} />
        <text style={titleStyle}>bevy-react</text>
        {DEMOS.map((d) => (
          <node key={d.id} style={navGroupStyle}>
            <NavButton
              label={d.label}
              selected={d.id === active}
              onPress={() => setActive(d.id)}
            />
            {d.children?.map((c) => (
              <NavButton
                key={c.key}
                label={c.label}
                selected={d.id === active && c.key === animExample}
                indent
                onPress={() => {
                  setActive(d.id);
                  setAnimExample(c.key);
                }}
              />
            ))}
          </node>
        ))}
      </node>

      <node style={contentStyle}>
        {active === "BasicUi" && <BasicUiDemo />}
        {active === "BevyEvents" && <EventsDemo />}
        {active === "Polling" && <PollingDataDemo />}
        {active === "Animations" && <AnimationsDemo example={animExample} />}
        {active === "WorldAnchors" && <AnchoredDemo />}
        {active === "Interactions" && <InteractionsDemo />}
        {active === "Canvas" && <CanvasDemo />}
      </node>
    </node>
  );
}

function NavButton({
  label,
  selected,
  onPress,
  indent = false,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  indent?: boolean;
}) {
  return (
    <button
      onClick={onPress}
      style={{
        ...navButtonStyle,
        // Indent submenu items via left padding (full-width button, no overflow).
        padding: indent ? { top: 8, right: 12, bottom: 8, left: 28 } : 12,
        backgroundColor: selected ? "#7aa2f7" : "#2a2a3c",
      }}
      hoverStyle={{ backgroundColor: selected ? "#7aa2f7" : "#42425e" }}
    >
      <text
        style={{
          color: selected ? "#1e1e2e" : "#cdd6f4",
          fontSize: indent ? 14 : 16,
          fontWeight: "bold",
        }}
      >
        {label}
      </text>
    </button>
  );
}

const rootStyle: BevyStyle = {
  width: "100%",
  height: "100%",
  flexDirection: "row",
};

const navStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "stretch",
  width: 220,
  height: "100%",
  gap: 8,
  padding: 20,
  backgroundColor: "#181825",
  zIndex: 100,
  boxShadow: { blurRadius: 15, spreadRadius: 0, color: "#00000088" },
};

const navGroupStyle: BevyStyle = {
  flexDirection: "column",
  gap: 6,
  width: "100%",
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
