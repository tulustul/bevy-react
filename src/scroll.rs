//! Mouse-wheel scrolling for `overflow: scroll` nodes.
//!
//! `bevy_ui` clips an `OverflowAxis::Scroll` node's content and offsets its
//! children by the node's [`ScrollPosition`], but nothing drives that component
//! from input — Bevy leaves the wheel handling to the app. [`apply_scroll`] is
//! that handler: each frame it reads the accumulated wheel delta, finds the
//! scroll container under the cursor, and moves its `ScrollPosition`.

use bevy::input::mouse::{AccumulatedMouseScroll, MouseScrollUnit};
use bevy::prelude::*;
use bevy::ui::{ComputedNode, ScrollPosition, UiGlobalTransform, UiStack};
use bevy::window::PrimaryWindow;

use crate::plugin::PointerCapture;

/// Logical pixels scrolled per wheel "line" (mice report `Line` units; trackpads
/// report `Pixel`). A middling value that feels close to a typical desktop.
const LINE_HEIGHT: f32 = 20.0;

/// Whether a node opts into scrolling on either axis.
fn is_scroll_container(node: &Node) -> bool {
    node.overflow.x == OverflowAxis::Scroll || node.overflow.y == OverflowAxis::Scroll
}

/// Move the `ScrollPosition` of the scroll container under the cursor by the
/// frame's wheel delta. Runs in `PointerCaptureSet` after `collect_pointer_events`
/// so that, when it actually scrolls, it can flag the pointer as UI-owned and stop
/// world systems (e.g. a wheel-zoom camera) from also consuming the same wheel.
///
/// Target selection is by **geometry, filtered to real scroll containers**. Every
/// `Node` carries a `ScrollPosition` (it's a required component), so "has a
/// `ScrollPosition`" is meaningless — we must check `Node.overflow`. Among the nodes
/// that actually opt into scrolling, we hit-test the cursor against each one's own
/// rectangle with [`ComputedNode::contains_point`] and take the topmost. This is
/// content-agnostic: whatever sits on top (text glyphs, images, child nodes) is
/// irrelevant because we only ever test the containers' rects. Bevy's layout clamps
/// the *applied* offset to `[0, max]`, so writing freely here never overscrolls.
pub fn apply_scroll(
    accumulated: Res<AccumulatedMouseScroll>,
    windows: Query<&Window, With<PrimaryWindow>>,
    ui_stack: Res<UiStack>,
    mut scrollables: Query<(
        &ComputedNode,
        &UiGlobalTransform,
        &Node,
        &mut ScrollPosition,
    )>,
    mut capture: ResMut<PointerCapture>,
) {
    if accumulated.delta == Vec2::ZERO {
        return;
    }
    let Ok(window) = windows.single() else {
        return;
    };
    let Some(cursor) = window.cursor_position() else {
        return;
    };
    // `ComputedNode`/`UiGlobalTransform` are in physical pixels; the window cursor is
    // logical with a top-left origin. Scaling matches them for a window-filling camera
    // (the default `Camera2d` this plugin spawns); a camera with a custom viewport
    // offset is not handled here.
    let cursor = cursor * window.scale_factor();

    // Wheel delta → logical pixels. A positive wheel delta scrolls the view up,
    // i.e. moves content down, i.e. *decreases* the scroll offset.
    let delta = match accumulated.unit {
        MouseScrollUnit::Line => accumulated.delta * LINE_HEIGHT,
        MouseScrollUnit::Pixel => accumulated.delta,
    };

    // `uinodes` is ordered back-to-front, so reversed is topmost-first: the first
    // scroll container whose rect contains the cursor wins. This also resolves nested
    // scroll areas correctly (an inner one sits later in the stack, so it's hit first).
    for &entity in ui_stack.uinodes.iter().rev() {
        if let Ok((computed, transform, node, mut pos)) = scrollables.get_mut(entity) {
            if is_scroll_container(node) && computed.contains_point(*transform, cursor) {
                // Clamp to the scrollable range so the offset can't accumulate past the
                // ends (otherwise you'd have to "unscroll" the slack before it moves).
                // Bevy clamps the offset it *applies* for rendering but never writes that
                // back to this component, so we must clamp it ourselves. `ComputedNode`
                // sizes are physical; the component is logical, so convert with
                // `inverse_scale_factor`. Mirrors `ui_layout_system`'s own formula.
                let max = (computed.content_size - computed.size + computed.scrollbar_size)
                    .max(Vec2::ZERO)
                    * computed.inverse_scale_factor;
                if node.overflow.x == OverflowAxis::Scroll {
                    pos.0.x = (pos.0.x - delta.x).clamp(0.0, max.x);
                }
                if node.overflow.y == OverflowAxis::Scroll {
                    pos.0.y = (pos.0.y - delta.y).clamp(0.0, max.y);
                }
                // The wheel was consumed by the UI this frame — let world-input systems
                // that honor `PointerCapture` (the orbit camera's wheel-zoom, etc.)
                // ignore it.
                capture.over_ui = true;
                break;
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use bevy::ecs::system::RunSystemOnce;

    /// Drive `apply_scroll` against a 200×100 scroll container centered at (300, 200)
    /// holding 300px of content (so the scroll range is `[0, 200]` logical), with a
    /// non-scrolling child node ("text") on top of it (also carrying a `ScrollPosition`,
    /// since every `Node` does). Starts the container at `start`, applies one `Line`
    /// wheel tick of `wheel`, and returns the container's resulting `ScrollPosition`
    /// plus whether the pointer was flagged as UI-owned.
    fn run(cursor: Vec2, start: Vec2, wheel: Vec2) -> (Vec2, bool) {
        let mut world = World::new();

        let mut window = Window::default();
        window.set_physical_cursor_position(Some(cursor.as_dvec2()));
        world.spawn((window, PrimaryWindow));

        let container = world
            .spawn((
                Node {
                    overflow: Overflow::scroll_y(),
                    ..default()
                },
                ComputedNode {
                    size: Vec2::new(200.0, 100.0),
                    content_size: Vec2::new(200.0, 300.0),
                    inverse_scale_factor: 1.0,
                    ..default()
                },
                UiGlobalTransform::from_translation(Vec2::new(300.0, 200.0)),
                ScrollPosition(start),
            ))
            .id();
        // A child "text" node fully inside the container. It is NOT a scroll container
        // (overflow visible) yet still carries a `ScrollPosition` — exactly the case
        // that broke before. It sits in front of the container in the stack.
        let child = world
            .spawn((
                Node::default(),
                ComputedNode {
                    size: Vec2::new(80.0, 20.0),
                    inverse_scale_factor: 1.0,
                    ..default()
                },
                UiGlobalTransform::from_translation(Vec2::new(300.0, 200.0)),
                ScrollPosition::default(),
            ))
            .id();

        // Back-to-front: container behind, child in front (so the child is hit first
        // when iterating topmost-first, and must be skipped for not opting into scroll).
        world.insert_resource(UiStack {
            uinodes: vec![container, child],
            partition: Vec::new(),
        });
        world.insert_resource(AccumulatedMouseScroll {
            unit: MouseScrollUnit::Line,
            delta: wheel,
        });
        world.insert_resource(PointerCapture::default());

        world.run_system_once(apply_scroll).unwrap();

        let pos = world.entity(container).get::<ScrollPosition>().unwrap().0;
        let over_ui = world.resource::<PointerCapture>().over_ui;
        (pos, over_ui)
    }

    #[test]
    fn scrolls_container_when_cursor_is_over_its_child_text() {
        // Cursor over the child "text"; wheel down (delta.y < 0) reveals lower content
        // → offset.y increases by LINE_HEIGHT, within the [0, 200] range.
        let (pos, over_ui) = run(Vec2::new(300.0, 200.0), Vec2::ZERO, Vec2::new(0.0, -1.0));
        assert_eq!(pos, Vec2::new(0.0, LINE_HEIGHT));
        assert!(over_ui, "scrolling should claim the pointer for the UI");
    }

    #[test]
    fn clamps_at_the_bottom() {
        // Near the end (190) + a 20px wheel-down tick would reach 210, but the max is
        // 200 (content 300 − size 100), so it clamps instead of accumulating slack.
        let (pos, _) = run(
            Vec2::new(300.0, 200.0),
            Vec2::new(0.0, 190.0),
            Vec2::new(0.0, -1.0),
        );
        assert_eq!(pos, Vec2::new(0.0, 200.0));
    }

    #[test]
    fn clamps_at_the_top() {
        // Near the start (10) + a 20px wheel-up tick would reach −10, but it clamps to 0.
        let (pos, _) = run(
            Vec2::new(300.0, 200.0),
            Vec2::new(0.0, 10.0),
            Vec2::new(0.0, 1.0),
        );
        assert_eq!(pos, Vec2::new(0.0, 0.0));
    }

    #[test]
    fn ignores_wheel_when_cursor_is_outside_the_container() {
        // In-window but outside the container's rect (x:200..400, y:150..250).
        let (pos, over_ui) = run(
            Vec2::new(50.0, 50.0),
            Vec2::new(0.0, 30.0),
            Vec2::new(0.0, -1.0),
        );
        assert_eq!(pos, Vec2::new(0.0, 30.0));
        assert!(!over_ui);
    }
}
