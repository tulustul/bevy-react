import { BevyStyle } from "bevy-react/jsx";
import { B, CodeTabs, InlineCode, P } from "@/components/docs";
import { Colors } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { MonitorApp } from "./MonitorApp";

// A demo of the `<surface>` host element: the inverse of `<portal>`. Its subtree is
// rendered into an offscreen texture that the Bevy app drapes over the screen of a 3D
// monitor model (see `scenes/monitor.rs`). Because the screen mesh is tagged
// `SurfacePointer`, the UI on it is a real, clickable in-world app — a tiny "OS" with a
// menu bar, taskbar, code viewer, dialogs, and a reboot power-cycle, all driven by React.

const PAGE: ExplanationData = {
  title: "<surface>",
  startCollapsed: true,
  info: (
    <>
      <P>
        <InlineCode>{"<surface>"}</InlineCode> is the inverse of{" "}
        <InlineCode>{"<portal>"}</InlineCode>: instead of showing a Bevy texture
        in the UI, its subtree renders <B>into</B> an offscreen texture that the
        Bevy app puts on anything — here, the screen of a 3D monitor model. The{" "}
        <InlineCode>name</InlineCode> ties the element to a surface the Rust
        side registered.
      </P>
      <CodeTabs
        tsx={`<surface target="monitor" style={{ width: "100%", height: "100%" }}>
  <MonitorApp />
</surface>`}
        rust={`// Register the texture the React subtree renders into…
surfaces.create(&mut images, "monitor", SurfaceSpec {
    size: SCREEN_PX,
    clear_color: Color::srgb(0.02, 0.02, 0.05),
    ..default()
});

// …and put it on a mesh's material. Tagging the mesh
// SurfacePointer maps 3D clicks back onto the UI.
commands.entity(screen).insert(SurfacePointer::new("monitor"));`}
      />
      <P>
        Because the screen mesh is tagged{" "}
        <InlineCode>SurfacePointer</InlineCode>, the UI on it is a real,
        clickable in-world app: this page's monitor runs a tiny "OS" with a menu
        bar, taskbar, code viewer, dialogs and a reboot power-cycle, all plain
        React. Click the screen in the 3D scene to use it.
      </P>
    </>
  ),
};

export function SurfaceDemo() {
  useDemoPage(PAGE);
  return (
    <surface target="monitor" style={screenRoot}>
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
