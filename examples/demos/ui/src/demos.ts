import { ComponentType } from "react";
import type { SceneId } from "@/bevy";
import { Home } from "./demos/Home";
import { ReactToBevyDemo } from "./demos/communication/ReactToBevyDemo";
import { BevyToReactDemo } from "./demos/communication/BevyToReactDemo";
import { BidirectionCommunicationDemo } from "./demos/communication/BidirectionCommunicationDemo";
import { AnchoredDemo } from "./demos/AnchoredDemo";
import { InteractionsDemo } from "./demos/InteractionsDemo";
import { CanvasDemo } from "./demos/elements/CanvasDemo";
import { PortalDemo } from "./demos/elements/PortalDemo";
import { SurfaceDemo } from "./demos/elements/surfaceDemo";
import { OverflowDemo } from "./demos/styling/OverflowDemo";
import { EditableTextDemo } from "./demos/elements/EditableTextDemo";
import { NodeDemo } from "./demos/elements/NodeDemo";
import { FlexDemo } from "./demos/layout/FlexDemo";
import { GridDemo } from "./demos/layout/GridDemo";
import { ButtonDemo } from "./demos/elements/ButtonDemo";
import { TextDemo } from "./demos/elements/TextDemo";
import { ImageDemo } from "./demos/elements/ImageDemo";
import { FadeAnimationDemo } from "./demos/animations/FadeAnimationDemo";
import { BouncingBallsAnimationDemo } from "./demos/animations/BouncingBallsAnimationDemo";
import { TransitionDemo } from "./demos/animations/TransitionDemo";
import { EasingDemo } from "./demos/animations/EasingDemo";
import { SpringDemo } from "./demos/animations/SpringDemo";
import { SequenceDemo } from "./demos/animations/SequenceDemo";
import { SpinDemo } from "./demos/animations/SpinDemo";
import { InterpolateDemo } from "./demos/animations/InterpolateDemo";
import { UnitsDemo } from "./demos/styling/UnitsDemo";
import { ColorsDemo } from "./demos/styling/ColorsDemo";
import { BordersDemo } from "./demos/styling/BordersDemo";
import { SpacingDemo } from "./demos/styling/SpacingDemo";
import { SizingDemo } from "./demos/styling/SizingDemo";
import { TransformDemo } from "./demos/styling/TransformDemo";
import { ShadowDemo } from "./demos/styling/ShadowDemo";
import { FilterDemo } from "./demos/styling/FilterDemo";
import { GradientsDemo } from "./demos/styling/GradientsDemo";
import { OpacityDemo } from "./demos/styling/OpacityDemo";
import { ZIndexDemo } from "./demos/styling/ZIndexDemo";
import { FocusPolicyDemo } from "./demos/styling/FocusPolicyDemo";

type BaseDemoItem = { label: string; scene?: SceneId };
export type DemoItem = BaseDemoItem &
  (
    | {
        component: ComponentType;
        children?: undefined;
        expandedByDefault?: undefined;
      }
    | {
        children: DemoItem[];
        component?: undefined;
        expandedByDefault?: boolean;
      }
  );

export const DEMOS: DemoItem[] = [
  { label: "Home", scene: "Surface", component: Home },
  {
    label: "Elements",
    expandedByDefault: true,
    children: [
      { label: "<node>", component: NodeDemo },
      { label: "<button>", component: ButtonDemo },
      { label: "<text>", component: TextDemo },
      { label: "<editableText>", component: EditableTextDemo },
      { label: "<image>", component: ImageDemo },
      { label: "<canvas>", component: CanvasDemo },
      { label: "<portal>", scene: "CrowdedCubes", component: PortalDemo },
      { label: "<surface>", scene: "Surface", component: SurfaceDemo },
      {
        label: "<Anchored.node>",
        scene: "CrowdedCubes",
        component: AnchoredDemo,
      },
    ],
  },
  {
    label: "Layout",
    children: [
      { label: "Flex", component: FlexDemo },
      { label: "Grid", component: GridDemo },
    ],
  },
  {
    label: "Styling",
    children: [
      { label: "Units", component: UnitsDemo },
      { label: "Colors", component: ColorsDemo },
      { label: "Borders", component: BordersDemo },
      { label: "Spacing", component: SpacingDemo },
      { label: "Sizing", component: SizingDemo },
      { label: "Overflow", component: OverflowDemo },
      { label: "Transform", component: TransformDemo },
      { label: "Shadow", component: ShadowDemo },
      { label: "Filter", component: FilterDemo },
      { label: "Gradients", component: GradientsDemo },
      { label: "Opacity", component: OpacityDemo },
      { label: "Z-Index", component: ZIndexDemo },
      { label: "Focus Policy", component: FocusPolicyDemo },
    ],
  },
  {
    label: "Communication",
    children: [
      {
        label: "Bevy -> React",
        scene: "BouncingBall",
        component: BevyToReactDemo,
      },
      { label: "Bevy <- React", scene: "Cubes", component: ReactToBevyDemo },
      {
        label: "Bevy <-> React",
        scene: "BouncingBall",
        component: BidirectionCommunicationDemo,
      },
    ],
  },
  {
    label: "Animations",
    children: [
      { label: "Fade", component: FadeAnimationDemo },
      { label: "Easing", component: EasingDemo },
      { label: "Spring", component: SpringDemo },
      { label: "Sequence", component: SequenceDemo },
      { label: "Spin", component: SpinDemo },
      { label: "Interpolate", component: InterpolateDemo },
      { label: "Bouncing Squares", component: BouncingBallsAnimationDemo },
      { label: "Style Transition", component: TransitionDemo },
    ],
  },
  { label: "Interactions", component: InteractionsDemo },
];

/** Find the first selectable demo (a leaf with a `component`) by its nav label. */
export function findDemoByLabel(
  items: DemoItem[],
  label: string,
): DemoItem | undefined {
  for (const item of items) {
    if (item.label === label && item.component) return item;
    const found = item.children && findDemoByLabel(item.children, label);
    if (found) return found;
  }
  return undefined;
}
