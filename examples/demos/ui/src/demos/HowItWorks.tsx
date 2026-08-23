import { CodeTabs, H2, InlineCode, Li, P, Ul } from "@/components/docs";
import { ExplanationData, useDemoPage } from "@/explanationStore";

const PAGE: ExplanationData = {
  title: "How it works?",
  info: (
    <>
      <H2>The big picture</H2>
      <P>
        Your React app runs in an embedded V8 isolate on its own thread. A
        custom reconciler (instead of react-dom) turns each React commit into a
        batch of small UI operations — create node, set props, move child — and
        the Bevy side applies them to real <InlineCode>bevy_ui</InlineCode>{" "}
        entities in the ECS. Nothing is emulated: layout, rendering, and picking
        are plain Bevy.
      </P>

      <H2>Updates are deltas</H2>
      <P>
        When a component re-renders, only the fields that actually changed cross
        the bridge — a style diff, a swapped handler. A re-render that produces
        identical values sends nothing at all. That makes idiomatic React
        (re-render freely, let the diff sort it out) cheap by default.
      </P>

      <H2>Events flow back</H2>
      <P>
        Interactions travel the other way: Bevy picks the topmost node with a
        matching handler and routes the event to your{" "}
        <InlineCode>onClick</InlineCode> /{" "}
        <InlineCode>onPointerMove</InlineCode> /{" "}
        <InlineCode>onWheel</InlineCode> callback by node id. Events do not
        bubble — exactly one node owns each event, the topmost one under the
        pointer that listens for it.
      </P>

      <H2>Talking to your app</H2>
      <P>
        UI events cover widgets; app-level state uses three typed channels, each
        defined by a Rust struct and mirrored to TypeScript by codegen:
      </P>
      <Ul>
        <Li>
          Fire-and-forget, React to Bevy: #[react_message] + emit(name, value)
        </Li>
        <Li>
          Request / response, React to Bevy: #[react_request] + await
          bevy.some.request()
        </Li>
        <Li>Bevy to React events: #[react_event] + bevy.on(name, callback)</Li>
      </Ul>
      <CodeTabs
        tsx={`import { bevy } from "./bevy"; // generated

bevy.player.setName("Ada");`}
        rust={`#[react_message(name = "player.setName")]
struct SetName(String);

app.add_react_handler(
    |on: On<SetName>| {
        info!("name: {}", on.event().0);
    },
);`}
      />
      <P>
        The generated <InlineCode>bevy.ts</InlineCode> is the contract: change a
        Rust binding, regenerate, and the TypeScript compiler points at every
        call site that needs updating.
      </P>

      <H2>Hot reload</H2>
      <P>
        The V8 isolate and the React tree survive edits. Saving a file rebuilds
        only your app bundle, re-executes it in the live isolate, and React Fast
        Refresh re-renders — components keep their{" "}
        <InlineCode>useState</InlineCode> and running animations. Only a syntax
        error or a non-component change falls back to a full reload.
      </P>

      <H2>Layers & effects</H2>
      <P>
        Some styles promote a subtree to a composited layer: it is captured to
        an offscreen texture once, then re-composited each frame. Promotion is
        what powers group <InlineCode>opacity</InlineCode>,{" "}
        <InlineCode>filter</InlineCode> chains,{" "}
        <InlineCode>backdropFilter</InlineCode>,{" "}
        <InlineCode>transform3d</InlineCode>, and{" "}
        <InlineCode>morphFilter</InlineCode> view transitions.
      </P>
      <Ul>
        <Li>
          Moving, fading, or changing filter params on a layer never re-renders
          its content — those are composite-time knobs, animating them is nearly
          free.
        </Li>
        <Li>
          A clean layer skips its capture pass entirely; only actual content
          changes re-capture.
        </Li>
        <Li>
          The Styling section demos each of these — the devtools (F12) Layers
          tab shows live promotions.
        </Li>
      </Ul>
    </>
  ),
};

export function HowItWorks() {
  useDemoPage(PAGE);
  return <></>;
}
