//! Where an expansion finds bevy-react — and, through its `__private`
//! re-exports, the `serde`, `ts-rs`, and `bevy` the generated code names, so
//! a caller needs none of them as direct dependencies.

use proc_macro_crate::{FoundCrate, crate_name};
use proc_macro2::{Span, TokenStream};
use quote::quote;
use syn::{Ident, LitStr};

/// The bevy-react crate the caller depends on, by the name its manifest
/// gives it.
pub(crate) struct Krate(String);

impl Krate {
    /// Resolve from the caller's `Cargo.toml` (renamed and workspace
    /// dependencies included): the `bevy-react` facade when it is a
    /// dependency (the app, a third-party extension), else
    /// `bevy_react_core` (an in-repo feature crate, or the core itself —
    /// its `extern crate self as bevy_react_core` names it). The facade's
    /// own tests resolve to `::bevy_react` the same way.
    pub(crate) fn resolve() -> Self {
        // crates.io treats `-` and `_` alike, so either spelling may name it.
        let facade = crate_name("bevy-react").or_else(|_| crate_name("bevy_react"));
        let name = match facade {
            Ok(FoundCrate::Itself) => "bevy_react".to_owned(),
            Ok(FoundCrate::Name(name)) => name,
            Err(_) => match crate_name("bevy_react_core") {
                Ok(FoundCrate::Name(name)) => name,
                Ok(FoundCrate::Itself) => "bevy_react_core".to_owned(),
                // No manifest entry (a re-export through another crate):
                // name the crate apps depend on.
                Err(_) => "bevy_react".to_owned(),
            },
        };
        Self(name)
    }

    /// `::<crate>` — the crate root (the core's paths, which the facade
    /// re-exports unchanged).
    pub(crate) fn root(&self) -> TokenStream {
        let ident = Ident::new(&self.0, Span::call_site());
        quote!(::#ident)
    }

    /// `::<crate>::__private::<dep>` — a re-exported dependency.
    pub(crate) fn private(&self, dep: &str) -> TokenStream {
        let root = self.root();
        let dep = Ident::new(dep, Span::call_site());
        quote!(#root::__private::#dep)
    }

    /// The same path as a string literal, for `#[serde(crate = "…")]` and
    /// `#[ts(crate = "…")]`.
    pub(crate) fn private_lit(&self, dep: &str) -> LitStr {
        LitStr::new(
            &format!("::{}::__private::{dep}", self.0),
            Span::call_site(),
        )
    }

    /// The `#[derive(..)]` of the serde trait `serde_trait` plus ts-rs's
    /// `TS`, with the helper attributes pointing both at the re-exports.
    pub(crate) fn derive_serde_ts(&self, serde_trait: &str) -> TokenStream {
        let serde = self.private("serde");
        let ts_rs = self.private("ts_rs");
        let serde_trait = Ident::new(serde_trait, Span::call_site());
        let serde_crate = self.private_lit("serde");
        let ts_crate = self.private_lit("ts_rs");
        quote! {
            #[derive(#serde::#serde_trait, #ts_rs::TS)]
            #[serde(crate = #serde_crate)]
            #[ts(crate = #ts_crate)]
        }
    }
}
