#![cfg_attr(docsrs, feature(doc_auto_cfg))]
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
