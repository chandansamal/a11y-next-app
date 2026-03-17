# Contributing to A11y Next App

We welcome contributions that help make this a better learning resource for web accessibility!

## How to Add New Accessibility Tests

This project uses [Playwright](https://playwright.dev/) for end-to-end testing and [@axe-core/playwright](https://github.com/deque-labs/axe-core-npm/tree/develop/packages/playwright) for accessibility scanning.

### 1. Create a New Test File

Create a new TypeScript file in the `tests/a11y` directory. Name it descriptively, e.g., `tests/a11y/forms.spec.ts`.

```typescript
// tests/a11y/forms.spec.ts
import { test, expect } from "@playwright/test";
import { wcag22aa, formatViolations, attachAxeReport } from "./utils/axe-wcag22aa";

test("Contact Form — WCAG 2.2 AA scan", async ({ page }, testInfo) => {
  await page.goto("/contact"); // Navigate to the page with your form
  await page.waitForLoadState("networkidle");

  const results = await wcag22aa(page).analyze();
  await attachAxeReport(results, testInfo, "contact-form");

  expect(
    results.violations,
    `\nContact Form:\n\n${formatViolations(results.violations)}\n`
  ).toHaveLength(0);
});
```

### 2. Run Your New Test

```bash
npm run test:a11y
# Or to open the Playwright UI (useful for debugging):
npm run test:a11y:ui
```

### 3. Interpret Results

- **Terminal Output**: Violations will be logged directly to your terminal.
- **HTML Report**: After running `npm run test:a11y`, an HTML report is generated in `playwright-report/`. Open it with `npx playwright show-report`.
- **Console in DevTools**: While running the `dev` server (`npm run dev`), open your browser's developer console. The `AxeDevConsole` component will log accessibility violations in real-time.

### 4. Fix Issues (Optional)

If you're adding a test for a component that *should* be accessible, fix any reported violations by adjusting your component's code. Remember to follow WCAG guidelines and best practices. If you are intentionally creating violations for demonstration purposes, add comments like the ones found in `src/app/page.tsx`.

## Code Style and Linting

This project uses ESLint. Please ensure your code adheres to the existing style by running:

```bash
npm run lint:fix
```
