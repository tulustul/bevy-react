# Publishing

## Release steps

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
npm run build:prod -w demos-app
cargo run --release --example demos

npm run build:prod -w minimal-app
cargo run --release --example minimal
```

### 4. Verify the web build works

```sh
npm run build:web:prod -w demos-app
npm run build:web:prod -w minimal
```

### 5. Dry-run both publishes

```sh
cargo publish --workspace --dry-run
npm publish --dry-run -w bevy-react
```

### 6. Publish to crates.io

```sh
cargo publish --workspace
```

### 7. Publish to npm

```sh
npm publish -w bevy-react
```

### 6. Tag the release

```sh
git tag v<version>
git push origin v<version>
```
