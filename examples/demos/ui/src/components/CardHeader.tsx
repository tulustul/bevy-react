import { BevyStyle } from "bevy-react/jsx";
import { ReactNode } from "react";
import { PanelTitle } from "./typography";

type Props = {
  title: string;
  /** Overrides on the title — in practice just its size, which is the one
   *  thing that differs between a page header, a card and the modal. */
  titleStyle?: BevyStyle;
  /** The corner control: a "Details" button, a docs toggle, a close ×. */
  action?: ReactNode;
  style?: BevyStyle;
};

/** A card's top row: the title, and a control pushed to the far corner. */
export function CardHeader({ title, titleStyle, action, style }: Props) {
  return (
    <node style={{ ...cardHeader, ...style }}>
      <PanelTitle style={titleStyle}>{title}</PanelTitle>
      {action}
    </node>
  );
}

export const cardHeader: BevyStyle = {
  flexDirection: "row",
  alignItems: "flexStart",
  justifyContent: "spaceBetween",
};
