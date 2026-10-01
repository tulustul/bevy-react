//! What a style change invalidates: the closed [`Invalidation`] vocabulary
//! (owned by the core — it names engine stages), and each property's
//! declaration of it ([`Invalidate`]).

/// The pipeline stages a style change can invalidate. A property declares
/// the stages a change to it affects ([`Invalidate`]); the engine acts on
/// [`PAINT`](Self::PAINT) (re-capture the owning composited layer) and
/// [`PROMOTION`](Self::PROMOTION) (re-evaluate layer promotion). The other
/// stages are Bevy's own change detection's job — they are declared for
/// documentation and tooling.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Hash)]
pub struct Invalidation(pub u16);

impl Invalidation {
    /// Nothing: a change affects no pipeline stage (e.g. `cursor`).
    pub const NONE: Self = Self(0);
    /// The node's layout inputs (`Node`) change — a relayout.
    pub const LAYOUT: Self = Self(1 << 0);
    /// Text shaping inputs change — a re-shape.
    pub const RESHAPE: Self = Self(1 << 1);
    /// The node's painted pixels change: an enclosing cached layer must
    /// re-capture.
    pub const PAINT: Self = Self(1 << 2);
    /// Composite-time parameters of a promoted layer change (group alpha,
    /// the 3D matrix, filter params): the capture stays cached.
    pub const COMPOSITE: Self = Self(1 << 3);
    /// Whether the subtree composites as a layer may change.
    pub const PROMOTION: Self = Self(1 << 4);
    /// Stacking order changes.
    pub const STACKING: Self = Self(1 << 5);
    /// Pointer hit-testing changes.
    pub const HIT_TEST: Self = Self(1 << 6);
    /// A transition spec changes (the transition engine re-targets).
    pub const TRANSITION: Self = Self(1 << 7);
    /// An asset binding changes (a texture, a derived sampler variant).
    pub const ASSET: Self = Self(1 << 8);
    /// An inherited value changes: descendants re-resolve.
    pub const INHERIT: Self = Self(1 << 9);
    /// Everything (a full re-apply: a whole style replaced, a restyle).
    pub const ALL: Self = Self(u16::MAX);

    /// Both sets (usable in `static` initializers, unlike `|`).
    pub const fn union(self, other: Self) -> Self {
        Self(self.0 | other.0)
    }

    /// Whether every bit of `other` is set.
    pub const fn contains(self, other: Self) -> bool {
        self.0 & other.0 == other.0
    }

    /// Whether any bit of `other` is set.
    pub const fn intersects(self, other: Self) -> bool {
        self.0 & other.0 != 0
    }

    pub const fn is_empty(self) -> bool {
        self.0 == 0
    }
}

/// The node a change happens on, as a [`Invalidate::Computed`] fn sees it.
#[derive(Debug, Clone, Copy)]
pub struct NodeCtx<'a> {
    /// The node is a promoted layer root.
    pub promoted: bool,
    /// The element kind (`"node"`, `"text"`, a registered kind…).
    pub kind: &'a str,
}

/// A property's invalidation declaration: fixed, or computed per change
/// from the old value (`None` when absent — or unknown, e.g. on a
/// hover/press edge, where the fn must answer conservatively), the new
/// value, and the node.
pub enum Invalidate<T: 'static> {
    Fixed(Invalidation),
    Computed(fn(Option<&T>, Option<&T>, &NodeCtx<'_>) -> Invalidation),
}

impl<T> Invalidate<T> {
    /// This change's invalidation.
    pub fn eval(&self, old: Option<&T>, new: Option<&T>, node: &NodeCtx<'_>) -> Invalidation {
        match self {
            Invalidate::Fixed(inv) => *inv,
            Invalidate::Computed(f) => f(old, new, node),
        }
    }
}
