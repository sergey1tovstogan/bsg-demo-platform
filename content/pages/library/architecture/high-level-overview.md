# Library Page: High-Level Architecture Overview

**Library Category:** Architecture Pages
**Audience:** Executives / Non-technical stakeholders
**Reusable:** Yes

---

```yaml
page:
  id: "high-level-architecture"

  titles:
    page_header: "Architecture Overview"
    menu_title: "Architecture"
    agenda_title: "Architecture Overview"
    breadcrumb: "Architecture"

  description:
    short: "High-level architecture"
    long: "Executive-level architecture overview"

  metadata:
    author: "Architecture Team"
    version: "1.0"
    last_updated: "2024-12-17"
    tags: ["architecture", "overview", "beginner", "library"]
    difficulty: "beginner"
    estimated_time: "5 minutes"

  parent: null
  icon: "Boxes"

sections:
  - type: "hero"
    heading: "System Architecture"
    subtitle: "How our platform is built"

  - type: "text"
    content: |
      Our platform uses a modern, scalable architecture designed to
      handle millions of users while remaining easy to maintain and extend.

  - type: "image"
    image: "/images/architecture-simple.png"
    alt: "Simple Architecture Diagram"
    caption: "High-level system architecture"

  - type: "feature_grid"
    columns: 3
    features:
      - name: "Cloud-Based"
        icon: "Cloud"
        description: "Runs in the cloud for reliability and scale"

      - name: "Secure"
        icon: "Shield"
        description: "Multiple layers of security protection"

      - name: "Scalable"
        icon: "TrendingUp"
        description: "Grows automatically with demand"

  - type: "list"
    list_style: "bullet"
    items:
      - "99.99% uptime guarantee"
      - "Automatic backups every hour"
      - "Global CDN for fast performance"
      - "24/7 monitoring and alerts"

navigation:
  show_breadcrumbs: true
  show_page_tree: true
  back_to_agenda_button: true
```
