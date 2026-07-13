# Release steps

### 1. Bump the version

Rust side — one command (needs `cargo install cargo-edit` once). It updates
`[workspace.package] version` **and** the `bevy-react-macros` entry in
`[workspace.dependencies]` together:

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
cargo run --release --example demos

npm run build:prod -w minimal
cargo run --release --example minimal
```

### 4. Verify the web build works

```sh
npm run build:web:prod -w demos
```

### 5. Run stress tests, compare with previous version results, and check if there is any performance regression

```sh
cargo run --release -p bevy-react --example stress -- --run table-ops --out benchmark_results/<version>.json
```

### 6. Dry-run both publishes

```sh
cargo publish --workspace --dry-run
npm publish --dry-run -w bevy-react
```

### 7. Publish to crates.io

```sh
cargo publish --workspace
```

### 8. Publish to npm

```sh
npm publish -w bevy-react
```

### 9. Tag the release

```sh
git tag v<version>
git push origin v<version>
```

### 10. Deploy web demo to Github Pages

```sh
npm run deploy:web -w demos
```
