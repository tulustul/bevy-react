//! Demo 4 — **Animations**. Reanimated-style animations declared in React and
//! orchestrated by a Bevy system. The React side creates shared values
//! (`useSharedValue`), assigns drivers (`withTiming`/`withSpring`/`withRepeat`/
//! `withSequence`), and binds them onto `Animated.node` style props; the bundled
//! `ReactUiAnimationsPlugin` ticks every value each frame — per-frame work never
//! crosses back to JS.
//!
//! The animation engine is global (added by `ReactUiPlugin`) and everything this
//! demo shows lives in the React overlay, so this plugin has no systems and no 3D
//! scene of its own — the viewport stays empty behind the UI. The left-nav exposes
//! several animation examples under an "Animations" submenu, switched purely on the
//! React side.

use bevy::prelude::*;

pub struct AnimationsPlugin;

impl Plugin for AnimationsPlugin {
    fn build(&self, _app: &mut App) {
        // No bindings, no scene: the animation engine is global and the examples
        // are pure-UI. Selecting this demo simply leaves the 3D viewport empty.
    }
}
