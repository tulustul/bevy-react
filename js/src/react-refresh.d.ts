// Minimal typings for the subset of `react-refresh/runtime` we use. The package
// ships no types of its own.
declare module "react-refresh/runtime" {
  export function injectIntoGlobalHook(global: unknown): void;
  export function register(type: unknown, id: string): void;
  export function createSignatureFunctionForTransform(): (
    type?: unknown,
    key?: string,
    forceReset?: boolean,
    getCustomHooks?: () => unknown[],
  ) => unknown;
  export function performReactRefresh(): unknown;
  export function isLikelyComponentType(type: unknown): boolean;
}
