# Complex Card Example - Architecture (Level 1)

```yaml
page:
  id: "architecture"

  titles:
    page_header: "System Architecture Documentation"
    menu_title: "Architecture"
    agenda_title: "System Architecture"
    breadcrumb: "Architecture"

  description:
    short: "Complete architecture documentation"
    long: "Navigate through 5 levels of detailed architecture information"

  metadata:
    author: "Architecture Team"
    tags: ["architecture", "documentation", "advanced"]
    difficulty: "advanced"
    estimated_time: "25 minutes"

  parent: null  # Level 1 (top-level)
  icon: "Boxes"

sections:
  - type: "hero"
    heading: "System Architecture"
    subtitle: "Navigate through 5 levels of detail"

  - type: "text"
    content: |
      This architecture documentation is organized into multiple levels,
      allowing you to drill down from high-level overview to implementation details.

  - type: "alert"
    alert_type: "info"
    title: "5-Level Navigation Example"
    content: "This section demonstrates navigation up to 5 levels deep. Use the page tree to see the full hierarchy!"

  # Navigate to level 2
  - type: "clickable_cards"
    columns: 2
    cards:
      - title: "Overview"
        description: "High-level architecture overview"
        icon: "Eye"
        click_action:
          type: "navigate_to_subpage"
          target: "overview"

      - title: "Details"
        description: "Detailed component information"
        icon: "FileText"
        click_action:
          type: "navigate_to_subpage"
          target: "details"

# Level 2 pages
sub_pages:
  - file: "content/examples/complex-card/pages/architecture/overview.md"
  - file: "content/examples/complex-card/pages/architecture/details.md"

navigation:
  show_breadcrumbs: true
  show_page_tree: true
  show_next_previous: true
  back_to_agenda_button: true
```
