import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  const team = [
    { name: "John Doe", role: "Frontend Engineer" },
    { name: "Jane Doe", role: "QA" },
    { name: "John Smith", role: "UX Designer" },
  ];

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">About Us</h1>
      <p className="text-slate-600 mb-8 max-w-prose">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </p>

      <section aria-labelledby="mission-heading">
        <h2 id="mission-heading" className="text-xl font-bold mb-3">
          Our Mission
        </h2>
        <p className="max-w-prose text-slate-700 mb-6">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </p>
      </section>

      <section aria-labelledby="team-heading">
        <h2 id="team-heading" className="text-xl font-bold mb-4">
          Team
        </h2>
        <form style={{ marginTop: "1rem" }}>
          {/*
            INTENTIONAL VIOLATION: Missing accessible label.
            WCAG 2.1 SC 3.3.2: Labels or Instructions
            This input is visually recognizable but has no programmatically
            discoverable name for screen reader users.
          */}
          <input
            type="search"
            style={{
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
              marginRight: "0.5rem",
            }}
          />
          {/*
            INTENTIONAL VIOLATION: Missing accessible name.
            WCAG 2.1 SC 4.1.2: Name, Role, Value
            The button only contains an SVG icon with no text content or aria-label.
          */}
          <button
            type="submit"
            className="absolute mt-1"
          >
            <svg
              width="35"
              height="35"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </form>
        {/* Use a table for data that has natural row/column relationships */}
        <table className="w-full max-w-lg border-collapse text-left mt-6">
          {/* caption is REQUIRED for accessible tables — axe enforces this */}
          <caption className="sr-only">Team members and their roles</caption>
          <thead>
            <tr className="border-b border-slate-300">
              <th
                scope="col"
                className="py-2 pr-6 font-semibold text-slate-700"
              >
                Name
              </th>
              <th scope="col" className="py-2 font-semibold text-slate-700">
                Role
              </th>
            </tr>
          </thead>
          <tbody>
            {team.map(({ name, role }) => (
              <tr key={name} className="border-b border-slate-100">
                <td className="py-2 pr-6">{name}</td>
                <td className="py-2 text-slate-600">{role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Accessible disclosure / accordion pattern */}
      <section aria-labelledby="faq-heading" className="mt-10">
        <h2 id="faq-heading" className="text-xl font-bold mb-4">
          FAQ
        </h2>
        <details className="border border-slate-200 rounded p-4 mb-2">
          <summary className="cursor-pointer font-medium text-slate-800 select-none">
            What WCAG level do you target?
          </summary>
          {/*
            INTENTIONAL VIOLATION: Insufficient color contrast.
            WCAG 2.1 SC 1.4.3: Contrast (Minimum)
            'text-gray-400' on a white background fails the 4.5:1 ratio requirement.
          */}
          <p className="mt-2 text-slate-600 !text-gray-400">
            We target WCAG 2.2 Level AA as the baseline, with AAA guidelines
            applied where feasible.
          </p>
        </details>
        <details className="border border-slate-200 rounded p-4 mb-2">
          <summary className="cursor-pointer font-medium text-slate-800 select-none">
            Do you test with real assistive technology?
          </summary>
          {/*
            INTENTIONAL VIOLATION: Insufficient color contrast.
          */}
          <p className="mt-2 text-slate-600 !text-gray-400">
            Yes — automated axe-core scans catch ~57% of issues. The rest are
            validated manually with NVDA, TalkBack, and VoiceOver.
          </p>
        </details>
      </section>
    </>
  );
}
