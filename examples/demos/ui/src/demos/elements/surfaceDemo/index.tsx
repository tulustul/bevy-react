import { BevyStyle } from "bevy-react/jsx";
import { Colors } from "@/theme";
import { MonitorApp } from "./MonitorApp";

// A demo of the `<surface>` host element: the inverse of `<portal>`. Its subtree is
// rendered into an offscreen texture that the Bevy app drapes over the screen of a 3D
// monitor model (see `scenes/monitor.rs`). Because the screen mesh is tagged
// `SurfacePointer`, the UI on it is a real, clickable in-world app — a tiny "OS" with a
// menu bar, taskbar, code viewer, dialogs, and a reboot power-cycle, all driven by React.

export function SurfaceDemo() {
  return (
    <surface name="monitor" style={screenRoot}>
      <MonitorApp />
    </surface>
  );
}

// Transparent so that when the power wrapper collapses, the surface's own near-black
// clear color (see `monitor.rs`) shows through — a true CRT blackout.
const screenRoot: BevyStyle = {
  width: "100%",
  height: "100%",
  flexDirection: "column",
  backgroundColor: Colors.transparent,
};
