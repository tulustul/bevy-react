import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";
import { Colors, FontSizes, Gradients } from "@/theme";
import { isPinchEnabled, Pinchable, type PinchShadow } from "./Pinchable";
import type { PinchParams } from "@/bevy";

export type ButtonProps = PropsWithChildren & {
  style?: BevyStyle;
  hoverStyle?: BevyStyle;
  pressStyle?: BevyStyle;
  labelStyle?: BevyStyle;
  /** Pinch-on-press overrides, forwarded to `Pinchable` as its `params`
   *  (`{ strength: 0 }` disables). The pinch lives on Pinchable's own press
   *  surface around the `<button>`, so the button's `style` (its `filter`,
   *  `transition`, …) is untouched — except `focusPolicy`, which moves to the
   *  press surface: the inner `<button>` must pass interaction through for
   *  the surface to see the press. */
  pinch?: Partial<PinchParams>;
  /** Which fill the button takes: the warm primary (default), or ember
   *  for one that acts on the Bevy side (the 3D world). Sets the fill and
   *  its hover; `style`/`hoverStyle` still override. */
  tone?: Tone;
  /** The drop shadow under the button — see `Pinchable`'s `shadow`
   *  (default: its black drop shadow, which flattens as the button presses
   *  down). */
  shadow?: PinchShadow | null;
  onClick?: () => void;
};

type Tone = "primary" | "ember";

const TONES: Record<Tone, { fill: BevyStyle; hover: BevyStyle }> = {
  primary: {
    fill: { backgroundGradient: Gradients.primary },
    hover: { backgroundGradient: Gradients.primaryHover },
  },
  ember: {
    fill: { backgroundGradient: Gradients.ember },
    hover: { backgroundGradient: Gradients.emberHover },
  },
};

export function Button({
  onClick,
  style,
  hoverStyle,
  pressStyle,
  labelStyle,
  pinch,
  tone = "primary",
  shadow,
  children,
}: ButtonProps) {
  // String/number children get the label treatment; element children (switch
  // knobs, nav rows, …) render as-is.
  const isTextChild =
    typeof children === "string" || typeof children === "number";
  // With a pinch, the press surface wrapping the button is the blocking
  // element (it takes the caller's `focusPolicy`, default block) and the
  // `<button>` itself passes — pointer presses are attributed top-down and
  // stop at the first blocking node, so a blocking button would starve the
  // surface behind it. Without a pinch there is no wrapper: the button keeps
  // its own policy.
  const pinched = isPinchEnabled(pinch);
  const baseStyle = { ...buttonStyle, ...TONES[tone].fill, ...style };
  return (
    <Pinchable
      params={pinch}
      shadow={shadow}
      focusPolicy={style?.focusPolicy ?? "block"}
    >
      <button
        onClick={onClick}
        style={{ ...baseStyle, ...(pinched ? { focusPolicy: "pass" } : {}) }}
        hoverStyle={{ ...TONES[tone].hover, ...hoverStyle }}
        pressStyle={{ ...pressStyle }}
      >
        {isTextChild ? (
          <text style={{ ...buttonLabelStyle, ...labelStyle }}>{children}</text>
        ) : (
          children
        )}
      </button>
    </Pinchable>
  );
}

// Lit from above: the fill brightens toward the top, and a top-only border
// (thinning out along the rounded corners) reads as a specular rim.
const buttonStyle: BevyStyle = {
  justifyContent: "center",
  alignItems: "center",
  padding: { horizontal: 18, vertical: 9 },
  borderRadius: 10,
  border: { top: 1 },
  borderColor: "#ffffffa6",
  transition: {
    backgroundGradient: { duration: 200 },
  },
  cursor: "pointer",
  minWidth: 100,
};

const buttonLabelStyle: BevyStyle = {
  color: Colors.ink,
  fontSize: FontSizes.sm,
  fontWeight: "semibold",
};
