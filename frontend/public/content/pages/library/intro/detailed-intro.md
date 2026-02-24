# Library Page: Detailed Introduction

**Library Category:** Introduction Pages
**Audience:** Intermediate users
**Reusable:** Yes
**Used By:** complex-documentation card (and can be reused by others)

---

```yaml
page:
  id: "detailed-intro"

  titles:
    page_header: "Comprehensive Introduction"
    menu_title: "Introduction"
    agenda_title: "Detailed Introduction"
    breadcrumb: "Intro"

  description:
    short: "Comprehensive introduction"
    long: "A detailed introduction suitable for intermediate users"

  metadata:
    author: "Documentation Team"
    version: "1.0"
    last_updated: "2024-12-17"
    tags: ["introduction", "intermediate", "library"]
    difficulty: "intermediate"
    estimated_time: "7 minutes"
    used_by: ["complex-documentation"]  # Track which cards use this

  parent: null  # Library pages don't have parents
  icon: "BookOpen"

sections:
  - type: "hero"
    heading: "Welcome to the Platform"
    subtitle: "A comprehensive introduction for intermediate users"

  - type: "text"
    content: |
      This platform provides a complete solution for modern application
      development, deployment, and management.

      **What makes it unique:**
      - Integrated toolchain for the entire lifecycle
      - Cloud-native architecture from the ground up
      - Enterprise-grade security and compliance
      - Extensive automation capabilities

  - type: "expandable_card"
    trigger: "click_icon"
    icon: "Target"
    collapsed_title: "Platform Goals"
    collapsed_text: "Learn about our core objectives..."
    expanded_content: |
      **Our Core Objectives:**
      1. **Simplify Complexity:** Make complex operations simple
      2. **Accelerate Development:** Reduce time to production
      3. **Ensure Reliability:** 99.99% uptime guarantee
      4. **Enable Scale:** Support growth from startup to enterprise
    animation: "slide-down"

  - type: "feature_grid"
    columns: 3
    features:
      - name: "Developer Experience"
        icon: "Code"
        description: "Tools developers love to use"

      - name: "Operations"
        icon: "Cog"
        description: "Automated ops workflows"

      - name: "Security"
        icon: "Shield"
        description: "Built-in security controls"

  - type: "alert"
    alert_type: "info"
    title: "Reusable Library Page"
    content: "This page is stored in the library and can be reused by multiple cards!"

navigation:
  show_breadcrumbs: true
  show_page_tree: true
  back_to_agenda_button: true
```

---

## Usage

Reference this page from any card:

```yaml
card:
  pages:
    - file: "content/pages/library/intro/detailed-intro.md"
      order: 1
```

## Customization

If you need slight variations, create additional versions:
- `basic-intro.md` for beginners
- `technical-intro.md` for developers
