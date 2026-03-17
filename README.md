# a11y-next-app

A Next.js application that demonstrates a production-grade automated accessibility testing strategy using [axe-core](https://github.com/dequelabs/axe-core) — the same engine powering Google Lighthouse, Microsoft Accessibility Insights, and the Chrome DevTools Accessibility panel.

**Live demo:** https://a11y-next-app.vercel.app

The app ships with intentional WCAG 2.2 AA violations so you can see exactly how the tooling catches, reports, and verifies fixes across two layers: the browser console during development, and a CI/CD gate during code review.

---

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4
- axe-core ^4.11.1 (dev-time scanning)
- @axe-core/playwright ^4.11.1 (CI/CD gate)
- Playwright ^1.58.2
- eslint-plugin-jsx-a11y (static lint)
- React Compiler enabled (`reactCompiler: true` in `next.config.ts`)

---

## Why two layers

Most teams find accessibility issues late — in production audits, through legal demand letters, or after a user complaint. IBM's research puts the cost at 1:10:100 — a bug that costs $1 to fix during development costs $10 in QA and $100 after release. This project inserts axe-core at the two cheapest intervention points.

**Layer 1 — axe-core in the browser (development only)**
A `MutationObserver` watches the live DOM. Every time any monitored attribute changes — an accordion opens, a modal appears, an ARIA state updates — axe-core re-scans the full `document` and logs only violations that have not been reported yet in this page session. The developer sees the violation, the exact element, the WCAG criterion, and a direct link to the fix, without leaving their editor or switching tools.

**Layer 2 — @axe-core/playwright in CI/CD**
A Playwright test runs on every pull request. It navigates to each page, interacts with dynamic content (expanding accordions before scanning), then calls `axe.analyze()`. Any violation fails the check and blocks the merge. It cannot be dismissed or ignored because the PR will not merge (if enforced).

These layers are not redundant. Layer 1 nudges with zero friction — a console message while the code is open. Layer 2 enforces with zero override. One persuades, the other blocks.

---

## How axe-core works

axe-core is a JavaScript library that runs in the browser against the live rendered DOM. It is not a static HTML linter and does not analyze JSX source. It evaluates what the browser actually produced: computed CSS (for contrast ratios), the full accessibility tree, ARIA relationships, and keyboard focus order.

**Zero false-positive policy.** Deque's explicit commitment is that axe-core never reports a violation it cannot prove with certainty. If a rule cannot make a deterministic pass/fail determination, it stays silent. This means axe-core catches approximately 57% of all possible WCAG violations — the 43% that require human judgment (logical reading order, whether link text is meaningful in context, cognitive load) are out of scope by design. Every violation it reports is real.

**Why `axe.run(document)` not a subtree.**
Several WCAG Level A rules check elements outside `<body>`. Passing a narrower context like `document.body`, `#__next`, or a component subtree silently skips them:

| Rule | Checks | Missed by `document.body` |
|---|---|---|
| `html-has-lang` | `<html lang="en">` present | yes |
| `html-lang-valid` | lang value is a valid BCP 47 tag | yes |
| `document-title` | `<title>` exists in `<head>` | yes |
| `meta-viewport` | `user-scalable=no` not blocking zoom | yes |
| `bypass` | skip navigation link present | yes |

The axe DevTools browser extension always calls `axe.run(document)`. Both layers in this project match that exactly so the console output is directly comparable to an extension audit.

---

## Project structure

```
src/
  app/
    layout.tsx                   Root layout — landmarks, skip nav, dynamic AxeDevConsole import
    page.tsx                     Home page — intentional violations (labels, alt text)
    about/
      page.tsx                   About page — intentional violations (accordion contrast, button name)
    globals.css
  devtools/a11y/
    axeScanner.ts                Core scanner — all state, MutationObserver, delta reporting
    AxeDevConsole.tsx            Client component — mount once in layout.tsx

tests/
  a11y/
    homepage.spec.ts             Full page scan of /
    about.spec.ts                Full page scan of /about — expands accordions before scanning
    components.spec.ts           /products route scan (skips if route does not exist)
    utils/
      axe-wcag22aa.ts            Shared AxeBuilder config, formatViolations, attachAxeReport
  a11y-behavioral/
    keyboard.spec.ts             Keyboard navigation, focus indicator, target size (SC 2.5.8)
```

`tsconfig.json` maps `@/*` to `./src/*`, so `@/devtools/a11y/axeScanner` resolves to `src/devtools/a11y/axeScanner.ts`.

---

## Intentional violations

Every violation is marked in the source with a comment. They exist to demonstrate the tooling.

**`src/app/page.tsx`**

Three `<label>` elements have no `htmlFor` attribute and do not wrap their `<input>`. The `id` attributes exist on the inputs but without `htmlFor` the browser does not create the programmatic association. Screen readers announce "Edit text, required" with no field name.
WCAG: 1.3.1 Info and Relationships (Level A), reported as `label` — critical.

One `<img>` in `ImageGallery` has no `alt` attribute. Screen readers announce the filename or "image" with no description.
WCAG: 1.1.1 Non-text Content (Level A), reported as `image-alt` — critical.

**`src/app/about/page.tsx`**

A `<input type="search">` has no `<label>`, no `aria-label`, and no `aria-labelledby`. Assistive technology cannot identify what the field is for.
WCAG: 3.3.2 Labels or Instructions (Level A), 4.1.2 Name, Role, Value (Level A), reported as `label` — critical.

A `<button>` contains only an SVG icon with no `<title>` and no `aria-label` on the button. Screen readers announce "button" with no action name.
WCAG: 4.1.2 Name, Role, Value (Level A), reported as `button-name` — critical.

Two `<p>` elements inside `<details>` accordion panels use `!text-gray-400` (`#9ca3af`) on a white background. The contrast ratio is 2.85:1. WCAG AA requires 4.5:1 for normal text.
WCAG: 1.4.3 Contrast Minimum (Level AA), reported as `color-contrast` — serious.

**The accordion contrast violation is the key demo scenario.** The text is inside collapsed `<details>` elements. On page load it is not in the accessibility tree. A naive scan — `page.goto("/about")` then `axe.analyze()` — passes incorrectly. The Playwright test in `tests/a11y/about.spec.ts` clicks every `<summary>` before scanning, bringing the hidden text into the tree. Only then does axe find and report it. This demonstrates why interacting with dynamic content before scanning is necessary for accurate results. The commented-out block at the bottom of `about.spec.ts` preserves the naive version as a reference showing exactly what gets missed.

---

## Setup

```bash
git clone https://github.com/chandansamal/a11y-next-app.git
cd a11y-next-app
npm install
npm run dev
```

Open http://localhost:3000. Open the browser DevTools console. The axe-core banner appears followed by grouped violation entries for the current page.

Install Playwright browsers once:

```bash
npx playwright install
```

---

## Layer 1 — axe-core in the browser

### How the production exclusion works

`layout.tsx` uses `next/dynamic` with a production guard evaluated at the module level:

```tsx
const AxeDevConsole =
  process.env.NODE_ENV === "production"
    ? () => null
    : dynamic(() => import("@/devtools/a11y/AxeDevConsole"));
```

The `process.env.NODE_ENV === "production"` check is evaluated at build time. Next.js dead-code eliminates the `dynamic()` import path entirely in production builds. Because `axe-core` is a `devDependency` it is never installed in production environments. The result is genuinely zero production footprint: no bytes added to any bundle, no runtime cost.

### One-time setup

`AxeDevConsole` is mounted once in `src/app/layout.tsx`. It covers every page and every component in the application automatically. When a new page or component is added, nothing changes in the scanner configuration.

### How the scanner works internally

`src/devtools/a11y/axeScanner.ts` holds all mutable state at the module level. Module-level variables survive Hot Module Replacement in Next.js dev — they are not re-initialized when React remounts a component during Fast Refresh. This is what makes delta tracking reliable across React Strict Mode's deliberate double-mount cycle.

**Type note.** `AxeInstance` is typed as `typeof import("axe-core")` — the full module namespace type. axe-core exports `run`, `configure`, and other methods as named exports directly on the module, so `axeModule.run()` and `instance.configure()` work without accessing `.default`.

**Initialization sequence:**

```
layout.tsx renders
  → next/dynamic loads AxeDevConsole (dev only)
    → useEffect fires
      → startAxeScanner()
          → axe-core dynamically imported
          → configure() called once (configured flag prevents repeats on remount)
          → MutationObserver attached to document.documentElement
          → scheduleScan() → 800ms debounce → requestIdleCallback → axe.run(document)
```

**On every monitored DOM change:**

```
MutationObserver fires
  → scheduleScan() resets the 800ms debounce timer
  → After 800ms of no further changes:
      → performScan()
          → requestIdleCallback({ timeout: 3000 })
              → axe.run(document, RUN_OPTIONS)
                  → logViolations() — filters to only new violation nodes
```

**MutationObserver scope.** The observer watches `document.documentElement` with `subtree: true`, covering the entire document including `<head>`. The `attributeFilter` narrows which attribute changes trigger a rescan to those with accessibility implications:

```
"open"              — <details> accordion expand/collapse
"hidden"            — element visibility
"aria-expanded"     — disclosure widgets (menus, accordions)
"aria-hidden"       — content entering/leaving the a11y tree
"aria-disabled"     — interactive element state
"disabled"          — native form element state
"lang", "dir"       — language and text direction (catches i18n route changes)
"role", "tabindex"  — semantic role and focus order changes
"aria-label", "aria-labelledby", "aria-describedby" — accessible name changes
"class", "style"    — visual state changes affecting contrast or visibility
"aria-checked", "aria-selected", "aria-current", "aria-pressed" — widget state
"title"             — tooltip and link title changes
"placeholder"       — input placeholder changes
"aria-live", "aria-atomic", "aria-relevant" — live region configuration
"aria-invalid", "aria-errormessage" — form validation state
```

**`requestIdleCallback` with `{ timeout: 3000 }`** ensures axe never starts a scan during an active React render, scroll event, or animation frame. The 3-second timeout forces the scan if the browser stays continuously busy, so violations are not silently dropped on CPU-heavy pages. Falls back to direct execution on Safari versions that lack the API.

**Delta reporting.** A `Set<string>` named `reportedKeys` tracks every violation already reported in this page session. The key format is `violationId::cssSelector` — one key per element per rule. On each scan, only nodes whose key is absent from the set are logged and their keys are added. Expanding the FAQ accordion logs only the `color-contrast` violation for the now-visible text — everything from the initial page scan is already in `reportedKeys`.

**Why `reportedKeys` is not reset in `stopAxeScanner`.** React Strict Mode deliberately unmounts and remounts every component once in development. Clearing the set on unmount would cause the second mount's initial scan to re-report every violation on the page. `stopAxeScanner` stops the observer and clears all timers but leaves `reportedKeys` intact.

**Route change reset.** `AxeDevConsole` uses `usePathname` from `next/navigation` to detect client-side navigation. On every route change `resetReportedKeys()` clears the set and immediately schedules a fresh scan of the new page. This ensures violations on a new route are always reported even when their selectors appeared on a previous page in the same session.

### Adapting to your codebase

**React 18 or 19:** Use this implementation as-is. Do not use `@axe-core/react` — it depends on `ReactDOM.render` which was deprecated in React 18 and removed in React 19.

**Create React App or Vite:** `axeScanner.ts` is framework-agnostic. Copy it unchanged. Replace `AxeDevConsole.tsx` with a plain React component that calls `startAxeScanner` in a `useEffect`. Replace `usePathname` with your router's equivalent or listen to `popstate` directly.

**Next.js Pages Router:** Works identically. `usePathname` from `next/navigation` is available from Next.js 13.1 onward in Pages Router.

**WCAG ruleset:** `RUN_OPTIONS` in `axeScanner.ts` and the `configure()` call are the only two locations controlling what gets scanned. Add or remove rules there. No other files change.

---

## Layer 2 — @axe-core/playwright

### Running tests

```bash
# axe WCAG 2.2 AA page scans
npm run test:a11y

# View the HTML report immediately after running
npm run test:a11y:report

# Keyboard navigation, focus indicator, and target size tests
npm run test:behavioral

# Both projects together
npm run test:a11y:all

# Playwright UI — watch the browser interact with the page in real time
npm run test:a11y:ui

# Open the HTML report from the last run at any time
npx playwright show-report
```

Reports are written to `playwright-report/`. JSON artifacts from `attachAxeReport()` are written to `test-results/`.

### Project configuration

`playwright.config.ts` defines three test projects:

| Project | Test files | Purpose |
|---|---|---|
| `a11y` | `tests/a11y/**/*.spec.ts` | axe WCAG 2.2 AA page scans |
| `a11y-behavioral` | `tests/a11y-behavioral/**/*.spec.ts` | Keyboard nav, focus, target size |
| `e2e-chromium` | `tests/e2e/**/*.spec.ts` | General E2E (extend as needed) |

The dev server starts automatically when running tests locally via the `webServer` config. In CI, `reuseExistingServer: false` forces a fresh server start.

### Shared test utility

`tests/a11y/utils/axe-wcag22aa.ts` exports four functions used by every test file:

`wcag22aa(page)` returns a configured `AxeBuilder` scanning against all six WCAG 2.2 AA tag sets with `color-contrast-enhanced` explicitly disabled.

`formatViolations(violations)` formats failures as structured text: total rule count, total elements affected, WCAG criterion, description, fix URL, element HTML, and CSS selector per node. This appears in the Playwright failure message so the full picture is visible without opening the HTML report.

`attachAxeReport(results, testInfo, label)` saves the complete `AxeResults` object as a JSON artifact attached to the test run, visible in `playwright-report/`.

`violationFingerprints(results)` returns a compact JSON summary of rule IDs, impacts, and selectors — useful for snapshot assertions or change detection across runs.

### Why Playwright catches what the browser console misses

axe-core in the browser scans the DOM as it exists at a given moment. Content inside a collapsed `<details>` is not in the accessibility tree — axe cannot measure its contrast ratio or evaluate any other property. A `page.goto()` followed immediately by `axe.analyze()` has the same limitation.

`tests/a11y/about.spec.ts` solves this by interacting before scanning:

```typescript
// Expand every accordion so hidden text enters the a11y tree
const summaries = page.locator("details > summary");
for (let i = 0; i < await summaries.count(); i++) {
  await summaries.nth(i).click();
}

// axe can now reach and measure the paragraph text
const results = await wcag22aa(page).analyze();
expect(results.violations).toHaveLength(0);
```

Without the click loop the test passes incorrectly. With the expansion it fails and identifies the two `<p>` elements with their exact contrast ratios and selectors.

The same pattern applies to any dynamic content in a real application: open a modal before scanning, trigger form validation then scan, navigate a multi-step wizard and scan each step.

### Adding a new page test

```typescript
// tests/a11y/your-page.spec.ts
import { test, expect } from "@playwright/test";
import { wcag22aa, formatViolations, attachAxeReport } from "./utils/axe-wcag22aa";

test("Your page — WCAG 2.2 AA scan", async ({ page }, testInfo) => {
  await page.goto("/your-route");
  await page.waitForLoadState("networkidle");

  // Interact with any dynamic content before scanning
  // await page.locator("details > summary").click();
  // await page.click("[aria-controls='modal-id']");

  const results = await wcag22aa(page).analyze();
  await attachAxeReport(results, testInfo, "your-page");

  expect(
    results.violations,
    `\nYour page:\n\n${formatViolations(results.violations)}\n`
  ).toHaveLength(0);
});
```

### Adding to CI/CD (GitHub Actions)

```yaml
# .github/workflows/a11y.yml
name: Accessibility

on: [pull_request]

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:a11y:all
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

Any pull request that introduces an accessibility violation fails this check and cannot merge until resolved.

---

## WCAG 2.2 AA ruleset

Both layers scan against the same six tag sets:

```
wcag2a    WCAG 2.0 Level A
wcag2aa   WCAG 2.0 Level AA
wcag21a   WCAG 2.1 Level A  (adds mobile, cognitive, low vision criteria)
wcag21aa  WCAG 2.1 Level AA
wcag22a   WCAG 2.2 Level A  (adds focus appearance, target size, dragging)
wcag22aa  WCAG 2.2 Level AA
```

Rules explicitly enabled (off by default in axe-core):

| Rule | WCAG criterion | Why enabled |
|---|---|---|
| `target-size` | 2.5.8 (2.2 AA) | Minimum 24×24px touch and click targets |
| `focus-visible` | 2.4.11 (2.2 AA) | Visible keyboard focus indicator required |

Rules explicitly disabled:

| Rule | WCAG criterion | Why disabled |
|---|---|---|
| `color-contrast-enhanced` | 1.4.6 (AAA) | Requires 7:1 ratio — AAA is out of scope for AA compliance. axe-core also tags this rule as `best-practice`, so without explicit disabling it fires even when `best-practice` is not in the tag list. |

---

## Static linting

`eslint-plugin-jsx-a11y` runs on every `npm run lint` call. It catches a subset of accessibility problems at write time: missing `alt`, missing `htmlFor`, invalid ARIA roles, interactive elements without keyboard handlers. It operates on static JSX and cannot evaluate computed values, contrast ratios, or runtime DOM state. It is a complement to axe-core, not a replacement.

---

## What axe-core does not catch

Automated scanning covers approximately 57% of WCAG 2.2 AA criteria. The remaining 43% require human evaluation:

- **Logical reading order** — DOM order may be correct while CSS Flexbox or Grid creates a visual layout mismatch for keyboard and screen reader users
- **Meaningful link and button text in context** — "Read more" may be unambiguous given surrounding content that axe cannot evaluate
- **Cognitive load and plain language** — no tool can assess whether instructions are understandable
- **Screen reader announcement quality** — ARIA attributes may be syntactically valid but semantically misleading; only testing with an actual screen reader reveals this
- **Focus management after dynamic interactions** — whether focus moves to the correct element after a modal closes, a route changes, or a form submits requires scripted or manual keyboard testing

The behavioral tests in `tests/a11y-behavioral/keyboard.spec.ts` partially address this: they verify all interactive elements are keyboard reachable, that a visible focus indicator exists on the first focused element, and that all visible interactive targets meet the 24×24px minimum.

---

## Resources

- [axe-core rules reference](https://dequeuniversity.com/rules/axe/4.10) — every rule, its WCAG mapping, code examples, and remediation guidance
- [WCAG 2.2 guidelines](https://www.w3.org/TR/WCAG22/) — the full standard
- [@axe-core/playwright API](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright) — `.include()`, `.exclude()`, `.withRules()`, `.withTags()`, `.disableRules()`
- [Deque University](https://dequeuniversity.com) — free WCAG reference with code examples for every criterion
- [Playwright docs](https://playwright.dev/docs/test-intro)
