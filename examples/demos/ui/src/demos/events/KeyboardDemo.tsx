import { useEffect, useState } from "react";
import { InlineCode, Paragraph, TextMono } from "@/components/typography";
import { bevy, type KeyboardEventData } from "@/bevy";
import { Example } from "@/components";
import { Code } from "@/components/docs";
import { BevyStyle } from "bevy-react/jsx";
import { Colors, Fonts, FontSizes } from "@/theme";
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
      <text style={promptStyle}>Press the keys to test the events</text>
      {/* The held keys as keycaps: input arriving from Bevy, so they carry
          the engine's ember. The row keeps its height while empty. */}
      <node style={keysStyle}>
        {held.map((key, i) => (
          <node key={`${key}-${i}`} style={keycapStyle}>
            <text style={keycapLabelStyle}>{key}</text>
          </node>
        ))}
      </node>
      <TextMono style={modifiersStyle}>
        {`modifiers: ${modifierLabel(lastEvent) || "-"}`}
      </TextMono>
    </>
  );
}

const promptStyle: BevyStyle = {
  fontSize: FontSizes.sm,
  color: Colors.textBody,
};

const KEYCAP = 44;

const keysStyle: BevyStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: 8,
  minHeight: KEYCAP,
};

// A keycap: a raised chip, its thicker bottom rim the key's depth.
const keycapStyle: BevyStyle = {
  minWidth: KEYCAP,
  height: KEYCAP,
  padding: { horizontal: 12 },
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 8,
  border: { top: 1, left: 1, right: 1, bottom: 3 },
  borderColor: Colors.lineStrong,
  backgroundColor: Colors.raised,
  boxShadow: { blurRadius: 6, color: Colors.emberGlow },
};

const keycapLabelStyle: BevyStyle = {
  fontFamily: Fonts.mono,
  fontSize: FontSizes.base,
  fontWeight: "semibold",
  color: Colors.ember,
};

const modifiersStyle: BevyStyle = {
  fontSize: FontSizes.xs,
  color: Colors.textDim,
};
