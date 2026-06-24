import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";

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
  backgroundColor: "#2a2a3c",
  transition: {
    backgroundColor: { duration: 1500 },
    transform: { duration: 1500 },
  },
};

const buttonHoverStyle: BevyStyle = {
  backgroundColor: "#42425e",
};

const buttonPressStyle: BevyStyle = {
  transform: { scale: 0.9 },
};

const buttonLabelStyle: BevyStyle = {
  color: "#cdd6f4",
  fontSize: 14,
  fontWeight: "bold",
};
