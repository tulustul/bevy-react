// The game-like menu, styled as a bold solid console panel: segmented tab
// strip flanked by LB/RB badges, a big page header, chunky item rows with a
// hard accent bar on focus, and a footer legend of the pad controls. Built
// from raw <node>/<text> only (no shared demo components); theme color and
// font tokens keep it on the app's palette. All interaction flows through
// the dispatch callback — gamepad input arrives there from the demo's edge
// detection, and the mouse handlers here feed the very same actions.

import { BevyStyle } from "bevy-react/jsx";
import { Colors, FontSizes } from "@/theme";
import { MENU_PAGES } from "./menuData";
import type { NavAction, NavState } from "./menuNav";

type Props = {
  nav: NavState;
  /** Key "page:col:row" of the item currently pulsing from activation. */
  pulseKey: string | null;
  dispatch: (action: NavAction) => void;
};

export function GameMenu({ nav, pulseKey, dispatch }: Props) {
  const page = MENU_PAGES[nav.page];
  return (
    <node style={panelStyle}>
      <node style={tabRowStyle}>
        <ShoulderBadge label="LB" />
        {MENU_PAGES.map((p, index) => {
          const active = index === nav.page;
          return (
            <node
              key={p.name}
              style={{
                ...tabStyle,
                backgroundColor: active ? Colors.primary100 : Colors.surface200,
              }}
              onClick={() => dispatch({ kind: "gotoPage", index })}
            >
              <text
                style={{
                  fontSize: FontSizes.sm,
                  fontWeight: "bold",
                  color: active ? Colors.textColor400 : Colors.textColor300,
                }}
              >
                {p.name.toUpperCase()}
              </text>
            </node>
          );
        })}
        <ShoulderBadge label="RB" />
      </node>

      <node style={columnsRowStyle}>
        {page.columns.map((column, col) => (
          <node key={column.title} style={columnStyle}>
            <text style={columnTitleStyle}>
              {`- ${column.title.toUpperCase()} -`}
            </text>
            {column.items.map((label, row) => (
              <MenuItem
                key={label}
                label={label}
                focused={nav.col === col && nav.row === row}
                selected={nav.selected[nav.page] === `${col}:${row}`}
                pulsing={pulseKey === `${nav.page}:${col}:${row}`}
                onFocus={() => dispatch({ kind: "focus", col, row })}
                onActivate={() => dispatch({ kind: "activateAt", col, row })}
              />
            ))}
          </node>
        ))}
      </node>

      <node style={footerStyle}>
        <Legend badge="A" label="SELECT" />
        <Legend badge="LB RB" label="PAGE" />
        <Legend badge="DPAD" label="MOVE" />
      </node>
    </node>
  );
}

function MenuItem({
  label,
  focused,
  selected,
  pulsing,
  onFocus,
  onActivate,
}: {
  label: string;
  focused: boolean;
  selected: boolean;
  pulsing: boolean;
  onFocus: () => void;
  onActivate: () => void;
}) {
  return (
    <node
      style={{
        ...itemStyle,
        backgroundColor: selected
          ? Colors.primary100
          : focused
            ? Colors.surface400
            : Colors.surface200,
        transform: {
          translateX: focused ? 6 : 0,
          scale: pulsing ? 1.06 : 1,
        },
      }}
      onPointerEnter={onFocus}
      onClick={onActivate}
    >
      <node
        style={{
          ...accentBarStyle,
          backgroundColor: focused
            ? selected
              ? Colors.textColor400
              : Colors.primary100
            : Colors.transparent,
        }}
      />
      <text
        style={{
          fontSize: FontSizes.base,
          fontWeight: "bold",
          color: selected ? Colors.textColor400 : Colors.textColor100,
        }}
      >
        {label}
      </text>
      {selected && <node style={selectedMarkStyle} />}
    </node>
  );
}

function ShoulderBadge({ label }: { label: string }) {
  return (
    <node style={shoulderBadgeStyle}>
      <text
        style={{
          fontSize: FontSizes.xs,
          fontWeight: "bold",
          color: Colors.textColor200,
        }}
      >
        {label}
      </text>
    </node>
  );
}

function Legend({ badge, label }: { badge: string; label: string }) {
  return (
    <node style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
      <node style={legendBadgeStyle}>
        <text
          style={{
            fontSize: FontSizes.xxs,
            fontWeight: "bold",
            color: Colors.textColor100,
          }}
        >
          {badge}
        </text>
      </node>
      <text style={{ fontSize: FontSizes.xxs, color: Colors.textColor300 }}>
        {label}
      </text>
    </node>
  );
}

const panelStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
  width: 640,
  padding: { top: 18, bottom: 14, left: 22, right: 22 },
  backgroundColor: Colors.surface100,
  border: 3,
  borderColor: Colors.primary400,
  borderRadius: 6,
};

const tabRowStyle: BevyStyle = {
  flexDirection: "row",
  gap: 6,
  alignItems: "center",
};

const tabStyle: BevyStyle = {
  padding: { horizontal: 16, vertical: 17 },
  borderRadius: 4,
  cursor: "pointer",
  transition: { backgroundColor: { duration: 120 } },
};

const shoulderBadgeStyle: BevyStyle = {
  padding: { horizontal: 8, vertical: 4 },
  border: 2,
  borderColor: Colors.surface600,
  borderRadius: 4,
  margin: { horizontal: 6 },
};

const columnsRowStyle: BevyStyle = {
  flexDirection: "row",
  gap: 22,
  justifyContent: "center",
  margin: { vertical: 6 },
};

const columnStyle: BevyStyle = {
  flexDirection: "column",
  gap: 8,
  width: 180,
};

const columnTitleStyle: BevyStyle = {
  fontSize: FontSizes.xs,
  fontWeight: "bold",
  color: Colors.textColor300,
  textAlign: "center",
};

const itemStyle: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
  padding: { top: 9, bottom: 9, left: 10, right: 12 },
  borderRadius: 3,
  cursor: "pointer",
  transition: {
    transform: { duration: 150, easing: "easeOut" },
    backgroundColor: { duration: 100 },
  },
};

const accentBarStyle: BevyStyle = {
  width: 4,
  height: 18,
  borderRadius: 1,
};

const selectedMarkStyle: BevyStyle = {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: Colors.textColor400,
  margin: { left: "auto" },
};

const footerStyle: BevyStyle = {
  flexDirection: "row",
  gap: 24,
  justifyContent: "center",
  margin: { top: 4 },
  padding: { top: 10 },
  border: { top: 1, bottom: 0, left: 0, right: 0 },
  borderColor: Colors.surface300,
  width: "100%",
};

const legendBadgeStyle: BevyStyle = {
  padding: { horizontal: 7, vertical: 2 },
  border: 1,
  borderColor: Colors.surface600,
  borderRadius: 3,
  backgroundColor: Colors.surface200,
};
