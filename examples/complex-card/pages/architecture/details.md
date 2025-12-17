# Complex Card Example - Details (Level 2)

```yaml
page:
  id: "details"

  titles:
    page_header: "Architecture Details"
    menu_title: "Details"
    agenda_title: "Detailed Architecture"
    breadcrumb: "Details"

  description:
    short: "Detailed architecture"
    long: "Detailed information about system layers and components"

  metadata:
    tags: ["architecture", "details"]
    difficulty: "advanced"

  parent: "architecture"  # ← Level 2 (child of architecture)
  icon: "FileText"

sections:
  - type: "hero"
    heading: "Architecture Details"
    subtitle: "Level 2 of 5 - Drilling deeper"

  - type: "text"
    content: |
      **Current Location:** Architecture > Details (Level 2)
      **Breadcrumbs:** Home > Documentation > Architecture > Details

      The system is organized into logical layers, each with specific responsibilities.

  # Navigate to level 3
  - type: "feature_grid"
    columns: 3
    features:
      - name: "Layer 1: API"
        icon: "Globe"
        description: "API Gateway and routing"
        click_action:
          type: "navigate_to_subpage"
          target: "layer-1"

      - name: "Layer 2: Services"
        icon: "Server"
        description: "Business logic services"

      - name: "Layer 3: Data"
        icon: "Database"
        description: "Data persistence layer"

  - type: "alert"
    alert_type: "info"
    title: "Navigate Deeper"
    content: "Click 'Layer 1: API' to navigate to Level 3 (and eventually to Level 5!)"

# Level 3 page
sub_pages:
  - file: "examples/complex-card/pages/architecture/details/layer-1.md"

navigation:
  show_breadcrumbs: true
  show_back_button: true
  show_page_tree: true
  back_to_agenda_button: true
```
