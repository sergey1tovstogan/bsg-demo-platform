BSG Demo Platform — UX Design System

Purpose & Scope
---------------
This document defines the **design language and component intent** of the BSG Demo Platform.

It explains:
- the visual and interaction philosophy
- the component taxonomy
- when and why to use specific components

This document is **descriptive and prescriptive** about design intent,
but it does NOT define layout rules or content schemas.

Authoritative layout rules live in:
- LAYOUT_SPECIFICATION.md

Authoritative content structure lives in:
- CONTENT_MODEL.md

_Last updated: 2025-12-18_

---

Design Philosophy
-----------------
The design system prioritizes:

1) **Clarity**
   - Users should immediately understand where they are and what to do.

2) **Consistency**
   - Similar things look and behave the same across components and pages.

3) **Restraint**
   - Visual emphasis is earned, not default.
   - Avoid decorative elements that do not support meaning.

4) **Demo-readiness**
   - The UI must be reliable and predictable during live demos.

---

Component Taxonomy
------------------
Components are grouped by intent, not by visual style.

### 1) Structural Components
Used to organize content on a page.

Examples:
- Page header
- Section container
- Content group
- Sidebar / secondary panel

Rules:
- Structural components define *zones*, not content
- They must not contain business logic

---

### 2) Content Components
Used to present information.

Examples:
- Text blocks
- Lists
- Tables
- Code blocks
- Diagrams

Rules:
- Content components render data
- They do not control layout beyond their own bounds

---

### 3) Interactive Components
Used for user interaction.

Examples:
- Buttons
- Toggles
- Tabs
- Accordions
- Forms

Rules:
- Interactive components must expose clear states
- Interactions must be reversible where possible
- Disabled states must be visually distinct

---

### 4) Feedback Components
Used to communicate system state.

Examples:
- Alerts
- Toasts
- Loading indicators
- Empty states
- Error messages

Rules:
- Feedback must be timely and contextual
- Errors must be actionable and non-technical
- Loading states should not block unnecessarily

---

Design Tokens (Conceptual)
--------------------------
Design tokens represent shared design decisions.

Examples:
- spacing units
- color roles
- typography levels
- border radii
- elevation levels

Rules:
- Tokens are applied consistently
- Tokens are not overridden ad-hoc
- Tokens align with LAYOUT_SPECIFICATION.md

Implementation details live in code, not in this document.

---

Component Usage Guidelines
--------------------------
When choosing components:

- Prefer the simplest component that solves the problem
- Avoid stacking multiple interaction patterns together
- Use feedback components to reduce uncertainty

Anti-patterns:
- Buttons inside buttons
- Excessive nested accordions
- Overusing color to indicate hierarchy

---

State & Interaction Principles
------------------------------
All interactive components must support:

- Clear affordance
- Visible focus state
- Predictable behavior
- Graceful disabled state

Rules:
- Hover alone is not sufficient
- Keyboard interaction is mandatory
- Animations must be subtle and purposeful

---

Content vs Design Boundaries
----------------------------
Clear separation is mandatory:

- Design system defines *how things look and behave*
- Content model defines *what things mean*
- Templates define *how pages are assembled*

Do not blur these boundaries.

---

What This Document Controls
---------------------------
This document controls:
- Design language
- Component intent
- Usage guidelines
- Interaction philosophy

---

What This Document Does NOT Control
-----------------------------------
- Page layout rules → LAYOUT_SPECIFICATION.md
- Content schemas → CONTENT_MODEL.md
- Page templates → TEMPLATE_LIBRARY.md
- Visual examples → SHOWCASE.md

---

Relationship to Other UX Documents
----------------------------------
- README.md — UX entry point
- LAYOUT_SPECIFICATION.md — layout rules
- CONTENT_MODEL.md — content structure
- TEMPLATE_LIBRARY.md — page authoring
- SHOWCASE.md — visual reference

---
Last updated: 2025-12-18
Maintained by the BSG Team