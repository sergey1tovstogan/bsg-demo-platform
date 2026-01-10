# Animations Demo Card

```yaml
card:
  # === CARD IDENTIFICATION ===
  id: "animations-demo"
  name: "Animations Showcase"
  category: "demo"
  color_theme: "purple"
  icon: "Sparkles"

  # === DESCRIPTIONS ===
  description:
    short: "Interactive animations demo"
    long: "Comprehensive demonstration of all available animations and transitions in the content template system"

  # === METADATA ===
  metadata:
    author: "Demo Team"
    version: "1.0"
    last_updated: "2026-01-09"
    tags: ["animations", "demo", "interactive", "examples"]
    difficulty: "beginner"
    estimated_time: "10 minutes"

  # === AGENDA ===
  agenda:
    file: "content/examples/animations-demo/agenda.md"

  # === NAVIGATION ===
  navigation:
    type: "hierarchical"
    show_breadcrumbs: true
    show_page_tree: true
    allow_back_to_agenda: true
    show_next_previous: true

  # === PAGES ===
  pages:
    - file: "content/examples/animations-demo/pages/entry-animations.md"
      order: 1
    - file: "content/examples/animations-demo/pages/hover-effects.md"
      order: 2
    - file: "content/examples/animations-demo/pages/expandable-animations.md"
      order: 3
    - file: "content/examples/animations-demo/pages/loading-animations.md"
      order: 4

  # === SETTINGS ===
  settings:
    default_animation: "slide-in-left"
    transition_speed: "300ms"
    page_transition: "fade"
```
