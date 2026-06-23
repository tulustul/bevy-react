import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";

export function Card({ children }: PropsWithChildren) {
  return <node style={cardStyle}>{children}</node>;
}

export const cardStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 20,
  padding: 28,
  minWidth: 320,
  backgroundColor: "#1e1e2e",
  borderRadius: 16,
  border: 2,
  borderColor: "#7aa2f7",
  zIndex: 1000,
};
