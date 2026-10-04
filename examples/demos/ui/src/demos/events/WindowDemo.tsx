import { useEffect, useState } from "react";
import { InlineCode, Paragraph } from "@/components/typography";
import { bevy, type WindowSize } from "@/bevy";
import { Example } from "@/components";
import { Code } from "@/components/docs";
import { BevyStyle } from "bevy-react/jsx";
import { Colors, Fonts, FontSizes } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

const RESIZE_TYPESCRIPT = `const [size, setSize] = useState<WindowSize | null>(null);

useEffect(() => {
  // Current value on mount, via the request channel.
  void bevy.window.size().then(setSize);
  // Live updates from the built-in resize event.
  return bevy.on("resize", setSize);
}, []);`;

const PAGE: ExplanationData = {
  title: "Window",
  info: (
    <>
      <Paragraph>
        Built into the core plugin, no registration needed:{" "}
        <InlineCode>bevy.on("resize")</InlineCode> streams the UI viewport's
        logical size, and the <InlineCode>bevy.window.size()</InlineCode>{" "}
        request pulls it on demand — here once on mount, to seed the value
        before the first resize.
      </Paragraph>
      <Code lang="tsx">{RESIZE_TYPESCRIPT}</Code>
      <Paragraph>Resize the app window to see it update.</Paragraph>
    </>
  ),
};

export function WindowDemo() {
  useDemoPage(PAGE);
  return <WindowSizeExample />;
}

function WindowSizeExample() {
  return (
    <Example
      title="Window events"
      info={
        <>
          <Paragraph>
            The live viewport size: seeded once on mount by the{" "}
            <InlineCode>bevy.window.size()</InlineCode> request, then kept fresh
            by the built-in <InlineCode>resize</InlineCode> event. Resize the
            app window to see it change.
          </Paragraph>
          <Code lang="tsx">{RESIZE_TYPESCRIPT}</Code>
        </>
      }
      demo={WindowSizeCard}
    />
  );
}

function WindowSizeCard() {
  const [size, setSize] = useState<WindowSize | null>(null);

  useEffect(() => {
    void bevy.window.size().then(setSize);
    return bevy.on("resize", setSize);
  }, []);

  // The size arrives from Bevy, so it carries the engine's ember.
  return (
    <>
      <text style={promptStyle}>Resize the window to read the resolution</text>
      <text style={sizeStyle}>
        {size ? `${Math.round(size.width)} x ${Math.round(size.height)}` : "-"}
      </text>
    </>
  );
}

const promptStyle: BevyStyle = {
  fontSize: FontSizes.sm,
  color: Colors.textBody,
};

const sizeStyle: BevyStyle = {
  fontFamily: Fonts.display,
  fontSize: 40,
  fontWeight: "semibold",
  color: Colors.ember,
  textAlign: "center",
};
