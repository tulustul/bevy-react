// The code samples shown in the monitor "OS" source viewer.

export const TSX = `<surface name="monitor">
  <MonitorApp />
</surface>`;

export const RUST = `// register the surface → Handle<Image>
let screen = surfaces.create(
    &mut images, "monitor", spec,
);
// drape it on the glTF screen mesh and
// make it clickable in 3D
material.base_color_texture = Some(screen);
commands.entity(screen_mesh)
    .insert(SurfacePointer("monitor".into()));`;
