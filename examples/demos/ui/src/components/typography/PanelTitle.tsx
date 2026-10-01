import { Colors, FontSizes } from "@/theme";
import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren & {
  style?: BevyStyle;
};

/** The title of a page header card or a modal — the largest text on screen
 *  after the brand, in the gallery's display treatment: a warm gradient
 *  recolour with a dark outline, over a soft drop shadow. For titles, not
 *  body text — it promotes the node to a composited layer. */
export function PanelTitle({ children, style }: Props) {
  return (
    <node
      style={{
        filter: {
          name: "shadow",
          params: { color: "black", offsetY: 3, spread: 5 },
        },
      }}
    >
      <text
        style={{
          ...panelTitle,
          ...style,
          filter: [
            {
              name: "gradientMap",
              params: {
                stops: [{ color: "red" }, { color: "yellow" }],
                amount: 0.6,
              },
            },
            {
              name: "outline",
              params: { color: "black", width: 1.5 },
            },
          ],
        }}
      >
        {children}
      </text>
    </node>
  );
}

export const panelTitle: BevyStyle = {
  color: Colors.textColor100,
  fontSize: FontSizes.xl,
  fontWeight: "semibold",
};
