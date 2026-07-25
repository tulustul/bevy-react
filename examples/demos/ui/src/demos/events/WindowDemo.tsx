import { useEffect, useState } from "react";
import { bevy, type WindowSize } from "@/bevy";
import { Example } from "@/components";
import { Colors, FontSizes } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

export function WindowDemo() {
  useDemoPage(PAGE);
  return <WindowSizeExample />;
}

const RESIZE_TYPESCRIPT = `const [size, setSize] =
  useState<WindowSize | null>(null);

useEffect(() => {
  // current value on mount
  void bevy.window.size().then(setSize);
  // live updates
  return bevy.on("resize", setSize);
}, []);`;

const PAGE: ExplanationData = {
  title: "Window",
  description:
    'Built into the core plugin, no registration needed: bevy.on("resize") streams the UI viewport\'s logical size, and the bevy.window.size() request pulls it on demand (here: once on mount). Resize the app window to see it update.',
  tsx: RESIZE_TYPESCRIPT,
};

function WindowSizeExample() {
  const [size, setSize] = useState<WindowSize | null>(null);

  useEffect(() => {
    void bevy.window.size().then(setSize);
    return bevy.on("resize", setSize);
  }, []);

  return (
    <Example title="Window">
      <text
        style={{
          fontSize: FontSizes.xxxl,
          fontWeight: "bold",
          color: Colors.yellow100,
        }}
      >
        {size ? `${Math.round(size.width)} x ${Math.round(size.height)}` : "-"}
      </text>
    </Example>
  );
}
