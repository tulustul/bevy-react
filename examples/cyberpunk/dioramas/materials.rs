//! The dioramas' three materials: the sky dome, `Paint` (procedural detail
//! over a lit `StandardMaterial` — window grids, neon glyph signs, wet
//! asphalt, marble, the Tenkai mark, a car's sheen) and the particles (fire,
//! smoke, embers, rain, dust: each emitter one mesh of quads animated in its
//! vertex shader, one draw call). Shaders: `assets/cyberpunk/diorama_*.wgsl`.

use bevy::asset::RenderAssetUsages;
use bevy::mesh::{Indices, MeshVertexBufferLayoutRef, PrimitiveTopology};
use bevy::pbr::{ExtendedMaterial, MaterialExtension, MaterialPipeline, MaterialPipelineKey};
use bevy::prelude::*;
use bevy::render::render_resource::{
    AsBindGroup, RenderPipelineDescriptor, SpecializedMeshPipelineError,
};
use bevy::shader::ShaderRef;

pub fn plugin(app: &mut App) {
    app.add_plugins((
        MaterialPlugin::<SkyMaterial>::default(),
        MaterialPlugin::<PaintMaterial>::default(),
        MaterialPlugin::<ParticleMaterial>::default(),
    ));
}

/// The sky dome: a gradient keyed to the view ray (see the shader).
#[derive(Asset, AsBindGroup, Reflect, Clone)]
pub struct SkyMaterial {
    /// Straight up; `a` = how many stars.
    #[uniform(0)]
    pub zenith: LinearRgba,
    /// At the horizon (match the fog); `a` = how much cloud.
    #[uniform(1)]
    pub horizon: LinearRgba,
    /// The sun or a glow (HDR); `a` = the disc's radius, radians (0: none).
    #[uniform(2)]
    pub sun: LinearRgba,
    /// Toward the sun; `w` = the halo's width, radians.
    #[uniform(3)]
    pub sun_dir: Vec4,
}

impl Material for SkyMaterial {
    fn fragment_shader() -> ShaderRef {
        "cyberpunk/diorama_sky.wgsl".into()
    }

    fn enable_prepass() -> bool {
        false
    }

    fn enable_shadows() -> bool {
        false
    }

    fn specialize(
        _: &MaterialPipeline,
        descriptor: &mut RenderPipelineDescriptor,
        _: &MeshVertexBufferLayoutRef,
        _: MaterialPipelineKey<Self>,
    ) -> Result<(), SpecializedMeshPipelineError> {
        // Seen from inside.
        descriptor.primitive.cull_mode = None;
        Ok(())
    }
}

pub type PaintMaterial = ExtendedMaterial<StandardMaterial, Paint>;

/// Procedural detail over a lit surface; what `spec` means depends on the
/// mode (see `diorama_paint.wgsl`).
#[derive(Asset, AsBindGroup, Reflect, Clone, Default)]
pub struct Paint {
    /// (mode, seed, a, b).
    #[uniform(100)]
    pub mode: Vec4,
    #[uniform(101)]
    pub spec: Vec4,
    /// Linear, HDR where it glows.
    #[uniform(102)]
    pub glow: LinearRgba,
}

impl MaterialExtension for Paint {
    fn fragment_shader() -> ShaderRef {
        "cyberpunk/diorama_paint.wgsl".into()
    }
}

/// The paint modes (the shader's `mode.x`).
#[derive(Clone, Copy)]
pub enum Pattern {
    Windows = 0,
    Sign = 1,
    Wet = 2,
    Marble = 3,
    Emblem = 4,
    Sheen = 5,
}

/// One particle emitter (see `diorama_particles.wgsl`).
#[derive(Asset, AsBindGroup, Reflect, Clone)]
pub struct ParticleMaterial {
    /// (kind, amount 0..1, size, speed).
    #[uniform(0)]
    pub params: Vec4,
    /// The base's radii and the rise (x, z; y) — or the box.
    #[uniform(1)]
    pub area: Vec4,
    /// The drift over a life (or per second, for rain and motes).
    #[uniform(2)]
    pub wind: Vec4,
    #[uniform(3)]
    pub color: LinearRgba,
    #[uniform(4)]
    pub color2: LinearRgba,
}

impl Material for ParticleMaterial {
    fn vertex_shader() -> ShaderRef {
        "cyberpunk/diorama_particles.wgsl".into()
    }

    fn fragment_shader() -> ShaderRef {
        "cyberpunk/diorama_particles.wgsl".into()
    }

    fn alpha_mode(&self) -> AlphaMode {
        AlphaMode::Premultiplied
    }

    fn enable_prepass() -> bool {
        false
    }

    fn enable_shadows() -> bool {
        false
    }

    fn specialize(
        _: &MaterialPipeline,
        descriptor: &mut RenderPipelineDescriptor,
        layout: &MeshVertexBufferLayoutRef,
        _: MaterialPipelineKey<Self>,
    ) -> Result<(), SpecializedMeshPipelineError> {
        descriptor.vertex.buffers = vec![layout.0.get_layout(&[
            Mesh::ATTRIBUTE_POSITION.at_shader_location(0),
            Mesh::ATTRIBUTE_UV_0.at_shader_location(1),
            Mesh::ATTRIBUTE_COLOR.at_shader_location(2),
        ])?];
        descriptor.primitive.cull_mode = None;
        Ok(())
    }
}

/// The particle kinds (the shader's `params.x`).
#[derive(Clone, Copy)]
pub enum Kind {
    Flame = 0,
    Plume = 1,
    Embers = 2,
    Rain = 3,
    Motes = 4,
}

/// An emitter's recipe: what it throws, how many, how big, how fast, over
/// what area, drifting where, in which colors.
#[derive(Clone, Copy)]
pub struct Emitter {
    pub kind: Kind,
    pub count: u32,
    pub size: f32,
    pub speed: f32,
    pub area: Vec3,
    pub wind: Vec3,
    pub color: LinearRgba,
    pub color2: LinearRgba,
}

impl Emitter {
    /// Fire off an ellipse of radii `spread` (x, z), tongues up to `height`.
    pub fn flame(spread: Vec2, height: f32, size: f32) -> Self {
        Self {
            kind: Kind::Flame,
            count: 90,
            size,
            speed: 1.0,
            area: Vec3::new(spread.x, height, spread.y),
            wind: Vec3::ZERO,
            color: LinearRgba::rgb(4.0, 0.9, 0.12),
            color2: LinearRgba::rgb(9.0, 6.0, 2.2),
        }
    }

    /// Puffs off a disc of `radius`, rising `height` over a life.
    pub fn plume(radius: f32, height: f32, size: f32, color: LinearRgba) -> Self {
        Self {
            kind: Kind::Plume,
            count: 40,
            size,
            speed: 0.2,
            area: Vec3::new(radius, height, radius),
            wind: Vec3::ZERO,
            color,
            color2: color,
        }
    }

    /// Sparks off an ellipse of radii `spread` (x, z), rising `height`.
    pub fn embers(spread: Vec2, height: f32) -> Self {
        Self {
            kind: Kind::Embers,
            count: 80,
            size: 0.025,
            speed: 1.0,
            area: Vec3::new(spread.x, height, spread.y),
            wind: Vec3::ZERO,
            color: LinearRgba::rgb(6.0, 1.2, 0.15),
            color2: LinearRgba::rgb(12.0, 7.0, 2.5),
        }
    }

    /// Rain through a box, falling at `fall` (m/s), streaks `length` long.
    pub fn rain(size: Vec3, fall: Vec3, length: f32, color: LinearRgba) -> Self {
        Self {
            kind: Kind::Rain,
            count: 1600,
            size: length,
            speed: 1.0,
            area: size,
            wind: fall,
            color,
            color2: color,
        }
    }

    /// Specks drifting through a box at `drift` (m/s).
    pub fn motes(size: Vec3, drift: Vec3, speck: f32, color: LinearRgba) -> Self {
        Self {
            kind: Kind::Motes,
            count: 160,
            size: speck,
            speed: 1.0,
            area: size,
            wind: drift,
            color,
            color2: color,
        }
    }

    pub fn count(self, count: u32) -> Self {
        Self { count, ..self }
    }

    pub fn speed(self, speed: f32) -> Self {
        Self { speed, ..self }
    }

    pub fn wind(self, wind: Vec3) -> Self {
        Self { wind, ..self }
    }

    /// A plume's color where it leaves the source (a fire's glow on its
    /// smoke, neon on steam), fading to its own as it rises.
    pub fn under(self, color2: LinearRgba) -> Self {
        Self { color2, ..self }
    }

    pub fn material(&self, amount: f32) -> ParticleMaterial {
        ParticleMaterial {
            params: Vec4::new(self.kind as u8 as f32, amount, self.size, self.speed),
            area: self.area.extend(0.0),
            wind: self.wind.extend(0.0),
            color: self.color,
            color2: self.color2,
        }
    }
}

/// `count` quads, each with its own random seed in the vertex color.
pub fn quads(count: u32, salt: u32) -> Mesh {
    let mut rng = 0x2545_f491_u32.wrapping_mul(salt | 1);
    let mut seeds = Vec::with_capacity(count as usize * 4);
    let mut corners = Vec::with_capacity(count as usize * 4);
    let mut indices = Vec::with_capacity(count as usize * 6);
    for q in 0..count {
        let seed = [
            rand(&mut rng),
            rand(&mut rng),
            rand(&mut rng),
            rand(&mut rng),
        ];
        for corner in [[0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0]] {
            seeds.push(seed);
            corners.push(corner);
        }
        let b = q * 4;
        indices.extend_from_slice(&[b, b + 1, b + 2, b, b + 2, b + 3]);
    }
    Mesh::new(
        PrimitiveTopology::TriangleList,
        RenderAssetUsages::RENDER_WORLD,
    )
    .with_inserted_attribute(Mesh::ATTRIBUTE_POSITION, vec![[0.0f32; 3]; corners.len()])
    .with_inserted_attribute(Mesh::ATTRIBUTE_UV_0, corners)
    .with_inserted_attribute(Mesh::ATTRIBUTE_COLOR, seeds)
    .with_inserted_indices(Indices::U32(indices))
}

/// A xorshift step, in 0..1.
pub fn rand(state: &mut u32) -> f32 {
    *state ^= *state << 13;
    *state ^= *state >> 17;
    *state ^= *state << 5;
    (*state >> 8) as f32 / (1u32 << 24) as f32
}
