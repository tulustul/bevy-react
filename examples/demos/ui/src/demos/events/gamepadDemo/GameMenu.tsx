// The game-like menu: a plate on the example's stage with a segmented tab
// strip flanked by LB/RB badges, item rows that take a cyan accent bar under
// focus and the selection's cyan wash, and a footer legend of the pad
// controls. Built from raw <node>/<text> only (no shared demo components);
// the theme's tokens keep it on the gallery's look. All interaction flows
// through the dispatch callback — gamepad input arrives there from the demo's
// edge detection, and the mouse handlers here feed the very same actions.

import { BevyStyle } from "bevy-react/jsx";
import { Colors, Fonts, FontSizes } from "@/theme";
import { MENU_PAGES } from "./menuData";
import type { NavAction, NavState } from "./menuNav";

type Props = {
  nav: NavState;
  /** Key "page:col:row" of the item currently pulsing from activation. */
  pulseKey: string | null;
  dispatch: (action: NavAction) => void;
};

/** The active tab's and the selected item's wash: cyan pre-mixed over the
 *  well (the shared `Radio`'s selected pill). */

export function GameMenu({ nav, pulseKey, dispatch }: Props) {
  const page = MENU_PAGES[nav.page];
  return (
    <node style={panelStyle}>
      <node style={tabRowStyle}>
        <ShoulderBadge label="LB" />
        <node style={tabGroupStyle}>
          {MENU_PAGES.map((p, index) => {
            const active = index === nav.page;
            return (
              <node
                key={p.name}
                style={{
                  ...tabStyle,
                  backgroundColor: active
                    ? Colors.cyanWash
                    : Colors.transparent,
                }}
                hoverStyle={{
                  backgroundColor: active
                    ? Colors.cyanWash
                    : Colors.controlHover,
                }}
                onClick={() => dispatch({ kind: "gotoPage", index })}
              >
                <text
                  style={{
                    ...tabLabelStyle,
                    color: active ? Colors.cyanBright : Colors.textDim,
                  }}
                >
                  {p.name.toUpperCase()}
                </text>
              </node>
            );
          })}
        </node>
        <ShoulderBadge label="RB" />
      </node>

      <node style={columnsRowStyle}>
        {page.columns.map((column, col) => (
          <node key={column.title} style={columnStyle}>
            <text style={columnTitleStyle}>{column.title.toUpperCase()}</text>
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
          ? Colors.cyanWash
          : focused
            ? Colors.well
            : Colors.raised,
        borderColor: focused ? Colors.lineStrong : Colors.line,
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
          backgroundColor: focused ? Colors.cyan : Colors.transparent,
          boxShadow: {
            blurRadius: 8,
            color: focused ? Colors.cyanGlow : Colors.transparent,
          },
        }}
      />
      <text
        style={{
          ...itemLabelStyle,
          color: selected
            ? Colors.cyanBright
            : focused
              ? Colors.text
              : Colors.textBody,
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
      <text style={shoulderLabelStyle}>{label}</text>
    </node>
  );
}

function Legend({ badge, label }: { badge: string; label: string }) {
  return (
    <node style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
      <node style={legendBadgeStyle}>
        <text style={legendBadgeLabelStyle}>{badge}</text>
      </node>
      <text style={legendLabelStyle}>{label}</text>
    </node>
  );
}

// The plate: the example stage's container look (`Stage`).
const panelStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
  width: 640,
  padding: { top: 18, bottom: 14, left: 22, right: 22 },
  backgroundColor: Colors.card,
  border: 1,
  borderColor: Colors.line,
  borderRadius: 12,
};

const tabRowStyle: BevyStyle = {
  flexDirection: "row",
  gap: 6,
  alignItems: "center",
};

// A segmented control: the tabs share one recessed well.
const tabGroupStyle: BevyStyle = {
  flexDirection: "row",
  gap: 2,
  padding: 3,
  borderRadius: 10,
  border: 1,
  borderColor: Colors.line,
  backgroundColor: Colors.well,
};

const tabStyle: BevyStyle = {
  padding: { horizontal: 16, vertical: 8 },
  borderRadius: 7,
  cursor: "pointer",
  transition: { backgroundColor: { duration: 120 } },
};

const tabLabelStyle: BevyStyle = {
  fontSize: FontSizes.sm,
  fontWeight: "semibold",
  letterSpacing: 1,
};

// A chip: raised, with a hairline rim.
const shoulderBadgeStyle: BevyStyle = {
  padding: { horizontal: 8, vertical: 4 },
  border: 1,
  borderColor: Colors.lineStrong,
  borderRadius: 6,
  backgroundColor: Colors.raised,
  margin: { horizontal: 6 },
};

const shoulderLabelStyle: BevyStyle = {
  fontFamily: Fonts.mono,
  fontSize: FontSizes.xs,
  fontWeight: "semibold",
  color: Colors.textBody,
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
  fontFamily: Fonts.mono,
  fontSize: FontSizes.xxs,
  fontWeight: "medium",
  letterSpacing: 1.2,
  color: Colors.textDim,
  textAlign: "center",
};

const itemStyle: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
  padding: { top: 9, bottom: 9, left: 10, right: 12 },
  borderRadius: 8,
  border: 1,
  cursor: "pointer",
  transition: {
    transform: { duration: 150, easing: "easeOut" },
    backgroundColor: { duration: 100 },
  },
};

const itemLabelStyle: BevyStyle = {
  fontSize: FontSizes.base,
  fontWeight: "medium",
};

const accentBarStyle: BevyStyle = {
  width: 3,
  height: 18,
  borderRadius: 2,
};

const selectedMarkStyle: BevyStyle = {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: Colors.cyan,
  boxShadow: { blurRadius: 8, color: Colors.cyanGlow },
  margin: { left: "auto" },
};

const footerStyle: BevyStyle = {
  flexDirection: "row",
  gap: 24,
  justifyContent: "center",
  margin: { top: 4 },
  padding: { top: 10 },
  border: { top: 1, bottom: 0, left: 0, right: 0 },
  borderColor: Colors.line,
  width: "100%",
};

const legendBadgeStyle: BevyStyle = {
  padding: { horizontal: 7, vertical: 2 },
  border: 1,
  borderColor: Colors.line,
  borderRadius: 6,
  backgroundColor: Colors.raised,
};

const legendBadgeLabelStyle: BevyStyle = {
  fontFamily: Fonts.mono,
  fontSize: FontSizes.xxs,
  fontWeight: "semibold",
  color: Colors.textBody,
};

const legendLabelStyle: BevyStyle = {
  fontSize: FontSizes.xxs,
  letterSpacing: 0.6,
  color: Colors.textDim,
};
