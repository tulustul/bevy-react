import {
  ComponentType,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Colors, FontSizes } from "@/theme";
import { useExplanationStore } from "@/explanationStore";

import { SecondaryButton } from "./SecondaryButton";
import { Card, CARD_RADIUS } from "./Card";
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

/** One example: a title bar over a **stage** — the lit floor the live demo
 *  stands on. As wide as its content needs (`DemoRow` centres the cards). */
export function Example({
  children,
  style,
  title,
  info,
  demo: Demo,
}: ExampleProps) {
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
          titleStyle={titleStyle}
          style={headerStyle}
          action={
            <SecondaryButton
              pinch={{ radius: 0.6 }}
              style={detailsButtonStyle}
              labelStyle={detailsLabelStyle}
              onClick={() =>
                select(key, { title, info, demo: Demo, cache: style?.cache })
              }
            >
              Details
            </SecondaryButton>
          }
        />
      )}
      <ExampleStage rounded={title === undefined ? "all" : "bottom"}>
        {Demo !== undefined && <Demo />}
        {children}
      </ExampleStage>
    </Card>
  );
}

type ExampleStageProps = PropsWithChildren & {
  /** Which corners meet the enclosing card's rounded edge. */
  rounded: "all" | "bottom";
  style?: BevyStyle;
};

/** The floor a live demo stands on: a recessed panel lit softly from above.
 *  Lays its content out centred in a column; `style` overrides. */
export function ExampleStage({ rounded, style, children }: ExampleStageProps) {
  const r = CARD_RADIUS - 1;
  const radius =
    rounded === "all" ? r : { top: 0, right: 0, bottom: r, left: r };
  return (
    <node style={{ ...stageStyle, borderRadius: radius, ...style }}>
      {children}
    </node>
  );
}

const headerStyle: BevyStyle = {
  alignItems: "center",
  gap: 16,
  padding: { left: 18, right: 10, vertical: 10 },
  border: { bottom: 1 },
  borderColor: Colors.line,
};

const titleStyle: BevyStyle = {
  fontSize: FontSizes.base,
};

// Lit from above like an exhibit: a soft pool of light falls from the top.
const stageStyle: BevyStyle = {
  flexGrow: 1,
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 14,
  minHeight: 150,
  padding: 24,
  backgroundColor: "#00000055",
  backgroundGradient: {
    type: "radial",
    position: "top",
    stops: [
      { color: "#262e3f88", position: "0%", hint: 0.8 },
      { color: "transparent", position: "100%" },
    ],
  },
};

const detailsButtonStyle: BevyStyle = {
  minWidth: 0,
  padding: { horizontal: 10, vertical: 4 },
  borderRadius: 8,
  flexShrink: 0,
};

const detailsLabelStyle: BevyStyle = {
  fontSize: FontSizes.xs,
  fontWeight: "medium",
  color: Colors.textBody,
};
