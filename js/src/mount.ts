// High-level entry point for consumer apps.

import type { ReactNode } from "react";
import { reset, runEventLoop } from "./bridge";
import { flushSync, render } from "./renderer";

interface HmrApi {
  mounted: boolean;
  applyUpdate(): void;
}

/**
 * Mount a React tree into the Bevy host.
 *
 * First call (cold start): clears any previous tree and renders `element`.
 *
 * On a hot update the *app* bundle is re-executed in the live isolate, which
 * calls `mount` again. By then `__hmr.mounted` is set, so instead of a fresh
 * mount we trigger a React Fast Refresh (re-rendering the existing fiber tree,
 * hook state intact).
 *
 * Either way we (re-)park on the event loop. This is REQUIRED on EVERY call,
 * including updates: a reload makes `runEventLoop` return (so the Rust side can
 * `execute_script` the rebuilt app), which kills the previous parker. Without
 * re-parking here, after the first reload nothing would await `op_next_event` —
 * the Rust event loop would go idle and shut the JS thread down, so the UI would
 * freeze (no clicks) and no further reloads would apply.
 */
export async function mount(element: ReactNode): Promise<void> {
  const hmr = (globalThis as { __hmr?: HmrApi }).__hmr;

  if (hmr?.mounted) {
    hmr.applyUpdate();
  } else {
    if (hmr) hmr.mounted = true;
    reset();
    render(element);
  }

  await runEventLoop(flushSync);
}
