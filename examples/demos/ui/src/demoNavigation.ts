// Import-free navigation indirection. `Home` (which `demos.ts` itself
// imports) must not reach `demosStore`/`demos` statically — that closes an
// import cycle where `demosStore` evaluates `DEMOS[0]` before `demos.ts`
// finishes initializing. App.tsx registers the real implementation once the
// whole module graph is live; pages call `navigateToDemo(label)`.

type Navigate = (label: string) => void;

let navigate: Navigate | null = null;

export function setNavigate(n: Navigate) {
  navigate = n;
}

/** Jump to a demo page by its nav label (no-op until the app has mounted). */
export function navigateToDemo(label: string) {
  navigate?.(label);
}
