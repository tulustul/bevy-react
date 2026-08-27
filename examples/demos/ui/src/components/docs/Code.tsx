import { useEffect, useRef, useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { bevy } from "@/bevy";
import { Colors, FontSizes } from "@/theme";
import { CodeLang, HighlightedCode } from "./highlight";

const LANG_LABEL: Record<CodeLang, string> = {
  tsx: "TSX",
  rust: "Rust",
  sh: "shell",
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
        <text style={langLabelStyle}>{title ?? LANG_LABEL[lang]}</text>
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
        <node style={{ flexDirection: "row", gap: 4 }}>
          <TabButton
            label="TSX"
            active={active === "tsx"}
            onClick={() => setActive("tsx")}
          />
          <TabButton
            label="Rust"
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

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <node
      style={{ ...tabStyle, ...(active ? tabActiveStyle : null) }}
      hoverStyle={active ? undefined : tabHoverStyle}
      onClick={onClick}
    >
      <text
        style={{
          fontSize: FontSizes.xs,
          color: active ? Colors.textColor100 : Colors.textColor300,
        }}
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
          fontSize: FontSizes.xs,
          color: copied ? Colors.green100 : Colors.textColor200,
        }}
      >
        {copied ? "Copied" : "Copy"}
      </text>
    </node>
  );
}

const blockStyle: BevyStyle = {
  flexDirection: "column",
  backgroundColor: Colors.surface100,
  borderRadius: 10,
  border: 1,
  borderColor: Colors.surface400,
  alignItems: "stretch",
};

const headerStyle: BevyStyle = {
  flexDirection: "row",
  justifyContent: "spaceBetween",
  alignItems: "center",
  padding: { top: 4, bottom: 4, left: 10, right: 4 },
  border: { bottom: 1 },
  borderColor: Colors.surface300,
};

const langLabelStyle: BevyStyle = {
  fontSize: FontSizes.xs,
  color: Colors.textColor300,
};

const bodyStyle: BevyStyle = {
  padding: 10,
  overflowX: "scroll",
};

const tabStyle: BevyStyle = {
  padding: { vertical: 2, horizontal: 8 },
  borderRadius: 6,
  cursor: "pointer",
};

const tabActiveStyle: BevyStyle = {
  backgroundColor: Colors.surface300,
};

const tabHoverStyle: BevyStyle = {
  backgroundColor: Colors.surface200,
};

const copyStyle: BevyStyle = {
  padding: { horizontal: 10, vertical: 3 },
  borderRadius: 6,
  cursor: "pointer",
};

const copyHoverStyle: BevyStyle = {
  backgroundColor: Colors.surface300,
};
