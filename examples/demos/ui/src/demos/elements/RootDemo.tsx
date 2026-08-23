import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Button, Example } from "@/components";
import { Code, InlineCode, P } from "@/components/docs";
import { Colors } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

// The `<root>` host element: a **detached, screen-space top-level tree** — the
// on-screen twin of `<surface>`. Wherever the element sits in your component
// tree, its children render as an independent window-filling layer floating
// above the app (top of the global stack by default) — the natural home for
// modals, toasts, and other overlays. The `name` labels the root in the
// devtools root selector (F12).

const ROOT_TSX = `{open && (
  <root
    name="modal"
    style={{
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#000000aa",
    }}
  >
    <node style={dialogStyle}>
      <text>Detached modal</text>
      <Button onClick={() => setOpen(false)}>Close</Button>
    </node>
  </root>
)}`;

const PAGE: ExplanationData = {
  title: "<root>",
  info: (
    <>
      <P>
        <InlineCode>{"<root>"}</InlineCode> is a detached, screen-space
        top-level tree — the on-screen twin of{" "}
        <InlineCode>{"<surface>"}</InlineCode>. Wherever it sits in your
        component tree, its children render as a window-filling layer floating
        above the whole app (top of the global stack by default) — the natural
        home for modals, toasts, and other overlays.
      </P>
      <Code lang="tsx">{ROOT_TSX}</Code>
      <P>
        Since the root fills the window, backdrop styling (dim, centering) goes
        straight on it. Its <InlineCode>name</InlineCode> labels the root in the
        devtools root selector (F12): open the modal below and a root named
        "modal" appears there.
      </P>
    </>
  ),
};

export function RootDemo() {
  useDemoPage(PAGE);
  return (
    <Example
      title="Detached modal"
      info={
        <>
          <P>
            The dialog is declared inside this small card, but renders
            window-filling and above everything — the left nav, the cards, all
            of it. Mounting and unmounting the{" "}
            <InlineCode>{"<root>"}</InlineCode> with plain conditional rendering
            is the whole open/close mechanism.
          </P>
          <Code lang="tsx">{ROOT_TSX}</Code>
        </>
      }
      demo={DetachedModalCard}
    />
  );
}

function DetachedModalCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <text style={hintStyle}>
        The dialog is declared right here, inside this small card.
      </text>
      <Button onClick={() => setOpen(true)}>Open modal</Button>

      {open && (
        <root name="modal" style={backdropStyle}>
          <node style={dialogStyle}>
            <text style={titleStyle}>Detached modal</text>
            <text style={bodyStyle}>
              This dialog lives in a {"<root>"}: a detached, screen-space tree
              that fills the window and floats above everything — the left nav,
              the demo card, all of it — even though the component sits inside
              the card.
            </text>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </node>
        </root>
      )}
    </>
  );
}

const hintStyle: BevyStyle = {
  color: Colors.textColor200,
  fontSize: 14,
};

// The `<root>` already fills the window (a centered column by default); the
// backdrop styling (dim + center the dialog) goes straight on it.
const backdropStyle: BevyStyle = {
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#000000aa",
};

const dialogStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "flexStart",
  gap: 12,
  maxWidth: 420,
  padding: 20,
  backgroundColor: Colors.surface200,
  border: 1,
  borderColor: Colors.surface400,
  borderRadius: 12,
};

const titleStyle: BevyStyle = {
  color: Colors.textColor100,
  fontSize: 20,
};

const bodyStyle: BevyStyle = {
  color: Colors.textColor200,
  fontSize: 14,
};
