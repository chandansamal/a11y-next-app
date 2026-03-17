import { test, expect } from "@playwright/test";
import {
  wcag22aa,
  formatViolations,
  attachAxeReport,
} from "./utils/axe-wcag22aa";

// Keep only components that have their own route or genuinely exist in
// isolation. Remove any that just re-scope a page already covered above.

test("Products page — WCAG 2.2 AA scan", async ({ page }, testInfo) => {
  await page.goto("/products");
  await page.waitForLoadState("networkidle");

  const cards = page.locator("[data-testid='product-card']");
  const exists = await cards.count();

  if (exists === 0) {
    test.skip(
      true,
      "No product-card elements found — add data-testid='product-card' to your card component",
    );
    return;
  }

  const results = await wcag22aa(page).analyze();
  await attachAxeReport(results, testInfo, "products");

  expect(
    results.violations,
    `\nProducts page:\n\n${formatViolations(results.violations)}\n`,
  ).toHaveLength(0);
});
