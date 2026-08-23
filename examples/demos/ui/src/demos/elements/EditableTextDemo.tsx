import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Example } from "@/components";
import { Code, InlineCode, Li, P, Ul } from "@/components/docs";
import { Colors, FontSizes } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

const PAGE: ExplanationData = {
  title: "<editableText>",
  info: (
    <>
      <P>
        <InlineCode>{"<editableText>"}</InlineCode> is a focusable text input
        with the controlled-component contract you know from React:{" "}
        <InlineCode>value</InlineCode> + <InlineCode>onChange</InlineCode>.
        Editing, caret, selection, IME composition, and clipboard (Ctrl+C/V/X)
        are all handled engine-side.
      </P>
      <Code lang="tsx">{`<editableText
  value={name}
  onChange={setName}
  autofocus
  maxLength={40}
  style={inputStyle}
  focusStyle={{ borderColor: "#89b4fa" }}
/>`}</Code>
      <Ul>
        <Li>
          focusStyle overlays while the field has focus — applied on the Bevy
          side, no onFocus/onBlur round-trip or React focus state needed.
        </Li>
        <Li>
          onFocus / onBlur / onSelect report focus and selection; onBlur for the
          old field fires AFTER onFocus for the new one.
        </Li>
        <Li>maxLength caps input; autofocus grabs focus on mount.</Li>
      </Ul>
    </>
  ),
};

type Selection = {
  start: number;
  end: number;
  direction: string;
  composing: boolean;
};

export function EditableTextDemo() {
  useDemoPage(PAGE);
  return (
    <Example
      title="Name form"
      info={
        <>
          <P>
            Two controlled fields feeding one greeting, with a status box
            mirroring what the element reports: which field is focused, the
            caret or selection range, and whether an IME composition is in
            flight. Note the blur guard — because{" "}
            <InlineCode>onBlur</InlineCode> for the old field arrives after{" "}
            <InlineCode>onFocus</InlineCode> for the new one, clear the focused
            label only if it still names the field losing focus.
          </P>
          <Code lang="tsx">{`const blur = (label: string) =>
  setFocused((f) => (f === label ? null : f));

<editableText
  value={first}
  onChange={setFirst}
  onFocus={() => setFocused("First name")}
  onBlur={() => blur("First name")}
  onSelect={(s) => setSel(s)}
  autofocus
  style={inputStyle}
  focusStyle={{ borderColor: "#89b4fa" }}
/>`}</Code>
        </>
      }
      demo={NameFormCard}
    />
  );
}

function NameFormCard() {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [focused, setFocused] = useState<string | null>(null);
  const [sel, setSel] = useState<Selection | null>(null);

  const name = [first, last].filter(Boolean).join(" ");

  // `onBlur` fires for the old field after `onFocus` for the new one, so only
  // clear when the field losing focus is still the one we have recorded.
  const blur = (label: string) => setFocused((f) => (f === label ? null : f));
  const select = (s: {
    selectionStart: number;
    selectionEnd: number;
    selectionDirection: string;
    composing: boolean;
  }) =>
    setSel({
      start: s.selectionStart,
      end: s.selectionEnd,
      direction: s.selectionDirection,
      composing: s.composing,
    });

  return (
    <>
      <text>What's your first name?</text>
      <editableText
        value={first}
        onChange={setFirst}
        onFocus={() => setFocused("First name")}
        onBlur={() => blur("First name")}
        onSelect={select}
        autofocus
        ariaLabel="First name"
        maxLength={40}
        style={inputStyle}
        focusStyle={focusStyle}
      />

      <text>What's your last name?</text>
      <editableText
        value={last}
        onChange={setLast}
        onFocus={() => setFocused("Last name")}
        onBlur={() => blur("Last name")}
        onSelect={select}
        ariaLabel="Last name"
        maxLength={40}
        style={inputStyle}
        focusStyle={focusStyle}
      />

      <text style={{ fontSize: FontSizes.xxl }}>
        {name ? `Hello ${name}` : " "}
      </text>

      <node style={statusBoxStyle}>
        <text style={statusLineStyle}>Focused: {focused ?? "none"}</text>
        <text style={statusLineStyle}>
          {sel
            ? sel.start === sel.end
              ? `Caret at ${sel.start}`
              : `Selection ${sel.start}–${sel.end} (${sel.direction})`
            : "Selection: none"}
          {sel?.composing ? " · composing" : ""}
        </text>
      </node>
    </>
  );
}

const inputStyle: BevyStyle = {
  width: 280,
  height: 40,
  justifyContent: "center",
  padding: { top: 8, right: 12, bottom: 8, left: 12 },
  backgroundColor: Colors.surface100,
  borderRadius: 8,
  border: 1,
  borderColor: Colors.surface500,
  color: Colors.textColor100,
  fontSize: FontSizes.base,
};

// Overlaid on `inputStyle` while the field is focused — applied entirely on the
// Bevy side, so no `onFocus`/`onBlur` round-trip or React state is needed.
const focusStyle: BevyStyle = {
  borderColor: Colors.primary200,
};

const statusBoxStyle: BevyStyle = {
  width: 280,
  flexDirection: "column",
  gap: 4,
  padding: { top: 8, right: 12, bottom: 8, left: 12 },
  backgroundColor: Colors.surface200,
  borderRadius: 8,
  border: 1,
  borderColor: Colors.surface400,
};

const statusLineStyle: BevyStyle = {
  fontSize: FontSizes.sm,
  color: Colors.textColor200,
};
