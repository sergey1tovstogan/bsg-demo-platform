# Simple Card Example - Card Definition

**Example Type:** Simple (2 levels)
**Demonstrates:** Basic card structure with agenda and 2 simple pages
**Use Case:** Quick information card, product overview, basic tutorial

---

```yaml
card:
  # === CARD IDENTIFICATION ===
  id: "simple-product-overview"
  name: "Product Overview"
  category: "product"
  color_theme: "blue"
  icon: "Box"

  # === DESCRIPTIONS ===
  description:
    short: "Quick product introduction"
    long: "A simple overview of our product features and benefits"

  # === METADATA ===
  metadata:
    author: "Product Team"
    version: "1.0"
    last_updated: "2024-12-17"
    tags: ["product", "beginner", "overview"]
    difficulty: "beginner"
    estimated_time: "5 minutes"

  # === AGENDA ===
  agenda:
    file: "examples/simple-card/agenda.md"

  # === NAVIGATION ===
  navigation:
    type: "hierarchical"
    show_breadcrumbs: true
    show_page_tree: true
    allow_back_to_agenda: true
    show_next_previous: true

  # === PAGES (2 simple pages) ===
  pages:
    - file: "examples/simple-card/pages/intro.md"
      order: 1
    - file: "examples/simple-card/pages/features.md"
      order: 2

  # === SETTINGS ===
  settings:
    default_animation: "fade-in"
    transition_speed: "300ms"
    max_depth: 2
```

---

## What This Example Demonstrates

✅ **Minimal viable card** - Simplest possible structure
✅ **2-level navigation** - Agenda → Pages (no sub-pages)
✅ **Basic sections** - Hero, text, feature grid
✅ **Simple navigation** - Linear flow with next/previous
✅ **Quick to create** - 10-15 minutes total

## File Structure

```
examples/simple-card/
  ├─ card-definition.md ← (this file)
  ├─ agenda.md
  └─ pages/
      ├─ intro.md
      └─ features.md
```

## Usage

Copy this structure for:
- Product overviews
- Simple tutorials
- Quick start guides
- Marketing cards
- Landing pages
