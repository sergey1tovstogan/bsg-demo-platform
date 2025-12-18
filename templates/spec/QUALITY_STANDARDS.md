# Mandatory Quality Standards

To ensure the Content Template System remains maintainable, performant, and accessible, all contributions MUST adhere to the following quality principles.

## 🧪 Test-First Development (TDD)
We follow a strict "Red-Green-Refactor" cycle. Implementation without tests is considered incomplete.

1.  **Write Tests FIRST**: Create the `.test.tsx` or `.test.ts` file before writing any implementation code for EVERY component or utility.
2.  **Run & Fail (Red)**: Execute the test and confirm it fails as expected.
3.  **Minimal Implementation (Green)**: Write the absolute minimum code required to make the test pass. Avoid "guessing" future requirements.
4.  **Refactor**: Clean up the code, improve variable naming, and optimize while keeping the tests green.
5.  **Final Verification**: Run the tests one last time to ensure no regression was introduced during refactoring.

## 🎨 Styling Standards
All visual elements must be derived from the core design system.

- **Unified Layout**: Strictly follow the `UNIFIED_LAYOUT_SPECIFICATION`. Do NOT use custom hex colors, ad-hoc font sizes, or non-standard spacing.
- **Tailwind Only**: Use Tailwind utility classes for all styling. **NO** inline styles and **NO** custom CSS files unless justifying a specific animation/complex layout.
- **Adaptive Design**: 
    - Full support for **Light and Dark modes** is mandatory.
    - Layouts must be responsive, explicitly supporting **Mobile, Tablet, and Desktop** breakpoints.

## ♿ Accessibility Standards
Inclusivity is a core requirement, not an afterthought.

- **Compliance**: MUST meet **WCAG 2.1 AA** standards.
- **Interactivity**: 
    - **Keyboard Navigation**: All interactive elements (buttons, links, hotspots) must be accessible via Tab and Enter/Space keys.
    - **Visual Focus**: Focus states must be clearly visible.
- **Screen Readers**:
    - Use **Semantic HTML** (e.g., `<article>`, `<nav>`, `<aside>`) instead of generic `<div>`s where possible.
    - Provide descriptive **ARIA labels** (`aria-label`, `aria-expanded`, etc.) for complex components like Expandable Sections or Nav Trees.

## ⚡ Performance Standards
The system must feel instantaneous and fluid on all devices.

- **Load Speed**: Initial page render MUST be **< 200ms**.
- **Navigation**: Client-side navigation (switching pages in a Card) MUST be **< 50ms**.
- **Smoothness**: All animations and transitions MUST maintain **60fps** without jitter.
- **Stability**: Components must be profiled for **Memory Leaks**, especially when using complex hooks or event listeners in `InteractiveDiagramSection`.

---

> [!IMPORTANT]
> Failure to adhere to these principles will result in a rejected implementation. Always run the `EndToEndCard.test.tsx` before proposing any core changes.
