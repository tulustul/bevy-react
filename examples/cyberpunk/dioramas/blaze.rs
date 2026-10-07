//! The difficulty street's fire: the burning sites, each waking at its own
//! level of heat (flames, smoke, embers and a flickering light — `Burn`,
//! fed by `motion::stoke`), and the sky and haze the fire lights up.

use bevy::prelude::*;
use bevy_react::PortalCamera;

use super::materials::{Emitter, SkyMaterial};
use super::motion::Heat;
use super::street::FACADE;
use super::{Burn, Ctx, rgb};

/// The fog at heat 0 (and in `STREET`) and at heat 3.
pub(super) const FOG: [Srgba; 2] = [rgb(26, 13, 18), rgb(66, 26, 14)];

/// The sky's horizon and glow at heat 0 and at heat 3 (see [`glare`]).
const CALM: [LinearRgba; 2] = [
    LinearRgba::new(0.05, 0.022, 0.045, 0.9),
    LinearRgba::new(0.22, 0.07, 0.16, 0.0),
];
const HOT: [LinearRgba; 2] = [
    LinearRgba::new(0.32, 0.09, 0.025, 0.9),
    LinearRgba::new(2.4, 0.6, 0.12, 0.0),
];

/// The sky over the street, which the fire lights up.
#[derive(Component)]
pub(super) struct Glare;

/// Light the sky and the haze with the heat (from `CALM` to `HOT`).
pub(super) fn glare(
    heat: Res<Heat>,
    sky: Query<&MeshMaterial3d<SkyMaterial>, With<Glare>>,
    mut skies: ResMut<Assets<SkyMaterial>>,
    mut cameras: Query<(&PortalCamera, &mut Camera, &mut DistanceFog)>,
) {
    if !heat.is_changed() {
        return;
    }
    let k = heat.now / 3.0;
    for material in &sky {
        if let Some(mut sky) = skies.get_mut(&material.0) {
            sky.horizon = CALM[0] * (1.0 - k) + HOT[0] * k;
            sky.sun = CALM[1] * (1.0 - k) + HOT[1] * k;
        }
    }
    let fog = Color::from(FOG[0].mix(&FOG[1], k));
    for (portal, mut camera, mut haze) in &mut cameras {
        if portal.0 == "card-difficulty" {
            haze.color = fog;
            camera.clear_color = ClearColorConfig::Custom(fog);
        }
    }
}

/// The sky over the street: calm at first, lit up by the fire (`glare`).
pub(super) fn sky(ctx: &mut Ctx) {
    let sky = ctx.sky(SkyMaterial {
        zenith: LinearRgba::new(0.004, 0.003, 0.009, 0.25),
        horizon: CALM[0],
        sun: CALM[1],
        sun_dir: Vec4::new(-0.05, 0.02, -1.0, 0.45),
    });
    ctx.insert(sky, Glare);
}

/// A fire: flames, smoke, embers and light, waking between heat `from`
/// and `full`.
struct Fire {
    at: Vec3,
    /// The base's radii (x, z).
    spread: Vec2,
    height: f32,
    size: f32,
    from: f32,
    full: f32,
    lumens: f32,
}

const FIRES: [Fire; 6] = [
    // A trash fire, burning at every level.
    Fire {
        at: Vec3::new(3.6, 0.85, -2.5),
        spread: Vec2::new(0.22, 0.22),
        height: 0.9,
        size: 0.13,
        from: -1.0,
        full: 0.0,
        lumens: 16_000.0,
    },
    // The wreck.
    Fire {
        at: Vec3::new(-2.8, 0.7, -10.0),
        spread: Vec2::new(1.0, 0.7),
        height: 2.2,
        size: 0.5,
        from: 0.0,
        full: 1.0,
        lumens: 80_000.0,
    },
    Fire {
        at: Vec3::new(2.8, 0.0, -18.0),
        spread: Vec2::new(1.4, 0.8),
        height: 2.6,
        size: 0.65,
        from: 1.0,
        full: 2.0,
        lumens: 120_000.0,
    },
    // A shopfront.
    Fire {
        at: Vec3::new(-7.2, 0.15, -21.0),
        spread: Vec2::new(1.5, 0.8),
        height: 3.2,
        size: 0.75,
        from: 1.0,
        full: 2.0,
        lumens: 120_000.0,
    },
    // The inferno across the street, and a floor burning over it.
    Fire {
        at: Vec3::new(0.0, 0.0, -32.0),
        spread: Vec2::new(7.0, 1.6),
        height: 6.0,
        size: 1.3,
        from: 2.0,
        full: 3.0,
        lumens: 450_000.0,
    },
    Fire {
        at: Vec3::new(-FACADE - 0.2, 10.0, -14.0),
        spread: Vec2::new(0.4, 1.4),
        height: 2.6,
        size: 0.6,
        from: 2.0,
        full: 3.0,
        lumens: 90_000.0,
    },
];

pub(super) fn fires(ctx: &mut Ctx) {
    for fire in FIRES {
        let burn = |base: f32, grow: f32| Burn {
            from: fire.from,
            full: fire.full,
            grow,
            base,
        };
        let big = fire.spread.x.max(fire.spread.y);
        let start = burn(0.0, 0.0).strength(0.0);

        let flame =
            Emitter::flame(fire.spread, fire.height, fire.size).count((70.0 + big * 40.0) as u32);
        let e = ctx.emit(flame, fire.at, start);
        ctx.insert(e, burn(fire.size, 0.15));

        let smoke = Emitter::plume(
            big * 0.6,
            12.0 + big * 3.0,
            1.4 + big * 0.7,
            LinearRgba::new(0.012, 0.009, 0.01, 0.72),
        )
        .count((24.0 + big * 8.0) as u32)
        .speed(0.14)
        .wind(Vec3::new(5.0 + big, 0.0, -2.0))
        .under(LinearRgba::rgb(0.5, 0.14, 0.04) * big.min(1.0));
        let e = ctx.emit(smoke, fire.at + Vec3::Y * fire.height * 0.5, start);
        ctx.insert(e, burn(smoke.size, 0.12));

        let embers =
            Emitter::embers(fire.spread, fire.height * 3.0).count((40.0 + big * 25.0) as u32);
        let e = ctx.emit(embers, fire.at, start);
        ctx.insert(e, burn(embers.size, 0.1));

        // (`stoke` sets its intensity, and hides it while the fire's out.)
        let light = ctx.light(
            rgb(255, 120, 40),
            0.0,
            12.0 + big * 6.0,
            fire.at + Vec3::Y * fire.height * 0.5,
        );
        ctx.insert(light, burn(fire.lumens, 0.2));
    }
}
