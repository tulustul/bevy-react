import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Example } from "@/components";
import { Colors, FontSizes } from "@/theme";

const TYPESCRIPT = `<editableText
  value={first}
  onChange={setFirst}
  onFocus={() => setFocused("First name")}
  onBlur={() => setFocused(null)}
  onSelect={(s) => setSel(s)}
  autofocus
  style={inputStyle}
  focusStyle={{ borderColor: Colors.primary200 }}
/>`;

type Selection = {
  start: number;
  end: number;
  direction: string;
  composing: boolean;
};

export function EditableTextDemo() {
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
    <Example
      description="Focusable text inputs: controlled value + a Bevy-side focusStyle (no React focus state). The box reports focus and selection via onFocus/onBlur/onSelect. IME and clipboard (Ctrl+C/V/X) work out of the box."
      tsx={TYPESCRIPT}
    >
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

      <text style={{ fontSize: FontSizes.xxl, opacity: name ? 1 : 0 }}>
        Hello {name}
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
    </Example>
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
