import { useEffect } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { bevy } from "@/bevy";
import { DEMOS, findDemoByLabel } from "./demos";
import { useNavStore } from "./store";
import { Navigation } from "./Navigation";

export function App() {
  const { selectedDemo, setSelectedDemo } = useNavStore();

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
        {selectedDemo.component && <selectedDemo.component />}
      </node>
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
  alignItems: "center",
  gap: 20,
  padding: 24,
  overflowY: "scroll",
  transition: { scroll: { duration: 200, easing: "easeOut" } },
};
