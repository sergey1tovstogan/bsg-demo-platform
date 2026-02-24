# Medium Card Example - Overview Page

```yaml
page:
  id: "overview"

  titles:
    page_header: "System Overview"
    menu_title: "Overview"
    agenda_title: "System Overview"
    breadcrumb: "Overview"

  description:
    short: "High-level overview"
    long: "Understand the system at a high level"

  metadata:
    tags: ["overview", "introduction"]
    difficulty: "intermediate"

  parent: null
  icon: "Eye"

sections:
  - type: "hero"
    heading: "System Overview"
    subtitle: "Understanding the big picture"

  - type: "text"
    content: |
      Our system is built on modern architectural principles,
      designed for scalability, reliability, and performance.

  # Expandable section - demonstrates progressive disclosure
  - type: "expandable_card"
    trigger: "click_icon"
    icon: "Info"
    collapsed_title: "System Goals"
    collapsed_text: "Click to learn about our design goals..."
    expanded_content: |
      **Key Design Goals:**
      - **Performance:** Sub-100ms response times
      - **Scalability:** Handle 1M+ requests/second
      - **Reliability:** 99.99% uptime
      - **Security:** Zero-trust architecture
    animation: "slide-down"

  # Feature grid with popup action
  - type: "feature_grid"
    columns: 3
    features:
      - name: "Components"
        icon: "Box"
        description: "Core system components"
        click_action:
          type: "show_popup"
          popup_id: "components-preview"

      - name: "Data Flow"
        icon: "ArrowRightLeft"
        description: "How data flows through the system"
        click_action:
          type: "show_popup"
          popup_id: "data-flow-preview"

      - name: "Security"
        icon: "Shield"
        description: "Security architecture"
        click_action:
          type: "show_popup"
          popup_id: "security-preview"

  - type: "text_with_links"
    content: |
      For detailed information, explore the [[Architecture|architecture]] section.

# Popups for quick reference
popups:
  - id: "components-preview"
    size: "medium"
    title: "Components Overview"
    content: |
      **Main Components:**
      - API Gateway
      - Application Services
      - Database Layer
      - Cache Layer
    actions:
      - label: "View Details"
        action:
          type: "navigate_to_subpage"
          target: "architecture"
      - label: "Close"
        action:
          type: "close_popup"

  - id: "data-flow-preview"
    size: "medium"
    title: "Data Flow Overview"
    content: |
      Data flows through:
      1. API Gateway (authentication)
      2. Application Services (processing)
      3. Database (persistence)
    actions:
      - label: "Close"
        action:
          type: "close_popup"

  - id: "security-preview"
    size: "medium"
    title: "Security Overview"
    content: |
      **Security Layers:**
      - TLS encryption
      - OAuth 2.0 authentication
      - Role-based access control
      - Audit logging
    actions:
      - label: "Close"
        action:
          type: "close_popup"

navigation:
  show_breadcrumbs: true
  show_page_tree: true
  show_next_previous: true
  back_to_agenda_button: true

  siblings:
    previous: null
    next: "architecture"
```
