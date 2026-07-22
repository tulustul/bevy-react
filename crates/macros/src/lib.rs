#![cfg_attr(docsrs, feature(doc_cfg))]
//! Proc-macro support for `bevy-react`.
//!
//! Provides [`react_message`], the attribute that turns a plain struct into a
//! registrable React message payload.
//
// TODO(review): these macros expand to `::serde::` and `::ts_rs::` paths, forcing every
// downstream consumer crate to add `serde` AND `ts_rs` as direct dependencies (works in-repo
// only because examples share the package's deps). Re-export both from the lib (e.g.
// `bevy_react::__private::{serde, ts_rs}`) and reference those paths so consumers need only
// `bevy_react` + `bevy`.

use proc_macro::TokenStream;
use quote::quote;
use syn::{DeriveInput, LitStr, Type, parse_macro_input};

/// Turn a struct into a typed React message payload.
///
/// Applying `#[react_message]` derives `serde::Deserialize` and `ts_rs::TS` and
/// implements both `bevy::ecs::event::Event` and `bevy_react::ReactPayload`, so the
/// type can be registered with `App::add_react_handler` / `add_react_message`, routed
/// from a React `emit(name, value)` call, and exported to TypeScript via
/// `App::export_react_typescript`.
///
/// The `emit` name defaults to the struct name with its first letter lowercased
/// (`Count` → `"count"`, `PlayerScore` → `"playerScore"`); override it with
/// `#[react_message(name = "...")]`.
///
/// ```ignore
/// #[react_message]
/// struct Count(usize);            // name = "count"
///
/// #[react_message(name = "hp")]
/// struct Health(u32);             // name = "hp"
/// ```
#[proc_macro_attribute]
pub fn react_message(attr: TokenStream, item: TokenStream) -> TokenStream {
    let name_override = match parse_name_only_attr(attr, "react_message") {
        Ok(name) => name,
        Err(e) => return e.to_compile_error().into(),
    };

    let input = parse_macro_input!(item as DeriveInput);
    let PayloadParts {
        ident,
        impl_generics,
        ty_generics,
        where_clause,
        name,
    } = payload_parts(&input, name_override);

    quote! {
        #[derive(::serde::Deserialize, ::ts_rs::TS)]
        #input

        impl #impl_generics ::bevy::ecs::event::Event for #ident #ty_generics #where_clause {
            type Trigger<'a> = ::bevy::ecs::event::GlobalTrigger;
        }

        impl #impl_generics ::bevy_react::ReactPayload for #ident #ty_generics #where_clause {
            const NAME: &'static str = #name;
        }
    }
    .into()
}

/// Turn a struct into a typed React **request** payload (a React → Bevy call that
/// awaits a typed reply).
///
/// Derives `serde::Deserialize` + `ts_rs::TS` and implements
/// [`bevy_react::ReactRequest`], so the type can be registered with
/// `App::add_react_request_handler` and answered from a React `request(name, value)`
/// call. Observe `On<Request<T>>` and reply with `req.respond(value)`.
///
/// The `response` type is required and points at a type you define separately and
/// derive `serde::Serialize` + `ts_rs::TS` on. The `name` defaults to the struct
/// ident with its first letter lowercased; use a dotted name to get a nested proxy
/// (`#[react_request(name = "board.get", ...)]` → `bevy.board.get`).
///
/// ```ignore
/// #[react_request(name = "board.get", response = Board)]
/// struct BoardGet;                // unit payload → `bevy.board.get()` takes no args
///
/// #[react_request(name = "pieces.move", response = MoveStatus)]
/// struct PiecesMove { piece: String, to: String }
/// ```
#[proc_macro_attribute]
pub fn react_request(attr: TokenStream, item: TokenStream) -> TokenStream {
    let mut name_override: Option<String> = None;
    let mut response: Option<Type> = None;
    let arg_parser = syn::meta::parser(|meta| {
        if try_parse_name_arg(&meta, &mut name_override)? {
            Ok(())
        } else if meta.path.is_ident("response") {
            response = Some(meta.value()?.parse::<Type>()?);
            Ok(())
        } else {
            Err(meta.error(
                "unsupported `react_request` argument; expected `name = \"...\"` or `response = Type`",
            ))
        }
    });
    parse_macro_input!(attr with arg_parser);

    let response = match response {
        Some(ty) => ty,
        None => {
            return syn::Error::new(
                proc_macro2::Span::call_site(),
                "`react_request` requires a `response = Type` argument",
            )
            .to_compile_error()
            .into();
        }
    };

    let input = parse_macro_input!(item as DeriveInput);
    let PayloadParts {
        ident,
        impl_generics,
        ty_generics,
        where_clause,
        name,
    } = payload_parts(&input, name_override);

    quote! {
        #[derive(::serde::Deserialize, ::ts_rs::TS)]
        #input

        impl #impl_generics ::bevy_react::ReactRequest for #ident #ty_generics #where_clause {
            const NAME: &'static str = #name;
            type Response = #response;
        }
    }
    .into()
}

/// Turn a struct into a typed React **event** payload (a Bevy → React broadcast).
///
/// Derives `serde::Serialize` + `ts_rs::TS` and implements
/// [`bevy_react::ReactEvent`]. Send it from a system with the `ReactEvents` param;
/// React listens with `bevy.on(name, cb)`. Register the type with
/// `App::add_react_event::<E>()` so it appears in the generated typings.
///
/// The `name` defaults to the struct ident with its first letter lowercased.
///
/// ```ignore
/// #[react_event(name = "user.disconnected")]
/// struct UserDisconnected { user_id: String }
/// ```
#[proc_macro_attribute]
pub fn react_event(attr: TokenStream, item: TokenStream) -> TokenStream {
    let name_override = match parse_name_only_attr(attr, "react_event") {
        Ok(name) => name,
        Err(e) => return e.to_compile_error().into(),
    };

    let input = parse_macro_input!(item as DeriveInput);
    let PayloadParts {
        ident,
        impl_generics,
        ty_generics,
        where_clause,
        name,
    } = payload_parts(&input, name_override);

    quote! {
        #[derive(::serde::Serialize, ::ts_rs::TS)]
        #input

        impl #impl_generics ::bevy_react::ReactEvent for #ident #ty_generics #where_clause {
            const NAME: &'static str = #name;
        }
    }
    .into()
}

/// Turn a named-field struct into a typed **custom filter** for the
/// layer-based `filter` style chain.
///
/// Derives `serde::Deserialize` — adding `#[serde(deny_unknown_fields)]`, so
/// unknown param keys reject like the built-ins; per-field `#[serde(default)]`
/// attributes you write are preserved — plus `ts_rs::TS`, and implements
/// `bevy_react::filters::ReactFilter`. Built-in filters stay hand-written
/// (they share canonical shader layouts); this macro is for custom filters,
/// which pack against their own shader.
///
/// Arguments:
///
/// - `name = "..."` (optional) — the wire name; defaults to the struct ident
///   with its first letter lowercased (`Glow` → `"glow"`).
/// - `shader = "path/to.wgsl"` (required) — loaded with `AssetServer::load`,
///   so a plain asset path relative to your assets dir; `embedded://` paths
///   also work verbatim.
/// - `outset = <number>` (optional, default `0.0`) — extra *logical* px the
///   effect bleeds outside the node's rect.
/// - `time = <bool>` (optional, default `false`) — a time-driven effect
///   re-renders its layer every frame.
///
/// The generated `pack()` fills the shader's `params` vec4 array
/// contiguously **in field declaration order**, mapped by field type. Params
/// pack into at most `MAX_FILTER_PARAM_VECS` (8) vec4s, enforced at resolve
/// time — an over-cap filter is rejected at runtime with a devtools warning,
/// not a compile error. Shader-side, the packed array is `uniforms.params`
/// via `#import bevy_react::filter` (see
/// `crates/core/src/layer/filter_prelude.wgsl` for the full binding
/// contract).
///
/// | field type           | packs as                          | components |
/// |----------------------|-----------------------------------|------------|
/// | `f32`                | scalar                            | 1          |
/// | `Vec2`/`Vec3`/`Vec4` | scalars                           | 2/3/4      |
/// | `[f32; 2..=4]`       | scalars                           | 2–4        |
/// | `Angle`              | radians (a bare wire number is degrees) | 1    |
/// | `Length`             | logical px (px-only; other units reject the filter use via `outset`/`resolve`) | 1 |
/// | `FilterColor`        | linear straight-alpha RGBA        | 4          |
///
/// A multi-component param that would straddle a vec4 boundary pads to the
/// next vec4 (the skipped components stay zero) — a `ParamSlot` never crosses
/// a vec4. Any other field type fails compilation with an error naming the
/// field and listing the supported types.
///
/// ```ignore
/// #[react_filter(name = "glow", shader = "shaders/glow.wgsl", outset = 4.0)]
/// struct GlowParams {
///     intensity: f32,          // params[0].x
///     direction: Vec2,         // params[0].yz
///     tint: FilterColor,       // params[1] (padded past params[0].w)
/// }
/// ```
#[proc_macro_attribute]
pub fn react_filter(attr: TokenStream, item: TokenStream) -> TokenStream {
    let mut name_override: Option<String> = None;
    let mut shader: Option<LitStr> = None;
    let mut outset: f32 = 0.0;
    let mut time = false;
    let arg_parser = syn::meta::parser(|meta| {
        if try_parse_name_arg(&meta, &mut name_override)? {
            Ok(())
        } else if meta.path.is_ident("shader") {
            shader = Some(meta.value()?.parse::<LitStr>()?);
            Ok(())
        } else if meta.path.is_ident("outset") {
            outset = match meta.value()?.parse::<syn::Lit>()? {
                syn::Lit::Float(f) => f.base10_parse()?,
                syn::Lit::Int(i) => i.base10_parse()?,
                other => {
                    return Err(syn::Error::new_spanned(
                        other,
                        "`outset` must be a number literal (logical px)",
                    ));
                }
            };
            Ok(())
        } else if meta.path.is_ident("time") {
            time = meta.value()?.parse::<syn::LitBool>()?.value;
            Ok(())
        } else {
            Err(meta.error(
                "unsupported `react_filter` argument; expected `name = \"...\"`, \
                 `shader = \"...\"`, `outset = <number>`, or `time = <bool>`",
            ))
        }
    });
    parse_macro_input!(attr with arg_parser);

    let Some(shader) = shader else {
        return syn::Error::new(
            proc_macro2::Span::call_site(),
            "`react_filter` requires a `shader = \"path/to.wgsl\"` argument",
        )
        .to_compile_error()
        .into();
    };

    let mut input = parse_macro_input!(item as DeriveInput);
    let name = name_override.unwrap_or_else(|| lower_first(&input.ident.to_string()));

    let syn::Data::Struct(data) = &mut input.data else {
        return syn::Error::new_spanned(&input.ident, "`react_filter` requires a struct")
            .to_compile_error()
            .into();
    };
    let syn::Fields::Named(fields) = &mut data.fields else {
        return syn::Error::new_spanned(
            &input.ident,
            "`react_filter` requires named fields (each field becomes a shader param)",
        )
        .to_compile_error()
        .into();
    };

    // Walk the fields in declaration order, assigning each a contiguous
    // no-straddle slot in the packed vec4 array and collecting the generated
    // slot/write/validation code (plus `#[ts(type)]` overrides for field
    // types without a `ts_rs::TS` impl — recorded here, applied only after
    // the walk proves error-free: the error path emits the struct without
    // `#[derive(TS)]`, where a pushed `#[ts]` attr would add a spurious
    // "cannot find attribute `ts`" error alongside the real one).
    let mut ts_overrides: Vec<(usize, &'static str)> = Vec::new();
    let mut errors: Vec<proc_macro2::TokenStream> = Vec::new();
    let mut slots: Vec<proc_macro2::TokenStream> = Vec::new();
    let mut writes: Vec<proc_macro2::TokenStream> = Vec::new();
    let mut length_checks: Vec<proc_macro2::TokenStream> = Vec::new();
    let mut vec_i = 0usize;
    let mut comp = 0usize;
    for (field_i, field) in fields.named.iter().enumerate() {
        let ident = field.ident.clone().expect("named field");
        let field_name = ident.to_string();
        let Some(param) = classify_filter_field(&field.ty) else {
            errors.push(
                syn::Error::new_spanned(
                    &field.ty,
                    format!(
                        "`react_filter` cannot pack field `{field_name}`: supported param types \
                         are f32, Vec2, Vec3, Vec4, [f32; 2..=4], Angle, Length, and FilterColor"
                    ),
                )
                .to_compile_error(),
            );
            continue;
        };
        let len = param.len();
        // No-straddle rule: a param that would cross a vec4 boundary pads to
        // the next vec4; the skipped components stay zero.
        if comp + len > 4 {
            vec_i += 1;
            comp = 0;
        }
        let (v, c) = (vec_i, comp);
        let kind = param.value_kind();
        slots.push(quote! {
            ::bevy_react::filters::ParamSlot {
                name: #field_name,
                kind: #kind,
                vec: #v,
                comp: #c,
                len: #len,
            }
        });
        match &param {
            FilterField::Scalar => writes.push(quote! { params[#v][#c] = self.#ident; }),
            FilterField::Vector(n) => {
                for (i, axis) in ["x", "y", "z", "w"].iter().take(*n).enumerate() {
                    let axis = syn::Ident::new(axis, proc_macro2::Span::call_site());
                    let ci = c + i;
                    writes.push(quote! { params[#v][#ci] = self.#ident.#axis; });
                }
            }
            FilterField::Array(n) => {
                for i in 0..*n {
                    let ci = c + i;
                    writes.push(quote! { params[#v][#ci] = self.#ident[#i]; });
                }
            }
            FilterField::Angle => {
                writes.push(quote! { params[#v][#c] = self.#ident.radians(); });
            }
            FilterField::Length => {
                // Logical px, same packing blur uses; the chain resolver
                // rewrites Length slots to physical px. The infallible pack
                // falls back to 0.0 — a non-px unit can't reach the shader
                // because the generated `outset`/`resolve` reject it first.
                writes.push(quote! {
                    params[#v][#c] = ::bevy_react::filters::length_logical_px(
                        #name, #field_name, self.#ident,
                    )
                    .unwrap_or(0.0);
                });
                length_checks.push(quote! {
                    ::bevy_react::filters::length_logical_px(#name, #field_name, self.#ident)?;
                });
            }
            FilterField::Color => {
                for i in 0..4usize {
                    let ci = c + i;
                    writes.push(quote! { params[#v][#ci] = self.#ident.0[#i]; });
                }
            }
        }
        comp += len;
        if comp == 4 {
            vec_i += 1;
            comp = 0;
        }
        if let Some(ts) = param.ts_override() {
            ts_overrides.push((field_i, ts));
        }
    }
    if errors.is_empty() {
        // Only a fully valid struct gets the `#[ts(type)]` overrides — the
        // emitted struct below carries the `#[derive(TS)]` they need.
        for (field_i, ts) in ts_overrides {
            fields.named[field_i]
                .attrs
                .push(syn::parse_quote!(#[ts(type = #ts)]));
        }
    } else {
        // Emit the struct exactly as written alongside the errors so
        // downstream code still sees the type, without a half-generated
        // `ReactFilter` impl.
        return quote! { #input #(#errors)* }.into();
    }
    let total_vecs = if comp == 0 { vec_i } else { vec_i + 1 };

    let ident = &input.ident;
    let (impl_generics, ty_generics, where_clause) = input.generics.split_for_impl();
    // Overriding `resolve` only matters when there are `Length` params to
    // validate; otherwise the trait default (the same body) applies.
    let resolve_override = (!length_checks.is_empty()).then(|| {
        quote! {
            fn resolve(
                &self,
                assets: &::bevy::asset::AssetServer,
            ) -> ::std::result::Result<
                ::std::vec::Vec<::bevy_react::filters::ResolvedFilterPass>,
                ::std::string::String,
            > {
                #(#length_checks)*
                ::bevy_react::filters::resolve_single_pass(self, assets)
            }
        }
    });

    quote! {
        #[derive(::serde::Deserialize, ::ts_rs::TS)]
        #[serde(deny_unknown_fields)]
        #input

        impl #impl_generics ::bevy_react::filters::ReactFilter for #ident #ty_generics #where_clause {
            const NAME: &'static str = #name;
            const USES_TIME: bool = #time;

            fn shader(
                assets: &::bevy::asset::AssetServer,
            ) -> ::bevy::asset::Handle<::bevy::shader::Shader> {
                assets.load(#shader)
            }

            fn outset(&self) -> ::std::result::Result<f32, ::std::string::String> {
                #(#length_checks)*
                ::std::result::Result::Ok(#outset)
            }

            fn pack(
                &self,
            ) -> (
                ::std::vec::Vec<::bevy::math::Vec4>,
                ::std::sync::Arc<[::bevy_react::filters::ParamSlot]>,
            ) {
                static LAYOUT: ::std::sync::LazyLock<
                    ::std::sync::Arc<[::bevy_react::filters::ParamSlot]>,
                > = ::std::sync::LazyLock::new(|| {
                    ::std::sync::Arc::from(::std::vec![#(#slots),*])
                });
                #[allow(unused_mut)]
                let mut params = ::std::vec![::bevy::math::Vec4::ZERO; #total_vecs];
                #(#writes)*
                (params, LAYOUT.clone())
            }

            #resolve_override
        }
    }
    .into()
}

/// How one `react_filter` param field packs, keyed off its declared type's
/// last path segment (or `[f32; N]` array shape).
enum FilterField {
    /// `f32`.
    Scalar,
    /// `Vec2`/`Vec3`/`Vec4` (2–4 scalar components).
    Vector(usize),
    /// `[f32; N]`, `N` in `2..=4`.
    Array(usize),
    /// `Angle` — packs radians.
    Angle,
    /// `Length` — packs logical px (px-only; validated in `outset`/`resolve`).
    Length,
    /// `FilterColor` — packs linear RGBA across 4 components.
    Color,
}

impl FilterField {
    /// Packed component count.
    fn len(&self) -> usize {
        match self {
            Self::Scalar | Self::Angle | Self::Length => 1,
            Self::Vector(n) | Self::Array(n) => *n,
            Self::Color => 4,
        }
    }

    /// The `ValueKind` tokens for this param's `ParamSlot`.
    fn value_kind(&self) -> proc_macro2::TokenStream {
        match self {
            Self::Scalar | Self::Vector(_) | Self::Array(_) => {
                quote!(::bevy_react::animations::ValueKind::Scalar)
            }
            Self::Angle => quote!(::bevy_react::animations::ValueKind::Angle),
            Self::Length => quote!(::bevy_react::animations::ValueKind::Length),
            Self::Color => quote!(::bevy_react::animations::ValueKind::Color),
        }
    }

    /// `#[ts(type = "...")]` override for field types without a `ts_rs::TS`
    /// impl (glam vectors, the wire-flexible `Angle`/`Length`). `f32`,
    /// `[f32; N]`, and `FilterColor` have real impls — no override.
    fn ts_override(&self) -> Option<&'static str> {
        match self {
            Self::Vector(2) => Some("[number, number]"),
            Self::Vector(3) => Some("[number, number, number]"),
            Self::Vector(4) => Some("[number, number, number, number]"),
            Self::Angle | Self::Length => Some("number | string"),
            _ => None,
        }
    }
}

/// Map a field's declared type to its packing, or `None` if unsupported.
/// Matches on the type path's last segment, so `bevy::math::Vec2` and a bare
/// `Vec2` both work.
fn classify_filter_field(ty: &Type) -> Option<FilterField> {
    match ty {
        Type::Path(p) => {
            let seg = p.path.segments.last()?;
            if !seg.arguments.is_empty() {
                return None;
            }
            match seg.ident.to_string().as_str() {
                "f32" => Some(FilterField::Scalar),
                "Vec2" => Some(FilterField::Vector(2)),
                "Vec3" => Some(FilterField::Vector(3)),
                "Vec4" => Some(FilterField::Vector(4)),
                "Angle" => Some(FilterField::Angle),
                "Length" => Some(FilterField::Length),
                "FilterColor" => Some(FilterField::Color),
                _ => None,
            }
        }
        Type::Array(a) => {
            let is_f32 = matches!(&*a.elem, Type::Path(p) if p.path.is_ident("f32"));
            let syn::Expr::Lit(lit) = &a.len else {
                return None;
            };
            let syn::Lit::Int(n) = &lit.lit else {
                return None;
            };
            let n = n.base10_parse::<usize>().ok()?;
            (is_f32 && (2..=4).contains(&n)).then_some(FilterField::Array(n))
        }
        _ => None,
    }
}

/// Consume a `name = "..."` argument if that's what `meta` holds; returns
/// whether it matched, so callers can chain their own arms after it.
fn try_parse_name_arg(
    meta: &syn::meta::ParseNestedMeta,
    out: &mut Option<String>,
) -> syn::Result<bool> {
    if meta.path.is_ident("name") {
        *out = Some(meta.value()?.parse::<LitStr>()?.value());
        Ok(true)
    } else {
        Ok(false)
    }
}

/// Parse an attribute argument list that accepts only `name = "..."` (the
/// `react_message`/`react_event` form; `react_request` adds a `response` arm).
fn parse_name_only_attr(attr: TokenStream, macro_name: &str) -> syn::Result<Option<String>> {
    let mut name_override: Option<String> = None;
    let parser = syn::meta::parser(|meta| {
        if try_parse_name_arg(&meta, &mut name_override)? {
            Ok(())
        } else {
            Err(meta.error(format!(
                "unsupported `{macro_name}` argument; expected `name = \"...\"`"
            )))
        }
    });
    syn::parse::Parser::parse(parser, attr)?;
    Ok(name_override)
}

/// The pieces every `react_*` macro pulls off the annotated struct.
struct PayloadParts<'a> {
    ident: &'a syn::Ident,
    impl_generics: syn::ImplGenerics<'a>,
    ty_generics: syn::TypeGenerics<'a>,
    where_clause: Option<&'a syn::WhereClause>,
    /// The wire name: the `name = "..."` override, or the struct ident with its
    /// first letter lowercased (`Count` → `"count"`).
    name: String,
}

fn payload_parts<'a>(input: &'a DeriveInput, name_override: Option<String>) -> PayloadParts<'a> {
    let ident = &input.ident;
    let (impl_generics, ty_generics, where_clause) = input.generics.split_for_impl();
    PayloadParts {
        ident,
        impl_generics,
        ty_generics,
        where_clause,
        name: name_override.unwrap_or_else(|| lower_first(&ident.to_string())),
    }
}

/// Lowercase only the first character of `s` (`Count` → `count`).
fn lower_first(s: &str) -> String {
    let mut chars = s.chars();
    match chars.next() {
        Some(first) => first.to_lowercase().collect::<String>() + chars.as_str(),
        None => String::new(),
    }
}
