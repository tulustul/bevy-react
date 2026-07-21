//! Effect/uniform data model for the `<layer>` host element.
//!
//! A `<layer>` renders a UI subtree to a texture and re-displays it through a
//! custom-shader `UiMaterial` — a user-defined post-process effect (glow,
//! ripple, CRT, …). This module owns the *data model* for such an effect: what
//! uniforms it declares, how they pack into the material's fixed uniform
//! budget, the WGSL accessor preamble generated over that packing, and the wire
//! types React uses to feed uniform values. The material itself, the
//! render-to-texture systems, and the protocol integration are separate layers
//! built on top of this one.
//!
//! **Why a fixed packed budget.** Every effect shares one material layout: a
//! `params: array<vec4<f32>, 16>` uniform ([`MAX_LAYER_UNIFORM_VEC4S`] slots =
//! 64 float lanes). Effects declare *named, typed* uniforms and this module
//! packs them into lanes with std140-style alignment (scalars pack tight,
//! `vec2` aligns to an even lane, `vec3`/`vec4`/colors take a whole slot), so
//! one bind-group layout serves every effect and per-frame updates are a plain
//! array write — no per-effect `AsBindGroup` codegen. Authors never touch lane
//! math: [`LayerEffect::wgsl_preamble`] generates a typed `u_<name>()` accessor
//! per uniform for the effect's fragment source to call.
//!
//! **Wire types.** [`LayerUniformValue`] / [`LayerUniformMap`] are the JS→Bevy
//! shape of a `<layer uniforms={{…}}>` prop: `Deserialize`-only (they only ever
//! travel toward Bevy) and hand-mirrored to TypeScript, like the rest of the
//! protocol. The map is a `BTreeMap` for deterministic iteration, mirroring
//! [`crate::animations::AnimatedBindings`]. Value/kind mismatches resolve to
//! `None` rather than warning here — the caller owns diagnostics, this module
//! owns semantics.
//!
//! **Material + registry.** [`LayerMaterial`] is the one generic `UiMaterial`
//! every effect renders through (uniform block [`LayerPacked`] + the layer
//! texture); which *shader* it runs is per-material data carried into the
//! pipeline key ([`LayerKey`]) and swapped in by `specialize`. [`LayerEffects`]
//! is the main-world registry: registering a [`LayerEffect`] composes its full
//! WGSL (common contract from `layer.wgsl` + generated accessor preamble +
//! author fragment) eagerly, but mints the `Handle<Shader>` lazily
//! ([`LayerEffects::ensure_shader`]) so registration works on a bare `App`
//! with no asset plugins — the codegen exporter builds one.

use std::borrow::Cow;
use std::collections::BTreeMap;
use std::fmt::Write as _;

use bevy::camera::{ImageRenderTarget, RenderTarget as BevyRenderTarget};
use bevy::prelude::{
    App, Asset, Assets, Camera, Camera2d, ClearColorConfig, Color, ColorToComponents as _,
    Commands, Component, Entity, Handle, Image, Mat4, MaterialNode, Node, Query, Reflect, Res,
    ResMut, Resource, UVec2, UiMaterial, UiMaterialKey, UiTargetCamera, Val, Vec2, Vec3, Vec4,
    Visibility, With, Without, default,
};
use bevy::render::render_resource::{
    AsBindGroup, Extent3d, RenderPipelineDescriptor, ShaderType, TextureFormat,
};
use bevy::shader::{Shader, ShaderRef};
use bevy::ui::ComputedNode;
use serde::Deserialize;

use crate::bridge::{JsBridge, RNode};
use crate::protocol::NodeId;

pub mod pointer;
pub use pointer::{LayerVirtualPointer, drive_layer_pointer, init_layer_pointer};

/// Size of the shared uniform budget, in `vec4<f32>` slots. One slot = 4 float
/// lanes, so effects get 64 lanes total.
pub const MAX_LAYER_UNIFORM_VEC4S: usize = 16;

/// The uniform budget in float lanes (`MAX_LAYER_UNIFORM_VEC4S * 4`).
const MAX_LANES: usize = MAX_LAYER_UNIFORM_VEC4S * 4;

/// The type of a declared effect uniform. `Color` is distinct from `Vec4` even
/// though both occupy four lanes: a color decodes from a hex string on the wire
/// and converts to *linear* RGBA (the shader-side space, matching how
/// [`crate::filter`] packs `base_color`), while a `Vec4` is raw numbers.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum UniformKind {
    F32,
    Vec2,
    Vec3,
    Vec4,
    Color,
}

impl UniformKind {
    /// How many float lanes the uniform *occupies* in the packed array. `Vec3`
    /// takes a whole vec4 slot (std140-style): letting a scalar ride in a
    /// vec3's `.w` lane would save four bytes at the cost of every accessor,
    /// default-packer, and future animation path having to special-case it.
    pub const fn lanes(self) -> usize {
        match self {
            UniformKind::F32 => 1,
            UniformKind::Vec2 => 2,
            UniformKind::Vec3 | UniformKind::Vec4 | UniformKind::Color => 4,
        }
    }

    /// The lane alignment of the uniform's offset: scalars pack anywhere, a
    /// `vec2` starts on an even lane, vec3/vec4/color on a vec4 boundary. This
    /// mirrors std140 so a WGSL accessor is always a single clean swizzle of
    /// one `params[i]` element — a misaligned `vec2` would straddle two slots.
    pub const fn alignment(self) -> usize {
        match self {
            UniformKind::F32 => 1,
            UniformKind::Vec2 => 2,
            UniformKind::Vec3 | UniformKind::Vec4 | UniformKind::Color => 4,
        }
    }
}

/// One declared uniform: its wire/accessor `name`, `kind`, packed position, and
/// default value. `offset` is a *float lane* index into the packed
/// `[Vec4; MAX_LAYER_UNIFORM_VEC4S]` array (lane 5 = `params[1].y`); `default`
/// is always four lanes with unused trailing lanes zeroed.
#[derive(Debug, Clone, PartialEq)]
pub struct UniformDecl {
    pub name: String,
    pub kind: UniformKind,
    pub offset: usize,
    pub default: [f32; 4],
}

/// The packed uniform layout of an effect: declarations in authoring order,
/// each already assigned its lanes. Built exclusively through
/// [`LayerEffect::uniform`], which is what upholds the alignment/budget/
/// uniqueness invariants the accessors here rely on.
#[derive(Debug, Clone, Default)]
pub struct LayerEffectSchema {
    decls: Vec<UniformDecl>,
    /// Packing cursor: first free lane after all declared uniforms.
    lanes_used: usize,
}

impl LayerEffectSchema {
    /// The declarations in authoring order.
    pub fn decls(&self) -> &[UniformDecl] {
        &self.decls
    }

    /// Find a declaration by name. Linear scan: effects declare a handful of
    /// uniforms, so a lookup map would cost more than it saves.
    pub fn lookup(&self, name: &str) -> Option<&UniformDecl> {
        self.decls.iter().find(|d| d.name == name)
    }

    /// The full packed array with every uniform at its default — the initial
    /// material params, and the base a partial `uniforms` prop merges onto.
    /// Undeclared lanes are zero.
    pub fn packed_defaults(&self) -> [Vec4; MAX_LAYER_UNIFORM_VEC4S] {
        let mut lanes = [0.0f32; MAX_LANES];
        for d in &self.decls {
            let n = d.kind.lanes();
            lanes[d.offset..d.offset + n].copy_from_slice(&d.default[..n]);
        }
        let mut out = [Vec4::ZERO; MAX_LAYER_UNIFORM_VEC4S];
        for (slot, chunk) in lanes.chunks_exact(4).enumerate() {
            out[slot] = Vec4::from_slice(chunk);
        }
        out
    }

    /// Generate the WGSL preamble: one typed `u_<name>()` accessor per uniform
    /// over the packed `material.params` array, so effect fragment source reads
    /// `u_strength()` instead of hand-counting lanes. This is the single place
    /// that knows the uniform-struct path (`material.params`); Task 1.2's
    /// material must declare `params` under a binding named `material` to match.
    pub fn wgsl_preamble(&self) -> String {
        const COMPONENTS: [char; 4] = ['x', 'y', 'z', 'w'];
        let mut out = String::new();
        for d in &self.decls {
            let slot = d.offset / 4;
            let lane = d.offset % 4;
            let name = &d.name;
            match d.kind {
                UniformKind::F32 => {
                    let c = COMPONENTS[lane];
                    let _ = writeln!(
                        out,
                        "fn u_{name}() -> f32 {{ return material.params[{slot}u].{c}; }}"
                    );
                }
                UniformKind::Vec2 => {
                    // Alignment guarantees lane is 0 or 2, so the swizzle never
                    // straddles a slot boundary.
                    let swizzle: String = COMPONENTS[lane..lane + 2].iter().collect();
                    let _ = writeln!(
                        out,
                        "fn u_{name}() -> vec2<f32> {{ return material.params[{slot}u].{swizzle}; }}"
                    );
                }
                UniformKind::Vec3 => {
                    let _ = writeln!(
                        out,
                        "fn u_{name}() -> vec3<f32> {{ return material.params[{slot}u].xyz; }}"
                    );
                }
                UniformKind::Vec4 | UniformKind::Color => {
                    let _ = writeln!(
                        out,
                        "fn u_{name}() -> vec4<f32> {{ return material.params[{slot}u]; }}"
                    );
                }
            }
        }
        out
    }
}

/// A `<layer>` effect definition: a name, a packed uniform schema, and the WGSL
/// fragment source that consumes it. Built fluently:
///
/// ```
/// use bevy_react::layer::{LayerEffect, UniformKind};
/// use bevy::prelude::Color;
///
/// let glow = LayerEffect::new("glow")
///     .uniform("strength", UniformKind::F32, 1.0)
///     .uniform("tint", UniformKind::Color, Color::WHITE)
///     .fragment_wgsl("/* fragment body calling u_strength() / u_tint() */");
/// ```
///
/// Definition mistakes (duplicate names, blowing the 64-lane budget) panic
/// immediately in the builder: effects are authored in Rust at startup, so a
/// loud panic at definition time beats a silently corrupt layout at render
/// time.
#[derive(Debug, Clone)]
pub struct LayerEffect {
    name: Cow<'static, str>,
    schema: LayerEffectSchema,
    backdrop: bool,
    fragment_wgsl: Option<Cow<'static, str>>,
}

/// Whether `name` is an ASCII identifier (`[A-Za-z_][A-Za-z0-9_]*`) — the
/// character set that is safe as a WGSL accessor name, a generated TypeScript
/// type/property name, and JSDoc comment text alike.
fn is_identifier(name: &str) -> bool {
    let mut chars = name.chars();
    matches!(chars.next(), Some(c) if c.is_ascii_alphabetic() || c == '_')
        && chars.all(|c| c.is_ascii_alphanumeric() || c == '_')
}

impl LayerEffect {
    /// Start a new effect definition named `name` (the key `<layer effect>`
    /// will select it by).
    ///
    /// # Panics
    /// On a name that is not an identifier (`[A-Za-z_][A-Za-z0-9_]*`): the name
    /// becomes a generated TypeScript type (`<Pascal>Uniforms`) and JSDoc text,
    /// so e.g. a `*/` would break the generated module and punctuation-split
    /// names invite Pascal-case collisions — reject it at definition time,
    /// where the author is (the exporter keeps a Pascal-collision panic as a
    /// backstop).
    pub fn new(name: impl Into<Cow<'static, str>>) -> Self {
        let name = name.into();
        assert!(
            is_identifier(&name),
            "layer effect name {name:?} is not a valid identifier ([A-Za-z_][A-Za-z0-9_]*)"
        );
        LayerEffect {
            name,
            schema: LayerEffectSchema::default(),
            backdrop: false,
            fragment_wgsl: None,
        }
    }

    /// Declare a uniform. Packing happens eagerly here — the decl's lanes are
    /// fixed the moment it is declared, so declaration order is layout order
    /// and [`LayerEffectSchema`] is always in a consistent, queryable state.
    ///
    /// # Panics
    /// On a name that is not an identifier, a duplicate uniform name, a default
    /// wider than the declared kind, or when the declaration exceeds the
    /// 64-lane ([`MAX_LAYER_UNIFORM_VEC4S`] vec4) budget.
    pub fn uniform(
        mut self,
        name: impl Into<String>,
        kind: UniformKind,
        default: impl IntoUniformDefault,
    ) -> Self {
        let name = name.into();
        // The name becomes the `u_<name>()` WGSL accessor and a generated TS
        // property, so anything but an identifier would only surface later as
        // an opaque naga compile error — reject it here, where the author is.
        assert!(
            is_identifier(&name),
            "layer effect {:?}: uniform name {name:?} is not a valid identifier \
             ([A-Za-z_][A-Za-z0-9_]*)",
            self.name
        );
        assert!(
            self.schema.lookup(&name).is_none(),
            "layer effect {:?}: duplicate uniform {name:?}",
            self.name
        );
        // A uniform named after a contract helper would generate a `u_<name>()`
        // accessor colliding with the contract's own — an opaque naga
        // redefinition error at render time. Reject it where the author is.
        assert!(
            !RESERVED_ACCESSOR_NAMES.contains(&name.as_str()),
            "layer effect {:?}: uniform name {name:?} is reserved — the common contract \
             already defines u_{name}()",
            self.name
        );
        // A default carrying data past the kind's lanes (e.g. a Color default
        // on an F32 uniform) is a kind/default mismatch that packing would
        // silently truncate — catch it at definition time.
        let default = default.into_default_lanes();
        assert!(
            default[kind.lanes()..].iter().all(|&lane| lane == 0.0),
            "layer effect {:?}: uniform {name:?} has non-zero default lanes beyond \
             {kind:?}'s width — kind/default mismatch?",
            self.name
        );
        let offset = self.schema.lanes_used.next_multiple_of(kind.alignment());
        assert!(
            offset + kind.lanes() <= MAX_LANES,
            "layer effect {:?}: uniform {name:?} exceeds the uniform budget \
             ({MAX_LAYER_UNIFORM_VEC4S} vec4s / {MAX_LANES} float lanes)",
            self.name
        );
        self.schema.lanes_used = offset + kind.lanes();
        self.schema.decls.push(UniformDecl {
            name,
            kind,
            offset,
            default,
        });
        self
    }

    /// Mark the effect as sampling the *backdrop* (what renders behind the
    /// layer) instead of / in addition to the layer's own subtree. Only stored
    /// for now; the render plumbing consumes it in a later task.
    pub fn backdrop(mut self, backdrop: bool) -> Self {
        self.backdrop = backdrop;
        self
    }

    /// Attach the effect's WGSL fragment source (the source text itself, not an
    /// asset path — effects are self-contained Rust definitions, not files the
    /// asset server must locate).
    pub fn fragment_wgsl(mut self, source: impl Into<Cow<'static, str>>) -> Self {
        self.fragment_wgsl = Some(source.into());
        self
    }

    /// The effect's name.
    pub fn name(&self) -> &str {
        &self.name
    }

    /// The packed uniform schema.
    pub fn schema(&self) -> &LayerEffectSchema {
        &self.schema
    }

    /// Whether the effect samples the backdrop (see [`Self::backdrop`]).
    pub fn is_backdrop(&self) -> bool {
        self.backdrop
    }

    /// The attached WGSL fragment source, if any.
    pub fn fragment_source(&self) -> Option<&str> {
        self.fragment_wgsl.as_deref()
    }

    /// The WGSL accessor preamble for this effect's schema (see
    /// [`LayerEffectSchema::wgsl_preamble`]).
    pub fn wgsl_preamble(&self) -> String {
        self.schema.wgsl_preamble()
    }
}

/// Conversion of an ergonomic default into the four stored lanes, so
/// [`LayerEffect::uniform`] accepts `1.0`, `[2.0, 3.0]`, or a bevy [`Color`]
/// directly. Unused trailing lanes are zero.
pub trait IntoUniformDefault {
    fn into_default_lanes(self) -> [f32; 4];
}

impl IntoUniformDefault for f32 {
    fn into_default_lanes(self) -> [f32; 4] {
        [self, 0.0, 0.0, 0.0]
    }
}

impl IntoUniformDefault for [f32; 2] {
    fn into_default_lanes(self) -> [f32; 4] {
        [self[0], self[1], 0.0, 0.0]
    }
}

impl IntoUniformDefault for [f32; 3] {
    fn into_default_lanes(self) -> [f32; 4] {
        [self[0], self[1], self[2], 0.0]
    }
}

impl IntoUniformDefault for [f32; 4] {
    fn into_default_lanes(self) -> [f32; 4] {
        self
    }
}

impl IntoUniformDefault for Color {
    /// Colors convert to linear RGBA — the space the shader works in — exactly
    /// like [`crate::filter`] packs `base_color`.
    fn into_default_lanes(self) -> [f32; 4] {
        self.to_linear().to_f32_array()
    }
}

/// One uniform value as it arrives from JS: a bare number, a numeric array, or
/// a CSS color string. Untagged because the JSON shape (`0.5` / `[1, 0]` /
/// `"#ff0000ff"`) is self-describing; the declared [`UniformKind`] — not the
/// wire shape — decides what the value *means*, via [`Self::resolve`].
#[derive(Debug, Clone, PartialEq, Deserialize)]
#[serde(untagged)]
pub enum LayerUniformValue {
    Scalar(f32),
    Vec(Vec<f32>),
    Hex(String),
}

/// The `<layer uniforms={{…}}>` wire map: uniform name → value. `BTreeMap` for
/// deterministic iteration order, mirroring
/// [`crate::animations::AnimatedBindings`].
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
pub struct LayerUniformMap(pub BTreeMap<String, LayerUniformValue>);

impl LayerUniformMap {
    /// The wire value for uniform `name`, if the map carries one.
    pub fn get(&self, name: &str) -> Option<&LayerUniformValue> {
        self.0.get(name)
    }
}

impl LayerUniformValue {
    /// Resolve this wire value against a declared kind, producing the four
    /// lanes to write (trailing lanes zeroed). Any mismatch — wrong shape,
    /// wrong vec arity, unparseable color — is `None`: this module owns the
    /// semantics, the caller owns diagnostics (it knows the node and uniform
    /// name to report).
    ///
    /// Color strings go through the same CSS parser styles use
    /// ([`crate::canvas::parse_css_color`]) and convert to linear RGBA like
    /// [`crate::filter`] does for `base_color`, so `"#ff0000ff"` here and
    /// `backgroundColor: "#ff0000ff"` there agree on the shader-side value.
    pub fn resolve(&self, kind: UniformKind) -> Option<[f32; 4]> {
        match (self, kind) {
            (LayerUniformValue::Scalar(v), UniformKind::F32) => Some([*v, 0.0, 0.0, 0.0]),
            (LayerUniformValue::Vec(v), UniformKind::Vec2) if v.len() == 2 => {
                Some([v[0], v[1], 0.0, 0.0])
            }
            (LayerUniformValue::Vec(v), UniformKind::Vec3) if v.len() == 3 => {
                Some([v[0], v[1], v[2], 0.0])
            }
            (LayerUniformValue::Vec(v), UniformKind::Vec4) if v.len() == 4 => {
                Some([v[0], v[1], v[2], v[3]])
            }
            (LayerUniformValue::Hex(s), UniformKind::Color) => {
                let srgba = crate::canvas::parse_css_color(s)?;
                Some(Color::from(srgba).to_linear().to_f32_array())
            }
            _ => None,
        }
    }
}

/// The `style.transform3d` wire spec of a `<layer>`: optional CSS-like 3D
/// transform ops, applied in a FIXED order regardless of JSON key order
/// (CSS-transform-like, innermost-last — see [`compose_transform`]):
///
/// ```text
/// perspective → translate → rotateX → rotateY → rotateZ → scale
/// ```
///
/// Angles are DEGREES, lengths logical pixels. `Deserialize`-only and
/// unknown-key tolerant like every other style struct (no
/// `deny_unknown_fields` — a stray key is ignored, matching `Style`'s own
/// tolerance). Module-owned like [`LayerUniformMap`]; `protocol::Style`
/// references it by path.
#[derive(Debug, Clone, Copy, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LayerTransformSpec {
    /// CSS-style perspective distance in logical px (`w' = 1 - z/d`): smaller
    /// = stronger foreshortening. Non-positive values are ignored (CSS
    /// requires a positive length; `None`/invalid = no perspective).
    #[serde(default)]
    pub perspective: Option<f32>,
    /// Translation along screen x, logical px.
    #[serde(default)]
    pub translate_x: Option<f32>,
    /// Translation along screen y (positive = down), logical px.
    #[serde(default)]
    pub translate_y: Option<f32>,
    /// Translation along z (positive = toward the viewer), logical px. Only
    /// observable under `perspective`.
    #[serde(default)]
    pub translate_z: Option<f32>,
    /// Rotation about the x axis, DEGREES. Positive tips the TOP edge away
    /// from the viewer (the CSS `rotateX` convention).
    #[serde(default)]
    pub rotate_x: Option<f32>,
    /// Rotation about the y axis, DEGREES. Positive swings the RIGHT edge
    /// away from the viewer (the CSS `rotateY` convention).
    #[serde(default)]
    pub rotate_y: Option<f32>,
    /// Rotation in the screen plane, DEGREES. Positive is CLOCKWISE on screen
    /// (the CSS convention in y-down space).
    #[serde(default)]
    pub rotate_z: Option<f32>,
    /// Uniform scale (both axes), unless overridden per axis.
    #[serde(default)]
    pub scale: Option<f32>,
    /// X-axis scale; overrides [`scale`](Self::scale) on x.
    #[serde(default)]
    pub scale_x: Option<f32>,
    /// Y-axis scale; overrides [`scale`](Self::scale) on y.
    #[serde(default)]
    pub scale_y: Option<f32>,
}

impl LayerTransformSpec {
    /// Every op absent — the identity transform. Lets callers (and
    /// [`compose_transform`]) skip the matrix work entirely.
    pub fn is_identity(&self) -> bool {
        *self == LayerTransformSpec::default()
    }
}

/// Compose `spec` into one matrix over the display box's LOGICAL-pixel space
/// (origin top-left, x right, y DOWN, z toward the viewer, `size` = the box's
/// logical dimensions), about the box center:
///
/// ```text
/// M = T(center) · P · T(translate) · Rx · Ry · Rz · S · T(-center)
/// ```
///
/// i.e. CSS-transform semantics with `transform-origin: center` — the
/// rightmost factor applies to the point first (innermost-last), so `scale`
/// happens in the untranslated/unrotated box frame and `translate` shifts
/// along the SCREEN axes, exactly like `transform: perspective(d)
/// translate3d(…) rotateX(…) rotateY(…) rotateZ(…) scale(…)`.
///
/// Sign conventions (all CSS-matching in this y-down/z-toward-viewer frame,
/// where the standard right-handed rotation matrices reproduce CSS exactly):
/// positive `rotateX` tips the top edge away from the viewer, positive
/// `rotateY` swings the right edge away, positive `rotateZ` turns clockwise
/// on screen. `perspective` is the standard CSS matrix — identity with the
/// z→w coefficient set to `-1/d` (`w' = 1 - z/d`), so points nearer the
/// viewer (`z > 0`) divide by a smaller w and appear larger.
///
/// The identity spec returns exactly [`Mat4::IDENTITY`] (no
/// `T(center)·…·T(-center)` float drift).
pub fn compose_transform(spec: &LayerTransformSpec, size: Vec2) -> Mat4 {
    if spec.is_identity() {
        return Mat4::IDENTITY;
    }
    let center = Vec3::new(size.x * 0.5, size.y * 0.5, 0.0);
    let mut m = Mat4::from_translation(center);
    if let Some(d) = spec.perspective
        && d > 0.0
    {
        // CSS perspective: identity except the z→w coefficient. glam is
        // column-major, so that coefficient lives in the z basis column's w
        // component: out.w = in.w + z_axis.w * in.z = 1 - z/d.
        let mut p = Mat4::IDENTITY;
        p.z_axis.w = -1.0 / d;
        m *= p;
    }
    let translate = Vec3::new(
        spec.translate_x.unwrap_or(0.0),
        spec.translate_y.unwrap_or(0.0),
        spec.translate_z.unwrap_or(0.0),
    );
    if translate != Vec3::ZERO {
        m *= Mat4::from_translation(translate);
    }
    if let Some(deg) = spec.rotate_x {
        m *= Mat4::from_rotation_x(deg.to_radians());
    }
    if let Some(deg) = spec.rotate_y {
        m *= Mat4::from_rotation_y(deg.to_radians());
    }
    if let Some(deg) = spec.rotate_z {
        m *= Mat4::from_rotation_z(deg.to_radians());
    }
    let sx = spec.scale_x.or(spec.scale).unwrap_or(1.0);
    let sy = spec.scale_y.or(spec.scale).unwrap_or(1.0);
    if sx != 1.0 || sy != 1.0 {
        m *= Mat4::from_scale(Vec3::new(sx, sy, 1.0));
    }
    m * Mat4::from_translation(-center)
}

/// The currently composed 3D transform of a `<layer>` display node — the same
/// matrix `drive_layers` uploads to `packed.transform`, mirrored on the entity
/// so the input path can invert it (Task 2.3) without re-deriving spec + size.
/// Identity while the layer has no `transform3d` (or isn't laid out yet).
///
/// ABSENCE CONTRACT: the component does not exist until the first
/// `drive_layers` command flush after the display spawns (it is inserted via
/// `Commands`, not stamped at create time) — readers must treat absence as
/// the identity transform.
#[derive(Component, Debug, Clone, Copy, PartialEq)]
pub struct LayerTransform(pub Mat4);

/// Marks a `<layer>`'s on-screen **display node**: the styled UI node that
/// renders the layer's captured subtree through [`LayerMaterial`]. Stamped by
/// the reconciler's `"layer"` create arm; `companion` is the detached
/// [`LayerRoot`] the layer's JSX children actually attach to, and `effect` is
/// the *resolved* effect name (an unknown request already fell back to
/// `"none"`), kept so a uniforms-only re-render can find its schema without
/// re-resolving — and re-warning about — the requested name.
#[derive(Component, Debug, Clone)]
pub struct RLayer {
    /// The layer's detached companion root (see [`LayerRoot`]).
    pub companion: Entity,
    /// The resolved effect name (a key into [`LayerEffects`], never unknown).
    pub effect: String,
}

/// Marks a `<layer>`'s **companion root**: the parentless, initially hidden
/// node the layer's children hang off, so the subtree lays out (and later
/// renders to texture) outside the on-screen hierarchy — the layer-flavored
/// twin of a `<surface>` detached root. Points back at the display node.
#[derive(Component, Debug, Clone, Copy)]
pub struct LayerRoot(pub Entity);

/// Pack the wire uniform values in `map` over `params` (typically the schema's
/// [`packed_defaults`](LayerEffectSchema::packed_defaults)), writing each
/// resolved value's lanes at its declared offset. An unknown uniform name, or
/// a value whose shape doesn't match the declared kind, keeps the base lanes
/// and reports a `"layerUniform"` [`crate::diag`] warning (attributed to the
/// ambient node scope) — the uniform *name* rides as the warning value so the
/// devtools inspector can match the `uniforms` map's offending key.
pub fn pack_uniforms(
    schema: &LayerEffectSchema,
    map: &LayerUniformMap,
    params: &mut [Vec4; MAX_LAYER_UNIFORM_VEC4S],
) {
    for (name, value) in &map.0 {
        let Some(decl) = schema.lookup(name) else {
            tracing::warn!(
                target: "bevy_react",
                "unknown layer uniform {name:?} for this effect; ignoring"
            );
            crate::diag::report(
                "layerUniform",
                name,
                &format!("unknown uniform \"{name}\" — the effect does not declare it"),
            );
            continue;
        };
        let Some(lanes) = value.resolve(decl.kind) else {
            tracing::warn!(
                target: "bevy_react",
                "layer uniform {name:?} value doesn't match its declared {:?}; keeping default",
                decl.kind
            );
            crate::diag::report(
                "layerUniform",
                name,
                &format!(
                    "value for uniform \"{name}\" doesn't match its declared {:?} — keeping the default",
                    decl.kind
                ),
            );
            continue;
        };
        for (i, lane) in lanes.iter().enumerate().take(decl.kind.lanes()) {
            let at = decl.offset + i;
            params[at / 4][at % 4] = *lane;
        }
    }
}

/// The uniform block every `<layer>` material shares, `#[uniform(0)]` of
/// [`LayerMaterial`]. Kept trivially WGSL-mirrorable — the mirror in
/// `layer.wgsl`'s common contract is:
///
/// ```wgsl
/// struct LayerParams {
///     transform: mat4x4<f32>,
///     params: array<vec4<f32>, 16>,
///     misc: vec4<f32>,
/// }
/// @group(1) @binding(0) var<uniform> material: LayerParams;
/// ```
///
/// (`16` = [`MAX_LAYER_UNIFORM_VEC4S`]; a test pins the two in sync — field
/// order AND byte layout: the mat4 is 64 bytes at offset 0 with 16-byte
/// alignment, so `params` follows at offset 64 and `misc` at 320.)
#[derive(ShaderType, Debug, Clone, PartialEq, Reflect)]
pub struct LayerPacked {
    /// The `<layer>`'s composed 3D transform ([`compose_transform`] over the
    /// retained `style.transform3d` + the display's logical size), written by
    /// [`drive_layers`] and applied projectively by the common contract's
    /// vertex entry point in `layer.wgsl`.
    pub transform: Mat4,
    /// The packed effect uniforms, laid out by [`LayerEffectSchema`] and read
    /// by the generated `u_<name>()` accessors.
    pub params: [Vec4; MAX_LAYER_UNIFORM_VEC4S],
    /// `x` = group alpha (a whole-subtree fade, `u_group_alpha()` in WGSL);
    /// `y` = the display's scale factor (physical px per logical px — the
    /// vertex shader converts corners into the LOGICAL space `transform` was
    /// composed in and back); `z` = 3D-transform-enabled flag (`0.0` when
    /// `transform` is the identity, telling the vertex shader to take the
    /// bit-exact default-pipeline path — the identity regression guarantee);
    /// `w` = unused.
    ///
    /// LANE BUDGET: `w` is the LAST free lane. Its next occupant must update
    /// this doc and the `LayerParams` mirror comment in `layer.wgsl` in the
    /// same change; anything beyond that should add a second vec4 field (and
    /// extend the layout-pinning test) rather than bit-pack meanings into
    /// existing lanes.
    pub misc: Vec4,
}

impl Default for LayerPacked {
    /// The identity transform and zeroed params under a group alpha of `1.0`,
    /// scale factor `1.0`, and the transform flag OFF — an untransformed,
    /// fully visible layer with every undeclared lane zero, matching
    /// [`LayerEffectSchema::packed_defaults`].
    fn default() -> Self {
        LayerPacked {
            transform: Mat4::IDENTITY,
            params: [Vec4::ZERO; MAX_LAYER_UNIFORM_VEC4S],
            misc: Vec4::new(1.0, 1.0, 0.0, 0.0),
        }
    }
}

/// The one generic `UiMaterial` every `<layer>` renders through: the shared
/// packed uniform block plus the layer's rendered-subtree texture. Which
/// *effect shader* runs is not a binding at all — `shader` is a plain field the
/// `AsBindGroup` derive ignores; it reaches the render pipeline through
/// [`LayerKey`] (the material's `bind_group_data`), and [`UiMaterial::specialize`]
/// swaps it into the fragment stage. One bind-group layout thus serves every
/// effect, and switching effects is a pipeline-key change, not a new material
/// type.
#[derive(Asset, AsBindGroup, Reflect, Clone)]
#[bind_group_data(LayerKey)]
pub struct LayerMaterial {
    /// The packed effect uniforms + group alpha (see [`LayerPacked`]).
    #[uniform(0)]
    pub packed: LayerPacked,
    /// The layer's rendered subtree.
    #[texture(1)]
    #[sampler(2)]
    pub layer: Handle<Image>,
    /// The effect's composed fragment shader (from
    /// [`LayerEffects::ensure_shader`]). Not a GPU binding — carried into
    /// [`LayerKey`] and applied by `specialize`.
    pub shader: Handle<Shader>,
}

/// [`LayerMaterial`]'s pipeline-key data: the composed effect shader. Materials
/// with different shaders specialize into different pipelines; everything else
/// about the pipeline is shared.
#[derive(Clone, PartialEq, Eq, Hash)]
pub struct LayerKey {
    pub shader: Handle<Shader>,
}

impl From<&LayerMaterial> for LayerKey {
    fn from(material: &LayerMaterial) -> Self {
        LayerKey {
            shader: material.shader.clone(),
        }
    }
}

impl UiMaterial for LayerMaterial {
    fn fragment_shader() -> ShaderRef {
        // The embedded `layer.wgsl` (the composed "none" shader) — a safe
        // fallback only: every real material carries a registry shader that
        // `specialize` swaps in, so this never actually renders. Embedded by
        // `embedded_asset!(app, "layer.wgsl")` in the plugin; the crate (lib
        // name `bevy_react`) prefixes the embedded path.
        "embedded://bevy_react/layer.wgsl".into()
    }

    fn specialize(descriptor: &mut RenderPipelineDescriptor, key: UiMaterialKey<Self>) {
        // The layer texture is EFFECTIVELY PREMULTIPLIED: the capture camera
        // clears to transparent and `bevy_ui` renders into it with straight-
        // alpha blending, leaving RGB scaled by A wherever content blended
        // over the clear. The UI material pipeline's default target blend is
        // straight (`ALPHA_BLENDING`), which would multiply RGB by alpha a
        // SECOND time on composite — dark anti-aliased edges and a
        // quadratically-dark group-opacity fade (verified visually, Task
        // 1.8). Composite premultiplied instead; the effect contract's
        // "multiply ALL channels by `u_group_alpha()`" is exactly correct
        // under premultiplied semantics.
        if let Some(fragment) = &mut descriptor.fragment
            && let Some(Some(target)) = fragment.targets.first_mut()
        {
            target.blend =
                Some(bevy::render::render_resource::BlendState::PREMULTIPLIED_ALPHA_BLENDING);
        }
        // A default handle (e.g. a default-constructed material) points at no
        // shader asset — overriding with it would stall the pipeline forever.
        // Leave the embedded fallback (fragment AND the pipeline's default UI
        // vertex shader) in place instead; that path never actually renders.
        if key.bind_group_data.shader == Handle::default() {
            return;
        }
        if let Some(fragment) = &mut descriptor.fragment {
            fragment.shader = key.bind_group_data.shader.clone();
        }
        // The composed source also carries the common contract's projective
        // vertex entry point (`style.transform3d`); every effect pipeline must
        // run it, or the uploaded matrix would be dead weight for that effect.
        descriptor.vertex.shader = key.bind_group_data.shader;
    }
}

/// The embedded `layer.wgsl` text: common contract + built-in `"none"`
/// fragment, split by [`NONE_FRAGMENT_MARKER`].
const LAYER_WGSL: &str = include_str!("layer.wgsl");

/// The exact marker line separating `layer.wgsl`'s two parts. Everything above
/// is the common contract prepended to every composed effect shader; everything
/// below is the built-in `"none"` fragment.
const NONE_FRAGMENT_MARKER: &str =
    "// ---- built-in \"none\" fragment (the common contract ends here) ----";

/// Uniform names whose `u_<name>()` accessor the common contract already
/// defines — [`LayerEffect::uniform`] rejects them so a declared uniform can
/// never shadow a contract helper. Grows in lockstep with the helpers in
/// `layer.wgsl`'s contract section.
const RESERVED_ACCESSOR_NAMES: &[&str] = &["group_alpha"];

/// Count occurrences of a stage attribute (`"@fragment"` / `"@vertex"`) in
/// `source`, ignoring `//` line comments (block comments are not stripped —
/// see the caller's known-limitation note).
fn count_entry_points(source: &str, attribute: &str) -> usize {
    source
        .lines()
        .map(|line| line.split_once("//").map_or(line, |(code, _)| code))
        .map(|code| code.matches(attribute).count())
        .sum()
}

/// Split `layer.wgsl` into `(common contract, "none" fragment)`. One file keeps
/// the embedded fallback and the composition input from ever drifting apart;
/// the marker line is the seam.
///
/// # Panics
/// If the marker line was edited out of `layer.wgsl` (a build-time bug — every
/// registry construction, including `"none"`'s, goes through this).
fn split_layer_wgsl() -> (&'static str, &'static str) {
    LAYER_WGSL
        .split_once(NONE_FRAGMENT_MARKER)
        .expect("layer.wgsl must contain the none-fragment marker line")
}

/// A registered effect, ready to bind: its schema, backdrop flag, fully
/// composed WGSL, and the lazily minted shader handle.
#[derive(Debug, Clone)]
pub struct RegisteredEffect {
    /// The effect's packed uniform layout.
    pub schema: LayerEffectSchema,
    /// Whether the effect samples the backdrop (see [`LayerEffect::backdrop`]).
    pub wants_backdrop: bool,
    /// The complete composed WGSL: common contract + accessor preamble +
    /// author fragment.
    pub source: String,
    /// The shader asset for `source`, minted on first
    /// [`LayerEffects::ensure_shader`] — `None` until then, so a bare `App`
    /// (no asset plugins) can still register and introspect effects.
    pub shader: Option<Handle<Shader>>,
}

/// The main-world registry of `<layer>` effects, keyed by the name
/// `<layer effect>` selects. `BTreeMap` so iteration (and thus the future
/// codegen export) is deterministic. A fresh registry always contains
/// [`"none"`](Self::register) — the identity effect a `<layer>` without an
/// `effect` prop uses — plus the two built-in demo effects (`"dissolve"`,
/// `"chromaticAberration"`), so every app and the bare codegen exporter agree
/// on the same baseline set (they land in every generated `bevy.ts`).
#[derive(Resource, Debug)]
pub struct LayerEffects(BTreeMap<String, RegisteredEffect>);

impl Default for LayerEffects {
    fn default() -> Self {
        let (_, none_fragment) = split_layer_wgsl();
        let mut effects = LayerEffects(BTreeMap::new());
        // "none" is an ordinary registered effect (empty schema, no backdrop,
        // fragment = re-display the layer texture) so the material/specialize
        // path is uniform — no special-cased default branch downstream.
        effects.register(LayerEffect::new("none").fragment_wgsl(none_fragment));
        // Built-in demo effects, registered like any user effect. Their WGSL
        // lives beside the crate as user-fragment-only sources (the common
        // contract + accessor preamble are prepended at registration).
        effects.register(
            LayerEffect::new("dissolve")
                .uniform("threshold", UniformKind::F32, 0.0)
                .uniform("softness", UniformKind::F32, 0.08)
                .fragment_wgsl(include_str!("layer_fx/dissolve.wgsl")),
        );
        effects.register(
            LayerEffect::new("chromaticAberration")
                .uniform("strength", UniformKind::F32, 0.0)
                .uniform("direction", UniformKind::Vec2, [1.0, 0.0])
                .fragment_wgsl(include_str!("layer_fx/chromatic.wgsl")),
        );
        effects
    }
}

impl LayerEffects {
    /// Register `effect`, composing its full WGSL (common contract + generated
    /// accessor preamble + author fragment) eagerly. The shader *asset* is not
    /// created here — see [`Self::ensure_shader`] — so this works on a bare
    /// `App` with no asset plugins.
    ///
    /// # Panics
    /// On a duplicate effect name, a missing fragment source, or a composed
    /// shader without exactly one `@fragment` entry point: all are authoring
    /// bugs, and effects are authored in Rust at startup, so a loud panic at
    /// definition time beats a blank layer (or an opaque naga error) at render
    /// time.
    pub fn register(&mut self, effect: LayerEffect) {
        let name = effect.name().to_owned();
        assert!(
            !self.0.contains_key(&name),
            "layer effect {name:?} is already registered"
        );
        let fragment = effect.fragment_source().unwrap_or_else(|| {
            panic!("layer effect {name:?} has no fragment source (fragment_wgsl not called)")
        });
        let (common, _) = split_layer_wgsl();
        let preamble = effect.wgsl_preamble();
        let source = format!("{common}\n{preamble}\n{fragment}");
        // Zero entry points render nothing; two (a pasted-in complete shader)
        // are a redefinition — both would only surface as opaque naga errors.
        // Known limitation: only `//` line comments are stripped before
        // counting, a `@fragment` inside a /* block comment */ still counts.
        // (`@vertex` never substring-matches `@fragment`, so the contract's
        // vertex entry point doesn't disturb this count.)
        let entry_points = count_entry_points(&source, "@fragment");
        assert!(
            entry_points == 1,
            "layer effect {name:?}: the composed shader must contain exactly one @fragment \
             entry point, found {entry_points}"
        );
        // The common contract contributes the ONE vertex entry point every
        // effect pipeline runs (`specialize` points the vertex stage at the
        // composed shader) — an author fragment carrying its own would be a
        // naga redefinition error at render time.
        let vertex_entry_points = count_entry_points(&source, "@vertex");
        assert!(
            vertex_entry_points == 1,
            "layer effect {name:?}: the composed shader must contain exactly one @vertex \
             entry point (the common contract's), found {vertex_entry_points}"
        );
        self.0.insert(
            name,
            RegisteredEffect {
                schema: effect.schema().clone(),
                wants_backdrop: effect.is_backdrop(),
                source,
                shader: None,
            },
        );
    }

    /// The registered effect named `name`, if any.
    pub fn get(&self, name: &str) -> Option<&RegisteredEffect> {
        self.0.get(name)
    }

    /// Iterate all registered effects, sorted by name (deterministic).
    pub fn iter(&self) -> impl Iterator<Item = (&str, &RegisteredEffect)> {
        self.0.iter().map(|(name, effect)| (name.as_str(), effect))
    }

    /// The shader handle for effect `name`, minting the [`Shader`] asset from
    /// the composed source on first call (under a per-effect virtual path, so
    /// asset-server diagnostics name the effect). `None` for an unknown effect
    /// — the caller owns diagnostics.
    pub fn ensure_shader(
        &mut self,
        name: &str,
        shaders: &mut Assets<Shader>,
    ) -> Option<Handle<Shader>> {
        let effect = self.0.get_mut(name)?;
        Some(
            effect
                .shader
                .get_or_insert_with(|| {
                    shaders.add(Shader::from_wgsl(
                        effect.source.clone(),
                        format!("bevy_react/layer/{name}.wgsl"),
                    ))
                })
                .clone(),
        )
    }
}

/// App-side registration of `<layer>` effects, mirroring how
/// [`crate::ReactAppExt`] registers message handlers:
///
/// ```ignore
/// app.add_plugins(ReactUiPlugin::new(bundle))
///     .register_layer_effect(
///         LayerEffect::new("glow")
///             .uniform("strength", UniformKind::F32, 1.0)
///             .fragment_wgsl(include_str!("glow.wgsl")),
///     );
/// ```
pub trait LayerAppExt {
    /// Register a `<layer>` effect (see [`LayerEffects::register`]). Order
    /// relative to [`crate::ReactUiPlugin`] doesn't matter — the registry is
    /// created on demand.
    fn register_layer_effect(&mut self, effect: LayerEffect) -> &mut Self;
}

impl LayerAppExt for App {
    fn register_layer_effect(&mut self, effect: LayerEffect) -> &mut Self {
        self.world_mut()
            .get_resource_or_insert_with(LayerEffects::default)
            .register(effect);
        self
    }
}

/// Marks the offscreen 2D UI camera [`bind_layers`] spawns for a `<layer>`,
/// pointing back at the layer's on-screen **display node** so [`drive_layers`]
/// can sync its render-target scale factor and despawn the camera when the
/// display disappears.
#[derive(Component, Debug, Clone, Copy)]
pub struct LayerCamera(pub Entity);

/// How many `<layer>` ancestors `id` has in the React shadow tree. A nested
/// layer's camera must render BEFORE its outer layer's (the outer capture
/// samples the inner layer's display node, which shows the inner texture — so
/// the inner texture must be fresh first): the camera order is `-1 - depth`,
/// making inner cameras strictly earlier than outer ones, and every layer
/// earlier than the main camera (order 0) that composites them.
///
/// The walk follows `parent_of` (the ordinary shadow-tree parentage) and falls
/// through `surface_parent` at detached-root boundaries (`<surface>`/`<root>`
/// keep their React parentage there instead), so a layer inside a detached
/// subtree inside a layer still counts its outer layer.
///
/// Phase-2 follow-up: a layer inside a `<surface>` with no outer layer gets
/// order -1, TYING with the surface's own camera — a one-frame-stale sample
/// risk to resolve when surface interop is formalized.
fn layer_depth(bridge: &JsBridge, id: NodeId) -> usize {
    let mut depth = 0;
    let mut cur = id;
    while let Some(&parent) = bridge
        .parent_of
        .get(&cur)
        .or_else(|| bridge.surface_parent.get(&cur))
    {
        if bridge.layers.contains_key(&parent) {
            depth += 1;
        }
        cur = parent;
    }
    depth
}

/// Largest layer-texture dimension we allocate, in physical pixels — a guard
/// against a degenerate layout asking for an enormous texture. Matches
/// `crate::surface`'s cap (a layer texture is a UI capture, like a surface's).
const MAX_DIM: u32 = 4096;

/// A `<layer>` render texture's per-axis size for a laid-out physical box:
/// rounded, clamped to `[1, MAX_DIM]`. Layers size EXACTLY — the companion
/// subtree lays out to the display's box and the composite samples the full
/// texture (UV 0→1), so a padded/quantized texture would render the capture
/// shrunk with dead margins. (Unlike a portal, whose camera fills any target
/// size, so it can quantize to dodge realloc churn.) Realloc churn during
/// animated resizes is accepted for phase 1.
fn exact_size(physical: Vec2) -> UVec2 {
    let axis = |v: f32| (v.round().max(1.0) as u32).min(MAX_DIM);
    UVec2::new(axis(physical.x), axis(physical.y))
}

/// The display-node data [`bind_layers`] reads: node id (for the camera-order
/// depth walk), the material handle (to swap the placeholder texture), and the
/// laid-out box. The box is `Option` for form only — `ComputedNode` is a
/// required component of `Node`, so in practice it's always present, just
/// zero-sized before first layout; `drive_layers` does the first real sizing.
/// A `type` so the system signature stays within `clippy::type_complexity`.
type UnboundDisplayQuery<'w, 's> = Query<
    'w,
    's,
    (
        &'static RNode,
        &'static MaterialNode<LayerMaterial>,
        Option<&'static ComputedNode>,
    ),
    With<RLayer>,
>;

/// Bind each freshly-created `<layer>` to its render-to-texture plumbing:
/// allocate the render-target image (replacing the material's blank
/// placeholder), spawn the offscreen UI camera, and point the companion root at
/// it. Runs after the reconciler op drain so a layer created this frame binds
/// the same frame (like `bind_surfaces`). "Unbound" is detected exactly like a
/// surface root: the companion carries no [`UiTargetCamera`] yet.
///
/// A create and its append arrive in the same reconciler batch (one React
/// commit), so the shadow parentage [`layer_depth`] reads is already recorded
/// when the bind runs.
pub fn bind_layers(
    mut commands: Commands,
    bridge: Res<JsBridge>,
    mut images: ResMut<Assets<Image>>,
    mut materials: ResMut<Assets<LayerMaterial>>,
    displays: UnboundDisplayQuery,
    unbound: Query<(Entity, &LayerRoot), Without<UiTargetCamera>>,
) {
    for (companion, root) in &unbound {
        // Display already gone (despawned the same frame it was created):
        // leave the companion for `drive_layers`' orphan GC.
        let Ok((rnode, mat_node, computed)) = displays.get(root.0) else {
            continue;
        };

        // The render target, sized to the display's EXACT laid-out physical
        // size (see `exact_size`); 1x1 until the first layout — `drive_layers`
        // resizes it the moment the display has a box.
        let physical = computed.map(ComputedNode::size).unwrap_or(Vec2::ZERO);
        let size = if physical.x > 0.0 && physical.y > 0.0 {
            exact_size(physical)
        } else {
            UVec2::ONE
        };
        let image = Image::new_target_texture(size.x, size.y, TextureFormat::Rgba8UnormSrgb, None);
        let handle = images.add(image);
        if let Some(mut material) = materials.get_mut(&mat_node.0) {
            material.layer = handle.clone();
        }

        let camera = commands
            .spawn((
                Camera2d,
                Camera {
                    // Transparent clear: the composite must alpha-blend the
                    // captured subtree over whatever the app renders behind the
                    // display node, so uncovered texels stay fully transparent.
                    clear_color: ClearColorConfig::Custom(Color::NONE),
                    // Before the main camera (order 0); nested deeper = earlier
                    // still (see `layer_depth`).
                    order: -1 - layer_depth(&bridge, rnode.0) as isize,
                    ..default()
                },
                BevyRenderTarget::Image(ImageRenderTarget {
                    handle,
                    // Spawned at 1.0 like the portal/surface cameras — the
                    // display usually isn't laid out yet at bind time, so its
                    // real scale factor is unknown; `drive_layers` keeps it in
                    // sync with the display's `ComputedNode` from then on.
                    scale_factor: 1.0,
                }),
                LayerCamera(root.0),
            ))
            .id();
        // Show the companion: its camera renders it offscreen only. Picking on
        // the offscreen subtree (input redirected into texture space) is the
        // phase-2 input task — no `Pickable` adjustment here.
        commands
            .entity(companion)
            .insert((UiTargetCamera(camera), Visibility::Inherited));
    }
}

/// Per-frame driver for bound layers:
///
/// - **Texture auto-resize** — track the display's exact laid-out physical
///   size (see [`exact_size`]), clearing + reallocating the target on change.
/// - **Companion sizing** — mirror the display's box onto the companion root's
///   `Node` so the offscreen subtree lays out at the display's dimensions.
/// - **Group alpha** — feed the retained `style.opacity` into the material's
///   `misc.x` (the shader's `u_group_alpha()`), compare-before-write.
/// - **3D transform** — compose the retained `style.transform3d` against the
///   display's LOGICAL size ([`compose_transform`]) into `packed.transform`
///   and mirror it on the display as [`LayerTransform`], compare-before-write.
///   Owned HERE (not the reconciler's `LAYER`-dirt repack, which owns only
///   `params`): a layout resize must recompose even with no style delta, and
///   the retained-props read makes hover/press variants work for free — one
///   writer, no double-apply. Identity until the display is laid out.
/// - **Orphan GC** — despawn companions/cameras whose display entity vanished
///   without a reconciler op (e.g. a `DespawnOnExit` sweep of an ancestor).
///
/// ## Sizing model (logical vs physical)
///
/// `ComputedNode::size()` is PHYSICAL pixels; the render texture tracks it so
/// the capture is pixel-for-pixel with the screen area the display covers
/// (crisp on hidpi). The companion root's `Node{width,height}` is set to the
/// display's LOGICAL size (`physical * inverse_scale_factor`) in `Val::Px`,
/// and the camera's `ImageRenderTarget::scale_factor` is kept at the display's
/// scale factor: `bevy_ui` lays the offscreen tree out under that factor, so a
/// logical unit inside the layer means exactly what it means on screen, and
/// logical size x scale = the physical texture size — the subtree fills the
/// texture.
#[allow(clippy::too_many_arguments)]
pub fn drive_layers(
    mut commands: Commands,
    bridge: Res<JsBridge>,
    mut images: ResMut<Assets<Image>>,
    mut materials: ResMut<Assets<LayerMaterial>>,
    displays: Query<(
        Entity,
        &RNode,
        &RLayer,
        &MaterialNode<LayerMaterial>,
        &ComputedNode,
    )>,
    mut transforms: Query<&mut LayerTransform>,
    mut companions: Query<(Entity, &LayerRoot, &mut Node)>,
    mut cameras: Query<(Entity, &LayerCamera, &mut BevyRenderTarget)>,
) {
    for (display, rnode, rlayer, mat_node, computed) in &displays {
        // 1. Auto-resize the render target to the display's EXACT physical
        //    box: the companion subtree lays out to that box and the composite
        //    samples the full texture (UV 0→1), so any padding (e.g. portal-
        //    style quantization) would misalign the capture — rendered shrunk,
        //    with dead margins. Realloc churn during animated resizes is
        //    accepted for phase 1. Zero size = not laid out yet; keep the 1x1.
        let physical = computed.size();
        let laid_out = physical.x > 0.0 && physical.y > 0.0;
        let logical = physical * computed.inverse_scale_factor;
        if laid_out && let Some(handle) = materials.get(&mat_node.0).map(|m| m.layer.clone()) {
            let want = exact_size(physical);
            // Read the current size immutably first: `get_mut` flags the asset
            // modified (re-uploading it) even without an actual change.
            if images
                .get(&handle)
                .is_some_and(|image| image.size() != want)
                && let Some(mut image) = images.get_mut(&handle)
            {
                image.resize(Extent3d {
                    width: want.x,
                    height: want.y,
                    depth_or_array_layers: 1,
                });
                // Re-prepare the material too: its bind group holds a view of
                // the OLD GPU texture (the resize re-creates it), and nothing
                // else flags the material asset — without this the composite
                // samples the stale (originally 1x1 transparent) texture
                // forever and the layer renders empty. The Modified event
                // fires on the guard's first mutable deref, so force one.
                if let Some(mut material) = materials.get_mut(&mat_node.0) {
                    let _: &mut LayerMaterial = &mut material;
                }
            }
        }

        // 2. Sync the companion root's box to the display's LOGICAL size (see
        //    the sizing model above). Same not-laid-out-yet gate as the resize:
        //    pre-layout the companion keeps its 0x0 base rather than getting a
        //    spurious Px(0) write. Compare-before-write: touching `Node`
        //    relays out the offscreen subtree.
        if laid_out && let Ok((_, _, mut node)) = companions.get_mut(rlayer.companion) {
            let (width, height) = (Val::Px(logical.x), Val::Px(logical.y));
            if node.width != width {
                node.width = width;
            }
            if node.height != height {
                node.height = height;
            }
        }

        // 3a. Group alpha from the retained merged style (absent = 1.0).
        //    `opacity` on ordinary nodes folds into component colors
        //    (`ui_map::apply_opacity`: BackgroundColor / gradients / text /
        //    image tint); a `<layer>` display node draws its subtree through
        //    the material alone — any BackgroundColor/gradient the user styles
        //    is separate chrome under the composite, faded once there — so
        //    writing `misc.x` here is the ONLY application of `opacity` to the
        //    captured subtree (no double-apply path). Compare-before-write:
        //    mutating the asset re-prepares its bind group.
        let retained_style = bridge
            .props_cache
            .get(&rnode.0)
            .and_then(|p| p.style.as_ref());
        let alpha = retained_style.and_then(|s| s.opacity).unwrap_or(1.0);

        // 3b. The 3D transform, composed from the retained `style.transform3d`
        //     against the display's LOGICAL size (matching the companion's
        //     layout space — see the sizing model above). Identity while unset
        //     or before the first layout (a zero-sized box has no meaningful
        //     center to compose about). The common contract's vertex shader
        //     applies the uploaded matrix projectively; alongside it ride
        //     `misc.y` — the display's scale factor (physical px per logical
        //     px), which the shader needs to move corners into the LOGICAL
        //     space the matrix was composed in and back — and `misc.z`, the
        //     transform-enabled flag: `0.0` routes the shader down the
        //     bit-exact default-pipeline path, so an untransformed layer can
        //     never drift by the logical/physical round trip's rounding.
        let matrix = match retained_style.and_then(|s| s.transform3d.as_ref()) {
            Some(spec) if laid_out => compose_transform(spec, logical),
            _ => Mat4::IDENTITY,
        };
        let scale = if laid_out && computed.inverse_scale_factor > 0.0 {
            1.0 / computed.inverse_scale_factor
        } else {
            1.0
        };
        let flag = if matrix == Mat4::IDENTITY { 0.0 } else { 1.0 };
        let misc = Vec4::new(alpha, scale, flag, 0.0);

        // One guarded write for both packed fields — compare-before-write,
        // since mutating the asset re-prepares its bind group.
        if materials
            .get(&mat_node.0)
            .map(|m| (m.packed.misc, m.packed.transform))
            != Some((misc, matrix))
            && let Some(mut material) = materials.get_mut(&mat_node.0)
        {
            material.packed.misc = misc;
            material.packed.transform = matrix;
        }

        // Mirror the composed matrix on the display entity for the input
        // path's inversion (Task 2.3). Compare-before-write; first frame
        // inserts the component.
        match transforms.get_mut(display) {
            Ok(mut t) => {
                if t.0 != matrix {
                    t.0 = matrix;
                }
            }
            Err(_) => {
                commands.entity(display).insert(LayerTransform(matrix));
            }
        }
    }

    // 4a. Camera upkeep: sync the render-target scale factor to the display's
    //     (so offscreen layout matches on-screen logical units — see the sizing
    //     model), and despawn cameras whose display is gone. Mirrors
    //     `drive_surfaces`' stale-camera sweep.
    for (entity, cam, mut target) in &mut cameras {
        let Ok((_, _, _, _, computed)) = displays.get(cam.0) else {
            commands.entity(entity).despawn();
            continue;
        };
        let inv = computed.inverse_scale_factor;
        if inv > 0.0
            && let BevyRenderTarget::Image(current) = &*target
        {
            let scale = 1.0 / inv;
            if current.scale_factor != scale
                && let BevyRenderTarget::Image(image_target) = &mut *target
            {
                image_target.scale_factor = scale;
            }
        }
    }

    // 4b. Companion GC: the reconciler despawns companions on `Op::Remove`/
    //     `Op::Reset`, but a Rust-side recursive despawn of an ancestor never
    //     emits an op — and can't reach the parentless companion. Safety net.
    for (entity, root, _) in &companions {
        if displays.get(root.0).is_err() {
            commands.entity(entity).despawn();
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Scalars pack tight, `vec2` aligns to an even lane, and a color starts on
    /// a fresh vec4 boundary — the std140-style layout the WGSL side assumes.
    #[test]
    fn packs_uniforms_into_slots_std140_style() {
        let effect = LayerEffect::new("glow")
            .uniform("a", UniformKind::F32, 1.0)
            .uniform("b", UniformKind::Vec2, [2.0, 3.0])
            .uniform("c", UniformKind::Color, Color::WHITE);
        let schema = effect.schema();
        assert_eq!(schema.lookup("a").unwrap().offset, 0);
        assert_eq!(
            schema.lookup("b").unwrap().offset,
            2,
            "vec2 aligns to an even lane"
        );
        assert_eq!(
            schema.lookup("c").unwrap().offset,
            4,
            "color starts a fresh vec4 slot"
        );
        assert!(schema.lookup("missing").is_none());
    }

    /// A vec3 reserves its whole slot, so a following vec2 starts on the next
    /// vec4 boundary — not in the vec3's spare `.w` lane.
    #[test]
    fn vec3_reserves_full_slot_before_vec2() {
        let effect = LayerEffect::new("edge")
            .uniform("v3", UniformKind::Vec3, [1.0, 2.0, 3.0])
            .uniform("v2", UniformKind::Vec2, [4.0, 5.0]);
        let schema = effect.schema();
        assert_eq!(schema.lookup("v3").unwrap().offset, 0);
        assert_eq!(
            schema.lookup("v2").unwrap().offset,
            4,
            "vec2 must not land in the vec3's reserved .w lane"
        );
    }

    /// `packed_defaults` places each declared default at its packed lanes and
    /// leaves undeclared lanes zeroed.
    #[test]
    fn defaults_fill_packed_array() {
        let effect = LayerEffect::new("glow")
            .uniform("a", UniformKind::F32, 1.0)
            .uniform("b", UniformKind::Vec2, [2.0, 3.0])
            .uniform("c", UniformKind::Color, Color::WHITE);
        let packed = effect.schema().packed_defaults();
        // a at lane 0 (.x), the aligned b at lanes 2..4 (.zw).
        assert_eq!(packed[0], Vec4::new(1.0, 0.0, 2.0, 3.0));
        // c fills slot 1 with linear white.
        assert_eq!(packed[1], Vec4::new(1.0, 1.0, 1.0, 1.0));
        // Nothing declared past slot 1.
        assert_eq!(packed[2], Vec4::ZERO);
    }

    /// A 17th vec4 uniform exceeds the 16-slot (64-lane) budget and must panic
    /// loudly at effect-definition time, not corrupt memory or wrap at runtime.
    #[test]
    #[should_panic(expected = "uniform budget")]
    fn overflowing_uniform_budget_panics() {
        let mut effect = LayerEffect::new("big");
        for i in 0..17 {
            effect = effect.uniform(format!("u{i}"), UniformKind::Vec4, [0.0; 4]);
        }
    }

    /// Re-declaring a uniform name is always an authoring bug; fail fast.
    #[test]
    #[should_panic(expected = "duplicate uniform")]
    fn duplicate_uniform_name_panics() {
        let _ = LayerEffect::new("dup")
            .uniform("a", UniformKind::F32, 0.0)
            .uniform("a", UniformKind::F32, 1.0);
    }

    /// A uniform name that is not a WGSL/TS identifier would only surface later
    /// as an opaque naga compile error (or a broken generated TS property), so
    /// the builder rejects it up front.
    #[test]
    #[should_panic(expected = "not a valid identifier")]
    fn invalid_uniform_name_panics() {
        let _ = LayerEffect::new("bad").uniform("2fast", UniformKind::F32, 0.0);
    }

    /// An effect name that is not an identifier would break the generated
    /// TypeScript module (it lands in JSDoc text — a `*/` would terminate the
    /// comment — and punctuation-split names invite Pascal-case collisions),
    /// so `new` rejects it at definition time, same rules as uniform names.
    #[test]
    #[should_panic(expected = "layer effect name")]
    fn invalid_effect_name_panics() {
        let _ = LayerEffect::new("bad effect */");
    }

    /// A default wider than the declared kind (here a Color for an F32) is a
    /// kind/default mismatch, caught at definition time.
    #[test]
    #[should_panic(expected = "non-zero default lanes beyond")]
    fn default_wider_than_kind_panics() {
        let _ = LayerEffect::new("bad").uniform("s", UniformKind::F32, Color::srgb(1.0, 0.5, 0.25));
    }

    /// A uniform named after a contract helper (`u_group_alpha` is declared by
    /// the common contract) would generate a colliding `u_<name>()` accessor —
    /// an opaque naga redefinition error at render time. Reject it up front.
    #[test]
    #[should_panic(expected = "reserved")]
    fn reserved_contract_accessor_name_panics() {
        let _ = LayerEffect::new("bad").uniform("group_alpha", UniformKind::F32, 1.0);
    }

    /// The generated preamble exposes each uniform as a typed `u_<name>()`
    /// accessor over `material.params`, with the swizzle matching its lanes.
    #[test]
    fn generates_wgsl_preamble_with_typed_accessors() {
        let effect = LayerEffect::new("glow")
            .uniform("strength", UniformKind::F32, 0.5)
            .uniform("dir", UniformKind::Vec2, [1.0, 0.0])
            .uniform("tint", UniformKind::Color, Color::WHITE)
            .uniform("axis", UniformKind::Vec3, [0.0, 1.0, 0.0])
            .uniform("quad", UniformKind::Vec4, [0.0; 4]);
        let wgsl = effect.wgsl_preamble();
        assert!(wgsl.contains("fn u_strength() -> f32"), "{wgsl}");
        assert!(wgsl.contains("material.params[0u].x"), "{wgsl}");
        assert!(wgsl.contains("fn u_dir() -> vec2<f32>"), "{wgsl}");
        assert!(wgsl.contains("material.params[0u].zw"), "{wgsl}");
        assert!(wgsl.contains("fn u_tint() -> vec4<f32>"), "{wgsl}");
        assert!(wgsl.contains("material.params[1u]"), "{wgsl}");
        assert!(wgsl.contains("fn u_axis() -> vec3<f32>"), "{wgsl}");
        assert!(wgsl.contains("material.params[2u].xyz"), "{wgsl}");
        // The vec4 accessor returns the whole element, no swizzle.
        assert!(wgsl.contains("fn u_quad() -> vec4<f32>"), "{wgsl}");
        assert!(wgsl.contains("material.params[3u];"), "{wgsl}");
    }

    /// [`RESERVED_ACCESSOR_NAMES`] must track the contract's `u_<name>()`
    /// helpers in lockstep: scan the common-contract half of `layer.wgsl` for
    /// `fn u_<name>(` definitions (comments stripped) and assert set-equality,
    /// so a future contract helper that forgets the constant fails loudly.
    #[test]
    fn reserved_accessor_names_track_the_contract_helpers() {
        let (common, _) = split_layer_wgsl();
        let mut found: Vec<&str> = common
            .lines()
            .map(|line| line.split_once("//").map_or(line, |(code, _)| code))
            .flat_map(|code| {
                code.match_indices("fn u_").map(move |(at, _)| {
                    let rest = &code[at + "fn u_".len()..];
                    rest.split('(').next().unwrap_or("")
                })
            })
            .filter(|name| !name.is_empty() && is_identifier(name))
            .collect();
        found.sort_unstable();
        found.dedup();

        let mut reserved = RESERVED_ACCESSOR_NAMES.to_vec();
        reserved.sort_unstable();
        assert_eq!(
            found, reserved,
            "layer.wgsl's contract helpers and RESERVED_ACCESSOR_NAMES drifted apart — \
             update the constant alongside the contract"
        );
    }

    /// A fresh registry always knows `"none"`: an effect with no uniforms and
    /// no backdrop whose fragment just re-displays the layer texture, so a
    /// `<layer>` without an `effect` prop renders through the same material
    /// path as every other effect.
    #[test]
    fn none_effect_is_registered_by_default() {
        let effects = LayerEffects::default();
        let none = effects.get("none").expect("\"none\" is built in");
        assert!(none.schema.decls().is_empty(), "none declares no uniforms");
        assert!(!none.wants_backdrop);
        assert!(none.shader.is_none(), "shader handles are created lazily");
        // The composed source is a complete shader: contract + none fragment.
        assert!(
            none.source.contains("var<uniform> material"),
            "{}",
            none.source
        );
        assert!(none.source.contains("textureSample"), "{}", none.source);
        assert!(none.source.contains("u_group_alpha"), "{}", none.source);
    }

    /// The two built-in demo effects ship in every fresh registry (so every app
    /// AND the bare codegen exporter see them): `"dissolve"` (noise alpha
    /// threshold) and `"chromaticAberration"` (per-channel UV offset), each
    /// with its documented uniforms at the expected packed lanes.
    #[test]
    fn builtin_effects_are_registered_by_default() {
        let effects = LayerEffects::default();

        let dissolve = effects.get("dissolve").expect("\"dissolve\" is built in");
        let threshold = dissolve.schema.lookup("threshold").expect("threshold");
        assert_eq!(threshold.kind, UniformKind::F32);
        assert_eq!(threshold.offset, 0);
        assert_eq!(threshold.default, [0.0; 4], "default fully visible");
        let softness = dissolve.schema.lookup("softness").expect("softness");
        assert_eq!(softness.kind, UniformKind::F32);
        assert_eq!(softness.offset, 1, "scalars pack tight");
        assert!(softness.default[0] > 0.0, "a small soft edge by default");
        assert!(!dissolve.wants_backdrop);
        // The composed source consumes its uniforms through the generated
        // accessors and samples the layer texture.
        assert!(
            dissolve.source.contains("u_threshold()"),
            "{}",
            dissolve.source
        );
        assert!(
            dissolve.source.contains("u_softness()"),
            "{}",
            dissolve.source
        );
        assert!(
            dissolve.source.contains("u_group_alpha()"),
            "{}",
            dissolve.source
        );
        assert!(
            dissolve.source.contains("textureSample"),
            "{}",
            dissolve.source
        );

        let chroma = effects
            .get("chromaticAberration")
            .expect("\"chromaticAberration\" is built in");
        let strength = chroma.schema.lookup("strength").expect("strength");
        assert_eq!(strength.kind, UniformKind::F32);
        assert_eq!(strength.offset, 0);
        assert_eq!(strength.default, [0.0; 4], "default no offset (identity)");
        let direction = chroma.schema.lookup("direction").expect("direction");
        assert_eq!(direction.kind, UniformKind::Vec2);
        assert_eq!(direction.offset, 2, "vec2 aligns to an even lane");
        assert_eq!(direction.default, [1.0, 0.0, 0.0, 0.0], "horizontal");
        assert!(!chroma.wants_backdrop);
        assert!(chroma.source.contains("u_strength()"), "{}", chroma.source);
        assert!(chroma.source.contains("u_direction()"), "{}", chroma.source);
        assert!(
            chroma.source.contains("u_group_alpha()"),
            "{}",
            chroma.source
        );
    }

    /// Registration iterates sorted by name (deterministic — the future codegen
    /// exporter walks it), and re-registering a name is an authoring bug that
    /// panics loudly.
    #[test]
    fn effect_registration_is_deterministic_and_rejects_duplicates() {
        const FRAGMENT: &str = "@fragment\nfn fragment(in: UiVertexOutput) -> @location(0) vec4<f32> {\n\
             \x20   return vec4<f32>(0.0);\n}\n";
        let mut effects = LayerEffects::default();
        effects.register(LayerEffect::new("zeta").fragment_wgsl(FRAGMENT));
        effects.register(LayerEffect::new("alpha").fragment_wgsl(FRAGMENT));
        let names: Vec<&str> = effects.iter().map(|(name, _)| name).collect();
        assert_eq!(
            names,
            ["alpha", "chromaticAberration", "dissolve", "none", "zeta"],
            "iteration sorted by name"
        );

        let duplicate = std::panic::catch_unwind(std::panic::AssertUnwindSafe(move || {
            effects.register(LayerEffect::new("alpha").fragment_wgsl(FRAGMENT));
        }));
        assert!(duplicate.is_err(), "duplicate registration must panic");
    }

    /// A registered effect's composed WGSL is the common contract (bindings +
    /// `u_group_alpha`), then the schema's generated accessor preamble, then
    /// the author's fragment source — in that order, ending with the fragment.
    #[test]
    fn composed_effect_shader_contains_preamble_and_user_source() {
        let user = "@fragment\nfn fragment(in: UiVertexOutput) -> @location(0) vec4<f32> {\n\
                    \x20   return vec4<f32>(u_strength());\n}\n";
        let mut effects = LayerEffects::default();
        effects.register(
            LayerEffect::new("glow")
                .uniform("strength", UniformKind::F32, 0.5)
                .fragment_wgsl(user),
        );
        let glow = effects.get("glow").unwrap();

        let (common, _) = split_layer_wgsl();
        assert!(glow.source.starts_with(common), "{}", glow.source);
        assert!(
            glow.source.trim_end().ends_with(user.trim_end()),
            "{}",
            glow.source
        );
        // The contract's params array matches the Rust-side budget.
        assert!(
            common.contains(&format!("array<vec4<f32>, {MAX_LAYER_UNIFORM_VEC4S}>")),
            "{common}"
        );
        // contract → preamble → user source, strictly in order.
        let contract_at = glow.source.find("fn u_group_alpha()").unwrap();
        let preamble_at = glow.source.find("fn u_strength()").unwrap();
        let user_at = glow.source.find("@fragment").unwrap();
        assert!(
            contract_at < preamble_at && preamble_at < user_at,
            "{}",
            glow.source
        );
        // Only the author's fragment entry point — the built-in "none" fragment
        // must not leak into other effects' composed sources.
        assert_eq!(
            glow.source.matches("@fragment").count(),
            1,
            "{}",
            glow.source
        );
        // And exactly the contract's one vertex entry point, so `specialize`
        // can point the vertex stage at the same composed shader.
        assert_eq!(
            count_entry_points(&glow.source, "@vertex"),
            1,
            "{}",
            glow.source
        );
    }

    /// An author fragment smuggling its own `@vertex` entry point would
    /// collide with the common contract's — a naga redefinition error at
    /// render time. Registration catches it instead.
    #[test]
    #[should_panic(expected = "exactly one @vertex")]
    fn fragment_with_its_own_vertex_entry_point_panics_at_registration() {
        LayerEffects::default().register(LayerEffect::new("sneaky").fragment_wgsl(
            "@vertex\nfn my_vertex() -> @builtin(position) vec4<f32> { return vec4<f32>(0.0); }\n\
             @fragment\nfn fragment(in: UiVertexOutput) -> @location(0) vec4<f32> { return vec4<f32>(1.0); }\n",
        ));
    }

    /// `ensure_shader` mints the shader asset once (same handle on repeat
    /// calls, one asset total) and returns `None` for an unknown effect —
    /// diagnostics stay with the caller, exactly like uniform resolution.
    #[test]
    fn ensure_shader_mints_once_and_rejects_unknown_names() {
        let mut effects = LayerEffects::default();
        let mut shaders = Assets::<Shader>::default();

        let first = effects
            .ensure_shader("none", &mut shaders)
            .expect("\"none\" is registered");
        let second = effects.ensure_shader("none", &mut shaders).unwrap();
        assert_eq!(first, second, "repeat calls return the same handle");
        assert_eq!(shaders.len(), 1, "the shader asset is minted exactly once");

        assert!(
            effects.ensure_shader("missing", &mut shaders).is_none(),
            "unknown effect names mint nothing"
        );
        assert_eq!(shaders.len(), 1);
    }

    /// A user fragment with no `@fragment` entry point composes into a shader
    /// naga would reject at render time — registration catches it instead.
    #[test]
    #[should_panic(expected = "exactly one @fragment")]
    fn fragment_without_entry_point_panics_at_registration() {
        LayerEffects::default()
            .register(LayerEffect::new("empty").fragment_wgsl("// no entry point here"));
    }

    /// Two `@fragment` entry points (e.g. a pasted-in complete shader) are a
    /// redefinition error at render time — registration catches it instead.
    #[test]
    #[should_panic(expected = "exactly one @fragment")]
    fn fragment_with_two_entry_points_panics_at_registration() {
        LayerEffects::default().register(LayerEffect::new("double").fragment_wgsl(
            "@fragment\nfn a(in: UiVertexOutput) -> @location(0) vec4<f32> { return vec4<f32>(0.0); }\n\
             @fragment\nfn b(in: UiVertexOutput) -> @location(0) vec4<f32> { return vec4<f32>(1.0); }\n",
        ));
    }

    /// `pack_uniforms` writes each declared uniform's resolved lanes at its
    /// packed offset, leaving every other lane at the base value.
    #[test]
    fn pack_uniforms_writes_declared_lanes() {
        let effect = LayerEffect::new("glow")
            .uniform("strength", UniformKind::F32, 1.0)
            .uniform("dir", UniformKind::Vec2, [9.0, 9.0])
            .uniform("tint", UniformKind::Color, Color::BLACK);
        let schema = effect.schema();
        let map: LayerUniformMap =
            serde_json::from_str(r##"{ "strength": 0.5, "tint": "#ff0000ff" }"##).unwrap();

        let mut params = schema.packed_defaults();
        pack_uniforms(schema, &map, &mut params);

        // strength at lane 0 (.x); dir untouched at its default lanes 2..4.
        assert_eq!(params[0], Vec4::new(0.5, 0.0, 9.0, 9.0));
        // tint fills slot 1 with linear red.
        assert_eq!(params[1], Vec4::new(1.0, 0.0, 0.0, 1.0));
        // Undeclared slots stay zero.
        assert_eq!(params[2], Vec4::ZERO);
    }

    /// An unknown uniform name and a kind/value mismatch each keep the declared
    /// default AND report a `"layerUniform"` diag warning (under the ambient
    /// node scope). Serialized via the diag test lock — the sink is global.
    #[cfg(all(feature = "devtools", debug_assertions))]
    #[test]
    fn pack_uniforms_warns_and_keeps_default_on_unknown_or_mismatch() {
        let _lock = crate::diag::test_lock();
        crate::diag::arm_runtime();
        let _ = crate::diag::take_runtime_warnings();

        let effect = LayerEffect::new("glow").uniform("strength", UniformKind::F32, 1.0);
        let schema = effect.schema();
        // "nope" is undeclared; "strength" carries a vec where a scalar is declared.
        let map: LayerUniformMap =
            serde_json::from_str(r#"{ "nope": 3.0, "strength": [1.0, 2.0] }"#).unwrap();

        let mut params = schema.packed_defaults();
        {
            let _scope = crate::diag::node_scope(11);
            pack_uniforms(schema, &map, &mut params);
        }
        assert_eq!(
            params[0],
            Vec4::new(1.0, 0.0, 0.0, 0.0),
            "both bad entries keep the declared default"
        );

        let mine: Vec<_> = crate::diag::take_runtime_warnings()
            .into_iter()
            .filter(|w| w.node == Some(11))
            .collect();
        assert_eq!(mine.len(), 2, "one warning per bad entry: {mine:?}");
        assert!(mine.iter().all(|w| w.kind == "layerUniform"));
        assert!(
            mine.iter().any(|w| w.value == "nope"),
            "the unknown name is reported: {mine:?}"
        );
        assert!(
            mine.iter().any(|w| w.value == "strength"),
            "the mismatched uniform is reported by name: {mine:?}"
        );
    }

    /// Wire values decode untagged (number / array / hex string); `resolve`
    /// accepts only the matching kind and converts hex through the shared CSS
    /// color parser to linear RGBA.
    #[test]
    fn decodes_uniform_values_from_wire() {
        let map: LayerUniformMap = serde_json::from_str(
            r##"{ "strength": 0.5, "tint": "#ff0000ff", "dir": [1, 0],
                  "axis": [1, 2, 3], "quad": [1, 2, 3, 4] }"##,
        )
        .unwrap();

        let strength = map.get("strength").unwrap();
        let tint = map.get("tint").unwrap();
        let dir = map.get("dir").unwrap();
        assert!(map.get("missing").is_none());

        assert_eq!(
            strength.resolve(UniformKind::F32),
            Some([0.5, 0.0, 0.0, 0.0])
        );
        assert_eq!(dir.resolve(UniformKind::Vec2), Some([1.0, 0.0, 0.0, 0.0]));
        assert_eq!(
            map.get("axis").unwrap().resolve(UniformKind::Vec3),
            Some([1.0, 2.0, 3.0, 0.0])
        );
        assert_eq!(
            map.get("quad").unwrap().resolve(UniformKind::Vec4),
            Some([1.0, 2.0, 3.0, 4.0])
        );
        // #ff0000ff is pure red: 1.0 sRGB == 1.0 linear, so the conversion is exact.
        assert_eq!(tint.resolve(UniformKind::Color), Some([1.0, 0.0, 0.0, 1.0]));

        // Kind mismatches are `None`, never a coerced guess.
        assert_eq!(tint.resolve(UniformKind::F32), None, "hex is not a scalar");
        assert_eq!(dir.resolve(UniformKind::Vec3), None, "wrong vec arity");
        assert_eq!(
            strength.resolve(UniformKind::Vec2),
            None,
            "scalar is not a vec"
        );
        assert_eq!(
            LayerUniformValue::Hex("notacolor".into()).resolve(UniformKind::Color),
            None,
            "unparseable hex"
        );
    }

    // --- <layer> 3D transform: wire decode + matrix composition ---------------

    /// Apply `m` to the point `(x, y, z)` with the perspective divide — the
    /// observable the composition tests assert on (screen positions, not raw
    /// matrix cells).
    fn project(m: &Mat4, x: f32, y: f32, z: f32) -> Vec3 {
        let v = *m * Vec4::new(x, y, z, 1.0);
        assert!(v.w > 0.0, "point must project in front of the eye: {v:?}");
        v.truncate() / v.w
    }

    /// `LayerTransformSpec` decodes camelCase wire fields (angles in DEGREES,
    /// lengths in logical px) and ignores unknown keys — the same tolerance as
    /// `Style`'s other struct-shaped fields (no `deny_unknown_fields`).
    #[test]
    fn transform_spec_decodes_camel_case_and_ignores_unknown_keys() {
        let spec: LayerTransformSpec = serde_json::from_str(
            r#"{ "perspective": 500, "translateX": 1, "translateY": 2, "translateZ": 3,
                 "rotateX": 10, "rotateY": 20, "rotateZ": 30,
                 "scale": 2, "scaleX": 3, "scaleY": 4 }"#,
        )
        .expect("full spec decodes");
        assert_eq!(spec.perspective, Some(500.0));
        assert_eq!(spec.translate_x, Some(1.0));
        assert_eq!(spec.translate_y, Some(2.0));
        assert_eq!(spec.translate_z, Some(3.0));
        assert_eq!(spec.rotate_x, Some(10.0));
        assert_eq!(spec.rotate_y, Some(20.0));
        assert_eq!(spec.rotate_z, Some(30.0));
        assert_eq!(spec.scale, Some(2.0));
        assert_eq!(spec.scale_x, Some(3.0));
        assert_eq!(spec.scale_y, Some(4.0));
        assert!(!spec.is_identity());

        // Unknown keys are ignored (`rotate` belongs to the 2D `transform`
        // path, `bogus` to nobody) — the spec decodes to identity.
        let spec: LayerTransformSpec =
            serde_json::from_str(r#"{ "rotate": 45, "bogus": true }"#).expect("tolerant decode");
        assert!(
            spec.is_identity(),
            "unknown keys decode to the identity spec"
        );
    }

    /// The all-`None` spec is the identity: `is_identity` short-circuits and
    /// the composed matrix is exactly `Mat4::IDENTITY` (no float drift from a
    /// needless T(center)·…·T(-center) round trip).
    #[test]
    fn identity_spec_composes_to_identity() {
        let spec = LayerTransformSpec::default();
        assert!(spec.is_identity());
        assert_eq!(
            compose_transform(&spec, Vec2::new(200.0, 100.0)),
            Mat4::IDENTITY
        );
    }

    /// `rotateZ: 90` in y-down UI space is a quarter turn CLOCKWISE on screen
    /// (the CSS convention), about the box center: on a 200x100 box the
    /// top-right corner swings to the lower right, the top-left corner to the
    /// upper right.
    #[test]
    fn rotate_z_90_rotates_corners_clockwise_about_the_center() {
        let spec: LayerTransformSpec = serde_json::from_str(r#"{ "rotateZ": 90 }"#).unwrap();
        let m = compose_transform(&spec, Vec2::new(200.0, 100.0));
        // The center is fixed.
        assert!(
            project(&m, 100.0, 50.0, 0.0).abs_diff_eq(Vec3::new(100.0, 50.0, 0.0), 1e-3),
            "center stays put"
        );
        // Top-right (200, 0): offset (+100, -50) → (+50, +100) → (150, 150).
        assert!(
            project(&m, 200.0, 0.0, 0.0).abs_diff_eq(Vec3::new(150.0, 150.0, 0.0), 1e-3),
            "top-right swings below the center (clockwise, y-down)"
        );
        // Top-left (0, 0): offset (-100, -50) → (+50, -100) → (150, -50).
        assert!(
            project(&m, 0.0, 0.0, 0.0).abs_diff_eq(Vec3::new(150.0, -50.0, 0.0), 1e-3),
            "top-left swings above the center"
        );
    }

    /// `rotateY: 90` swings the box edge-on: the right-mid point's x collapses
    /// onto the center line, and its z goes NEGATIVE — the right edge moves
    /// AWAY from the viewer under a positive rotateY (CSS convention; +z is
    /// toward the viewer).
    #[test]
    fn rotate_y_90_collapses_width_onto_the_center_line() {
        let spec: LayerTransformSpec = serde_json::from_str(r#"{ "rotateY": 90 }"#).unwrap();
        let m = compose_transform(&spec, Vec2::new(200.0, 100.0));
        let right_mid = project(&m, 200.0, 50.0, 0.0);
        assert!(
            (right_mid.x - 100.0).abs() < 1e-3,
            "width collapses onto center x: {right_mid:?}"
        );
        assert!((right_mid.y - 50.0).abs() < 1e-3, "y untouched by rotateY");
        assert!(
            right_mid.z < -99.0,
            "the right edge recedes (negative z = away from the viewer): {right_mid:?}"
        );
    }

    /// `rotateX: 90` swings the box edge-on the other way: the top-mid
    /// point's y collapses onto the center line and its z goes NEGATIVE —
    /// the top edge tips AWAY from the viewer under a positive rotateX
    /// (CSS convention).
    #[test]
    fn rotate_x_90_collapses_height_onto_the_center_line() {
        let spec: LayerTransformSpec = serde_json::from_str(r#"{ "rotateX": 90 }"#).unwrap();
        let m = compose_transform(&spec, Vec2::new(200.0, 100.0));
        let top_mid = project(&m, 100.0, 0.0, 0.0);
        assert!(
            (top_mid.y - 50.0).abs() < 1e-3,
            "height collapses onto center y: {top_mid:?}"
        );
        assert!(
            top_mid.z < -49.0,
            "the top edge recedes (negative z = away from the viewer): {top_mid:?}"
        );
    }

    /// A non-positive `perspective` is ignored (CSS requires a positive
    /// length): alone it composes to the identity, with no z→w coefficient.
    #[test]
    fn non_positive_perspective_is_ignored() {
        let spec: LayerTransformSpec = serde_json::from_str(r#"{ "perspective": -5 }"#).unwrap();
        let m = compose_transform(&spec, Vec2::new(200.0, 100.0));
        assert_eq!(m, Mat4::IDENTITY);
        assert_eq!(m.z_axis.w, 0.0, "no perspective coefficient");
    }

    /// With `perspective`, a rotateY tilt makes the nearer edge project larger.
    /// Under a positive rotateY the LEFT edge comes toward the viewer; the raw
    /// homogeneous w pins the CSS perspective matrix (w' = 1 - z/d): the near
    /// corner's w < 1 < the far corner's w, and post-divide the near edge spans
    /// more y than the untransformed box, the far edge less.
    #[test]
    fn perspective_rotate_y_enlarges_the_near_edge() {
        let spec: LayerTransformSpec =
            serde_json::from_str(r#"{ "perspective": 500, "rotateY": 60 }"#).unwrap();
        let m = compose_transform(&spec, Vec2::new(200.0, 100.0));

        // Raw homogeneous w, no divide: near (left) vs far (right) corner.
        let w_of = |x: f32| (m * Vec4::new(x, 0.0, 0.0, 1.0)).w;
        let (near, far) = (w_of(0.0), w_of(200.0));
        assert!(
            near < 1.0 && far > 1.0,
            "CSS perspective (w' = 1 - z/d): near w {near} < 1 < far w {far}"
        );

        // Post-divide: the near edge appears larger (bigger y spread).
        let near_spread = project(&m, 0.0, 100.0, 0.0).y - project(&m, 0.0, 0.0, 0.0).y;
        let far_spread = project(&m, 200.0, 100.0, 0.0).y - project(&m, 200.0, 0.0, 0.0).y;
        assert!(
            near_spread > 100.0 && far_spread < 100.0,
            "near edge grows ({near_spread}), far edge shrinks ({far_spread})"
        );
    }

    /// `scale` is about the center (the center is fixed, corners move out);
    /// `scaleX`/`scaleY` override the uniform factor per axis.
    #[test]
    fn scale_about_center_keeps_the_center_fixed() {
        let spec: LayerTransformSpec = serde_json::from_str(r#"{ "scale": 2 }"#).unwrap();
        let m = compose_transform(&spec, Vec2::new(200.0, 100.0));
        assert!(
            project(&m, 100.0, 50.0, 0.0).abs_diff_eq(Vec3::new(100.0, 50.0, 0.0), 1e-3),
            "center fixed under scale"
        );
        assert!(
            project(&m, 0.0, 0.0, 0.0).abs_diff_eq(Vec3::new(-100.0, -50.0, 0.0), 1e-3),
            "corners move out from the center"
        );

        let spec: LayerTransformSpec =
            serde_json::from_str(r#"{ "scale": 2, "scaleX": 0.5 }"#).unwrap();
        let m = compose_transform(&spec, Vec2::new(200.0, 100.0));
        assert!(
            project(&m, 0.0, 0.0, 0.0).abs_diff_eq(Vec3::new(50.0, -50.0, 0.0), 1e-3),
            "scaleX overrides the uniform factor on x only"
        );
    }

    /// The fixed application order is CSS-like (`perspective → translate →
    /// rotateX → rotateY → rotateZ → scale`, innermost-last): `translate`
    /// composes OUTSIDE the rotations, so a translateX shifts the rotated box
    /// along screen x — the offset itself is never rotated.
    #[test]
    fn translate_composes_outside_rotation() {
        let spec: LayerTransformSpec =
            serde_json::from_str(r#"{ "translateX": 10, "rotateZ": 90 }"#).unwrap();
        let m = compose_transform(&spec, Vec2::new(200.0, 100.0));
        // Rotation fixes the center; the translate then shifts it along
        // screen x by exactly +10 (an inside-the-rotation translate would
        // shift it along screen y instead).
        assert!(
            project(&m, 100.0, 50.0, 0.0).abs_diff_eq(Vec3::new(110.0, 50.0, 0.0), 1e-3),
            "translate is applied in the unrotated (screen) frame"
        );
    }

    /// The WGSL `LayerParams` mirror carries `transform` FIRST, then the
    /// params array, then `misc` — and the Rust-side uniform layout agrees:
    /// mat4 at offset 0 (64 bytes), `params` at 64 (16 vec4s, 256 bytes),
    /// `misc` at 320, 336 bytes total. The default is the identity matrix
    /// under a group alpha of 1. (The vertex shader consuming `transform`
    /// lands in Task 2.2.)
    #[test]
    fn wgsl_mirror_pins_layer_packed_layout() {
        let (common, _) = split_layer_wgsl();
        let transform_at = common
            .find("transform: mat4x4<f32>")
            .expect("LayerParams declares transform");
        let params_at = common
            .find(&format!(
                "params: array<vec4<f32>, {MAX_LAYER_UNIFORM_VEC4S}>"
            ))
            .expect("LayerParams declares the packed params array");
        let misc_at = common
            .find("misc: vec4<f32>")
            .expect("LayerParams declares misc");
        assert!(
            transform_at < params_at && params_at < misc_at,
            "field order must be transform → params → misc"
        );
        assert_eq!(
            <LayerPacked as ShaderType>::min_size().get(),
            336,
            "mat4 (64) + 16 vec4s (256) + misc (16)"
        );
        let default = LayerPacked::default();
        assert_eq!(default.transform, Mat4::IDENTITY);
        assert_eq!(default.misc.x, 1.0, "group alpha defaults fully visible");
        assert_eq!(default.misc.y, 1.0, "scale factor defaults to 1");
        assert_eq!(
            default.misc.z, 0.0,
            "transform flag defaults OFF (bit-exact default vertex path)"
        );
    }

    /// The common contract carries exactly one vertex entry point (the
    /// projective `transform3d` vertex shader every composed effect pipeline
    /// runs) and the view uniform it needs — and the entry-point guard's
    /// comment-stripping scan agrees.
    #[test]
    fn common_contract_carries_the_projective_vertex_entry_point() {
        let (common, _) = split_layer_wgsl();
        assert_eq!(
            count_entry_points(common, "@vertex"),
            1,
            "exactly one vertex entry point in the contract"
        );
        assert_eq!(
            count_entry_points(common, "@fragment"),
            0,
            "the contract contributes no fragment entry point"
        );
        assert!(
            common.contains("var<uniform> view: View"),
            "the vertex stage reads the view uniform:\n{common}"
        );
        assert!(
            common.contains("material.transform"),
            "the vertex stage consumes the uploaded matrix:\n{common}"
        );
        // The NAME is load-bearing: `specialize` swaps only `vertex.shader`,
        // leaving the pipeline's entry_point ("vertex") untouched.
        assert!(
            common.contains("fn vertex("),
            "the vertex entry point must be named `vertex`:\n{common}"
        );
    }

    // --- per-frame systems: camera binding, texture sizing, group alpha, GC ----

    use crate::bridge::JsBridge;
    use crate::protocol::{NodeId, Op, Props, ROOT_ID};
    use bevy::camera::RenderTarget as BevyRenderTarget;
    use bevy::prelude::*;
    use bevy::ui::ComputedNode;

    /// A headless app wired like the real plugin's layer path: `apply_js_ops` →
    /// `bind_layers` → `drive_layers`. Mirrors `reconcile::tests::ordering_app`.
    fn systems_app() -> (App, crossbeam_channel::Sender<Vec<Op>>) {
        let mut app = App::new();
        app.add_plugins((MinimalPlugins, AssetPlugin::default()));
        app.init_asset::<Image>();
        app.init_asset::<TextureAtlasLayout>();
        app.init_resource::<crate::plugin::Fonts>();
        app.init_resource::<crate::reconcile::OpApplyStats>();
        app.init_resource::<crate::ui_map::AtlasLayoutCache>();
        // `apply_js_ops` reads the `filter` material assets/cache + white pixel…
        app.init_asset::<crate::filter::FilterMaterial>();
        app.init_resource::<crate::filter::FilterMaterialCache>();
        app.add_systems(Startup, crate::filter::init_filter_assets);
        // …and the `<layer>` effect registry + material/shader stores.
        app.init_asset::<LayerMaterial>();
        app.init_asset::<bevy::shader::Shader>();
        app.init_resource::<LayerEffects>();

        let (ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
        let (out_tx, out_rx) = tokio::sync::mpsc::unbounded_channel::<crate::protocol::Outbound>();
        std::mem::forget(out_rx); // keep the channel open for the test's lifetime
        let root = app.world_mut().spawn_empty().id();
        app.insert_resource(JsBridge::new(ops_rx, out_tx, root));
        app.add_systems(
            Update,
            (
                crate::reconcile::apply_js_ops,
                bind_layers.after(crate::reconcile::apply_js_ops),
                drive_layers.after(bind_layers),
            ),
        );
        (app, ops_tx)
    }

    fn create_layer(id: NodeId, props: serde_json::Value) -> Op {
        Op::Create {
            id,
            kind: "layer".into(),
            props: serde_json::from_value(props).expect("valid layer props"),
            text: None,
        }
    }

    fn append(parent: NodeId, child: NodeId) -> Op {
        Op::Append { parent, child }
    }

    /// The display entity a layer node id resolved to.
    fn ent(app: &App, id: NodeId) -> Entity {
        app.world().resource::<JsBridge>().nodes[&id]
    }

    /// The layer's companion root entity.
    fn companion_of(app: &App, id: NodeId) -> Entity {
        app.world().resource::<JsBridge>().layers[&id]
    }

    /// The layer's material asset, resolved through its display `MaterialNode`.
    fn material_of(app: &App, display: Entity) -> LayerMaterial {
        let handle = app
            .world()
            .entity(display)
            .get::<MaterialNode<LayerMaterial>>()
            .expect("a <layer> display node carries a MaterialNode<LayerMaterial>")
            .0
            .clone();
        app.world()
            .resource::<Assets<LayerMaterial>>()
            .get(&handle)
            .expect("the layer material asset exists")
            .clone()
    }

    /// The camera the layer's companion is bound to.
    fn camera_of(app: &App, id: NodeId) -> Entity {
        app.world()
            .entity(companion_of(app, id))
            .get::<UiTargetCamera>()
            .expect("companion bound to a camera")
            .0
    }

    /// Stamp a laid-out size (physical px) + inverse scale factor on a display
    /// node, standing in for `ui_layout_system` in this headless world.
    fn stamp_size_scaled(app: &mut App, e: Entity, w: f32, h: f32, inverse_scale_factor: f32) {
        app.world_mut().entity_mut(e).insert(ComputedNode {
            size: Vec2::new(w, h),
            inverse_scale_factor,
            ..Default::default()
        });
    }

    /// [`stamp_size_scaled`] at scale factor 1 (logical == physical).
    fn stamp_size(app: &mut App, e: Entity, w: f32, h: f32) {
        stamp_size_scaled(app, e, w, h, 1.0);
    }

    /// The size of the image asset behind the layer's material texture.
    fn texture_size(app: &App, display: Entity) -> UVec2 {
        app.world()
            .resource::<Assets<Image>>()
            .get(&material_of(app, display).layer)
            .expect("the layer texture asset exists")
            .size()
    }

    /// `bind_layers` gives a fresh layer a transparent-clear order -1 camera
    /// targeting a real render texture (replacing the blank placeholder), and
    /// binds + shows the companion root.
    #[test]
    fn bind_layers_creates_camera_and_binds_companion() {
        let (mut app, tx) = systems_app();
        tx.send(vec![
            create_layer(1, serde_json::json!({})),
            append(ROOT_ID, 1),
        ])
        .unwrap();
        app.update();

        let display = ent(&app, 1);
        let companion = companion_of(&app, 1);
        let cam = camera_of(&app, 1);
        assert_eq!(
            app.world().entity(companion).get::<Visibility>(),
            Some(&Visibility::Inherited),
            "a bound companion is shown (its camera renders it offscreen)"
        );
        assert_eq!(
            app.world().entity(cam).get::<LayerCamera>().map(|c| c.0),
            Some(display),
            "the camera points back at the display node"
        );
        let camera = app.world().entity(cam).get::<Camera>().unwrap();
        assert_eq!(
            camera.order, -1,
            "renders before the main camera samples it"
        );
        assert!(
            matches!(&camera.clear_color, ClearColorConfig::Custom(c) if *c == Color::NONE),
            "transparent clear so the composite alpha-blends over the app"
        );

        // The material's placeholder was replaced by the camera's render target.
        let material = material_of(&app, display);
        match app.world().entity(cam).get::<BevyRenderTarget>().unwrap() {
            BevyRenderTarget::Image(t) => assert_eq!(
                t.handle, material.layer,
                "camera renders into the material's layer texture"
            ),
            other => panic!("layer camera should target an image, got {other:?}"),
        }
        let image = app
            .world()
            .resource::<Assets<Image>>()
            .get(&material.layer)
            .unwrap();
        assert!(
            image
                .texture_descriptor
                .usage
                .contains(bevy::render::render_resource::TextureUsages::RENDER_ATTACHMENT),
            "the bound texture is a render target, not the blank placeholder"
        );
    }

    /// A `<layer>` nested inside another `<layer>` gets a camera that renders
    /// BEFORE the outer layer's (order -2 vs -1): the outer capture samples the
    /// inner layer's display node, so the inner texture must be fresh first.
    #[test]
    fn nested_layer_camera_renders_before_outer() {
        let (mut app, tx) = systems_app();
        tx.send(vec![
            create_layer(1, serde_json::json!({})),
            create_layer(2, serde_json::json!({})),
            append(ROOT_ID, 1),
            append(1, 2),
        ])
        .unwrap();
        app.update();

        let order = |id: NodeId| {
            app.world()
                .entity(camera_of(&app, id))
                .get::<Camera>()
                .unwrap()
                .order
        };
        assert_eq!(order(1), -1, "top-level layer");
        assert_eq!(order(2), -2, "nested layer renders before its outer layer");
    }

    /// The render texture tracks the display's laid-out physical size EXACTLY
    /// (the composite samples the full texture, so a padded size would render
    /// the capture shrunk), the companion root's `Node` tracks its logical
    /// size, and an unchanged second frame touches neither.
    #[test]
    fn layer_texture_tracks_display_size() {
        #[derive(Resource, Default)]
        struct ModifiedImages(usize);
        fn count_modified(
            mut reader: MessageReader<AssetEvent<Image>>,
            mut count: ResMut<ModifiedImages>,
        ) {
            for ev in reader.read() {
                if matches!(ev, AssetEvent::Modified { .. }) {
                    count.0 += 1;
                }
            }
        }

        let (mut app, tx) = systems_app();
        app.init_resource::<ModifiedImages>();
        app.add_systems(Update, count_modified.after(drive_layers));
        tx.send(vec![
            create_layer(1, serde_json::json!({})),
            append(ROOT_ID, 1),
        ])
        .unwrap();
        app.update();

        let display = ent(&app, 1);
        let companion = companion_of(&app, 1);
        stamp_size(&mut app, display, 200.0, 100.0);
        app.update();

        let material = material_of(&app, display);
        let image_size = app
            .world()
            .resource::<Assets<Image>>()
            .get(&material.layer)
            .unwrap()
            .size();
        assert_eq!(
            image_size,
            UVec2::new(200, 100),
            "texture resized to the display's exact physical size"
        );
        let node = app.world().entity(companion).get::<Node>().unwrap();
        assert_eq!(node.width, Val::Px(200.0), "companion width = logical size");
        assert_eq!(
            node.height,
            Val::Px(100.0),
            "companion height = logical size"
        );

        // Flush the resize's Modified event into the counter, then verify an
        // identical frame does not resize (mutate the image asset) again.
        app.update();
        let after_resize = app.world().resource::<ModifiedImages>().0;
        assert!(after_resize >= 1, "the resize mutated the image asset");
        app.update();
        app.update();
        assert_eq!(
            app.world().resource::<ModifiedImages>().0,
            after_resize,
            "an unchanged frame must not resize the texture again"
        );
    }

    /// `specialize` composites PREMULTIPLIED: the layer texture's RGB is
    /// already scaled by A (straight-alpha capture over a transparent clear),
    /// so the UI material pipeline's straight-alpha default would multiply by
    /// alpha a second time (dark AA edges, quadratically-dark opacity fade).
    /// The blend override applies to the fallback (default-handle) path too;
    /// a real handle additionally swaps the fragment shader.
    #[test]
    fn specialize_blends_premultiplied_and_swaps_the_effect_shader() {
        use bevy::render::render_resource::{
            BlendState, ColorTargetState, ColorWrites, FragmentState, TextureFormat,
        };

        // The descriptor as `UiMaterialPipeline::specialize` hands it over:
        // straight-alpha blending on the single color target.
        let descriptor = || RenderPipelineDescriptor {
            fragment: Some(FragmentState {
                targets: vec![Some(ColorTargetState {
                    format: TextureFormat::Rgba8UnormSrgb,
                    blend: Some(BlendState::ALPHA_BLENDING),
                    write_mask: ColorWrites::ALL,
                })],
                ..Default::default()
            }),
            ..Default::default()
        };
        let key = |shader: Handle<Shader>| UiMaterialKey::<LayerMaterial> {
            target_format: TextureFormat::Rgba8UnormSrgb,
            bind_group_data: LayerKey { shader },
        };

        // A real composed-shader handle: premultiplied blend + BOTH stages
        // swapped to the composed shader (it carries the contract's projective
        // vertex entry point alongside the effect's fragment).
        let effect_shader = Handle::<Shader>::Uuid(
            bevy::asset::uuid::Uuid::from_u128(7),
            std::marker::PhantomData,
        );
        let mut with_effect = descriptor();
        let default_vertex_shader = with_effect.vertex.shader.clone();
        LayerMaterial::specialize(&mut with_effect, key(effect_shader.clone()));
        let fragment = with_effect.fragment.as_ref().unwrap();
        assert_eq!(
            fragment.targets[0].as_ref().unwrap().blend,
            Some(BlendState::PREMULTIPLIED_ALPHA_BLENDING),
            "composite must blend premultiplied"
        );
        assert_eq!(fragment.shader, effect_shader, "effect shader swapped in");
        assert_eq!(
            with_effect.vertex.shader, effect_shader,
            "the vertex stage runs the same composed shader (transform3d)"
        );

        // The default-handle fallback: blend still overridden, both stages'
        // shaders kept (pipeline defaults; this path never actually renders).
        let mut fallback = descriptor();
        let original_shader = fallback.fragment.as_ref().unwrap().shader.clone();
        LayerMaterial::specialize(&mut fallback, key(Handle::default()));
        let fragment = fallback.fragment.as_ref().unwrap();
        assert_eq!(
            fragment.targets[0].as_ref().unwrap().blend,
            Some(BlendState::PREMULTIPLIED_ALPHA_BLENDING),
            "the fallback path premultiplies too"
        );
        assert_eq!(
            fragment.shader, original_shader,
            "a default handle must not replace the embedded fallback shader"
        );
        assert_eq!(
            fallback.vertex.shader, default_vertex_shader,
            "a default handle must not replace the pipeline's vertex shader"
        );
    }

    /// Resizing the render target must ALSO flag the layer material modified:
    /// the material's prepared bind group holds a view of the OLD GPU texture
    /// (the resize re-creates it), so without the touch the composite samples
    /// the stale — originally 1x1 transparent — texture forever and the layer
    /// renders empty (the Task 1.8 visual-checkpoint bug).
    #[test]
    fn texture_resize_retouches_the_material() {
        #[derive(Resource, Default)]
        struct ModifiedMaterials(usize);
        fn count_modified(
            mut reader: MessageReader<AssetEvent<LayerMaterial>>,
            mut count: ResMut<ModifiedMaterials>,
        ) {
            for ev in reader.read() {
                if matches!(ev, AssetEvent::Modified { .. }) {
                    count.0 += 1;
                }
            }
        }

        let (mut app, tx) = systems_app();
        app.init_resource::<ModifiedMaterials>();
        app.add_systems(Update, count_modified.after(drive_layers));
        tx.send(vec![
            create_layer(1, serde_json::json!({})),
            append(ROOT_ID, 1),
        ])
        .unwrap();
        // Settle the bind-time mutations (placeholder swap etc.) into the
        // counter so the delta below is the resize's alone.
        app.update();
        app.update();
        app.update();
        let settled = app.world().resource::<ModifiedMaterials>().0;

        let display = ent(&app, 1);
        stamp_size(&mut app, display, 300.0, 200.0);
        app.update();
        app.update(); // flush the AssetEvent into the counter
        assert!(
            app.world().resource::<ModifiedMaterials>().0 > settled,
            "a texture resize must re-touch the material so its bind group re-prepares"
        );
    }

    /// `misc.x` (the shader's group alpha) follows the retained `style.opacity`:
    /// set → its value, unset → 1.0; an identical frame must not re-mutate the
    /// material asset (asset mutation re-prepares bind groups).
    #[test]
    fn layer_group_alpha_follows_style_opacity() {
        #[derive(Resource, Default)]
        struct ModifiedMaterials(usize);
        fn count_modified(
            mut reader: MessageReader<AssetEvent<LayerMaterial>>,
            mut count: ResMut<ModifiedMaterials>,
        ) {
            for ev in reader.read() {
                if matches!(ev, AssetEvent::Modified { .. }) {
                    count.0 += 1;
                }
            }
        }

        let (mut app, tx) = systems_app();
        app.init_resource::<ModifiedMaterials>();
        app.add_systems(Update, count_modified.after(drive_layers));
        tx.send(vec![
            create_layer(1, serde_json::json!({ "style": { "opacity": 0.5 } })),
            append(ROOT_ID, 1),
        ])
        .unwrap();
        app.update();

        let display = ent(&app, 1);
        assert_eq!(
            material_of(&app, display).packed.misc.x,
            0.5,
            "group alpha follows the retained style opacity"
        );

        // Flush the initial mutations into the counter, then verify an identical
        // frame leaves the material asset untouched.
        app.update();
        app.update();
        let settled = app.world().resource::<ModifiedMaterials>().0;
        app.update();
        assert_eq!(
            app.world().resource::<ModifiedMaterials>().0,
            settled,
            "an identical frame must not re-mutate the material asset"
        );

        // Unsetting opacity resets the group alpha to fully visible.
        tx.send(vec![Op::Update {
            id: 1,
            props: Props::default(),
            unset: vec![],
            style_unset: vec!["opacity".into()],
        }])
        .unwrap();
        app.update();
        assert_eq!(
            material_of(&app, display).packed.misc.x,
            1.0,
            "unset opacity falls back to a group alpha of 1.0"
        );
    }

    /// `drive_layers` owns the 3D transform: it composes the retained
    /// `style.transform3d` against the display's current LOGICAL size into
    /// `packed.transform` (uploaded; the consuming vertex shader is Task 2.2)
    /// and mirrors the same matrix on the display entity as
    /// [`LayerTransform`] (Task 2.3's input inversion reads it). Identity
    /// while unset or pre-layout; compare-before-write — an identical frame
    /// must not re-mutate the material asset.
    #[test]
    fn layer_transform3d_drives_material_and_component() {
        #[derive(Resource, Default)]
        struct ModifiedMaterials(usize);
        fn count_modified(
            mut reader: MessageReader<AssetEvent<LayerMaterial>>,
            mut count: ResMut<ModifiedMaterials>,
        ) {
            for ev in reader.read() {
                if matches!(ev, AssetEvent::Modified { .. }) {
                    count.0 += 1;
                }
            }
        }

        let (mut app, tx) = systems_app();
        app.init_resource::<ModifiedMaterials>();
        app.add_systems(Update, count_modified.after(drive_layers));
        tx.send(vec![
            create_layer(
                1,
                serde_json::json!({ "style": { "transform3d": { "rotateZ": 90 } } }),
            ),
            append(ROOT_ID, 1),
        ])
        .unwrap();
        app.update();

        // Pre-layout (no box yet): the transform stays identity and the
        // shader-side enable flag stays off.
        let display = ent(&app, 1);
        assert_eq!(
            material_of(&app, display).packed.transform,
            Mat4::IDENTITY,
            "no layout yet → identity"
        );
        assert_eq!(
            material_of(&app, display).packed.misc.z,
            0.0,
            "identity → the vertex shader's transform flag stays off"
        );

        // Lay out at physical 400x200 under a 2x scale factor: the matrix is
        // composed against the LOGICAL 200x100 box.
        stamp_size_scaled(&mut app, display, 400.0, 200.0, 0.5);
        app.update();
        let spec: LayerTransformSpec = serde_json::from_str(r#"{ "rotateZ": 90 }"#).unwrap();
        let expected = compose_transform(&spec, Vec2::new(200.0, 100.0));
        assert_ne!(expected, Mat4::IDENTITY);
        assert_eq!(
            material_of(&app, display).packed.transform,
            expected,
            "packed.transform composes from retained style + logical size"
        );
        assert_eq!(
            material_of(&app, display).packed.misc.y,
            2.0,
            "misc.y carries the display's scale factor (physical per logical)"
        );
        assert_eq!(
            material_of(&app, display).packed.misc.z,
            1.0,
            "a real transform raises the vertex shader's enable flag"
        );
        assert_eq!(
            app.world()
                .entity(display)
                .get::<LayerTransform>()
                .map(|t| t.0),
            Some(expected),
            "the display mirrors the composed matrix as LayerTransform"
        );

        // Settle, then verify an identical frame leaves the asset untouched.
        app.update();
        app.update();
        let settled = app.world().resource::<ModifiedMaterials>().0;
        app.update();
        assert_eq!(
            app.world().resource::<ModifiedMaterials>().0,
            settled,
            "an identical frame must not re-mutate the material asset"
        );

        // Unsetting transform3d resets both to identity.
        tx.send(vec![Op::Update {
            id: 1,
            props: Props::default(),
            unset: vec![],
            style_unset: vec!["transform3d".into()],
        }])
        .unwrap();
        app.update();
        assert_eq!(
            material_of(&app, display).packed.transform,
            Mat4::IDENTITY,
            "unset transform3d falls back to identity"
        );
        assert_eq!(
            material_of(&app, display).packed.misc.z,
            0.0,
            "unset transform3d drops the enable flag (bit-exact default path)"
        );
        assert_eq!(
            app.world()
                .entity(display)
                .get::<LayerTransform>()
                .map(|t| t.0),
            Some(Mat4::IDENTITY),
            "the mirrored component resets too"
        );
    }

    /// A degenerate `ComputedNode.inverse_scale_factor` of zero (or negative)
    /// must not divide through to `misc.y` — the scale falls back to `1.0`
    /// (matching the shader's own `max(k, 1e-6)` guard on its side).
    #[test]
    fn zero_inverse_scale_factor_falls_back_to_scale_one() {
        let (mut app, tx) = systems_app();
        tx.send(vec![
            create_layer(1, serde_json::json!({})),
            append(ROOT_ID, 1),
        ])
        .unwrap();
        app.update();

        let display = ent(&app, 1);
        stamp_size_scaled(&mut app, display, 200.0, 100.0, 0.0);
        app.update();

        assert_eq!(
            material_of(&app, display).packed.misc.y,
            1.0,
            "zero inverse_scale_factor must not produce an infinite scale"
        );
    }

    /// Despawning a layer's display entity directly (e.g. a `DespawnOnExit`
    /// sweep — no reconciler op fires) garbage-collects the parentless
    /// companion root and the offscreen camera on the next frame.
    #[test]
    fn orphan_companion_and_camera_are_despawned() {
        let (mut app, tx) = systems_app();
        tx.send(vec![
            create_layer(1, serde_json::json!({})),
            append(ROOT_ID, 1),
        ])
        .unwrap();
        app.update();

        let display = ent(&app, 1);
        let companion = companion_of(&app, 1);
        let cam = camera_of(&app, 1);
        app.world_mut().entity_mut(display).despawn();
        app.update();

        assert!(
            app.world().get_entity(companion).is_err(),
            "orphaned companion root is despawned"
        );
        assert!(
            app.world().get_entity(cam).is_err(),
            "orphaned layer camera is despawned"
        );
    }

    /// On a 2x display (inverse scale factor 0.5): the texture tracks the
    /// display's PHYSICAL size, the companion root's `Node` its LOGICAL size,
    /// and the camera's render-target scale factor the display's scale factor
    /// — so `bevy_ui` lays the offscreen tree out at 2x and it exactly fills
    /// the physically-sized texture (the hidpi leg of the sizing model).
    #[test]
    fn hidpi_layer_sizes_texture_physical_and_companion_logical() {
        let (mut app, tx) = systems_app();
        tx.send(vec![
            create_layer(1, serde_json::json!({})),
            append(ROOT_ID, 1),
        ])
        .unwrap();
        app.update();

        let display = ent(&app, 1);
        stamp_size_scaled(&mut app, display, 400.0, 200.0, 0.5);
        app.update();

        assert_eq!(
            texture_size(&app, display),
            UVec2::new(400, 200),
            "texture = the display's physical pixel size"
        );
        let node = app
            .world()
            .entity(companion_of(&app, 1))
            .get::<Node>()
            .unwrap();
        assert_eq!(
            node.width,
            Val::Px(200.0),
            "companion width = logical size (physical * inverse scale factor)"
        );
        assert_eq!(node.height, Val::Px(100.0), "companion height = logical");
        match app
            .world()
            .entity(camera_of(&app, 1))
            .get::<BevyRenderTarget>()
            .unwrap()
        {
            BevyRenderTarget::Image(t) => assert_eq!(
                t.scale_factor, 2.0,
                "render-target scale factor synced to the display's scale factor"
            ),
            other => panic!("layer camera should target an image, got {other:?}"),
        }
    }

    /// A degenerate layout is clamped to [`MAX_DIM`] per axis. The capture is
    /// aspect-distorted under the clamp (companion box vs texture box no longer
    /// match) — accepted: the clamp is a guard against allocating an enormous
    /// texture, not a rendering path.
    #[test]
    fn layer_texture_clamps_to_max_dim() {
        let (mut app, tx) = systems_app();
        tx.send(vec![
            create_layer(1, serde_json::json!({})),
            append(ROOT_ID, 1),
        ])
        .unwrap();
        app.update();

        let display = ent(&app, 1);
        stamp_size(&mut app, display, 10_000.0, 50.0);
        app.update();

        assert_eq!(
            texture_size(&app, display),
            UVec2::new(MAX_DIM, 50),
            "each axis clamps to MAX_DIM independently (aspect distortion accepted)"
        );
    }

    /// `layer_depth` counts layer ancestors ACROSS a detached-root boundary: a
    /// layer inside a `<surface>` inside a layer still orders its camera before
    /// the outer layer's (the walk falls through `surface_parent` where
    /// `parent_of` ends).
    #[test]
    fn layer_depth_crosses_detached_root_boundaries() {
        let (mut app, tx) = systems_app();
        tx.send(vec![
            create_layer(1, serde_json::json!({})),
            Op::Create {
                id: 2,
                kind: "surface".into(),
                props: serde_json::from_value(serde_json::json!({ "name": "s" }))
                    .expect("valid surface props"),
                text: None,
            },
            create_layer(3, serde_json::json!({})),
            append(ROOT_ID, 1),
            append(1, 2),
            append(2, 3),
        ])
        .unwrap();
        app.update();

        let order = |id: NodeId| {
            app.world()
                .entity(camera_of(&app, id))
                .get::<Camera>()
                .unwrap()
                .order
        };
        assert_eq!(order(1), -1, "outer layer");
        assert_eq!(
            order(3),
            -2,
            "layer nesting is counted across the detached <surface> boundary"
        );
    }
}
