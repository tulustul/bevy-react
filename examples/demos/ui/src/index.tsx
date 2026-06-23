import { mount } from "bevy-react";
import { App } from "./App";

// `mount` parks on `op_next_event` (driven by the Rust event loop) and never
// resolves, so we don't await it — the app bundle is an IIFE (no top-level
// await). On a hot reload this whole file re-executes; `mount` detects the
// existing isolate and triggers a Fast Refresh instead of remounting.
mount(<App />);
