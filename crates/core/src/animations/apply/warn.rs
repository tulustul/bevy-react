//! The shared lazy-warn helper for the apply stages' bind-time validation
//! (stage 4's `filterBinding`/`backdropFilterBinding`, stage 5's
//! `shapeBinding`).

/// Report a validation warning to devtools (`crate::diag`) — lazily on
/// purpose: `make` (which allocates the key + message) runs only when the
/// warning actually fires, so the per-binding per-frame path stays
/// allocation-free in every build.
pub(super) fn warn_if(validate: bool, kind: &'static str, make: &dyn Fn() -> (String, String)) {
    if validate {
        let (key, msg) = make();
        crate::diag::report(kind, &key, &msg);
    }
}
