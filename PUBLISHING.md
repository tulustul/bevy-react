# Release steps

### 1. Bump the version

Rust side — one command (needs `cargo install cargo-edit` once). It updates
`[workspace.package] version` **and** the workspace's own entries in
`[workspace.dependencies]` (`bevy-react-macros`, `bevy_react_core`, the five
feature crates, and the `bevy-react` facade) together — every crate is
released in lock-step:

```sh
cargo set-version --bump patch   # or --bump minor / --bump major
```

npm side — keep `js/package.json` identical to the Rust version:

```sh
npm version <version> -w bevy-react --no-git-tag-version
```

### 2. Verify everything passes in Github Actions

### 3. Verify the native build works

```sh
npm run build:prod -w demos
cargo run --release -p demos

npm run build:prod -w minimal
cargo run --release -p minimal

npm run build:prod -w arcana
cargo run --release -p arcana

npm run build:prod -w atrium
cargo run --release -p atrium
```

### 4. Verify the web build works

```sh
npm run build:web:prod -w demos
```

### 5. Run stress tests, compare with previous version results, and check if there is any performance regression

```sh
cargo run --release -p stress -- --run table-ops --out benchmark_results/<version>.json
cargo run -p layers-stress --release
```

### 6. Update the CHANGELOG.md file

### 7. Commit and push the version bump with message `bump <version>`

### 8. Dry-run both publishes

```sh
cargo publish --workspace --dry-run --features bevy/x11
npm publish --dry-run -w bevy-react
```

### 9. Publish to crates.io

```sh
cargo publish --workspace --features bevy/x11
```

`--features bevy/x11` is for the verify build only (it is not baked into the published crates): the facade's default `custom_cursor` pulls in `bevy_winit`, which won't compile on Linux without a windowing backend.

### 10. Publish to npm

```sh
npm publish -w bevy-react
```

### 11. Tag the release

```sh
git tag v<version>
git push origin v<version>
```

### 12. Deploy the docs site + web demos to Github Pages

```sh
npm run deploy:docs
npm run deploy:demos
```
