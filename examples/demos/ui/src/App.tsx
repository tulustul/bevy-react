import { useEffect } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { bevy } from "@/bevy";
import { Scrollbar } from "@/theme";
import { DEMOS, findDemoByLabel } from "./demos";
import { useNavStore } from "./store";
import { Navigation } from "./Navigation";

export function App() {
  const { selectedDemo, setSelectedDemo } = useNavStore();

  // One mount log so the devtools Console tab has real content to show.
  useEffect(() => {
    console.log("[demos] ui mounted");
  }, []);

  useEffect(() => {
    bevy.selectScene(selectedDemo.scene ?? null);
  }, [selectedDemo]);

  useEffect(() => {
    return bevy.on("debug.selectDemo", ({ label }) => {
      const demo = findDemoByLabel(DEMOS, label);
      if (demo) setSelectedDemo(demo);
    });
  }, [setSelectedDemo]);

  return (
    <node style={rootStyle}>
      <Navigation />

      <node style={contentStyle} scrollStep={100}>
        <node style={contentInnerStyle}>
          {selectedDemo.component && <selectedDemo.component />}
        </node>
      </node>
    </node>
  );
}

const rootStyle: BevyStyle = {
  width: "100%",
  height: "100%",
  flexDirection: "row",
};

// The scroll viewport. It must NOT center its content: centering an item that is
// wider than the viewport pushes its left half into a negative scroll offset that
// can never be reached (and inflates the range so the far end shows padding). So it
// left-aligns the scroll content and lets the inner wrapper do the centering.
const contentStyle: BevyStyle = {
  flexGrow: 1,
  height: "100%",
  flexDirection: "column",
  alignItems: "flexStart",
  overflowY: "scroll",
  overflowX: "scroll",
  scrollbar: Scrollbar,
  transition: { scroll: { duration: 200, easing: "easeOut" } },
};

// The scroll content: `minWidth: 100%` makes it fill the viewport (so narrow demos
// still center) while growing to the widest demo, keeping the content's left edge at
// scroll 0 — the flexbox "safe center" that stays reachable from both ends.
const contentInnerStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 20,
  padding: 24,
  minWidth: "100%",
};
