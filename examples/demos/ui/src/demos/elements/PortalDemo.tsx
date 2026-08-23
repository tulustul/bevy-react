import { useEffect, useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { bevy } from "@/bevy";
import { Button, Checkbox, DemoRow, Example } from "@/components";
import { CodeTabs, InlineCode, P } from "@/components/docs";
import { Colors } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

// A demo of the `<portal>` host element: a UI rectangle that shows an offscreen
// Bevy render target (render-to-texture). Two cameras in the CrowdedCubes scene
// draw into named targets — a 3D chase cam ("follow") and a 2D minimap — and each
// `<portal>` displays one. The follow cam can render live or as a frozen snapshot.

const PAGE: ExplanationData = {
  title: "<portal>",
  info: (
    <>
      <P>
        <InlineCode>{"<portal>"}</InlineCode> is a UI rectangle showing an
        offscreen Bevy render target (render-to-texture): the Rust side creates
        named targets and points cameras at them, and{" "}
        <InlineCode>{'<portal target="…">'}</InlineCode> displays one like any
        other node — sized, styled and stacked by the normal layout rules.
      </P>
      <CodeTabs
        tsx={`<portal target="minimap" style={{ width: 160, height: 160 }} />`}
        rust={`let minimap = render_targets.create(
    &mut images,
    "minimap",
    RenderTargetSpec { mode: RenderMode::Live, ..default() },
);

commands.spawn((
    Camera3d::default(),
    minimap.camera_target(),
    PortalCamera("minimap".into()),
));`}
      />
      <P>
        This page's CrowdedCubes scene drives two targets: a 3D chase cam
        ("follow"), switchable between continuous rendering and a frozen
        snapshot, and a 2D minimap. One caching note: a live portal writes
        pixels outside the layer dirt tracking's sight, so a card containing one
        opts its composited layer out with{" "}
        <InlineCode>cache: "never"</InlineCode>.
      </P>
    </>
  ),
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
  return (
    <Example
      title="Follow cam"
      style={{ cache: "never" }}
      info={
        <>
          <P>
            A 3D chase camera renders the tracked cube into the "follow" target.
            The checkbox switches the target between continuous rendering and a
            frozen snapshot — a React message the Rust side maps to{" "}
            <InlineCode>RenderMode::Live</InlineCode> /{" "}
            <InlineCode>Snapshot</InlineCode>; picking another cube
            re-snapshots.
          </P>
          <CodeTabs
            tsx={`<portal target="follow" style={{ width: 160, height: 160 }} />

// switch the target's render mode from React:
bevy.crowdedCubes.setFollowMode(continuous);`}
            rust={`#[react_message(name = "crowdedCubes.setFollowMode")]
struct SetFollowMode(bool);

fn on_set_follow_mode(ev: On<SetFollowMode>, mut targets: ResMut<RenderTargets>) {
    let mode = if ev.event().0 {
        RenderMode::Live
    } else {
        RenderMode::Snapshot
    };
    targets.set_mode("follow", mode);
}`}
          />
        </>
      }
      demo={FollowCamCard}
    />
  );
}

function FollowCamCard() {
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
  );
}

function MinimapDemo() {
  return (
    <Example
      title="Minimap"
      style={{ cache: "never" }}
      info={
        <>
          <P>
            A 2D camera on an isolated render layer draws flat markers for every
            cube into the live "minimap" target — a classic top-down map,
            rendered by Bevy and placed in the UI like any other node. Live
            pixels bypass the layer dirt tracking, hence the card's{" "}
            <InlineCode>cache: "never"</InlineCode>.
          </P>
          <CodeTabs
            tsx={`<portal target="minimap" style={{ width: 160, height: 160 }} />`}
            rust={`let minimap = render_targets.create(
    &mut images,
    "minimap",
    RenderTargetSpec { mode: RenderMode::Live, ..default() },
);

// A 2D camera on an isolated render layer draws the markers.
commands.spawn((
    Camera2d,
    minimap.camera_target(),
    PortalCamera("minimap".into()),
    RenderLayers::layer(1),
));`}
          />
        </>
      }
      demo={MinimapCard}
    />
  );
}

function MinimapCard() {
  return (
    <node style={column}>
      <portal target="minimap" style={portalView} />
    </node>
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
