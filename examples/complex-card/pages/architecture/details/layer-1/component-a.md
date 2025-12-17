# Complex Card Example - Component A (Level 4)

```yaml
page:
  id: "component-a"

  titles:
    page_header: "Component A: Authentication Module"
    menu_title: "Component A"
    agenda_title: "Authentication Module"
    breadcrumb: "Component A"

  description:
    short: "Authentication module"
    long: "Authentication and authorization component details"

  metadata:
    tags: ["authentication", "security", "component"]
    difficulty: "expert"

  parent: "layer-1"  # ← Level 4 (child of layer-1)
  icon: "Shield"

sections:
  - type: "hero"
    heading: "Component A: Authentication"
    subtitle: "Level 4 of 5 - Almost there!"

  - type: "text"
    content: |
      **Current Location:** Architecture > Details > Layer 1 > Component A (Level 4)
      **Breadcrumbs:** Home > Documentation > Architecture > Details > Layer 1 > Component A

      The authentication module handles user identity verification and
      session management.

  - type: "steps"
    steps:
      - number: 1
        title: "Receive Credentials"
        description: "Accept username/password or token"

      - number: 2
        title: "Validate"
        description: "Verify against user database"

      - number: 3
        title: "Generate Session"
        description: "Create secure session token"

      - number: 4
        title: "Return Token"
        description: "Send token to client"

  # Navigate to level 5 (deepest level!)
  - type: "text_with_links"
    content: |
      Want to see the actual implementation? Check the
      [[Implementation Details|implementation]] (Level 5!).

  - type: "alert"
    alert_type: "warning"
    title: "Level 4 Navigation"
    content: "Click the link above to reach Level 5 - the deepest level in this example!"

# Level 5 page (deepest!)
sub_pages:
  - file: "examples/complex-card/pages/architecture/details/layer-1/component-a/implementation.md"

navigation:
  show_breadcrumbs: true
  show_back_button: true
  show_page_tree: true
  back_to_agenda_button: true
```
