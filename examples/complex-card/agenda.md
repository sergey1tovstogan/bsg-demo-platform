# Complex Card Example - Agenda

```yaml
agenda:
  title: "Complete Documentation"
  subtitle: "Explore comprehensive technical documentation"

  layout:
    type: "grid"
    columns: 2
    gap: "large"

  animation:
    type: "stagger-fade-in"
    delay_between_items: "0.1s"

  items:
    - id: "intro"
      order: 1
      titles:
        agenda_title: "Introduction"
      description: "Detailed introduction and overview (reused from library)"
      icon: "BookOpen"
      target:
        type: "page"
        page_id: "detailed-intro"  # ← Library page ID
      color_theme: "blue"

    - id: "architecture"
      order: 2
      titles:
        agenda_title: "Architecture"
      description: "Deep dive into system architecture (5 levels deep)"
      icon: "Boxes"
      target:
        type: "page"
        page_id: "architecture"
      color_theme: "indigo"
```
