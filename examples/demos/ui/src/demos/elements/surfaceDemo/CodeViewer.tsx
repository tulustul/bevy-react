import { BevyStyle } from "bevy-react/jsx";
import { TextMono } from "@/components/typography";
import { Typewriter } from "@/components";
import { Colors, Fonts, FontSizes } from "@/theme";

// The code samples the viewer types out.
const TSX = `<surface target="monitor">
  <MonitorApp />
</surface>`;

const RUST = `// register the surface → Handle<Image>
let screen = surfaces.create(
    &mut images, "monitor", spec,
);
// drape it on the glTF screen mesh and
// make it clickable in 3D
material.base_color_texture =
    Some(screen);
commands.entity(screen_mesh).insert(
    SurfacePointer("monitor".into()),
);`;

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

/** Each side's light, as in the gallery's code blocks: Rust ember, TSX cyan. */
function CodeBlock({ lang, code }: { lang: "rust" | "tsx"; code: string }) {
  return (
    <node style={block}>
      <node style={blockHeader}>
        <TextMono
          style={{
            ...langLabel,
            color: lang === "rust" ? Colors.ember : Colors.cyan,
          }}
        >
          {lang}
        </TextMono>
      </node>
      <node style={blockBody}>
        <Typewriter style={codeText} text={code} cursor />
      </node>
    </node>
  );
}

const body: BevyStyle = {
  flexGrow: 1,
  flexDirection: "column",
  gap: 14,
  padding: 24,
};

// An eyebrow, like the gallery's section labels.
const heading: BevyStyle = {
  color: Colors.textDim,
  fontSize: FontSizes.xs,
  fontWeight: "medium",
  letterSpacing: 1.2,
};

// The gallery's code block: a recessed panel with a hairline rim, its language
// in a header row closed by a hairline.
const block: BevyStyle = {
  flexDirection: "column",
  alignItems: "stretch",
  backgroundColor: Colors.stage,
  border: 1,
  borderColor: Colors.line,
  borderRadius: 12,
};

const blockHeader: BevyStyle = {
  padding: { horizontal: 16, vertical: 8 },
  border: { bottom: 1 },
  borderColor: Colors.line,
};

const blockBody: BevyStyle = {
  padding: { horizontal: 16, vertical: 12 },
};

const langLabel: BevyStyle = {
  fontSize: FontSizes.xs,
  fontWeight: "medium",
  letterSpacing: 0.6,
};

const codeText: BevyStyle = {
  color: Colors.text,
  fontSize: FontSizes.sm,
  lineHeight: 1.45,
  fontFamily: Fonts.mono,
};
