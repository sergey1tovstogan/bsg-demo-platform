# Medium Card Example - Data Flow Page (Level 2)

```yaml
page:
  id: "data-flow"

  titles:
    page_header: "Data Flow Patterns"
    menu_title: "Data Flow"
    agenda_title: "Data Flow"
    breadcrumb: "Data Flow"

  description:
    short: "Data flow patterns"
    long: "How data moves through the system"

  metadata:
    tags: ["data-flow", "architecture"]
    difficulty: "intermediate"

  parent: "architecture"  # ← Child of architecture page
  icon: "ArrowRightLeft"

sections:
  - type: "hero"
    heading: "Data Flow Patterns"
    subtitle: "Understanding data movement"

  - type: "text"
    content: |
      Data flows through the system following well-defined patterns
      that ensure consistency, performance, and reliability.

  # Step-by-step flow
  - type: "steps"
    orientation: "vertical"
    steps:
      - number: 1
        title: "Request Received"
        description: "API Gateway receives and validates the request"

      - number: 2
        title: "Authentication"
        description: "User credentials are verified and permissions checked"

      - number: 3
        title: "Cache Check"
        description: "Redis cache checked for cached response"

      - number: 4
        title: "Processing"
        description: "If not cached, application services process the request"

      - number: 5
        title: "Database Query"
        description: "Data retrieved from or written to PostgreSQL"

      - number: 6
        title: "Response"
        description: "Result cached and returned to client"

  # Interactive diagram
  - type: "interactive_diagram"
    image: "/images/data-flow-diagram.png"
    hotspots:
      - x: 20
        y: 50
        radius: 50
        click_action:
          type: "show_popup"
          popup_id: "gateway-detail"
        hover_text: "API Gateway"

      - x: 50
        y: 50
        radius: 50
        click_action:
          type: "show_popup"
          popup_id: "cache-detail"
        hover_text: "Cache Layer"

      - x: 80
        y: 50
        radius: 50
        click_action:
          type: "show_popup"
          popup_id: "database-detail"
        hover_text: "Database"

# Popups for diagram hotspots
popups:
  - id: "gateway-detail"
    size: "small"
    title: "API Gateway"
    content: "Validates and routes all incoming requests"
    actions:
      - label: "Close"
        action:
          type: "close_popup"

  - id: "cache-detail"
    size: "small"
    title: "Cache Layer"
    content: "Redis cache for fast data access"
    actions:
      - label: "Close"
        action:
          type: "close_popup"

  - id: "database-detail"
    size: "small"
    title: "Database"
    content: "PostgreSQL for persistent storage"
    actions:
      - label: "Close"
        action:
          type: "close_popup"

navigation:
  show_breadcrumbs: true
  show_back_button: true
  show_page_tree: true
  back_to_agenda_button: true
```
