import { useEffect, useState } from "react";
import { bevy, type WindowSize } from "@/bevy";
import { Example } from "@/components";
import { Colors, FontSizes } from "@/theme";

export function WindowDemo() {
  return <WindowSizeExample />;
}

const RESIZE_TYPESCRIPT = `const [size, setSize] = useState<WindowSize | null>(null);

useEffect(() => {
  void bevy.window.size().then(setSize); // current value on mount
  return bevy.on("resize", setSize);     // live updates
}, []);`;

function WindowSizeExample() {
  const [size, setSize] = useState<WindowSize | null>(null);

  useEffect(() => {
    void bevy.window.size().then(setSize);
    return bevy.on("resize", setSize);
  }, []);

  return (
    <Example
      description={`Built into the core plugin, no registration needed: bevy.on("resize") streams the UI viewport's logical size, and bevy.window.size() pulls it on demand (here: once on mount). Resize the app window to see it update.`}
      tsx={RESIZE_TYPESCRIPT}
    >
      <text style={{ fontSize: FontSizes.lg }}>Window</text>
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
