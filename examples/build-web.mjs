// Build an example for the WEB target into its `ui/dist/`, then serve it:
//   1. the React bundles (vendor.js + app.js) — same as the native build,
//   2. the Bevy app compiled to wasm + its wasm-bindgen JS glue (<name>.js),
//   3. index.html and the example assets, so `dist/` is a servable site,
//   4. `npx serve dist` (skipped with `--build-only`).
//
// Run from an example's `ui/` folder, whose package.json `name` is also the
// example's cargo package (its npm scripts do this):
//   npm run build:web -w demos                        debug build, then serve
//   npm run build:web:prod -w demos                   release build, then serve
//   npm run build:web:prod -w demos -- --build-only   build only (e.g. publish)
//
// Prerequisites (one-time):
//   rustup target add wasm32-unknown-unknown
//   cargo install wasm-bindgen-cli      # provides the `wasm-bindgen` binary
//
// `~/.cargo/bin` need not be on PATH — this finds the CLI there. The CLI and the
// `wasm-bindgen` *crate* share a schema per patch series, so a CLI a patch or two
// ahead of the locked crate (0.2.x) is fine; a larger gap makes wasm-bindgen error,
// in which case install the version this build hints at.

import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { buildVendor, buildApp } from "bevy-react/build-lib";

const prod = process.argv.includes("--prod");
const buildOnly = process.argv.includes("--build-only");
const profile = prod ? "release" : "debug";
const cwd = process.cwd(); // examples/<name>/ui
const { name } = JSON.parse(readFileSync(resolve(cwd, "package.json"), "utf8"));
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(cwd, "dist");

function run(cmd, args) {
  console.log(`[web] $ ${cmd} ${args.join(" ")}`);
  execFileSync(cmd, args, { stdio: "inherit" });
}

// Locate the `wasm-bindgen` CLI and read its version. `cargo install` drops it in
// ~/.cargo/bin, which isn't always on PATH (common with distro-packaged Rust), so
// fall back to it. Returns `{ bin, version }`; exits with an install hint if absent.
function findWasmBindgen() {
  for (const bin of [
    "wasm-bindgen",
    resolve(homedir(), ".cargo/bin/wasm-bindgen"),
  ]) {
    try {
      const out = execFileSync(bin, ["--version"], { encoding: "utf8" });
      return { bin, version: out.trim().split(/\s+/).pop() };
    } catch {
      // not here — try the next candidate
    }
  }
  const want = readFileSync(resolve(repoRoot, "Cargo.lock"), "utf8").match(
    /name = "wasm-bindgen"\nversion = "([^"]+)"/,
  )?.[1];
  console.error(
    "\n[web] `wasm-bindgen` CLI not found on PATH or in ~/.cargo/bin. Install it:\n" +
      `        cargo install wasm-bindgen-cli${want ? ` --version ${want}` : ""}\n`,
  );
  process.exit(1);
}

mkdirSync(dist, { recursive: true });

// Fail fast (before the multi-minute cargo build) if the CLI is missing.
const wasmBindgen = findWasmBindgen();
console.log(`[web] wasm-bindgen ${wasmBindgen.version} (${wasmBindgen.bin})`);

// 1) React bundles (host-agnostic; bridge.ts picks `globalThis.__bevyHost` on web).
await buildVendor({ outfile: "dist/vendor.js", prod, cwd });
await buildApp({ entry: "src/index.tsx", outfile: "dist/app.js", prod, cwd });
console.log("[web] vendor.js + app.js built");

// 2) Bevy → wasm. The package's `fn main()` builds + starts the app, and
//    `ReactUiPlugin` installs `globalThis.__bevyHost` while it builds.
run("cargo", [
  "build",
  "-p",
  name,
  "--target",
  "wasm32-unknown-unknown",
  ...(prod ? ["--release"] : []),
]);

const wasm = resolve(
  repoRoot,
  `target/wasm32-unknown-unknown/${profile}/${name}.wasm`,
);

// wasm-bindgen emits dist/<name>.js (the `init` loader) + dist/<name>_bg.wasm.
run(wasmBindgen.bin, [
  "--target",
  "web",
  "--out-dir",
  dist,
  "--out-name",
  name,
  wasm,
]);
console.log(`[web] ${name}.js + ${name}_bg.wasm generated`);

// 3) The page + assets. Bevy's default AssetPlugin fetches `assets/…` relative
//    to the page, so the example's assets are copied under dist/assets.
cpSync(resolve(cwd, "index.html"), resolve(dist, "index.html"));
cpSync(resolve(cwd, "../assets"), resolve(dist, "assets"), {
  recursive: true,
});
// Disable Jekyll on GitHub Pages so it serves the files (incl. `assets/`) verbatim.
writeFileSync(resolve(dist, ".nojekyll"), "");
console.log(`[web] wrote index.html + assets + .nojekyll → ${dist}`);

// 4) Serve the static site (unless asked to only build). `npx serve` blocks until
//    interrupted; it must serve `dist/` at the site root.
if (buildOnly) {
  console.log(
    `[web] build complete (--build-only). Serve dist/ yourself, e.g. \`npx serve ${dist}\`.`,
  );
} else {
  console.log("[web] serving dist/ — Ctrl-C to stop");
  run("npx", ["serve", dist]);
}
