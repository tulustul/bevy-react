//! Pointer input for `<layer>` subtrees — the input half of the 3D-transform
//! story. The display node is an ordinary on-screen UI node, so the window
//! pointer hovers/hits IT; but the layer's *content* lives on the detached
//! companion tree, rendered into the layer texture by an offscreen camera —
//! invisible to every window hit-test (see the `<surface>` precedent in
//! [`crate::surface`]). This module maps the window cursor through the
//! display's (possibly 3D-transformed) quad back into texture space and drives
//! a dedicated virtual pointer over the companion tree, so buttons inside a
//! tilted card just work.
//!
//! ## The inverse mapping
//!
//! The layer vertex shader (`layer.wgsl`) maps a companion-space point `q`
//! (logical px, box top-left origin, z = 0) to the screen as
//! `screen = (M·(q, 0, 1)).xy / (M·(q, 0, 1)).w` — a 2D projective homography
//! of the z=0 plane. [`screen_to_layer_uv`] inverts exactly that homography
//! (built from `M`'s x/y/w rows with the z column dropped, since `q.z = 0`),
//! rejecting points behind the eye (`w' ≤ 0`, the far side of a >90° flip
//! under perspective), a degenerate (edge-on) quad, and points outside the
//! quad.
//!
//! ## Single-hop contract (nested layers)
//!
//! [`drive_layer_pointer`] reads the picking [`HoverMap`] for the WINDOW
//! pointer, so only displays on a window camera are candidates — i.e. the
//! OUTERMOST layer of any nesting. The virtual pointer then targets that
//! layer's texture, where bevy_ui's picking backend hit-tests the outer
//! companion tree. An inner `<layer>`'s display node inside that tree IS such
//! a hit — the inner display's own handlers/hover styles work — but nothing
//! re-maps the virtual pointer through the inner display into the inner
//! texture, so v1 leaves an inner layer's *interior* non-interactive
//! (chaining would take a pointer per nesting depth; deliberately deferred).

use bevy::camera::{ImageRenderTarget, NormalizedRenderTarget, RenderTarget as BevyRenderTarget};
use bevy::picking::hover::HoverMap;
use bevy::picking::pointer::{Location, PointerAction, PointerId, PointerInput};
use bevy::prelude::*;
use bevy::ui::ComputedNode;

use super::{LayerCamera, LayerTransform, RLayer};
use crate::surface::{FORWARDED_BUTTONS, button_index};

/// The fixed id of the single virtual pointer that drives clicks inside
/// `<layer>` subtrees. Distinct from [`crate::surface`]'s so the two virtual
/// paths never alias.
const LAYER_POINTER_UUID: uuid::Uuid =
    uuid::Uuid::from_u128(0xB5_2E_5F_AC_E0_00_00_00_00_00_00_00_00_00_02);

/// Holds the id of the single virtual pointer driving clicks inside `<layer>`
/// subtrees, plus the frame-to-frame state the driver needs — the layer twin
/// of [`crate::surface::SurfaceVirtualPointer`].
#[derive(Resource)]
pub struct LayerVirtualPointer {
    /// The custom pointer id. Picking events carrying this id originated from
    /// the window cursor mapped through a `<layer>` display quad.
    pub id: PointerId,
    /// Last texture-space position (logical px) we drove the pointer to.
    last_pos: Vec2,
    /// The image render target the pointer currently sits on (the hovered
    /// layer's texture + its display scale factor — cloned from the layer
    /// camera's target so [`Location`] equality with it is exact), kept so we
    /// can park the pointer off-bounds (firing `Out`/releases) when the
    /// cursor leaves every layer.
    over_target: Option<ImageRenderTarget>,
    /// Per-button "a press was emitted whose release is still owed", indexed
    /// by [`button_index`].
    pressed: [bool; FORWARDED_BUTTONS.len()],
}

/// Spawn the virtual layer pointer at startup and publish its id.
pub fn init_layer_pointer(mut commands: Commands) {
    let id = PointerId::Custom(LAYER_POINTER_UUID);
    // `PointerId` requires `PointerLocation`/`PointerPress`/`PointerInteraction`,
    // which are added automatically.
    commands.spawn(id);
    commands.insert_resource(LayerVirtualPointer {
        id,
        last_pos: Vec2::ZERO,
        over_target: None,
        pressed: [false; FORWARDED_BUTTONS.len()],
    });
}

/// A pointer [`Location`] on a layer's texture render target at `position`
/// (logical px — bevy_ui's picking backend multiplies by the target's scale
/// factor to reach the texture's physical space).
fn layer_location(target: &ImageRenderTarget, position: Vec2) -> Location {
    Location {
        target: NormalizedRenderTarget::Image(target.clone()),
        position,
    }
}

/// Drive the layer virtual pointer from the window cursor: find the topmost
/// `<layer>` display node under the window pointer (via the picking
/// [`HoverMap`] — the same signal the surface/cursor paths use; window
/// hit-tests can't see texture-space nodes), invert the display's 3D
/// transform ([`screen_to_layer_uv`]), and emit [`PointerInput`]
/// Move/Press/Release on the layer's texture target so bevy_ui's picking
/// backend hit-tests the companion tree there. Off the quad (or off every
/// layer): park the pointer off-bounds so picking fires `Out`, releasing any
/// press still owed — the same contract as
/// [`crate::surface::drive_surface_pointer`].
///
/// Scheduled in `PreUpdate` before `bevy_picking`'s input processing, like
/// the surface driver, so the emitted inputs are consumed this frame. The
/// [`HoverMap`] itself updates later in `PreUpdate`, so the display hit is
/// last frame's — one frame of hover latency, invisible at input rates.
pub fn drive_layer_pointer(
    mut state: ResMut<LayerVirtualPointer>,
    hover_map: Option<Res<HoverMap>>,
    displays: Query<(&ComputedNode, Option<&LayerTransform>), With<RLayer>>,
    cameras: Query<(&LayerCamera, &BevyRenderTarget)>,
    images: Res<Assets<Image>>,
    buttons: Res<ButtonInput<MouseButton>>,
    mut input: MessageWriter<PointerInput>,
) {
    let pointer_id = state.id;

    // The topmost `<layer>` display node under the WINDOW cursor (smallest
    // HitData depth), with its normalized in-node hit position. Only window-
    // camera UI ever lands in the Mouse pointer's hover map, so nested layers
    // resolve to the outermost display — the single-hop contract (see the
    // module docs).
    let hit = hover_map
        .as_ref()
        .and_then(|map| map.get(&PointerId::Mouse))
        .into_iter()
        .flatten()
        .filter_map(|(entity, data)| {
            let (computed, transform) = displays.get(*entity).ok()?;
            // UI-backend hits always carry a position: normalized node-relative,
            // (-0.5,-0.5) top-left to (0.5,0.5) bottom-right.
            let normalized = data.position?.truncate();
            Some((*entity, computed, transform, normalized, data.depth))
        })
        .min_by(|a, b| a.4.total_cmp(&b.4));

    if let Some((display, computed, transform, normalized, _)) = hit
        && let Some(target) =
            cameras
                .iter()
                .find(|(cam, _)| cam.0 == display)
                .and_then(|(_, target)| match target {
                    BevyRenderTarget::Image(image_target) => Some(image_target.clone()),
                    _ => None,
                })
        && let Some(texture) = images.get(&target.handle)
    {
        // Cursor relative to the box top-left, LOGICAL px — the space the
        // composed matrix works in.
        let logical = computed.size() * computed.inverse_scale_factor;
        let cursor_in_node = (normalized + 0.5) * logical;
        let matrix = transform.map(|t| t.0).unwrap_or(Mat4::IDENTITY);
        if let Some(uv) = screen_to_layer_uv(cursor_in_node, logical, &matrix) {
            // Texture-space position in LOGICAL px: the picking backend
            // multiplies by the target's scale factor to reach physical
            // texels, so divide the texture's physical size by it here.
            // (`drive_layers` keeps that scale synced to the display's.)
            let scale = if target.scale_factor > 0.0 {
                target.scale_factor
            } else {
                1.0
            };
            let position = uv * texture.size().as_vec2() / scale;
            let location = layer_location(&target, position);
            let delta = position - state.last_pos;
            // A zero-delta move carries no information — unless the target
            // changed, where the move is what retargets `PointerLocation`.
            if delta != Vec2::ZERO || state.over_target.as_ref() != Some(&target) {
                input.write(PointerInput::new(
                    pointer_id,
                    location.clone(),
                    PointerAction::Move { delta },
                ));
            }
            state.last_pos = position;
            state.over_target = Some(target);

            // Cross-layer transition edge: a press held over layer A while
            // the cursor lands directly on layer B in one frame means A's
            // owed release gets written here — at B's location/target.
            // Acceptable: the Move above already retargeted the pointer, so
            // picking fires `Out` on A's tree regardless.
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
    }

    // Inside the layout box but off the transformed quad, off every layer, or
    // cursor gone: park the pointer off-bounds so picking fires an `Out`, and
    // release every press still owed so a control never sticks.
    if let Some(target) = state.over_target.clone() {
        let location = layer_location(&target, Vec2::splat(-1.0));
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
        state.over_target = None;
    }
}

/// Map a window-cursor position inside a `<layer>` display node's layout box
/// to the layer texture's UV.
///
/// `cursor_in_node` is the cursor relative to the box's TOP-LEFT corner,
/// LOGICAL px; `size` the box's logical dimensions; `transform` the layer's
/// composed matrix ([`super::compose_transform`] — pass identity when the
/// [`LayerTransform`] component is absent).
///
/// Returns `None` when the point misses the (possibly transformed) quad:
/// outside `[0,1]²`, on a degenerate edge-on quad (singular homography), or
/// behind the eye (`w' ≤ 0` — the far side of a >90° flip under strong
/// perspective). A `Some` UV is clamped to `[0,1]` (boundary hits ride a tiny
/// epsilon so a click on the exact edge still lands).
pub(crate) fn screen_to_layer_uv(
    cursor_in_node: Vec2,
    size: Vec2,
    transform: &Mat4,
) -> Option<Vec2> {
    if size.x <= 0.0 || size.y <= 0.0 {
        return None;
    }
    // Edge tolerance for the [0,1]² containment check: a hit computed from a
    // forward-projected boundary point lands a few ulps outside — accept it
    // and clamp, so a click on the exact quad edge still registers.
    const EDGE_EPS: f32 = 1e-4;
    let accept = |uv: Vec2| -> Option<Vec2> {
        (uv.x >= -EDGE_EPS && uv.x <= 1.0 + EDGE_EPS && uv.y >= -EDGE_EPS && uv.y <= 1.0 + EDGE_EPS)
            .then(|| uv.clamp(Vec2::ZERO, Vec2::ONE))
    };
    if *transform == Mat4::IDENTITY {
        // Untransformed layer (the common case, and the [`LayerTransform`]-
        // absent contract): a plain linear map.
        return accept(cursor_in_node / size);
    }
    // The forward map of the box's z=0 plane (see the module docs / the
    // vertex-shader algebra in `layer.wgsl`) is the 2D projective homography
    //   (screen, 1) ~ H · (q, 1),
    // with H = M's x/y/w rows restricted to the (x, y, w) columns — the z
    // column drops out because q.z = 0. glam is column-major: cols 0, 1, 3 of
    // M, each truncated to components (x, y, w).
    let col = |c: Vec4| Vec3::new(c.x, c.y, c.w);
    let h = Mat3::from_cols(
        col(transform.x_axis),
        col(transform.y_axis),
        col(transform.w_axis),
    );
    // A (near-)singular H is an edge-on quad — zero apparent area, nothing to
    // hit. f32 `cos(90°.to_radians())` is ~4e-8, comfortably under this. This
    // is an EXACTLY-degenerate guard, not an angular cutoff: the determinant
    // scales with H's pixel magnitudes, so a near-edge-on quad on a large
    // layer passes it — and correctly resolves as a thin-sliver hit. Don't
    // tighten the epsilon expecting it to reject shallow angles.
    let det = h.determinant();
    if !det.is_finite() || det.abs() < f32::EPSILON {
        return None;
    }
    // H·(q,1) = w'·(screen,1) ⇒ H⁻¹·(screen,1) = (1/w')·(q,1): the recovered
    // z component is 1/w', so its SIGN is w''s sign — non-positive means the
    // eye-side ray meets the plane behind the eye (a >90° flip / a quad
    // pushed past the perspective distance), which is a miss, not a hit on
    // the mirrored far side.
    let q_h = h.inverse() * Vec3::new(cursor_in_node.x, cursor_in_node.y, 1.0);
    if !q_h.is_finite() || q_h.z <= 0.0 {
        return None;
    }
    accept(q_h.truncate() / q_h.z / size)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::layer::{LayerTransformSpec, compose_transform};

    /// Forward-project a box point through the layer matrix exactly like the
    /// vertex shader: `screen = (M·(q,0,1)).xy / w`. The tests build their
    /// cursor inputs with this, so the inverse is asserted against the real
    /// forward map, not a re-derivation.
    fn forward(m: &Mat4, q: Vec2) -> Vec2 {
        let p = *m * Vec4::new(q.x, q.y, 0.0, 1.0);
        assert!(
            p.w > 0.0,
            "forward-projected test point must be in front of the eye: {p:?}"
        );
        Vec2::new(p.x / p.w, p.y / p.w)
    }

    fn spec(json: &str) -> LayerTransformSpec {
        serde_json::from_str(json).expect("valid transform spec")
    }

    const SIZE: Vec2 = Vec2::new(200.0, 100.0);

    /// The identity transform is a plain linear map: uv = cursor / size,
    /// including the exact corners.
    #[test]
    fn identity_maps_linearly() {
        let m = Mat4::IDENTITY;
        assert_eq!(
            screen_to_layer_uv(Vec2::new(50.0, 25.0), SIZE, &m),
            Some(Vec2::new(0.25, 0.25))
        );
        assert_eq!(
            screen_to_layer_uv(Vec2::ZERO, SIZE, &m),
            Some(Vec2::ZERO),
            "top-left corner is uv (0,0)"
        );
        assert_eq!(
            screen_to_layer_uv(SIZE, SIZE, &m),
            Some(Vec2::ONE),
            "bottom-right corner is uv (1,1)"
        );
    }

    /// Identity + a cursor outside the box: a miss, not a clamped hit.
    #[test]
    fn identity_outside_box_is_none() {
        let m = Mat4::IDENTITY;
        assert_eq!(screen_to_layer_uv(Vec2::new(-5.0, 50.0), SIZE, &m), None);
        assert_eq!(screen_to_layer_uv(Vec2::new(205.0, 50.0), SIZE, &m), None);
        assert_eq!(screen_to_layer_uv(Vec2::new(100.0, 108.0), SIZE, &m), None);
    }

    /// The known-rotation round trip: forward-project box points through the
    /// SAME composed matrix the shader gets (perspective + rotateY), feed the
    /// screen points back in, and recover the original UVs within 1e-3.
    #[test]
    fn perspective_rotate_y_round_trips() {
        let m = compose_transform(&spec(r#"{ "perspective": 500, "rotateY": 40 }"#), SIZE);
        for q in [
            Vec2::new(150.0, 30.0),
            Vec2::new(10.0, 90.0),
            Vec2::new(100.0, 50.0), // the (fixed) center
            Vec2::ZERO,             // corners round-trip too
            SIZE,
        ] {
            let uv = screen_to_layer_uv(forward(&m, q), SIZE, &m)
                .unwrap_or_else(|| panic!("{q:?} projects onto the quad"));
            let want = q / SIZE;
            assert!(
                (uv - want).abs().max_element() < 1e-3,
                "round trip for {q:?}: got {uv:?}, want {want:?}"
            );
        }
    }

    /// A screen point that projects OFF the quad (the forward image of a point
    /// outside the box) is a miss — uv out of `[0,1]²`.
    #[test]
    fn point_off_the_transformed_quad_is_none() {
        let m = compose_transform(&spec(r#"{ "perspective": 500, "rotateY": 40 }"#), SIZE);
        let off = forward(&m, Vec2::new(260.0, 50.0)); // well outside the 200-wide box
        assert_eq!(screen_to_layer_uv(off, SIZE, &m), None);
    }

    /// `rotateY: 90` turns the quad edge-on: the homography degenerates and
    /// every cursor is a miss — including a point on the collapsed center
    /// line, where a naive inverse would "hit".
    #[test]
    fn rotate_y_90_edge_on_is_none() {
        let m = compose_transform(&spec(r#"{ "rotateY": 90 }"#), SIZE);
        assert_eq!(screen_to_layer_uv(Vec2::new(120.0, 50.0), SIZE, &m), None);
        assert_eq!(
            screen_to_layer_uv(Vec2::new(100.0, 50.0), SIZE, &m),
            None,
            "even the collapsed center line is a miss on a degenerate quad"
        );
    }

    /// A quad pushed entirely behind the eye (translateZ past the perspective
    /// distance flips `w` negative for every point) never registers a hit.
    #[test]
    fn behind_the_eye_is_none() {
        let m = compose_transform(&spec(r#"{ "perspective": 100, "translateZ": 200 }"#), SIZE);
        assert_eq!(screen_to_layer_uv(Vec2::new(100.0, 50.0), SIZE, &m), None);
        assert_eq!(screen_to_layer_uv(Vec2::new(10.0, 10.0), SIZE, &m), None);
    }

    // --- the virtual-pointer driver -----------------------------------------

    use bevy::camera::{ImageRenderTarget, RenderTarget as BevyRenderTarget};
    use bevy::ecs::entity::EntityHashMap;
    use bevy::picking::backend::HitData;
    use bevy::render::render_resource::TextureFormat;

    /// A headless app wired for [`drive_layer_pointer`] alone: manual
    /// [`HoverMap`]/[`ButtonInput`] resources stand in for the picking/input
    /// plugins, and emitted [`PointerInput`] messages are drained per frame.
    fn driver_app() -> App {
        let mut app = App::new();
        app.add_plugins((MinimalPlugins, AssetPlugin::default()));
        app.init_asset::<Image>();
        app.init_resource::<ButtonInput<MouseButton>>();
        app.init_resource::<HoverMap>();
        app.add_message::<PointerInput>();
        app.add_systems(Startup, init_layer_pointer);
        app.add_systems(Update, drive_layer_pointer);
        app
    }

    /// Spawn a bound display: `RLayer` + stamped `ComputedNode` (physical px +
    /// inverse scale factor) + a layer camera targeting a fresh texture of
    /// `tex` physical px at `scale_factor`. Returns (display, texture handle).
    fn spawn_display(
        app: &mut App,
        physical: Vec2,
        inverse_scale_factor: f32,
        tex: UVec2,
        scale_factor: f32,
    ) -> (Entity, Handle<Image>) {
        let image = Image::new_target_texture(tex.x, tex.y, TextureFormat::Rgba8UnormSrgb, None);
        let handle = app.world_mut().resource_mut::<Assets<Image>>().add(image);
        let companion = app.world_mut().spawn_empty().id();
        let display = app
            .world_mut()
            .spawn((
                RLayer {
                    companion,
                    effect: "none".into(),
                },
                ComputedNode {
                    size: physical,
                    inverse_scale_factor,
                    ..Default::default()
                },
            ))
            .id();
        app.world_mut().spawn((
            LayerCamera(display),
            BevyRenderTarget::Image(ImageRenderTarget {
                handle: handle.clone(),
                scale_factor,
            }),
        ));
        (display, handle)
    }

    /// Point the given pointer's hover map at `entity` with a normalized
    /// in-node hit position ((-0.5,-0.5) top-left .. (0.5,0.5) bottom-right).
    fn set_hover(app: &mut App, pointer: PointerId, entity: Entity, normalized: Vec2) {
        let mut hovered = EntityHashMap::default();
        hovered.insert(
            entity,
            HitData::new(Entity::PLACEHOLDER, 0.0, Some(normalized.extend(0.0)), None),
        );
        let mut map = HoverMap::default();
        map.insert(pointer, hovered);
        app.insert_resource(map);
    }

    /// Drain the `PointerInput` messages the last update emitted.
    fn drain_inputs(app: &mut App) -> Vec<PointerInput> {
        app.world_mut()
            .resource_mut::<Messages<PointerInput>>()
            .drain()
            .collect()
    }

    /// The image target inside a location, or a panic for anything else.
    fn image_target(location: &Location) -> &ImageRenderTarget {
        match &location.target {
            NormalizedRenderTarget::Image(target) => target,
            other => panic!("expected an image target, got {other:?}"),
        }
    }

    /// Hovering an untransformed display forwards a Move at the linear
    /// texture position; press/release forward at the same spot and the
    /// owed-press bookkeeping tracks them.
    #[test]
    fn driver_forwards_move_press_release_at_texture_position() {
        let mut app = driver_app();
        app.update(); // Startup: init the pointer resource.
        let (display, handle) = spawn_display(
            &mut app,
            Vec2::new(200.0, 100.0),
            1.0,
            UVec2::new(200, 100),
            1.0,
        );

        // Cursor at normalized (-0.25, 0) = logical (50, 50) in a 200x100 box.
        set_hover(&mut app, PointerId::Mouse, display, Vec2::new(-0.25, 0.0));
        app.update();
        let inputs = drain_inputs(&mut app);
        let pointer_id = app.world().resource::<LayerVirtualPointer>().id;
        assert_eq!(inputs.len(), 1, "one Move: {inputs:?}");
        assert_eq!(inputs[0].pointer_id, pointer_id);
        assert!(matches!(inputs[0].action, PointerAction::Move { .. }));
        assert_eq!(inputs[0].location.position, Vec2::new(50.0, 50.0));
        assert_eq!(image_target(&inputs[0].location).handle, handle);

        // Left press forwards a Press at the same location (no repeat Move —
        // the cursor didn't move).
        app.world_mut()
            .resource_mut::<ButtonInput<MouseButton>>()
            .press(MouseButton::Left);
        app.update();
        let inputs = drain_inputs(&mut app);
        assert_eq!(inputs.len(), 1, "one Press: {inputs:?}");
        assert!(matches!(
            inputs[0].action,
            PointerAction::Press(bevy::picking::pointer::PointerButton::Primary)
        ));
        assert_eq!(inputs[0].location.position, Vec2::new(50.0, 50.0));

        // Release forwards the owed Release.
        {
            let mut buttons = app.world_mut().resource_mut::<ButtonInput<MouseButton>>();
            buttons.clear();
            buttons.release(MouseButton::Left);
        }
        app.update();
        let inputs = drain_inputs(&mut app);
        assert_eq!(inputs.len(), 1, "one Release: {inputs:?}");
        assert!(matches!(
            inputs[0].action,
            PointerAction::Release(bevy::picking::pointer::PointerButton::Primary)
        ));
    }

    /// On a hidpi display (scale 2), the forwarded position stays in the
    /// texture's LOGICAL px and the location target carries the camera's
    /// scale factor — the picking backend multiplies the two back into
    /// physical texels, so getting either wrong misses by 2x.
    #[test]
    fn driver_positions_are_logical_under_hidpi_scale() {
        let mut app = driver_app();
        app.update();
        // Physical 400x200 at scale 2 (inverse 0.5) → logical 200x100.
        let (display, _) = spawn_display(
            &mut app,
            Vec2::new(400.0, 200.0),
            0.5,
            UVec2::new(400, 200),
            2.0,
        );

        set_hover(&mut app, PointerId::Mouse, display, Vec2::new(-0.25, 0.0));
        app.update();
        let inputs = drain_inputs(&mut app);
        assert_eq!(inputs.len(), 1, "one Move: {inputs:?}");
        assert_eq!(
            inputs[0].location.position,
            Vec2::new(50.0, 50.0),
            "logical px, not physical texels"
        );
        assert_eq!(
            image_target(&inputs[0].location).scale_factor,
            2.0,
            "the location target rides the camera's synced scale factor"
        );
    }

    /// A 3D-transformed display maps the cursor through the INVERSE of the
    /// composed matrix: hovering the forward-projected image of a texture
    /// point recovers that point.
    #[test]
    fn driver_inverts_the_layer_transform() {
        let mut app = driver_app();
        app.update();
        let logical = Vec2::new(200.0, 100.0);
        let (display, _) = spawn_display(&mut app, logical, 1.0, UVec2::new(200, 100), 1.0);
        let m = compose_transform(&spec(r#"{ "perspective": 500, "rotateY": 40 }"#), logical);
        app.world_mut()
            .entity_mut(display)
            .insert(LayerTransform(m));

        // The screen image of texture point (150, 30), as a normalized hit.
        let screen = forward(&m, Vec2::new(150.0, 30.0));
        set_hover(&mut app, PointerId::Mouse, display, screen / logical - 0.5);
        app.update();
        let inputs = drain_inputs(&mut app);
        assert_eq!(inputs.len(), 1, "one Move: {inputs:?}");
        let position = inputs[0].location.position;
        assert!(
            (position - Vec2::new(150.0, 30.0)).abs().max_element() < 1e-2,
            "inverse-mapped position: {position:?}"
        );
    }

    /// Inside the layout box but OFF the transformed quad (the box corner a
    /// receding edge no longer covers): the pointer parks off-bounds and any
    /// owed press is released — a control can never stick pressed.
    #[test]
    fn driver_parks_and_releases_when_cursor_leaves_the_quad() {
        let mut app = driver_app();
        app.update();
        let logical = Vec2::new(200.0, 100.0);
        let (display, handle) = spawn_display(&mut app, logical, 1.0, UVec2::new(200, 100), 1.0);
        let m = compose_transform(&spec(r#"{ "perspective": 500, "rotateY": 40 }"#), logical);
        app.world_mut()
            .entity_mut(display)
            .insert(LayerTransform(m));

        // Over the quad (its fixed center), pressed.
        set_hover(&mut app, PointerId::Mouse, display, Vec2::ZERO);
        app.world_mut()
            .resource_mut::<ButtonInput<MouseButton>>()
            .press(MouseButton::Left);
        app.update();
        let inputs = drain_inputs(&mut app);
        assert!(
            inputs
                .iter()
                .any(|i| matches!(i.action, PointerAction::Press(_))),
            "press forwarded over the quad: {inputs:?}"
        );

        // Still inside the box, but past the receding right edge (x=198 of
        // 200; the rotated quad's right edge sits near x≈168 at mid-height).
        app.world_mut()
            .resource_mut::<ButtonInput<MouseButton>>()
            .clear();
        set_hover(&mut app, PointerId::Mouse, display, Vec2::new(0.49, 0.0));
        app.update();
        let inputs = drain_inputs(&mut app);
        assert_eq!(inputs.len(), 2, "Release + parking Move: {inputs:?}");
        assert!(matches!(inputs[0].action, PointerAction::Release(_)));
        assert_eq!(image_target(&inputs[0].location).handle, handle);
        assert!(matches!(inputs[1].action, PointerAction::Move { .. }));
        assert_eq!(
            inputs[1].location.position,
            Vec2::splat(-1.0),
            "parked off-bounds so picking fires Out"
        );

        // Fully off the layer afterwards: nothing more to emit (already parked).
        app.insert_resource(HoverMap::default());
        app.update();
        assert!(drain_inputs(&mut app).is_empty());
    }

    /// SINGLE-HOP CONTRACT: the driver reads only the WINDOW pointer's hover
    /// map. A display hovered by some custom pointer (e.g. the layer pointer
    /// itself over a nested inner display) is never re-mapped — nested layer
    /// interiors stay non-interactive in v1.
    #[test]
    fn driver_ignores_non_window_pointer_hover() {
        let mut app = driver_app();
        app.update();
        let (display, _) = spawn_display(
            &mut app,
            Vec2::new(200.0, 100.0),
            1.0,
            UVec2::new(200, 100),
            1.0,
        );
        let custom = app.world().resource::<LayerVirtualPointer>().id;
        set_hover(&mut app, custom, display, Vec2::ZERO);
        app.update();
        assert!(
            drain_inputs(&mut app).is_empty(),
            "only HoverMap[Mouse] drives the layer pointer"
        );
    }

    /// Two overlapping displays hovered at once: the TOPMOST one (smallest
    /// `HitData::depth`) owns the virtual pointer; the one behind is ignored.
    #[test]
    fn driver_picks_the_topmost_display_by_depth() {
        let mut app = driver_app();
        app.update();
        let size = Vec2::new(200.0, 100.0);
        let (front, front_handle) = spawn_display(&mut app, size, 1.0, UVec2::new(200, 100), 1.0);
        let (back, _) = spawn_display(&mut app, size, 1.0, UVec2::new(200, 100), 1.0);

        // Front hovered at depth 0 via the helper; stack the back display
        // into the same hover map at a larger depth.
        set_hover(&mut app, PointerId::Mouse, front, Vec2::new(-0.25, 0.0));
        app.world_mut()
            .resource_mut::<HoverMap>()
            .get_mut(&PointerId::Mouse)
            .unwrap()
            .insert(
                back,
                HitData::new(Entity::PLACEHOLDER, 5.0, Some(Vec3::ZERO), None),
            );

        app.update();
        let inputs = drain_inputs(&mut app);
        assert_eq!(
            inputs.len(),
            1,
            "one Move, on the front display: {inputs:?}"
        );
        assert_eq!(
            image_target(&inputs[0].location).handle,
            front_handle,
            "the min-depth display receives the virtual pointer"
        );
    }
}
