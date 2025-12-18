# UX Documentation — BSG Demo Platform

This folder defines **how the BSG Demo Platform looks, feels, and is authored**.

It is the single entry point for anything related to:
- visual layout
- design system
- content structure
- page templates
- UI examples and showcases

These documents are **authoritative within their scope** and are designed to be
referenced by humans as well as tooling (Claude / Cursor).

_Last updated: 2025-12-18_

---

## How to Use This Folder

Start with the document that matches what you are trying to do:

### 👩‍💻 Frontend development / UI changes
- **LAYOUT_SPECIFICATION.md** — non‑negotiable layout & UX rules
- **DESIGN_SYSTEM.md** — design language, components, and intent

### ✍️ Content authoring / page creation
- **CONTENT_MODEL.md** — how content is structured and related
- **TEMPLATE_LIBRARY.md** — copy‑paste‑safe page templates

### 🎥 Demos / onboarding / visual reference
- **SHOWCASE.md** — reference implementation and examples

If you are unsure, **start with LAYOUT_SPECIFICATION.md**.

---

## UX Document Responsibilities (Important)

Each file in this folder has a **single responsibility**:

| File | Responsibility |
|----|----|
| LAYOUT_SPECIFICATION.md | Visual rules: layout, spacing, typography, responsiveness |
| DESIGN_SYSTEM.md | Design language, component intent, usage guidelines |
| CONTENT_MODEL.md | Content structure, metadata, hierarchy, navigation |
| TEMPLATE_LIBRARY.md | Canonical page templates and authoring examples |
| SHOWCASE.md | Reference examples and demo navigation |
| README.md | Orientation and entry point (this file) |

Do **not** duplicate content across files.
Link to the authoritative document instead.

---

## Hard Rules

- **Layout rules live only in `LAYOUT_SPECIFICATION.md`**
- **Content authors must not define layout or styling**
- **Templates must follow the content model**
- **Examples do not define rules**

If a rule appears in multiple places, it is a documentation bug.

---

## Relationship to Other Documentation

UX documentation complements — but does not replace — technical documentation:

- Architecture → `ARCHITECTURE.md`
- Component boundaries → `COMPONENTS.md`
- API behavior → `API_CONVENTIONS.md`
- Connectivity rules → `CONNECTIVITY.md`

UX docs focus on **presentation and authoring**, not system behavior.

---

## Tooling & AI Usage

When using Claude or Cursor:
- Reference UX documents instead of re‑describing layout or design
- Reuse existing templates and patterns
- Do not invent new UI rules without updating the authoritative files

This keeps UX consistent across contributors and features.

---
Last updated: 2025-12-18
Maintained by the BSG Team