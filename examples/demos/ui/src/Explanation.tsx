import { BevyStyle } from "bevy-react/jsx";
import { Button, TextMono } from "./components";
import { Colors, Filters, FontSizes, Gradients, Scrollbar } from "./theme";
import { useExplanationStore } from "./explanationStore";

const WIDTH = 350;

export function Explanation() {
  const { pageDefault, selected, deselect, collapsed, setCollapsed } =
    useExplanationStore();
  const shown = selected?.data ?? pageDefault;

  // Nothing before the first page registers, and nothing on pages that
  // opted out with `useDemoPage(null)` — no spacer either, so full-width
  // content underneath stays hoverable.
  if (shown === null) {
    return null;
  }

  if (collapsed) {
    return (
      <Button style={expandButtonStyle} onClick={() => setCollapsed(false)}>
        ?
      </Button>
    );
  }

  return (
    <node style={asideStyle}>
      <node style={{ justifyContent: "spaceBetween", alignItems: "center" }}>
        {selected && <Button onClick={() => deselect()}>Back</Button>}
        <text>{shown.title}</text>
        <Button style={hideButtonStyle} onClick={() => setCollapsed(true)}>
          ×
        </Button>
      </node>
      {shown.description && (
        <text style={descriptionStyle}>{shown.description}</text>
      )}

      {shown.rust && <Code lang="rust" code={shown.rust} />}
      {shown.tsx && <Code lang="tsx" code={shown.tsx} />}
    </node>
  );
}

type CodeProps = {
  lang: "tsx" | "rust";
  code: string;
};
function Code({ lang, code }: CodeProps) {
  return (
    <node
      style={{
        flexDirection: "column",
        backgroundColor: Colors.surface100,
        padding: 5,
        borderRadius: 10,
      }}
    >
      <TextMono style={{ fontSize: FontSizes.sm, padding: { bottom: 5 } }}>
        {lang}
      </TextMono>
      <TextMono
        style={{
          fontSize: FontSizes.xxs,
          color: Colors.textColor200,
        }}
      >
        {code}
      </TextMono>
    </node>
  );
}

const asideStyle: BevyStyle = {
  positionType: "absolute",
  right: 0,
  width: WIDTH,
  maxHeight: "100vh",
  flexDirection: "column",
  justifyContent: "flexStart",
  gap: 8,
  padding: 10,
  backdropFilter: Filters.backdrop,
  backgroundGradient: Gradients.card,
  overflowY: "scroll",
  scrollbar: Scrollbar,
  border: { left: 2, bottom: 2 },
  borderRadius: { left: 15 },
  borderGradient: Gradients.primary,
};

const hideButtonStyle: BevyStyle = {
  padding: { top: 2, right: 9, bottom: 2, left: 9 },
};

const expandButtonStyle: BevyStyle = {
  positionType: "absolute",
  top: 10,
  right: 10,
  width: 32,
  height: 32,
  padding: 0,
  borderRadius: 16,
};

const descriptionStyle: BevyStyle = {
  color: Colors.textColor100,
  fontSize: FontSizes.sm,
  maxWidth: 320,
  padding: 5,
  margin: { bottom: 10 },
};
