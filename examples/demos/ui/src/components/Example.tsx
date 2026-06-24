import { PropsWithChildren } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { codeStyle } from "../demos/styles";
import { Colors, FontSizes } from "../theme";

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
  const hasAside = !!(description || typescript || rust);

  return (
    <node style={cardStyle}>
      <node style={demoStyle}>{children}</node>

      {hasAside && (
        <node style={asideStyle}>
          {description && <text style={descriptionStyle}>{description}</text>}
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
      <text style={{ ...codeStyle, fontSize: FontSizes.sm, padding: 5 }}>
        {lang}
      </text>
      <text
        style={{
          ...codeStyle,
          fontSize: FontSizes.xs,
          color: Colors.textColor200,
          padding: 10,
        }}
      >
        {code}
      </text>
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

const descriptionStyle: BevyStyle = {
  color: Colors.textColor200,
  fontSize: FontSizes.sm,
  maxWidth: 320,
  padding: 5,
};
