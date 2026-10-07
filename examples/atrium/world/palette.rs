//! The world's light, as data. A [`Moment`] (an hour of the day plus the
//! weather) becomes an [`Atmos`] — the one uniform every world shader reads
//! (`assets/atrium/common.wgsl`). The sun follows real solar geometry for an
//! alpine latitude; the colors come from keyframes over the sun's altitude
//! (night → blue hour → sunset → golden hour → noon), and the weather
//! desaturates, darkens and fogs them.
//!
//! Directions: −Z is west (the sunset is ahead of you), +X is north.

use std::f32::consts::TAU;

use bevy::prelude::*;
use bevy::render::render_resource::ShaderType;

/// The lake's latitude and the season's solar declination.
const LATITUDE: f32 = 47.0;
const DECLINATION: f32 = 14.0;

/// The palette uniform (see `common.wgsl` for what each `w` carries).
#[derive(Clone, Copy, Debug, Default, ShaderType)]
pub struct Atmos {
    pub zenith: Vec4,
    pub mid: Vec4,
    pub horizon: Vec4,
    pub glow: Vec4,
    pub sun_dir: Vec4,
    pub sun: Vec4,
    pub sun_light: Vec4,
    pub ambient: Vec4,
    pub fog: Vec4,
    pub water: Vec4,
    pub cloud_lit: Vec4,
    pub cloud_shade: Vec4,
    pub moon_dir: Vec4,
}

/// A point in a day, with weather. Every field eases independently, so a
/// change of place is a time-lapse: the hours between play out in the sky.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Moment {
    /// Local solar time, 0..24.
    pub hour: f32,
    /// Cloud cover, 0..1.
    pub cover: f32,
    pub rain: f32,
    pub snow: f32,
    pub aurora: f32,
}

impl Moment {
    /// Blend toward `to` by `k`, the hour along the shorter way round the
    /// clock.
    pub fn lerp(&self, to: &Self, k: f32) -> Self {
        Self {
            hour: (self.hour + hour_delta(self.hour, to.hour) * k).rem_euclid(24.0),
            cover: self.cover.lerp(to.cover, k),
            rain: self.rain.lerp(to.rain, k),
            snow: self.snow.lerp(to.snow, k),
            aurora: self.aurora.lerp(to.aurora, k),
        }
    }
}

/// Signed hours from `a` to `b`, the shorter way round.
pub fn hour_delta(a: f32, b: f32) -> f32 {
    (b - a + 12.0).rem_euclid(24.0) - 12.0
}

/// The unit direction to the sun at local solar `hour`.
pub fn sun_direction(hour: f32) -> Vec3 {
    let (lat, dec) = (LATITUDE.to_radians(), DECLINATION.to_radians());
    let h = (hour - 12.0) / 24.0 * TAU;
    let sin_alt = lat.sin() * dec.sin() + lat.cos() * dec.cos() * h.cos();
    let alt = sin_alt.clamp(-1.0, 1.0).asin();
    let cos_az =
        ((dec.sin() - sin_alt * lat.sin()) / (alt.cos() * lat.cos()).max(1e-4)).clamp(-1.0, 1.0);
    // Azimuth clockwise from north: east in the morning, west after noon.
    let az = if h > 0.0 {
        TAU - cos_az.acos()
    } else {
        cos_az.acos()
    };
    // North = +X, east = +Z.
    Vec3::new(alt.cos() * az.cos(), alt.sin(), alt.cos() * az.sin()).normalize()
}

/// One keyframe of the clear-sky palette, by the sun's altitude in degrees.
struct Key {
    alt: f32,
    zenith: u32,
    mid: u32,
    horizon: u32,
    glow: (u32, f32),
    sun: (u32, f32),
    sun_light: (u32, f32),
    ambient: (u32, f32),
    fog: (u32, f32),
    water: u32,
    cloud_lit: u32,
    cloud_shade: u32,
}

#[rustfmt::skip]
const KEYS: [Key; 7] = [
    Key { alt: -20.0, zenith: 0x03050c, mid: 0x060a18, horizon: 0x0c1328, glow: (0x0d1630, 0.4), sun: (0x000000, 0.0), sun_light: (0x000000, 0.0), ambient: (0x101830, 0.9), fog: (0x0a1122, 0.0005), water: 0x02040a, cloud_lit: 0x121a2e, cloud_shade: 0x070b16 },
    Key { alt: -8.0, zenith: 0x0b1433, mid: 0x1c2858, horizon: 0x384274, glow: (0x6a5288, 1.0), sun: (0x000000, 0.0), sun_light: (0x000000, 0.0), ambient: (0x1d2647, 1.0), fog: (0x2b3664, 0.0006), water: 0x070d20, cloud_lit: 0x3b3f6b, cloud_shade: 0x171c38 },
    Key { alt: -3.0, zenith: 0x18295a, mid: 0x4a5290, horizon: 0xc27a82, glow: (0xf59a6a, 1.0), sun: (0x000000, 0.0), sun_light: (0x000000, 0.0), ambient: (0x3a3a62, 1.0), fog: (0x8a6a88, 0.0007), water: 0x0f1530, cloud_lit: 0xe8907a, cloud_shade: 0x3e3560 },
    Key { alt: 1.0, zenith: 0x203e7c, mid: 0x7088c0, horizon: 0xea9c88, glow: (0xffb070, 1.5), sun: (0xffd9a0, 12.0), sun_light: (0xff9a5c, 0.95), ambient: (0x4a4a7c, 1.0), fog: (0xc89a9c, 0.0005), water: 0x13223f, cloud_lit: 0xffb88a, cloud_shade: 0x5e4d78 },
    Key { alt: 7.0, zenith: 0x2a55a6, mid: 0x83a6d6, horizon: 0xe6b8a8, glow: (0xffcf96, 1.35), sun: (0xfff0d0, 14.0), sun_light: (0xffc68a, 1.2), ambient: (0x56649a, 1.0), fog: (0xd6bcb8, 0.00042), water: 0x18324f, cloud_lit: 0xfff0d8, cloud_shade: 0x8a83a8 },
    Key { alt: 20.0, zenith: 0x2a62c0, mid: 0x6fa2e0, horizon: 0xc2dbf2, glow: (0xfff5e0, 0.9), sun: (0xffffff, 16.0), sun_light: (0xfff0dc, 1.35), ambient: (0x6f87b5, 1.0), fog: (0xbcd2e8, 0.00045), water: 0x1c4466, cloud_lit: 0xffffff, cloud_shade: 0xa9b6cc },
    Key { alt: 45.0, zenith: 0x2458c4, mid: 0x5b97e0, horizon: 0xb0d2f2, glow: (0xffffff, 0.8), sun: (0xffffff, 18.0), sun_light: (0xfff8ec, 1.45), ambient: (0x7090c0, 1.0), fog: (0xb3d1ee, 0.0004), water: 0x1d4a74, cloud_lit: 0xffffff, cloud_shade: 0xb8c4d8 },
];

fn rgb(hex: u32) -> Vec3 {
    let c = LinearRgba::from(Srgba::rgb_u8(
        (hex >> 16) as u8,
        (hex >> 8) as u8,
        hex as u8,
    ));
    Vec3::new(c.red, c.green, c.blue)
}

fn scaled((hex, k): (u32, f32)) -> Vec3 {
    rgb(hex) * k
}

/// Grey a color out under cloud — toward a cool, slightly blue grey, the
/// way overcast light reads.
fn overcast_tint(c: Vec3, k: f32) -> Vec3 {
    let l = c.dot(Vec3::new(0.2126, 0.7152, 0.0722));
    c.lerp(Vec3::new(0.88, 0.94, 1.08) * l, k)
}

fn desaturate(c: Vec3, k: f32) -> Vec3 {
    let l = c.dot(Vec3::new(0.2126, 0.7152, 0.0722));
    c.lerp(Vec3::splat(l), k)
}

/// The palette for a moment.
pub fn atmos(m: &Moment) -> Atmos {
    let sun = sun_direction(m.hour);
    let alt = sun.y.asin().to_degrees();
    // The two keyframes around this altitude.
    let hi = KEYS
        .iter()
        .position(|k| k.alt >= alt)
        .unwrap_or(KEYS.len() - 1);
    let lo = hi.saturating_sub(1);
    let (a, b) = (&KEYS[lo], &KEYS[hi]);
    let k = if hi == lo {
        0.0
    } else {
        ((alt - a.alt) / (b.alt - a.alt)).clamp(0.0, 1.0)
    };
    let k = k * k * (3.0 - 2.0 * k);
    let mix = |x: Vec3, y: Vec3| x.lerp(y, k);

    let mut zenith = mix(rgb(a.zenith), rgb(b.zenith));
    let mut mid = mix(rgb(a.mid), rgb(b.mid));
    let mut horizon = mix(rgb(a.horizon), rgb(b.horizon));
    let mut glow = mix(scaled(a.glow), scaled(b.glow));
    let mut sun_color = mix(scaled(a.sun), scaled(b.sun));
    let mut sun_light = mix(scaled(a.sun_light), scaled(b.sun_light));
    let mut ambient = mix(scaled(a.ambient), scaled(b.ambient));
    let mut fog = mix(rgb(a.fog.0), rgb(b.fog.0));
    let mut fog_density = a.fog.1.lerp(b.fog.1, k);
    let mut water = mix(rgb(a.water), rgb(b.water));
    let mut cloud_lit = mix(rgb(a.cloud_lit), rgb(b.cloud_lit));
    let mut cloud_shade = mix(rgb(a.cloud_shade), rgb(b.cloud_shade));

    // Weather: overcast skies go grey and flat, rain darkens and thickens
    // the air, snow brightens it.
    let overcast = smoothstep(0.45, 1.0, m.cover);
    let gloom = overcast * 0.75 + m.rain * 0.25;
    for c in [&mut zenith, &mut mid, &mut horizon, &mut fog, &mut water] {
        *c = overcast_tint(*c, overcast * 0.7) * (1.0 - gloom * 0.35);
    }
    for c in [&mut cloud_lit, &mut cloud_shade] {
        *c = desaturate(*c, overcast * 0.5) * (1.0 - m.rain * 0.45);
    }
    glow *= 1.0 - overcast * 0.85;
    sun_color *= 1.0 - overcast;
    sun_light *= 1.0 - overcast * 0.8;
    ambient = desaturate(ambient, overcast * 0.4) * (1.0 + overcast * 0.25);
    fog_density *= 1.0 + m.rain * 1.6 + m.snow * 2.2 + overcast * 0.6;
    let snow_air = Vec3::new(0.78, 0.82, 0.88) * (0.25 + 0.75 * sun.y.max(0.0).sqrt());
    fog = fog.lerp(snow_air, m.snow * 0.6);
    horizon = horizon.lerp(snow_air, m.snow * 0.45);
    mid = mid.lerp(snow_air * 0.9, m.snow * 0.45);

    // Night: stars once the sun is well down, the moon opposite it.
    let night = smoothstep(-4.0, -12.0, alt);
    let moon = Vec3::new(
        -sun.x * 0.6 + 0.35,
        (-sun.y).max(0.0) * 0.8 + 0.25,
        -sun.z * 0.6 - 0.4,
    )
    .normalize();
    let sun_visible = smoothstep(-1.5, 0.5, alt);

    Atmos {
        zenith: zenith.extend(0.0),
        mid: mid.extend(0.0),
        horizon: horizon.extend(0.0),
        glow: glow.extend(smoothstep(-6.0, 10.0, alt)),
        sun_dir: sun.extend(sun_visible),
        sun: sun_color.extend(m.cover),
        sun_light: sun_light.extend(night),
        ambient: ambient.extend(m.snow),
        fog: fog.extend(fog_density),
        water: water.extend(m.rain),
        cloud_lit: cloud_lit.extend(m.aurora * night),
        cloud_shade: cloud_shade.extend(m.snow),
        moon_dir: moon.extend(night * (1.0 - overcast)),
    }
}

fn smoothstep(e0: f32, e1: f32, x: f32) -> f32 {
    let t = ((x - e0) / (e1 - e0)).clamp(0.0, 1.0);
    t * t * (3.0 - 2.0 * t)
}

/// The sky's state between frames: easing from one moment to the next.
#[derive(Resource)]
pub struct Sky {
    from: Moment,
    to: Moment,
    /// 0..1 through the change.
    t: f32,
    secs: f32,
    /// A time-lapse (`go`) rather than a scrub: its hours are worth showing.
    pub timelapse: bool,
    /// The moment showing now (written every frame).
    pub now: Moment,
}

impl Sky {
    pub fn new(m: Moment) -> Self {
        Self {
            from: m,
            to: m,
            t: 1.0,
            secs: 1.0,
            timelapse: false,
            now: m,
        }
    }

    /// Ease to `to`: a time-lapse whose length follows the hours it covers.
    pub fn go(&mut self, to: Moment) {
        self.from = self.now;
        self.to = to;
        self.t = 0.0;
        let hours = hour_delta(self.now.hour, to.hour).abs();
        self.secs = (1.6 + hours * 0.35).min(4.5);
        self.timelapse = true;
    }

    /// Ease to `to` quickly, without a time-lapse (a dragged scrubber).
    pub fn scrub(&mut self, to: Moment) {
        self.from = self.now;
        self.to = to;
        self.t = 0.0;
        self.secs = 0.3;
        self.timelapse = false;
    }

    /// Step the change; `true` while the sky is still moving.
    pub fn tick(&mut self, dt: f32) -> bool {
        if self.t >= 1.0 {
            return false;
        }
        self.t = (self.t + dt / self.secs).min(1.0);
        let k = self.t * self.t * (3.0 - 2.0 * self.t);
        self.now = self.from.lerp(&self.to, k);
        true
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_sun_rises_east_peaks_south_and_sets_west() {
        let morning = sun_direction(7.0);
        let noon = sun_direction(12.0);
        let evening = sun_direction(18.5);
        let midnight = sun_direction(0.0);
        assert!(morning.z > 0.5, "east is +Z: {morning}");
        assert!(
            noon.y > 0.7 && noon.x < 0.0,
            "high in the south (−X): {noon}"
        );
        assert!(
            evening.z < -0.5 && evening.y > 0.0,
            "west is −Z, ahead: {evening}"
        );
        assert!(midnight.y < -0.2, "below the horizon at night: {midnight}");
    }

    #[test]
    fn hours_ease_the_short_way_round() {
        assert_eq!(hour_delta(23.0, 1.0), 2.0);
        assert_eq!(hour_delta(1.0, 23.0), -2.0);
        let at = |hour| Moment {
            hour,
            cover: 0.0,
            rain: 0.0,
            snow: 0.0,
            aurora: 0.0,
        };
        let m = at(23.0).lerp(&at(1.0), 0.5);
        assert!(
            m.hour.abs() < 1e-4 || (m.hour - 24.0).abs() < 1e-4,
            "{}",
            m.hour
        );
    }
}
