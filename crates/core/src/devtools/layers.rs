//! The Layers tab: the current layer set (base layer + every promoted layer)
//! streamed to the panel, with resolved filter chains in display units.

use bevy::prelude::*;
use bevy::ui::{ComputedNode, IsDefaultUiCamera};

use crate::bridge::{JsBridge, ReactNode};
use crate::event::ReactEvents;
use crate::protocol::NodeId;
use crate::reconcile::climb;
use crate::window::ui_viewport_size;
use crate::{react_event, react_message};

use super::DevtoolsState;

/// Bevy → JS: the current layer set — the implicit base layer plus every
/// promoted layer in [`crate::layer::LayersRegistry`] — for the panel's
/// Layers tab. Streamed by [`emit_layers`] only while the panel is open on
/// that tab, and diffed against the last payload so an idle app sends
/// nothing. Deliberately excludes the live group alpha: it changes every
/// frame during a fade, which would defeat the diff gate. Filter params are
/// the opposite call — they ARE included live (rounded; see
/// [`filter_entries`]): watching what a filter animation is doing is the
/// point of the chain display, so a running param animation streams while
/// the tab is open.
#[react_event(name = "devtools.layers")]
struct DevtoolsLayers {
    layers: Vec<DevtoolsLayerRow>,
}

/// One layer in a `devtools.layers` payload.
#[derive(serde::Serialize, ts_rs::TS, Debug, Clone, PartialEq)]
pub(super) struct DevtoolsLayerRow {
    /// The layer root's wire node id (`0` for the base layer).
    id: NodeId,
    /// Human-readable promotion reason labels (`["base"]` for the base layer,
    /// today otherwise only `["opacity"]`). Opaque strings JS displays
    /// verbatim — no JS-side table to keep in sync; see [`reason_labels`].
    reasons: Vec<String>,
    /// Nesting depth: 0 = base, 1 = top-level layer, 2 = layer in a layer, …
    depth: u32,
    /// Reconciled nodes ([`ReactNode`]) in the layer's capture subtree; 0 for the
    /// base layer and for inactive layers (membership skips them).
    node_count: u32,
    /// Window-space logical rect; `None` while the layer is inactive
    /// (zero-sized, hidden, or not laid out yet).
    rect: Option<DevtoolsLayerRect>,
    /// Frames that re-captured this layer since promotion (cache misses).
    /// Always `0` for the base layer (it has no capture to cache).
    repaints: u64,
    /// The layer's resolved `filter` chain, one entry per wire filter with
    /// live display-unit param values (see [`filter_entries`]). Empty for the
    /// base layer and for unfiltered layers.
    filters: Vec<DevtoolsFilterEntry>,
    /// The layer's resolved `backdropFilter` chain, same shape and liveness
    /// as [`Self::filters`] — the panel renders it as a second chain line.
    backdrop_filters: Vec<DevtoolsFilterEntry>,
    /// The layer's resolved `morphFilter` (at most one entry — morphs are
    /// single filter uses), same shape and liveness as [`Self::filters`] —
    /// a third chain line, prefixed "morph:" by the panel.
    morph_filters: Vec<DevtoolsFilterEntry>,
}

/// One wire filter in a layer's resolved chain: the wire name plus each
/// param's live display values (`(slot name, values)` — multi-component
/// params carry several). Built by [`filter_entries`].
#[derive(serde::Serialize, ts_rs::TS, Debug, Clone, PartialEq)]
struct DevtoolsFilterEntry {
    name: String,
    params: Vec<(String, Vec<f64>)>,
}

/// A layer rect: logical (CSS) px in window space — the same space as
/// `devtools.window` — plus the physical capture dims so the panel can
/// estimate texture memory (`physical_width * physical_height * 4`).
#[derive(serde::Serialize, ts_rs::TS, Debug, Clone, PartialEq)]
struct DevtoolsLayerRect {
    x: f32,
    y: f32,
    width: f32,
    height: f32,
    physical_width: u32,
    physical_height: u32,
}

/// JS → Bevy: the panel's Layers tab was shown/hidden (mount/unmount of the
/// Layers panel — tab switch, panel close, F12). Gates [`emit_layers`].
#[react_message(name = "devtools.layersOpen")]
pub(super) struct DevtoolsLayersOpenMessage {
    pub(super) on: bool,
}

pub(super) fn on_layers_open_message(
    msg: On<DevtoolsLayersOpenMessage>,
    mut state: ResMut<DevtoolsState>,
) {
    state.layers_tab_open = msg.event().on;
}

/// Human labels for promotion-reason bits. The labels are opaque strings the
/// JS panel displays verbatim (forward-compat by design — no JS-side table to
/// keep in sync); extend this when a new promotion rule lands in
/// [`crate::layer::PromotionReasons`].
fn reason_labels(reasons: crate::layer::PromotionReasons) -> Vec<String> {
    let mut out = Vec::new();
    if reasons.0 & crate::layer::PromotionReasons::OPACITY != 0 {
        out.push("opacity".to_string());
    }
    if reasons.0 & crate::layer::PromotionReasons::FILTER != 0 {
        out.push("filter".to_string());
    }
    if reasons.0 & crate::layer::PromotionReasons::TRANSFORM3D != 0 {
        out.push("transform3d".to_string());
    }
    if reasons.0 & crate::layer::PromotionReasons::BACKDROP != 0 {
        out.push("backdrop".to_string());
    }
    if reasons.0 & crate::layer::PromotionReasons::MORPH != 0 {
        out.push("morph".to_string());
    }
    if reasons.0 & crate::layer::PromotionReasons::FORCED != 0 {
        out.push("cache".to_string());
    }
    out
}

/// Round to 3 decimals for display. Load-bearing twice over: the diff gate in
/// [`emit_layers`] is exact row equality, so this rounding IS the rate
/// limiter — sub-0.001 f32 noise from a running animation never re-emits,
/// while any visible param change does (per frame while the tab is open,
/// which is the intended live view). And it rounds **in f64**, returning f64:
/// rounding in f32 and widening afterwards would resurrect the noise on the
/// JSON wire (`0.4f32 as f64` prints `0.4000000059604645`; the f64-rounded
/// value prints `0.4`).
fn round3(v: f32) -> f64 {
    (f64::from(v) * 1000.0).round() / 1000.0
}

/// Flatten a layer's [`crate::filters::ResolvedFilterChain`] into display
/// entries — one per **wire** filter, not per render pass: a multi-pass
/// filter (blur's H+V) expands into consecutive passes sharing a
/// `wire_index`, and the first pass of each group carries the shared display
/// params (blur's direction components are unnamed in the layout, so they
/// never show). Params are unpacked via the pass layout into the wire's
/// units: angles pack as radians → shown in degrees, `Length` slots are
/// stored **physical** px (the resolver's upload rewrite) → divided by
/// `chain.scale` back to logical px, scalars and color components as-is.
fn filter_entries(
    chain: &crate::filters::ResolvedFilterChain,
    input: Option<&crate::filters::FilterChain>,
) -> Vec<DevtoolsFilterEntry> {
    use crate::animations::ValueKind;
    let scale = if chain.scale > 0.0 { chain.scale } else { 1.0 };
    let mut out: Vec<DevtoolsFilterEntry> = Vec::new();
    let mut last_wire = None;
    for pass in &chain.passes {
        if last_wire == Some(pass.wire_index) {
            continue;
        }
        last_wire = Some(pass.wire_index);
        // wire_index → name via the wire-chain mirror on the same entity
        // (invalid entries skipped by the resolver keep their index gap, so
        // positions line up). Defensive fallback — a mirror momentarily out
        // of step must not panic or mislabel: show the raw index.
        let name = input
            .and_then(|i| i.0.get(pass.wire_index as usize))
            .map(|u| u.name.clone())
            .unwrap_or_else(|| format!("#{}", pass.wire_index));
        let params = pass
            .layout
            .iter()
            .map(|slot| {
                let values = (slot.comp..(slot.comp + slot.len).min(4))
                    .map(|comp| {
                        let raw = pass.params.get(slot.vec).map_or(0.0, |v| v[comp]);
                        round3(match slot.kind {
                            ValueKind::Angle => raw.to_degrees(),
                            ValueKind::Length => raw / scale,
                            ValueKind::Scalar | ValueKind::Color => raw,
                        })
                    })
                    .collect();
                (slot.name.to_string(), values)
            })
            .collect();
        out.push(DevtoolsFilterEntry { name, params });
    }
    out
}

/// Physical-pixel twin of [`ui_viewport_size`]: the default UI camera's
/// physical viewport, falling back to the window's physical resolution.
fn viewport_physical_size(
    cameras: &Query<&Camera, With<IsDefaultUiCamera>>,
    windows: &Query<&Window>,
) -> Option<UVec2> {
    if let Ok(camera) = cameras.single()
        && let Some(size) = camera.physical_viewport_size()
    {
        return Some(size);
    }
    windows.single().ok().map(|window| {
        UVec2::new(
            window.resolution.physical_width(),
            window.resolution.physical_height(),
        )
    })
}

/// Push `devtools.layers` — the base layer plus every
/// [`crate::layer::LayersRegistry`] row — while the panel is open on the
/// Layers tab. Runs in `PostUpdate` after
/// [`crate::layer::sync_layer_geometry`] so the rects are this frame's
/// layout. Diffed against a `Local` snapshot (the
/// [`super::panel::send_window_size`] pattern): idle apps send nothing, and
/// the snapshot resets while the tab is hidden so a re-shown tab always gets
/// a fresh full payload. Rows under the panel's own `<root>` are skipped — a
/// promoted panel node would otherwise repaint the panel with its own
/// payload, whose layout change produces the next payload (the same
/// self-observation loop [`super::stats::emit_batch_stats`] guards against).
#[allow(clippy::too_many_arguments, clippy::type_complexity)]
pub(super) fn emit_layers(
    state: Res<DevtoolsState>,
    registry: Res<crate::layer::LayersRegistry>,
    membership: Res<crate::layer::LayerMembership>,
    bridge: Option<Res<JsBridge>>,
    rnodes: Query<(), With<ReactNode>>,
    child_of: Query<&ChildOf>,
    computed: Query<&ComputedNode>,
    chains: Query<(
        Option<&crate::filters::ResolvedFilterChain>,
        Option<&crate::filters::FilterInput>,
        Option<&crate::filters::ResolvedBackdropChain>,
        Option<&crate::filters::BackdropInput>,
        Option<&crate::filters::ResolvedMorphChain>,
        Option<&crate::filters::MorphInput>,
    )>,
    cameras: Query<&Camera, With<IsDefaultUiCamera>>,
    windows: Query<&Window>,
    events: ReactEvents,
    mut last: Local<Option<Vec<DevtoolsLayerRow>>>,
) {
    if !(state.open && state.layers_tab_open) {
        *last = None;
        return;
    }
    let Some(logical) = ui_viewport_size(&cameras, &windows) else {
        return;
    };
    let physical = viewport_physical_size(&cameras, &windows).unwrap_or(UVec2::new(
        logical.x.round() as u32,
        logical.y.round() as u32,
    ));
    // For registry entities missing `ComputedNode` (never laid out): derive
    // the scale from the viewport instead.
    let fallback_inverse_scale = if physical.x > 0 {
        logical.x / physical.x as f32
    } else {
        1.0
    };
    let panel_entity = state
        .panel_root
        .and_then(|id| bridge.as_ref().and_then(|b| b.nodes.get(&id).copied()));

    let mut rows = Vec::with_capacity(registry.layers.len() + 1);
    rows.push(DevtoolsLayerRow {
        id: 0,
        reasons: vec!["base".to_string()],
        depth: 0,
        node_count: 0,
        rect: Some(DevtoolsLayerRect {
            x: 0.0,
            y: 0.0,
            width: logical.x,
            height: logical.y,
            physical_width: physical.x,
            physical_height: physical.y,
        }),
        repaints: 0,
        filters: Vec::new(),
        backdrop_filters: Vec::new(),
        morph_filters: Vec::new(),
    });
    for meta in registry.layers.values() {
        if let Some(panel) = panel_entity
            && climb(meta.entity, &child_of, |e| e == panel).is_some()
        {
            continue;
        }
        let inverse_scale = computed
            .get(meta.entity)
            .map(|c| c.inverse_scale_factor)
            .unwrap_or(fallback_inverse_scale);
        let node_count = membership
            .node_to_layer
            .iter()
            .filter(|&(node, layer)| *layer == meta.entity && rnodes.contains(*node))
            .count() as u32;
        // The resolved chain + wire mirror live on the layer entity — read
        // them directly rather than mirroring them into `LayerMeta` (which
        // would duplicate live state the filter systems already maintain).
        let (filters, backdrop_filters, morph_filters) = chains
            .get(meta.entity)
            .map(|(chain, input, bchain, binput, mchain, minput)| {
                (
                    chain
                        .map(|c| filter_entries(c, input.map(|i| &i.0)))
                        .unwrap_or_default(),
                    bchain
                        .map(|c| filter_entries(&c.0, binput.map(|i| &i.0)))
                        .unwrap_or_default(),
                    mchain
                        .map(|c| filter_entries(&c.0, minput.map(|i| &i.chain)))
                        .unwrap_or_default(),
                )
            })
            .unwrap_or_default();
        rows.push(DevtoolsLayerRow {
            id: meta.node,
            reasons: reason_labels(meta.reasons),
            depth: meta.depth,
            node_count,
            // The registry rect min is signed (filter outset routinely pushes
            // it negative near the viewport edge); width/height stay positive
            // by construction.
            rect: meta.capture_rect.map(|r| DevtoolsLayerRect {
                x: r.min.x as f32 * inverse_scale,
                y: r.min.y as f32 * inverse_scale,
                width: r.width() as f32 * inverse_scale,
                height: r.height() as f32 * inverse_scale,
                physical_width: r.width().max(0) as u32,
                physical_height: r.height().max(0) as u32,
            }),
            repaints: meta.repaints,
            filters,
            backdrop_filters,
            morph_filters,
        });
    }
    // Deterministic order for the diff AND the panel's back-to-front paint:
    // base first, then by nesting depth, ties by id.
    rows.sort_by_key(|r| (r.depth, r.id));
    if last.as_ref() != Some(&rows) {
        events.send(&DevtoolsLayers {
            layers: rows.clone(),
        });
        *last = Some(rows);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::devtools::DevtoolsConfig;
    use crate::devtools::console::DevtoolsConsoleOpenMessage;
    use crate::devtools::panel::DevtoolsOpenMessage;
    use crate::devtools::test_util::{drain_events, test_app};
    use crate::protocol::outbound::Outbound;
    use tokio::sync::mpsc::UnboundedReceiver;

    /// Every live promotion rule has a [`reason_labels`] entry — extend this
    /// when a new [`crate::layer::PromotionReasons`] bit lands.
    #[test]
    fn reason_labels_cover_all_rules() {
        use crate::layer::PromotionReasons;
        let labels = |bits: u32| reason_labels(PromotionReasons(bits));
        assert_eq!(labels(PromotionReasons::OPACITY), ["opacity"]);
        assert_eq!(labels(PromotionReasons::FILTER), ["filter"]);
        assert_eq!(labels(PromotionReasons::TRANSFORM3D), ["transform3d"]);
        assert_eq!(labels(PromotionReasons::BACKDROP), ["backdrop"]);
        assert_eq!(labels(PromotionReasons::MORPH), ["morph"]);
        assert_eq!(labels(PromotionReasons::FORCED), ["cache"]);
        assert_eq!(
            labels(
                PromotionReasons::OPACITY
                    | PromotionReasons::FILTER
                    | PromotionReasons::TRANSFORM3D
                    | PromotionReasons::BACKDROP
                    | PromotionReasons::MORPH
                    | PromotionReasons::FORCED
            ),
            [
                "opacity",
                "filter",
                "transform3d",
                "backdrop",
                "morph",
                "cache"
            ]
        );
    }

    /// The layer stream is gated on `open && layers_tab_open`, carries the
    /// synthesized base row plus every registry row (logical rect + physical
    /// dims), stays silent while nothing changes, re-emits on geometry
    /// changes, keeps inactive layers listed with a null rect, and resends
    /// the full payload after the tab is re-shown (the `Local` reset).
    #[test]
    fn layers_emit_gated_and_diffed() {
        use crate::layer::{LayerMeta, LayersRegistry, PromotionReasons};
        use bevy::window::WindowResolution;

        let (mut app, mut rx) = test_app(DevtoolsConfig {
            settings_path: None,
            ..default()
        });
        app.world_mut().spawn(Window {
            resolution: WindowResolution::new(800, 600),
            ..Default::default()
        });
        let entity = app.world_mut().spawn(ReactNode(7)).id();
        app.world_mut()
            .resource_mut::<LayersRegistry>()
            .layers
            .insert(
                7,
                LayerMeta {
                    node: 7,
                    entity,
                    reasons: PromotionReasons(PromotionReasons::OPACITY),
                    group_alpha: 0.5,
                    capture_rect: Some(IRect::new(10, 10, 110, 60)),
                    depth: 1,
                    repaints: 0,
                    cached: false,
                    cache_policy: Default::default(),
                },
            );
        let payloads = |rx: &mut UnboundedReceiver<Outbound>| {
            drain_events(rx)
                .into_iter()
                .filter(|(name, _)| name == "devtools.layers")
                .map(|(_, v)| v)
                .collect::<Vec<_>>()
        };

        app.update();
        assert!(
            payloads(&mut rx).is_empty(),
            "closed panel: no layer stream"
        );

        {
            let mut state = app.world_mut().resource_mut::<DevtoolsState>();
            state.open = true;
            state.layers_tab_open = true;
        }
        app.update();
        let sent = payloads(&mut rx);
        assert_eq!(sent.len(), 1, "opening the tab sends one payload");
        let layers = sent[0]["layers"].as_array().expect("a layers array");
        assert_eq!(layers.len(), 2, "base row + one registry row");
        assert_eq!(layers[0]["id"], 0);
        assert_eq!(layers[0]["reasons"], serde_json::json!(["base"]));
        assert_eq!(layers[0]["depth"], 0);
        assert_eq!(layers[0]["rect"]["width"], 800.0);
        assert_eq!(layers[0]["rect"]["physical_height"], 600);
        assert_eq!(layers[1]["id"], 7);
        assert_eq!(layers[1]["reasons"], serde_json::json!(["opacity"]));
        assert_eq!(layers[1]["depth"], 1);
        assert_eq!(layers[1]["node_count"], 0, "empty membership map");
        assert_eq!(layers[1]["rect"]["x"], 10.0);
        assert_eq!(layers[1]["rect"]["y"], 10.0);
        assert_eq!(layers[1]["rect"]["width"], 100.0);
        assert_eq!(layers[1]["rect"]["height"], 50.0);
        assert_eq!(layers[1]["rect"]["physical_width"], 100);
        assert_eq!(
            layers[1]["filters"],
            serde_json::json!([]),
            "no resolved chain on the entity: empty filters"
        );

        app.update();
        assert!(payloads(&mut rx).is_empty(), "idle frames are silent");

        // A geometry change re-emits once — with a NEGATIVE min (filter
        // outset near the viewport edge): the signed registry rect must
        // report it truthfully, not clamp to 0.
        app.world_mut()
            .resource_mut::<LayersRegistry>()
            .layers
            .get_mut(&7)
            .unwrap()
            .capture_rect = Some(IRect::new(-20, -10, 80, 40));
        app.update();
        let sent = payloads(&mut rx);
        assert_eq!(sent.len(), 1, "a rect change re-emits");
        assert_eq!(sent[0]["layers"][1]["rect"]["x"], -20.0);
        assert_eq!(sent[0]["layers"][1]["rect"]["y"], -10.0);
        assert_eq!(sent[0]["layers"][1]["rect"]["width"], 100.0);
        assert_eq!(sent[0]["layers"][1]["rect"]["physical_height"], 50);

        // Inactive: still listed, rect null.
        app.world_mut()
            .resource_mut::<LayersRegistry>()
            .layers
            .get_mut(&7)
            .unwrap()
            .capture_rect = None;
        app.update();
        let sent = payloads(&mut rx);
        assert_eq!(sent.len(), 1);
        assert_eq!(sent[0]["layers"].as_array().unwrap().len(), 2);
        assert!(
            sent[0]["layers"][1]["rect"].is_null(),
            "inactive layers stay listed with a null rect"
        );

        // Hiding the tab silences the stream even while the registry mutates.
        app.world_mut()
            .resource_mut::<DevtoolsState>()
            .layers_tab_open = false;
        app.world_mut()
            .resource_mut::<LayersRegistry>()
            .layers
            .get_mut(&7)
            .unwrap()
            .capture_rect = Some(IRect::new(10, 10, 110, 60));
        app.update();
        assert!(payloads(&mut rx).is_empty(), "hidden tab: silence");

        // Re-showing the tab resends the full payload (Local reset), even
        // though it equals a previously-sent one.
        app.world_mut()
            .resource_mut::<DevtoolsState>()
            .layers_tab_open = true;
        app.update();
        assert_eq!(
            payloads(&mut rx).len(),
            1,
            "a re-shown tab gets a fresh full payload"
        );
    }

    /// A filtered layer's row carries its resolved chain: one entry per WIRE
    /// filter (blur's H+V passes group into one), names joined from the
    /// `FilterInput` mirror by `wire_index` (with the defensive `#<i>`
    /// fallback when the mirror is short), params unpacked per layout slot
    /// into display units — angles in degrees, `Length` slots back to
    /// logical px (they are stored physical; here `scale: 2`), colors as 4
    /// components — and rounded to 3 decimals. The rounding doubles as the
    /// stream's rate limiter: a sub-0.001 display-value wiggle must NOT
    /// re-emit, a visible change must.
    #[test]
    fn layers_emit_resolved_filter_chain() {
        use crate::animations::ValueKind;
        use crate::filters::{
            FilterChain, FilterInput, FilterUse, ParamSlot, ResolvedFilterChain, ResolvedFilterPass,
        };
        use crate::layer::{LayerMeta, LayersRegistry, PromotionReasons};
        use bevy::window::WindowResolution;
        use std::sync::Arc;

        let slot =
            |name: &'static str, kind: ValueKind, vec: usize, comp: usize, len: usize| ParamSlot {
                name,
                kind,
                vec,
                comp,
                len,
            };
        let blur_layout: Arc<[ParamSlot]> =
            Arc::from(vec![slot("radius", ValueKind::Length, 0, 0, 1)]);
        // Physical radius 8.5 at scale 2 → logical 4.25. The direction
        // components (y/z) are unnamed in the layout, so they never display.
        let blur_pass = |dir: (f32, f32)| ResolvedFilterPass {
            shader: Handle::default(),
            params: vec![Vec4::new(8.5, dir.0, dir.1, 0.0)],
            layout: blur_layout.clone(),
            wire_index: 0,
        };
        let hue_pass = ResolvedFilterPass {
            shader: Handle::default(),
            params: vec![
                Vec4::new(std::f32::consts::FRAC_PI_2, 0.0, 0.0, 0.0),
                Vec4::new(1.0, 0.5, 0.0, 1.0),
            ],
            layout: Arc::from(vec![
                slot("angle", ValueKind::Angle, 0, 0, 1),
                slot("tint", ValueKind::Color, 1, 0, 4),
            ]),
            wire_index: 1,
        };
        // 4.24999 pins the rounding: → 4.25 on the wire.
        let sepia_pass = ResolvedFilterPass {
            shader: Handle::default(),
            params: vec![Vec4::new(4.249_99, 0.0, 0.0, 0.0)],
            layout: Arc::from(vec![slot("amount", ValueKind::Scalar, 0, 0, 1)]),
            wire_index: 2,
        };
        // wire_index 3 has NO FilterInput entry → the `#3` fallback. 0.4 also
        // pins the f64 rounding path: 0.4f32 widened naively is
        // 0.4000000059604645 on the JSON wire — it must arrive as 0.4.
        let orphan_pass = ResolvedFilterPass {
            shader: Handle::default(),
            params: vec![Vec4::new(0.4, 0.0, 0.0, 0.0)],
            layout: Arc::from(vec![slot("x", ValueKind::Scalar, 0, 0, 1)]),
            wire_index: 3,
        };
        let wire = |name: &str| FilterUse {
            name: name.to_string(),
            params: serde_json::Map::new(),
        };

        let (mut app, mut rx) = test_app(DevtoolsConfig {
            settings_path: None,
            ..default()
        });
        app.world_mut().spawn(Window {
            resolution: WindowResolution::new(800, 600),
            ..Default::default()
        });
        let entity = app
            .world_mut()
            .spawn((
                ReactNode(7),
                ResolvedFilterChain {
                    passes: vec![
                        blur_pass((1.0, 0.0)),
                        blur_pass((0.0, 1.0)),
                        hue_pass,
                        sepia_pass,
                        orphan_pass,
                    ],
                    outset_px: 26,
                    always_dirty: false,
                    version: 1,
                    scale: 2.0,
                },
                FilterInput(FilterChain(vec![
                    wire("blur"),
                    wire("hueRotate"),
                    wire("sepia"),
                ])),
            ))
            .id();
        app.world_mut()
            .resource_mut::<LayersRegistry>()
            .layers
            .insert(
                7,
                LayerMeta {
                    node: 7,
                    entity,
                    reasons: PromotionReasons(PromotionReasons::FILTER),
                    group_alpha: 1.0,
                    capture_rect: Some(IRect::new(10, 10, 110, 60)),
                    depth: 1,
                    repaints: 0,
                    cached: false,
                    cache_policy: Default::default(),
                },
            );
        {
            let mut state = app.world_mut().resource_mut::<DevtoolsState>();
            state.open = true;
            state.layers_tab_open = true;
        }
        let payloads = |rx: &mut UnboundedReceiver<Outbound>| {
            drain_events(rx)
                .into_iter()
                .filter(|(name, _)| name == "devtools.layers")
                .map(|(_, v)| v)
                .collect::<Vec<_>>()
        };

        app.update();
        let sent = payloads(&mut rx);
        assert_eq!(sent.len(), 1);
        assert_eq!(
            sent[0]["layers"][1]["filters"],
            serde_json::json!([
                { "name": "blur", "params": [["radius", [4.25]]] },
                { "name": "hueRotate",
                  "params": [["angle", [90.0]], ["tint", [1.0, 0.5, 0.0, 1.0]]] },
                { "name": "sepia", "params": [["amount", [4.25]]] },
                { "name": "#3", "params": [["x", [0.4]]] },
            ]),
            "wire-grouped chain with display-unit, rounded params"
        );

        // Sub-rounding noise: physical 8.5008 → logical 4.2504 → rounds to
        // the same 4.25 → the diff gate stays quiet.
        app.world_mut()
            .entity_mut(entity)
            .get_mut::<ResolvedFilterChain>()
            .unwrap()
            .passes[0]
            .params[0]
            .x = 8.5008;
        app.update();
        assert!(
            payloads(&mut rx).is_empty(),
            "sub-0.001 display noise must not re-emit (rounding is the rate limiter)"
        );

        // A visible change re-emits with the live value: physical 9 →
        // logical 4.5 (dyadic on purpose — exact through the f32→JSON path).
        app.world_mut()
            .entity_mut(entity)
            .get_mut::<ResolvedFilterChain>()
            .unwrap()
            .passes[0]
            .params[0]
            .x = 9.0;
        app.update();
        let sent = payloads(&mut rx);
        assert_eq!(sent.len(), 1, "a visible param change re-emits");
        assert_eq!(
            sent[0]["layers"][1]["filters"][0]["params"][0],
            serde_json::json!(["radius", [4.5]]),
            "live value in display units"
        );
    }

    /// The `devtools.layersOpen`/`devtools.consoleOpen` messages flip their
    /// state flags, and every panel-close path clears them (via
    /// `exit_interactions`) so a lost unmount message can't leave a stream
    /// armed.
    #[test]
    fn layers_open_message_flips_state_and_close_clears_it() {
        let (mut app, _rx) = test_app(DevtoolsConfig {
            settings_path: None,
            ..default()
        });
        app.world_mut()
            .trigger(DevtoolsLayersOpenMessage { on: true });
        app.world_mut()
            .trigger(DevtoolsConsoleOpenMessage { on: true });
        {
            let state = app.world().resource::<DevtoolsState>();
            assert!(state.layers_tab_open);
            assert!(state.console_tab_open);
        }
        // Simulate a streamed watermark, then close.
        app.world_mut()
            .resource_mut::<DevtoolsState>()
            .console_last_seq = Some(7);

        app.world_mut().trigger(DevtoolsOpenMessage { open: false });
        let state = app.world().resource::<DevtoolsState>();
        assert!(!state.open);
        assert!(
            !state.layers_tab_open,
            "closing the panel must kill the layer stream"
        );
        assert!(
            !state.console_tab_open,
            "closing the panel must kill the console stream"
        );
        assert_eq!(
            state.console_last_seq, None,
            "the console watermark must reset so a reopen resends the backlog"
        );
    }
}
