# Simple Card Example - Agenda

**Example Type:** Simple agenda with 2 items
**Demonstrates:** Basic grid layout with navigation to pages

---

```yaml
agenda:
  title: "Explore Our Product"
  subtitle: "Learn about what we offer"

  # === LAYOUT ===
  layout:
    type: "grid"
    columns: 2
    gap: "large"

  # === ANIMATION ===
  animation:
    type: "stagger-fade-in"
    delay_between_items: "0.1s"

  # === AGENDA ITEMS ===
  items:
    - id: "intro"
      order: 1
      titles:
        agenda_title: "Introduction"
      description: "Learn what makes our product special"
      icon: "BookOpen"
      target:
        type: "page"
        page_id: "intro"
      color_theme: "blue"

    - id: "features"
      order: 2
      titles:
        agenda_title: "Key Features"
      description: "Discover our powerful capabilities"
      icon: "Star"
      target:
        type: "page"
        page_id: "features"
      color_theme: "emerald"
```

---

## What This Demonstrates

✅ **Simple 2-column grid**
✅ **Clear navigation targets**
✅ **Different color themes per item**
✅ **Staggered fade-in animation**
