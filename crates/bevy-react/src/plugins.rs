//! [`ReactPlugins`]: the plugin group of every compiled-in bevy-react plugin.

use bevy::app::{App, PluginGroup, PluginGroupBuilder};
use bevy_react_core::ReactUiPlugin;

/// Every bevy-react plugin this build compiled in — bevy-react's
/// `DefaultPlugins`: [`ReactUiPlugin`] (the bridge, loading
/// `ui/dist/app.js` unless `.set(..)` overrides it), then one plugin per
/// enabled element feature (`SvgPlugin`, `AnchorPlugin`, `CanvasPlugin`,
/// `PortalPlugin`, `SurfacePlugin`).
///
/// Add it next to Bevy's `DefaultPlugins` (it does not include them).
/// Configure a member with `.set(..)`, drop one with `.disable::<P>()`:
///
/// ```no_run
/// use bevy::prelude::*;
/// use bevy_react::prelude::*;
///
/// App::new().add_plugins(DefaultPlugins).add_plugins(
///     ReactPlugins
///         .set(ReactUiPlugin::new("ui/dist/app.js").hot_reload(false))
///         .disable::<CanvasPlugin>(),
/// );
/// ```
///
/// Members can be added in any order relative to each other and to the
/// app's own registrations — a custom filter, element, or style registers
/// the same before or after the group.
pub struct ReactPlugins;

impl PluginGroup for ReactPlugins {
    fn build(self) -> PluginGroupBuilder {
        let group = PluginGroupBuilder::start::<Self>().add(ReactUiPlugin::default());
        #[cfg(feature = "svg")]
        let group = group.add(bevy_react_svg::SvgPlugin);
        #[cfg(feature = "anchor")]
        let group = group.add(bevy_react_anchor::AnchorPlugin);
        #[cfg(feature = "canvas")]
        let group = group.add(bevy_react_canvas::CanvasPlugin);
        #[cfg(feature = "portal")]
        let group = group.add(bevy_react_portal::PortalPlugin);
        #[cfg(feature = "surface")]
        let group = group.add(bevy_react_surface::SurfacePlugin);
        group
    }
}

impl ReactPlugins {
    /// Register the bindings (elements, their attributes and events) of
    /// every compiled-in feature plugin — and nothing else: no systems, no
    /// JS runtime. For the TypeScript exporter's bare `App`, which builds
    /// no plugins but must type every element the running app registers:
    ///
    /// ```no_run
    /// # use bevy::prelude::*;
    /// # use bevy_react::prelude::*;
    /// let mut app = App::new();
    /// ReactPlugins::register_bindings(&mut app);
    /// // … the app's own `register_bindings`, then:
    /// app.export_react_typescript("ui/src/bevy.ts").unwrap();
    /// ```
    ///
    /// Mirrors the group's member list (both follow the cargo features); a
    /// member disabled with `.disable::<P>()` is still typed here.
    pub fn register_bindings(app: &mut App) {
        #[cfg(feature = "svg")]
        bevy_react_svg::register_bindings(app);
        #[cfg(feature = "anchor")]
        bevy_react_anchor::register_bindings(app);
        #[cfg(feature = "canvas")]
        bevy_react_canvas::register_bindings(app);
        #[cfg(feature = "portal")]
        bevy_react_portal::register_bindings(app);
        #[cfg(feature = "surface")]
        bevy_react_surface::register_bindings(app);
        // Without any element feature there is nothing to register.
        let _ = app;
    }
}

#[cfg(test)]
mod tests {
    use bevy::app::{App, Plugin, PluginGroup, PluginGroupBuilder};
    use bevy_react_core::ext::{ExtRegistry, KNOWN_FEATURES, feature_hint};

    /// One compiled-in feature: its cargo feature, its bindings
    /// registration, and its plugin's (type name, group membership).
    struct Row {
        feature: &'static str,
        register: fn(&mut App),
        member: fn(&PluginGroupBuilder) -> (&'static str, bool),
    }

    fn member<P: Plugin>(group: &PluginGroupBuilder) -> (&'static str, bool) {
        let name = std::any::type_name::<P>().rsplit("::").next().unwrap();
        (name, group.contains::<P>())
    }

    /// The feature rows this build compiled in.
    #[allow(clippy::vec_init_then_push)] // each push is `cfg`-gated
    fn compiled_features() -> Vec<Row> {
        let mut rows = Vec::new();
        #[cfg(feature = "svg")]
        rows.push(Row {
            feature: "svg",
            register: bevy_react_svg::register_bindings,
            member: member::<bevy_react_svg::SvgPlugin>,
        });
        #[cfg(feature = "anchor")]
        rows.push(Row {
            feature: "anchor",
            register: bevy_react_anchor::register_bindings,
            member: member::<bevy_react_anchor::AnchorPlugin>,
        });
        #[cfg(feature = "canvas")]
        rows.push(Row {
            feature: "canvas",
            register: bevy_react_canvas::register_bindings,
            member: member::<bevy_react_canvas::CanvasPlugin>,
        });
        #[cfg(feature = "portal")]
        rows.push(Row {
            feature: "portal",
            register: bevy_react_portal::register_bindings,
            member: member::<bevy_react_portal::PortalPlugin>,
        });
        #[cfg(feature = "surface")]
        rows.push(Row {
            feature: "surface",
            register: bevy_react_surface::register_bindings,
            member: member::<bevy_react_surface::SurfacePlugin>,
        });
        rows
    }

    /// The element kinds a bindings registration adds to a bare app.
    fn kinds_of(register: fn(&mut App)) -> Vec<&'static str> {
        let mut app = App::new();
        register(&mut app);
        let mut kinds: Vec<_> = ExtRegistry::from_app(&app)
            .elements()
            .map(|e| e.name)
            .collect();
        kinds.sort_unstable();
        kinds
    }

    /// The core's `featureMissing` table names this crate's features
    /// exactly: every kind a compiled feature registers hints at that
    /// feature and at its plugin — a `ReactPlugins` member — and each hint
    /// lists exactly that feature's kinds. The warning can't point at a
    /// renamed feature or plugin.
    #[test]
    fn known_features_match_the_feature_crates() {
        let group = super::ReactPlugins.build();
        assert!(group.contains::<bevy_react_core::ReactUiPlugin>());
        for row in compiled_features() {
            let (plugin, is_member) = (row.member)(&group);
            assert!(is_member, "{plugin} is not a ReactPlugins member");
            let kinds = kinds_of(row.register);
            assert!(!kinds.is_empty(), "`{}` registers no elements", row.feature);
            for kind in &kinds {
                let hint = feature_hint(kind)
                    .unwrap_or_else(|| panic!("<{kind}> has no KNOWN_FEATURES hint"));
                assert_eq!(
                    (hint.feature, hint.plugin),
                    (row.feature, plugin),
                    "<{kind}>"
                );
            }
            let hint = KNOWN_FEATURES
                .iter()
                .find(|h| h.feature == row.feature)
                .unwrap();
            let mut hinted = hint.kinds.to_vec();
            hinted.sort_unstable();
            assert_eq!(hinted, kinds, "KNOWN_FEATURES kinds of `{}`", row.feature);
        }
    }

    /// No stale hint: with every feature compiled in, each hint names one.
    #[cfg(all(
        feature = "svg",
        feature = "anchor",
        feature = "canvas",
        feature = "portal",
        feature = "surface"
    ))]
    #[test]
    fn every_known_feature_is_a_feature() {
        let features: Vec<_> = compiled_features().iter().map(|r| r.feature).collect();
        for hint in KNOWN_FEATURES {
            assert!(
                features.contains(&hint.feature),
                "KNOWN_FEATURES names `{}`, which is no bevy-react feature",
                hint.feature
            );
        }
    }

    /// The exporter registration covers the same kinds as the features.
    #[test]
    fn register_bindings_covers_every_feature() {
        let mut app = App::new();
        super::ReactPlugins::register_bindings(&mut app);
        let all: Vec<_> = ExtRegistry::from_app(&app)
            .elements()
            .map(|e| e.name)
            .collect();
        for row in compiled_features() {
            for kind in kinds_of(row.register) {
                assert!(
                    all.contains(&kind),
                    "<{kind}> ({}) not registered",
                    row.feature
                );
            }
        }
    }
}
