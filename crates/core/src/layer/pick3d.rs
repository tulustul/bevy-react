//! Transformed picking for `transform3d` layers.
//!
//! Layer promotion is render-side only, so a 3D-transformed subtree's nodes
//! keep their untransformed layout rects on the window camera — the stock
//! hit-test sees them where layout put them, not where the composite quad
//! draws them. This module makes picking follow the visual:
//!
//! 1. [`drive_transform3d_pointer`] inverts the cursor through the topmost
//!    transformed layer's screen homography onto the layer plane and drives a
//!    shared `PointerId::Custom` virtual pointer at the recovered
//!    *untransformed* window position — stock picking then resolves the
//!    subtree's descendants normally (the `<surface>` virtual-pointer
//!    pattern, but window-target).
//! 2. [`suppress_transformed_layer_hits`] drops the real mouse pointer's hits
//!    on members of visually-transformed layers (their layout rects are
//!    visually stale) and scopes the virtual pointer's hits to the layer it
//!    is remapping into (its window location overlaps unrelated nodes).
//! 3. [`correct_transformed_interactions`] re-derives the legacy
//!    `Interaction` for those members from the virtual pointer's `HoverMap`
//!    entry — `ui_focus_system` runs its own geometric hit-test that neither
//!    1 nor 2 reaches.
//!
//! Identity-valued transforms keep everything here inert (visual == layout);
//! nested transformed-in-transformed layers invert the *nearest* transformed
//! root only — a documented v1 limitation. Click-through *under* the visual
//! quad (the real pointer hitting non-members the transformed result covers)
//! is out of scope for v1.

use bevy::ecs::message::MessageMutator;
use bevy::input::ButtonInput;
use bevy::input::mouse::MouseButton;
use bevy::picking::backend::PointerHits;
use bevy::picking::hover::HoverMap;
use bevy::picking::pointer::{
    Location, PointerAction, PointerButton, PointerId, PointerInput, PointerLocation, PointerPress,
};
use bevy::prelude::*;
use bevy::ui::{ComputedNode, UiGlobalTransform, UiStack};
use bevy::window::PrimaryWindow;

use super::transform3d::LayerTransform3dMatrix;
use super::{LayerMembership, PromotedLayer};

/// The transform3d virtual pointer's fixed id (see
/// `crate::surface`'s `SURFACE_POINTER_UUID` for the pattern).
pub const TRANSFORM3D_POINTER_UUID: uuid::Uuid = uuid::Uuid::from_u128(0x7D3D_D001);

/// The mouse buttons forwarded to the virtual pointer — the same set the
/// surface pointer forwards.
const FORWARDED_BUTTONS: [(MouseButton, PointerButton); 3] = [
    (MouseButton::Left, PointerButton::Primary),
    (MouseButton::Right, PointerButton::Secondary),
    (MouseButton::Middle, PointerButton::Middle),
];

/// Index of a forwarded button in [`Transform3dPointer::pressed`].
fn button_index(button: PointerButton) -> usize {
    match button {
        PointerButton::Primary => 0,
        PointerButton::Secondary => 1,
        PointerButton::Middle => 2,
    }
}

/// The single virtual pointer remapping cursor input into transformed layers
/// (topmost-wins, like the one surface pointer serving every surface), plus
/// its frame-to-frame state.
#[derive(Resource)]
pub struct Transform3dPointer {
    /// The custom pointer id. Picking events carrying this id originated from
    /// a transformed-layer remap.
    pub id: PointerId,
    /// The transformed layer root the pointer is currently remapped into —
    /// the scope [`suppress_transformed_layer_hits`] retains virtual-pointer
    /// hits to. `None` = parked.
    pub over_layer: Option<Entity>,
    /// Last driven position (logical window coords).
    last_pos: Vec2,
    /// The window target last driven to (kept for the park move once the
    /// cursor — and with it the mouse pointer's live location — leaves).
    last_target: Option<bevy::camera::NormalizedRenderTarget>,
    /// Per-button owed-release flags, indexed by [`button_index`].
    pressed: [bool; FORWARDED_BUTTONS.len()],
}

/// Spawn the virtual pointer at startup and publish its id.
pub fn init_transform3d_pointer(mut commands: Commands) {
    let id = PointerId::Custom(TRANSFORM3D_POINTER_UUID);
    // Spawning a `PointerId` auto-adds `PointerLocation`/`PointerPress`/….
    commands.spawn(id);
    commands.insert_resource(Transform3dPointer {
        id,
        over_layer: None,
        last_pos: Vec2::ZERO,
        last_target: None,
        pressed: [false; FORWARDED_BUTTONS.len()],
    });
}

/// The 3×3 screen homography of a layer's composite matrix: the model maps
/// plane points `(x, y, 0, 1)` to homogeneous screen `(X, Y, ·, W)`, so only
/// the x/y/w rows of the x/y/w columns matter (z is flattened at composite).
fn screen_homography(m: &Mat4) -> Mat3 {
    Mat3::from_cols(
        Vec3::new(m.x_axis.x, m.x_axis.y, m.x_axis.w),
        Vec3::new(m.y_axis.x, m.y_axis.y, m.y_axis.w),
        Vec3::new(m.w_axis.x, m.w_axis.y, m.w_axis.w),
    )
}

/// Map a physical-px screen position back onto the layer plane (untransformed
/// physical px). `None` when the plane is edge-on (degenerate homography),
/// the recovered point sits at infinity, or it lies behind the eye (past the
/// vanishing line, where the quad is not visible). A backface (negative
/// determinant) still inverts — backfaces render and stay clickable.
pub fn invert_screen_to_plane(model: &Mat4, screen: Vec2) -> Option<Vec2> {
    let h = screen_homography(model);
    if h.determinant().abs() < 1e-6 {
        return None; // Edge-on: the quad projects to a line.
    }
    let p = h.inverse() * screen.extend(1.0);
    if p.z.abs() < 1e-6 {
        return None; // Point at infinity on the plane.
    }
    let local = p.truncate() / p.z;
    // Forward w at the recovered point must be positive: a screen point can
    // invert onto the plane's far side (behind the eye), which never renders.
    // w = (H · (x, y, 1)).z — the homography's third row.
    let w = h.x_axis.z * local.x + h.y_axis.z * local.y + h.z_axis.z;
    if w <= 0.0 {
        return None;
    }
    Some(local)
}

/// The nearest visually-transformed (non-identity matrix) layer root in
/// `entity`'s enclosing-or-self layer chain, if any. Climbs `ChildOf` first —
/// a picked leaf may be a text span outside the membership map.
fn transformed_root_of(
    entity: Entity,
    membership: &LayerMembership,
    matrices: &Query<&LayerTransform3dMatrix>,
    child_of: &Query<&ChildOf>,
) -> Option<Entity> {
    let member = crate::reconcile::climb(entity, child_of, |e| {
        membership.node_to_layer.contains_key(&e)
    })?;
    let mut root = *membership.node_to_layer.get(&member)?;
    loop {
        if matrices.get(root).is_ok_and(|m| !m.identity) {
            return Some(root);
        }
        root = (*membership.enclosing.get(&root)?)?;
    }
}

/// Whether `entity`'s enclosing-or-self layer chain passes through `layer`.
fn member_of_layer(
    entity: Entity,
    layer: Entity,
    membership: &LayerMembership,
    child_of: &Query<&ChildOf>,
) -> bool {
    let Some(member) = crate::reconcile::climb(entity, child_of, |e| {
        membership.node_to_layer.contains_key(&e)
    }) else {
        return false;
    };
    let mut root = match membership.node_to_layer.get(&member) {
        Some(&root) => root,
        None => return false,
    };
    loop {
        if root == layer {
            return true;
        }
        match membership.enclosing.get(&root) {
            Some(Some(outer)) => root = *outer,
            _ => return false,
        }
    }
}

/// Remap the window cursor into the topmost visually-transformed layer under
/// it and drive the virtual pointer there (`PointerInput` move/press/release,
/// the surface driver's contract). With no transformed layer under the
/// cursor — or no transformed layers at all — the pointer parks off-bounds
/// and releases owed presses.
///
/// Scheduled before `bevy_picking`'s input processing so the new location is
/// consumed the same frame.
#[allow(clippy::too_many_arguments, clippy::type_complexity)]
pub fn drive_transform3d_pointer(
    mut state: ResMut<Transform3dPointer>,
    layers: Query<
        (
            Entity,
            &ComputedNode,
            &UiGlobalTransform,
            &LayerTransform3dMatrix,
        ),
        With<PromotedLayer>,
    >,
    ui_stack: Res<UiStack>,
    pointers: Query<(&PointerId, &PointerLocation)>,
    windows: Query<&Window, With<PrimaryWindow>>,
    buttons: Res<ButtonInput<MouseButton>>,
    mut input: MessageWriter<PointerInput>,
) {
    let pointer_id = state.id;
    // The real mouse pointer's live location carries exactly the window
    // target picking expects; its absence (cursor off-window) parks us.
    let mouse = pointers
        .iter()
        .find(|(id, _)| matches!(id, PointerId::Mouse))
        .and_then(|(_, loc)| loc.location().cloned());
    let scale = windows.single().map(|w| w.scale_factor()).unwrap_or(1.0);

    let candidate = mouse.as_ref().and_then(|loc| {
        let cursor = loc.position * scale;
        // Topmost-first: the highest UiStack (paint-order) index wins among
        // transformed layers whose inverted cursor lands in their border box.
        let mut best: Option<(usize, Entity, Vec2)> = None;
        for (root, computed, transform, matrix) in &layers {
            if matrix.identity {
                continue;
            }
            let size = computed.size();
            if size.x <= 0.5 || size.y <= 0.5 {
                continue;
            }
            let Some(local) = invert_screen_to_plane(&matrix.model, cursor) else {
                continue;
            };
            let min = transform.translation - size * 0.5;
            if local.x < min.x
                || local.y < min.y
                || local.x > min.x + size.x
                || local.y > min.y + size.y
            {
                continue;
            }
            let index = ui_stack.uinodes.iter().position(|&e| e == root);
            let index = index.unwrap_or(0);
            if best.is_none_or(|(top, _, _)| index > top) {
                best = Some((index, root, local));
            }
        }
        best.map(|(_, root, local)| (root, local, loc.target.clone()))
    });

    if let Some((root, local, target)) = candidate {
        let position = local / scale; // physical → logical window coords
        let location = Location {
            target: target.clone(),
            position,
        };
        let delta = position - state.last_pos;
        // A zero-delta move carries no information — unless we just remapped
        // into a (different) layer, where the move is what retargets picking.
        if delta != Vec2::ZERO || state.over_layer != Some(root) {
            input.write(PointerInput::new(
                pointer_id,
                location.clone(),
                PointerAction::Move { delta },
            ));
        }
        state.last_pos = position;
        state.last_target = Some(target);
        state.over_layer = Some(root);

        for (mb, pb) in FORWARDED_BUTTONS {
            if buttons.just_pressed(mb) {
                input.write(PointerInput::new(
                    pointer_id,
                    location.clone(),
                    PointerAction::Press(pb),
                ));
                state.pressed[button_index(pb)] = true;
            }
            if buttons.just_released(mb) && state.pressed[button_index(pb)] {
                input.write(PointerInput::new(
                    pointer_id,
                    location.clone(),
                    PointerAction::Release(pb),
                ));
                state.pressed[button_index(pb)] = false;
            }
        }
        return;
    }

    // Parked: release owed presses and move off-bounds once, so picking fires
    // `Out` and no control sticks (the surface driver's leave contract).
    if state.over_layer.is_some()
        && let Some(target) = state.last_target.clone()
    {
        let location = Location {
            target,
            position: Vec2::splat(-1.0),
        };
        for (_, pb) in FORWARDED_BUTTONS {
            if state.pressed[button_index(pb)] {
                input.write(PointerInput::new(
                    pointer_id,
                    location.clone(),
                    PointerAction::Release(pb),
                ));
                state.pressed[button_index(pb)] = false;
            }
        }
        input.write(PointerInput::new(
            pointer_id,
            location,
            PointerAction::Move { delta: Vec2::ZERO },
        ));
        state.over_layer = None;
        state.last_pos = Vec2::splat(-1.0);
    }
}

/// Scope picking hits around the transformed-layer remap: the real mouse
/// pointer must not hit members of visually-transformed layers (their layout
/// rects are stale), and the virtual pointer must hit *only* members of the
/// layer it is remapping into (its window location overlaps whatever else
/// layout put there). Runs between the picking backends and the hover-map
/// update, after the clip filter.
pub fn suppress_transformed_layer_hits(
    mut hits: MessageMutator<PointerHits>,
    state: Option<Res<Transform3dPointer>>,
    membership: Res<LayerMembership>,
    matrices: Query<&LayerTransform3dMatrix>,
    child_of: Query<&ChildOf>,
) {
    let Some(state) = state else {
        return;
    };
    for hits in hits.read() {
        if hits.pointer == state.id {
            match state.over_layer {
                Some(layer) => hits
                    .picks
                    .retain(|(entity, _)| member_of_layer(*entity, layer, &membership, &child_of)),
                // Parked off-bounds: nothing it reports is meaningful.
                None => hits.picks.clear(),
            }
        } else if matches!(hits.pointer, PointerId::Mouse) {
            hits.picks.retain(|(entity, _)| {
                transformed_root_of(*entity, &membership, &matrices, &child_of).is_none()
            });
        }
    }
}

/// Re-derive the legacy `Interaction` — and `RelativeCursorPosition` — for
/// members of visually-transformed layers from the virtual pointer
/// (`HoverMap` entry + press state + remapped location). `ui_focus_system`
/// computes both geometrically from the *real* cursor against the stale
/// layout rect ([`suppress_transformed_layer_hits`] never reaches it), so
/// without this the real pointer lights hover/press styling — and reports
/// drag positions — where layout put the subtree, not where it renders.
/// Runs before `apply_interaction_styles`/`collect_hover_events`/
/// `collect_pointer_events` so styling, enter/leave, and `onPointer*`
/// positions all see the corrected state.
#[allow(clippy::type_complexity, clippy::too_many_arguments)]
pub fn correct_transformed_interactions(
    state: Option<Res<Transform3dPointer>>,
    hover_map: Option<Res<HoverMap>>,
    pointers: Query<(&PointerId, &PointerPress, &PointerLocation)>,
    windows: Query<&Window, With<PrimaryWindow>>,
    membership: Res<LayerMembership>,
    matrices: Query<&LayerTransform3dMatrix>,
    child_of: Query<&ChildOf>,
    mut interactions: Query<(
        Entity,
        &mut Interaction,
        Option<&mut bevy::ui::RelativeCursorPosition>,
        Option<&ComputedNode>,
        Option<&UiGlobalTransform>,
    )>,
) {
    let Some(state) = state else {
        return;
    };
    // Fast path: no visually-transformed layer this frame → nothing to fix.
    if !matrices.iter().any(|m| !m.identity) {
        return;
    }
    let hovered = hover_map.as_ref().and_then(|map| map.get(&state.id));
    let virtual_pointer = pointers.iter().find(|(id, _, _)| **id == state.id);
    let pressed = virtual_pointer.is_some_and(|(_, press, _)| press.is_primary_pressed());
    // The remapped position in physical px (the space of node geometry) —
    // only meaningful while the pointer is remapped into a layer.
    let scale = windows.single().map(|w| w.scale_factor()).unwrap_or(1.0);
    let remapped_physical = state.over_layer.and_then(|_| {
        virtual_pointer
            .and_then(|(_, _, loc)| loc.location())
            .map(|loc| loc.position * scale)
    });
    for (entity, mut interaction, rel, computed, transform) in &mut interactions {
        if transformed_root_of(entity, &membership, &matrices, &child_of).is_none() {
            continue;
        }
        let over = hovered.is_some_and(|map| map.contains_key(&entity));
        let desired = if over {
            if pressed {
                Interaction::Pressed
            } else {
                Interaction::Hovered
            }
        } else {
            Interaction::None
        };
        interaction.set_if_neq(desired);
        // Remap the relative cursor from the virtual pointer's untransformed
        // position (centered convention, like `ui_focus_system`'s own write).
        if let Some(mut rel) = rel {
            let normalized = remapped_physical.and_then(|pos| {
                computed
                    .zip(transform)
                    .and_then(|(c, t)| c.normalize_point(*t, pos))
            });
            let next = bevy::ui::RelativeCursorPosition {
                cursor_over: over,
                normalized,
            };
            if rel.cursor_over != next.cursor_over || rel.normalized != next.normalized {
                *rel = next;
            }
        }
    }
}

/// The set of entities that belong to a visually-transformed layer this
/// frame — the members the window cursor scan must skip (their layout rects
/// are stale). Empty when no layer is transformed.
pub fn visually_transformed_members(
    membership: &LayerMembership,
    matrices: &Query<&LayerTransform3dMatrix>,
) -> bevy::platform::collections::HashSet<Entity> {
    let mut transformed_roots: Vec<Entity> = Vec::new();
    for (&root, _) in membership.enclosing.iter() {
        if matrices.get(root).is_ok_and(|m| !m.identity) {
            transformed_roots.push(root);
        }
    }
    if transformed_roots.is_empty() {
        return Default::default();
    }
    membership
        .node_to_layer
        .iter()
        .filter(|(_, own_root)| {
            // Walk the enclosing chain from the member's own root.
            let mut root = **own_root;
            loop {
                if transformed_roots.contains(&root) {
                    return true;
                }
                match membership.enclosing.get(&root) {
                    Some(Some(outer)) => root = *outer,
                    _ => return false,
                }
            }
        })
        .map(|(&node, _)| node)
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::protocol::{transform::Transform3d, transform::Transform3dOrigin};

    fn deg(
        v: f32,
    ) -> Option<crate::protocol::animatable::Animatable<crate::protocol::units::Angle>> {
        Some(crate::protocol::animatable::Animatable::Static(
            crate::protocol::units::Angle::from_radians(v.to_radians()),
        ))
    }

    /// Static-wrap a scalar channel value.
    fn st(v: f32) -> Option<crate::protocol::animatable::Animatable<f32>> {
        Some(crate::protocol::animatable::Animatable::Static(v))
    }

    /// Static-wrap an origin axis.
    fn ax(
        l: crate::protocol::units::Length,
    ) -> crate::protocol::animatable::Animatable<crate::protocol::units::Length> {
        crate::protocol::animatable::Animatable::Static(l)
    }

    /// Forward-project plane points through a perspective matrix, invert the
    /// screen position, and recover the original plane point.
    #[test]
    fn homography_inversion_round_trips() {
        let params = Transform3d {
            perspective: st(600.0),
            rotate_y: deg(35.0),
            rotate_x: deg(-12.0),
            translate_x: st(30.0),
            scale: st(1.2),
            origin: Some(Transform3dOrigin {
                x: ax(crate::protocol::units::Length::Percent(25.0)),
                y: ax(crate::protocol::units::Length::Percent(50.0)),
            }),
            ..Default::default()
        };
        let min = Vec2::new(300.0, 200.0);
        let size = Vec2::new(240.0, 160.0);
        let m = super::super::transform3d::build_transform3d_matrix(&params, min, size, 1.0);
        for local in [
            min,
            min + size,
            min + size * 0.5,
            min + Vec2::new(10.0, 100.0),
        ] {
            let screen = m.project_point3(local.extend(0.0)).truncate();
            let back = invert_screen_to_plane(&m, screen).expect("invertible");
            assert!(back.abs_diff_eq(local, 1e-2), "{local} → {screen} → {back}");
        }
    }

    /// An edge-on plane (rotateY 90°) yields no hit; a backface (rotated past
    /// 90°) still inverts.
    #[test]
    fn edge_on_misses_backface_hits() {
        let base = Transform3d {
            origin: Some(Transform3dOrigin {
                x: ax(crate::protocol::units::Length::Percent(50.0)),
                y: ax(crate::protocol::units::Length::Percent(50.0)),
            }),
            ..Default::default()
        };
        let min = Vec2::ZERO;
        let size = Vec2::new(100.0, 100.0);

        let edge_on = Transform3d {
            rotate_y: deg(90.0),
            ..base.clone()
        };
        let m = super::super::transform3d::build_transform3d_matrix(&edge_on, min, size, 1.0);
        assert!(invert_screen_to_plane(&m, Vec2::new(50.0, 50.0)).is_none());

        let backface = Transform3d {
            rotate_y: deg(150.0),
            perspective: st(800.0),
            ..base
        };
        let m = super::super::transform3d::build_transform3d_matrix(&backface, min, size, 1.0);
        let screen = m.project_point3(Vec3::new(30.0, 40.0, 0.0)).truncate();
        let back = invert_screen_to_plane(&m, screen).expect("backface inverts");
        assert!(back.abs_diff_eq(Vec2::new(30.0, 40.0), 1e-2));
    }

    /// Suppression: the mouse loses hits on transformed-layer members (but
    /// keeps unrelated ones); the virtual pointer keeps only members of the
    /// layer it is over, and everything when parked is dropped.
    #[test]
    fn suppression_scopes_hits_per_pointer() {
        use bevy::ecs::system::RunSystemOnce;
        use bevy::picking::backend::HitData;

        let mut world = World::new();
        world.init_resource::<Messages<PointerHits>>();
        let camera = world.spawn_empty().id();

        let transformed_root = world
            .spawn(LayerTransform3dMatrix {
                model: Mat4::from_rotation_y(0.5),
                identity: false,
            })
            .id();
        let member = world.spawn(ChildOf(transformed_root)).id();
        let unrelated = world.spawn_empty().id();

        let mut membership = LayerMembership::default();
        membership
            .node_to_layer
            .insert(transformed_root, transformed_root);
        membership.node_to_layer.insert(member, transformed_root);
        membership.enclosing.insert(transformed_root, None);
        world.insert_resource(membership);

        let virtual_id = PointerId::Custom(TRANSFORM3D_POINTER_UUID);
        world.insert_resource(Transform3dPointer {
            id: virtual_id,
            over_layer: Some(transformed_root),
            last_pos: Vec2::ZERO,
            last_target: None,
            pressed: [false; 3],
        });

        let send = |world: &mut World, pointer: PointerId, entities: &[Entity]| {
            let picks = entities
                .iter()
                .map(|&e| (e, HitData::new(camera, 0.0, None, None)))
                .collect();
            world
                .resource_mut::<Messages<PointerHits>>()
                .write(PointerHits::new(pointer, picks, 0.5));
        };
        let survivors = |world: &mut World| -> Vec<(PointerId, Vec<Entity>)> {
            world
                .resource_mut::<Messages<PointerHits>>()
                .drain()
                .map(|h| (h.pointer, h.picks.into_iter().map(|(e, _)| e).collect()))
                .collect()
        };

        // Mouse: member dropped, unrelated kept.
        send(&mut world, PointerId::Mouse, &[member, unrelated]);
        // Virtual pointer over the layer: member kept, unrelated dropped.
        send(&mut world, virtual_id, &[member, unrelated]);
        world
            .run_system_once(suppress_transformed_layer_hits)
            .unwrap();
        let got = survivors(&mut world);
        assert_eq!(got[0], (PointerId::Mouse, vec![unrelated]));
        assert_eq!(got[1], (virtual_id, vec![member]));

        // Parked virtual pointer: everything dropped.
        world.resource_mut::<Transform3dPointer>().over_layer = None;
        send(&mut world, virtual_id, &[member, unrelated]);
        world
            .run_system_once(suppress_transformed_layer_hits)
            .unwrap();
        let got = survivors(&mut world);
        assert_eq!(got[0].1, Vec::<Entity>::new());
    }

    /// Interaction correction: a transformed-layer member follows the virtual
    /// pointer's hover map (Hovered / Pressed / None); untransformed nodes
    /// are untouched.
    #[test]
    fn interaction_correction_follows_virtual_pointer() {
        use bevy::ecs::entity::EntityHashMap;
        use bevy::ecs::system::RunSystemOnce;
        use bevy::picking::backend::HitData;

        let mut world = World::new();
        let camera = world.spawn_empty().id();
        let root = world
            .spawn(LayerTransform3dMatrix {
                model: Mat4::from_rotation_y(0.5),
                identity: false,
            })
            .id();
        let member = world.spawn((ChildOf(root), Interaction::None)).id();
        let outside = world.spawn(Interaction::Hovered).id();

        let mut membership = LayerMembership::default();
        membership.node_to_layer.insert(root, root);
        membership.node_to_layer.insert(member, root);
        membership.enclosing.insert(root, None);
        world.insert_resource(membership);

        let virtual_id = PointerId::Custom(TRANSFORM3D_POINTER_UUID);
        world.spawn((virtual_id, PointerPress::default()));
        world.insert_resource(Transform3dPointer {
            id: virtual_id,
            over_layer: Some(root),
            last_pos: Vec2::ZERO,
            last_target: None,
            pressed: [false; 3],
        });

        // Virtual pointer hovers the member → Hovered.
        let mut hover = HoverMap::default();
        let mut entry: EntityHashMap<HitData> = EntityHashMap::default();
        entry.insert(member, HitData::new(camera, 0.0, None, None));
        hover.insert(virtual_id, entry);
        world.insert_resource(hover);
        world
            .run_system_once(correct_transformed_interactions)
            .unwrap();
        assert_eq!(
            *world.get::<Interaction>(member).unwrap(),
            Interaction::Hovered
        );
        assert_eq!(
            *world.get::<Interaction>(outside).unwrap(),
            Interaction::Hovered,
            "nodes outside transformed layers are untouched"
        );

        // Empty hover entry → the stale-rect Interaction the real pointer set
        // geometrically is cleared.
        if let Some(mut i) = world.get_mut::<Interaction>(member) {
            *i = Interaction::Hovered;
        }
        world.insert_resource({
            let mut hover = HoverMap::default();
            hover.insert(virtual_id, EntityHashMap::default());
            hover
        });
        world
            .run_system_once(correct_transformed_interactions)
            .unwrap();
        assert_eq!(
            *world.get::<Interaction>(member).unwrap(),
            Interaction::None
        );
    }
}
