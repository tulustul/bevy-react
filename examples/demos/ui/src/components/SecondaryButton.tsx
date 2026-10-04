import { BevyStyle } from "bevy-react/jsx";
import { Button, ButtonProps } from "./Button";
import { Colors, Gradients } from "@/theme";

/** The quiet button: a graphite fill with a hairline rim — for everything
 *  that isn't the one primary action. */
export function SecondaryButton(props: ButtonProps) {
  const style: BevyStyle = {
    backgroundGradient: Gradients.surface,
    borderColor: Colors.lineStrong,
    border: 1,
    ...props.style,
  };

  const hoverStyle: BevyStyle = {
    backgroundGradient: Gradients.surfaceHover,
    borderColor: "#474a54",
    ...props.hoverStyle,
  };

  const labelStyle: BevyStyle = {
    ...props.labelStyle,
    color: props.labelStyle?.color ?? Colors.text,
  };

  return (
    <Button
      {...props}
      style={style}
      hoverStyle={hoverStyle}
      labelStyle={labelStyle}
    />
  );
}
