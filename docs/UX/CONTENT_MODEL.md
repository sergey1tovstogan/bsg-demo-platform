BSG Demo Platform — UX Content Model (Authoritative)

Purpose & Scope
---------------
This document defines **how content is structured, related, and authored** in the BSG Demo Platform.

It establishes:
- page and content hierarchy
- content types and their responsibilities
- metadata and navigation concepts
- rules for composing content into pages

This document is **authoritative for content structure**.

It does NOT:
- define visual layout or styling (see LAYOUT_SPECIFICATION.md)
- define component design intent (see DESIGN_SYSTEM.md)
- provide page templates (see TEMPLATE_LIBRARY.md)

_Last updated: 2025-12-18_

---

Core Principles
---------------
1) **Content is independent of layout**
   - Meaning comes before presentation

2) **Explicit structure**
   - Content types have clear roles and fields

3) **Composable**
   - Pages are composed from reusable content blocks

4) **Predictable navigation**
   - Structure supports intuitive discovery and demos

---

Content Hierarchy
-----------------
The platform content follows a consistent hierarchy:

- **Platform**
  - **Component**
    - **Page**
      - **Content Blocks**

Rules:
- A page belongs to exactly one component
- Content blocks do not exist without a page
- Components define domain context, not layout

See:
- COMPONENTS.md (domain ownership)

---

Content Types
-------------

### Component
Represents a top-level domain area (e.g., Integration, Deployment).

Responsibilities:
- Provides domain context
- Owns its pages and content
- Defines navigation entry points

Key metadata (conceptual):
- `component_id`
- `title`
- `description`
- `order`

---

### Page
Represents a navigable unit within a component.

Responsibilities:
- Groups related content
- Defines page-level metadata
- Is the primary unit of navigation

Key metadata (conceptual):
- `page_id`
- `title`
- `summary`
- `order`
- `visibility` (public / internal)

Rules:
- Pages must have a single, clear purpose
- Pages should be scannable and demo-friendly

---

### Content Block
Represents a reusable unit of content.

Examples:
- text section
- list
- table
- diagram reference
- code snippet
- callout

Responsibilities:
- Present information
- Remain layout-agnostic

Key metadata (conceptual):
- `type`
- `content`
- `order`
- `optional metadata`

Rules:
- Blocks do not control page layout
- Blocks do not reference other blocks directly

---

Navigation Model
----------------
Navigation is derived from content structure.

Principles:
- Navigation reflects component → page hierarchy
- Order is explicit, not inferred
- Hidden pages are allowed but intentional

Rules:
- Navigation logic must not be hardcoded per page
- Changes to navigation require content updates, not layout changes

---

Metadata & Taxonomy
-------------------
Metadata enables:
- ordering
- filtering
- search
- visibility control

Guidelines:
- Metadata must be explicit
- Avoid implicit behavior based on titles or paths
- Keep metadata minimal but sufficient

---

Content Ownership & Reuse
-------------------------
Rules:
- Content belongs to exactly one component
- Cross-component reuse must be intentional and documented
- Avoid duplicating content across components

If reuse is needed:
- Reference shared sources
- Do not copy-paste content blocks

---

What This Document Controls
---------------------------
This document controls:
- content hierarchy
- content type definitions
- metadata expectations
- navigation derivation

---

What This Document Does NOT Control
-----------------------------------
- layout rules → LAYOUT_SPECIFICATION.md
- component design → DESIGN_SYSTEM.md
- page templates → TEMPLATE_LIBRARY.md
- visual examples → SHOWCASE.md

---

Relationship to Other UX Documents
----------------------------------
- README.md — UX entry point
- LAYOUT_SPECIFICATION.md — layout rules
- DESIGN_SYSTEM.md — design intent
- TEMPLATE_LIBRARY.md — page authoring
- SHOWCASE.md — reference examples

---

Last updated: 2025-12-18
Maintained by the BSG Team