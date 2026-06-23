// Reusable esbuild pieces for building a bevy-react app with React Fast Refresh.
//
// Apps build TWO bundles:
//   - vendor.js: react + react-reconciler + the bevy-react runtime. Built once,
//     loaded once into the isolate, exposes its modules on `globalThis.__bevyVendor`.
//   - app.js: the app's own components, an IIFE that borrows from __bevyVendor and
//     is re-executed wholesale on each edit to drive a Fast Refresh.
//
// See `buildVendor` / `buildApp` below. Plain ESM JS so build scripts can `import`
// it without a compile step.

import * as esbuild from "esbuild";
import { transform } from "@swc/core";
import { readFile } from "node:fs/promises";
import { relative } from "node:path";

// Specifiers the app borrows from vendor rather than re-bundling. Re-bundling
// react/react-reconciler would create a second copy and detach the live
// reconciler, defeating state preservation.
export const VENDOR_KEYS = [
  "react",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
  "bevy-react",
  "bevy-react/jsx-runtime",
  "bevy-react/jsx-dev-runtime",
];

function sharedOptions(prod) {
  return {
    bundle: true,
    format: "iife",
    platform: "neutral",
    target: "es2022",
    define: {
      "process.env.NODE_ENV": JSON.stringify(
        prod ? "production" : "development",
      ),
    },
    sourcemap: "inline",
    logLevel: "info",
  };
}

function vendorOptions({ outfile, prod = false, cwd = process.cwd() }) {
  const entry = `
${VENDOR_KEYS.map((k, i) => `import * as _m${i} from ${JSON.stringify(k)};`).join("\n")}
globalThis.__bevyVendor = {
${VENDOR_KEYS.map((k, i) => `  ${JSON.stringify(k)}: _m${i},`).join("\n")}
};
`;
  return {
    ...sharedOptions(prod),
    stdin: { contents: entry, resolveDir: cwd, loader: "ts" },
    outfile,
    jsx: "automatic",
  };
}

// Resolve vendor specifiers to a stub that reads from the global map.
const vendorGlobalPlugin = {
  name: "vendor-global",
  setup(build) {
    const filter = /^(react|react-reconciler|scheduler|bevy-react)(\/.*)?$/;
    build.onResolve({ filter }, (args) => ({
      path: args.path,
      namespace: "vendor-global",
    }));
    build.onLoad({ filter: /.*/, namespace: "vendor-global" }, (args) => ({
      contents: `module.exports = globalThis.__bevyVendor[${JSON.stringify(args.path)}];`,
      loader: "js",
    }));
  },
};

// Run app sources through SWC's react-refresh transform, then make each
// `$RefreshReg$(x, "Name")` id module-unique so component families don't collide.
function swcRefreshPlugin(prod, cwd) {
  return {
    name: "swc-refresh",
    setup(build) {
      build.onLoad({ filter: /\.[jt]sx?$/ }, async (args) => {
        if (args.path.includes("node_modules")) return null;
        const source = await readFile(args.path, "utf8");
        const tsx = args.path.endsWith("x");
        const { code } = await transform(source, {
          filename: args.path,
          sourceMaps: "inline",
          jsc: {
            parser: { syntax: "typescript", tsx },
            transform: {
              react: {
                runtime: "automatic",
                importSource: "bevy-react",
                development: !prod,
                refresh: !prod,
              },
            },
            target: "es2022",
          },
        });
        const rel = relative(cwd, args.path);
        const unique = code.replace(
          /(\$RefreshReg\$\([^,]+,\s*)"([^"]*)"\)/g,
          (_m, pre, id) => `${pre}${JSON.stringify(rel + " " + id)})`,
        );
        return { contents: unique, loader: "js" };
      });
    },
  };
}

function appOptions({ entry, outfile, prod = false, cwd = process.cwd() }) {
  return {
    ...sharedOptions(prod),
    absWorkingDir: cwd,
    entryPoints: [entry],
    outfile,
    plugins: [vendorGlobalPlugin, swcRefreshPlugin(prod, cwd)],
  };
}

export async function buildVendor(opts) {
  await esbuild.build(vendorOptions(opts));
}

export async function buildApp(opts) {
  await esbuild.build(appOptions(opts));
}

/** Watch the app bundle (vendor is built once up front). */
export async function watchApp(opts) {
  const ctx = await esbuild.context(appOptions(opts));
  await ctx.watch();
  return ctx;
}
