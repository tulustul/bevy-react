// Devtools runtime entry. `installDevtools` is called by `renderer.render`
// behind a literal `process.env.NODE_ENV !== "production"` check; in production
// vendor bundles this whole module is replaced by an empty stub
// (`devtoolsStubPlugin` in build-lib.mjs), so the panel, mirror, and recorder
// are physically absent from prod output.
//
// This module must stay side-effect-free at import time: everything happens
// inside `installDevtools` (idempotent — vendor.js executes once per isolate,
// but defensiveness is cheap).

import { createElement, type ReactNode } from "react";
import { __installBridgeTap } from "../bridge";
import { onBatchStats, onRestore, onToggle, onWarning } from "./api";
import { DevtoolsHost } from "./DevtoolsHost";
import { mirror } from "./mirror";
import { recorder } from "./recorder";

let installed = false;

/** Mount the devtools panel into its own React container (injected by the
 *  renderer to avoid a module cycle) and hook up the bridge tap. */
export function installDevtools(host: {
  mount(element: ReactNode): void;
}): void {
  if (installed) return;
  installed = true;
  __installBridgeTap({
    flush: (batch, devtools, decodeWarnings) => {
      mirror.apply(batch, devtools, decodeWarnings);
      recorder.onFlush(batch, devtools);
    },
    emit: (name, value) => recorder.onEmit(name, value),
    request: (id, name, value) => recorder.onRequest(id, name, value),
    outbound: (msg) => recorder.onOutbound(msg),
    wrapStart: () => recorder.onWrapStart(),
    wrapEnd: (ms) => recorder.onWrapEnd(ms),
  });
  // Rust reports per-batch render timings after each apply; the recorder
  // attaches them to the matching "ops" log entries.
  onBatchStats((s) => recorder.attachBatchStats(s));
  // Apply-time invalid-value warnings (colors, fonts, cursor…) flag inspector
  // rows via the mirror — decode-time ones arrive through the flush tap above.
  onWarning((w) => mirror.addRuntimeWarning(w));
  // Recording follows the panel. The recorder starts armed (to capture the
  // initial mount); the session's single `devtools.restore` settles it —
  // disarming when the panel stays closed — and every toggle thereafter
  // re-arms/disarms. (The panel's own close button disarms directly in
  // DevtoolsHost — a self-close gets no toggle echo from Bevy.)
  onToggle((e) => recorder.setEnabled(e.open));
  onRestore((s) => recorder.setEnabled(!!s.open));
  host.mount(createElement(DevtoolsHost));
}
