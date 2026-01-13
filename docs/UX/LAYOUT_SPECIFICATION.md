BSG Demo Platform — UX Layout Specification (Authoritative)

Purpose & Scope
---------------
This document defines the **non-negotiable layout and UX rules** for the BSG Demo Platform.

It is the **single source of truth** for:
- layout structure
- spacing and rhythm
- typography
- color usage
- responsive behavior
- accessibility expectations
- interaction states

All UI implementations MUST conform to this document.

This document does NOT:
- define content structure (see CONTENT_MODEL.md)
- provide page templates (see TEMPLATE_LIBRARY.md)
- explain design intent or component philosophy (see DESIGN_SYSTEM.md)

_Last updated: 2025-12-18_

---

Core UX Principles
-----------------
1) **Consistency over creativity**
   - Predictable layouts improve demos and comprehension
2) **Content-first**
   - Layout supports content, never the other way around
3) **Minimal cognitive load**
   - Reduce visual noise and unnecessary variation
4) **Accessibility by default**
   - Usable without special modes or overrides

---

Layout Structure
----------------
### Global Page Layout
All pages follow a consistent vertical structure:

1. Global header
2. Page title & context
3. Primary content area
4. Optional secondary panels
5. Footer (if present)

Rules:
- One primary content column per page
- Secondary panels are optional and must not dominate
- Avoid nested page-level layouts

---

### Grid System
- Use a fixed, responsive grid
- Max content width is constrained for readability
- Horizontal rhythm must remain consistent across breakpoints

Rules:
- Do not invent custom grids per page
- Breakpoints must align across the application

---

Spacing & Rhythm
----------------
Spacing is based on a **single scale**.

Recommended scale:
- 4px base unit
- Multiples only (4, 8, 12, 16, 24, 32, 48, 64)

Rules:
- Do not use arbitrary spacing values
- Vertical spacing takes priority over horizontal spacing
- Consistent spacing communicates hierarchy

---

Typography
----------
### Font Usage
- Use a single primary font family
- Font weights define hierarchy, not font changes

### Type Scale (Conceptual)
- Page title
- Section heading
- Subsection heading
- Body text
- Secondary / meta text

Rules:
- Do not mix multiple font families
- Do not use text color alone to convey importance

---

Color System
------------
Colors are used to:
- establish hierarchy
- indicate state
- guide attention

Rules:
- Neutral colors dominate
- Accent colors are used sparingly
- Status colors must be semantically correct (success, warning, error)

Accessibility:
- Contrast ratios must meet WCAG AA at minimum
- Never rely on color alone to convey meaning

---

Components & Composition
------------------------
Components must:
- Be visually self-contained
- Use consistent internal spacing
- Align with the global grid

Rules:
- Components do not define page layout
- Page layout composes components, not vice versa
- Do not hardcode layout logic into components

---

Responsive Behavior
-------------------
Responsive behavior is mandatory.

Rules:
- Mobile-first layout decisions
- Content stacks vertically on small screens
- No horizontal scrolling on primary content
- Touch targets must be appropriately sized

---

Interaction States
------------------
Interactive elements must define:
- Default
- Hover
- Focus
- Active
- Disabled (when applicable)

Rules:
- Focus states must be visible
- Hover-only affordances are not sufficient
- State changes must be subtle but clear

---

Accessibility
-------------
Minimum requirements:
- Keyboard navigability
- Visible focus indicators
- Semantic HTML
- ARIA only when necessary

Rules:
- Accessibility is not optional
- Accessibility fixes do not require design approval

---

What This Document Controls
---------------------------
This document controls:
- Page layout rules
- Visual rhythm
- Typography hierarchy
- Color usage
- Responsive behavior

If a question is about **how it looks or lays out**, this document applies.

---

What This Document Does NOT Control
-----------------------------------
- Content meaning or hierarchy → CONTENT_MODEL.md
- Page composition examples → TEMPLATE_LIBRARY.md
- Component philosophy → DESIGN_SYSTEM.md
- Backend behavior → technical docs

---

Relationship to Other UX Documents
----------------------------------
- README.md — UX entry point
- DESIGN_SYSTEM.md — design intent and components
- CONTENT_MODEL.md — content structure
- TEMPLATE_LIBRARY.md — authoring templates
- SHOWCASE.md — visual reference

---

Last updated: 2025-12-18
Maintained by the BSG Team