import { mount } from "bevy-react";
import { App } from "./App";

// Top-level await keeps an op_next_event future pending, so the deno_core event
// loop on the Rust side stays alive and parks on UI events.
await mount(<App />);
