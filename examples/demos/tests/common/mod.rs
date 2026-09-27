//! Shared helpers for the headless tests that drive the real demos bundle.

use bevy_react_core::RawRequest;
use bevy_react_core::protocol::outbound::{Outbound, ResponseResult};
use crossbeam_channel::Receiver;
use tokio::sync::mpsc::UnboundedSender;

/// The viewport the harness reports — the desktop shell (`>= 720` wide).
pub const WINDOW: (u32, u32) = (1280, 832);

/// Answer the demos shell's `window.size` bootstrap request with [`WINDOW`]:
/// the shell renders nothing until it knows the viewport so a harness
/// that dropped the request would never see the nav. Every other request is
/// still dropped, as before. Runs until the JS thread drops its sender.
#[allow(dead_code)] // each test binary links this module; not all call it
pub fn answer_window_size(
    request_rx: Receiver<RawRequest>,
    outbound_tx: UnboundedSender<Outbound>,
) {
    std::thread::spawn(move || {
        for req in request_rx {
            if req.name != "window.size" {
                continue;
            }
            let value = serde_json::json!({ "width": WINDOW.0, "height": WINDOW.1 });
            if outbound_tx
                .send(Outbound::Response {
                    id: req.id,
                    result: ResponseResult::Ok { value },
                })
                .is_err()
            {
                return; // JS thread gone
            }
        }
    });
}

/// The feature registry the demos app runs with: the core's style
/// properties and writers plus `bevy_react_svg` (the gallery renders JSX
/// `<svg>`s). Built on a bare `App`, exactly as the plugins register into
/// the real one.
pub fn ext_registry() -> bevy_react_core::ext::ExtRegistry {
    let mut app = bevy::app::App::new();
    bevy_react_core::style::add_core_styles(&mut app);
    app.add_plugins(bevy_react_svg::SvgPlugin);
    bevy_react_core::ext::ExtRegistry::from_app(&app)
}
