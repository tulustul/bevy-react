import { mount } from "bevy-react";
import { App } from "./App";

// `mount` parks on `op_next_event` (driven by the Rust event loop) and never
// resolves, so we don't await it. On a hot reload this file re-executes; `mount`
// detects the existing isolate and triggers a Fast Refresh instead of remounting.
mount(<App />);
