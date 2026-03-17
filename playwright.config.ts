import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,

  // ─── Reporters ──────────────────────────────────────────────────────────
  // "html" generates the visual report in playwright-report/
  // "list" prints each test result to the terminal as it runs
  // Both run together — terminal stays readable, HTML report is always fresh
  reporter: [
    ["list"],
    [
      "html",
      {
        // Always write the report — not just on failure
        open: "never",
        // Explicit output folder so show-report always finds the right one
        outputFolder: "playwright-report",
      },
    ],
  ],

  // ─── Artifact output ────────────────────────────────────────────────────
  // Where attachAxeReport() JSON files and traces are written
  outputDir: "test-results",

  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    // Capture trace on first retry so failures are debuggable in CI
    trace: "on-first-retry",
  },

  // ─── Dev server ─────────────────────────────────────────────────────────
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },

  // ─── Projects ───────────────────────────────────────────────────────────
  projects: [
    // axe-core WCAG 2.2 AA scans — Chromium only
    {
      name: "a11y",
      testMatch: "tests/a11y/**/*.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },

    // Behavioral tests — keyboard, focus, target sizing
    {
      name: "a11y-behavioral",
      testMatch: "tests/a11y-behavioral/**/*.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },

    // General E2E suite
    {
      name: "e2e-chromium",
      testMatch: "tests/e2e/**/*.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
