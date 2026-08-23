import { BevyStyle } from "bevy-react/jsx";
import { Colors, FontSizes, Gradients } from "@/theme";

// Shared bits for the animation demos: the standard column layout and a "Play"-style
// button so the interactive triggers look consistent. Colors come from ../../theme.

export const column: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 16,
};

export const playButton: BevyStyle = {
  justifyContent: "center",
  alignItems: "center",
  padding: { top: 8, right: 18, bottom: 8, left: 18 },
  borderRadius: 8,
  backgroundColor: Colors.primary100,
  backgroundGradient: Gradients.primary,
};

export const playLabel: BevyStyle = {
  color: Colors.textColor400,
  fontSize: FontSizes.sm,
  fontWeight: "bold",
};
