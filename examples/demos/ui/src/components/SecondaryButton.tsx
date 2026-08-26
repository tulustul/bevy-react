import { BevyStyle } from "bevy-react/jsx";
import { Button, ButtonProps } from "./Button";
import { Colors, Gradients } from "@/theme";

export function SecondaryButton(props: ButtonProps) {
  const style: BevyStyle = {
    ...props.style,
    backgroundGradient: Gradients.surface,
  };

  const hoverStyle: BevyStyle = {
    ...props.hoverStyle,
    backgroundGradient: Gradients.surfaceHover,
  };

  const labelStyle: BevyStyle = {
    ...props.labelStyle,
    color: Colors.textColor100,
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
