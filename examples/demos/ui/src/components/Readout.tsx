import { BevyStyle } from "bevy-react/jsx";
import { Colors, Fonts, FontSizes } from "@/theme";

type ReadoutProps = {
  /** The small mono label above the value. */
  label: string;
  /** The value — its own `<text>` node, so a count re-renders as one text. */
  value: string | number;
  /** The value's light: cyan for a React-side value, ember for a value Bevy
   *  sent; plain text for a neutral counter (the default). */
  color?: string;
  /** The value's size (default 40). */
  size?: number;
};

/** An instrument readout: a small mono label over a big number in the
 *  display face — the gallery's way to show a live count or value. */
export function Readout({
  label,
  value,
  color = Colors.text,
  size = 40,
}: ReadoutProps) {
  return (
    <node style={readoutStyle}>
      <text style={labelStyle}>{label}</text>
      <text style={{ ...valueStyle, color, fontSize: size }}>{value}</text>
    </node>
  );
}

const readoutStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 2,
};

const labelStyle: BevyStyle = {
  fontFamily: Fonts.mono,
  fontSize: FontSizes.xxs,
  fontWeight: "medium",
  letterSpacing: 1.2,
  color: Colors.textDim,
};

const valueStyle: BevyStyle = {
  fontFamily: Fonts.display,
  fontWeight: "semibold",
};
