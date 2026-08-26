import {
  ComponentType,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Colors, Filters, FontSizes, Gradients, Responsiveness } from "@/theme";
import { useExplanationStore } from "@/explanationStore";
import { Button } from "./Button";
import { HeaderText } from "./HeaderText";
import { SecondaryButton } from "./SecondaryButton";
import { useWindowSize } from "@/useWindowSize";

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
  const select = useExplanationStore((s) => s.select);

  const window = useWindowSize();

  // A selected card unmounting (in-page conditional rendering) closes the
  // modal; page switches are already covered by setPage.
  useEffect(() => {
    return () => useExplanationStore.getState().deselect(key);
  }, [key]);

  return (
    <node
      style={{
        ...cardStyle,
        ...style,
        ...(window.width < Responsiveness.desktop && {
          width: "100%",
        }),
        ...(window.width >= Responsiveness.desktop && {
          backdropFilter: Filters.backdrop,
        }),
      }}
    >
      {title !== undefined && (
        // The card itself is inert: the docs modal is opened from the corner
        // button only, so clicks anywhere else land on the live demo inside.
        <node style={titleRowStyle}>
          <HeaderText style={{ fontSize: FontSizes.xl }}>{title}</HeaderText>
          <SecondaryButton
            pinch={{ radius: 0.6 }}
            style={detailsButtonStyle}
            labelStyle={detailsLabelStyle}
            onClick={() =>
              select(key, {
                title,
                info,
                description,
                rust,
                tsx,
                demo,
                cache: style?.cache,
              })
            }
          >
            Details
          </SecondaryButton>
        </node>
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
  alignItems: "center",
  justifyContent: "flexStart",
  flexDirection: "column",
  minWidth: 150,
  maxWidth: "95vw",
  padding: 10,
  gap: 8,
  backgroundGradient: Gradients.card,
  borderRadius: 16,
  border: 2,
  borderGradient: Gradients.accentBorderDim,
  boxShadow: { blurRadius: 15, spreadRadius: 5, color: Colors.shadow100 },
};

const titleRowStyle: BevyStyle = {
  flexDirection: "row",
  alignItems: "flexStart",
  justifyContent: "spaceBetween",
  gap: 35,
  width: "100%",
};

const detailsButtonStyle: BevyStyle = {
  minWidth: 0,
  padding: { top: 4, right: 10, bottom: 4, left: 10 },
  borderRadius: 6,
  flexShrink: 0,
};

const detailsLabelStyle: BevyStyle = {
  fontSize: FontSizes.xs,
};
