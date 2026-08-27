import type { PropsWithChildren } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Caption } from "@/components/typography";
import { FontSizes, Responsiveness } from "@/theme";
import { useIsMobile, useWindowSize } from "@/hooks";

/** Every vignette renders at two sizes from one component: looping on the
 * wall, driveable in the panel. */
export type VignetteProps = {
  /** Behaviour: loop on its own (`false`) or take input (`true`). */
  expanded: boolean;
  /** Look: the tile's sizes (`false`) or the panel's (`true`). Lags `expanded`
   * by `GROW_DELAY_MS` so the incoming card first shows exactly what the
   * outgoing one showed. Key every size and `Extra` on this, never on `expanded`. */
  grown: boolean;
};

/** The card's padding, identical at both ends of the flight (it does not ease). */
export const CARD_PADDING = 16;
/** The page card's padding on a phone. */
export const PAGE_PADDING_MOBILE = 12;

/** Vertical rhythm shared by the card and every vignette. The card has no
 * `gap` (an `Extra` must take zero room at rest), so spacing rides the things. */
export const Spacing = {
  /** Under the card's label. */
  label: 14,
  /** Above an extra's contents. */
  extra: 18,
  /** Between a group of controls and its caption. */
  controls: 12,
  /** Between controls in a row. */
  control: 8,
  /** Above the footer (blurb + Back). */
  footer: 22,
  /** Between the blurb and the Back button. */
  footerGap: 14,
} as const;

/** A vignette's root: a centred column. */
export const vignetteStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

/** The controls an `Extra` opens under a vignette. */
export const controlsStyle: BevyStyle = {
  width: "100%",
  flexDirection: "column",
  alignItems: "center",
  gap: Spacing.controls,
  padding: { top: Spacing.extra, bottom: 4, horizontal: 5 },
};

/** The panel's caption: one step up from the gallery `Caption`. */
export function PanelCaption({
  children,
  style,
}: PropsWithChildren<{ style?: BevyStyle }>) {
  return <Caption style={{ ...panelCaption, ...style }}>{children}</Caption>;
}

const panelCaption: BevyStyle = {
  fontSize: FontSizes.base,
  textAlign: "center",
};

/** Width of the card's contents on a phone, `undefined` on desktop. Wrapped
 * text under-measures its height at `width: "100%"` (TODO, Bugs); an explicit
 * px width measures right, so wrapping text on the card takes it from here. */
export function useCardContentWidth(): number | undefined {
  const isMobile = useIsMobile();
  const win = useWindowSize();
  const inset =
    (Responsiveness.contentPaddingMobile + PAGE_PADDING_MOBILE + CARD_PADDING) *
    2;
  return isMobile ? Math.max(0, win.width - inset) : undefined;
}
