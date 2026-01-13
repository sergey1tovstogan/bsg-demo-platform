# Medium Card Example - Architecture Page (with sub-pages)

```yaml
page:
  id: "architecture"

  titles:
    page_header: "System Architecture"
    menu_title: "Architecture"
    agenda_title: "System Architecture"
    breadcrumb: "Architecture"

  description:
    short: "Detailed architecture"
    long: "Deep dive into system architecture and design"

  metadata:
    tags: ["architecture", "technical"]
    difficulty: "intermediate"

  parent: null
  icon: "Boxes"

sections:
  - type: "hero"
    heading: "System Architecture"
    subtitle: "How everything fits together"

  - type: "text"
    content: |
      Our architecture follows a layered approach with clear separation
      of concerns and well-defined interfaces between components.

  # Clickable diagram
  - type: "image_clickable"
    src: "/images/architecture-diagram.png"
    alt: "System Architecture Diagram"
    action:
      type: "navigate_to_subpage"
      target: "components"

  # Navigation cards to sub-pages
  - type: "clickable_cards"
    columns: 2
    cards:
      - title: "Components"
        description: "Explore individual components"
        icon: "Box"
        click_action:
          type: "navigate_to_subpage"
          target: "components"

      - title: "Data Flow"
        description: "Understand data flow patterns"
        icon: "ArrowRightLeft"
        click_action:
          type: "navigate_to_subpage"
          target: "data-flow"

  - type: "alert"
    alert_type: "info"
    title: "Explore Sub-Sections"
    content: "Click on the cards above to dive into specific architectural aspects."

# Sub-pages (Level 2)
sub_pages:
  - file: "content/examples/medium-card/pages/architecture/components.md"
  - file: "content/examples/medium-card/pages/architecture/data-flow.md"

navigation:
  show_breadcrumbs: true
  show_page_tree: true
  show_next_previous: true
  back_to_agenda_button: true

  siblings:
    previous: "overview"
    next: null
```
