# Page Template

**Purpose:** Individual content page with sections, sub-pages, and interactive elements
**Use this for:** Creating any page within a card (top-level or nested)
**Related:** card-definition-template.md, subpage-template.md, popup-template.md

---

## Template Structure

```yaml
page:
  # === PAGE IDENTIFICATION ===
  id: "unique-page-id"  # Required. Unique identifier (lowercase, hyphenated)

  # === MULTI-CONTEXT TITLES ===
  # Different titles for different display contexts
  titles:
    page_header: "Full Page Title for Header"  # Shown at top of page
    menu_title: "Menu"  # Shown in navigation menus
    agenda_title: "Agenda Card Title"  # Shown on agenda cards
    breadcrumb: "Short"  # Shown in breadcrumbs

  # === DESCRIPTIONS ===
  description:
    short: "One-line summary"  # For cards and previews
    long: "Detailed explanation of page content"  # For page header area

  # === METADATA (Optional) ===
  metadata:
    author: "Team Name"
    version: "1.0"
    last_updated: "2024-12-16"
    tags: ["tag1", "tag2"]
    difficulty: "beginner"  # beginner, intermediate, advanced, expert
    estimated_time: "5 minutes"

  # === PARENT PAGE (for navigation) ===
  parent: "parent-page-id"  # null or parent page ID

  # === ICON ===
  icon: "IconName"  # Lucide icon for navigation

# === CONTENT SECTIONS ===
sections:
  # Section types define WHAT to show and interaction behavior
  # Visual styling is defined in UNIFIED_LAYOUT_SPECIFICATION.md

  - type: "hero"
    heading: "Main Heading"
    subtitle: "Supporting text"

  - type: "text"
    content: |
      Regular paragraph text.
      Multiple paragraphs supported.

  - type: "image"
    image: "/path/to/image.png"
    alt: "Descriptive alt text"
    caption: "Optional caption"

  # Add more sections as needed (see section types below)

# === SUB-PAGES ===
sub_pages:
  - file: "path/to/subpage1.md"
  - file: "path/to/subpage2.md"

# === POPUPS ===
popups:
  - id: "popup-id"
    size: "large"  # small, medium, large, full-screen
    title: "Popup Title"
    content: "Popup content"

# === NAVIGATION ===
navigation:
  show_breadcrumbs: true
  show_back_button: true
  show_next_previous: true
  back_to_agenda_button: true

  # Siblings (for next/previous navigation)
  siblings:
    previous: "previous-page-id"  # null if first
    next: "next-page-id"  # null if last
```

---

## Common Section Types

### 1. Hero Section
```yaml
- type: "hero"
  heading: "Main Page Heading"
  subtitle: "Supporting subtitle text"
```

### 2. Text Section
```yaml
- type: "text"
  content: |
    Regular paragraph content.
    Supports multiple paragraphs.

    And line breaks.
```

### 3. Image Section
```yaml
- type: "image"
  image: "/images/diagram.png"
  alt: "Descriptive alt text"
  caption: "Optional image caption"
```

### 4. Clickable Image (Navigation)
```yaml
- type: "image_clickable"
  image: "/images/architecture.png"
  alt: "Architecture Diagram"
  click_action:
    type: "navigate_to_subpage"  # or "show_popup", "external_link"
    target: "subpage-id"  # ID of target page/popup
  hover_effect: "zoom"  # optional: zoom, lift, glow
```

### 5. Expandable Section
```yaml
- type: "expandable_section"
  trigger: "click"  # click or hover
  collapsed:
    title: "Click to expand"
    icon: "ChevronDown"
    text: "Preview text..."
  expanded:
    content: |
      Full content that appears when expanded.
      Can include multiple paragraphs.
    animation: "slide-down"  # slide-down, fade-in
  max_height: "400px"  # optional max height when expanded
```

### 6. Expandable Card
```yaml
- type: "expandable_card"
  trigger: "click_icon"  # click, click_icon, click_anywhere
  icon: "Info"
  collapsed_title: "Why This Matters"
  collapsed_text: "Click to learn more..."
  expanded_content: |
    Detailed explanation that appears with animation.
    Multiple paragraphs supported.
  animation: "slide-down"
```

### 7. Feature Grid (Clickable Cards)
```yaml
- type: "feature_grid"
  columns: 3  # 2, 3, or 4
  features:
    - name: "Feature Name"
      icon: "Key"
      description: "Feature description"
      click_action:
        type: "navigate_to_subpage"
        target: "feature-detail-page"

    - name: "Another Feature"
      icon: "Lock"
      description: "Another description"
      click_action:
        type: "show_popup"
        popup_id: "popup-feature-detail"
```

### 8. Clickable Cards
```yaml
- type: "clickable_cards"
  columns: 3
  cards:
    - title: "Card Title"
      description: "Card description"
      icon: "Icon"
      click_action:
        type: "navigate_to_subpage"
        target: "subpage-id"
```

### 9. Text with Inline Navigation Links
```yaml
- type: "text_with_links"
  content: |
    Learn about [[Architecture|architecture-page]] or
    explore [[Best Practices|best-practices-page]].
    External links work too: [[Google|https://google.com]]
  # [[Display Text|target-page-id-or-url]] syntax
```

### 10. Tabbed Content
```yaml
- type: "tabbed_content"
  tabs:
    - label: "Overview"
      target_type: "inline_content"
      content: "Overview text content..."

    - label: "Details"
      target_type: "subpage"
      target: "details-subpage-id"

    - label: "API Docs"
      target_type: "external_link"
      url: "https://api.example.com/docs"
```

### 11. Code Block
```yaml
- type: "code_block"
  language: "yaml"  # yaml, javascript, python, etc.
  code: |
    card:
      id: "example"
      name: "Example Card"
```

### 12. List
```yaml
- type: "list"
  list_style: "bullet"  # bullet, numbered, checklist
  items:
    - "First item"
    - "Second item"
    - "Third item"
```

### 13. Comparison Grid
```yaml
- type: "comparison_grid"
  columns: 2
  items:
    - heading: "Option A"
      points:
        - "Feature 1"
        - "Feature 2"

    - heading: "Option B"
      points:
        - "Feature X"
        - "Feature Y"
```

### 14. Interactive Diagram
```yaml
- type: "interactive_diagram"
  image: "/images/architecture-diagram.png"
  hotspots:
    - x: 100  # X coordinate
      y: 150  # Y coordinate
      radius: 30
      click_action:
        type: "show_popup"
        popup_id: "component-detail"
      hover_text: "Click to learn more"
```

### 15. Video
```yaml
- type: "video"
  video_url: "https://youtube.com/embed/video-id"
  caption: "Optional video caption"
```

### 16. Alert/Callout
```yaml
- type: "alert"
  alert_type: "info"  # info, success, warning, error
  title: "Important Information"
  content: "Alert message content"
```

---

## Complete Example: Complex Page

```yaml
page:
  id: "saas-security-services"

  titles:
    page_header: "SaaS Security Services: Complete Guide"
    menu_title: "SaaS Services"
    agenda_title: "SaaS Security Services"
    breadcrumb: "SaaS"

  description:
    short: "Cloud security services overview"
    long: "Comprehensive guide to Temenos SaaS security offerings"

  metadata:
    author: "Security Team"
    version: "2.1"
    last_updated: "2024-12-16"
    tags: ["security", "saas", "cloud"]
    difficulty: "intermediate"
    estimated_time: "10 minutes"

  parent: "security-overview"
  icon: "Cloud"

sections:
  # Hero section
  - type: "hero"
    heading: "SaaS Security Services"
    subtitle: "Enterprise-grade cloud security"

  # Introduction text
  - type: "text"
    content: |
      Our SaaS security services provide comprehensive protection
      for your cloud-based applications and data.

  # Clickable architecture diagram
  - type: "image_clickable"
    image: "/images/security-architecture.png"
    alt: "Security Architecture Diagram"
    click_action:
      type: "navigate_to_subpage"
      target: "architecture-detail"
    hover_effect: "zoom"

  # Expandable "Why it matters"
  - type: "expandable_card"
    trigger: "click_icon"
    icon: "Info"
    collapsed_title: "Why SaaS Security Matters"
    collapsed_text: "Click to learn more..."
    expanded_content: |
      SaaS security is critical because...
      - Protects sensitive data
      - Ensures compliance
      - Prevents unauthorized access
    animation: "slide-down"

  # Feature grid (navigates to sub-pages)
  - type: "feature_grid"
    columns: 3
    features:
      - name: "Identity & Access"
        icon: "Key"
        description: "Manage user access and permissions"
        click_action:
          type: "navigate_to_subpage"
          target: "identity-access"

      - name: "Data Protection"
        icon: "Lock"
        description: "Encrypt sensitive data"
        click_action:
          type: "show_popup"
          popup_id: "popup-data-protection"

      - name: "Network Security"
        icon: "Shield"
        description: "Secure network communications"
        click_action:
          type: "navigate_to_subpage"
          target: "network-security"

  # Text with navigation links
  - type: "text_with_links"
    content: |
      Learn about our [[architecture|architecture-detail]]
      or explore [[best practices|best-practices]].

  # Alert callout
  - type: "alert"
    alert_type: "info"
    title: "Getting Started"
    content: "New to SaaS security? Start with the basics in our introduction page."

sub_pages:
  - file: "pages/saas-services/identity-access.md"
  - file: "pages/saas-services/data-protection.md"
  - file: "pages/saas-services/network-security.md"
  - file: "pages/saas-services/architecture-detail.md"
  - file: "pages/saas-services/best-practices.md"

popups:
  - id: "popup-data-protection"
    size: "large"
    title: "Data Protection Deep Dive"
    content: |
      Data protection includes:
      - Encryption at rest
      - Encryption in transit
      - Key management
      - Access controls
    actions:
      - label: "Go to Full Page"
        action:
          type: "navigate_to_subpage"
          target: "data-protection"
      - label: "Close"
        action:
          type: "close_popup"

navigation:
  show_breadcrumbs: true
  show_back_button: true
  show_next_previous: true
  back_to_agenda_button: true

  siblings:
    previous: "introduction"
    next: "architecture"
```

---

## Validation Checklist

Before finalizing your page:

- [ ] `id` is unique across all pages
- [ ] All title variants are provided
- [ ] `parent` matches actual parent page ID (or null for top-level)
- [ ] All section types are valid
- [ ] All `click_action` targets exist
- [ ] All `icon` names are valid Lucide icons
- [ ] All image paths are correct
- [ ] All sub-page files exist
- [ ] All popup IDs are unique
- [ ] Navigation siblings are correct
- [ ] Metadata is complete

---

## Tips

1. **Start with Hero**: Begin pages with a hero section for clear heading
2. **Mix Section Types**: Combine text, images, and interactive elements
3. **Use Expandables**: Hide detailed content behind expandable sections
4. **Navigation Links**: Use text_with_links for inline navigation
5. **Test Interactions**: Verify all click actions work correctly
6. **Logical Flow**: Order sections from overview to details
7. **Consistent Icons**: Use meaningful icons that match content

---

## Navigation Behavior

**Breadcrumbs** are automatically generated from:
- Page `breadcrumb` titles
- Parent-child relationships

**Back Button** navigates to `parent` page

**Next/Previous** uses `siblings` configuration

**Back to Agenda** always available (returns to card's agenda)

---

**Next Steps:**
1. Create sub-pages using `subpage-template.md` or this template
2. Add images to specified paths
3. Test all navigation and interactions
4. Verify page appears in navigation tree

---

**Note:** All visual styling (layouts, colors, typography, spacing, animations) is defined in `UNIFIED_LAYOUT_SPECIFICATION.md`. This template focuses solely on content structure and interaction behavior.
