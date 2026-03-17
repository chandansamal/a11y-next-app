// devtools/a11y/AxeDevConsole.tsx
"use client";

/**
 * AxeDevConsole
 *
 * Mount once in layout.tsx. Covers the entire document on every page.
 * Compatible with React 18, React 19, and Next.js App Router.
 * Zero production footprint.
 */
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  startAxeScanner,
  stopAxeScanner,
  resetReportedKeys,
} from "@/devtools/a11y/axeScanner";

export default function AxeDevConsole() {
  const pathname = usePathname();

  // Start the scanner once on mount. Stop it on unmount.
  // reportedKeys is intentionally not cleared here — see axeScanner.ts.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    startAxeScanner();
    return () => stopAxeScanner();
  }, []);

  // Reset reported keys and trigger a fresh scan on every route change.
  // This ensures violations on the new page are always reported even if
  // their selectors appeared on a previous page in the same session —
  // Next.js App Router does client-side navigation without re-evaluating
  // modules, so reportedKeys would otherwise persist across routes.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    resetReportedKeys();
  }, [pathname]);

  return null;
}
