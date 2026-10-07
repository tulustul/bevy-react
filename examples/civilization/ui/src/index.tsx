import { mount } from "bevy-react";
import { App } from "./App";

// `mount` parks on the Rust-driven event loop and never resolves. On a hot
// reload this file re-executes and `mount` triggers a React Fast Refresh.
mount(<App />);
