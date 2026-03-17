// tests/about.spec.ts
import { test, expect } from "@playwright/test";
import {
  wcag22aa,
  formatViolations,
  attachAxeReport,
} from "./utils/axe-wcag22aa";

test("About page — WCAG 2.2 AA scan", async ({ page }, testInfo) => {
  await page.goto("/about");
  await page.waitForLoadState("networkidle");

  // Expand all FAQ accordions so their content is visible to axe.
  // Without this, collapsed <details> panels are not in the accessibility
  // tree and axe cannot scan them — the same limitation axe-core/react has.
  const summaries = page.locator("details > summary");
  for (let i = 0; i < (await summaries.count()); i++) {
    await summaries.nth(i).click();
  }

  const results = await wcag22aa(page).analyze();
  await attachAxeReport(results, testInfo, "about");

  expect(
    results.violations,
    `\nAbout page:\n\n${formatViolations(results.violations)}\n`,
  ).toHaveLength(0);
});

/**
test("About page — WCAG 2.2 AA scan", async ({ page }, testInfo) => {
  await page.goto("/about");
  await page.waitForLoadState("networkidle");

  const results = await wcag22aa(page).analyze();
  await attachAxeReport(results, testInfo, "about");

  expect(
    results.violations,
    `\nAbout page:\n\n${formatViolations(results.violations)}\n`,
  ).toHaveLength(0);
});
 */
