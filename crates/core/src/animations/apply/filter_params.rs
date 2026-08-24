//! Stage 4 of [`apply_animated_nodes`](super::apply_animated_nodes) —
//! per-param filter/backdrop bindings, applied against the resolved chains.
//! While any such binding exists, the transition engine's filter/backdrop
//! channels are parked for this stage — see
//! [`ChannelId`](super::super::props::ChannelId) for the authoritative park
//! semantics (coarse granularity, state retained).

use bevy::prelude::*;

use super::super::protocol::{AnimatableProperty, AnimatedBindings, Binding, ValueKind};
use super::super::{SharedValues, eval_color, eval_scalar};
use super::warn::warn_if;

/// Which resolved chain a stage-4 apply targets. Picks the matched
/// [`AnimatableProperty`] variant, the wire-key shape, and the warn kind;
/// everything else (units, routing, dirt) is identical across the three.
#[derive(Clone, Copy, PartialEq)]
pub(super) enum ChainDomain {
    /// `filter[<i>].<param>` → [`crate::filters::ResolvedFilterChain`].
    Filter,
    /// `backdropFilter[<i>].<param>` →
    /// [`crate::filters::ResolvedBackdropChain`]'s inner chain.
    Backdrop,
    /// `morphFilter.<param>` → [`crate::filters::ResolvedMorphChain`]'s
    /// inner chain (a single entry — the wire key carries no index).
    Morph,
}

impl ChainDomain {
    fn names(self) -> (&'static str, &'static str) {
        match self {
            Self::Filter => ("filter", "filterBinding"),
            Self::Backdrop => ("backdropFilter", "backdropFilterBinding"),
            Self::Morph => ("morphFilter", "morphFilterBinding"),
        }
    }
    /// The binding's wire key (`filter[0].radius` / `morphFilter.softness`).
    fn key(self, index: u8, name: &str) -> String {
        let (prefix, _) = self.names();
        match self {
            Self::Morph => format!("{prefix}.{name}"),
            _ => format!("{prefix}[{index}].{name}"),
        }
    }
}

/// Stage 4's body: validate (when `validate`) and apply every binding of one
/// node's `domain` against the matching resolved chain. See the call site
/// for the unit/routing/dirt contract — identical for all three domains;
/// only the addressed chain, the wire-key shape, and the warn kind differ.
#[allow(clippy::too_many_arguments)]
pub(super) fn apply_filter_params(
    entity: Entity,
    bindings: &AnimatedBindings,
    values: &SharedValues,
    chain: Option<&mut Mut<crate::filters::ResolvedFilterChain>>,
    rnode: Option<&crate::bridge::ReactNode>,
    validate: bool,
    dirt: &mut crate::layer::LayerContentDirt,
    domain: ChainDomain,
) {
    let (prefix, kind) = domain.names();
    // The domain's bound params. A morph is a single wire entry, so its
    // bindings address wire index 0 implicitly.
    fn channel_param(property: &AnimatableProperty, domain: ChainDomain) -> Option<(u8, &String)> {
        match (property, domain) {
            (AnimatableProperty::FilterParam { index, name }, ChainDomain::Filter)
            | (AnimatableProperty::BackdropParam { index, name }, ChainDomain::Backdrop) => {
                Some((*index, name))
            }
            (AnimatableProperty::MorphParam { name }, ChainDomain::Morph) => Some((0, name)),
            _ => None,
        }
    }
    // Attribute validation warnings to the node's devtools inspector.
    let _diag = rnode.map(|r| crate::diag::node_scope(r.0));
    // Lazy on purpose — see `warn::warn_if`; `kind` picks the domain's
    // devtools warn kind.
    let warn = |validate: bool, make: &dyn Fn() -> (String, String)| warn_if(validate, kind, make);

    let Some(chain) = chain else {
        for (property, _) in bindings.iter() {
            if let Some((index, name)) = channel_param(property, domain) {
                warn(validate, &|| {
                    let key = domain.key(index, name);
                    let msg = format!(
                        "binding {key}: the node has no resolved {prefix} chain to drive \
                         (no valid `{prefix}` style) — binding ignored"
                    );
                    (key, msg)
                });
            }
        }
        return;
    };

    // Phase A — read-only (through `Deref`, no change mark): evaluate each
    // binding against the chain layout and collect the components that
    // actually differ.
    let mut writes: Vec<(usize, usize, usize, f32)> = Vec::new();
    {
        let chain: &crate::filters::ResolvedFilterChain = chain;
        for (property, binding) in bindings.iter() {
            let Some((index, name)) = channel_param(property, domain) else {
                continue;
            };
            // The slot metadata from the first matching pass — passes sharing
            // a `wire_index` come from one `pack`, so the layout agrees.
            let slot = chain
                .passes
                .iter()
                .filter(|p| p.wire_index == index)
                .find_map(|p| p.layout.iter().find(|s| s.name == name.as_str()).copied());
            let Some(slot) = slot else {
                if chain.passes.iter().any(|p| p.wire_index == index) {
                    warn(validate, &|| {
                        let key = domain.key(index, name);
                        let msg =
                            format!("{key}: the {prefix} has no param {name:?} — binding ignored");
                        (key, msg)
                    });
                } else {
                    warn(validate, &|| {
                        let key = domain.key(index, name);
                        let msg = format!(
                            "{key}: the resolved {prefix} chain has no entry at index {index} — \
                             binding ignored"
                        );
                        (key, msg)
                    });
                }
                continue;
            };
            // Resolve the bound value per the slot's authoritative kind.
            enum Resolved {
                Scalar(f32),
                Color([f32; 4]),
            }
            let resolved = match slot.kind {
                ValueKind::Color => match eval_color(binding, values) {
                    Some(rgba) => Resolved::Color(rgba),
                    None => {
                        // A scalar binding can never drive a color slot; a
                        // missing shared value is transient and stays silent
                        // (every stage skips it).
                        if !matches!(binding, Binding::InterpolateColor { .. }) {
                            warn(validate, &|| {
                                let key = domain.key(index, name);
                                let msg = format!(
                                    "{key}: param {name:?} is a color — bind an \
                                     interpolateColor, not a scalar value"
                                );
                                (key, msg)
                            });
                        }
                        continue;
                    }
                },
                _ if slot.len != 1 => {
                    // Multi-component non-color slots (direction vectors …)
                    // are not addressable per-param in v1 — a scalar splat
                    // would be wrong for them.
                    warn(validate, &|| {
                        let key = domain.key(index, name);
                        let msg = format!(
                            "{key}: param {name:?} spans {} components — multi-component \
                             params are not animatable per-param",
                            slot.len
                        );
                        (key, msg)
                    });
                    continue;
                }
                kind => match eval_scalar(binding, values) {
                    Some(v) => Resolved::Scalar(match kind {
                        // The param's wire unit: degrees → packed radians.
                        ValueKind::Angle => v.to_radians(),
                        // Logical px → physical, the resolver's own rewrite.
                        ValueKind::Length => v * chain.scale,
                        _ => v,
                    }),
                    None => {
                        if matches!(binding, Binding::InterpolateColor { .. }) {
                            warn(validate, &|| {
                                let key = domain.key(index, name);
                                let msg = format!(
                                    "{key}: param {name:?} is a scalar — an \
                                     interpolateColor binding cannot drive it"
                                );
                                (key, msg)
                            });
                        }
                        continue;
                    }
                },
            };
            // Route to every pass at this wire position, defending bounds
            // like the resolver's physical-px rewrite.
            for (pi, pass) in chain.passes.iter().enumerate() {
                if pass.wire_index != index {
                    continue;
                }
                let Some(slot) = pass.layout.iter().find(|s| s.name == name.as_str()) else {
                    continue;
                };
                let Some(vec) = pass.params.get(slot.vec) else {
                    continue;
                };
                match &resolved {
                    Resolved::Scalar(v) => {
                        // Same bounds defense as `rewrite_length_slots`: a
                        // hand-written filter's bad layout degrades (slot
                        // skipped), never panics.
                        if slot.comp < 4 && vec[slot.comp] != *v {
                            writes.push((pi, slot.vec, slot.comp, *v));
                        }
                    }
                    Resolved::Color(rgba) => {
                        for comp in slot.comp..(slot.comp + slot.len).min(4) {
                            let v = rgba[comp - slot.comp];
                            if vec[comp] != v {
                                writes.push((pi, slot.vec, comp, v));
                            }
                        }
                    }
                }
            }
        }
    }

    // Phase B — one write, one version bump, composite-only dirt.
    if !writes.is_empty() {
        let chain = &mut **chain;
        for (pass, vec, comp, v) in writes {
            chain.passes[pass].params[vec][comp] = v;
        }
        chain.version = chain.version.wrapping_add(1);
        dirt.composite_only.push(entity);
    }
}
