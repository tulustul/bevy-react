import { useEffect } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { bevy } from "@/bevy";
import { Scrollbar } from "@/theme";
import { DEMOS, findDemoByLabel } from "./demos";
import { Navigation } from "./Navigation";
import { Explanation } from "./Explanation";
import { useDemosStore } from "./demosStore";

export function App() {
  const { selectedDemo, setSelectedDemo } = useDemosStore();

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

      <Explanation />
    </node>
  );
}

const rootStyle: BevyStyle = {
  width: "100%",
  height: "100%",
  flexDirection: "row",
};

const contentStyle: BevyStyle = {
  flexGrow: 1,
  height: "100%",
  flexDirection: "column",
  alignItems: "flexStart",
  overflowY: "scroll",
  overflowX: "scroll",
  scrollbar: Scrollbar,
  transition: { scroll: { duration: 200, easing: "easeOut" } },
  padding: { right: 300 },
};

const contentInnerStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 20,
  padding: 24,
  minWidth: "100%",
};
