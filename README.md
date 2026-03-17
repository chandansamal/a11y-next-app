# A11y Next.js Demo Application

This project is a Next.js application designed as a *test bed* and *educational resource* for web accessibility (A11y).
It intentionally includes various WCAG 2.2 AA violations to demonstrate how automated accessibility testing tools identify and report issues, and how to debug them.

## Project Goals

1.  **Demonstrate Automated Accessibility Testing**: Showcase the integration of `axe-core` for both real-time development feedback and CI/CD automated testing.
2.  **Provide a Learning Resource**: Illustrate common WCAG violations and provide guidance on their remediation through in-code comments and documentation.
3.  **Facilitate Debugging**: Offer tools and configurations to help developers quickly identify and understand accessibility issues.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Intentional Accessibility Violations (The "Broken" App)

This application *deliberately* includes accessibility issues to serve as examples.
Each intentional violation is marked with comments in the code (e.g., in [`src/app/page.tsx`](src/app/page.tsx) and [`src/app/about/page.tsx`](src/app/about/page.tsx)).

Here's a summary of the intentional violations:

-   **Missing `htmlFor` Attributes**: Labels for form elements in [`src/app/page.tsx`](src/app/page.tsx) are not correctly associated with their inputs.
    -   *WCAG Criterion*: 2.1 SC 1.3.1 (Info and Relationships)
    -   *Impact*: Screen readers cannot correctly announce the label for the input field.
-   **Missing `alt` Text on Images**: An image in the `ImageGallery` component in [`src/app/page.tsx`](src/app/page.tsx) lacks descriptive alternative text.
    -   *WCAG Criterion*: 2.1 SC 1.1.1 (Non-text Content)
    -   *Impact*: Visually impaired users will not know the content or purpose of the image.
-   **Missing Accessible Label/Name**: The search input and button in [`src/app/about/page.tsx`](src/app/about/page.tsx) lack programmatic labels or names.
    -   *WCAG Criterion*: 2.1 SC 3.3.2 (Labels or Instructions) and 2.1 SC 4.1.2 (Name, Role, Value)
    -   *Impact*: Assistive technologies cannot identify the purpose of the input or button.
-   **Insufficient Color Contrast**: Text in the FAQ section of [`src/app/about/page.tsx`](src/app/about/page.tsx) uses a low-contrast color (`text-gray-400`).
    -   *WCAG Criterion*: 2.1 SC 1.4.3 (Contrast Minimum)
    -   *Impact*: Users with low vision or color deficiencies will struggle to read the text.

## Accessibility Testing Tools

This project integrates two powerful tools for identifying accessibility issues:

### 1. Real-time Browser Console Feedback (`AxeDevConsole`)

The `AxeDevConsole` component ([`src/devtools/a11y/AxeDevConsole.tsx`](src/devtools/a11y/AxeDevConsole.tsx))
is active only in development mode. It leverages `axe-core` to scan your DOM for accessibility violations whenever changes occur.

-   **How to Use**: Open your browser's developer console while running the development server (`npm run dev`).
    You will see `♿ axe-core` messages logging violations directly, with details on the rule, WCAG criterion, element, and suggested fixes.
-   **Mechanism**: A `MutationObserver` watches for DOM changes, debounces them, and then triggers an `axe.run()` scan via `requestIdleCallback` for performance.

### 2. Automated End-to-End Tests (`Playwright` with `@axe-core/playwright`)

Playwright tests provide a robust way to automate accessibility checks across your application.

-   **Running Tests**: 
    -   All a11y tests: `npm run test:a11y`
    -   Run with Playwright UI (great for debugging and seeing the browser interact): `npm run test:a11y:ui`
    -   Behavioral a11y tests (keyboard navigation, focus management): `npm run test:behavioral`
    -   All a11y and behavioral tests: `npm run test:a11y:all`
-   **Interpreting Reports**: After running tests, an HTML report is generated in `playwright-report/`. Open it with `npx playwright show-report`.
    Each test will also attach a JSON artifact of the `axe-core` results in the `test-results/` directory.
-   **VS Code Integration**: You can run Playwright tests directly from the VS Code Test Explorer sidebar or using the `Run Playwright A11y Tests` launch configuration (`.vscode/launch.json`).

## Learning More

-   [Next.js Documentation](https://nextjs.org/docs)
-   [Learn Next.js](https://nextjs.org/learn)
-   [WCAG 2.2 Guidelines](https://www.w3.org/TR/WCAG22/)
-   [axe-core Documentation](https://www.deque.com/axe/core-documentation/)
-   [Playwright Documentation](https://playwright.dev/docs/intro)

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for guidelines on how to add new tests or improve this demo.
