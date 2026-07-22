//! Bevy → React FPS reporting for the layers stress test.

use std::time::Duration;

use bevy::diagnostic::{DiagnosticsStore, FrameTimeDiagnosticsPlugin};
use bevy::prelude::*;
use bevy::time::common_conditions::on_timer;
use bevy_react::{ReactAppExt, ReactEvents, react_event};

pub struct FpsPlugin;

impl Plugin for FpsPlugin {
    fn build(&self, app: &mut App) {
        register_bindings(app);
        app.add_plugins(FrameTimeDiagnosticsPlugin::default())
            .add_systems(
                Update,
                push_fps.run_if(on_timer(Duration::from_millis(250))),
            );
    }
}

/// Register this module's React bindings (shared with `--export-bindings`).
pub fn register_bindings(app: &mut App) {
    app.add_react_event::<FpsSample>();
}

/// Bevy → React: the smoothed FPS reading, ~4x/sec.
#[react_event(name = "layersStress.fps")]
struct FpsSample {
    fps: f64,
}

fn push_fps(diagnostics: Res<DiagnosticsStore>, events: ReactEvents) {
    if let Some(fps) = diagnostics
        .get(&FrameTimeDiagnosticsPlugin::FPS)
        .and_then(|d| d.smoothed())
    {
        events.send(&FpsSample { fps });
    }
}
