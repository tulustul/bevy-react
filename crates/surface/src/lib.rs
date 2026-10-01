//! The `<surface>` element for `bevy_react_core`: the **inverse** of a
//! `<portal>`. Where a portal draws an offscreen Bevy camera *into* the React
//! UI, a surface renders a React UI subtree *out* into an offscreen [`Image`]
//! the app can drape over any 3D mesh/material (a diegetic monitor, a control
//! panel, a curved hologram — with the app's own shader on top).
//!
//! Apps normally get this crate through `bevy-react`'s `surface` cargo feature
//! (on by default): `bevy_react::surface`, with [`SurfacePlugin`] a `ReactPlugins`
//! member; depending on it directly, add [`SurfacePlugin`] beside `ReactUiPlugin`.
//!
//! ## Ownership split
//!
//! The consuming app owns the **surface registry** ([`Surfaces`]): it
//! [`create`](Surfaces::create)s a named surface at a fixed pixel resolution
//! and gets back a [`Handle<Image>`] to use as a material texture. React
//! references the same name with `<surface target={…}>…</surface>`; the core
//! mounts that subtree as a **detached UI root** carrying [`RSurface`], and
//! [`bind_surfaces`] spawns a dedicated 2D UI camera that draws the subtree
//! into the registered image (via `UiTargetCamera`). An unregistered name
//! renders nowhere until the app registers it.
//!
//! ## Render model
//!
//! Each surface is [`RenderMode::Live`] (the UI camera renders every frame —
//! the default, correct for animated/interactive UI — **while a mesh
//! displaying it is visible**: a surface whose every [`SurfacePointer`] mesh
//! is culled from all views costs nothing; a surface with no tagged mesh is
//! assumed visible) or [`RenderMode::Snapshot`] (renders once on
//! register/[`invalidate`](Surfaces::invalidate), then freezes — cheap for
//! static panels). [`drive_surfaces`] toggles `Camera::is_active`.
//!
//! ## Interaction
//!
//! A surface is **clickable in-world**: tag the mesh that displays the texture
//! with [`SurfacePointer`] (the mesh needs UVs). [`drive_surface_pointer`]
//! ray-casts the main camera through the cursor and drives a virtual picking
//! pointer over the offscreen subtree; the core's `VirtualPointers` (where the
//! crate registers it) turns its picking events into the usual
//! `onClick`/`onPointer*` calls and hover/press styling, and its hover into
//! the OS cursor.
//!
//! The named render-target registry a `<portal>` displays (and
//! `backgroundImage: { texture }` reads) is the core's, not this crate's.

use bevy::prelude::*;
use bevy_react_core::ReactAppExt;

mod element;
mod pointer;
mod registry;

pub use element::{RSurface, SURFACE, SURFACE_WRITER, TARGET};
pub use pointer::{
    SurfacePointer, SurfaceVirtualPointer, UvChannel, drive_surface_pointer, init_surface_pointer,
};
pub use registry::{
    RenderMode, SurfaceCamera, SurfaceSpec, Surfaces, add_surface_camera_systems, bind_surfaces,
    drive_surfaces, retire_surface_cameras,
};

/// Registers the `<surface>` element and its machinery: the [`Surfaces`]
/// registry, the in-world virtual pointer, the binding of `<surface>` roots to
/// their offscreen UI cameras, and the camera gates. Requires `ReactUiPlugin`
/// in the same app (added in any order; warned at `finish` when missing).
pub struct SurfacePlugin;

impl Plugin for SurfacePlugin {
    fn build(&self, app: &mut App) {
        register_bindings(app);
        app.init_resource::<Surfaces>()
            .add_systems(Startup, init_surface_pointer)
            // Drive the virtual pointer (cursor → mesh UV → image render
            // target) before `bevy_picking` processes inputs, so the
            // offscreen UI is hit-tested with this frame's cursor.
            .add_systems(
                PreUpdate,
                drive_surface_pointer.before(bevy::picking::PickingSystems::ProcessInput),
            )
            // After the op drain, so a freshly mounted surface binds the same
            // frame.
            .add_systems(Update, bind_surfaces.after(bevy_react_core::ReactApplySet));
        add_surface_camera_systems(app);
    }

    fn finish(&self, app: &mut App) {
        bevy_react_core::ext::warn_without_core::<Self>(app, "surface");
    }
}

/// The element registration alone (no systems) — what the TypeScript
/// exporter and a headless op harness need.
pub fn register_bindings(app: &mut App) {
    app.add_react_element(&SURFACE);
}
