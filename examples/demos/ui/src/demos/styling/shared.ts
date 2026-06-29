import { BevyStyle } from "bevy-react/jsx";
import { Colors, FontSizes } from "@/theme";

// Small shared building blocks so the styling demos stay short and consistent.
// Colors come from the global theme; see ../../theme.

export const box: BevyStyle = {
  width: 72,
  height: 72,
  borderRadius: 10,
  backgroundColor: Colors.primary100,
  justifyContent: "center",
  alignItems: "center",
};

export const row: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
};

export const column: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
};

export const stage: BevyStyle = {
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  padding: 14,
  backgroundColor: Colors.surface100,
  borderRadius: 12,
};

export const caption: BevyStyle = {
  color: Colors.textColor200,
  fontSize: FontSizes.xs,
};

// A live target stacked above its slider(s)/control — the standard layout for the
// interactive styling examples.
export const controlColumn: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 16,
};
