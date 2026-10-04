import { useEffect, useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Colors, Fonts } from "@/theme";
import { Pinchable } from "@/components";

const title = "bevy-react";
const titleDelay = 7000;

type TitleProps = {
  /** Merged over the wordmark's own style (its place in the parent's flow). */
  style?: BevyStyle;
};

/**
 * The library wordmark — "bevy" in Bevy's ember, "react" in React's cyan. It
 * dusts away from time to time — or on click — and blows back in. Lives in
 * the nav column (under the logo) on the regular shell and in the top bar on
 * the compact one (never both — one mount, one morph).
 *
 * The text stays mounted (its wrapper keeps its layout size) — a morph
 * snapshot is layout-anchored, and a collapsing wrapper would stretch the
 * frozen image; the key flip freezes the old appearance and `dustify` blends
 * it with the new live content.
 */
export function Title({ style }: TitleProps) {
  const [text, setText] = useState(title);
  const toggle = () => setText(text === title ? "Demos" : title);

  // The ambient flip; a click-triggered toggle re-arms it (effect deps on
  // `text`), so the next automatic morph is always a full delay away.
  useEffect(() => {
    const delay = titleDelay + Math.random() * titleDelay;
    const id = setTimeout(toggle, delay);
    return () => clearTimeout(id);
    // Deliberately keyed on `text` only: `toggle` is recreated every render,
    // and listing it would re-arm the timer on unrelated re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <Pinchable
      params={{ strength: 0.28, radius: 0.4 }}
      shadow={null}
      style={style}
    >
      <node
        onClick={toggle}
        style={{
          ...wordmarkBoxStyle,
          morphFilter: {
            key: text,
            name: "dustify",
            params: {
              direction: 0,
              softness: 120,
              turbulence: 0.6,
              wind: 0,
              drift: 24,
              grain: 3,
            },
          },
          transition: { morphFilter: { duration: 2000, easing: "linear" } },
        }}
      >
        <Wordmark text={text} />
      </node>
    </Pinchable>
  );
}

function Wordmark({ text }: { text: string }) {
  if (text !== title) return <text style={wordStyle}>{text}</text>;
  // Spans take element defaults for unset fields — each restates the face.
  return (
    <text style={wordStyle}>
      <text style={{ ...wordStyle, color: Colors.ember }}>bevy</text>
      <text style={{ ...wordStyle, color: Colors.textFaint }}>-</text>
      <text style={{ ...wordStyle, color: Colors.cyan }}>react</text>
    </text>
  );
}

// Wide enough for either word, so the morph's capture never changes size.
const wordmarkBoxStyle: BevyStyle = {
  width: 156,
  justifyContent: "center",
  cursor: "pointer",
};

const wordStyle: BevyStyle = {
  fontFamily: Fonts.display,
  fontSize: 24,
  fontWeight: "bold",
  letterSpacing: -0.4,
  color: Colors.text,
};
