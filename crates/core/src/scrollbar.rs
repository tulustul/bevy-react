//! Visible, styleable, draggable scrollbars for `overflow: scroll` nodes.
//!
//! bevy-react drives scrolling from the wheel (`crate::scroll`) but `bevy_ui`
//! renders no visible bar. This module adds one, declared per node via the
//! `scrollbar` style field (`"none" | "default" | {…}`, decoded into
//! [`ScrollbarSpec`]).
//!
//! The mechanics — thumb sizing/positioning, dragging, and track-click paging —
//! are Bevy's own headless widget (`bevy::ui_widgets::{Scrollbar, ScrollbarThumb}`,
//! whose `ScrollbarPlugin` ships in `DefaultPlugins`). This module is only the
//! **shell**: it stamps a [`ScrollbarConfig`] on the scroll container (from the
//! style), then per active axis spawns a Bevy `Scrollbar` track (styled from
//! `track`) with a `ScrollbarThumb` child (styled from `thumb`) that **targets**
//! the container. The track is parented to the container's *own* ECS parent and
//! positioned each frame over the container's edge, so it is never scrolled or
//! clipped by the container and stacks just above it (not above the whole app) —
//! the same overlay trick as [`crate::anchor`], `ChildOf` self-healed against the
//! reconciler's end-of-batch child rebuild.
//!
//! `ScrollbarThumb` has no `Node`, so the styleable surface is deliberately a
//! small, honest [`ScrollbarPartStyle`] (color/border/radius) rather than a full
//! `Style` — see its docs.

use std::fmt;

use bevy::picking::hover::Hovered;
use bevy::platform::collections::HashMap;
use bevy::prelude::*;
use bevy::ui::{
    BackgroundColor, BorderColor, BorderRadius, ComputedNode, Node, OverflowAxis, PositionType,
    ScrollPosition, UiGlobalTransform, UiRect, Val, ZIndex,
};
use bevy::ui_widgets::{ControlOrientation, Scrollbar, ScrollbarDragState, ScrollbarThumb};

use serde::Deserialize;
use serde::de::{self, Deserializer, MapAccess, Visitor};

use crate::plugin::PointerCapture;
use crate::protocol::{BorderColorSpec, Rect};
use crate::transition::ScrollTransitionState;
use crate::ui_map::{parse_color, rect_to_border_radius, rect_to_uirect};

/// Default bar cross-axis thickness (logical px) when the spec doesn't set one.
pub const DEFAULT_THICKNESS: f32 = 12.0;
/// Default minimum thumb length (logical px) — keeps the thumb grabbable on very
/// long content. Maps to `Scrollbar::min_thumb_length`.
pub const DEFAULT_MIN_THUMB: f32 = 24.0;
/// The `"default"` scrollbar's track fill.
const DEFAULT_TRACK_COLOR: Color = Color::srgba(0.0, 0.0, 0.0, 0.12);
/// The `"default"` scrollbar's thumb fill.
const DEFAULT_THUMB_COLOR: Color = Color::srgba(0.55, 0.55, 0.55, 0.9);

/// Whether the bar reserves layout space or floats over content.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum ScrollbarPosition {
    /// Reserve gutter space (via `Node.scrollbar_width`); content shrinks and the
    /// bar sits in its own track. The default.
    #[default]
    Gutter,
    /// Reserve nothing; the bar floats over content on the chosen edge.
    Float,
}

/// Which edge the vertical bar sits on.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum HorizontalEdge {
    Left,
    #[default]
    Right,
}

/// Which edge the horizontal bar sits on.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum VerticalEdge {
    Top,
    #[default]
    Bottom,
}

/// Which interaction state a part is painted in. `Pressed` (the bar is being
/// dragged) wins over `Hover` (the pointer is over the part); both overlay `Base`.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PartState {
    Base,
    Hover,
    Pressed,
}

/// The honest, dedicated style for one scrollbar part (track or thumb). **Not**
/// the full `Style`: Bevy's `ScrollbarThumb` has no `Node` and owns its own
/// size/position, so only these four visual fields map through — listing exactly
/// them keeps the API from silently ignoring `width`/`padding`/`flex`/gradients/etc.
/// (The track *is* a real `Node`, but v1 keeps both parts symmetric.)
///
/// `hover`/`pressed` are overlaid on the base fields while the pointer is over the
/// part / while the bar is being dragged (a variant's own nested `hover`/`pressed`
/// are ignored — one level only).
#[derive(Debug, Clone, Default, PartialEq)]
pub struct ScrollbarPartStyle {
    /// Fill color (hex / CSS color) → `BackgroundColor`.
    pub background_color: Option<String>,
    /// Border color(s) → `BorderColor`.
    pub border_color: Option<BorderColorSpec>,
    /// Corner radii → `BorderRadius` / `ScrollbarThumb.border_radius`.
    pub border_radius: Option<Rect>,
    /// Border thickness → the node border / `ScrollbarThumb.border`.
    pub border: Option<Rect>,
    /// Overlaid while the pointer is over this part.
    pub hover: Option<Box<ScrollbarPartStyle>>,
    /// Overlaid while the bar is being dragged (wins over `hover`).
    pub pressed: Option<Box<ScrollbarPartStyle>>,
}

impl ScrollbarPartStyle {
    /// The sub-style overlaid for `state` (`None` for `Base`).
    fn variant(&self, state: PartState) -> Option<&ScrollbarPartStyle> {
        match state {
            PartState::Base => None,
            PartState::Hover => self.hover.as_deref(),
            PartState::Pressed => self.pressed.as_deref(),
        }
    }
}

impl<'de> Deserialize<'de> for ScrollbarPartStyle {
    fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        struct PartVisitor;
        impl<'de> Visitor<'de> for PartVisitor {
            type Value = ScrollbarPartStyle;
            fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
                f.write_str("a scrollbar part style object")
            }
            fn visit_map<A: MapAccess<'de>>(
                self,
                mut map: A,
            ) -> Result<ScrollbarPartStyle, A::Error> {
                let mut part = ScrollbarPartStyle::default();
                while let Some(key) = map.next_key::<String>()? {
                    match key.as_str() {
                        "backgroundColor" => part.background_color = map.next_value()?,
                        "borderColor" => part.border_color = map.next_value()?,
                        "borderRadius" => part.border_radius = map.next_value()?,
                        "border" => part.border = map.next_value()?,
                        "hover" => {
                            part.hover = map
                                .next_value::<Option<ScrollbarPartStyle>>()?
                                .map(Box::new)
                        }
                        "pressed" => {
                            part.pressed = map
                                .next_value::<Option<ScrollbarPartStyle>>()?
                                .map(Box::new)
                        }
                        // Unknown key: consume the value and skip (a typo must not
                        // abort the whole commit batch — like the rest of the protocol).
                        _ => {
                            let _ = map.next_value::<de::IgnoredAny>()?;
                            crate::protocol::decode_warn(
                                "scrollbar",
                                &key,
                                &format!("unknown scrollbar part field {key:?}; ignoring"),
                            );
                        }
                    }
                }
                Ok(part)
            }
        }
        d.deserialize_map(PartVisitor)
    }
}

/// A fully-configured scrollbar (the payload of [`ScrollbarSpec::Styled`]). Boxed
/// in the enum so `ScrollbarSpec` — and thus [`crate::protocol::Style`], which
/// embeds it four times over — stays small.
#[derive(Debug, Clone, PartialEq, Default)]
pub struct ScrollbarStyled {
    pub track: Option<ScrollbarPartStyle>,
    pub thumb: Option<ScrollbarPartStyle>,
    pub thickness: Option<f32>,
    pub min_thumb_length: Option<f32>,
    pub position: ScrollbarPosition,
    pub vertical_side: HorizontalEdge,
    pub horizontal_side: VerticalEdge,
}

/// The decoded `scrollbar` style field: `"none"`, `"default"`, or a styled object.
#[derive(Debug, Clone, PartialEq, Default)]
pub enum ScrollbarSpec {
    /// No visible bar.
    #[default]
    None,
    /// The built-in neutral bar (gutter, right/bottom, ~12px).
    Default,
    /// A fully-configured bar.
    Styled(Box<ScrollbarStyled>),
}

impl ScrollbarSpec {
    /// A visible bar (anything but `None`).
    pub fn is_visible(&self) -> bool {
        !matches!(self, ScrollbarSpec::None)
    }

    /// The `Styled` payload, if any.
    fn styled(&self) -> Option<&ScrollbarStyled> {
        match self {
            ScrollbarSpec::Styled(s) => Some(s),
            _ => None,
        }
    }

    /// Bar cross-axis thickness in logical px.
    pub fn thickness(&self) -> f32 {
        self.styled()
            .and_then(|s| s.thickness)
            .unwrap_or(DEFAULT_THICKNESS)
    }

    /// Minimum thumb length in logical px.
    pub fn min_thumb_length(&self) -> f32 {
        self.styled()
            .and_then(|s| s.min_thumb_length)
            .unwrap_or(DEFAULT_MIN_THUMB)
    }

    /// Gutter (reserve space) vs float (overlay).
    pub fn position(&self) -> ScrollbarPosition {
        self.styled().map(|s| s.position).unwrap_or_default()
    }

    /// Which edge the vertical bar sits on.
    pub fn vertical_side(&self) -> HorizontalEdge {
        self.styled().map(|s| s.vertical_side).unwrap_or_default()
    }

    /// Which edge the horizontal bar sits on.
    pub fn horizontal_side(&self) -> VerticalEdge {
        self.styled().map(|s| s.horizontal_side).unwrap_or_default()
    }

    fn track_style(&self) -> Option<&ScrollbarPartStyle> {
        self.styled().and_then(|s| s.track.as_ref())
    }

    fn thumb_style(&self) -> Option<&ScrollbarPartStyle> {
        self.styled().and_then(|s| s.thumb.as_ref())
    }
}

impl<'de> Deserialize<'de> for ScrollbarSpec {
    fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        struct SpecVisitor;
        impl<'de> Visitor<'de> for SpecVisitor {
            type Value = ScrollbarSpec;
            fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
                f.write_str("\"none\", \"default\", or a scrollbar style object")
            }
            fn visit_str<E: de::Error>(self, s: &str) -> Result<ScrollbarSpec, E> {
                Ok(match s {
                    "none" => ScrollbarSpec::None,
                    "default" => ScrollbarSpec::Default,
                    other => {
                        crate::protocol::decode_warn(
                            "scrollbar",
                            other,
                            &format!("unknown scrollbar keyword {other:?}; using \"none\""),
                        );
                        ScrollbarSpec::None
                    }
                })
            }
            // A JSON `null` (an unset field) decodes to `None`.
            fn visit_unit<E: de::Error>(self) -> Result<ScrollbarSpec, E> {
                Ok(ScrollbarSpec::None)
            }
            fn visit_none<E: de::Error>(self) -> Result<ScrollbarSpec, E> {
                Ok(ScrollbarSpec::None)
            }
            fn visit_map<A: MapAccess<'de>>(self, mut map: A) -> Result<ScrollbarSpec, A::Error> {
                let mut track = None;
                let mut thumb = None;
                let mut thickness = None;
                let mut min_thumb_length = None;
                let mut position = ScrollbarPosition::default();
                let mut vertical_side = HorizontalEdge::default();
                let mut horizontal_side = VerticalEdge::default();
                while let Some(key) = map.next_key::<String>()? {
                    match key.as_str() {
                        "track" => track = map.next_value()?,
                        "thumb" => thumb = map.next_value()?,
                        "thickness" => thickness = map.next_value()?,
                        "minThumbLength" => min_thumb_length = map.next_value()?,
                        "position" => {
                            position = match map.next_value::<String>()?.as_str() {
                                "float" => ScrollbarPosition::Float,
                                "gutter" => ScrollbarPosition::Gutter,
                                other => {
                                    crate::protocol::decode_warn(
                                        "scrollbar",
                                        other,
                                        &format!(
                                            "unknown scrollbar position {other:?}; using \"gutter\""
                                        ),
                                    );
                                    ScrollbarPosition::Gutter
                                }
                            }
                        }
                        "verticalSide" => {
                            vertical_side = match map.next_value::<String>()?.as_str() {
                                "left" => HorizontalEdge::Left,
                                "right" => HorizontalEdge::Right,
                                other => {
                                    crate::protocol::decode_warn(
                                        "scrollbar",
                                        other,
                                        &format!(
                                            "unknown scrollbar verticalSide {other:?}; using \"right\""
                                        ),
                                    );
                                    HorizontalEdge::Right
                                }
                            }
                        }
                        "horizontalSide" => {
                            horizontal_side = match map.next_value::<String>()?.as_str() {
                                "top" => VerticalEdge::Top,
                                "bottom" => VerticalEdge::Bottom,
                                other => {
                                    crate::protocol::decode_warn(
                                        "scrollbar",
                                        other,
                                        &format!(
                                            "unknown scrollbar horizontalSide {other:?}; using \"bottom\""
                                        ),
                                    );
                                    VerticalEdge::Bottom
                                }
                            }
                        }
                        _ => {
                            let _ = map.next_value::<de::IgnoredAny>()?;
                            crate::protocol::decode_warn(
                                "scrollbar",
                                &key,
                                &format!("unknown scrollbar field {key:?}; ignoring"),
                            );
                        }
                    }
                }
                Ok(ScrollbarSpec::Styled(Box::new(ScrollbarStyled {
                    track,
                    thumb,
                    thickness,
                    min_thumb_length,
                    position,
                    vertical_side,
                    horizontal_side,
                })))
            }
        }
        d.deserialize_any(SpecVisitor)
    }
}

/// Stamped on a scroll container (from its `scrollbar` style field) when the spec
/// is visible; removed when it's `"none"`/absent. Read by [`sync_scrollbars`],
/// which spawns/despawns the Bevy widget entities that render the bar.
#[derive(Component, Debug, Clone, PartialEq)]
pub struct ScrollbarConfig(pub ScrollbarSpec);

/// One axis's spawned widget entities (the track and its thumb child).
#[derive(Clone, Copy)]
struct AxisEntities {
    track: Entity,
    #[allow(dead_code)] // despawned via the recursive track despawn; kept for clarity/tests
    thumb: Entity,
}

/// Per-container spawned scrollbar state, keyed by the container entity.
struct ContainerTracks {
    vertical: Option<AxisEntities>,
    horizontal: Option<AxisEntities>,
    /// The spec these entities were built from; a change tears them down and rebuilds.
    spec: ScrollbarSpec,
}

/// Maps each `ScrollbarConfig` container to its spawned widget entities. Mirrors
/// the `surface_parent` side-map pattern — the widget entities are Rust-managed
/// (not reconciler nodes), so they live outside the shadow tree.
#[derive(Resource, Default)]
pub struct ScrollbarTracks(HashMap<Entity, ContainerTracks>);

// --- style resolution (spec part + state -> bevy components) ---

/// The bevy visual components a part resolves to for a given [`PartState`].
struct EffectiveVisual {
    background: BackgroundColor,
    border_color: BorderColor,
    border: UiRect,
    border_radius: BorderRadius,
}

/// Resolve a part's four visual fields for `state`: each field takes the state
/// variant's value if set, else the base value, else the supplied default.
fn resolve_visual(
    part: Option<&ScrollbarPartStyle>,
    state: PartState,
    default_bg: Color,
    default_radius: BorderRadius,
) -> EffectiveVisual {
    let ov = part.and_then(|p| p.variant(state));
    let background = ov
        .and_then(|o| o.background_color.as_deref())
        .or_else(|| part.and_then(|p| p.background_color.as_deref()))
        .map(parse_color)
        .unwrap_or(default_bg);
    let side = |c: &Option<String>| c.as_deref().map(parse_color).unwrap_or(Color::NONE);
    let border_color = match ov
        .and_then(|o| o.border_color.as_ref())
        .or_else(|| part.and_then(|p| p.border_color.as_ref()))
    {
        Some(spec) => BorderColor {
            top: side(&spec.top),
            right: side(&spec.right),
            bottom: side(&spec.bottom),
            left: side(&spec.left),
        },
        None => BorderColor::all(Color::NONE),
    };
    let border = ov
        .and_then(|o| o.border)
        .or_else(|| part.and_then(|p| p.border))
        .map(rect_to_uirect)
        .unwrap_or(UiRect::ZERO);
    let border_radius = ov
        .and_then(|o| o.border_radius)
        .or_else(|| part.and_then(|p| p.border_radius))
        .map(rect_to_border_radius)
        .unwrap_or(default_radius);
    EffectiveVisual {
        background: BackgroundColor(background),
        border_color,
        border,
        border_radius,
    }
}

/// The thumb's default corner radius (a pill at the default thickness).
fn thumb_default_radius(thickness: f32) -> BorderRadius {
    BorderRadius::all(Val::Px(thickness * 0.5))
}

/// Spawn one axis's `Scrollbar` track (child of `parent`) + `ScrollbarThumb` child.
fn spawn_axis(
    commands: &mut Commands,
    container: Entity,
    parent: Entity,
    spec: &ScrollbarSpec,
    orientation: ControlOrientation,
) -> AxisEntities {
    let thickness = spec.thickness();
    // Base-state visuals; `style_scrollbar_states` re-derives per hover/press each frame.
    let tv = resolve_visual(
        spec.track_style(),
        PartState::Base,
        DEFAULT_TRACK_COLOR,
        BorderRadius::ZERO,
    );
    let hv = resolve_visual(
        spec.thumb_style(),
        PartState::Base,
        DEFAULT_THUMB_COLOR,
        thumb_default_radius(thickness),
    );
    // Track: an absolutely-positioned node (placed each frame by `position_scrollbars`),
    // above its siblings within the parent's stacking context, styled from `track`.
    let track = commands
        .spawn((
            Scrollbar::new(container, orientation, spec.min_thumb_length()),
            Node {
                position_type: PositionType::Absolute,
                border: tv.border,
                border_radius: tv.border_radius,
                ..default()
            },
            tv.background,
            tv.border_color,
            // Above the container (a sibling) but inside the parent's stacking context,
            // so a globally-higher modal still covers it.
            ZIndex(i32::MAX),
            // Start hidden; `position_scrollbars` reveals it once it has a scroll range.
            Visibility::Hidden,
            // Track-click paging needs the track to be pickable; `Hovered` tracks its
            // pointer-over state for `style_scrollbar_states` (auto-updated by picking).
            Pickable {
                should_block_lower: true,
                is_hoverable: true,
            },
            Hovered::default(),
            ChildOf(parent),
        ))
        .id();
    // Thumb: no `Node` — Bevy sizes/positions it. `ScrollbarThumb`'s `#[require]`
    // already adds BackgroundColor/BorderColor/etc.; we override the visual ones.
    // `Hovered` follows Bevy's own scrollbars example for hover styling.
    let thumb = commands
        .spawn((
            ScrollbarThumb {
                border_radius: hv.border_radius,
                border: hv.border,
            },
            hv.background,
            hv.border_color,
            Pickable {
                should_block_lower: true,
                is_hoverable: true,
            },
            Hovered::default(),
            ChildOf(track),
        ))
        .id();
    AxisEntities { track, thumb }
}

/// Reconcile the spawned widget entities against every [`ScrollbarConfig`]
/// container: spawn a track+thumb per active (`overflow: scroll`) axis, tear down
/// axes that turn off, rebuild on a spec change, and drop everything for a
/// container that lost its config or was despawned.
pub fn sync_scrollbars(
    mut commands: Commands,
    mut tracks: ResMut<ScrollbarTracks>,
    q_containers: Query<(Entity, &ScrollbarConfig, &Node, &ChildOf), Without<Scrollbar>>,
) {
    use bevy::platform::collections::HashSet;
    let mut seen: HashSet<Entity> = HashSet::new();

    for (container, config, node, child_of) in &q_containers {
        seen.insert(container);
        let parent = child_of.parent();
        let entry = tracks
            .0
            .entry(container)
            .or_insert_with(|| ContainerTracks {
                vertical: None,
                horizontal: None,
                spec: config.0.clone(),
            });

        // A spec change (e.g. a hover/press variant) tears the bars down; they're
        // rebuilt below from the new spec.
        if entry.spec != config.0 {
            for axis in [entry.vertical.take(), entry.horizontal.take()]
                .into_iter()
                .flatten()
            {
                commands.entity(axis.track).despawn();
            }
            entry.spec = config.0.clone();
        }

        let want_v = node.overflow.y == OverflowAxis::Scroll;
        let want_h = node.overflow.x == OverflowAxis::Scroll;

        if want_v && entry.vertical.is_none() {
            entry.vertical = Some(spawn_axis(
                &mut commands,
                container,
                parent,
                &config.0,
                ControlOrientation::Vertical,
            ));
        } else if !want_v && let Some(axis) = entry.vertical.take() {
            commands.entity(axis.track).despawn();
        }

        if want_h && entry.horizontal.is_none() {
            entry.horizontal = Some(spawn_axis(
                &mut commands,
                container,
                parent,
                &config.0,
                ControlOrientation::Horizontal,
            ));
        } else if !want_h && let Some(axis) = entry.horizontal.take() {
            commands.entity(axis.track).despawn();
        }
    }

    // Drop entries whose container lost its `ScrollbarConfig` or was despawned.
    tracks.0.retain(|container, entry| {
        if seen.contains(container) {
            return true;
        }
        for axis in [entry.vertical, entry.horizontal].into_iter().flatten() {
            commands.entity(axis.track).try_despawn();
        }
        false
    });
}

/// The logical scroll range per axis (0 means "no scroll"), mirroring
/// `crate::scroll::apply_scroll`'s formula.
fn scroll_max(computed: &ComputedNode) -> Vec2 {
    (computed.content_size - computed.size + computed.scrollbar_size).max(Vec2::ZERO)
        * computed.inverse_scale_factor
}

/// The track's `(left/top, width/height)` in the parent's local (logical) space,
/// for a container whose top-left sits at `rel` (logical, relative to the parent's
/// top-left) with logical `size`. `thickness` is the bar's cross-axis size.
fn place_track(
    rel: Vec2,
    size: Vec2,
    thickness: f32,
    orientation: ControlOrientation,
    v_side: HorizontalEdge,
    h_side: VerticalEdge,
) -> (Vec2, Vec2) {
    match orientation {
        ControlOrientation::Vertical => {
            let left = match v_side {
                HorizontalEdge::Right => rel.x + size.x - thickness,
                HorizontalEdge::Left => rel.x,
            };
            (Vec2::new(left, rel.y), Vec2::new(thickness, size.y))
        }
        ControlOrientation::Horizontal => {
            let top = match h_side {
                VerticalEdge::Bottom => rel.y + size.y - thickness,
                VerticalEdge::Top => rel.y,
            };
            (Vec2::new(rel.x, top), Vec2::new(size.x, thickness))
        }
    }
}

/// Position each spawned track over its container's chosen edge (in the parent's
/// coordinate space) and hide it when its axis has no scroll range. Bevy's
/// `update_scrollbar_thumb` positions the thumb *within* the track afterward
/// (PostUpdate). Also self-heals the track's `ChildOf` against the reconciler's
/// end-of-batch child rebuild (the anchored-node trick).
#[allow(clippy::type_complexity)]
pub fn position_scrollbars(
    mut commands: Commands,
    tracks: Res<ScrollbarTracks>,
    q_containers: Query<
        (
            &ScrollbarConfig,
            &ComputedNode,
            &UiGlobalTransform,
            &ChildOf,
        ),
        Without<Scrollbar>,
    >,
    q_parents: Query<(&ComputedNode, &UiGlobalTransform)>,
    mut q_tracks: Query<(&mut Node, &mut Visibility, Option<&ChildOf>), With<Scrollbar>>,
) {
    for (&container, entry) in tracks.0.iter() {
        let Ok((config, computed, transform, child_of)) = q_containers.get(container) else {
            continue;
        };
        let parent = child_of.parent();
        let Ok((parent_computed, parent_transform)) = q_parents.get(parent) else {
            continue;
        };

        let inv = computed.inverse_scale_factor;
        // Container top-left relative to the parent's top-left, in logical px.
        // (Assumes the parent has no border; scroll-container parents typically don't.)
        let container_tl = transform.translation - computed.size * 0.5;
        let parent_tl = parent_transform.translation - parent_computed.size * 0.5;
        let rel = (container_tl - parent_tl) * inv;
        let size = computed.size * inv;
        let thickness = config.0.thickness();
        let max = scroll_max(computed);

        let mut apply = |axis: AxisEntities, orientation: ControlOrientation, has_range: bool| {
            let Ok((mut node, mut visibility, track_child_of)) = q_tracks.get_mut(axis.track)
            else {
                return;
            };
            // Self-heal: the parent's end-of-batch `replace_children` can transiently
            // drop this non-shadow child; re-assert it (only when it actually diverged).
            if track_child_of.map(|c| c.parent()) != Some(parent) {
                commands.entity(axis.track).insert(ChildOf(parent));
            }
            let next_vis = if has_range {
                Visibility::Inherited
            } else {
                Visibility::Hidden
            };
            if *visibility != next_vis {
                *visibility = next_vis;
            }
            if !has_range {
                return;
            }
            let (pos, dims) = place_track(
                rel,
                size,
                thickness,
                orientation,
                config.0.vertical_side(),
                config.0.horizontal_side(),
            );
            node.left = Val::Px(pos.x);
            node.top = Val::Px(pos.y);
            node.width = Val::Px(dims.x);
            node.height = Val::Px(dims.y);
        };

        if let Some(axis) = entry.vertical {
            apply(axis, ControlOrientation::Vertical, max.y > 0.0);
        }
        if let Some(axis) = entry.horizontal {
            apply(axis, ControlOrientation::Horizontal, max.x > 0.0);
        }
    }
}

/// Bridge Bevy's scrollbar interaction into bevy-react's frame state: while a
/// thumb is being dragged, claim the pointer for the UI (so world-input systems
/// ignore it) and — if the target container eases its scroll — keep the eased
/// target pinned to the live offset so `drive_scroll_transition` doesn't fight the
/// direct write.
pub fn bridge_scrollbar_capture(
    q_drag: Query<(&ScrollbarDragState, &ChildOf), With<ScrollbarThumb>>,
    q_scrollbar: Query<&Scrollbar>,
    mut q_scroll: Query<(&ScrollPosition, &mut ScrollTransitionState)>,
    mut capture: ResMut<PointerCapture>,
) {
    for (drag, child_of) in &q_drag {
        if !drag.dragging {
            continue;
        }
        capture.dragging = true;
        capture.over_ui = true;
        if let Ok(scrollbar) = q_scrollbar.get(child_of.parent())
            && let Ok((pos, mut state)) = q_scroll.get_mut(scrollbar.target)
        {
            state.target = pos.0;
        }
    }
}

/// Which state a part is in: `pressed` (its bar is being dragged) > `hover` (the
/// pointer is over it) > base.
fn part_state(dragging: bool, hovered: bool) -> PartState {
    if dragging {
        PartState::Pressed
    } else if hovered {
        PartState::Hover
    } else {
        PartState::Base
    }
}

/// Paint each scrollbar part in its current interaction state, following Bevy's own
/// scrollbars example: `hover` uses the `Hovered` component (auto-updated by
/// picking), `pressed` uses the bar's `ScrollbarDragState.dragging`. Idempotent —
/// only writes a component when the resolved value actually changed.
#[allow(clippy::type_complexity)]
pub fn style_scrollbar_states(
    tracks: Res<ScrollbarTracks>,
    q_config: Query<&ScrollbarConfig>,
    q_hovered: Query<&Hovered>,
    q_drag: Query<&ScrollbarDragState, With<ScrollbarThumb>>,
    mut q_track: Query<
        (&mut BackgroundColor, &mut BorderColor, &mut Node),
        (With<Scrollbar>, Without<ScrollbarThumb>),
    >,
    mut q_thumb: Query<
        (&mut BackgroundColor, &mut BorderColor, &mut ScrollbarThumb),
        (With<ScrollbarThumb>, Without<Scrollbar>),
    >,
) {
    for (&container, entry) in tracks.0.iter() {
        let Ok(config) = q_config.get(container) else {
            continue;
        };
        let spec = &config.0;
        let thickness = spec.thickness();

        for axis in [entry.vertical, entry.horizontal].into_iter().flatten() {
            // The whole bar is "pressed" while its thumb is being dragged.
            let dragging = q_drag.get(axis.thumb).map(|d| d.dragging).unwrap_or(false);

            if let Ok((mut bg, mut bc, mut node)) = q_track.get_mut(axis.track) {
                let hovered = q_hovered.get(axis.track).map(|h| h.0).unwrap_or(false);
                let v = resolve_visual(
                    spec.track_style(),
                    part_state(dragging, hovered),
                    DEFAULT_TRACK_COLOR,
                    BorderRadius::ZERO,
                );
                bg.set_if_neq(v.background);
                bc.set_if_neq(v.border_color);
                // `node.border`/`border_radius` guard is manual so we don't trip Node
                // change detection (a relayout) on a paint-only frame.
                if node.border != v.border || node.border_radius != v.border_radius {
                    node.border = v.border;
                    node.border_radius = v.border_radius;
                }
            }

            if let Ok((mut bg, mut bc, mut thumb)) = q_thumb.get_mut(axis.thumb) {
                let hovered = q_hovered.get(axis.thumb).map(|h| h.0).unwrap_or(false);
                let v = resolve_visual(
                    spec.thumb_style(),
                    part_state(dragging, hovered),
                    DEFAULT_THUMB_COLOR,
                    thumb_default_radius(thickness),
                );
                bg.set_if_neq(v.background);
                bc.set_if_neq(v.border_color);
                if thumb.border != v.border || thumb.border_radius != v.border_radius {
                    thumb.border = v.border;
                    thumb.border_radius = v.border_radius;
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::protocol::Style;

    #[test]
    fn decodes_none_and_default_keywords() {
        let style: Style = serde_json::from_value(serde_json::json!({ "scrollbar": "none" }))
            .expect("decode none");
        assert_eq!(style.scrollbar, Some(ScrollbarSpec::None));

        let style: Style = serde_json::from_value(serde_json::json!({ "scrollbar": "default" }))
            .expect("decode default");
        assert_eq!(style.scrollbar, Some(ScrollbarSpec::Default));
    }

    #[test]
    fn decodes_styled_object_round_trip() {
        let style: Style = serde_json::from_value(serde_json::json!({
            "scrollbar": {
                "track": { "backgroundColor": "#111111", "borderRadius": 4 },
                "thumb": { "backgroundColor": "#888888" },
                "thickness": 8,
                "minThumbLength": 30,
                "position": "float",
                "verticalSide": "left",
                "horizontalSide": "top",
            }
        }))
        .expect("decode styled");
        let spec = style.scrollbar.expect("present");
        assert_eq!(spec.thickness(), 8.0);
        assert_eq!(spec.min_thumb_length(), 30.0);
        assert_eq!(spec.position(), ScrollbarPosition::Float);
        assert_eq!(spec.vertical_side(), HorizontalEdge::Left);
        assert_eq!(spec.horizontal_side(), VerticalEdge::Top);
        let track = spec.track_style().expect("track");
        assert_eq!(track.background_color.as_deref(), Some("#111111"));
        assert!(spec.thumb_style().is_some());
    }

    #[test]
    fn unknown_keyword_falls_back_to_none() {
        let style: Style = serde_json::from_value(serde_json::json!({ "scrollbar": "wat" }))
            .expect("must not error on a bad keyword");
        assert_eq!(style.scrollbar, Some(ScrollbarSpec::None));
    }

    #[test]
    fn decodes_hover_and_pressed_variants() {
        let style: Style = serde_json::from_value(serde_json::json!({
            "scrollbar": {
                "thumb": {
                    "backgroundColor": "#888888",
                    "hover": { "backgroundColor": "#aaaaaa" },
                    "pressed": { "backgroundColor": "#c4b5fd" },
                }
            }
        }))
        .expect("decode variants");
        let spec = style.scrollbar.expect("present");
        let thumb = spec.thumb_style().expect("thumb");
        assert_eq!(thumb.background_color.as_deref(), Some("#888888"));
        assert_eq!(
            thumb
                .variant(PartState::Hover)
                .unwrap()
                .background_color
                .as_deref(),
            Some("#aaaaaa")
        );
        assert_eq!(
            thumb
                .variant(PartState::Pressed)
                .unwrap()
                .background_color
                .as_deref(),
            Some("#c4b5fd")
        );
    }

    #[test]
    fn resolve_visual_precedence_pressed_over_hover_over_base() {
        // Base blue; hover green; pressed omits color (falls back to base), overrides radius.
        let part = ScrollbarPartStyle {
            background_color: Some("#0000ff".into()),
            border_radius: Some(Rect::default()),
            hover: Some(Box::new(ScrollbarPartStyle {
                background_color: Some("#00ff00".into()),
                ..default()
            })),
            pressed: Some(Box::new(ScrollbarPartStyle {
                border_radius: Some(Rect::default()),
                ..default()
            })),
            ..default()
        };
        let base = resolve_visual(
            Some(&part),
            PartState::Base,
            Color::WHITE,
            BorderRadius::ZERO,
        );
        assert_eq!(base.background.0, parse_color("#0000ff"));

        let hover = resolve_visual(
            Some(&part),
            PartState::Hover,
            Color::WHITE,
            BorderRadius::ZERO,
        );
        assert_eq!(
            hover.background.0,
            parse_color("#00ff00"),
            "hover overrides base"
        );

        // Pressed sets no color → falls back to the base color (not hover's).
        let pressed = resolve_visual(
            Some(&part),
            PartState::Pressed,
            Color::WHITE,
            BorderRadius::ZERO,
        );
        assert_eq!(
            pressed.background.0,
            parse_color("#0000ff"),
            "pressed with no color falls back to base, not hover"
        );

        // A part with no styling uses the supplied default.
        let none = resolve_visual(None, PartState::Hover, Color::WHITE, BorderRadius::ZERO);
        assert_eq!(none.background.0, Color::WHITE);
    }

    #[test]
    fn defaults_when_object_omits_fields() {
        let style: Style =
            serde_json::from_value(serde_json::json!({ "scrollbar": {} })).expect("decode empty");
        let spec = style.scrollbar.expect("present");
        assert_eq!(spec.thickness(), DEFAULT_THICKNESS);
        assert_eq!(spec.min_thumb_length(), DEFAULT_MIN_THUMB);
        assert_eq!(spec.position(), ScrollbarPosition::Gutter);
        assert_eq!(spec.vertical_side(), HorizontalEdge::Right);
        assert_eq!(spec.horizontal_side(), VerticalEdge::Bottom);
    }

    #[test]
    fn scroll_max_is_zero_when_content_fits() {
        let fits = ComputedNode {
            size: Vec2::new(100.0, 100.0),
            content_size: Vec2::new(100.0, 100.0),
            inverse_scale_factor: 1.0,
            ..default()
        };
        assert_eq!(scroll_max(&fits), Vec2::ZERO);

        let overflowing = ComputedNode {
            size: Vec2::new(100.0, 100.0),
            content_size: Vec2::new(100.0, 300.0),
            inverse_scale_factor: 1.0,
            ..default()
        };
        assert_eq!(scroll_max(&overflowing), Vec2::new(0.0, 200.0));
    }

    #[test]
    fn places_vertical_track_on_the_right_edge() {
        // A 200x100 container at rel (10, 20); a 12px vertical bar on the right.
        let (pos, dims) = place_track(
            Vec2::new(10.0, 20.0),
            Vec2::new(200.0, 100.0),
            12.0,
            ControlOrientation::Vertical,
            HorizontalEdge::Right,
            VerticalEdge::Bottom,
        );
        assert_eq!(pos, Vec2::new(10.0 + 200.0 - 12.0, 20.0));
        assert_eq!(dims, Vec2::new(12.0, 100.0));
    }

    #[test]
    fn places_horizontal_track_on_the_top_edge() {
        let (pos, dims) = place_track(
            Vec2::new(10.0, 20.0),
            Vec2::new(200.0, 100.0),
            12.0,
            ControlOrientation::Horizontal,
            HorizontalEdge::Right,
            VerticalEdge::Top,
        );
        assert_eq!(pos, Vec2::new(10.0, 20.0));
        assert_eq!(dims, Vec2::new(200.0, 12.0));
    }
}
