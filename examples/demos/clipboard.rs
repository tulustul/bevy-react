//! Copy-to-clipboard for the docs UI: the "Copy" button on every code snippet
//! emits `clipboard.copy` and this handler writes the text into the system
//! clipboard via Bevy's own [`Clipboard`] resource (the `system_clipboard`
//! feature is enabled workspace-wide, so `ClipboardPlugin` is already part of
//! `DefaultPlugins`).

use bevy::clipboard::Clipboard;
use bevy::prelude::*;
use bevy_react::{ReactAppExt, react_message};

/// React → Bevy: put `text` on the system clipboard (`bevy.clipboard.copy(...)`).
#[react_message(name = "clipboard.copy")]
pub struct CopyToClipboard {
    pub text: String,
}

/// Register the clipboard handler (shared by the live app and the
/// `--export-bindings` exporter).
pub fn register_bindings(app: &mut App) {
    app.add_react_handler(apply_copy);
}

fn apply_copy(on: On<CopyToClipboard>, mut clipboard: ResMut<Clipboard>) {
    if let Err(err) = clipboard.set_text(on.event().text.clone()) {
        warn!("clipboard.copy failed: {err}");
    }
}
