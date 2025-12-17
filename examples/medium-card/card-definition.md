# Medium Card Example - Card Definition

**Example Type:** Medium (3 levels with popups)
**Demonstrates:** Hierarchical navigation with sub-pages and interactive popups
**Use Case:** Documentation, technical guides, product deep-dives

---

```yaml
card:
  # === CARD IDENTIFICATION ===
  id: "medium-technical-guide"
  name: "Technical Guide"
  category: "documentation"
  color_theme: "violet"
  icon: "BookText"

  # === DESCRIPTIONS ===
  description:
    short: "Comprehensive technical documentation"
    long: "A detailed guide with hierarchical navigation and interactive elements"

  # === METADATA ===
  metadata:
    author: "Technical Team"
    version: "2.0"
    last_updated: "2024-12-17"
    tags: ["documentation", "technical", "intermediate"]
    difficulty: "intermediate"
    estimated_time: "15 minutes"

  # === AGENDA ===
  agenda:
    file: "examples/medium-card/agenda.md"

  # === NAVIGATION ===
  navigation:
    type: "hierarchical"
    show_breadcrumbs: true
    show_page_tree: true
    allow_back_to_agenda: true
    show_next_previous: true

  # === PAGES (3 levels deep) ===
  pages:
    - file: "examples/medium-card/pages/overview.md"
      order: 1
    - file: "examples/medium-card/pages/architecture.md"  # Has sub-pages
      order: 2

  # === SETTINGS ===
  settings:
    default_animation: "fade-in"
    transition_speed: "300ms"
    max_depth: 3
```

---

## What This Example Demonstrates

✅ **3-level hierarchy** - Card → Pages → Sub-pages
✅ **Popups** for quick reference information
✅ **Expandable sections** for progressive disclosure
✅ **Interactive diagrams** with clickable hotspots
✅ **Page tree navigation** showing hierarchy

## File Structure

```
examples/medium-card/
  ├─ card-definition.md ← (this file)
  ├─ agenda.md
  └─ pages/
      ├─ overview.md (Level 1)
      ├─ architecture.md (Level 1)
      └─ architecture/
          ├─ components.md (Level 2)
          └─ data-flow.md (Level 2)
```

## Usage

Copy this structure for:
- Technical documentation
- API guides
- Architecture documentation
- Feature deep-dives
- Training courses
