# Complex Card Example - Layer 1 (Level 3)

```yaml
page:
  id: "layer-1"

  titles:
    page_header: "Layer 1: API Gateway"
    menu_title: "Layer 1"
    agenda_title: "API Gateway Layer"
    breadcrumb: "Layer 1"

  description:
    short: "API Gateway layer"
    long: "API Gateway layer details and components"

  metadata:
    tags: ["architecture", "api", "gateway"]
    difficulty: "advanced"

  parent: "details"  # ← Level 3 (child of details)
  icon: "Globe"

sections:
  - type: "hero"
    heading: "Layer 1: API Gateway"
    subtitle: "Level 3 of 5 - Getting more specific"

  - type: "text"
    content: |
      **Current Location:** Architecture > Details > Layer 1 (Level 3)
      **Breadcrumbs:** Home > Documentation > Architecture > Details > Layer 1

      The API Gateway layer handles all incoming HTTP requests and routes them
      to appropriate backend services.

  - type: "expandable_card"
    trigger: "click_icon"
    icon: "Info"
    collapsed_title: "Gateway Responsibilities"
    collapsed_text: "Click to see what the gateway does..."
    expanded_content: |
      **Key Responsibilities:**
      - Request authentication and authorization
      - Rate limiting and throttling
      - Request/response transformation
      - Load balancing
      - SSL termination
    animation: "slide-down"

  # Navigate to level 4
  - type: "clickable_cards"
    columns: 2
    cards:
      - title: "Component A: Auth Module"
        description: "Authentication and authorization"
        icon: "Shield"
        click_action:
          type: "navigate_to_subpage"
          target: "component-a"

      - title: "Component B: Router"
        description: "Request routing logic"
        icon: "ArrowRightLeft"

  - type: "alert"
    alert_type: "success"
    title: "Continue to Level 4"
    content: "Click 'Component A' to navigate to Level 4, then Level 5!"

# Level 4 page
sub_pages:
  - file: "examples/complex-card/pages/architecture/details/layer-1/component-a.md"

navigation:
  show_breadcrumbs: true
  show_back_button: true
  show_page_tree: true
  back_to_agenda_button: true
```
