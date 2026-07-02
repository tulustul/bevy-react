import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Colors, FontSizes, Gradients } from "@/theme";
import { DEMOS, type DemoItem } from "./demos";
import { useNavStore } from "./store";

export function Navigation() {
  const { selectedDemo, setSelectedDemo } = useNavStore();

  return (
    <node style={navStyle}>
      <image src="bevy-react-logo.png" style={{ width: 150 }} />
      <text style={titleStyle}>bevy-react</text>
      <node style={itemsStyle} scrollStep={40}>
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
  transition: { scroll: { duration: 200, easing: "easeOut" } },
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
  cursor: "pointer",
};
