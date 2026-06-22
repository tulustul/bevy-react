// High-level entry point for consumer apps.

import type { ReactNode } from "react";
import { reset, runEventLoop } from "./bridge";
import { flushSync, render } from "./renderer";

/**
 * Mount a React tree into the Bevy host and run forever.
 *
 * Clears any previous tree (a no-op on first load, the teardown on hot reload),
 * renders `element`, then parks on the event loop dispatching UI events back
 * into React until the host shuts down. Returns when the host goes away.
 */
export async function mount(element: ReactNode): Promise<void> {
  reset();
  render(element);
  await runEventLoop(flushSync);
}
