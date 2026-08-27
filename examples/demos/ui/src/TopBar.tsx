import { BevyStyle } from "bevy-react/jsx";
import { Colors, Gradients } from "@/theme";
import { CircularButton, MenuIcon } from "@/components";
import { Title } from "./Title";

/** Menu-button diameter; the trailing spacer matches it so the wordmark
 *  centres against the bar itself, not against the space the button leaves. */
const MENU_SIZE = 34;

/**
 * The compact shell's fixed top bar: a menu button (opens the nav drawer)
 * and the library wordmark. Regular mode has no bar — the nav column carries
 * the branding there.
 */
export function TopBar({ onMenu }: { onMenu: () => void }) {
  return (
    <node style={barStyle}>
      <CircularButton size={MENU_SIZE} onClick={onMenu}>
        <MenuIcon size={20} />
      </CircularButton>
      <Title style={{ flexGrow: 1, width: "auto" }} />
      <node style={{ width: MENU_SIZE, flexShrink: 0 }} />
    </node>
  );
}

const barStyle: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
  width: "100%",
  height: 48,
  flexShrink: 0,
  padding: { left: 8, right: 12 },
  backgroundColor: Colors.surface100,
  backgroundGradient: Gradients.navBackdrop,
  boxShadow: { blurRadius: 12, spreadRadius: 0, color: Colors.shadow100 },
  zIndex: 50,
};
