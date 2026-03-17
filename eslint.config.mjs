// eslint.config.mjs
import tseslint from "typescript-eslint";
import pluginNext from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import globals from "globals";

export default tseslint.config(

  // ── 1. Global ignores ──────────────────────────────────────────────────
  {
    name: "global/ignores",
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "node_modules/**",
      "next-env.d.ts",
      "playwright-report/**",
      "test-results/**",
    ],
  },

  // ── 2. TypeScript recommended ──────────────────────────────────────────
  ...tseslint.configs.recommended,

  // ── 3. Next.js plugin ──────────────────────────────────────────────────
  {
    name: "next/recommended",
    plugins: { "@next/next": pluginNext },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs["core-web-vitals"].rules,
    },
  },

  // ── 4. React ────────────────────────────────────────────────────────────
  reactPlugin.configs.flat?.recommended ?? {},
  reactPlugin.configs.flat?.["jsx-runtime"] ?? {},

  // ── 5. React Hooks ──────────────────────────────────────────────────────
  {
    name: "react-hooks/recommended",
    plugins: { "react-hooks": reactHooks },
    rules: { ...reactHooks.configs.recommended.rules },
  },

  // ── 6. jsx-a11y strict ─────────────────────────────────────────────────
  // flatConfigs.strict already includes the full rule set at "error" level.
  // The overrides block below only adds rules not in strict, or changes
  // option signatures that strict does not configure the way we need.
  jsxA11y.flatConfigs.strict,

  // ── 7. Project-wide settings ────────────────────────────────────────────
  {
    name: "project/settings",
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    settings: {
      react: { version: "detect" },
    },
  },

  // ── 8. A11y overrides ───────────────────────────────────────────────────
  {
    name: "project/a11y-overrides",
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      // ── jsx-a11y: rules not in strict, or needing explicit options ──────

      // Flags vague link text like "click here", "read more", "learn more"
      // Not in strict by default — added manually
      "jsx-a11y/anchor-ambiguous-text": "error",

      // Ensures <html> has a lang attribute — catches the layout.tsx issue
      "jsx-a11y/html-has-lang": "error",

      // Ensures interactive elements are focusable
      "jsx-a11y/interactive-supports-focus": "error",

      // Checks <label> elements are associated with a control.
      // assert:"both" requires both nesting AND htmlFor — stricter than default
      // KNOWN LIMITATION: only fires when a <label> exists in the same file.
      // It does NOT flag <input> elements that have no <label> anywhere.
      // That gap is covered by axe-core at runtime.
      "jsx-a11y/label-has-associated-control": [
        "error",
        { assert: "both", depth: 3 },
      ],

      // Disallows tabindex values > 0 — breaks natural focus order
      "jsx-a11y/tabindex-no-positive": "error",

      // Prevents aria-hidden="true" on focusable elements
      "jsx-a11y/no-aria-hidden-on-focusable": "error",

      // Prefers semantic HTML over ARIA role overrides where a native
      // element exists — e.g. <button> over <div role="button">
      "jsx-a11y/prefer-tag-over-role": "error",

      // alt-text is already in strict but listed explicitly so it is
      // obvious in code review that we enforce it
      "jsx-a11y/alt-text": "error",

      // ── React cleanups ──────────────────────────────────────────────────
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",

      // ── TypeScript ──────────────────────────────────────────────────────
      "@typescript-eslint/no-explicit-any": "warn",
    },
  }
);