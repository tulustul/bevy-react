import { BevyStyle } from "bevy-react/jsx";
import { Colors, FontSizes, Gradients } from "@/theme";
import { IconButton, MenuIcon } from "@/components";
import { TOP_BAR_HEIGHT } from "./layoutMode";

/**
 * The compact shell's fixed top bar: a menu button (opens the nav drawer)
 * and the current page's nav label. Regular mode has no bar — the nav
 * column carries the branding there.
 */
export function TopBar({
  title,
  onMenu,
}: {
  title: string;
  onMenu: () => void;
}) {
  return (
    <node style={barStyle}>
      <IconButton onClick={onMenu}>
        <MenuIcon />
      </IconButton>
      <text style={titleStyle}>{title}</text>
    </node>
  );
}

const barStyle: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
  width: "100%",
  height: TOP_BAR_HEIGHT,
  flexShrink: 0,
  padding: { left: 8, right: 12 },
  backgroundColor: Colors.surface100,
  backgroundGradient: Gradients.navBackdrop,
  boxShadow: { blurRadius: 12, spreadRadius: 0, color: Colors.shadow100 },
  zIndex: 50,
};

const titleStyle: BevyStyle = {
  fontSize: FontSizes.xl,
  fontWeight: "semibold",
  color: Colors.textColor100,
};
