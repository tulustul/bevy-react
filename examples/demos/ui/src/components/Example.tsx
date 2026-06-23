import { PropsWithChildren } from "react";
import { BevyStyle } from "bevy-react/jsx";

export type ExampleProps = PropsWithChildren & {
  typescript?: string;
  rust?: string;
};

export function Example({ children, typescript, rust }: ExampleProps) {
  return (
    <node style={cardStyle}>
      <node
        style={{
          flexDirection: "column",
          gap: 8,
          alignItems: "center",
          border: { right: 2 },
          borderColor: "#7aa2f7",
          padding: 28,
        }}
      >
        {children}
      </node>

      {(typescript || rust) && (
        <node
          style={{
            flexDirection: "column",
          }}
        >
          {rust && <Code lang="rust" code={rust} />}
          {typescript && <Code lang="typescript" code={typescript} />}
        </node>
      )}
    </node>
  );
}

type CodeProps = {
  lang: "typescript" | "rust";
  code: string;
};
function Code({ lang, code }: CodeProps) {
  return (
    <node style={{ flexDirection: "column" }}>
      <text style={{ fontSize: 14, padding: 5 }}>{lang}</text>
      <text style={{ fontSize: 12, color: "#aaa", padding: 10 }}>{code}</text>
    </node>
  );
}

const cardStyle: BevyStyle = {
  alignItems: "stretch",
  justifyContent: "center",
  minWidth: 320,
  backgroundColor: "#1e1e2e",
  borderRadius: 16,
  border: 2,
  borderColor: "#7aa2f7",
  zIndex: 1000,
  boxShadow: { blurRadius: 15, spreadRadius: 5, color: "#00000088" },
};
