//! The thirteen card worlds — the table of ids, skies and key lights, and the
//! helpers the builders share (`figures.rs`, `heavens.rs`). Each card id here
//! must match an id in `ui/src/cards.ts` (React names the portal target
//! `card-<id>`; a test checks).
//!
//! The camera sits at z = 6 looking at the origin (34° fov), so a world fits
//! inside a radius of about 1.6.

use bevy::prelude::*;

use super::Diorama;
use super::figures::{chariot, emperor, empress, fool, magician, priestess, tower, wheel};
use super::heavens::{death, moon, star, sun, world};

pub(super) const fn rgb(r: u8, g: u8, b: u8) -> Srgba {
    Srgba::new(r as f32 / 255.0, g as f32 / 255.0, b as f32 / 255.0, 1.0)
}

/// The usual key light: upper left, in front.
const KEY: Vec3 = Vec3::new(-3.0, 4.0, 5.0);

pub const DIORAMAS: &[Diorama] = &[
    Diorama {
        id: "fool",
        sky: [rgb(26, 12, 38), rgb(150, 92, 70)],
        light: KEY,
        build: fool,
    },
    Diorama {
        id: "magician",
        sky: [rgb(30, 6, 14), rgb(140, 30, 40)],
        light: KEY,
        build: magician,
    },
    Diorama {
        id: "priestess",
        sky: [rgb(6, 8, 30), rgb(40, 60, 130)],
        light: KEY,
        build: priestess,
    },
    Diorama {
        id: "empress",
        sky: [rgb(24, 6, 22), rgb(120, 40, 90)],
        light: KEY,
        build: empress,
    },
    Diorama {
        id: "emperor",
        sky: [rgb(28, 8, 6), rgb(130, 50, 24)],
        light: KEY,
        build: emperor,
    },
    Diorama {
        id: "chariot",
        sky: [rgb(6, 12, 28), rgb(30, 80, 140)],
        light: KEY,
        build: chariot,
    },
    Diorama {
        id: "wheel",
        sky: [rgb(16, 6, 32), rgb(90, 40, 150)],
        light: KEY,
        build: wheel,
    },
    Diorama {
        id: "death",
        sky: [rgb(4, 2, 6), rgb(70, 30, 12)],
        light: KEY,
        build: death,
    },
    Diorama {
        id: "tower",
        sky: [rgb(18, 4, 8), rgb(90, 20, 40)],
        light: KEY,
        build: tower,
    },
    Diorama {
        id: "star",
        sky: [rgb(4, 14, 26), rgb(20, 90, 120)],
        light: KEY,
        build: star,
    },
    Diorama {
        id: "moon",
        sky: [rgb(6, 10, 24), rgb(50, 70, 110)],
        light: Vec3::new(5.0, 0.8, -0.6),
        build: moon,
    },
    Diorama {
        id: "sun",
        sky: [rgb(40, 14, 4), rgb(200, 110, 30)],
        light: KEY,
        build: sun,
    },
    Diorama {
        id: "world",
        sky: [rgb(4, 16, 22), rgb(20, 90, 90)],
        light: KEY,
        build: world,
    },
];

/// A faceted solid: flat normals catch the light face by face.
pub(super) fn faceted(mesh: impl Into<Mesh>) -> Mesh {
    mesh.into()
        .with_duplicated_vertices()
        .with_computed_flat_normals()
}

pub(super) fn ring(major: f32, minor: f32) -> Mesh {
    Torus {
        minor_radius: minor,
        major_radius: major,
    }
    .mesh()
    .minor_resolution(12)
    .major_resolution(96)
    .build()
}

#[cfg(test)]
mod tests {
    use super::DIORAMAS;

    /// React names each portal target `card-<id>` from `ui/src/cards.ts`:
    /// every card there needs a world here, and every world a card.
    #[test]
    fn every_card_has_a_world() {
        let cards = include_str!("../ui/src/cards.ts");
        let mut ids: Vec<&str> = cards
            .split("id: \"")
            .skip(1)
            .filter_map(|rest| rest.split('"').next())
            .collect();
        let mut worlds: Vec<&str> = DIORAMAS.iter().map(|d| d.id).collect();
        ids.sort_unstable();
        worlds.sort_unstable();
        assert_eq!(ids, worlds);
    }
}
