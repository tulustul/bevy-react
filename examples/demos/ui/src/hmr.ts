/** A module-level singleton that survives a hot-reload re-exec of `app.js`:
 * the value is parked on `globalThis` under `key` and reused on every run. */
export function hmrSingleton<T>(key: string, init: () => T): T {
  const g = globalThis as unknown as Record<string, T | undefined>;
  return (g[key] ??= init());
}
