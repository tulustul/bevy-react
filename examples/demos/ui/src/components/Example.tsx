import { PropsWithChildren, useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Colors, FontSizes } from "@/theme";
import { TextMono } from "./TextMono";

export type ExampleProps = PropsWithChildren & {
  // A one/two-line note shown on the right, above the code.
  description?: string;
  typescript?: string;
  rust?: string;
};

export function Example({
  children,
  description,
  typescript,
  rust,
}: ExampleProps) {
  const hasCode = !!(rust || typescript);
  const hasAside = !!(description || hasCode);

  // Code snippets are shown by default but can be collapsed so a tall card
  // doesn't overlay the scene behind it.
  const [open, setOpen] = useState(true);

  return (
    <node style={cardStyle}>
      <node style={demoStyle}>{children}</node>

      {hasCode && (
        <button
          onClick={() => setOpen((o) => !o)}
          style={codeToggleStyle}
          hoverStyle={{ backgroundColor: Colors.surface500 }}
        >
          <TextMono style={codeToggleLabelStyle}>{open ? "-" : "+"}</TextMono>
        </button>
      )}

      {hasAside && (
        <node style={asideStyle}>
          {description && <text style={descriptionStyle}>{description}</text>}

          {hasCode && (
            <node
              style={{
                flexDirection: "column",
                gap: 8,
                overflowY: "clip",
                maxHeight: open ? estimateCodeHeight(rust, typescript) : 0,
                transition: { size: { duration: 300, easing: "easeOut" } },
              }}
            >
              {rust && <Code lang="rust" code={rust} />}
              {typescript && <Code lang="typescript" code={typescript} />}
            </node>
          )}
        </node>
      )}
    </node>
  );
}

// `maxHeight` only clips, so a generous overshoot is safe: when it exceeds the
// content the snippets take their natural height. Estimate from line counts so
// the open animation reaches full height without clipping the last line.
function estimateCodeHeight(rust?: string, typescript?: string): number {
  const lines = (s?: string) => (s ? s.split("\n").length : 0);
  const PER_LINE_PX = 20;
  const PER_SNIPPET_PX = 60; // lang label + paddings
  const snippets = [rust, typescript].filter(Boolean) as string[];
  const lineTotal = snippets.reduce((sum, s) => sum + lines(s), 0);
  return lineTotal * PER_LINE_PX + snippets.length * PER_SNIPPET_PX;
}

type CodeProps = {
  lang: "typescript" | "rust";
  code: string;
};
function Code({ lang, code }: CodeProps) {
  return (
    <node style={{ flexDirection: "column" }}>
      <TextMono style={{ fontSize: FontSizes.sm, padding: 5 }}>{lang}</TextMono>
      <TextMono
        style={{
          fontSize: FontSizes.xs,
          color: Colors.textColor200,
          padding: 10,
        }}
      >
        {code}
      </TextMono>
    </node>
  );
}

const cardStyle: BevyStyle = {
  alignItems: "stretch",
  justifyContent: "center",
  minWidth: 320,
  backgroundColor: Colors.surface200,
  borderRadius: 16,
  border: 2,
  borderColor: Colors.primary100,
  zIndex: 1000,
  boxShadow: { blurRadius: 15, spreadRadius: 5, color: Colors.shadow100 },
};

const demoStyle: BevyStyle = {
  flexDirection: "column",
  gap: 8,
  alignItems: "center",
  justifyContent: "center",
  border: { right: 2 },
  borderColor: Colors.primary100,
  padding: 28,
};

const asideStyle: BevyStyle = {
  flexDirection: "column",
  justifyContent: "center",
  gap: 8,
  padding: 16,
};

const codeToggleStyle: BevyStyle = {
  positionType: "absolute",
  top: 8,
  right: 8,
  width: 24,
  height: 24,
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 6,
  backgroundColor: Colors.surface300,
  zIndex: 1,
  transition: { backgroundColor: { duration: 200 } },
};

const codeToggleLabelStyle: BevyStyle = {
  color: Colors.textColor100,
  fontSize: FontSizes.base,
  fontWeight: "bold",
};

const descriptionStyle: BevyStyle = {
  color: Colors.textColor200,
  fontSize: FontSizes.sm,
  maxWidth: 320,
  padding: 5,
};
