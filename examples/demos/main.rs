//! Example consumer of the `bevy_react` library: one Bevy app whose UI is a React
//! app (see `ui/`), overlaid on a live 3D scene. A left-nav switches between the
//! demos; React drives the active 3D scene with `bevy.selectScene(id)` (or
//! `null` for the ambient backdrop). Each scene is its own plugin:
//!
//!   * Ambient       — the default full-screen shader backdrop (gentle aurora)
//!     behind scene-less demos.
//!   * Space cubes   — glowing cubes orbiting and tumbling in space (the
//!     backdrop-filter demo's scene).
//!   * Cubes         — React `bevy.basicDemo.setCount(n)` → that many spinning cubes.
//!   * Bouncing ball — a ball pushes `bevyEventsDemo.ballBounced` toasts and answers
//!     `bevy.pollingDemo.getBall()` polls (one scene, both bridge directions);
//!     each hit also paints an expanding ripple on the wall.
//!   * Crowded cubes — UI badges anchored to ~100 wandering 3D cubes on a plane.
//!
//! Pure-UI demos (Animations, Events, …) declare no scene and select `null`,
//! landing on Ambient.
//!
//! Run with:
//!
//!   npm install && npm run build -w demos   # build the React bundle
//!   cargo run -p bevy-react --example demos
//!
//! For hot reload, run `npm run watch -w demos` in another terminal and edit
//! the files under `ui/src/`.

mod camera;
mod clipboard;
mod filters;
mod scene;
mod scenes;
// Framebuffer capture (`--shoot`) drives Bevy's `Screenshot` + `save_to_disk`, both
// native-only; the whole module is excluded on web.
#[cfg(not(target_arch = "wasm32"))]
mod screenshot;

use std::path::PathBuf;

use bevy::prelude::*;
use bevy_react::ReactUiPlugin;

use camera::CameraPlugin;
use scene::Scene;
use scenes::ambient::AmbientScenePlugin;
use scenes::bouncing_ball::BouncingBallScenePlugin;
use scenes::crowded_cubes::CrowdedCubesScenePlugin;
use scenes::cubes::CubesScenePlugin;
use scenes::monitor::MonitorScenePlugin;
use scenes::named_pins::NamedPinsScenePlugin;
use scenes::space_cubes::SpaceCubesScenePlugin;

/// Web entry. `wasm-bindgen --target web` wires this as the module's start, so the
/// loader's `await init()` builds and starts the Bevy app — installing
/// `globalThis.__bevyHost` (in `ReactUiPlugin::build`) before the page then loads
/// `vendor.js` + `app.js` (see `examples/demos/ui/index.html`).
#[cfg(target_arch = "wasm32")]
fn main() {
    run();
}

#[cfg(not(target_arch = "wasm32"))]
fn main() {
    use bevy::window::WindowResolution;
    use bevy_react::ReactAppExt;

    // `cargo run -p bevy-react --example demos -- --export-bindings <path>` writes the TypeScript
    // bindings instead of running the app, keeping `ui/src/bevy.ts` in sync
    // with the Rust `#[react_*]` structs. It needs only the handler registrations, so
    // it skips DefaultPlugins/ReactUiPlugin (no window, no JS runtime).
    let mut args = std::env::args().skip(1);
    if args.next().as_deref() == Some("--export-bindings") {
        let path = args
            .next()
            .expect("--export-bindings requires an output path");
        let mut app = App::new();
        register_react_bindings(&mut app);
        app.export_react_typescript(&path)
            .expect("failed to write TypeScript bindings");
        println!("wrote React bindings to {path}");
        return;
    }

    // `--shoot <demo-label> <out.png> [settle-secs] [--size WxH]` navigates the
    // gallery to a demo, lets it settle, captures the Bevy framebuffer to a PNG, and
    // exits (see `screenshot`). A fixed window size + no hot reload keep the shot
    // deterministic; `--size` (default 1280x832) picks the logical resolution — the
    // way to look at the app at phone sizes without a phone.
    let shoot = parse_shoot_args(std::env::args().skip(1));

    let Some(cfg) = shoot else {
        run();
        return;
    };

    let mut window = window();
    window.resolution = WindowResolution::new(cfg.size.0, cfg.size.1);
    let mut app = build_app(window, /* hot_reload */ false);
    screenshot::add_screenshot_mode(&mut app, cfg);
    app.run();
}

/// Parse `--shoot <label> <out.png> [settle-secs] [--size WxH]`; `None` when the
/// first argument isn't `--shoot`. `--size` may sit anywhere after `--shoot`.
/// Anything unrecognized panics rather than being absorbed: a mistyped
/// `--size=…` silently producing a desktop-sized shot would defeat the point.
#[cfg(not(target_arch = "wasm32"))]
fn parse_shoot_args(mut args: impl Iterator<Item = String>) -> Option<screenshot::ShootConfig> {
    if args.next().as_deref() != Some("--shoot") {
        return None;
    }
    let mut positional: Vec<String> = Vec::new();
    let mut size = screenshot::DEFAULT_SIZE;
    while let Some(arg) = args.next() {
        if arg == "--size" {
            let spec = args.next().expect("--size requires a WxH value");
            size = parse_size(&spec)
                .unwrap_or_else(|| panic!("--size expects WxH (e.g. 390x844), got {spec:?}"));
        } else if arg.starts_with("--") {
            panic!("unknown --shoot option {arg:?} (expected `--size WxH`)");
        } else {
            positional.push(arg);
        }
    }
    let mut positional = positional.into_iter();
    let label = positional.next().expect("--shoot requires a <demo-label>");
    let out = positional
        .next()
        .expect("--shoot requires an <out.png> path")
        .into();
    let settle_secs = positional.next().map_or(3.0, |s| {
        s.parse()
            .unwrap_or_else(|_| panic!("--shoot settle-secs must be a number, got {s:?}"))
    });
    if let Some(extra) = positional.next() {
        panic!("unexpected --shoot argument {extra:?}");
    }
    Some(screenshot::ShootConfig {
        label,
        out,
        settle_secs,
        size,
    })
}

/// `"390x844"` → `(390, 844)`; `None` on anything else (zero sizes included).
#[cfg(not(target_arch = "wasm32"))]
fn parse_size(spec: &str) -> Option<(u32, u32)> {
    let (w, h) = spec.split_once(['x', 'X'])?;
    let (w, h) = (w.trim().parse::<u32>().ok()?, h.trim().parse::<u32>().ok()?);
    (w > 0 && h > 0).then_some((w, h))
}

/// Generate a small plaid texture CPU-side and register it as `"checker"` in
/// [`bevy_react::portal::RenderTargets`] — the app-owned **static** texture a
/// `backgroundImage` `{ texture }` source (or a `<portal>`) can display.
/// Painted once at startup; nothing ever renders into it.
fn register_host_textures(
    mut targets: ResMut<bevy_react::portal::RenderTargets>,
    mut images: ResMut<Assets<Image>>,
) {
    use bevy::asset::RenderAssetUsages;
    use bevy::render::render_resource::{Extent3d, TextureDimension, TextureFormat};

    const SIZE: u32 = 64;
    const CELL: u32 = 8;
    // Tokyo-night plaid: two checker tones + an accent grid line per band.
    const DARK: [u8; 4] = [0x24, 0x28, 0x3b, 0xff];
    const LIGHT: [u8; 4] = [0x41, 0x48, 0x68, 0xff];
    const ACCENT: [u8; 4] = [0x7a, 0xa2, 0xf7, 0xff];

    let mut data = Vec::with_capacity((SIZE * SIZE * 4) as usize);
    for y in 0..SIZE {
        for x in 0..SIZE {
            let px = if x.is_multiple_of(CELL * 2) || y.is_multiple_of(CELL * 2) {
                ACCENT
            } else if ((x / CELL) + (y / CELL)).is_multiple_of(2) {
                DARK
            } else {
                LIGHT
            };
            data.extend_from_slice(&px);
        }
    }
    let image = Image::new(
        Extent3d {
            width: SIZE,
            height: SIZE,
            depth_or_array_layers: 1,
        },
        TextureDimension::D2,
        data,
        TextureFormat::Rgba8UnormSrgb,
        RenderAssetUsages::MAIN_WORLD | RenderAssetUsages::RENDER_WORLD,
    );
    let handle = images.add(image);
    targets.register("checker", handle);
}

/// The primary window descriptor, shared by every entry point.
fn window() -> Window {
    Window {
        title: "bevy-react · demos".to_string(),
        ..default()
    }
}

/// Build the demos `App`: DefaultPlugins (+ the React UI layer), the scene state,
/// the shared 3D camera, and every demo scene plugin. Shared by the native run,
/// the `--shoot` path, and the web entry — only the asset source differs by target.
fn build_app(window: Window, hot_reload: bool) -> App {
    // CARGO_MANIFEST_DIR is the `bevy-react` crate (crates/core); the example and its
    // bundle live at the repo root, two levels up. The path is unused on web (the page
    // loads the bundle itself) but `ReactUiPlugin` still takes one.
    let bundle =
        PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../examples/demos/ui/dist/app.js");

    // Our `CameraPlugin` (added below) provides the 3D camera that also renders the
    // UI. NotoSans is the app-wide default font; DancingScript / Noto Sans Mono are
    // named families the UI selects per element via `style={{ fontFamily: … }}`.
    let react_plugin = ReactUiPlugin::new(bundle)
        .hot_reload(hot_reload)
        .default_font("fonts/NotoSans-VariableFont_wdth,wght.ttf")
        .font("DancingScript", "fonts/DancingScript-VariableFont_wght.ttf")
        .font(
            "Noto Sans Mono",
            "fonts/NotoSansMono-VariableFont_wdth,wght.ttf",
        )
        .font("MetalMania", "fonts/MetalMania-Regular.ttf")
        .cursor("hand", "cursor-hand.png", (0, 0));

    // On web, make the canvas track its parent (`<body>`, full-height via index.html)
    // so the view fills and follows the browser window. No-op on native.
    #[cfg(target_arch = "wasm32")]
    let window = Window {
        fit_canvas_to_parent: true,
        ..window
    };

    let window_plugin = WindowPlugin {
        primary_window: Some(window),
        ..default()
    };

    // Native loads the example assets from disk (two levels up from the crate). On
    // web the dev server serves them under `assets/` (Bevy's default), so the default
    // AssetPlugin is kept there.
    #[cfg(not(target_arch = "wasm32"))]
    let default_plugins = DefaultPlugins
        .set(window_plugin)
        .set(bevy::asset::AssetPlugin {
            file_path: "../../examples/assets".into(),
            ..default()
        });
    #[cfg(target_arch = "wasm32")]
    let default_plugins = DefaultPlugins.set(window_plugin);

    let mut app = App::new();
    app.add_plugins(default_plugins)
        .add_plugins(react_plugin)
        // State must be registered after DefaultPlugins (which brings StatesPlugin).
        .init_state::<Scene>()
        // The shared 3D camera (auto-orbit + mouse-drag + wheel-zoom + per-scene reframe).
        .add_plugins(CameraPlugin)
        .add_plugins((
            AmbientScenePlugin,
            CubesScenePlugin,
            BouncingBallScenePlugin,
            CrowdedCubesScenePlugin,
            MonitorScenePlugin,
            SpaceCubesScenePlugin,
            NamedPinsScenePlugin,
        ));
    // The devtools inspector (F12) needs no registration: `ReactUiPlugin`
    // auto-enables it in dev builds. Whether the panel is open persists in
    // `.bevy-react-devtools.json`, so it reopens where you left it.

    // A one-time host-generated texture the Background images demo displays
    // via `src: { texture: "checker" }` (the static-texture path — live
    // rendering belongs to `<portal>`).
    app.add_systems(Startup, register_host_textures);

    // Each scene's plugin registers its own bindings in `build`; only the global
    // scene-selection + debug-navigation + clipboard handlers are left to
    // register here.
    scene::register_bindings(&mut app);
    clipboard::register_bindings(&mut app);
    // Custom filters must register AFTER `ReactUiPlugin` (added above): the
    // plugin's `build` registers the built-in filters and would replace an
    // earlier same-name custom (see `add_react_filter`'s ordering doc).
    filters::register_bindings(&mut app);
    // Screenshot navigation rides a `#[react_event]`; native-only (the module is too).
    #[cfg(not(target_arch = "wasm32"))]
    screenshot::register_bindings(&mut app);
    app
}

/// Build and run the app with the default window and hot reload enabled. The
/// shared normal-run path for both the native CLI and the web entry.
fn run() {
    build_app(window(), /* hot_reload */ true).run();
}

/// Register every React binding across all demos. Used **only** by the
/// `--export-bindings` exporter, which doesn't add the demo plugins (so they
/// can't register their own bindings). The live app registers bindings via each
/// plugin's `build` instead. This must list the exact same set the plugins do,
/// so the generated TypeScript can never drift from the runtime.
#[cfg(not(target_arch = "wasm32"))]
fn register_react_bindings(app: &mut App) {
    scene::register_bindings(app);
    screenshot::register_bindings(app);
    filters::register_bindings(app);
    clipboard::register_bindings(app);
    // `scenes::ambient` and `scenes::named_pins` are intentionally absent: they
    // register no bindings (named_pins reaches React entities via `ReactNodes`).
    scenes::cubes::register_bindings(app);
    scenes::bouncing_ball::register_bindings(app);
    scenes::crowded_cubes::register_bindings(app);
    scenes::monitor::register_bindings(app);
}

#[cfg(all(test, not(target_arch = "wasm32")))]
mod tests {
    use super::*;

    fn args(list: &[&str]) -> impl Iterator<Item = String> {
        list.iter()
            .map(|s| s.to_string())
            .collect::<Vec<_>>()
            .into_iter()
    }

    #[test]
    fn shoot_defaults_to_desktop_size() {
        let cfg = parse_shoot_args(args(&["--shoot", "Layers", "out.png"])).unwrap();
        assert_eq!(cfg.label, "Layers");
        assert_eq!(cfg.out, PathBuf::from("out.png"));
        assert_eq!(cfg.settle_secs, 3.0);
        assert_eq!(cfg.size, screenshot::DEFAULT_SIZE);
    }

    #[test]
    #[should_panic(expected = "unknown --shoot option")]
    fn shoot_rejects_unknown_flags() {
        parse_shoot_args(args(&["--shoot", "Home", "o.png", "--size=390x844"]));
    }

    #[test]
    #[should_panic(expected = "settle-secs must be a number")]
    fn shoot_rejects_bad_settle() {
        parse_shoot_args(args(&["--shoot", "Home", "o.png", "soon"]));
    }

    #[test]
    #[should_panic(expected = "unexpected --shoot argument")]
    fn shoot_rejects_extra_positionals() {
        parse_shoot_args(args(&["--shoot", "Home", "o.png", "2", "extra"]));
    }

    #[test]
    fn shoot_size_flag_anywhere_after_shoot() {
        let cfg = parse_shoot_args(args(&[
            "--shoot", "--size", "390x844", "Home", "o.png", "1.5",
        ]))
        .unwrap();
        assert_eq!(cfg.size, (390, 844));
        assert_eq!(cfg.settle_secs, 1.5);
        let cfg =
            parse_shoot_args(args(&["--shoot", "Home", "o.png", "--size", "844X390"])).unwrap();
        assert_eq!(cfg.size, (844, 390));
        assert_eq!(cfg.settle_secs, 3.0);
    }

    #[test]
    fn not_a_shoot_invocation() {
        assert!(parse_shoot_args(args(&[])).is_none());
        assert!(parse_shoot_args(args(&["--export-bindings", "x.ts"])).is_none());
    }

    #[test]
    fn size_spec_parsing() {
        assert_eq!(parse_size("360x640"), Some((360, 640)));
        assert_eq!(parse_size("0x640"), None);
        assert_eq!(parse_size("360"), None);
        assert_eq!(parse_size("ax640"), None);
    }
}
