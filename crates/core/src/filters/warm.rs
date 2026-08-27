//! The startup half of `ReactUiPlugin::precompile_filters`: turn the plugin's
//! per-partition selections into the list of shader handles the render world
//! compiles pipelines for ahead of first use (`crate::layer::render::warm`).
//!
//! Runs in `Startup`, once: every `add_react_filter`/`add_react_morph_filter`
//! happens in some plugin's `build`, all of which precede `Startup`, so the
//! registry is complete here. Loading the handles is also what kicks the
//! custom `.wgsl` asset loads at startup; the pipeline cache waits for them
//! (and for the prelude they import) on its own.

use bevy::prelude::*;
use bevy::shader::Shader;

use super::registry::{FilterPartition, FilterRegistry};
use crate::plugin::{FilterSelection, PrecompileFilters, ReactUiConfig};

/// The shader handles the render world precompiles (see
/// [`ReactUiPlugin::precompile_filters`](crate::ReactUiPlugin::precompile_filters)).
/// `version` bumps whenever the list is rebuilt, so the render side can
/// re-warm every format it has seen.
#[derive(Resource, Default, Clone, Debug)]
pub struct WarmShaderList {
    pub handles: Vec<Handle<Shader>>,
    pub version: u32,
}

/// Diag kind for a `Names` entry that is unknown or in the wrong partition.
pub(crate) const KIND_PRECOMPILE: &str = "precompileFilters";

/// Resolve the plugin's `PrecompileFilters` against the registry into
/// [`WarmShaderList`]. A rejected name — unknown, or asked for under the
/// wrong field — warns once (`precompileFilters`) and is skipped; a typo in a
/// cosmetic knob never takes the app down.
pub(crate) fn build_warm_shader_list(
    config: Res<ReactUiConfig>,
    registry: Res<FilterRegistry>,
    assets: Res<AssetServer>,
    mut list: ResMut<WarmShaderList>,
) {
    let handles = warm_list(&config.precompile_filters, &registry, &assets);
    list.handles = handles;
    list.version = list.version.wrapping_add(1);
}

/// The list for `config` (the testable body of [`build_warm_shader_list`]).
pub(crate) fn warm_list(
    config: &PrecompileFilters,
    registry: &FilterRegistry,
    assets: &AssetServer,
) -> Vec<Handle<Shader>> {
    let fields = [
        (
            "builtins",
            FilterPartition::Builtins,
            "built-in filter or morph",
            &config.builtins,
        ),
        (
            "filters",
            FilterPartition::Filters,
            "custom filter",
            &config.filters,
        ),
        (
            "morphs",
            FilterPartition::Morphs,
            "custom morph",
            &config.morphs,
        ),
    ];
    let mut handles: Vec<Handle<Shader>> = Vec::new();
    for (field, partition, what, selection) in fields {
        let names: Option<&[String]> = match selection {
            FilterSelection::All => None,
            FilterSelection::Names(names) => Some(names.as_slice()),
            FilterSelection::Off => continue,
        };
        let (found, rejected) = registry.warm_shaders(partition, names, assets);
        for h in found {
            if !handles.contains(&h) {
                handles.push(h);
            }
        }
        for name in rejected {
            crate::diag::report(
                KIND_PRECOMPILE,
                &name,
                &format!(
                    "precompile_filters.{field}: {name:?} is not a registered {what} — not precompiled"
                ),
            );
        }
    }
    handles
}

#[cfg(test)]
mod tests {
    use super::super::test_util::asset_app;
    use super::*;
    use crate::filters::{BloomParams, ReactFilter, register_builtin_filters};

    fn names(list: &[&str]) -> FilterSelection {
        FilterSelection::Names(list.iter().map(|s| s.to_string()).collect())
    }

    /// The default (`All` × 3) warms every registered shader once; `Off`
    /// everywhere warms nothing.
    #[test]
    fn default_warms_everything_and_off_warms_nothing() {
        let mut app = asset_app();
        register_builtin_filters(&mut app);
        let world = app.world();
        let (registry, assets) = (
            world.resource::<FilterRegistry>(),
            world.resource::<AssetServer>(),
        );
        let all = warm_list(&PrecompileFilters::default(), registry, assets);
        assert_eq!(all.len(), 11, "{all:?}");
        let mut ids: Vec<_> = all.iter().map(|h| h.id()).collect();
        ids.dedup();
        assert_eq!(ids.len(), 11, "deduped");
        let off = PrecompileFilters {
            builtins: FilterSelection::Off,
            filters: FilterSelection::Off,
            morphs: FilterSelection::Off,
        };
        assert!(warm_list(&off, registry, assets).is_empty());
    }

    /// `Names` narrows to the listed entries; a name that is unknown, or
    /// belongs to another partition, is skipped and warns once with the
    /// `precompileFilters` kind (no node — a startup warn).
    #[cfg(all(feature = "devtools", debug_assertions))]
    #[test]
    fn names_narrow_and_rejects_warn() {
        let _lock = crate::diag::test_lock();
        crate::diag::arm_runtime();
        let _ = crate::diag::take_runtime_warnings();

        let mut app = asset_app();
        register_builtin_filters(&mut app);
        let world = app.world();
        let (registry, assets) = (
            world.resource::<FilterRegistry>(),
            world.resource::<AssetServer>(),
        );
        let config = PrecompileFilters {
            builtins: names(&["bloom", "nope"]),
            // Bloom is a built-in: asking for it here is the wrong field.
            filters: names(&["bloom"]),
            morphs: FilterSelection::Off,
        };
        let list = warm_list(&config, registry, assets);
        assert_eq!(list.len(), 2, "bloom's two pass shaders: {list:?}");
        assert!(list.contains(&BloomParams::shader(assets)));

        let mut warns: Vec<_> = crate::diag::take_runtime_warnings()
            .into_iter()
            .filter(|w| w.kind == KIND_PRECOMPILE)
            .map(|w| (w.value, w.node, w.message))
            .collect();
        warns.sort();
        assert_eq!(warns.len(), 2, "{warns:?}");
        assert_eq!(warns[0].0, "bloom");
        assert!(
            warns[0].2.contains("precompile_filters.filters"),
            "{}",
            warns[0].2
        );
        assert_eq!(warns[1].0, "nope");
        assert!(
            warns[1].2.contains("precompile_filters.builtins"),
            "{}",
            warns[1].2
        );
        assert!(
            warns.iter().all(|w| w.1.is_none()),
            "startup warns carry no node"
        );
    }
}
