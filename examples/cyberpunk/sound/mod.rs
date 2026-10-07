//! The menu's sound, synthesized in code at startup — no audio files: seven
//! UI blips React plays by name (`sound.play`, see `ui/src/sound.ts`) and a
//! low looping drone, under the settings' volumes (`sound.volume`).
//!
//! Every sound renders (`synth.rs`) into a buffer of samples held by a
//! [`Synth`] asset, which bevy_audio plays like a decoded file (a custom
//! `Decodable`, so no codec feature is needed).

mod synth;

use std::collections::HashSet;
use std::sync::Arc;
use std::time::Duration;

use bevy::audio::{AddAudioSource, ChannelCount, Decodable, SampleRate, Source};
use bevy::prelude::*;
use bevy_react::{ReactAppExt, react_message};

use synth::{RATE, SFX, drone};

/// A sound restarted within this many seconds of itself is dropped: a quick
/// sweep over a list would otherwise stack its `hover`s into a buzz.
const RETRIGGER: f64 = 0.04;
/// Seconds the drone takes to fade in at startup.
const FADE_IN: f32 = 4.0;

pub struct SoundPlugin;

impl Plugin for SoundPlugin {
    fn build(&self, app: &mut App) {
        register_bindings(app);
        app.add_audio_source::<Synth>()
            .init_resource::<Volume>()
            .add_systems(Startup, synthesize)
            .add_systems(Update, drone_level);
    }
}

/// React → Bevy: play a UI sound by name (`hover`, `click`, `back`, `tab`,
/// `error`, `confirm`, `boot`).
#[react_message(name = "sound.play")]
pub struct Play {
    pub name: String,
}

/// React → Bevy: the volume settings, each 0..1. Also the resource holding
/// the current ones.
#[react_message(name = "sound.volume")]
#[derive(Resource)]
pub struct Volume {
    pub master: f32,
    pub sfx: f32,
    pub music: f32,
}

impl Default for Volume {
    fn default() -> Self {
        Self {
            master: 1.0,
            sfx: 0.8,
            music: 0.5,
        }
    }
}

/// The sound's bindings (shared with the `--export-bindings` path).
pub fn register_bindings(app: &mut App) {
    app.add_react_handler(play).add_react_handler(volume);
}

/// The UI sounds: name, sound, when it last started (the retrigger guard).
#[derive(Resource)]
struct Bank(Vec<(&'static str, Handle<Synth>, f64)>);

/// The looping drone's player.
#[derive(Component)]
struct Drone;

/// Render every sound and start the drone.
fn synthesize(mut commands: Commands, mut synths: ResMut<Assets<Synth>>) {
    let bank = SFX
        .iter()
        .map(|&(name, render)| (name, synths.add(Synth::new(1, render())), f64::NEG_INFINITY))
        .collect();
    commands.insert_resource(Bank(bank));
    commands.spawn((
        AudioPlayer(synths.add(Synth::new(2, drone()))),
        // Silent until `drone_level` fades it in.
        PlaybackSettings::LOOP.with_volume(bevy::audio::Volume::SILENT),
        Drone,
    ));
}

fn play(
    ev: On<Play>,
    mut bank: ResMut<Bank>,
    volume: Res<Volume>,
    time: Res<Time<Real>>,
    mut unknown: Local<HashSet<String>>,
    mut commands: Commands,
) {
    let Some((_, sound, last)) = bank.0.iter_mut().find(|(name, ..)| *name == ev.name) else {
        if unknown.insert(ev.name.clone()) {
            warn!("sound.play: no sound named {:?}", ev.name);
        }
        return;
    };
    let now = time.elapsed_secs_f64();
    if now - *last < RETRIGGER {
        return;
    }
    *last = now;
    // ponytail: without an audio device bevy never plays (nor despawns) these;
    // a session's worth of inert entities, no per-frame cost.
    commands.spawn((
        AudioPlayer(sound.clone()),
        PlaybackSettings::DESPAWN
            .with_volume(bevy::audio::Volume::Linear(volume.master * volume.sfx)),
    ));
}

fn volume(ev: On<Volume>, mut current: ResMut<Volume>) {
    *current = Volume {
        master: ev.master.clamp(0.0, 1.0),
        sfx: ev.sfx.clamp(0.0, 1.0),
        music: ev.music.clamp(0.0, 1.0),
    };
}

/// The drone follows master × music live, faded in over the first seconds.
/// Compare-before-write, so a settled drone is never touched.
fn drone_level(
    time: Res<Time<Real>>,
    volume: Res<Volume>,
    mut drone: Query<&mut AudioSink, With<Drone>>,
) {
    let level = volume.master * volume.music * (time.elapsed_secs() / FADE_IN).min(1.0);
    for mut sink in &mut drone {
        if sink.volume().to_linear() != level {
            sink.set_volume(bevy::audio::Volume::Linear(level));
        }
    }
}

/// A synthesized sound: interleaved samples at [`RATE`], played from memory.
#[derive(Asset, TypePath, Clone)]
struct Synth {
    channels: ChannelCount,
    samples: Arc<[f32]>,
}

impl Synth {
    fn new(channels: u16, samples: Vec<f32>) -> Self {
        Self {
            channels: ChannelCount::new(channels).unwrap(),
            samples: samples.into(),
        }
    }
}

impl Decodable for Synth {
    type Decoder = Playhead;

    fn decoder(&self) -> Playhead {
        Playhead(self.clone(), 0)
    }
}

/// A [`Synth`] playing: the sound and its next sample.
struct Playhead(Synth, usize);

impl Iterator for Playhead {
    type Item = f32;

    fn next(&mut self) -> Option<f32> {
        let sample = self.0.samples.get(self.1).copied();
        self.1 += 1;
        sample
    }
}

impl Source for Playhead {
    /// One span: the whole buffer, then `Some(0)` once played out.
    fn current_span_len(&self) -> Option<usize> {
        let len = self.0.samples.len();
        Some(if self.1 < len { len } else { 0 })
    }

    fn channels(&self) -> ChannelCount {
        self.0.channels
    }

    fn sample_rate(&self) -> SampleRate {
        SampleRate::new(RATE).unwrap()
    }

    fn total_duration(&self) -> Option<Duration> {
        None
    }
}
