import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";

export type ButtonProps = PropsWithChildren & {
  onClick: () => void;
};

export function Button({ onClick, children }: ButtonProps) {
  return (
    <button onClick={onClick} style={buttonStyle} hoverStyle={buttonHoverStyle}>
      <text style={labelStyle}>{children}</text>
    </button>
  );
}

const buttonStyle: BevyStyle = {
  padding: { top: 8, right: 12, bottom: 8, left: 12 },
  borderRadius: 8,
  backgroundColor: "#2a2a3c",
};

const buttonHoverStyle: BevyStyle = {
  backgroundColor: "#42425e",
};

const labelStyle: BevyStyle = {
  color: "#cdd6f4",
  fontSize: 14,
  fontWeight: "bold",
};
