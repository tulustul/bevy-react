//! The lake. A mirror camera rides below the surface, mirroring the eye,
//! and films the world (everything on layer 0 — the land, the sky, your
//! windows) into a low-resolution HDR texture; `water.wgsl` samples it at
//! each fragment's screen position. That mirror is filmed for the eye's
//! point of view, so only the eye sees that lake ([`MIRROR_WATER_LAYER`]);
//! any other camera sees a twin that reflects the sky ([`SKY_WATER_LAYER`]).

use bevy::camera::visibility::RenderLayers;
use bevy::camera::{Hdr, RenderTarget};
use bevy::core_pipeline::tonemapping::Tonemapping;
use bevy::light::NotShadowCaster;
use bevy::prelude::*;
use bevy::render::render_resource::{AsBindGroup, TextureFormat};
use bevy::shader::ShaderRef;
use bevy::window::PrimaryWindow;

use super::Atmos;
use crate::look::Eye;

pub const MIRROR_WATER_LAYER: usize = 1;
pub const SKY_WATER_LAYER: usize = 2;

#[derive(Asset, AsBindGroup, TypePath, Clone)]
pub struct WaterMaterial {
    #[uniform(0)]
    pub atmos: Atmos,
    /// `x` = 1 when `reflection` is this view's mirror.
    #[uniform(1)]
    pub params: Vec4,
    #[texture(2)]
    #[sampler(3)]
    pub reflection: Handle<Image>,
}

impl Material for WaterMaterial {
    fn fragment_shader() -> ShaderRef {
        "atrium/water.wgsl".into()
    }

    fn enable_prepass() -> bool {
        false
    }

    fn enable_shadows() -> bool {
        false
    }
}

/// The camera below the lake.
#[derive(Component)]
pub struct Mirror;

/// The mirror's texture.
#[derive(Resource)]
pub struct Reflection(Handle<Image>);

/// 40% of the eye's view: the ripples blur it anyway. Same aspect, or the
/// reflection wouldn't line up with what it mirrors.
fn mirror_size(view: UVec2) -> UVec2 {
    (view.as_vec2() * 0.4).as_uvec2().max(UVec2::splat(64))
}

/// Keep the mirror's texture shaped like the eye's view — its target is the
/// window, or `--shoot`'s offscreen image, whatever size either ends up.
pub fn fit_mirror(
    eye: Single<&Camera, With<Eye>>,
    reflection: Res<Reflection>,
    mut images: ResMut<Assets<Image>>,
    mut waters: ResMut<Assets<WaterMaterial>>,
) {
    let Some(target) = eye.physical_target_size() else {
        return;
    };
    let size = mirror_size(target);
    if images.get(&reflection.0).is_some_and(|i| i.size() != size)
        && let Some(mut image) = images.get_mut(&reflection.0)
    {
        image.resize(bevy::render::render_resource::Extent3d {
            width: size.x,
            height: size.y,
            depth_or_array_layers: 1,
        });
        // A material's bind group holds the texture it was prepared with:
        // touch the lakes so they rebind the reallocated one.
        for (_, water) in waters.iter_mut() {
            water.reflection = reflection.0.clone();
        }
    }
}

pub fn spawn(
    mut commands: Commands,
    mut images: ResMut<Assets<Image>>,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<WaterMaterial>>,
    window: Single<&Window, With<PrimaryWindow>>,
) {
    let size = mirror_size(window.physical_size());
    let reflection = images.add(Image::new_target_texture(
        size.x,
        size.y,
        TextureFormat::Rgba16Float,
        None,
    ));
    commands.insert_resource(Reflection(reflection.clone()));
    commands.spawn((
        Camera3d::default(),
        Camera {
            order: -1,
            clear_color: ClearColorConfig::Custom(Color::BLACK),
            ..default()
        },
        RenderTarget::Image(reflection.clone().into()),
        Hdr,
        Tonemapping::None,
        Msaa::Off,
        Transform::default(),
        RenderLayers::layer(0),
        Mirror,
    ));

    let plane = meshes.add(Plane3d::default().mesh().size(9_000.0, 9_000.0));
    for (layer, mirrored) in [(MIRROR_WATER_LAYER, true), (SKY_WATER_LAYER, false)] {
        commands.spawn((
            Mesh3d(plane.clone()),
            MeshMaterial3d(materials.add(WaterMaterial {
                atmos: Atmos::default(),
                params: Vec4::new(if mirrored { 1.0 } else { 0.0 }, 0.0, 0.0, 0.0),
                reflection: reflection.clone(),
            })),
            RenderLayers::layer(layer),
            NotShadowCaster,
        ));
    }
}

type EyeOnly = (With<Eye>, Without<Mirror>);

/// Keep the mirror camera the eye's reflection in the lake's plane (y = 0),
/// upright — `water.wgsl` flips the image back as it samples.
pub fn mirror_eye(
    eye: Single<(&GlobalTransform, &Projection), EyeOnly>,
    mut mirror: Single<(&mut Transform, &mut Projection), With<Mirror>>,
) {
    let (eye, projection) = *eye;
    let flip = Vec3::new(1.0, -1.0, 1.0);
    let (transform, mirror_projection) = &mut *mirror;
    **transform = Transform::from_translation(eye.translation() * flip)
        .looking_to(eye.forward().as_vec3() * flip, Vec3::Y);
    **mirror_projection = projection.clone();
}
