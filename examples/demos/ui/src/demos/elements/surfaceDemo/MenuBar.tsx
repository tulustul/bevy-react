import { BevyStyle } from "bevy-react/jsx";
import { TextMono } from "@/components/typography";

import { Colors, FontSizes } from "@/theme";
import { MenuItem, MenuList, Popup, WASH } from "./menu";

export type MenuId = "system" | "view" | "help";

type Props = {
  open: string | null;
  onToggle: (id: MenuId) => void;
  view: "home" | "code";
  crt: boolean;
  onSource: () => void;
  onReboot: () => void;
  onToggleCrt: () => void;
  onAbout: () => void;
};

/** The window's top menu bar with three click-to-open dropdown menus. */
export function MenuBar({
  open,
  onToggle,
  view,
  crt,
  onSource,
  onReboot,
  onToggleCrt,
  onAbout,
}: Props) {
  const menus: { id: MenuId; label: string; items: MenuItem[] }[] = [
    {
      id: "system",
      label: "System",
      items: [
        {
          label: view === "code" ? "Close Source" : "View Source",
          onClick: onSource,
        },
        { separator: true },
        { label: "Reboot", onClick: onReboot },
        { label: "About bevy-react OS", onClick: onAbout },
      ],
    },
    {
      id: "view",
      label: "View",
      items: [
        { label: view === "code" ? "Home" : "Source Code", onClick: onSource },
        { label: "Toggle CRT Effect", checked: crt, onClick: onToggleCrt },
      ],
    },
    {
      id: "help",
      label: "Help",
      items: [{ label: "About bevy-react OS", onClick: onAbout }],
    },
  ];

  return (
    <node style={bar}>
      <node style={menuRow}>
        {menus.map((menu) => (
          <node key={menu.id} style={menuAnchor}>
            {/* An open menu's label keeps its wash under the pointer too. */}
            <button
              style={open === menu.id ? menuLabelActive : menuLabel}
              hoverStyle={open === menu.id ? undefined : menuLabelHover}
              onClick={() => onToggle(menu.id)}
            >
              <text
                style={{
                  ...menuLabelText,
                  color: open === menu.id ? Colors.cyanBright : Colors.textBody,
                }}
              >
                {menu.label}
              </text>
            </button>
            {open === menu.id ? (
              <Popup style={dropdown} from="top">
                <MenuList items={menu.items} />
              </Popup>
            ) : null}
          </node>
        ))}
      </node>

      <TextMono style={title}>surface://monitor</TextMono>
    </node>
  );
}

// A graphite strip over the wallpaper, closed by a hairline.
const bar: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "spaceBetween",
  padding: { top: 20, right: 18, bottom: 6, left: 10 },
  backgroundColor: Colors.raised,
  borderColor: Colors.lineStrong,
  border: { top: 0, right: 0, bottom: 1, left: 0 },
  width: "100%",
};

const menuRow: BevyStyle = { flexDirection: "row", gap: 2 };

// Relative so its dropdown can position itself just below the label.
const menuAnchor: BevyStyle = {
  positionType: "relative",
  flexDirection: "column",
};

const menuLabel: BevyStyle = {
  padding: { horizontal: 14, vertical: 8 },
  borderRadius: 8,
  backgroundColor: Colors.transparent,
  cursor: "pointer",
};

const menuLabelHover: BevyStyle = { backgroundColor: Colors.control };

const menuLabelActive: BevyStyle = {
  ...menuLabel,
  backgroundColor: WASH,
};

const menuLabelText: BevyStyle = {
  fontSize: FontSizes.base,
  fontWeight: "medium",
};

// Floats below the label, on top of the body (the menu bar carries a high zIndex).
const dropdown: BevyStyle = {
  positionType: "absolute",
  top: "100%",
  left: 0,
  margin: { top: 6 },
};

// The surface's Rust-side name: Bevy's ember, like the gallery's eyebrows.
const title: BevyStyle = {
  color: Colors.ember,
  fontSize: FontSizes.sm,
  fontWeight: "medium",
  letterSpacing: 0.6,
};
