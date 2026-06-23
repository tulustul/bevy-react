/// <reference path="./react-refresh.d.ts" />
// React Fast Refresh runtime glue.
//
// Lives in the *vendor* bundle (loaded once, never re-executed). It wires the
// react-refresh runtime into the global hook BEFORE the reconciler is created
// (see renderer.ts), exposes the `$RefreshReg$`/`$RefreshSig$` globals the SWC
// refresh transform emits, and drives `performReactRefresh` when the *app*
// bundle is re-executed on a hot update.
//
// The app bundle is rebuilt and re-run wholesale on every edit, so every
// component becomes a fresh function registered under its (module-unique)
// family id. `performReactRefresh` then re-renders the affected fibers,
// preserving hook state when a component's hook signature is unchanged.

import * as RefreshRuntime from "react-refresh/runtime";

interface HmrApi {
  mounted: boolean;
  reloadCount: number;
  register(type: unknown, id: string): void;
  sign: typeof RefreshRuntime.createSignatureFunctionForTransform;
  // Called by the app bundle's tail after it re-registers components.
  applyUpdate(): void;
  performReactRefresh(): void;
}

// Install the refresh runtime exactly once. MUST run before the reconciler is
// created so the reconciler's `injectIntoDevTools` reaches a hook that the
// refresh runtime has already patched.
let installed = false;
export function setupRefreshRuntime(): HmrApi {
  const g = globalThis as unknown as {
    __hmr?: HmrApi;
    $RefreshReg$?: unknown;
    $RefreshSig$?: unknown;
  };
  if (g.__hmr) return g.__hmr;

  if (!installed) {
    installed = true;
    RefreshRuntime.injectIntoGlobalHook(globalThis);
  }

  const api: HmrApi = {
    mounted: false,
    reloadCount: 0,
    register: (type, id) => RefreshRuntime.register(type, id),
    sign: RefreshRuntime.createSignatureFunctionForTransform,
    performReactRefresh: () => RefreshRuntime.performReactRefresh(),
    applyUpdate() {
      this.reloadCount++;
      RefreshRuntime.performReactRefresh();
    },
  };

  // The transform emits bare `$RefreshReg$` / `$RefreshSig$` references; the
  // build prefixes each registration id with the module path for uniqueness.
  g.$RefreshReg$ = (type: unknown, id: string) => api.register(type, id);
  g.$RefreshSig$ = api.sign;
  g.__hmr = api;
  return api;
}
