import { useIsMobile } from "@/hooks";
import { Colors } from "@/theme";
import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";
import { Spotlight } from "./Spotlight";

type Props = PropsWithChildren & {
  style?: BevyStyle;
};

/** The card's corner radius — children that paint to its edge (an example's
 *  stage) round their own corners to match: bevy clips to rectangles. */
export const CARD_RADIUS = 16;

/** The gallery's surface: a quiet graphite panel with a hairline border that
 *  catches the cursor light (`Spotlight`). Layout is the caller's: it stacks
 *  its children full-width and pads nothing. */
export function Card({ children, style }: Props) {
  const isMobile = useIsMobile();

  return (
    <node
      style={{
        ...cardStyle,
        ...style,
        ...(isMobile && { width: "100%" }),
      }}
    >
      <Spotlight radius={CARD_RADIUS} outset={1} edge={1} wash={0.15} />
      {children}
    </node>
  );
}

const cardStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "stretch",
  justifyContent: "flexStart",
  minWidth: 150,
  maxWidth: "100%",
  backgroundColor: Colors.card,
  borderRadius: CARD_RADIUS,
  border: 1,
  borderColor: Colors.line,
  boxShadow: { yOffset: 14, blurRadius: 36, color: "#00000080" },
};
