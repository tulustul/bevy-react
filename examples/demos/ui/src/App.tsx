import { ComponentType, useEffect, useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { bevy } from "@/bevy";
import type { SceneId } from "@/bevy";
import { Colors, FontSizes, Gradients } from "@/theme";
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
import { GradientsDemo } from "./demos/styling/GradientsDemo";
import { OpacityDemo } from "./demos/styling/OpacityDemo";
import { ZIndexDemo } from "./demos/styling/ZIndexDemo";

type BaseDemoItem = { label: string; scene?: SceneId };
type DemoItem = BaseDemoItem &
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

const DEMOS: DemoItem[] = [
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
      { label: "Gradients", component: GradientsDemo },
      { label: "Opacity", component: OpacityDemo },
      { label: "Z-Index", component: ZIndexDemo },
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
function findDemoByLabel(
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

export function App() {
  const [selectedDemo, setSelectedDemo] = useState<DemoItem>(DEMOS[0]);

  useEffect(() => {
    bevy.selectScene(selectedDemo.scene ?? null);
  }, [selectedDemo]);

  // Debug/automation hook: let the Bevy side (the `--shoot` screenshot tool) drive
  // navigation by demo label. Selecting the already-selected demo is a no-op.
  useEffect(() => {
    return bevy.on("debug.selectDemo", ({ label }) => {
      const demo = findDemoByLabel(DEMOS, label);
      if (demo) setSelectedDemo(demo);
    });
  }, []);

  return (
    <node style={rootStyle}>
      <node style={navStyle}>
        <image src="bevy-react-logo.png" style={{ width: 150 }} />
        <text style={titleStyle}>bevy-react</text>
        <node style={itemsStyle}>
          {DEMOS.map((demo, index) => (
            <Item
              key={index}
              item={demo}
              selectedItem={selectedDemo}
              onSelected={setSelectedDemo}
            />
          ))}
        </node>
      </node>

      <node style={contentStyle}>
        {selectedDemo.component && <selectedDemo.component />}
      </node>
    </node>
  );
}

type ItemProps = {
  item: DemoItem;
  selectedItem: DemoItem;
  isChild?: boolean;
  onSelected: (item: DemoItem) => void;
};

function Item({ item, selectedItem, isChild, onSelected }: ItemProps) {
  const [expanded, setExpanded] = useState(item.expandedByDefault ?? false);

  function onPress() {
    if (item.children?.length) {
      setExpanded(!expanded);
    } else if (item.component) {
      onSelected(item);
    }
  }

  function onChildSelected(item: DemoItem) {
    if (expanded) {
      onSelected(item);
    }
  }

  return (
    <node style={{ flexDirection: "column" }}>
      <ItemButton
        isActive={item.label === selectedItem.label}
        isExpanded={expanded}
        label={item.label}
        onPress={onPress}
        isChild={isChild ?? false}
        hasChildren={!!item.children?.length}
      />

      {item.children?.length ? (
        <node
          style={{
            flexDirection: "column",
            gap: 8,
            margin: { left: 15 },
            overflowY: "clip",
            maxHeight: expanded ? item.children.length * NAV_ITEM_PX : 0,
            transition: {
              size: { duration: 300, easing: "easeOut" },
            },
          }}
        >
          <node />
          {item.children.map((child, index) => (
            <Item
              key={index}
              item={child}
              isChild={true}
              onSelected={onChildSelected}
              selectedItem={selectedItem}
            />
          ))}
        </node>
      ) : null}
    </node>
  );
}

// Estimated height of one (leaf) submenu row — child button plus the column gap.
// A slight overshoot is fine (hidden by `overflowY: clip`); undershoot would clip
// the last row, so round up.
const NAV_ITEM_PX = 42;

type ItemButtonProps = {
  label: string;
  isActive: boolean;
  isExpanded: boolean;
  isChild: boolean;
  hasChildren: boolean;
  onPress: () => void;
};
function ItemButton({
  isActive,
  isExpanded,
  isChild,
  hasChildren,
  label,
  onPress,
}: ItemButtonProps) {
  return (
    <button
      onClick={onPress}
      style={{
        ...navButtonStyle,
        padding: isChild ? 6 : 12,
        backgroundColor: isActive ? Colors.primary100 : Colors.surface300,
        backgroundGradient: isActive ? Gradients.primary : Gradients.surface,
      }}
      hoverStyle={{
        backgroundGradient: isActive
          ? Gradients.primary
          : Gradients.surfaceHover,
      }}
    >
      <node
        style={{
          justifyContent: "spaceBetween",
          alignItems: "center",
          width: "100%",
        }}
      >
        <text
          style={{
            color: isActive ? Colors.textColor400 : Colors.textColor100,
            fontSize: isChild ? FontSizes.sm : FontSizes.base,
            fontWeight: "bold",
          }}
        >
          {label}
        </text>
        {hasChildren && (
          <text
            style={{
              fontFamily: "Noto Sans Mono",
            }}
          >
            {isExpanded ? "-" : "+"}
          </text>
        )}
      </node>
    </button>
  );
}

const rootStyle: BevyStyle = {
  width: "100%",
  height: "100%",
  flexDirection: "row",
};

const navStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  width: 220,
  height: "100%",
  gap: 8,
  padding: 20,
  backgroundColor: Colors.surface100,
  backgroundGradient: Gradients.navBackdrop,
  zIndex: 100,
  boxShadow: { blurRadius: 15, spreadRadius: 0, color: Colors.shadow100 },
};

const itemsStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "stretch",
  width: "100%",
  height: "100%",
  gap: 8,
  overflowY: "scroll",
};

const titleStyle: BevyStyle = {
  color: Colors.primary100,
  fontSize: FontSizes.xl,
  fontWeight: "bold",
  margin: { top: 0, right: 0, bottom: 12, left: 0 },
};

const navButtonStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "start",
  gap: 2,
  padding: 12,
  borderRadius: 8,
  width: "100%",
};

const contentStyle: BevyStyle = {
  flexGrow: 1,
  height: "100%",
  flexDirection: "column",
  alignItems: "center",
  gap: 20,
  padding: 24,
  overflowY: "scroll",
};
