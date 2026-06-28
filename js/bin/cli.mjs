#!/usr/bin/env node
// bevy-react scaffolding CLI. Zero runtime deps — Node built-ins only.
//
//   npx bevy-react init [dir]   scaffold a React UI for a bevy-react app
//
// Flags:
//   --name <pkgName>   npm package name (default: the target dir's name)
//   --install          run `npm install` in the new UI after scaffolding
//   --force            allow writing into a non-empty directory
//   --local <path>     depend on bevy-react via `file:<path>` instead of the
//                      published version (for local development of this repo)

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

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATES = join(HERE, "..", "templates");
const PKG = JSON.parse(readFileSync(join(HERE, "..", "package.json"), "utf8"));

function fail(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

function parseArgs(argv) {
  const opts = { positionals: [], install: false, force: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case "--install":
        opts.install = true;
        break;
      case "--force":
        opts.force = true;
        break;
      case "--name":
        opts.name = argv[++i];
        break;
      case "--local":
        opts.local = argv[++i];
        break;
      case "-h":
      case "--help":
        opts.help = true;
        break;
      default:
        if (a.startsWith("-")) fail(`unknown flag: ${a}`);
        opts.positionals.push(a);
    }
  }
  return opts;
}

function usage() {
  console.log(`bevy-react ${PKG.version}

Usage:
  npx bevy-react init [dir]   scaffold a React UI for a bevy-react app (default dir: ui)

Flags:
  --name <pkgName>   npm package name (default: the target dir's name)
  --install          run \`npm install\` in the new UI after scaffolding
  --force            allow writing into a non-empty directory
  --local <path>     depend on bevy-react via file:<path> (local development)
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

const opts = parseArgs(process.argv.slice(2));
const cmd = opts.positionals.shift();

if (opts.help || !cmd || cmd === "help") {
  usage();
  process.exit(0);
}

switch (cmd) {
  case "init":
    init(opts);
    break;
  default:
    fail(`unknown command: ${cmd}\nRun \`npx bevy-react --help\` for usage.`);
}
