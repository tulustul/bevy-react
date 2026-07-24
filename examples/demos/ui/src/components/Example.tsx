import { PropsWithChildren, useEffect, useRef } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Colors, Filters, Gradients } from "@/theme";
import { useExplanationStore } from "@/explanationStore";

export type ExampleProps = PropsWithChildren & {
  style?: BevyStyle;
  title?: string;
  description?: string;
  tsx?: string;
  rust?: string;
};

export function Example({
  children,
  style,
  title,
  description,
  tsx,
  rust,
}: ExampleProps) {
  // Stable per-instance identity for the selection (survives hot reload).
  const key = useRef({}).current;
  const selectable = title !== undefined;
  const isSelected = useExplanationStore(
    (s) => selectable && s.selected?.key === key,
  );
  const select = useExplanationStore((s) => s.select);

  // A selected card unmounting (in-page conditional rendering) falls back to
  // the page default; page switches are already covered by setPage.
  useEffect(() => {
    return () => useExplanationStore.getState().deselect(key);
  }, [key]);

  return (
    <node
      style={{ ...cardStyle, ...(isSelected ? selectedStyle : null), ...style }}
      onClick={
        selectable
          ? () => select(key, { title: title!, description, rust, tsx })
          : undefined
      }
    >
      {title !== undefined && (
        <text style={{ textAlign: "center" }}>{title}</text>
      )}
      {children}
    </node>
  );
}

const cardStyle: BevyStyle = {
  alignItems: "stretch",
  justifyContent: "flexStart",
  flexDirection: "column",
  minWidth: 150,
  padding: 10,
  gap: 8,
  backdropFilter: Filters.backdrop,
  backgroundGradient: Gradients.card,
  borderRadius: 16,
  border: 2,
  borderColor: Colors.primary100,
  borderGradient: Gradients.accentBorderDim,
  boxShadow: { blurRadius: 15, spreadRadius: 5, color: Colors.shadow100 },
};

const selectedStyle: BevyStyle = {
  borderGradient: Gradients.accentBorder,
  boxShadow: { blurRadius: 20, spreadRadius: 6, color: Colors.primaryOverlay },
};
