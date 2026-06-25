import { useEffect, useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { bevy } from "@/bevy";
import { Button, Checkbox, Example } from "@/components";
import { Colors, FontSizes } from "@/theme";

// A demo of the `<portal>` host element: a UI rectangle that shows an offscreen
// Bevy render target (render-to-texture). Two cameras in the CrowdedCubes scene
// draw into named targets — a 3D chase cam ("follow") and a 2D minimap — and each
// `<portal>` displays one. The follow cam can render live or as a frozen snapshot.

const TYPESCRIPT = `<portal target="minimap" style={
  { width: 160, height: 160 }
} />`;

const RUST = `let minimap = render_targets.create(
    &mut images,
    "minimap",
    RenderTargetSpec {
        mode: RenderMode::Snapshot,
        ..default()
    },
);

commands.spawn((
    Camera3d::default(),
    minimap.camera_target(),
    PortalCamera("minimap".into()),
));`;

export function PortalDemo() {
  const [continuous, setContinuous] = useState(true);

  // Keep Bevy's "follow" render mode in sync with the checkbox. We emit on every
  // change AND re-emit whenever the scene (re)spawns its targets: the "follow"
  // target is created (in Snapshot mode) only when the CrowdedCubes scene's
  // OnEnter runs, which is *after* this component's first render — so a mount-time
  // emit alone would hit a not-yet-registered target and be dropped, leaving the
  // initial "continuous" state ignored until the box was toggled.
  useEffect(() => {
    bevy.crowdedCubes.setFollowMode(continuous);
    return bevy.on("crowdedCubes.spawned", () =>
      bevy.crowdedCubes.setFollowMode(continuous),
    );
  }, [continuous]);

  return (
    <Example
      description="A view of an offscreen Bevy camera, rendered to a texture and shown in the UI."
      tsx={TYPESCRIPT}
      rust={RUST}
    >
      <node style={row}>
        <node style={column}>
          <text style={label}>Follow cam</text>
          <portal target="follow" style={followView} />
          <Button onClick={() => bevy.crowdedCubes.followRandom(null)}>
            Pick another cube
          </Button>
          <Checkbox
            label="Continuous"
            enabled={continuous}
            onChange={setContinuous}
          />
        </node>

        <node style={column}>
          <text style={label}>Minimap</text>
          <portal target="minimap" style={minimapView} />
        </node>
      </node>
    </Example>
  );
}

const row: BevyStyle = {
  flexDirection: "row",
  alignItems: "flexStart",
  gap: 16,
};

const column: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
};

const label: BevyStyle = {
  color: Colors.textColor200,
  fontSize: FontSizes.sm,
  fontWeight: "semibold",
};

const followView: BevyStyle = {
  width: 160,
  height: 160,
  borderRadius: 8,
  border: 2,
  borderColor: Colors.surface500,
  backgroundColor: Colors.surface100,
};

const minimapView: BevyStyle = {
  width: 160,
  height: 160,
  borderRadius: 8,
  border: 2,
  borderColor: Colors.surface500,
  backgroundColor: Colors.surface100,
};
