# Simple Card Example - Introduction Page

**Page Level:** 1 (top-level)
**Demonstrates:** Basic hero, text, and alert sections

---

```yaml
page:
  id: "intro"

  # === TITLES ===
  titles:
    page_header: "Welcome to Our Product"
    menu_title: "Introduction"
    agenda_title: "Introduction"
    breadcrumb: "Intro"

  # === DESCRIPTIONS ===
  description:
    short: "Product introduction"
    long: "Discover what makes our product unique"

  # === METADATA ===
  metadata:
    author: "Product Team"
    tags: ["introduction", "overview"]
    difficulty: "beginner"
    estimated_time: "3 minutes"

  # === HIERARCHY ===
  parent: null  # Top-level page
  icon: "BookOpen"

# === SECTIONS ===
sections:
  # Hero section
  - type: "hero"
    heading: "Welcome to Our Product"
    subtitle: "The solution you've been looking for"

  # Introduction text
  - type: "text"
    content: |
      Our product helps teams work more efficiently and effectively.

      Built with simplicity in mind, it provides powerful features
      without the complexity of traditional solutions.

  # Key benefits list
  - type: "list"
    list_style: "bullet"
    items:
      - "Easy to use - Get started in minutes"
      - "Powerful features - Everything you need"
      - "Great support - We're here to help"
      - "Affordable pricing - Value for money"

  # Call-out alert
  - type: "alert"
    alert_type: "info"
    title: "New to Our Product?"
    content: "Don't worry! This guide will help you understand the key features."

  # Navigation hint
  - type: "text_with_links"
    content: |
      Ready to explore? Check out our [[Key Features|features]] next!

# === NAVIGATION ===
navigation:
  show_breadcrumbs: true
  show_back_button: false  # First page
  show_next_previous: true
  back_to_agenda_button: true

  siblings:
    previous: null
    next: "features"
```

---

## What This Demonstrates

✅ **Hero section** for clear page heading
✅ **Simple text content**
✅ **Bullet list** for key points
✅ **Info alert** for callouts
✅ **Inline navigation link** to next page
✅ **Navigation configuration**
