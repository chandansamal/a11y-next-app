import { test, expect } from "@playwright/test";
import {
  wcag22aa,
  formatViolations,
  attachAxeReport,
} from "./utils/axe-wcag22aa";

test("Homepage — WCAG 2.2 AA scan", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const results = await wcag22aa(page).analyze();
  await attachAxeReport(results, testInfo, "homepage");

  expect(
    results.violations,
    `\nHomepage:\n\n${formatViolations(results.violations)}\n`
  ).toHaveLength(0);
});