import AxeBuilder from "@axe-core/playwright";
import type { Page, TestInfo } from "@playwright/test";
import type { AxeResults, Result } from "axe-core";

const WCAG_22_AA_TAGS = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22a",
  "wcag22aa",
] as const;

const DISABLED_RULES: string[] = [
  "color-contrast-enhanced", // SC 1.4.6 — Level AAA, not AA
];

export function wcag22aa(page: Page): AxeBuilder {
  return new AxeBuilder({ page })
    .withTags([...WCAG_22_AA_TAGS])
    .disableRules(DISABLED_RULES);
}

/**
 * Formats violations grouped by rule, with each affected element listed
 * beneath its rule. Shows total rule count and total element count upfront
 * so the scope of failures is immediately obvious without counting.
 *
 * Output shape:
 *
 *   2 rules violated · 4 elements affected
 *   ─────────────────────────────────────────────────
 *   RULE 1 of 2 · [CRITICAL] image-alt  (2 elements)
 *   WCAG: 1.1.1 Non-text Content (Level A)
 *   Fix:  https://dequeuniversity.com/rules/axe/4.x/image-alt
 *
 *   Element 1: <img src="/images/hero.jpg">
 *   Context:   <section class="hero"><img src="/images/hero.jpg"></section>
 *
 *   Element 2: <img src="/images/product.jpg">
 *   Context:   <div class="card"><img src="/images/product.jpg"></div>
 *   ─────────────────────────────────────────────────
 *   RULE 2 of 2 · [SERIOUS] color-contrast  (2 elements)
 *   ...
 */
export function formatViolations(violations: Result[]): string {
  if (violations.length === 0) return "No violations found.";

  const totalElements = violations.reduce(
    (sum, v) => sum + v.nodes.length,
    0
  );

  const divider = "─".repeat(53);

  const header =
    `${violations.length} rule${violations.length === 1 ? "" : "s"} violated` +
    ` · ${totalElements} element${totalElements === 1 ? "" : "s"} affected`;

  const body = violations
    .map((v, i) => {
      // Pull only the WCAG SC reference tags (e.g. "wcag111", "wcag143")
      // and the level tags (wcag2a, wcag2aa etc.) for the citation line
      const wcagRefs = v.tags
        .filter((t) => /^wcag\d/.test(t))
        .join(", ");

      const elements = v.nodes
        .map((n, ei) => {
          const target = Array.isArray(n.target)
            ? n.target.join(" > ")
            : String(n.target);
          return (
            `  Element ${ei + 1}: ${n.html}\n` +
            `  Selector: ${target}`
          );
        })
        .join("\n\n");

      return (
        `${divider}\n` +
        `RULE ${i + 1} of ${violations.length}` +
        ` · [${(v.impact ?? "unknown").toUpperCase()}] ${v.id}` +
        `  (${v.nodes.length} element${v.nodes.length === 1 ? "" : "s"})\n` +
        `WCAG: ${wcagRefs}\n` +
        `What: ${v.description}\n` +
        `Fix:  ${v.helpUrl}\n\n` +
        `${elements}`
      );
    })
    .join("\n\n");

  return `${header}\n${body}\n${divider}`;
}

export async function attachAxeReport(
  results: AxeResults,
  testInfo: TestInfo,
  label = "axe-wcag22aa-results"
): Promise<void> {
  await testInfo.attach(label, {
    body: JSON.stringify(results, null, 2),
    contentType: "application/json",
  });
}

export function violationFingerprints(results: AxeResults): string {
  return JSON.stringify(
    results.violations.map((v: Result) => ({
      rule: v.id,
      impact: v.impact,
      description: v.description,
      targets: v.nodes.map((n) => n.target),
    })),
    null,
    2
  );
}