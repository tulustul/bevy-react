import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default tseslint.config(
  {
    ignores: ["**/dist/**", "**/node_modules/**", "target/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    settings: {
      react: { version: "18.3" },
    },
    rules: {
      // Automatic JSX runtime (jsxImportSource: bevy-react) — no React import,
      // and host elements are custom, so prop-types don't apply.
      ...react.configs.flat["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      "react/prop-types": "off",
      // The reconciler HostConfig is intentionally untyped; flag, don't fail.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    // JSX type augmentation requires a `namespace JSX` whose members mirror
    // React's via empty `extends` interfaces — both idiomatic and unavoidable.
    files: ["**/jsx-runtime.ts", "**/jsx-dev-runtime.ts", "**/jsx.d.ts"],
    rules: {
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
  {
    // Node-run build scripts (esbuild + SWC pipeline for Fast Refresh).
    files: ["**/build.mjs", "**/build-lib.mjs"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    // A triple-slash reference is the idiomatic way to pull in the ambient
    // declaration for the untyped `react-refresh/runtime` module.
    files: ["**/hmr.ts"],
    rules: {
      "@typescript-eslint/triple-slash-reference": "off",
    },
  },
  prettier,
);
