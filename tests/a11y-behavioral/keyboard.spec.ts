import { test, expect } from "@playwright/test";

test.describe("Keyboard navigation", () => {
  test("all interactive elements are reachable via Tab", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Collect all naturally focusable elements
    const focusableSelectors = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "[tabindex]:not([tabindex='-1'])",
    ].join(", ");

    const expectedCount = await page.locator(focusableSelectors).count();
    expect(expectedCount).toBeGreaterThan(0);

    // Tab through the page and count how many elements receive focus
    await page.keyboard.press("Tab");
    let tabCount = 0;
    const maxTabs = expectedCount + 10; // safety ceiling

    while (tabCount < maxTabs) {
      const focused = await page.evaluate(() =>
        document.activeElement?.tagName?.toLowerCase(),
      );
      if (focused === "body" && tabCount > 0) break; // wrapped back to start
      tabCount++;
      await page.keyboard.press("Tab");
    }

    // Every focusable element should have been reachable
    expect(tabCount).toBeGreaterThanOrEqual(expectedCount);
  });
});

test.describe("Focus indicator visibility", () => {
  test("focused elements have a visible focus ring", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.keyboard.press("Tab");

    const hasFocusStyle = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return false;
      const styles = window.getComputedStyle(el);
      // Accept either outline or box-shadow as a valid focus indicator
      const hasOutline =
        styles.outlineStyle !== "none" && styles.outlineWidth !== "0px";
      const hasBoxShadow = styles.boxShadow !== "none";
      return hasOutline || hasBoxShadow;
    });

    expect(
      hasFocusStyle,
      "First focused element has no visible outline or box-shadow focus indicator",
    ).toBe(true);
  });
});

test.describe("Target size (SC 2.5.8 — WCAG 2.2 AA)", () => {
  test("interactive targets meet 24×24px minimum", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const violations: string[] = [];

    const targets = page.locator("button, a[href], input, select, textarea");
    const count = await targets.count();

    for (let i = 0; i < count; i++) {
      const el = targets.nth(i);

      // Skip hidden elements — axe-core also skips these
      const isVisible = await el.isVisible();
      if (!isVisible) continue;

      const box = await el.boundingBox();
      if (!box) continue;

      if (box.width < 24 || box.height < 24) {
        const tag = await el.evaluate((e) => e.outerHTML.slice(0, 120));
        violations.push(
          `${box.width.toFixed(0)}×${box.height.toFixed(0)}px — ${tag}`,
        );
      }
    }

    expect(
      violations,
      `\nElements below 24×24px minimum (SC 2.5.8):\n\n${violations.join("\n")}\n`,
    ).toHaveLength(0);
  });
});
