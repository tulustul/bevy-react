/** The devtools' `useSyncExternalStore` plumbing: a version counter plus
 *  subscribers. `notify` bumps the version and calls subscribers on a
 *  microtask — mirror/recorder updates run inside React's commit (the flush
 *  tap) and many can land per frame, so one deferred notification re-renders
 *  the panel once, outside the app container's commit. */
export function versionStore() {
  let version = 0;
  let queued = false;
  const subscribers = new Set<() => void>();
  return {
    notify(): void {
      version++;
      if (queued) return;
      queued = true;
      queueMicrotask(() => {
        queued = false;
        for (const cb of subscribers) cb();
      });
    },
    subscribe(cb: () => void): () => void {
      subscribers.add(cb);
      return () => subscribers.delete(cb);
    },
    getVersion: (): number => version,
  };
}
