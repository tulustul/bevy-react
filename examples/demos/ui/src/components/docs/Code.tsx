import { useEffect, useRef, useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { bevy } from "@/bevy";
import { Colors, Fonts, FontSizes } from "@/theme";
import { CodeLang, HighlightedCode } from "./highlight";

const LANG_LABEL: Record<CodeLang, string> = {
  tsx: "TSX",
  rust: "Rust",
  sh: "shell",
};

/** Each side's light: React's code cyan, Bevy's ember, the shell neutral. */
const LANG_ACCENT: Record<CodeLang, string> = {
  tsx: Colors.cyan,
  rust: Colors.ember,
  sh: Colors.textDim,
};

/**
 * A copyable, syntax-highlighted code block. `children` is the source string:
 *
 *   <Code lang="tsx">{`<node style={{ gap: 8 }} />`}</Code>
 */
export function Code({
  lang,
  title,
  children,
}: {
  lang: CodeLang;
  title?: string;
  children: string;
}) {
  return (
    <node style={blockStyle}>
      <node style={headerStyle}>
        <text style={{ ...langLabelStyle, color: LANG_ACCENT[lang] }}>
          {title ?? LANG_LABEL[lang]}
        </text>
        <CopyButton text={children} />
      </node>
      <node style={bodyStyle}>
        <HighlightedCode lang={lang} code={children} />
      </node>
    </node>
  );
}

/**
 * The same feature shown from both sides: a tabbed TSX/Rust pair (each tab a
 * copyable highlighted block). Use only where the Rust half genuinely
 * documents the feature; single-language snippets should use `<Code>`.
 */
export function CodeTabs({ tsx, rust }: { tsx: string; rust: string }) {
  const [active, setActive] = useState<"tsx" | "rust">("tsx");
  const code = active === "tsx" ? tsx : rust;
  return (
    <node style={blockStyle}>
      <node style={headerStyle}>
        <node style={tabsStyle}>
          <TabButton
            label="TSX"
            accent={Colors.cyan}
            active={active === "tsx"}
            onClick={() => setActive("tsx")}
          />
          <TabButton
            label="Rust"
            accent={Colors.ember}
            active={active === "rust"}
            onClick={() => setActive("rust")}
          />
        </node>
        <CopyButton text={code} />
      </node>
      <node style={bodyStyle}>
        <HighlightedCode lang={active} code={code} />
      </node>
    </node>
  );
}

/** A language tab: the active one is lit in its side's color (TSX cyan,
 *  Rust ember) and underlined. */
function TabButton({
  label,
  accent,
  active,
  onClick,
}: {
  label: string;
  accent: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <node
      style={{
        ...tabStyle,
        borderColor: active ? accent : Colors.transparent,
      }}
      hoverStyle={active ? undefined : tabHoverStyle}
      onClick={onClick}
    >
      <text
        style={{ ...langLabelStyle, color: active ? accent : Colors.textDim }}
      >
        {label}
      </text>
    </node>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = () => {
    bevy.clipboard.copy({ text });
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1500);
  };

  return (
    <node style={copyStyle} hoverStyle={copyHoverStyle} onClick={copy}>
      <text
        style={{
          ...langLabelStyle,
          color: copied ? Colors.mint : Colors.textBody,
        }}
      >
        {copied ? "Copied" : "Copy"}
      </text>
    </node>
  );
}

const blockStyle: BevyStyle = {
  flexDirection: "column",
  backgroundColor: Colors.stage,
  borderRadius: 12,
  border: 1,
  borderColor: Colors.line,
  alignItems: "stretch",
};

const headerStyle: BevyStyle = {
  flexDirection: "row",
  justifyContent: "spaceBetween",
  alignItems: "center",
  minHeight: 34,
  padding: { left: 14, right: 6 },
  border: { bottom: 1 },
  borderColor: Colors.line,
};

const langLabelStyle: BevyStyle = {
  fontFamily: Fonts.mono,
  fontSize: FontSizes.xxs,
  fontWeight: "medium",
  letterSpacing: 0.6,
  color: Colors.textDim,
};

const bodyStyle: BevyStyle = {
  padding: { vertical: 14, horizontal: 16 },
  overflowX: "scroll",
};

// Full header height, so each tab's underline sits on the header's hairline.
const tabsStyle: BevyStyle = {
  flexDirection: "row",
  alignSelf: "stretch",
  gap: 4,
  margin: { left: -8 },
};

const tabStyle: BevyStyle = {
  justifyContent: "center",
  alignItems: "center",
  padding: { top: 2, horizontal: 8 },
  border: { bottom: 2 },
  cursor: "pointer",
};

const tabHoverStyle: BevyStyle = {
  borderColor: Colors.lineStrong,
};

const copyStyle: BevyStyle = {
  padding: { horizontal: 10, vertical: 4 },
  borderRadius: 6,
  cursor: "pointer",
};

const copyHoverStyle: BevyStyle = {
  backgroundColor: Colors.raised,
};
