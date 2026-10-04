import { BevyStyle } from "bevy-react/jsx";
import { Colors, Gradients } from "@/theme";
import { CircularButton, MenuIcon } from "@/components";
import { Title } from "./Title";

/** Menu-button diameter; the trailing spacer matches it so the lockup
 *  centres against the bar itself, not against the space the button leaves. */
const MENU_SIZE = 34;

/** The bar's height — what a page has to take off the window to know the
 * content area it is left with. */
export const TOP_BAR_HEIGHT = 52;

/**
 * The compact shell's fixed top bar: a menu button (opens the nav drawer)
 * and the library lockup. Regular mode has no bar — the nav column carries
 * the branding there.
 */
export function TopBar({ onMenu }: { onMenu: () => void }) {
  return (
    <node style={barStyle}>
      <CircularButton size={MENU_SIZE} onClick={onMenu}>
        <MenuIcon size={18} />
      </CircularButton>
      <node style={brandStyle}>
        <image src="bevy-react-logo.png" style={logoStyle} />
        <Title />
      </node>
      <node style={{ width: MENU_SIZE, flexShrink: 0 }} />
    </node>
  );
}

const brandStyle: BevyStyle = {
  flexGrow: 1,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
};

// The composite logo pair is 450×250.
const logoStyle: BevyStyle = {
  width: 43,
  height: 24,
};

const barStyle: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
  width: "100%",
  height: TOP_BAR_HEIGHT,
  flexShrink: 0,
  padding: { left: 10, right: 12 },
  backgroundColor: "#0c0d11",
  backgroundGradient: Gradients.navBackdrop,
  border: { bottom: 1 },
  borderColor: Colors.line,
  boxShadow: { blurRadius: 20, color: "#00000099" },
  zIndex: 50,
};
