import { useEffect, useState } from "react";
import { bevy, type KeyboardEventData } from "@/bevy";
import { Example } from "@/components";
import { Colors, FontSizes } from "@/theme";
import { TextMono } from "@/components/TextMono";

const TYPESCRIPT = `import { bevy } from "@/bevy";

useEffect(() => {
  const offDown = bevy.on("keyDown", (e) => {
    if (e.key === "Escape") close();
  });
  const offUp = bevy.on("keyUp", (e) => { /* ... */ });
  return () => { offDown(); offUp(); };
}, []);`;

function modifierLabel(e: KeyboardEventData | null): string {
  if (!e) {
    return "-";
  }
  const mods = [
    e.ctrlKey && "Ctrl",
    e.shiftKey && "Shift",
    e.altKey && "Alt",
    e.metaKey && "Meta",
  ].filter(Boolean);
  return mods.length ? mods.join(" + ") : "-";
}

export function KeyboardDemo() {
  const [lastEvent, setLastEvent] = useState<KeyboardEventData | null>(null);
  const [held, setHeld] = useState<string[]>([]);

  useEffect(() => {
    const offDown = bevy.on("keyDown", (e) => {
      if (!e.repeat) {
        setLastEvent(e);
        setHeld((keys) => (keys.includes(e.code) ? keys : [...keys, e.key]));
      }
    });
    const offUp = bevy.on("keyUp", (e) => {
      setLastEvent(null);
      setHeld((keys) => keys.filter((c) => c !== e.key));
    });
    return () => {
      offDown();
      offUp();
    };
  }, []);

  return (
    <Example
      description={`Bevy -> React: window-global keystrokes. Focus the app window and press any key — no node needs focus. Built into the core plugin as the typed bevy.on("keyDown"/"keyUp") events.`}
      tsx={TYPESCRIPT}
    >
      <text
        style={{
          fontSize: FontSizes.xl,
          fontWeight: "bold",
          color: Colors.yellow100,
        }}
      >
        {held.join("+")}
      </text>
      <TextMono style={{ fontSize: FontSizes.sm, color: Colors.textColor200 }}>
        {`modifiers: ${modifierLabel(lastEvent) || "-"}`}
      </TextMono>
    </Example>
  );
}
