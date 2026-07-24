# `backdropFilter` — design (v1: world backdrop; UI-under as phase 2)

Status: v1 (world backdrop) IMPLEMENTED 2026-07-24 — see CLAUDE.md's layers
section for the shipped shape; this doc remains the phase-2 (UI-underneath)
reference.
Scope decisions (2026-07-24): world-only v1 with the seam kept for UI-under;
full animation parity (`animatedStyle` + `transition`); rect-only backdrop
clip (no `borderRadius` mask yet); nesting inside another promoted layer
forces the enclosing chain to re-capture every frame.

## What it is

A `backdropFilter` style — same wire shape as `filter` (a chain of
`{ name, params }`) — that filters **what is rendered behind the node**
instead of the node's own subtree. v1 backdrop = the camera's post-processed
3D frame (game world, no UI). The node auto-promotes to a composited layer;
the filtered backdrop draws as an opaque quad at the node's rect, under the
node's own content. Web semantics fall out: the element's transparency shows
the frosted backdrop through it.

## Why the timing works (investigated 2026-07-24)

Bevy 0.19's render graph is schedule-based. Stock `ui_pass`
(`bevy_ui_render/src/render_pass.rs`) runs in the camera's `Core2d`/`Core3d`
schedule `after(PostProcess).before(upscaling)` and draws the whole
`TransparentUi` phase in one pass onto the `ViewTarget`'s **main texture**
with `LoadOp::Load`. Our `ui_layer_capture_pass` already runs in that same
window, _before_ `ui_pass` (`plugin.rs`). At that point the main texture
holds the fully tonemapped 3D frame with no UI — sampleable
(`ViewTarget::main_texture_view()`; tonemapping and upscaling bind it the
same way, so `TEXTURE_BINDING` usage is guaranteed).

Key Bevy seams (re-verify on upgrade, alongside the existing spike list in
`layer/render.rs`):

- `ViewTarget::main_texture_view()` / `post_process_write()` double-buffer
  (`bevy_render/src/view/mod.rs`) — the a/b main textures are the resolved,
  unsampled ones even under MSAA.
- `UiViewTarget` on the UI view → camera's `ViewTarget` (the lookup
  `ui_pass` itself performs).
- `SortedRenderPhase::render_range(pass, world, view, range)` is **public**
  (`bevy_render/src/render_phase/mod.rs`) — this is what makes phase-2
  UI-under possible without a fork.

## Design

### Style / protocol

- `Props.style.backdropFilter: Option<FilterChain>` — reuses the `filters`
  module wire type wholesale. One new `style_fields!` entry with its own
  dirty group (`BACKDROP | LAYER`), overlay-capable (hover/press variants
  participate; presence union promotes, like `filter`).
- JS: add `backdropFilter` to the handwritten `Style` type in `js/src`
  (same `FilterUse` typing as `filter` — the `BevyFilters` codegen
  augmentation is shared, so `bevy.ts` needs no exporter change; regenerate
  anyway per the sync invariant if any binding is touched).

### Main world

- **Promotion**: `PromotionReasons::BACKDROP = 1 << 3` (the bit reserved in
  `layer.rs`). One evaluator: non-empty `backdropFilter` in base or any
  variant. Skips child-count and `groupAlpha` gates (a leaf "frosted glass
  region" is valid).
- **Resolve**: reuse the chain resolver to produce a second component,
  `ResolvedBackdropChain` (same struct shape as `ResolvedFilterChain`).
  Backdrop chains are inherently `always_dirty` — the source is the live
  frame — so the filter run re-stages every frame by construction.
- **Transitions**: a second channel through `filters/transition.rs`
  targeting the backdrop chain. Same semantics as `filter`, including the
  documented empty-chain snap: unsetting `backdropFilter` demotes, so keep
  an identity entry (e.g. `{ name: "blur", params: { radius: 0 } }`) when
  removal should ease.
- **animatedStyle**: `"backdropFilter[<i>].<param>"` key namespace, values
  in wire units — mirrors `"filter[<i>].<param>"`.

### Render world

- **Extract**: `ExtractedLayer` gains `backdrop_chain: Option<ExtractedChain>`.
  The snapshot rect is the existing `min`/`size` (physical px, screen
  space), plus the chain's `outset_px` so blur has neighborhood (clamped at
  screen edges).
- **Store**: `LayerSlot` gains an optional backdrop slot: one snapshot
  texture (capture-clamped size, `target_format`) + the same ping-pong pair
  and `output_valid`/`params_version` discipline as `FilterSlot`.
- **Snapshot pass**: in the `ui_layer_capture_pass` loop, per backdrop
  layer, one fullscreen-triangle pass sampling the camera's
  `main_texture_view()` with a UV remap of the layer rect into the snapshot
  texture. The bind group is created **inside the pass system** (like
  Bevy's tonemapping node) — the a/b main-texture flip during PostProcess
  makes prepare-time binding wrong-by-race. Runs every frame the layer is
  promoted (same offscreen-cost posture as captures).
- **Filter run**: `prepare_layer_filters` generalizes to stage up to two
  runs per layer (content chain, backdrop chain). The backdrop run binds the
  snapshot as `source_texture` (pass 0) **and** as `capture_texture`
  (binding 3), so every existing shader — blur, colorMatrix, bloom,
  chromaticAberration, custom `#[react_filter]`s — works unchanged. An
  opaque backdrop trivially satisfies the premultiplied-alpha contract.
  Same all-or-nothing pipeline-readiness rule per run.
- **Composite**: inject a backdrop quad phase item at the layer's stacking
  position, one `stack_z_offsets` epsilon before the content composite quad.
  Reuses the composite pipeline with a bind group over the backdrop output
  texture; multiplied by group alpha (a fading panel fades its frost);
  clamped by the same ancestor `quad_clip`. Gating is graceful by
  construction: a not-ready backdrop run just draws nothing, and the region
  shows the real (unfiltered) frame already in the target — no subtree
  invisibility, unlike content-filter gating.
- **Nesting (decided)**: a backdrop layer walks its enclosing chain at
  extract and forces `needs_capture = true` — the outer captures contain the
  backdrop quad's screen-space pixels, so their caches and translation
  invariance cannot serve. Documented cost: nesting a backdrop defeats
  ancestor capture caching.

### v1 limits (documented, like transform3d's)

- Backdrop source is the 3D frame only; UI painted beneath the node is not
  in the backdrop (phase 2, below).
- ~~Rect-only: no `borderRadius` mask on the backdrop quad.~~ RESOLVED
  2026-07-24: the composite fragment masks backdrop coverage with bevy_ui's
  own rounded-box SDF + antialias convention over the layout-resolved
  `ComputedNode.border_radius`.
- `transform3d` on the same node samples the axis-aligned pre-transform
  rect.
- Snapshot + chain re-run every frame (live source); cost scales with node
  area. The node's own content capture still caches normally.
- Multi-camera: same v1 posture as layers (first layer root's UI target
  camera).

### Devtools

Layers tab lists backdrop chains + live param values alongside content
chains; the `BACKDROP` promotion reason gets a label. Warn sites follow the
existing `diag` discipline (new kinds → `KIND_FIELDS`).

## Phase 2: UI underneath the node

Feasible without a fork thanks to public `render_range`; world-only is its
degenerate case (split at index 0), so nothing in v1 is throwaway.

Mechanism: in our pre-`ui_pass` system, open a pass on the real target
(`LoadOp::Load`) and `render_range` the stock phase items **below** the
backdrop node's sort position — drawing lower UI onto the frame early. Then
snapshot (now world + lower UI), run the chain, and drain the
already-rendered items from the stock phase so `ui_pass` resumes from the
backdrop quad onward. We already do this class of phase surgery
(`redistribute_ui_layers` moves items verbatim).

Hard parts (why it's phase 2):

- Split indices must land on **batch boundaries** (`batch_range` is an
  item-skip count; a mid-batch split corrupts neighboring items).
- Multiple backdrop layers → ordered incremental splits
  (`render_range(prev..k)` per layer, in stacking order).
- Must replicate the camera viewport state `ui_pass` applies.
- Interleaving with layer captures: all captures/filter runs still happen
  before the first split render.

Estimated at roughly +50–100% of the v1 effort.

## Testing

- Unit: promotion evaluator; `style_fields!` decode round-trip incl.
  `styleUnset`; resolver attaches `ResolvedBackdropChain`; transition
  channel tests mirroring `filter`'s; animatedStyle key routing.
- The existing `protocol::tests` table guard catches a missed
  `style_fields!` entry.
- Visual: a demo page (glass panel over the 3D scene) verified via
  `--shoot`; GPU behavior is not headless-testable today, same as filters.
