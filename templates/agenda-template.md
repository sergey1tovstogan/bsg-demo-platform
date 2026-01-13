# Agenda Template

**Purpose:** Landing page that shows all available topics/pages in the card
**Use this for:** Creating the main navigation page for your card
**Related:** card-definition-template.md, page-template.md

---

## Template Structure

```yaml
agenda:
  # === TITLES ===
  title: "Explore [Card Name]"  # Main heading
  subtitle: "Choose a topic to dive deep"  # Supporting text

  # === LAYOUT ===
  layout:
    type: "grid"  # grid, list, carousel, cards
    columns: 3    # For grid layout: 2, 3, or 4 columns
    gap: "large"  # small, medium, large

  # === ANIMATION ===
  animation:
    type: "stagger-fade-in"  # fade-in, slide-in-left, slide-in-right, scale-in, stagger-fade-in
    delay_between_items: "0.1s"  # Time between items (only for stagger-fade-in): "0.05s", "0.1s", "0.2s", "0.5s", "1s" or "50ms", "100ms", etc.

  # === AGENDA ITEMS ===
  # Each item represents a clickable navigation element
  items:
    - id: "unique-item-id"
      order: 1

      # Titles
      titles:
        agenda_title: "Title Shown on Agenda"  # Main title for this item

      # Description
      description: "Brief description of what this topic covers"

      # Icon
      icon: "IconName"  # Lucide icon name

      # Navigation target
      target:
        type: "page"  # page, external_link
        page_id: "target-page-id"  # ID of the page to navigate to (if type is "page")
        url: "https://example.com"  # URL to open (if type is "external_link")

      # Visual (optional)
      image: "/images/optional-image.png"  # Optional image for the item
      color_theme: "blue"  # Optional: blue, emerald, violet, red, amber, indigo, cyan, pink, green, orange, purple, teal
```

---

## Instructions for Content Creators

### Step 1: Define Agenda Header
1. Choose a `title` that welcomes users (e.g., "Explore Security", "Learn Integration")
2. Write a `subtitle` that explains what users can do (e.g., "Choose a topic to dive deep")

### Step 2: Configure Layout
Choose how items should be displayed:

**Grid Layout** (Recommended for 3-9 items):
```yaml
layout:
  type: "grid"
  columns: 3  # 2, 3, or 4
  gap: "large"
```

**List Layout** (Recommended for many items):
```yaml
layout:
  type: "list"
  gap: "medium"
```

**Carousel Layout** (Recommended for featured items):
```yaml
layout:
  type: "carousel"
  gap: "medium"
```

### Step 3: Add Animation (Optional)
Choose entry animation for your agenda grid:

**✅ Implemented Animation Types:**
- `stagger-fade-in` - Items fade in sequentially (recommended for grids)
- `fade-in` - All items fade in together
- `slide-in-left` - Items slide in from left side
- `slide-in-right` - Items slide in from right side
- `scale-in` - Items grow from smaller size

**Configuring Stagger Delay:**
For `stagger-fade-in`, set `delay_between_items`:
- `"0.05s"` - Fast (10+ items)
- `"0.1s"` - Standard (recommended, 5-10 items)
- `"0.2s"` - Moderate (3-5 items)
- `"0.5s"` - Slow (2-3 items)
- `"1s"` - Very slow (dramatic effect)

**Example:**
```yaml
animation:
  type: "stagger-fade-in"
  delay_between_items: "0.15s"  # 150ms between each item
```

### Step 4: Add Agenda Items
For each topic/page in your card:
1. Create an item with unique `id`
2. Set the display order with `order`
3. Write an `agenda_title` (what users see)
4. Write a `description` (what this topic is about)
5. Choose an `icon` from [Lucide Icons](https://lucide.dev)
6. Define where clicking goes (target page or external link)
7. Optionally add an `image`

### Step 5: Test Navigation
1. Save the file
2. Verify all target page IDs match actual page IDs
3. Test that clicking each item navigates correctly

---

## Examples

### Example 1: Simple Grid Agenda (3 items)
```yaml
agenda:
  title: "Explore Getting Started"
  subtitle: "Learn the basics in 3 easy steps"

  layout:
    type: "grid"
    columns: 3
    gap: "large"

  animation:
    type: "stagger-fade-in"
    delay_between_items: "0.1s"

  items:
    - id: "welcome"
      order: 1
      titles:
        agenda_title: "Welcome"
      description: "Introduction to the platform"
      icon: "Home"
      color_theme: "blue"
      target:
        type: "page"
        page_id: "welcome"

    - id: "setup"
      order: 2
      titles:
        agenda_title: "Setup"
      description: "Configure your environment"
      icon: "Settings"
      color_theme: "emerald"
      target:
        type: "page"
        page_id: "setup"

    - id: "first-steps"
      order: 3
      titles:
        agenda_title: "First Steps"
      description: "Create your first project"
      icon: "Rocket"
      color_theme: "orange"
      target:
        type: "page"
        page_id: "first-steps"
```

### Example 2: List Agenda (Many items)
```yaml
agenda:
  title: "Security Topics"
  subtitle: "Comprehensive security guide"

  layout:
    type: "list"
    gap: "medium"

  animation:
    type: "fade-in"  # All items fade in together

  items:
    - id: "authentication"
      order: 1
      titles:
        agenda_title: "Authentication & Authorization"
      description: "User identity and access control"
      icon: "Key"
      target:
        type: "page"
        page_id: "authentication"

    - id: "encryption"
      order: 2
      titles:
        agenda_title: "Data Encryption"
      description: "Protecting sensitive data"
      icon: "Lock"
      target:
        type: "page"
        page_id: "encryption"

    - id: "network-security"
      order: 3
      titles:
        agenda_title: "Network Security"
      description: "Firewalls, VPNs, and secure connections"
      icon: "Shield"
      target:
        type: "page"
        page_id: "network-security"

    - id: "compliance"
      order: 4
      titles:
        agenda_title: "Compliance & Auditing"
      description: "Meeting regulatory requirements"
      icon: "FileCheck"
      target:
        type: "page"
        page_id: "compliance"
```

### Example 3: Agenda with Images and External Links
```yaml
agenda:
  title: "Explore Resources"
  subtitle: "Documentation, tutorials, and external links"

  layout:
    type: "grid"
    columns: 2
    gap: "large"

  animation:
    type: "stagger-fade-in"
    delay_between_items: "0.15s"

  items:
    - id: "internal-docs"
      order: 1
      titles:
        agenda_title: "Internal Documentation"
      description: "Comprehensive guides and references"
      icon: "Book"
      image: "/images/docs-preview.png"
      target:
        type: "page"
        page_id: "documentation"

    - id: "api-reference"
      order: 2
      titles:
        agenda_title: "API Reference"
      description: "External API documentation"
      icon: "Code"
      target:
        type: "external_link"
        url: "https://api.example.com/docs"

    - id: "tutorials"
      order: 3
      titles:
        agenda_title: "Video Tutorials"
      description: "Step-by-step video guides"
      icon: "Video"
      image: "/images/video-preview.png"
      target:
        type: "page"
        page_id: "tutorials"

    - id: "community"
      order: 4
      titles:
        agenda_title: "Community Forum"
      description: "Ask questions and get help"
      icon: "Users"
      target:
        type: "external_link"
        url: "https://community.example.com"
```

### Example 4: Carousel Agenda (Featured Items)
```yaml
agenda:
  title: "Featured Topics"
  subtitle: "Start with these popular topics"

  layout:
    type: "carousel"
    gap: "large"

  animation:
    type: "slide-in-right"

  items:
    - id: "quickstart"
      order: 1
      titles:
        agenda_title: "Quick Start Guide"
      description: "Get up and running in 5 minutes"
      icon: "Zap"
      image: "/images/quickstart.png"
      target:
        type: "page"
        page_id: "quickstart"

    - id: "best-practices"
      order: 2
      titles:
        agenda_title: "Best Practices"
      description: "Learn from experts"
      icon: "Award"
      image: "/images/best-practices.png"
      target:
        type: "page"
        page_id: "best-practices"
```

---

## Validation Checklist

Before finalizing your agenda:

- [ ] `title` and `subtitle` are clear and welcoming
- [ ] Layout `type` is appropriate for number of items
- [ ] Each item has a unique `id`
- [ ] Each item has a clear `agenda_title` and `description`
- [ ] All `icon` names are valid Lucide icons
- [ ] All `page_id` targets match actual page IDs
- [ ] External links (`url`) are valid and accessible
- [ ] Items are in logical order (set by `order` field)
- [ ] Optional images exist at specified paths

---

## Tips

1. **Keep It Simple**: 3-6 items is ideal for grid layout
2. **Clear Titles**: Use concise, action-oriented titles
3. **Helpful Descriptions**: Explain what users will learn
4. **Logical Order**: Order items from beginner to advanced, or by workflow
5. **Consistent Icons**: Choose icons that represent the topic clearly
6. **Test Navigation**: Verify all links work before publishing

---

## Layout Guidance

**When to use Grid:**
- 3-9 items
- Items have similar importance
- Visual browsing is preferred

**When to use List:**
- Many items (10+)
- Items need detailed descriptions
- Sequential reading is expected

**When to use Carousel:**
- Featured or highlighted items
- Limited space
- Visual impact is important

---

**Next Steps:**
1. Create pages referenced in `target.page_id` using `page-template.md`
2. Add images to paths specified in `image` fields
3. Test the agenda navigation in the platform

---

**Note:** All visual styling (card appearance, hover effects, spacing, colors) is defined in `UNIFIED_LAYOUT_SPECIFICATION.md`. This template focuses solely on content and navigation structure.
