import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";
import { Colors, FontSizes, Gradients } from "@/theme";
import { isPinchEnabled, Pinchable } from "./Pinchable";
import type { PinchParams } from "@/bevy";

export type ButtonProps = PropsWithChildren & {
  style?: BevyStyle;
  hoverStyle?: BevyStyle;
  pressStyle?: BevyStyle;
  labelStyle?: BevyStyle;
  /** Skip the shared button look (base style, hover gradient, label styling)
   *  — the caller's style/hoverStyle/labelStyle stand alone. The pinch still
   *  applies. For tracks, menu rows, and other button-shaped things that are
   *  not "a button that looks like the gallery's buttons". */
  unstyled?: boolean;
  /** Pinch-on-press overrides, forwarded to `Pinchable` as its `params`
   *  (`{ strength: 0 }` disables). The pinch lives on Pinchable's own press
   *  surface around the `<button>`, so the button's `style` (its `filter`,
   *  `transition`, …) is untouched — except `focusPolicy`, which moves to the
   *  press surface: the inner `<button>` must pass interaction through for
   *  the surface to see the press. */
  pinch?: Partial<PinchParams>;
  onClick?: () => void;
};

export function Button({
  onClick,
  style,
  hoverStyle,
  pressStyle,
  labelStyle,
  unstyled = false,
  pinch,
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
  const baseStyle = unstyled
    ? (style ?? {})
    : { ...buttonStyle, ...(style ?? {}) };
  return (
    <Pinchable params={pinch} focusPolicy={style?.focusPolicy ?? "block"}>
      <button
        onClick={onClick}
        style={{ ...baseStyle, ...(pinched ? { focusPolicy: "pass" } : {}) }}
        hoverStyle={
          unstyled
            ? (hoverStyle ?? {})
            : { ...buttonHoverStyle, ...(hoverStyle ?? {}) }
        }
        pressStyle={{
          ...(pressStyle ?? {}),
        }}
      >
        {isTextChild ? (
          <text
            style={
              unstyled
                ? (labelStyle ?? {})
                : { ...buttonLabelStyle, ...(labelStyle ?? {}) }
            }
          >
            {children}
          </text>
        ) : (
          children
        )}
      </button>
    </Pinchable>
  );
}

const buttonStyle: BevyStyle = {
  justifyContent: "center",
  alignItems: "center",
  padding: { top: 8, right: 12, bottom: 8, left: 12 },
  borderRadius: 8,
  backgroundGradient: Gradients.surface,
  transition: {
    backgroundGradient: { duration: 250 },
  },
  cursor: "pointer",
};

const buttonHoverStyle: BevyStyle = {
  backgroundGradient: Gradients.surfaceHover,
};

const buttonLabelStyle: BevyStyle = {
  color: Colors.textColor100,
  fontSize: FontSizes.sm,
  fontWeight: "bold",
};
