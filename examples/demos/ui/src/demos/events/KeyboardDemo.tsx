import { useEffect, useState } from "react";
import { InlineCode, Paragraph, TextMono } from "@/components/typography";
import { bevy, type KeyboardEventData } from "@/bevy";
import { Example } from "@/components";
import { Code } from "@/components/docs";
import { Colors, FontSizes } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

const TYPESCRIPT = `import { bevy } from "@/bevy";

useEffect(() => {
  const offDown = bevy.on("keyDown", (e) => {
    if (e.key === "Escape") close();
  });
  const offUp = bevy.on("keyUp", (e) => {
    /* ... */
  });
  return () => {
    offDown();
    offUp();
  };
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

const PAGE: ExplanationData = {
  title: "Keyboard",
  info: (
    <>
      <Paragraph>
        Bevy to React: window-global keystrokes. The typed{" "}
        <InlineCode>bevy.on("keyDown")</InlineCode> /{" "}
        <InlineCode>bevy.on("keyUp")</InlineCode> events are built into the core
        plugin — no app-side Rust or registration needed. Each event carries{" "}
        <InlineCode>key</InlineCode>, <InlineCode>code</InlineCode>,{" "}
        <InlineCode>repeat</InlineCode> and the modifier flags.
      </Paragraph>
      <Code lang="tsx">{TYPESCRIPT}</Code>
      <Paragraph>
        Focus the app window and press any key — no node needs focus.
      </Paragraph>
    </>
  ),
};

export function KeyboardDemo() {
  useDemoPage(PAGE);
  return <KeyboardExample />;
}

function KeyboardExample() {
  return (
    <Example
      title="Keyboard events"
      info={
        <>
          <Paragraph>
            One <InlineCode>keyDown</InlineCode> /{" "}
            <InlineCode>keyUp</InlineCode> subscription pair: presses add to the
            held-keys line (OS auto-repeat is filtered out via{" "}
            <InlineCode>e.repeat</InlineCode>), releases remove them, and the
            last event's modifier flags render below. Focus the app window and
            press any key — no node needs focus.
          </Paragraph>
          <Code lang="tsx">{TYPESCRIPT}</Code>
        </>
      }
      demo={KeyboardCard}
    />
  );
}

function KeyboardCard() {
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
    <>
      <text style={{ fontSize: FontSizes.sm, color: Colors.textColor100 }}>
        Press the keys to test the events
      </text>
      <text
        style={{
          fontSize: FontSizes.xl,
          fontWeight: "bold",
          color: Colors.yellow100,
          textAlign: "center",
        }}
      >
        {held.join("+")}
      </text>
      <TextMono
        style={{
          fontSize: FontSizes.sm,
          color: Colors.textColor200,
          textAlign: "center",
        }}
      >
        {`modifiers: ${modifierLabel(lastEvent) || "-"}`}
      </TextMono>
    </>
  );
}
