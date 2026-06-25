//! The `<surface>` demo scene: a 3D **monitor model** (`models/monitor.glb`) whose
//! screen is a **live React UI**. The app registers a surface named `"monitor"`,
//! loads the glTF model, and re-skins its `"screen"` mesh so the screen's material
//! shows the React surface texture — while keeping the model's own glossy
//! (metallic-roughness) shading, so a specular sheen overlays the UI. The screen
//! mesh is tagged [`SurfacePointer`], so clicking it in 3D drives the React UI.
//!
//! This is the inverse of the `<portal>` demo: there a 3D camera is shown *inside*
//! the UI; here the UI is shown *inside* the 3D scene, on a real monitor.

use bevy::gltf::GltfAssetLabel;
use bevy::image::Image;
use bevy::pbr::{ExtendedMaterial, MaterialExtension};
use bevy::prelude::*;
use bevy::render::render_resource::AsBindGroup;
use bevy::shader::ShaderRef;
use bevy_react::{
    ReactAppExt, SurfacePointer, SurfaceSpec, Surfaces, UvChannel, react_message,
};

use crate::scene::Scene;

/// The screen material: the skinned [`StandardMaterial`] (React UI on base-color + emissive,
/// model gloss maps on `Uv0`) extended with [`CrtExtension`] so the emissive image gets a CRT
/// scanline + phosphor-mask treatment. See `examples/assets/shaders/crt.wgsl`.
type CrtMaterial = ExtendedMaterial<StandardMaterial, CrtExtension>;

/// `StandardMaterial` extension that runs the CRT fragment shader (`shaders/crt.wgsl`),
/// applying scanlines + an RGB phosphor mask to the emissive channel. The single `vec4`
/// uniform packs the CRT params: `x` = phosphor-mask column pitch (px), `y` = scanline count,
/// `z` = scanline intensity, `w` = phosphor-mask intensity.
#[derive(Asset, AsBindGroup, Reflect, Clone, Default)]
struct CrtExtension {
    // Extension bindings start at slot 100, leaving 0-99 for the base StandardMaterial.
    #[uniform(100)]
    settings: Vec4,
}

impl MaterialExtension for CrtExtension {
    fn fragment_shader() -> ShaderRef {
        "shaders/crt.wgsl".into()
    }
}

/// The mesh UV set the model authors for the screen's UI (`TEXCOORD_1`, a full
/// upright `0..1` mapping). `TEXCOORD_0` keeps the model's original patch UVs for its
/// metallic-roughness / normal / occlusion maps.
const UI_UV: UvChannel = UvChannel::Uv1;

/// The surface name this scene registers. React renders into it with
/// `<surface name="monitor">`.
const MONITOR: &str = "monitor";

/// The glTF node name of the screen mesh inside `monitor.glb` (the body node is
/// `"monitor"`; both share one material, so the screen needs its own clone).
const SCREEN_NODE: &str = "screen";

/// The screen texture resolution, in pixels. The model's screen face is nearly
/// square (slightly landscape), so the UI is sized to match and avoid stretching.
const SCREEN_PX: UVec2 = UVec2::new(760, 700);

/// CRT params when the effect is ON, packed into the [`CrtExtension`] uniform:
/// x = phosphor-mask column pitch (px), y = scanline count, z = scanline intensity,
/// w = phosphor-mask intensity. Disabling the effect zeroes `z` & `w`, which makes the
/// shader leave the emissive channel untouched (see `apply_set_crt` / `crt.wgsl`).
const CRT_ON: Vec4 = Vec4::new(SCREEN_PX.x as f32, 200.0, 0.5, 0.85);

pub struct MonitorScenePlugin;

impl Plugin for MonitorScenePlugin {
    fn build(&self, app: &mut App) {
        register_bindings(app);
        app.add_plugins(MaterialPlugin::<CrtMaterial>::default());
        app.add_systems(OnEnter(Scene::Surface), spawn_monitor)
            // The glTF spawns over a few frames; poll until the screen mesh + its
            // material asset exist, then skin it once.
            .add_systems(Update, skin_monitor_screen.run_if(in_state(Scene::Surface)))
            .add_systems(OnExit(Scene::Surface), teardown_monitor);
    }
}

/// Register this demo's React bindings (shared with the `--export-bindings` path).
pub fn register_bindings(app: &mut App) {
    // React -> Bevy notify: `bevy.surfaceDemo.setCrt(on)` → typed `SetCrt`,
    // handled by `apply_set_crt`.
    app.add_react_handler(apply_set_crt);
}

/// React → Bevy: toggle the CRT screen effect, sent as `bevy.surfaceDemo.setCrt(on)`.
/// A newtype because the payload is a bare JSON boolean; the dotted name nests the
/// method under `bevy.surfaceDemo` in the generated proxy.
#[react_message(name = "surfaceDemo.setCrt")]
struct SetCrt(bool);

/// Turn the CRT scanline + phosphor-mask treatment on or off by rewriting the `z`/`w`
/// intensity params of the skinned screen material's [`CrtExtension`] uniform (zeroed =
/// off; see `crt.wgsl`). The query yields nothing when no monitor screen is skinned, so
/// this is a safe no-op outside `Scene::Surface`.
fn apply_set_crt(
    msg: On<SetCrt>,
    screens: Query<&MeshMaterial3d<CrtMaterial>>,
    mut crt_materials: ResMut<Assets<CrtMaterial>>,
) {
    let on = msg.event().0;
    for handle in &screens {
        if let Some(mut mat) = crt_materials.get_mut(&handle.0) {
            mat.extension.settings.z = if on { CRT_ON.z } else { 0.0 };
            mat.extension.settings.w = if on { CRT_ON.w } else { 0.0 };
        }
    }
}

/// Marks the screen node once its material has been swapped, so [`skin_monitor_screen`]
/// runs exactly once per spawn.
#[derive(Component)]
struct ScreenSkinned;

/// Register the `"monitor"` surface and spawn the glTF monitor model. The screen is
/// skinned later by [`skin_monitor_screen`] once the model finishes loading.
fn spawn_monitor(
    mut commands: Commands,
    asset_server: Res<AssetServer>,
    mut surfaces: ResMut<Surfaces>,
    mut images: ResMut<Assets<Image>>,
) {
    // The React subtree renders into this texture; the skin system points the
    // screen material's base-color + emissive at it. Opaque dark clear so the
    // powered-off areas read as a screen, not a hole.
    surfaces.create(
        &mut images,
        MONITOR,
        SurfaceSpec {
            size: SCREEN_PX,
            clear_color: Color::srgb(0.02, 0.02, 0.05),
            ..default()
        },
    );

    // The monitor model. Its screen mesh faces +X in model space, so rotate it to
    // face +Z (toward the camera) and scale it up. The translation places the
    // **screen's center at the world origin** — the shared camera's orbit pivot and
    // look-at point — so the screen is centered in view and mouse-rotation orbits
    // around it (see `camera.rs`).
    commands.spawn((
        WorldAssetRoot(
            asset_server.load(GltfAssetLabel::Scene(0).from_asset("models/monitor.glb")),
        ),
        Transform::from_xyz(0.45, -1.94, -0.906)
            .with_rotation(Quat::from_rotation_y(-std::f32::consts::FRAC_PI_2))
            .with_scale(Vec3::splat(9.0)),
        DespawnOnExit(Scene::Surface),
    ));
}

/// Once the model's `"screen"` node and its material asset are loaded, clone that
/// material with the React surface texture as its base-color + emissive (so the UI
/// glows like a powered screen), bound to the model's dedicated UI UV set ([`UI_UV`]),
/// while the metallic-roughness / normal / occlusion maps keep sampling the model's
/// original UVs (`Uv0`) — so the glossy sheen overlays the UI without stretching. Tags
/// the screen mesh [`SurfacePointer`] (matching channel, so clicks map correctly) and
/// marks it [`ScreenSkinned`] so it runs once.
///
/// Nothing here mutates the shared mesh — the material is cloned per skin — so the
/// operation is idempotent and survives hot reloads / scene re-entry without flipping.
fn skin_monitor_screen(
    mut commands: Commands,
    surfaces: Res<Surfaces>,
    materials: Res<Assets<StandardMaterial>>,
    mut crt_materials: ResMut<Assets<CrtMaterial>>,
    screen_nodes: Query<(Entity, &Name, Option<&Children>), Without<ScreenSkinned>>,
    mesh_mats: Query<&MeshMaterial3d<StandardMaterial>>,
) {
    let Some(ui) = surfaces.get(MONITOR) else {
        return;
    };
    for (node, name, children) in &screen_nodes {
        if name.as_str() != SCREEN_NODE {
            continue;
        }
        // The material lives on the node itself or, more commonly, on its mesh
        // primitive child. Until that exists the model hasn't finished spawning.
        let primitive = if mesh_mats.contains(node) {
            Some(node)
        } else {
            children.and_then(|c| c.iter().find(|&e| mesh_mats.contains(e)))
        };
        let Some(primitive) = primitive else { continue };
        let Ok(old) = mesh_mats.get(primitive) else {
            continue;
        };
        // The glTF material asset loads a frame or two after the entity; retry until
        // it's available so we clone the real metallic-roughness/normal maps.
        let Some(base) = materials.get(&old.0) else {
            continue;
        };

        let mut skinned = base.clone();
        skinned.base_color_texture = Some(ui.clone());
        skinned.base_color_channel = UI_UV;
        skinned.emissive = LinearRgba::WHITE;
        skinned.emissive_texture = Some(ui.clone());
        skinned.emissive_channel = UI_UV;
        skinned.unlit = false; // lit, so the kept gloss map adds a specular sheen
        // metallic_roughness/normal/occlusion channels stay `Uv0` (the model's maps).

        // Wrap the skinned material so the CRT shader styles the emissive UI image.
        let handle = crt_materials.add(ExtendedMaterial {
            base: skinned,
            extension: CrtExtension { settings: CRT_ON },
        });

        // Replace the glTF's StandardMaterial component with the extended one (different
        // component type, so the original must be removed to avoid double-rendering).
        commands
            .entity(primitive)
            .remove::<MeshMaterial3d<StandardMaterial>>()
            .insert((
                MeshMaterial3d(handle),
                SurfacePointer::new(MONITOR).with_uv_channel(UI_UV),
            ));
        commands.entity(node).insert(ScreenSkinned);
    }
}

/// Drop the surface on scene exit so its UI camera is retired (the model is
/// despawned by `DespawnOnExit`).
fn teardown_monitor(mut surfaces: ResMut<Surfaces>) {
    surfaces.remove(MONITOR);
}
