# Complex Card Example - Overview (Level 2)

```yaml
page:
  id: "overview"

  titles:
    page_header: "Architecture Overview"
    menu_title: "Overview"
    agenda_title: "Architecture Overview"
    breadcrumb: "Overview"

  description:
    short: "High-level overview"
    long: "High-level view of system architecture"

  metadata:
    tags: ["architecture", "overview"]
    difficulty: "intermediate"

  parent: "architecture"  # ← Level 2 (child of architecture)
  icon: "Eye"

sections:
  - type: "hero"
    heading: "Architecture Overview"
    subtitle: "Level 2 of 5"

  - type: "text"
    content: |
      **Current Location:** Architecture > Overview (Level 2)

      This high-level overview provides context before diving into details.

  - type: "list"
    list_style: "bullet"
    items:
      - "Microservices-based architecture"
      - "Event-driven communication"
      - "Cloud-native deployment"
      - "Container orchestration with Kubernetes"

  - type: "text_with_links"
    content: |
      Ready for more detail? Continue to [[Details|details]].

navigation:
  show_breadcrumbs: true
  show_back_button: true
  show_page_tree: true
  back_to_agenda_button: true
```
