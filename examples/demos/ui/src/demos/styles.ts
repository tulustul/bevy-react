import { BevyStyle } from "bevy-react/jsx";

/** The panel each demo renders its controls inside. */
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
};

export const headingStyle: BevyStyle = {
  color: "#cdd6f4",
  fontSize: 22,
  fontWeight: "bold",
};

export const labelStyle: BevyStyle = {
  color: "#a6adc8",
  fontSize: 15,
};

export const buttonStyle: BevyStyle = {
  width: 64,
  height: 56,
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 8,
};
