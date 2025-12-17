# Medium Card Example - Components Page (Level 2)

```yaml
page:
  id: "components"

  titles:
    page_header: "System Components"
    menu_title: "Components"
    agenda_title: "System Components"
    breadcrumb: "Components"

  description:
    short: "Component details"
    long: "Detailed information about system components"

  metadata:
    tags: ["components", "architecture"]
    difficulty: "intermediate"

  parent: "architecture"  # ← Child of architecture page
  icon: "Box"

sections:
  - type: "hero"
    heading: "System Components"
    subtitle: "Building blocks of the system"

  - type: "text"
    content: |
      Our system consists of several key components, each responsible
      for specific functionality.

  # Component cards
  - type: "card_list"
    items:
      - icon: "Globe"
        title: "API Gateway"
        description: "Entry point for all API requests. Handles authentication, rate limiting, and routing."

      - icon: "Server"
        title: "Application Services"
        description: "Business logic layer processing requests and coordinating operations."

      - icon: "Database"
        title: "Database Layer"
        description: "PostgreSQL for persistent data storage with read replicas for scaling."

      - icon: "Zap"
        title: "Cache Layer"
        description: "Redis cache for high-speed data access and session management."

  # Accordion for detailed specs
  - type: "accordion"
    allow_multiple: false
    items:
      - title: "API Gateway Specifications"
        content: |
          - Technology: Kong Gateway
          - Capacity: 100K requests/second
          - Features: Authentication, rate limiting, request transformation

      - title: "Application Services Specifications"
        content: |
          - Technology: Node.js + Express
          - Deployment: Kubernetes pods (auto-scaling)
          - Instances: 10-100 based on load

      - title: "Database Specifications"
        content: |
          - Technology: PostgreSQL 15
          - Configuration: Primary + 3 read replicas
          - Backup: Continuous WAL archiving

navigation:
  show_breadcrumbs: true
  show_back_button: true
  show_page_tree: true
  back_to_agenda_button: true
```
