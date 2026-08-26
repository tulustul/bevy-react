//! Shared helpers for the headless tests that drive the real demos bundle.

use bevy_react::RawRequest;
use bevy_react::protocol::outbound::{Outbound, ResponseResult};
use crossbeam_channel::Receiver;
use tokio::sync::mpsc::UnboundedSender;

/// The viewport the harness reports — the desktop shell (`>= 720` wide).
pub const WINDOW: (u32, u32) = (1280, 832);

/// Answer the demos shell's `window.size` bootstrap request with [`WINDOW`]:
/// the shell renders nothing until it knows the viewport (its responsive mode
/// derives from it — see `ui/src/App.tsx` + `layoutMode.tsx`), so a harness
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
