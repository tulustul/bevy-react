// Entry point: mount the app, then hand control to the event loop which keeps
// the V8 event loop alive (parked on op_next_event) until Bevy shuts down.

import React from "react";
import { App } from "./app";
import { runEventLoop } from "./bridge";
import { flushSync, render } from "./renderer";

render(<App />);

// Top-level await keeps an op_next_event future pending, so deno_core's
// run_event_loop on the Rust side stays alive and parks on UI events.
await runEventLoop(flushSync);
