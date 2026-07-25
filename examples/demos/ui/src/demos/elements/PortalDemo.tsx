import { useEffect, useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { bevy } from "@/bevy";
import { Button, Checkbox, DemoRow, Example } from "@/components";
import { Colors } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

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
        mode: RenderMode::Live,
        ..default()
    },
);

commands.spawn((
    Camera3d::default(),
    minimap.camera_target(),
    PortalCamera("minimap".into()),
));`;

const PAGE: ExplanationData = {
  title: "<portal>",
  description:
    'A UI rectangle that shows an offscreen Bevy render target (render-to-texture): Rust creates named targets and points cameras at them, and <portal target="…"> displays one. Here the CrowdedCubes scene drives two — a 3D chase cam ("follow"), switchable between continuous rendering and a frozen snapshot, and a 2D minimap. The cards carry cache: "never": a live portal writes pixels outside the layer dirt tracking\'s sight, so the enclosing composited layer opts out of capture caching.',
  tsx: TYPESCRIPT,
  rust: RUST,
};

export function PortalDemo() {
  useDemoPage(PAGE);
  return (
    <DemoRow>
      <FollowCamDemo />
      <MinimapDemo />
    </DemoRow>
  );
}

function FollowCamDemo() {
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
      title="Follow cam"
      description='A 3D chase camera renders the tracked cube into the "follow" target. The checkbox switches the target between continuous rendering and a frozen snapshot (a React message the Rust side maps to RenderMode::Live / Snapshot); picking another cube re-snapshots.'
      style={{ cache: "never" }}
      tsx={`<portal
  target="follow"
  style={{
    width: 160,
    height: 160,
  }}
/>`}
    >
      <node style={column}>
        <portal target="follow" style={portalView} />
        <Button onClick={() => bevy.crowdedCubes.followRandom(null)}>
          Pick another cube
        </Button>
        <Checkbox
          label="Continuous"
          enabled={continuous}
          onChange={setContinuous}
        />
      </node>
    </Example>
  );
}

function MinimapDemo() {
  return (
    <Example
      title="Minimap"
      description={`A 2D camera on an isolated render layer draws flat markers for every cube into the live "minimap" target — a classic top-down map, rendered by Bevy and placed in the UI like any other node. Live pixels bypass the layer dirt tracking, hence the card's cache: "never".`}
      style={{ cache: "never" }}
      tsx={`<portal
  target="minimap"
  style={{
    width: 160,
    height: 160,
  }}
/>`}
    >
      <node style={column}>
        <portal target="minimap" style={portalView} />
      </node>
    </Example>
  );
}

const column: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
};

const portalView: BevyStyle = {
  width: 160,
  height: 160,
  borderRadius: 8,
  border: 2,
  borderColor: Colors.surface500,
  backgroundColor: Colors.surface100,
};
