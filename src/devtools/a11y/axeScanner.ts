// devtools/a11y/axeScanner.ts
import type { AxeResults, RunOptions } from "axe-core";

type AxeInstance = typeof import("axe-core");

// ── Module-level state ───────────────────────────────────────────────────────

let axe: AxeInstance | null = null;
let observer: MutationObserver | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let idleHandle: number | null = null;
let running = false;
let started = false;
let configured = false;

// reportedKeys is intentionally NOT reset in stopAxeScanner.
// Resetting it there caused two problems:
//
//   1. React Strict Mode runs cleanup between its two deliberate mounts.
//      Clearing keys in cleanup meant the second mount's initial scan
//      would re-report everything — making the delta tracking pointless.
//
//   2. stopAxeScanner is called on every unmount. If the component
//      remounts for any reason mid-session, all previously seen violations
//      would be re-reported.
//
// Instead, resetReportedKeys() is the single explicit reset point, called
// from AxeDevConsole on every route change via usePathname().

let reportedKeys = new Set<string>();

function makeNodeKey(violationId: string, target: string[]): string {
  return `${violationId}::${target.join(",")}`;
}

// ── Constants ────────────────────────────────────────────────────────────────

const DEBOUNCE_MS = 800;
const IDLE_TIMEOUT_MS = 3000;

const IMPACT_ORDER: Readonly<Record<string, number>> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  minor: 3,
};

const RUN_OPTIONS: RunOptions = {
  runOnly: {
    type: "tag",
    values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"],
  },
};

// ── Configuration ────────────────────────────────────────────────────────────

function configureAxe(instance: AxeInstance): void {
  if (configured) return;
  instance.configure({
    branding: { application: "QVC Accessibility Dev Scanner" },
    rules: [
      { id: "target-size", enabled: true }, // SC 2.5.8  — WCAG 2.2 AA
      { id: "focus-visible", enabled: true }, // SC 2.4.11 — WCAG 2.2 AA
      { id: "color-contrast-enhanced", enabled: false }, // SC 1.4.6  — AAA, excluded
    ],
  });
  configured = true;
}

// ── Logging ──────────────────────────────────────────────────────────────────

function logViolations(results: AxeResults): void {
  const newViolations = results.violations
    .map((v) => {
      const newNodes = v.nodes.filter((node) => {
        const key = makeNodeKey(v.id, node.target as string[]);
        if (reportedKeys.has(key)) return false;
        reportedKeys.add(key);
        return true;
      });
      return newNodes.length ? { ...v, nodes: newNodes } : null;
    })
    .filter((v): v is NonNullable<typeof v> => v !== null);

  if (!newViolations.length) return;

  const sorted = [...newViolations].sort(
    (a, b) =>
      (IMPACT_ORDER[a.impact ?? "minor"] ?? 3) -
      (IMPACT_ORDER[b.impact ?? "minor"] ?? 3),
  );

  console.group(
    `%c♿ axe-core — ${sorted.length} WCAG 2.2 AA violations`,
    "background:#4a235a;color:#fff;padding:3px 8px;border-radius:4px",
  );

  sorted.forEach((v) => {
    const color =
      v.impact === "critical"
        ? "#c0392b"
        : v.impact === "serious"
          ? "#e67e22"
          : "#888";

    console.groupCollapsed(
      `%c[${v.impact}] ${v.id}`,
      `color:${color};font-weight:bold`,
    );
    console.info("Description:", v.description);
    console.info(
      "WCAG:",
      v.tags.filter((t) => t.startsWith("wcag")).join(", "),
    );
    console.info("Help:", v.helpUrl);
    v.nodes.forEach((node) => {
      console.warn("Element:", (node.target as string[]).join(", "));
      console.log("HTML:", node.html);
      console.info("Fix:", node.failureSummary);
    });
    console.groupEnd();
  });

  console.groupEnd();
}

// ── Scanner ──────────────────────────────────────────────────────────────────

async function runAxe(): Promise<void> {
  if (!axe || running) return;
  running = true;
  try {
    const results = await axe.run(document, RUN_OPTIONS);
    logViolations(results);
  } catch (err) {
    console.error("[axe-core] Scan error:", err);
  } finally {
    running = false;
  }
}

function performScan(): void {
  if (typeof requestIdleCallback === "function") {
    if (idleHandle !== null) cancelIdleCallback(idleHandle);
    idleHandle = requestIdleCallback(
      () => {
        idleHandle = null;
        runAxe();
      },
      { timeout: IDLE_TIMEOUT_MS },
    );
  } else {
    runAxe();
  }
}

function scheduleScan(): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(performScan, DEBOUNCE_MS);
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function startAxeScanner(): Promise<void> {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV === "production") return;
  if (started) return;

  const axeModule = await import("axe-core");
  axe = axeModule;
  configureAxe(axe);

  observer = new MutationObserver(scheduleScan);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [
      "open",
      "hidden",
      "aria-expanded",
      "aria-hidden",
      "aria-disabled",
      "disabled",
      "lang",
      "dir",
      "role",
      "tabindex",
      "aria-label",
      "aria-labelledby",
      "aria-describedby",
      "class",
      "style",
      "aria-checked",
      "aria-selected",
      "aria-current",
      "aria-pressed",
      "title", // For tooltips and link titles
      "placeholder", // For input fields
      "aria-live", // For live regions
      "aria-atomic", // For live regions
      "aria-relevant", // For live regions
      "aria-invalid", // For form validation
      "aria-errormessage", // For form validation
    ],
    characterData: false,
  });

  started = true;

  console.info(
    "%c♿ axe-core active — WCAG 2.2 AA scanning",
    "background:#4a235a;color:#fff;padding:4px 10px;border-radius:4px;font-weight:bold",
  );

  scheduleScan();
}

export function stopAxeScanner(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  if (idleHandle !== null && typeof cancelIdleCallback === "function") {
    cancelIdleCallback(idleHandle);
    idleHandle = null;
  }
  observer?.disconnect();
  observer = null;
  running = false;
  started = false;
  // reportedKeys is deliberately NOT reset here — see comment at declaration.
}

// Called from AxeDevConsole on every route change (usePathname).
// This is the single correct reset point — it clears seen violations so the
// fresh page gets a full scan, and immediately schedules that scan.
export function resetReportedKeys(): void {
  reportedKeys = new Set<string>();
  scheduleScan();
}
