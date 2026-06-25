import { BevyStyle } from "bevy-react/jsx";
import { TextMono, Typewriter } from "@/components";
import { Colors, FontSizes } from "@/theme";
import { RUST, TSX } from "./source";

/** The source viewer: the surface's own code, revealed with the typewriter. */
export function CodeViewer() {
  return (
    <node style={body}>
      <TextMono style={heading}>SURFACE.RS — source</TextMono>
      <CodeBlock lang="rust" code={RUST} />
      <CodeBlock lang="tsx" code={TSX} />
    </node>
  );
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  return (
    <node style={block}>
      <TextMono style={langLabel}>{lang}</TextMono>
      <Typewriter style={codeText} text={code} cursor />
    </node>
  );
}

const body: BevyStyle = {
  flexGrow: 1,
  flexDirection: "column",
  gap: 14,
  padding: 24,
};

const heading: BevyStyle = {
  color: Colors.textColor300,
  fontSize: FontSizes.sm,
  fontWeight: "bold",
};

const block: BevyStyle = {
  flexDirection: "column",
  backgroundColor: Colors.surface100,
  borderRadius: 8,
  padding: { top: 12, right: 16, bottom: 14, left: 16 },
};

const langLabel: BevyStyle = {
  color: Colors.primary100,
  fontSize: FontSizes.sm,
  fontWeight: "bold",
  padding: { bottom: 6 },
};

const codeText: BevyStyle = {
  color: Colors.textColor100,
  fontSize: FontSizes.base,
  fontFamily: "Noto Sans Mono",
};
