import {
  ComponentType,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Colors, Filters, Gradients } from "@/theme";
import { useExplanationStore } from "@/explanationStore";

export type ExampleProps = PropsWithChildren & {
  style?: BevyStyle;
  title?: string;
  /** Rich docs content (`components/docs` kit) shown in the example modal. */
  info?: ReactNode;
  /** The live demo as a **component owning its own state**. The card renders
   * one instance; opening the modal mounts a second, fully isolated one.
   * Inline `children` can't do that (they close over the page's state), so
   * children-only examples get no live instance in the modal. */
  demo?: ComponentType;
  /** Legacy string content — still rendered until pages migrate to `info`. */
  description?: string;
  tsx?: string;
  rust?: string;
};

export function Example({
  children,
  style,
  title,
  info,
  demo,
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

  // A selected card unmounting (in-page conditional rendering) closes the
  // modal; page switches are already covered by setPage.
  useEffect(() => {
    return () => useExplanationStore.getState().deselect(key);
  }, [key]);

  return (
    <node
      style={{ ...cardStyle, ...(isSelected ? selectedStyle : null), ...style }}
      hoverStyle={selectable && !isSelected ? hoverStyle : undefined}
      onClick={
        selectable
          ? () =>
              select(key, {
                title: title!,
                info,
                description,
                rust,
                tsx,
                demo,
                cache: style?.cache,
              })
          : undefined
      }
    >
      {title !== undefined && (
        <text style={{ textAlign: "center" }}>{title}</text>
      )}
      {demo !== undefined && <Demo demo={demo} />}
      {children}
    </node>
  );
}

function Demo({ demo: D }: { demo: ComponentType }) {
  return <D />;
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
  borderGradient: Gradients.accentBorderDim,
  boxShadow: { blurRadius: 15, spreadRadius: 5, color: Colors.shadow100 },
  cursor: "pointer",
};

// Hover feedback for a selectable, not-yet-selected card: one surface step
// lighter and a brighter accent border. The selected state goes further —
// a primary-tinted background and the full-strength border.
const hoverStyle: BevyStyle = {
  backgroundGradient: Gradients.cardHover,
  borderGradient: Gradients.accentBorderHover,
};

const selectedStyle: BevyStyle = {
  backgroundGradient: Gradients.cardSelected,
  borderGradient: Gradients.accentBorder,
  boxShadow: { blurRadius: 20, spreadRadius: 6, color: Colors.primaryOverlay },
};
