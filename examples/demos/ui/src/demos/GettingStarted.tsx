import { Code } from "@/components/docs";
import { H2, InlineCode, Paragraph } from "@/components/typography";
import { ExplanationData, useDemoPage } from "@/explanationStore";

const PAGE: ExplanationData = {
  title: "Getting started",
  info: (
    <>
      <Paragraph>
        bevy-react drives <InlineCode>bevy_ui</InlineCode> from a React app: a
        custom reconciler runs your components in an embedded V8 runtime and
        applies the result to real Bevy UI nodes. You write JSX; Bevy renders
        it. This page sets up a fresh project — the rest of the gallery shows
        what you can do with it.
      </Paragraph>

      <H2>1 · Install</H2>
      <Paragraph>
        Two halves, one feature: the Rust crate hosts the runtime, the npm
        package is what your React code imports.
      </Paragraph>
      <Code lang="sh">{`cargo add bevy-react
npm install bevy-react react react-reconciler`}</Code>

      <H2>2 · Add the plugin</H2>
      <Paragraph>
        Point <InlineCode>ReactUiPlugin</InlineCode> at your bundled app. It
        owns the JS thread, loads the bundle, and syncs the UI every frame.
      </Paragraph>
      <Code lang="rust">{`use bevy::prelude::*;
use bevy_react::ReactUiPlugin;

fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .add_plugins(ReactUiPlugin::new("ui/dist/app.js"))
        .run();
}`}</Code>

      <H2>3 · Write the UI</H2>
      <Paragraph>
        The intrinsic elements are Bevy-flavored:{" "}
        <InlineCode>{"<node>"}</InlineCode> for containers,{" "}
        <InlineCode>{"<text>"}</InlineCode> for text (no divs or spans).{" "}
        <InlineCode>mount</InlineCode> starts the app and never resolves — it
        parks on the Bevy event loop.
      </Paragraph>
      <Code
        lang="tsx"
        title="src/index.tsx"
      >{`import { mount } from "bevy-react";

function App() {
  return (
    <node style={{ padding: 20, gap: 8 }}>
      <text>Hello from React</text>
    </node>
  );
}

mount(<App />);`}</Code>

      <H2>4 · Bundle it</H2>
      <Paragraph>
        The build emits two files: <InlineCode>vendor.js</InlineCode> (react +
        the runtime, loaded once) and <InlineCode>app.js</InlineCode> (your
        components, re-executed on every edit — that split is what makes hot
        reload preserve component state).
      </Paragraph>
      <Code
        lang="tsx"
        title="build.mjs"
      >{`import { buildVendor, buildApp } from "bevy-react/build-lib";

const cwd = process.cwd();
await buildVendor({ outfile: "dist/vendor.js", cwd });
await buildApp({
  entry: "src/index.tsx",
  outfile: "dist/app.js",
  cwd,
});`}</Code>
      <Paragraph>
        Run <InlineCode>node build.mjs</InlineCode> before starting the Bevy
        app. Use <InlineCode>watchApp</InlineCode> instead of{" "}
        <InlineCode>buildApp</InlineCode> for rebuild-on-save with React Fast
        Refresh.
      </Paragraph>

      <H2>5 · Typed messaging (optional)</H2>
      <Paragraph>
        Rust structs tagged <InlineCode>#[react_message]</InlineCode>,{" "}
        <InlineCode>#[react_request]</InlineCode>, or{" "}
        <InlineCode>#[react_event]</InlineCode> define the app-level channels.
        Export them once and your React code gets a fully typed{" "}
        <InlineCode>bevy</InlineCode> API — see the Communication demos and the
        How it works? page.
      </Paragraph>
      <Code lang="rust">{`// e.g. behind a CLI flag in main():
app.export_react_typescript("ui/src/bevy.ts")?;`}</Code>

      <H2>Running this gallery</H2>
      <Code lang="sh">{`npm install
npm run build -w demos
cargo run -p bevy-react --example demos`}</Code>
    </>
  ),
};

export function GettingStarted() {
  useDemoPage(PAGE);
  return <></>;
}
