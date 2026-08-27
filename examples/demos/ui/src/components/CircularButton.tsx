import { PropsWithChildren } from "react";
import { BevyStyle } from "bevy-react/jsx";
import type { PinchParams } from "@/bevy";
import { SecondaryButton } from "./SecondaryButton";

export type CircularButtonProps = PropsWithChildren<{
  /** Diameter in px; the radius is half of it, so the box is always a circle. */
  size?: number;
  style?: BevyStyle;
  labelStyle?: BevyStyle;
  /** Pinch-on-press overrides, forwarded to `Button` (`{ strength: 0 }` off). */
  pinch?: Partial<PinchParams>;
  onClick?: () => void;
}>;

/**
 * The shell's round icon affordance: the example modal's ×, the nav drawer's
 * close, the compact top bar's menu. A `SecondaryButton` squeezed into a
 * fixed square box (padding off, radius = half the size) so its children —
 * an `<svg>` icon or a glyph — sit centred in a circle.
 *
 * It carries the pinch press like every other button, so the wrapper nodes
 * `Pinchable` adds are part of the layout: give the button a *place* (an
 * absolutely-positioned parent), never `positionType` in its own `style`.
 */
export function CircularButton({
  size = 28,
  style,
  labelStyle,
  pinch,
  onClick,
  children,
}: CircularButtonProps) {
  return (
    <SecondaryButton
      pinch={{ radius: 0.7, ...pinch }}
      style={{
        minWidth: size,
        width: size,
        height: size,
        padding: 0,
        borderRadius: size / 2,
        ...style,
      }}
      labelStyle={labelStyle}
      onClick={onClick}
    >
      {children}
    </SecondaryButton>
  );
}
