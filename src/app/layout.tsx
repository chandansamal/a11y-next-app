import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import dynamic from "next/dynamic";

const geist = Geist({ subsets: ["latin"] });

// This guarantees 0 bytes are added to the production JS bundle.
const AxeDevConsole =
  process.env.NODE_ENV === "production"
    ? () => null
    : dynamic(() => import("@/devtools/a11y/AxeDevConsole"));

export const metadata: Metadata = {
  title: {
    template: "%s | A11y Next App",
    default: "A11y Next App",
  },
  description:
    "A Next.js app built with WCAG AA accessibility from the ground up",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // lang is REQUIRED — jsx-a11y/html-has-lang enforces this
    <html lang="en">
      <body className={geist.className}>
        {/*
          AxeDevConsole is a Client Component with a NODE_ENV guard.
          In production, the dynamic import is never executed and the
          component renders null — zero cost in production.
        */}
        <AxeDevConsole />
        {/* Skip navigation: WCAG 2.4.1 — keyboard users jump past nav */}
        <a
          href="#main-content"
          className="
            sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4
            focus:z-50 focus:bg-blue-700 focus:text-white focus:px-4
            focus:py-2 focus:rounded focus:outline-none focus:ring-2
            focus:ring-white
          "
        >
          Skip to main content
        </a>
        {/* ARIA landmark: banner */}
        <header className="bg-slate-900 text-white px-6 py-4">
          <nav aria-label="Primary">
            <ul className="flex gap-6 list-none m-0 p-0">
              <li>
                <Link href="/" className="hover:underline ">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:underline ">
                  About
                </Link>
              </li>
            </ul>
          </nav>
        </header>
        {/* ARIA landmark: main — target of skip-nav link */}
        <main id="main-content" className="min-h-screen px-6 py-10">
          {children}
        </main>
        {/* ARIA landmark: contentinfo */}
        <footer
          className="bg-slate-100 px-6 py-4 text-sm text-slate-600"
        >
          <p>
            © {new Date().getFullYear()} A11y Next App. All rights reserved.
          </p>
        </footer>
      </body>
    </html>
  );
}
