import { mount } from "bevy-react";
import { App } from "./App";

// `mount` parks on the Rust-driven event loop and never resolves, so we don't
// await it. On a hot reload this file re-executes; `mount` detects the existing
// isolate and triggers a React Fast Refresh instead of remounting.
mount(<App />);
