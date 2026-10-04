#!/usr/bin/env node
// Re-create the docs screenshots/animations described in `screenshots.json`.
//
//   npm run screenshots                       # every shot → screenshots/<name>.<ext>
//   npm run screenshots -- --only home        # one shot (comma-separate for more)
//   npm run screenshots -- --suffix _v3       # → screenshots/<name>_v3.<ext>
//
// Each shot runs the demos app's `--shoot` mode (see examples/demos/screenshot.rs),
// then crops/encodes: stills and GIFs with ffmpeg, WebP with Pillow (ffmpeg's
// WebP leaves tinted patches where frames change over dark gradients). Needs an
// X11 display, a GPU, ffmpeg, and python3 with Pillow.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";

/** Frames per second of `--record` (`RECORD_FPS` in examples/demos/screenshot.rs). */
const RECORD_FPS = 25;
const ROOT = path.resolve(import.meta.dirname, "..");
const DIR = path.join(ROOT, "screenshots");
// Read by the devtools from the app's cwd (the repo root under `cargo run`).
const DEVTOOLS_SETTINGS = path.join(ROOT, ".bevy-react-devtools.json");

const { values: opts } = parseArgs({
  options: {
    only: { type: "string" },
    suffix: { type: "string", default: "" },
  },
});

const { shots } = JSON.parse(
  fs.readFileSync(path.join(DIR, "screenshots.json"), "utf8"),
);
const nameOf = (shot) => path.parse(shot.out).name;
const wanted = opts.only?.split(",").map((s) => s.trim());
const unknown =
  wanted?.filter((n) => !shots.some((s) => nameOf(s) === n)) ?? [];
if (unknown.length) {
  console.error(`unknown shot(s): ${unknown.join(", ")}`);
  console.error(`available: ${shots.map(nameOf).join(", ")}`);
  process.exit(1);
}
const selected = wanted
  ? shots.filter((s) => wanted.includes(nameOf(s)))
  : shots;

/** Run a command; on failure print its log (if any) and exit. */
function run(cmd, args, log) {
  const fd = log ? fs.openSync(log, "w") : "inherit";
  const res = spawnSync(cmd, args, { cwd: ROOT, stdio: ["ignore", fd, fd] });
  if (log) fs.closeSync(fd);
  if (res.status !== 0) {
    if (log)
      process.stderr.write(
        fs.readFileSync(log, "utf8").split("\n").slice(-40).join("\n"),
      );
    console.error(
      `\n✗ ${cmd} ${args.join(" ")} failed (${res.error ?? `exit ${res.status}`})`,
    );
    process.exit(1);
  }
}

/** Run `--shoot` for one shot into `target` (a PNG, or a frame dir when recording). */
function shoot(shot, target, log) {
  const [w, h] = shot.size ?? [1280, 832];
  const args = ["run", "-q", "-p", "demos", "--", "--shoot", shot.demo, target];
  args.push(
    String(shot.settle ?? 3),
    "--size",
    `${w}x${h}`,
    "--scale",
    String(shot.scale ?? 1),
  );
  if (shot.record) args.push("--record", String(shot.record));
  for (const step of shot.inputs ?? []) args.push("--input", step);
  run("cargo", args, log);
}

/** Merge `settings` into the devtools settings file for `body`, then restore it. */
function withDevtools(settings, body) {
  if (!settings) return body();
  const saved = fs.existsSync(DEVTOOLS_SETTINGS)
    ? fs.readFileSync(DEVTOOLS_SETTINGS, "utf8")
    : null;
  const merged = { ...(saved ? JSON.parse(saved) : {}), ...settings };
  fs.writeFileSync(DEVTOOLS_SETTINGS, JSON.stringify(merged, null, 2));
  try {
    return body();
  } finally {
    if (saved === null) fs.rmSync(DEVTOOLS_SETTINGS);
    else fs.writeFileSync(DEVTOOLS_SETTINGS, saved);
  }
}

// Animated WebP from a frame range: crop, Lanczos resize, libwebp's animation
// encoder with mixed lossy/lossless sub-frames (no seams on dark gradients).
const WEBP_PY = `
import json, sys
from PIL import Image
a = json.loads(sys.argv[1])
w, h, x, y = a["crop"]
size = (a["width"], round(h * a["width"] / w / 2) * 2)
frames = [
    Image.open(f"{a['dir']}/{i:04d}.png").convert("RGB")
    .crop((x, y, x + w, y + h)).resize(size, Image.LANCZOS)
    for i in range(a["first"], a["end"])
]
frames[0].save(a["out"], save_all=True, append_images=frames[1:], loop=0,
               duration=a["ms"], quality=a["quality"], method=6, allow_mixed=True)
`;

/** The ffmpeg filter for a shot's crop + resize. */
function cropScale(shot) {
  const [w, h, x, y] = shot.crop;
  return `crop=${w}:${h}:${x}:${y},scale=${shot.width ?? w}:-2:flags=lanczos`;
}

function encode(shot, src, out) {
  const ff = ["-hide_banner", "-loglevel", "error", "-y"];
  const ext = path.extname(out);
  if (ext === ".png") {
    // A still: the single shot, or a recording's last frame.
    const png = shot.record
      ? path.join(src, fs.readdirSync(src).sort().at(-1))
      : src;
    run("ffmpeg", [...ff, "-i", png, "-vf", cropScale(shot), out]);
    return;
  }
  const [first, count] = shot.frames ?? [0, Number.MAX_SAFE_INTEGER];
  if (ext === ".webp") {
    const end = Math.min(first + count, fs.readdirSync(src).length);
    const args = {
      dir: src,
      out,
      crop: shot.crop,
      width: shot.width ?? shot.crop[0],
      first,
      end,
      ms: 1000 / RECORD_FPS,
      quality: shot.quality ?? 90,
    };
    run("python3", ["-c", WEBP_PY, JSON.stringify(args)]);
    return;
  }
  const input = [
    "-framerate",
    String(RECORD_FPS),
    "-start_number",
    String(first),
  ];
  input.push("-i", path.join(src, "%04d.png"), "-frames:v", String(count));
  if (ext === ".gif") {
    const palette = `palettegen=max_colors=${shot.colors ?? 256}:stats_mode=diff`;
    const use = `paletteuse=dither=${shot.dither ?? "bayer:bayer_scale=4"}:diff_mode=rectangle`;
    const vf = `fps=${shot.fps ?? 12.5},${cropScale(shot)},split[a][b];[a]${palette}[p];[b][p]${use}`;
    run("ffmpeg", [...ff, ...input, "-vf", vf, "-loop", "0", out]);
  } else {
    throw new Error(`${shot.out}: unsupported format ${ext}`);
  }
}

// `--shoot` disables hot reload and loads the built bundle, so build it first.
run(
  "npm",
  ["run", "build", "-w", "demos"],
  path.join(os.tmpdir(), "bevy-react-shots-build.log"),
);

for (const shot of selected) {
  if (!shot.record && path.extname(shot.out) !== ".png") {
    throw new Error(`${shot.out}: an animation needs "record"`);
  }
  const { name, ext } = path.parse(shot.out);
  const out = path.join(DIR, `${name}${opts.suffix}${ext}`);
  const tmp = fs.mkdtempSync(
    path.join(os.tmpdir(), `bevy-react-shot-${name}-`),
  );
  const src = path.join(tmp, shot.record ? "frames" : "shot.png");
  if (shot.record) fs.mkdirSync(src);
  process.stdout.write(`${name}: shooting ${JSON.stringify(shot.demo)}… `);
  withDevtools(shot.devtools, () =>
    shoot(shot, src, path.join(tmp, "app.log")),
  );
  encode(shot, src, out);
  fs.rmSync(tmp, { recursive: true });
  console.log(
    `→ ${path.relative(ROOT, out)} (${(fs.statSync(out).size / 1024).toFixed(0)} KiB)`,
  );
}
