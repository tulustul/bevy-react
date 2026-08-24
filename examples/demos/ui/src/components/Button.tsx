import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";
import { Colors, FontSizes, Gradients } from "@/theme";
import { Pinchable } from "./Pinchable";
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
   *  (`{ strength: 0 }` disables). Note: Pinchable owns the button's
   *  `filter` — a `filter` passed via `style` is replaced unless disabled. */
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
  return (
    <Pinchable params={pinch}>
      <button
        onClick={onClick}
        style={unstyled ? (style ?? {}) : { ...buttonStyle, ...(style ?? {}) }}
        hoverStyle={
          unstyled
            ? (hoverStyle ?? {})
            : { ...buttonHoverStyle, ...(hoverStyle ?? {}) }
        }
        pressStyle={pressStyle ?? {}}
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
  backgroundColor: Colors.surface400,
  backgroundGradient: Gradients.surface,
  transition: {
    backgroundColor: { duration: 150 },
    transform: { duration: 150 },
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
