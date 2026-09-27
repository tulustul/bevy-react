//! [`StyleDirty`] — which style properties a change touched.

use super::props::CoreId;
use super::registry::PropId;

/// The most properties one registry holds (the [`StyleDirty`] bitset width).
pub(crate) const MAX_PROPERTIES: usize = 256;

/// Which style properties a delta touched (bit = [`PropId`]), or every
/// property ([`ALL`](Self::ALL) — a full re-apply). The registry turns it
/// into the writers to re-run
/// ([`StyleRegistry::writers_for`](super::StyleRegistry::writers_for)).
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Hash)]
pub struct StyleDirty([u64; MAX_PROPERTIES / 64]);

impl StyleDirty {
    /// Nothing touched.
    pub const NONE: Self = Self([0; MAX_PROPERTIES / 64]);
    /// Everything touched — full re-apply (create, a restyle).
    pub const ALL: Self = Self([u64::MAX; MAX_PROPERTIES / 64]);

    /// Whether any property of `other` is in the set.
    pub fn intersects(&self, other: &Self) -> bool {
        self.0.iter().zip(other.0).any(|(a, b)| a & b != 0)
    }

    pub fn insert(&mut self, id: PropId) {
        let i = id.0 as usize;
        self.0[i / 64] |= 1 << (i % 64);
    }

    pub fn contains(&self, id: PropId) -> bool {
        let i = id.0 as usize;
        self.0[i / 64] & (1 << (i % 64)) != 0
    }

    /// Whether the core property `id` is in the set.
    pub(crate) const fn contains_core(&self, id: CoreId) -> bool {
        let i = id as usize;
        self.0[i / 64] & (1 << (i % 64)) != 0
    }

    /// Whether any property at all was touched.
    pub fn any(&self) -> bool {
        self.0.iter().any(|w| *w != 0)
    }

    pub fn is_all(&self) -> bool {
        *self == Self::ALL
    }

    pub fn union(mut self, other: Self) -> Self {
        for (a, b) in self.0.iter_mut().zip(other.0) {
            *a |= b;
        }
        self
    }

    /// The touched property ids.
    pub fn ids(&self) -> impl Iterator<Item = PropId> + '_ {
        self.0.iter().enumerate().flat_map(|(w, &word)| {
            let mut bits = word;
            std::iter::from_fn(move || {
                (bits != 0).then(|| {
                    let b = bits.trailing_zeros() as usize;
                    bits &= bits - 1;
                    PropId((w * 64 + b) as u16)
                })
            })
        })
    }
}
