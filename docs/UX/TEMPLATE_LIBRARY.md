BSG Demo Platform — UX Template Library

Purpose & Scope
---------------
This document provides **canonical, copy-paste-safe page templates** for the BSG Demo Platform.

It translates UX rules into **practical authoring patterns**:
- how pages are assembled
- how content blocks are ordered
- how metadata is declared

This document is **authoritative for page authoring**, but it does NOT:
- define layout rules (see LAYOUT_SPECIFICATION.md)
- define design intent (see DESIGN_SYSTEM.md)
- redefine content meaning (see CONTENT_MODEL.md)

_Last updated: 2025-12-18_

---

How to Use This Document
-----------------------
1) Choose the template that best matches your page goal
2) Copy the full template
3) Fill in content only — do not modify structure
4) Validate against CONTENT_MODEL.md rules

If unsure, start with the **Standard Content Page**.

---

Global Authoring Rules
----------------------
- Do not add layout or styling hints
- Do not invent new block types
- Keep pages focused and scannable
- Prefer multiple small pages over one large page

---

Canonical Page Templates
------------------------

### 1) Standard Content Page
Use for most documentation-style pages.

Example (conceptual YAML):
```yaml
page:
  page_id: integration-overview
  title: Integration Overview
  summary: High-level view of integration capabilities
  order: 1
  visibility: public

content:
  - type: text
    order: 1
    content: |
      Introductory explanation of the topic.

  - type: list
    order: 2
    content:
      - Key capability one
      - Key capability two
      - Key capability three

  - type: callout
    order: 3
    content: Important takeaway or note.
```

---

### 2) Deep-Dive / Reference Page
Use for technical or detailed explanations.

```yaml
page:
  page_id: eventhub-details
  title: Event Hub Details
  summary: In-depth explanation of Event Hub usage
  order: 2
  visibility: public

content:
  - type: text
    order: 1
    content: |
      Context and background.

  - type: table
    order: 2
    content:
      headers: [Field, Description]
      rows:
        - [EVENTHUB_NAME, Event Hub identifier]
        - [CONSUMER_GROUP, Consumer group name]

  - type: code
    order: 3
    content: |
      Example configuration snippet.
```

---

### 3) Demo-Oriented Page
Use for live demos or walkthroughs.

```yaml
page:
  page_id: live-demo
  title: Live Demo Walkthrough
  summary: Step-by-step demo guide
  order: 3
  visibility: internal

content:
  - type: steps
    order: 1
    content:
      - Step one explanation
      - Step two explanation
      - Step three explanation

  - type: callout
    order: 2
    content: Key talking point for presenters.
```

---

### 4) Index / Landing Page
Use as an entry point to a component.

```yaml
page:
  page_id: deployment-index
  title: Deployment
  summary: Explore deployment and runtime topics
  order: 0
  visibility: public

content:
  - type: grid
    order: 1
    content:
      - title: Azure Configuration
        description: How the platform runs in Azure
      - title: Event Hub
        description: Event-driven architecture overview
```

---

Content Block Reference (Summary)
---------------------------------
Common block types:
- `text`
- `list`
- `table`
- `code`
- `callout`
- `steps`
- `grid`

Rules:
- Block types must align with CONTENT_MODEL.md
- New block types require explicit review

---

Anti-Patterns
-------------
Avoid:
- Overloaded pages with too many blocks
- Mixing demo scripts with reference material
- Encoding layout behavior in content
- Repeating the same content across pages

---

Relationship to Other UX Documents
----------------------------------
- README.md — UX entry point
- LAYOUT_SPECIFICATION.md — layout rules
- DESIGN_SYSTEM.md — design intent
- CONTENT_MODEL.md — content meaning
- SHOWCASE.md — visual reference

---
Last updated: 2025-12-18
Maintained by the BSG Team