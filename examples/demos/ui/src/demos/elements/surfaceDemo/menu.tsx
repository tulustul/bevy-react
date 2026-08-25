import { ReactNode, useEffect, useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Colors, FontSizes } from "@/theme";

/** Wraps a floating menu so it fades + slides in on open. Mounts in the closed
 *  state, then flips to open on the next frame so the transition interpolates;
 *  the transition is only attached once open, to avoid an initial flash. */
export function Popup({
  style,
  from = "top",
  children,
}: {
  style?: BevyStyle;
  /** Which edge it grows from — dropdowns "top", the Start menu "bottom". */
  from?: "top" | "bottom";
  children: ReactNode;
}) {
  const [shown, setShown] = useState(false);
  useEffect(() => setShown(true), []);
  const dy = from === "top" ? -8 : 8;
  return (
    <node
      style={{
        ...style,
        opacity: shown ? 1 : 0,
        transform: { scale: shown ? 1 : 0.96, translateY: shown ? 0 : dy },
        transition: shown
          ? {
              opacity: { duration: 120 },
              transform: { duration: 130, easing: "easeOut" },
            }
          : undefined,
      }}
    >
      {children}
    </node>
  );
}

// A single dropdown menu item. `separator` draws a divider line instead of a row;
// `checked` shows a ✓ to the left (for toggles like the CRT effect).
export type MenuItem =
  | { separator: true }
  | {
      separator?: false;
      label: string;
      checked?: boolean;
      onClick: () => void;
    };

/** A floating list of menu items — used by both the top menu bar and the Start menu. */
export function MenuList({ items }: { items: MenuItem[] }) {
  const [firstRender, setFirstRender] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setFirstRender(false);
    }, 100);
  });

  return (
    <node style={{ ...list, transform: { scaleY: firstRender ? 0 : 1 } }}>
      {items.map((item, i) => {
        if ("separator" in item && item.separator) {
          return <node key={`sep-${i}`} style={separator} />;
        }
        return (
          <button
            key={item.label}
            style={row}
            hoverStyle={rowHover}
            onClick={item.onClick}
          >
            <text style={label}>{item.label}</text>
          </button>
        );
      })}
    </node>
  );
}

const list: BevyStyle = {
  flexDirection: "column",
  minWidth: 200,
  padding: { top: 6, bottom: 6, left: 6, right: 6 },
  backgroundColor: Colors.surface300,
  borderColor: Colors.surface500,
  border: 2,
  borderRadius: 10,
  gap: 2,
  transition: { transform: { duration: 100 } },
};

const row: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
  padding: { top: 8, bottom: 8, left: 10, right: 18 },
  borderRadius: 7,
  backgroundColor: Colors.transparent,
};

const rowHover: BevyStyle = { backgroundColor: Colors.primary300 };

const label: BevyStyle = {
  color: Colors.textColor100,
  fontSize: FontSizes.base,
};

const separator: BevyStyle = {
  height: 2,
  margin: { top: 4, bottom: 4, left: 6, right: 6 },
  backgroundColor: Colors.surface500,
};
