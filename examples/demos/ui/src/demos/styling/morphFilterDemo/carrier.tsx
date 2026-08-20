import { useState } from "react";

import { Colors, FontSizes } from "@/theme";
import type { MorphUse } from "./params";
import { useAutoplay } from "./tiles";
import { TILE, TileContent } from "./variants";

// The enter/exit idiom: a permanently mounted, completely EMPTY carrier
// (no background, no border — nothing painted) whose content mounts and
// unmounts in the same commit as the morph key flip. An empty promoted
// layer captures as a valid transparent texture, so the morph blends the
// content in from nothing and back out to nothing — no placeholder
// drawable needed. The only app-side rule: the carrier must have rendered
// at least one frame before the first key flip (a same-commit mount+flip
// adopts the key silently, the mount rule).

export function CarrierTile({
  label,
  use,
  variant,
  autoplay,
}: {
  label: string;
  use: MorphUse;
  variant: number;
  autoplay: boolean;
}) {
  const [shown, setShown] = useState(false);
  const toggle = () => setShown((s) => !s);
  const resetAutoplayTimer = useAutoplay(autoplay, toggle);
  const clickToggle = () => {
    toggle();
    resetAutoplayTimer();
  };

  return (
    <node
      style={{
        width: TILE,
        flexDirection: "column",
        alignItems: "stretch",
        gap: 6,
      }}
    >
      <node
        style={{
          width: TILE,
          height: TILE,
          flexDirection: "column",
          morphFilter: { key: shown ? "in" : "out", ...use },
          transition: { morphFilter: { duration: 900 } },
        }}
        onClick={clickToggle}
      >
        {shown && <TileContent variant={variant} />}
      </node>
      <text
        style={{
          color: Colors.textColor200,
          fontSize: FontSizes.sm,
          textAlign: "center",
        }}
      >
        {label}
      </text>
    </node>
  );
}
