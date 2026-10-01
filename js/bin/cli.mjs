#!/usr/bin/env node
// bevy-react CLI. `init` uses Node built-ins only; `build` loads
// `build-lib.mjs` (esbuild + swc, the UI's dev dependencies) on demand.
//
//   npx bevy-react init [dir]   scaffold a React UI for a bevy-react app
//   npx bevy-react build        bundle src/index.tsx → dist/vendor.js + dist/app.js
//
// Flags:
//   --name <pkgName>   npm package name (default: the target dir's name)
//   --install          run `npm install` in the new UI after scaffolding
//   --force            allow writing into a non-empty directory
//   --local <path>     depend on bevy-react via `file:<path>` instead of the
//                      published version (for local development of this repo)
//   --watch            (build) rebuild app.js on change (React Fast Refresh)
//   --prod             (build) production bundles

import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  statSync,
} from "node:fs";
import { join, resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { parseArgs } from "node:util";

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATES = join(HERE, "..", "templates");
const PKG = JSON.parse(readFileSync(join(HERE, "..", "package.json"), "utf8"));

function fail(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

function parseCli(argv) {
  try {
    const { values, positionals } = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        name: { type: "string" },
        local: { type: "string" },
        install: { type: "boolean" },
        force: { type: "boolean" },
        watch: { type: "boolean" },
        prod: { type: "boolean" },
        help: { type: "boolean", short: "h" },
      },
    });
    return { ...values, positionals };
  } catch (e) {
    fail(e.message);
  }
}

function usage() {
  console.log(`bevy-react ${PKG.version}

Usage:
  npx bevy-react init [dir]   scaffold a React UI for a bevy-react app (default dir: ui)
  npx bevy-react build        bundle src/index.tsx → dist/vendor.js + dist/app.js

Flags:
  --name <pkgName>   npm package name (default: the target dir's name)
  --install          run \`npm install\` in the new UI after scaffolding
  --force            allow writing into a non-empty directory
  --local <path>     depend on bevy-react via file:<path> (local development)
  --watch            (build) rebuild app.js on change (React Fast Refresh)
  --prod             (build) production bundles
`);
}

// Recursively copy a template dir into `dest`, applying `tokens` to text files
// and renaming `_gitignore` → `.gitignore`.
function copyTemplate(src, dest, tokens) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const from = join(src, entry);
    const name = entry === "_gitignore" ? ".gitignore" : entry;
    const to = join(dest, name);
    if (statSync(from).isDirectory()) {
      copyTemplate(from, to, tokens);
    } else {
      let body = readFileSync(from, "utf8");
      for (const [k, v] of Object.entries(tokens)) {
        body = body.replaceAll(`{{${k}}}`, v);
      }
      writeFileSync(to, body);
    }
  }
}

function isEmptyDir(dir) {
  try {
    return readdirSync(dir).length === 0;
  } catch (e) {
    if (e.code === "ENOENT") return true;
    throw e;
  }
}

function init(opts) {
  const dir = opts.positionals[0] ?? "ui";
  const target = resolve(process.cwd(), dir);
  const name = opts.name ?? basename(target);
  const version = opts.local
    ? `file:${resolve(process.cwd(), opts.local)}`
    : `^${PKG.version}`;

  if (!isEmptyDir(target) && !opts.force) {
    fail(`${target} is not empty (use --force to scaffold anyway)`);
  }

  copyTemplate(join(TEMPLATES, "ui"), target, { name, version });
  console.log(`scaffolded UI in ${target}`);

  if (opts.install) {
    console.log("running npm install…");
    const r = spawnSync("npm", ["install"], { cwd: target, stdio: "inherit" });
    if (r.status !== 0) fail("npm install failed");
  }

  const uiRel = dir;
  console.log(`
Next steps:
  cd ${uiRel}${opts.install ? "" : "\n  npm install"}
  npm run build          # → dist/vendor.js + dist/app.js
  npm run watch          # rebuild on change (hot reload)

Then run your Bevy host (it loads dist/app.js). After you define React ↔ Bevy
channels in Rust, run \`npm run bevy:generate\` to regenerate src/bevy.ts.
`);
}

// Bundle the UI in the current directory as vendor.js (react + the runtime,
// loaded once) + app.js (the app, re-executed on every hot reload) — see
// build-lib.mjs for the why.
async function build(opts) {
  const { buildVendor, buildApp, watchApp } = await import("../build-lib.mjs");
  const cwd = process.cwd();
  const { prod } = opts;
  const app = { entry: "src/index.tsx", outfile: "dist/app.js", prod, cwd };
  await buildVendor({ outfile: "dist/vendor.js", prod, cwd });
  if (opts.watch) {
    await watchApp(app);
    console.log("[build] watching app sources (vendor built once)…");
  } else {
    await buildApp(app);
    console.log("[build] vendor.js + app.js built");
  }
}

const opts = parseCli(process.argv.slice(2));
const cmd = opts.positionals.shift();

if (opts.help || !cmd || cmd === "help") {
  usage();
  process.exit(0);
}

switch (cmd) {
  case "init":
    init(opts);
    break;
  case "build":
    await build(opts);
    break;
  default:
    fail(`unknown command: ${cmd}\nRun \`npx bevy-react --help\` for usage.`);
}
