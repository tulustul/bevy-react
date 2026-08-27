import { useEffect, useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Colors } from "@/theme";
import { Pinchable } from "@/components";
import { useIsMobile } from "./hooks";

const title = "bevy-react";
const titleDelay = 7000;

type TitleProps = {
  /** Merged over the wrapper's own style (its place in the parent's flow). */
  style?: BevyStyle;
};

/**
 * The library wordmark: it dusts away from time to time — or on click — and
 * blows back in. Lives in the nav column on the regular shell and in the top
 * bar on the compact one (never both — one mount, one morph).
 *
 * The text stays mounted (opacity toggle) so the wrapper keeps its layout
 * size — a morph snapshot is layout-anchored, and a collapsing wrapper would
 * stretch the frozen image; the key flip freezes the old appearance and
 * `dustify` blends it with the (now invisible / visible) live content.
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
      style={{ width: "100%", ...style }}
      params={{ strength: 0.28, radius: 0.4 }}
      filters={[
        {
          name: "gradientMap",
          params: {
            stops: [{ color: "#caf9afff" }, { color: "#c72e00ff" }],
          },
        },
      ]}
    >
      <node
        onClick={toggle}
        style={{
          cursor: "pointer",
          morphFilter: {
            key: text,
            name: "dustify",
            params: {
              direction: 0,
              softness: 180,
              turbulence: 0.6,
              wind: 0,
              drift: 30,
              grain: 4,
            },
          },
          transition: { morphFilter: { duration: 2000, easing: "linear" } },
          width: "100%",
        }}
      >
        <text style={titleStyle}>{text}</text>
      </node>
    </Pinchable>
  );
}

const titleStyle: BevyStyle = {
  fontFamily: "MetalMania",
  fontSize: 40,
  color: Colors.primary100,
  fontWeight: "bold",
  width: "100%",
  textAlign: "center",
};
