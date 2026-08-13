//! Naga-validates the demos example's filter-pass WGSL (everything under
//! `examples/assets/shaders/` that `#import bevy_react::filter`) the same way
//! `filters::builtin`'s WGSL test covers the built-ins: no naga_oil
//! composition available, so each shader gets a poor-man's compose — its
//! `#import` block textually replaced by the prelude body — then parse +
//! validate + assert the `vertex`/`fragment` entry points survived.
//!
//! This is the only pre-GPU coverage app-side pass shaders get: at runtime a
//! broken pass gates its layer's composite (the subtree renders invisible)
//! and only warns, so a WGSL typo in an example shader would otherwise ship
//! silently. Like `roundtrip.rs`, the test skips with a notice if the
//! examples tree isn't present (repo-layout dependent).

use std::path::{Path, PathBuf};

const PRELUDE: &str = include_str!("../src/layer/filter_prelude.wgsl");

/// Recursively collect `.wgsl` files.
fn collect_wgsl(dir: &Path, out: &mut Vec<PathBuf>) {
    let Ok(entries) = std::fs::read_dir(dir) else {
        return;
    };
    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_dir() {
            collect_wgsl(&path, out);
        } else if path.extension().is_some_and(|e| e == "wgsl") {
            out.push(path);
        }
    }
}

/// Replace the (possibly multi-line) `#import ... }` block with the prelude
/// body (mirrors `filters::builtin::tests::splice`).
fn splice(prelude_body: &str, src: &str) -> String {
    let mut out = String::new();
    let mut lines = src.lines();
    while let Some(line) = lines.next() {
        if line.trim_start().starts_with("#import") {
            out.push_str(prelude_body);
            out.push('\n');
            if !line.contains('}') {
                for rest in lines.by_ref() {
                    if rest.trim() == "}" {
                        break;
                    }
                }
            }
        } else {
            out.push_str(line);
            out.push('\n');
        }
    }
    out
}

fn validate(name: &str, source: &str, entry_points: &[&str]) {
    let module = naga::front::wgsl::parse_str(source)
        .unwrap_or_else(|e| panic!("{name} does not parse:\n{}", e.emit_to_string(source)));
    naga::valid::Validator::new(
        naga::valid::ValidationFlags::all(),
        naga::valid::Capabilities::all(),
    )
    .validate(&module)
    .unwrap_or_else(|e| panic!("{name} does not validate: {e:?}"));
    for entry in entry_points {
        assert!(
            module.entry_points.iter().any(|e| e.name == *entry),
            "{name} is missing entry point `{entry}` — splice mangled?"
        );
    }
}

#[test]
fn example_filter_shaders_parse_and_validate() {
    let shaders_dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../examples/assets/shaders");
    if !shaders_dir.is_dir() {
        eprintln!(
            "skipping: {} not present (examples tree not checked out)",
            shaders_dir.display()
        );
        return;
    }

    let prelude_body: String = PRELUDE
        .lines()
        .filter(|l| !l.trim_start().starts_with("#define_import_path"))
        .collect::<Vec<_>>()
        .join("\n");

    let mut files = Vec::new();
    collect_wgsl(&shaders_dir, &mut files);
    files.sort();
    assert!(!files.is_empty(), "no wgsl under {}", shaders_dir.display());

    let mut checked = 0;
    for path in files {
        let src = std::fs::read_to_string(&path)
            .unwrap_or_else(|e| panic!("read {}: {e}", path.display()));
        // Only filter passes follow the prelude contract; other shaders in
        // the tree (scene materials like crt/ambient) are validated by their
        // own pipelines at runtime.
        if !src.contains("#import bevy_react::filter") {
            continue;
        }
        let name = path
            .strip_prefix(&shaders_dir)
            .unwrap_or(&path)
            .display()
            .to_string();
        validate(&name, &splice(&prelude_body, &src), &["vertex", "fragment"]);
        checked += 1;
    }
    assert!(
        checked >= 3,
        "expected at least ripple/glitch/dissolve, checked {checked}"
    );
}
