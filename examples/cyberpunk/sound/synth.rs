//! The sounds, rendered sample by sample: the seven UI blips ([`SFX`]) and
//! the looping drone, from a small kit (tones with pitch and envelope
//! functions, one-pole filters, noise, a loop fold).

use std::f32::consts::{PI, TAU};

/// Samples per second, every sound.
pub const RATE: u32 = 44_100;
const SR: f32 = RATE as f32;

/// Renders one sound: mono samples at [`RATE`].
type Render = fn() -> Vec<f32>;

/// Every UI sound, by its `sound.play` name.
pub const SFX: [(&str, Render); 7] = [
    ("hover", hover),
    ("click", click),
    ("back", back),
    ("tab", tab),
    ("error", error),
    ("confirm", confirm),
    ("boot", boot),
];

/// A tiny soft tick: a high sine dropping into pitch, a glint on top.
fn hover() -> Vec<f32> {
    let mut b = silence(0.04);
    let hz = |t: f32| 2100.0 + 600.0 * (-t / 0.004).exp();
    tone(&mut b, 0.0, 0.04, sine, hz, |t| pluck(t, 0.0006, 0.006));
    tone(
        &mut b,
        0.0,
        0.015,
        sine,
        |_| 5300.0,
        |t| 0.3 * pluck(t, 0.0003, 0.002),
    );
    normalize(&mut b, 0.12);
    b
}

/// A crisp blip: a rounded square snapping up to G6 over a G5 body.
fn click() -> Vec<f32> {
    let mut b = silence(0.1);
    let hz = |t: f32| 1568.0 - 400.0 * (-t / 0.004).exp();
    tone(&mut b, 0.0, 0.1, soft_square, hz, |t| pluck(t, 0.001, 0.02));
    tone(
        &mut b,
        0.0,
        0.08,
        sine,
        |_| 784.0,
        |t| 0.5 * pluck(t, 0.001, 0.016),
    );
    normalize(&mut b, 0.25);
    b
}

/// Lower and falling: a triangle sweeping C6 → G4 over its octave below.
fn back() -> Vec<f32> {
    let mut b = silence(0.16);
    let hz = |t: f32| 392.0 + 654.0 * (-t / 0.03).exp();
    tone(&mut b, 0.0, 0.16, tri, hz, |t| pluck(t, 0.002, 0.04));
    tone(
        &mut b,
        0.0,
        0.16,
        sine,
        move |t| hz(t) / 2.0,
        |t| 0.6 * pluck(t, 0.002, 0.05),
    );
    normalize(&mut b, 0.24);
    b
}

/// Two quick ticks, the second a fourth higher.
fn tab() -> Vec<f32> {
    let mut b = silence(0.1);
    for (at, hz) in [(0.0, 1760.0), (0.05, 2349.0)] {
        let glide = move |t: f32| hz * (1.0 + 0.2 * (-t / 0.003).exp());
        tone(&mut b, at, 0.045, sine, glide, |t| pluck(t, 0.0005, 0.008));
        tone(
            &mut b,
            at,
            0.015,
            sine,
            move |_| 3.0 * hz,
            |t| 0.25 * pluck(t, 0.0003, 0.002),
        );
    }
    normalize(&mut b, 0.2);
    b
}

/// A buzzy denial: two low saw bursts a semitone apart (rough), the second
/// sagging, lowpassed so the buzz stays dull.
fn error() -> Vec<f32> {
    let mut b = silence(0.26);
    for (at, len, sag) in [(0.0, 0.085, 0.0), (0.115, 0.14, 0.15)] {
        let hz = move |t: f32| 147.0 * (1.0 - sag * t / len);
        let amp = |t: f32| pluck(t, 0.004, 0.2);
        tone(&mut b, at, len, saw, hz, amp);
        tone(&mut b, at, len, saw, move |t| 1.06 * hz(t), amp);
        tone(&mut b, at, len, sine, move |t| hz(t) / 2.0, amp);
    }
    let (a, mut y1, mut y2) = (coef(2600.0), 0.0, 0.0);
    for s in &mut b {
        *s = lowpass(&mut y2, lowpass(&mut y1, *s, a), a);
    }
    normalize(&mut b, 0.26);
    b
}

/// A bright two-tone chirp up a fifth: E6, then B6, each gliding into pitch
/// with an octave glint.
fn confirm() -> Vec<f32> {
    let mut b = silence(0.25);
    for (at, len, hz) in [(0.0, 0.08, 1318.5), (0.07, 0.18, 1975.5)] {
        let glide = move |t: f32| hz * (1.0 - 0.1 * (-t / 0.006).exp());
        tone(&mut b, at, len, tri, glide, |t| pluck(t, 0.001, 0.045));
        tone(
            &mut b,
            at,
            len,
            sine,
            move |t| 2.0 * glide(t),
            |t| 0.25 * pluck(t, 0.001, 0.02),
        );
    }
    normalize(&mut b, 0.26);
    b
}

/// Powering up (~1 s): a saw sweeping 55 → 880 Hz through an opening
/// lowpass, with noise, bit-crushed and sample-held less and less as it
/// resolves, stuttering; then a clean A6 + E7 "ready" ping.
fn boot() -> Vec<f32> {
    const SWEEP: f32 = 0.85;
    let mut b = silence(1.15);
    let n = (SWEEP * SR) as usize;
    let mut hiss = noise(0x2077);
    let (mut phase, mut body_y, mut hiss_y, mut held) = (0.0, 0.0, 0.0, 0.0);
    for (i, s) in b[..n].iter_mut().enumerate() {
        let t = i as f32 / SR;
        let k = t / SWEEP;
        phase = (phase + 55.0 * 16f32.powf(k) / SR).fract();
        let body = 0.7 * saw(phase) + 0.5 * sine(phase);
        let body = lowpass(&mut body_y, body, coef(150.0 + 6000.0 * k * k));
        let air = lowpass(&mut hiss_y, hiss(), coef(800.0 + 7000.0 * k)) * (PI * k).sin();
        let x = (body + 0.5 * air) * (0.25 + 0.75 * k) * ((SWEEP - t) / 0.03).min(1.0);
        // Crush: 3 → 10 bits, a twelfth of the rate → all of it.
        let levels = 2f32.powf(3.0 + 7.0 * k);
        if i % (12.0 * (1.0 - k)).max(1.0) as usize == 0 {
            held = (x * levels).round() / levels;
        }
        *s = held;
    }
    // Stutters: a few slices replay the one before.
    for (at, len) in [(0.2, 0.03), (0.43, 0.02), (0.57, 0.04), (0.7, 0.015)] {
        let (at, len) = ((at * SR) as usize, (len * SR) as usize);
        b.copy_within(at - len..at, at);
    }
    // Take the edge off the steps.
    let (a, mut y) = (coef(7000.0), 0.0);
    for s in &mut b[..n] {
        *s = lowpass(&mut y, *s, a);
    }
    tone(
        &mut b,
        SWEEP,
        0.3,
        sine,
        |_| 1760.0,
        |t| pluck(t, 0.001, 0.09),
    );
    tone(
        &mut b,
        SWEEP,
        0.25,
        sine,
        |_| 2637.0,
        |t| 0.4 * pluck(t, 0.001, 0.06),
    );
    normalize(&mut b, 0.27);
    b
}

/// Seconds per drone loop: every partial and LFO repeats a whole number of
/// times in it, so the loop point is phase-aligned.
const LOOP: f64 = 12.0;
/// Seconds rendered past the loop and folded over its start (`fold`).
const FOLD: f64 = 2.0;

/// The menu drone, stereo: detuned saws on A2 and E3 through a slowly
/// breathing lowpass (the sides a quarter-loop apart), an A1 sine sub
/// swelling every 3 s, a minor third coming and going, a little noise air.
pub fn drone() -> Vec<f32> {
    let frames = ((LOOP + FOLD) * RATE as f64) as usize;
    // A whole number of cycles per loop, and the phase of one at `t`.
    let looped = |hz: f64| (hz * LOOP).round() / LOOP;
    let osc = |hz: f64, t: f64| (hz * t).fract() as f32;
    let (fifth, third) = (looped(164.81), looped(261.63));
    let (air_hi, air_lo) = (coef(2500.0), coef(7000.0));
    let mut hiss = noise(0xC0FF_EE00);
    // Per side: two lowpass stages, then the air's highpass and lowpass.
    let mut state = [[0.0f32; 4]; 2];
    let mut out = Vec::with_capacity(frames * 2);
    for i in 0..frames {
        let t = i as f64 / RATE as f64;
        let sub = sine(osc(55.0, t)) * (0.3 + 0.7 * lfo(t, 3.0, 0.0).powi(3));
        let minor = sine(osc(third, t)) * lfo(t, LOOP, 0.5);
        let breath = 0.6 + 0.4 * lfo(t, 6.0, 0.0);
        for (side, [lp1, lp2, hp, lp3]) in state.iter_mut().enumerate() {
            let d = side as f64 * 2.0 - 1.0;
            let saws = saw(osc(110.0, t))
                + saw(osc(110.0 + d * 2.0 / LOOP, t))
                + 0.7 * saw(osc(fifth - d / LOOP, t));
            let a = coef(240.0 * 4f32.powf(lfo(t, LOOP, side as f64 * 0.25)));
            let pad = lowpass(lp2, lowpass(lp1, saws, a), a);
            let n = hiss();
            let air = lowpass(lp3, n - lowpass(hp, n, air_hi), air_lo);
            out.push(0.35 * pad + 0.15 * sub + 0.06 * minor + 0.05 * breath * air);
        }
    }
    fold(&mut out, 2, (FOLD * RATE as f64) as usize);
    normalize(&mut out, 0.18);
    out
}

// --- Synthesis kit -------------------------------------------------------

/// `secs` of silence to render into.
fn silence(secs: f32) -> Vec<f32> {
    vec![0.0; (secs * SR) as usize]
}

/// Add a tone to `buf` from `at` for `len` seconds: `wave` is the shape of
/// one cycle (phase 0..1), `hz(t)` and `amp(t)` the pitch and envelope (`t`
/// in seconds since the tone began). The last 4 ms fade out, so a tone
/// never ends on a click.
fn tone(
    buf: &mut [f32],
    at: f32,
    len: f32,
    wave: fn(f32) -> f32,
    hz: impl Fn(f32) -> f32,
    amp: impl Fn(f32) -> f32,
) {
    let mut phase = 0.0;
    let start = (at * SR) as usize;
    for (i, s) in buf[start..]
        .iter_mut()
        .take((len * SR) as usize)
        .enumerate()
    {
        let t = i as f32 / SR;
        *s += wave(phase) * amp(t) * ((len - t) / 0.004).min(1.0);
        phase = (phase + hz(t) / SR).fract();
    }
}

/// A struck envelope: a linear `attack`, an exponential decay.
fn pluck(t: f32, attack: f32, decay: f32) -> f32 {
    (t / attack).min(1.0) * (-t / decay).exp()
}

/// 0 → 1 → 0 every `period` seconds (a raised cosine), `shift` periods late.
fn lfo(t: f64, period: f64, shift: f64) -> f32 {
    (0.5 - 0.5 * (std::f64::consts::TAU * (t / period - shift)).cos()) as f32
}

fn sine(p: f32) -> f32 {
    (TAU * p).sin()
}

fn tri(p: f32) -> f32 {
    1.0 - 4.0 * (p - 0.5).abs()
}

fn saw(p: f32) -> f32 {
    2.0 * p - 1.0
}

/// A sine pushed toward a square: rounder than one, edgier than a sine.
fn soft_square(p: f32) -> f32 {
    (2.5 * sine(p)).tanh()
}

/// White noise in -1..1 (xorshift: the same every run).
fn noise(mut seed: u32) -> impl FnMut() -> f32 {
    move || {
        seed ^= seed << 13;
        seed ^= seed >> 17;
        seed ^= seed << 5;
        seed as f32 / u32::MAX as f32 * 2.0 - 1.0
    }
}

/// One-pole lowpass coefficient for a cutoff in Hz.
fn coef(hz: f32) -> f32 {
    1.0 - (-TAU * hz / SR).exp()
}

/// One step of a one-pole lowpass with state `y`.
fn lowpass(y: &mut f32, x: f32, a: f32) -> f32 {
    *y += a * (x - *y);
    *y
}

/// Scale `buf` to peak at `peak`.
fn normalize(buf: &mut [f32], peak: f32) {
    let max = buf.iter().fold(0.0f32, |m, s| m.max(s.abs()));
    if max > 0.0 {
        buf.iter_mut().for_each(|s| *s *= peak / max);
    }
}

/// Crossfade the last `frames` frames of a render over its first ones and
/// drop them: the render ran on past its loop point, so the seam is the
/// render's own next sample.
fn fold(buf: &mut Vec<f32>, channels: usize, frames: usize) {
    let tail = buf.len() - frames * channels;
    for i in 0..frames * channels {
        let w = (i / channels) as f32 / frames as f32;
        buf[i] = buf[i] * w + buf[tail + i] * (1.0 - w);
    }
    buf.truncate(tail);
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Every sound renders non-empty, finite and unclipped; the drone's loop
    /// seam steps no further than its body does.
    #[test]
    fn sounds_render_clean() {
        let drone = drone();
        for (name, buf) in SFX
            .iter()
            .map(|&(name, render)| (name, render()))
            .chain([("drone", drone.clone())])
        {
            assert!(!buf.is_empty(), "{name} is empty");
            assert!(
                buf.iter().all(|s| s.is_finite() && s.abs() <= 1.0),
                "{name} clips or isn't finite"
            );
        }
        let step = |i: usize| (drone[(i + 2) % drone.len()] - drone[i]).abs();
        let body = (0..drone.len() - 2).map(step).fold(0.0, f32::max);
        assert!(
            step(drone.len() - 2) <= body,
            "the drone's loop seam clicks"
        );
    }
}
