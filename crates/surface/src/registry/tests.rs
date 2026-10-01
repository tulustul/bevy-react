//! The surface registry and its camera gates.

use bevy::camera::visibility::ViewVisibility;

use super::*;
use crate::element::RSurface;
use crate::pointer::SurfacePointer;

fn test_app() -> App {
    let mut app = App::new();
    app.add_plugins((MinimalPlugins, AssetPlugin::default()));
    app.init_asset::<Image>();
    app.init_resource::<Surfaces>();
    app
}

/// `create` registers a surface and `get` returns its handle; `remove` drops it.
#[test]
fn create_get_remove() {
    let mut app = test_app();
    let handle = app
        .world_mut()
        .resource_scope(|world, mut surfaces: Mut<Surfaces>| {
            let mut images = world.resource_mut::<Assets<Image>>();
            surfaces.create(&mut images, "monitor", SurfaceSpec::default())
        });
    assert_eq!(
        app.world().resource::<Surfaces>().get("monitor"),
        Some(handle)
    );
    assert_eq!(app.world().resource::<Surfaces>().get("nope"), None);

    app.world_mut().resource_mut::<Surfaces>().remove("monitor");
    assert_eq!(app.world().resource::<Surfaces>().get("monitor"), None);
}

/// `set_mode`/`invalidate` mark dirty only when they should.
#[test]
fn set_mode_and_invalidate_mark_dirty() {
    let mut app = test_app();
    app.world_mut()
        .resource_scope(|world, mut surfaces: Mut<Surfaces>| {
            let mut images = world.resource_mut::<Assets<Image>>();
            surfaces.create(
                &mut images,
                "monitor",
                SurfaceSpec {
                    mode: RenderMode::Live,
                    ..default()
                },
            );
        });

    let mut surfaces = app.world_mut().resource_mut::<Surfaces>();
    surfaces.entries.get_mut("monitor").unwrap().dirty = false;
    surfaces.set_mode("monitor", RenderMode::Live); // no change
    assert!(!surfaces.entries["monitor"].dirty);
    surfaces.set_mode("monitor", RenderMode::Snapshot); // change → dirty
    assert!(surfaces.entries["monitor"].dirty);
    surfaces.entries.get_mut("monitor").unwrap().dirty = false;
    surfaces.invalidate("monitor");
    assert!(surfaces.entries["monitor"].dirty);
}

/// A live surface camera renders while no mesh is tagged for it, or while any
/// tagged [`SurfacePointer`] mesh is visible in some view; it idles once every
/// tagged mesh is culled.
#[test]
fn live_surface_camera_follows_tagged_mesh_visibility() {
    let mut app = test_app();
    app.add_systems(Update, (bind_surfaces, drive_surfaces).chain());
    app.world_mut()
        .resource_scope(|world, mut surfaces: Mut<Surfaces>| {
            let mut images = world.resource_mut::<Assets<Image>>();
            surfaces.create(&mut images, "monitor", SurfaceSpec::default());
        });
    app.update(); // bind spawns the camera
    let cam = app.world().resource::<Surfaces>().entries["monitor"]
        .camera
        .expect("bind_surfaces spawned the camera");
    let active = |app: &App| app.world().entity(cam).get::<Camera>().unwrap().is_active;
    app.update();
    assert!(active(&app), "no tagged mesh → assumed displayed, renders");

    let screen = app
        .world_mut()
        .spawn((SurfacePointer::new("monitor"), ViewVisibility::HIDDEN))
        .id();
    app.update();
    assert!(!active(&app), "its only display culled → the camera idles");

    app.world_mut()
        .entity_mut(screen)
        .insert(ViewVisibility::VISIBLE);
    app.update();
    assert!(active(&app), "the display back in view → renders again");

    app.world_mut().entity_mut(screen).despawn();
    app.update();
    assert!(active(&app), "no tagged mesh again → renders");
}

/// Regression: a removed surface's camera must be gone **before** bevy's shadow
/// cascade build, never after it. The build keys every light's `Cascades` map
/// by every active camera with a `Projection` (this `Camera2d` included); a key
/// left pointing at a camera despawned later in the frame made bevy 0.19.0's
/// `extract_lights` drop the cascades of every other view (`prepare_lights`
/// panic on the main camera — the demos' `<surface>` → `<portal>` crash). Runs
/// the plugin's real `PostUpdate` ordering against bevy's real cascade builder,
/// scheduled in its real set exactly as `bevy_light`'s `LightPlugin` does (the
/// plugin itself drags in gizmo systems that need a renderer).
#[test]
fn removed_surface_camera_never_outlives_the_cascade_build() {
    use bevy::camera::CameraUpdateSystems;
    use bevy::light::cascade::build_directional_light_cascades;
    use bevy::light::{Cascades, DirectionalLightShadowMap, SimulationLightSystems};

    let mut app = test_app();
    app.init_resource::<DirectionalLightShadowMap>();
    app.add_systems(
        PostUpdate,
        build_directional_light_cascades
            .in_set(SimulationLightSystems::UpdateDirectionalLightCascades)
            .after(CameraUpdateSystems),
    );
    app.add_systems(Update, bind_surfaces);
    add_surface_camera_systems(&mut app);

    let light = app
        .world_mut()
        .spawn(DirectionalLight {
            shadow_maps_enabled: true,
            ..default()
        })
        .id();
    app.world_mut()
        .resource_scope(|world, mut surfaces: Mut<Surfaces>| {
            let mut images = world.resource_mut::<Assets<Image>>();
            surfaces.create(&mut images, "monitor", SurfaceSpec::default());
        });
    app.update(); // bind spawns the camera; the cascade build keys it
    let cam = app.world().resource::<Surfaces>().entries["monitor"]
        .camera
        .expect("bind_surfaces spawned the camera");
    let keys = |app: &App| -> Vec<Entity> {
        app.world()
            .entity(light)
            .get::<Cascades>()
            .expect("DirectionalLight requires Cascades")
            .cascades
            .keys()
            .copied()
            .collect()
    };
    assert!(
        keys(&app).contains(&cam),
        "the harness exercises the real cascade build: the active 2D surface camera is keyed"
    );

    app.world_mut().resource_mut::<Surfaces>().remove("monitor");
    app.update();
    assert!(
        app.world().get_entity(cam).is_err(),
        "the removed surface's camera is despawned within the frame"
    );
    let dead: Vec<Entity> = keys(&app)
        .into_iter()
        .filter(|k| app.world().get_entity(*k).is_err())
        .collect();
    assert!(
        dead.is_empty(),
        "no cascade may be keyed by a despawned camera at the end of the frame \
         (the camera was despawned after the build): {dead:?}"
    );
}

/// `bind_surfaces` spawns a camera for a registered surface and binds the root
/// to it (and shows it); an unregistered root is hidden with no camera.
#[test]
fn bind_surfaces_binds_registered_and_hides_unregistered() {
    let mut app = test_app();
    app.add_systems(Update, bind_surfaces);

    // A root for a surface that isn't registered yet.
    let root = app
        .world_mut()
        .spawn((RSurface("monitor".into()), Visibility::Inherited))
        .id();
    app.update();
    assert!(app.world().entity(root).get::<UiTargetCamera>().is_none());
    assert_eq!(
        app.world().entity(root).get::<Visibility>().copied(),
        Some(Visibility::Hidden),
        "an unregistered surface root is hidden"
    );

    // Register it → next bind spawns a camera and binds + shows the root.
    app.world_mut()
        .resource_scope(|world, mut surfaces: Mut<Surfaces>| {
            let mut images = world.resource_mut::<Assets<Image>>();
            surfaces.create(&mut images, "monitor", SurfaceSpec::default());
        });
    app.update();
    let cam = app
        .world()
        .entity(root)
        .get::<UiTargetCamera>()
        .map(|t| t.0)
        .expect("root binds to its surface camera");
    assert!(
        app.world().entity(cam).get::<SurfaceCamera>().is_some(),
        "the bound camera is a surface camera"
    );
    assert_eq!(
        app.world().entity(root).get::<Visibility>().copied(),
        Some(Visibility::Inherited),
        "a bound surface root is shown"
    );
}
