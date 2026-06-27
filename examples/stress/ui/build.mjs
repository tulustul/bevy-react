// Build the stress UI as vendor.js + app.js (see js/build-lib.mjs for the why).
// Usage: `node build.mjs` (one-shot), `--watch`, or `--prod`.

import { buildVendor, buildApp, watchApp } from "bevy-react/build-lib";

const watch = process.argv.includes("--watch");
const prod = process.argv.includes("--prod");
const cwd = process.cwd();

const vendor = { outfile: "dist/vendor.js", prod, cwd };
const app = { entry: "src/index.tsx", outfile: "dist/app.js", prod, cwd };

await buildVendor(vendor);

if (watch) {
  await watchApp(app);
  console.log("[build] watching app sources (vendor built once)…");
} else {
  await buildApp(app);
  console.log("[build] vendor.js + app.js built");
}
