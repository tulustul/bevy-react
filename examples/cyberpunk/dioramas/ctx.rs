//! `Ctx`: what a world's builder spawns with — materials and meshes, and
//! entities placed in the world (on its render layer, under its root).

use bevy::asset::RenderAssetUsages;
use bevy::camera::visibility::{NoFrustumCulling, RenderLayers};
use bevy::prelude::*;
use bevy::render::render_resource::{Extent3d, TextureDimension, TextureFormat};

use super::materials::{
    Emitter, Paint, PaintMaterial, ParticleMaterial, Pattern, SkyMaterial, quads,
};

/// What a builder gets: material and mesh makers, and spawn helpers that
/// put everything in the world — under its root, on its layer.
pub struct Ctx<'a, 'w, 's> {
    pub(super) commands: &'a mut Commands<'w, 's>,
    pub(super) meshes: &'a mut Assets<Mesh>,
    pub(super) materials: &'a mut Assets<StandardMaterial>,
    pub(super) paints: &'a mut Assets<PaintMaterial>,
    pub(super) particles: &'a mut Assets<ParticleMaterial>,
    pub(super) skies: &'a mut Assets<SkyMaterial>,
    /// A soft white spot (`soft_spot`), for glows laid on surfaces.
    pub(super) soft: Handle<Image>,
    pub(super) layer: RenderLayers,
    /// The world's root: where it stands.
    pub(super) root: Entity,
    /// Where the card's camera stands (wet reflections run toward it).
    pub(super) eye: Vec3,
    /// Seeds each particle mesh differently.
    pub(super) salt: u32,
}

impl Ctx<'_, '_, '_> {
    pub fn mesh(&mut self, mesh: impl Into<Mesh>) -> Handle<Mesh> {
        self.meshes.add(mesh)
    }

    /// A lit surface.
    pub fn solid(
        &mut self,
        color: Srgba,
        roughness: f32,
        metallic: f32,
    ) -> Handle<StandardMaterial> {
        self.materials.add(StandardMaterial {
            base_color: color.into(),
            perceptual_roughness: roughness,
            metallic,
            ..default()
        })
    }

    /// Light itself: `strength` above 1 blooms.
    pub fn glow(&mut self, color: Srgba, strength: f32) -> Handle<StandardMaterial> {
        self.materials.add(StandardMaterial {
            base_color: Color::BLACK,
            emissive: LinearRgba::from(color) * strength,
            ..default()
        })
    }

    /// Additive light laid on a surface (a puddle's reflection, a fire's
    /// glow on the street), soft at the edges; `color` is linear HDR.
    pub fn smear(&mut self, color: LinearRgba) -> Handle<StandardMaterial> {
        self.materials.add(StandardMaterial {
            base_color: color.into(),
            base_color_texture: Some(self.soft.clone()),
            unlit: true,
            alpha_mode: AlphaMode::Add,
            fog_enabled: false,
            ..default()
        })
    }

    fn paint(
        &mut self,
        base: StandardMaterial,
        pattern: Pattern,
        mode: Vec3,
        spec: Vec4,
        glow: LinearRgba,
    ) -> Handle<PaintMaterial> {
        self.paints.add(PaintMaterial {
            base,
            extension: Paint {
                mode: Vec3::new(pattern as u8 as f32, mode.x, mode.y).extend(mode.z),
                spec,
                glow,
            },
        })
    }

    /// Walls of windows: cells of `cell` meters, panes of `pane`, `lit` of
    /// them lit in `light` (linear, HDR).
    pub fn windows(
        &mut self,
        wall: Srgba,
        light: LinearRgba,
        cell: Vec2,
        pane: Vec2,
        lit: f32,
        seed: f32,
    ) -> Handle<PaintMaterial> {
        let base = StandardMaterial {
            base_color: wall.into(),
            perceptual_roughness: 0.7,
            ..default()
        };
        let spec = cell.extend(pane.x).extend(pane.y);
        self.paint(
            base,
            Pattern::Windows,
            Vec3::new(seed, lit, 1.0),
            spec,
            light,
        )
    }

    /// A neon sign of `columns × rows` glyphs on a panel `aspect` (width /
    /// height) across, stuttering `stutter` of the time.
    pub fn sign(
        &mut self,
        color: LinearRgba,
        columns: f32,
        rows: f32,
        aspect: f32,
        stutter: f32,
        seed: f32,
    ) -> Handle<PaintMaterial> {
        let base = StandardMaterial {
            base_color: Color::BLACK,
            ..default()
        };
        let spec = Vec4::new(columns, rows, 0.035, aspect);
        self.paint(
            base,
            Pattern::Sign,
            Vec3::new(seed, stutter, 1.0),
            spec,
            color,
        )
    }

    /// Wet ground: puddles every ~1/`scale` m covering `wetness`, lane
    /// dashes along x = 0 if `lanes`.
    pub fn wet(
        &mut self,
        ground: Srgba,
        scale: f32,
        wetness: f32,
        lanes: bool,
    ) -> Handle<PaintMaterial> {
        let base = StandardMaterial {
            base_color: ground.into(),
            perceptual_roughness: 0.5,
            reflectance: 0.6,
            ..default()
        };
        let spec = Vec4::new(scale, wetness, if lanes { 1.0 } else { 0.0 }, 0.0);
        let paint = LinearRgba::rgb(0.32, 0.3, 0.22);
        self.paint(base, Pattern::Wet, Vec3::ZERO, spec, paint)
    }

    /// Polished stone tiles of `tile` meters, veined in `vein`.
    pub fn marble(&mut self, stone: Srgba, vein: Srgba, tile: f32) -> Handle<PaintMaterial> {
        let base = StandardMaterial {
            base_color: stone.into(),
            reflectance: 0.7,
            ..default()
        };
        let spec = Vec4::new(tile, 0.6, 0.0, 0.0);
        self.paint(base, Pattern::Marble, Vec3::ZERO, spec, vein.into())
    }

    /// The Tenkai mark over its wordmark, in `color`, on a `wall` panel
    /// `aspect` (width / height) across.
    pub fn emblem(&mut self, color: LinearRgba, wall: Srgba, aspect: f32) -> Handle<PaintMaterial> {
        let base = StandardMaterial {
            base_color: wall.into(),
            perceptual_roughness: 0.55,
            reflectance: 0.3,
            ..default()
        };
        let spec = Vec4::new(aspect, 0.0, 0.0, 0.0);
        self.paint(base, Pattern::Emblem, Vec3::new(0.0, 0.0, 1.0), spec, color)
    }

    /// Glossy paint with a rim of `rim` light (linear, HDR) along its
    /// silhouette: a dark car body that still reads against the night.
    pub fn sheen(&mut self, paint: Srgba, rim: LinearRgba) -> Handle<PaintMaterial> {
        let base = StandardMaterial {
            base_color: paint.into(),
            perceptual_roughness: 0.3,
            metallic: 0.5,
            ..default()
        };
        self.paint(
            base,
            Pattern::Sheen,
            Vec3::new(0.0, 0.0, 1.0),
            Vec4::ZERO,
            rim,
        )
    }

    /// A mesh in this world.
    pub fn object<M: Material>(
        &mut self,
        mesh: &Handle<Mesh>,
        material: &Handle<M>,
        transform: Transform,
    ) -> Entity {
        self.spawn((
            Mesh3d(mesh.clone()),
            MeshMaterial3d(material.clone()),
            transform,
        ))
    }

    /// A new mesh in this world.
    pub fn shape<M: Material>(
        &mut self,
        mesh: impl Into<Mesh>,
        material: &Handle<M>,
        transform: Transform,
    ) -> Entity {
        let mesh = self.meshes.add(mesh);
        self.object(&mesh, material, transform)
    }

    /// An empty transform node (a pivot to turn a group by).
    pub fn pivot(&mut self, transform: Transform) -> Entity {
        self.spawn((transform, Visibility::default()))
    }

    /// Anything in this world: on its layer, under its root.
    pub fn spawn(&mut self, bundle: impl Bundle) -> Entity {
        self.commands
            .spawn((bundle, self.layer.clone(), ChildOf(self.root)))
            .id()
    }

    /// A point light (`intensity` in lumens) reaching `range` meters. It has
    /// a body (bigger the further it reaches), so wet and polished floors
    /// mirror a patch of light, not a pinprick.
    pub fn light(&mut self, color: Srgba, intensity: f32, range: f32, at: Vec3) -> Entity {
        self.spawn((
            PointLight {
                color: color.into(),
                intensity,
                range,
                radius: range * 0.03,
                ..default()
            },
            Transform::from_translation(at),
        ))
    }

    /// A light's reflection in a wet floor: a soft streak from `foot`
    /// toward the eye, `length` long — so it stands upright on screen, the
    /// way a puddle smears a sign.
    pub fn reflection(&mut self, color: LinearRgba, foot: Vec3, length: f32, width: f32) {
        let toward = (self.eye.with_y(0.0) - foot.with_y(0.0)).normalize();
        let smear = self.smear(color);
        self.shape(
            Plane3d::default().mesh().size(width, length),
            &smear,
            Transform::from_translation(foot.with_y(0.02) + toward * length * 0.5)
                .looking_to(toward, Vec3::Y),
        );
    }

    /// The sky dome.
    pub fn sky(&mut self, sky: SkyMaterial) -> Entity {
        let material = self.skies.add(sky);
        let dome = self.meshes.add(Sphere::new(180.0).mesh().uv(32, 16));
        self.object(&dome, &material, Transform::default())
    }

    /// A particle emitter at `at`, `amount` (0..1) of it showing.
    pub fn emit(&mut self, emitter: Emitter, at: Vec3, amount: f32) -> Entity {
        self.salt += 1;
        let mesh = self.meshes.add(quads(emitter.count, self.salt));
        let material = self.particles.add(emitter.material(amount));
        let e = self.object(&mesh, &material, Transform::from_translation(at));
        // The quads are placed in the vertex shader: the mesh's bounds
        // mean nothing.
        self.insert(e, NoFrustumCulling);
        e
    }

    pub fn insert(&mut self, entity: Entity, bundle: impl Bundle) {
        self.commands.entity(entity).insert(bundle);
    }

    pub fn parent(&mut self, parent: Entity, child: Entity) {
        self.commands.entity(parent).add_child(child);
    }
}

/// A soft white spot: alpha falls off from the middle like a Gaussian.
pub(super) fn soft_spot() -> Image {
    const N: u32 = 64;
    let data = (0..N * N)
        .flat_map(|i| {
            let x = ((i % N) as f32 + 0.5) / N as f32 * 2.0 - 1.0;
            let y = ((i / N) as f32 + 0.5) / N as f32 * 2.0 - 1.0;
            let r2 = x * x + y * y;
            let a = (-r2 * 3.5).exp() * (1.0 - r2).max(0.0);
            [255, 255, 255, (a * 255.0) as u8]
        })
        .collect();
    Image::new(
        Extent3d {
            width: N,
            height: N,
            depth_or_array_layers: 1,
        },
        TextureDimension::D2,
        data,
        TextureFormat::Rgba8UnormSrgb,
        RenderAssetUsages::RENDER_WORLD,
    )
}
