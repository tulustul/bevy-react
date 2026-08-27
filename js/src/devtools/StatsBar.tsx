// The stats footer: live app node count (from the op mirror) and the most
// recent applied batch's id + total Rust-side render time (from the
// event-driven `devtools.batchStats` stream, via the recorder). Per-leg
// timings live on the individual "ops" log entries.

import { useSyncExternalStore } from "react";
import { recorder } from "./recorder";
import { mirror } from "./mirror";
import { theme } from "./theme";
import { useMirrorVersion } from "./TreeView";

export function StatsBar() {
  useMirrorVersion();
  useSyncExternalStore(recorder.subscribe, recorder.getVersion);

  const batch = recorder.lastBatch();
  return (
    <node
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        padding: { horizontal: 8, vertical: 4 },
        backgroundColor: theme.bgAlt,
        border: { top: 1 },
        borderColor: theme.border,
        // Blocks scrolled-out tree rows stacked beneath (see the Header note
        // in DevtoolsHost.tsx).
        focusPolicy: "block",
      }}
    >
      <Stat label="nodes" value={String(mirror.appNodeCount())} />
      <Stat label="batch" value={batch ? `#${batch.applied_count}` : "-"} />
      <Stat label="ops" value={batch ? String(batch.ops) : "-"} />
      <Stat
        label="total"
        value={batch ? `${batch.total_ms.toFixed(2)}ms` : "-"}
      />
    </node>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <node style={{ flexDirection: "row", gap: 3, alignItems: "center" }}>
      <text style={{ color: theme.textDim, fontSize: 10 }}>{label}</text>
      <text style={{ color: theme.text, fontSize: 10, fontFamily: theme.mono }}>
        {value}
      </text>
    </node>
  );
}
