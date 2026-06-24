import { ComponentType, useEffect, useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { bevy } from "./generated";
import type { SceneId } from "./generated";
import { BasicUiDemo } from "./demos/BasicUiDemo";
import { EventsDemo } from "./demos/EventsDemo";
import { PollingDataDemo } from "./demos/PollingDataDemo";
import { AnchoredDemo } from "./demos/AnchoredDemo";
import { InteractionsDemo } from "./demos/InteractionsDemo";
import { CanvasDemo } from "./demos/CanvasDemo";
import { ScrollDemo } from "./demos/ScrollDemo";
import { TransitionDemo } from "./demos/TransitionDemo";
import { EditableTextDemo } from "./demos/EditableTextDemo";
import { NodeDemo } from "./demos/NodeDemo";
import { ButtonDemo } from "./demos/ButtonDemo";
import { TextDemo } from "./demos/TextDemo";
import { ImageDemo } from "./demos/ImageDemo";
import { FadeAnimationDemo } from "./demos/FadeAnimationDemo";
import { BouncingBallsAnimationDemo } from "./demos/BouncingBallsAnimationDemo";

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
    ],
  },
  {
    label: "Styling",
    children: [
      { label: "Scroll", component: ScrollDemo },
      { label: "Transition", component: TransitionDemo },
    ],
  },
  {
    label: "Communication",
    children: [
      { label: "Bevy -> React", scene: "BouncingBall", component: EventsDemo },
      { label: "Bevy <- React", scene: "Cubes", component: BasicUiDemo },
      {
        label: "Bevy <-> React",
        scene: "BouncingBall",
        component: PollingDataDemo,
      },
    ],
  },
  {
    label: "Animations",
    children: [
      { label: "Fade", component: FadeAnimationDemo },
      { label: "Bouncing Squares", component: BouncingBallsAnimationDemo },
    ],
  },
  { scene: "CrowdedCubes", label: "World Anchors", component: AnchoredDemo },
  { label: "Interactions", component: InteractionsDemo },
];

export function App() {
  const [selectedDemo, setSelectedDemo] = useState<DemoItem>(
    DEMOS[0].children![0],
  );

  useEffect(() => {
    bevy.selectScene(selectedDemo.scene ?? null);
  }, [selectedDemo]);

  return (
    <node style={rootStyle}>
      <node style={navStyle}>
        <image src="bevy-logo.png" style={{ width: 100 }} />
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
        backgroundColor: isActive ? "#7aa2f7" : "#2a2a3c",
      }}
      hoverStyle={{ backgroundColor: isActive ? "#7aa2f7" : "#42425e" }}
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
            color: isActive ? "#1e1e2e" : "#cdd6f4",
            fontSize: isChild ? 14 : 16,
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
            {isExpanded ? "▲" : "▼"}
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
  backgroundColor: "#181825",
  zIndex: 100,
  boxShadow: { blurRadius: 15, spreadRadius: 0, color: "#00000088" },
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
  color: "#7aa2f7",
  fontSize: 22,
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
  alignItems: "flexStart",
  justifyContent: "center",
  padding: 24,
};
