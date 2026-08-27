import {
  ComponentType,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { BevyStyle } from "bevy-react/jsx";
import { FontSizes } from "@/theme";
import { useExplanationStore } from "@/explanationStore";

import { SecondaryButton } from "./SecondaryButton";
import { Card } from "./Card";
import { CardHeader } from "./CardHeader";

export type ExampleProps = PropsWithChildren & {
  /** Applied to the card. `cache` is additionally mirrored onto the modal's
   *  demo wrap, so a live-content example (a portal) stays live in both. */
  style?: BevyStyle;
  title?: string;
  /** Rich docs content (`components/docs` kit) shown in the example modal. */
  info?: ReactNode;
  /** The live demo as a **component owning its own state**. The card renders
   * one instance; opening the modal mounts a second, fully isolated one.
   * Inline `children` can't do that (they close over the page's state), so
   * children-only examples get no live instance in the modal. */
  demo?: ComponentType;
};

export function Example({ children, style, title, info, demo }: ExampleProps) {
  // Stable per-instance identity for the selection (survives hot reload).
  const key = useRef({}).current;
  const select = useExplanationStore((s) => s.select);

  // A selected card unmounting (in-page conditional rendering) closes the
  // modal; page switches are already covered by setPage.
  useEffect(() => {
    return () => useExplanationStore.getState().deselect(key);
  }, [key]);

  return (
    <Card style={style}>
      {title !== undefined && (
        // The card itself is inert: the docs modal is opened from the corner
        // button only, so clicks anywhere else land on the live demo inside.
        <CardHeader
          title={title}
          titleStyle={{ fontSize: FontSizes.xl }}
          style={{ gap: 35, width: "100%" }}
          action={
            <SecondaryButton
              pinch={{ radius: 0.6 }}
              style={detailsButtonStyle}
              labelStyle={detailsLabelStyle}
              onClick={() =>
                select(key, { title, info, demo, cache: style?.cache })
              }
            >
              Details
            </SecondaryButton>
          }
        />
      )}
      {demo !== undefined && <Demo demo={demo} />}
      {children}
    </Card>
  );
}

function Demo({ demo: D }: { demo: ComponentType }) {
  return <D />;
}

const detailsButtonStyle: BevyStyle = {
  minWidth: 0,
  padding: { horizontal: 10, vertical: 4 },
  borderRadius: 6,
  flexShrink: 0,
};

const detailsLabelStyle: BevyStyle = {
  fontSize: FontSizes.xs,
};
