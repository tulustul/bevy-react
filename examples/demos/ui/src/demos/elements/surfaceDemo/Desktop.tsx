import { useEffect, useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Colors, FontSizes } from "@/theme";
import { MenuBar, MenuId } from "./MenuBar";
import { Taskbar } from "./Taskbar";
import { Home } from "./Home";
import { CodeViewer } from "./CodeViewer";
import { AboutDialog } from "./AboutDialog";

type Props = {
  crt: boolean;
  setCrt: (v: boolean) => void;
  onReboot: () => void;
};

type OpenMenu = MenuId | "start" | null;

/** The running desktop shell: menu bar, window body, status bar, taskbar, dialogs. */
export function Desktop({ crt, setCrt, onReboot }: Props) {
  const [view, setView] = useState<"home" | "code">("home");
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [aboutOpen, setAboutOpen] = useState(false);

  const toggle = (id: OpenMenu) =>
    setOpenMenu((cur) => (cur === id ? null : id));
  const close = () => setOpenMenu(null);

  const showSource = () => {
    setView((v) => (v === "code" ? "home" : "code"));
    close();
  };
  const reboot = () => {
    onReboot();
    close();
  };
  const toggleCrt = () => {
    setCrt(!crt);
    close();
  };
  const about = () => {
    setAboutOpen(true);
    close();
  };

  return (
    <node style={desktop}>
      <node style={menuLayer}>
        <MenuBar
          open={openMenu}
          onToggle={toggle}
          view={view}
          crt={crt}
          onSource={showSource}
          onReboot={reboot}
          onToggleCrt={toggleCrt}
          onAbout={about}
        />
      </node>

      <node style={bodyWrap}>
        {view === "code" ? <CodeViewer /> : <Home crt={crt} setCrt={setCrt} />}
      </node>

      <node style={statusBar}>
        <text style={statusText}>
          {view === "code" ? "Viewing source" : "Ready"}
        </text>
        <text style={statusText}>{crt ? "CRT: on" : "CRT: off"}</text>
      </node>

      <node style={taskLayer}>
        <Taskbar
          startOpen={openMenu === "start"}
          view={view}
          onStart={() => toggle("start")}
          onSource={showSource}
          onReboot={reboot}
          onAbout={about}
        />
      </node>

      {openMenu !== null ? <button style={backdrop} onClick={close} /> : null}

      {aboutOpen ? <AboutDialog onClose={() => setAboutOpen(false)} /> : null}
    </node>
  );
}

const desktop: BevyStyle = {
  positionType: "relative",
  width: "100%",
  height: "100%",
  flexDirection: "column",
};

// Above the body + backdrop so dropdowns float over everything.
const menuLayer: BevyStyle = { zIndex: 100 };
const taskLayer: BevyStyle = { zIndex: 100 };

const bodyWrap: BevyStyle = {
  flexGrow: 1,
  flexDirection: "column",
  zIndex: 0,
};

const statusBar: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "spaceBetween",
  padding: { top: 6, bottom: 6, left: 16, right: 16 },
  backgroundColor: Colors.surface100,
  borderColor: Colors.surface400,
  border: { top: 2, right: 0, bottom: 0, left: 0 },
};

const statusText: BevyStyle = {
  color: Colors.textColor300,
  fontSize: FontSizes.xs,
  fontFamily: "Noto Sans Mono",
};

// Click-catcher that closes any open menu; sits above the body, below the menus.
const backdrop: BevyStyle = {
  positionType: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: Colors.transparent,
  zIndex: 50,
};
