# Complex Card Example - Card Definition

**Example Type:** Complex (5 levels, library reuse, animations)
**Demonstrates:** Deep hierarchical navigation, page library reuse, advanced interactions
**Use Case:** Comprehensive documentation, training courses, knowledge bases

---

```yaml
card:
  # === CARD IDENTIFICATION ===
  id: "complex-documentation"
  name: "Complete Documentation"
  category: "documentation"
  color_theme: "indigo"
  icon: "BookMarked"

  # === DESCRIPTIONS ===
  description:
    short: "Comprehensive documentation system"
    long: "Full-featured documentation with 5 levels of navigation and library page reuse"

  # === METADATA ===
  metadata:
    author: "Documentation Team"
    version: "3.0"
    last_updated: "2024-12-17"
    tags: ["documentation", "advanced", "comprehensive"]
    difficulty: "advanced"
    estimated_time: "30 minutes"

  # === AGENDA ===
  agenda:
    file: "content/examples/complex-card/agenda.md"

  # === NAVIGATION ===
  navigation:
    type: "hierarchical"
    show_breadcrumbs: true
    show_page_tree: true
    allow_back_to_agenda: true
    show_next_previous: true

  # === PAGES (mix of custom and library pages) ===
  pages:
    # REUSED from library - saves time!
    - file: "content/pages/library/intro/detailed-intro.md"
      order: 1

    # Custom page with deep hierarchy (5 levels)
    - file: "content/examples/complex-card/pages/architecture.md"
      order: 2

  # === SETTINGS ===
  settings:
    default_animation: "slide-in-up"
    transition_speed: "400ms"
    max_depth: 5  # ← Allows 5 levels!
```

---

## What This Example Demonstrates

✅ **5-level deep navigation** - Full hierarchy example
✅ **Library page reuse** - Uses pre-built intro page
✅ **Advanced animations** - Custom animation settings
✅ **Complete page tree** - Shows all 5 levels in sidebar
✅ **Automatic breadcrumbs** - Up to 5 levels deep

## File Structure

```
examples/complex-card/
  ├─ card-definition.md ← (this file)
  ├─ agenda.md
  └─ pages/
      ├─ architecture.md (Level 1)
      └─ architecture/
          ├─ overview.md (Level 2)
          ├─ details.md (Level 2)
          └─ details/
              ├─ layer-1.md (Level 3)
              └─ layer-1/
                  └─ component-a.md (Level 4)
                      └─ component-a/
                          └─ implementation.md (Level 5)
```

PLUS:
- Reused page: `content/pages/library/intro/detailed-intro.md` (Level 1)

## Usage

Copy this structure for:
- Comprehensive documentation sites
- Training course platforms
- Knowledge management systems
- Technical encyclopedias
- Multi-level product docs
