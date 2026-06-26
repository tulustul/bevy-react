import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";
import { Colors, FontSizes, Gradients } from "@/theme";

export type ButtonProps = PropsWithChildren & {
  style?: BevyStyle;
  hoverStyle?: BevyStyle;
  pressStyle?: BevyStyle;
  labelStyle?: BevyStyle;
  onClick: () => void;
};

export function Button({
  onClick,
  style,
  hoverStyle,
  pressStyle,
  labelStyle,
  children,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{ ...buttonStyle, ...(style ?? {}) }}
      hoverStyle={{ ...buttonHoverStyle, ...(hoverStyle ?? {}) }}
      pressStyle={{ ...buttonPressStyle, ...(pressStyle ?? {}) }}
    >
      <text style={{ ...buttonLabelStyle, ...(labelStyle ?? {}) }}>
        {children}
      </text>
    </button>
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
};

const buttonHoverStyle: BevyStyle = {
  backgroundGradient: Gradients.surfaceHover,
};

const buttonPressStyle: BevyStyle = {
  transform: { scale: 0.9 },
};

const buttonLabelStyle: BevyStyle = {
  color: Colors.textColor100,
  fontSize: FontSizes.sm,
  fontWeight: "bold",
};
