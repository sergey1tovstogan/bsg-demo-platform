# Observability Card - Card Definition

```yaml
card:
  # === CARD IDENTIFICATION ===
  id: "observability"
  name: "Observability Explained"
  category: "technical"
  color_theme: "blue"
  icon: "Activity"

  # === DESCRIPTIONS ===
  description:
    short: "Master the fundamentals of observability"
    long: "A comprehensive guide to Metrics, Logs, and Traces, and how they are implemented in the Temenos stack."

  # === METADATA ===
  metadata:
    author: "BSG Team"
    version: "1.0"
    last_updated: "2026-01-01"
    tags: ["observability", "monitoring", "architecture", "temenos"]
    difficulty: "intermediate"
    estimated_time: "20 minutes"

  # === AGENDA ===
  agenda:
    file: "content/pages/cards/observability/agenda.md"

  # === NAVIGATION ===
  navigation:
    type: "hierarchical"
    show_breadcrumbs: true
    show_page_tree: true
    allow_back_to_agenda: true
    show_next_previous: true

  # === PAGES ===
  pages:
    - file: "content/pages/cards/observability/pages/introduction.md"
      order: 1
    - file: "content/pages/cards/observability/pages/big-picture.md"
      order: 2
    - file: "content/pages/cards/observability/pages/pillars.md"
      order: 3
    - file: "content/pages/cards/observability/pages/stack.md"
      order: 4
    - file: "content/pages/cards/observability/pages/temenos-stack.md"
      order: 5
    - file: "content/pages/cards/observability/pages/monitoring-flow.md"
      order: 6

  # === SETTINGS ===
  settings:
    default_animation: "fade-in"
    transition_speed: "300ms"
    max_depth: 3
```
