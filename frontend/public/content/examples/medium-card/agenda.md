# Medium Card Example - Agenda

```yaml
agenda:
  title: "Technical Guide"
  subtitle: "Explore our architecture and implementation"

  layout:
    type: "grid"
    columns: 2
    gap: "large"

  animation:
    type: "stagger-fade-in"
    delay_between_items: "0.15s"

  items:
    - id: "overview"
      order: 1
      titles:
        agenda_title: "Overview"
      description: "High-level system overview"
      icon: "Eye"
      target:
        type: "page"
        page_id: "overview"
      color_theme: "blue"

    - id: "architecture"
      order: 2
      titles:
        agenda_title: "Architecture"
      description: "Deep dive into system architecture"
      icon: "Boxes"
      target:
        type: "page"
        page_id: "architecture"
      color_theme: "violet"
```
