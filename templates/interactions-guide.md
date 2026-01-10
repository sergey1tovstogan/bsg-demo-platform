# Interactions Guide: Click Actions, Animations, and Popups

**Purpose:** Learn how to add interactive elements using only YAML
**Goal:** Demonstrate that all interactions are defined in MD, no React code needed
**Related:** section-types-reference.md, animations-reference.md, popup-template.md

---

## Overview

Make your content interactive with clicks, animations, and popups - **all configured in YAML**.

**What you'll learn:**
- Click actions (navigate, show popup, expand)
- Expandable content (accordions, collapsible sections)
- Popups and modals
- Hover effects
- Inline animations

**Zero React code required!** Pure YAML configuration.

---

## Core Principle

**Interactions = WHAT happens, not HOW it looks**

```yaml
# You define WHAT
click_action:
  type: "navigate_to_subpage"  # ← What happens
  target: "security-page"      # ← Where to go

# UNIFIED_LAYOUT_SPECIFICATION defines HOW
# - Transition animation
# - Button styling
# - Visual effects
```

---

## Click Actions

### 1. Navigate to Sub-Page

**Most common interaction:** Click to go to another page.

```yaml
sections:
  - type: "feature_grid"
    columns: 3
    features:
      - name: "Security Features"
        icon: "Shield"
        description: "Explore security"
        click_action:
          type: "navigate_to_subpage"
          target: "security-features"  # ← Page ID
```

**What happens:**
1. User clicks the card
2. Navigation to `security-features` page
3. Breadcrumbs update automatically
4. Page tree highlights new page

**No code needed!**

---

### 2. Show Popup

**Display additional info** without navigating away.

```yaml
sections:
  - type: "feature_grid"
    features:
      - name: "Quick Info"
        icon: "Info"
        description: "Click for details"
        click_action:
          type: "show_popup"
          popup_id: "quick-info-popup"  # ← Popup ID

# Define the popup
popups:
  - id: "quick-info-popup"
    size: "medium"
    title: "Quick Information"
    content: "This is additional detail shown in a popup."
    actions:
      - label: "Close"
        action:
          type: "close_popup"
```

**What happens:**
1. User clicks card
2. Popup appears with overlay
3. User can read content
4. Click "Close" to dismiss

---

### 3. External Link

**Navigate to external URL**.

```yaml
sections:
  - type: "clickable_cards"
    cards:
      - title: "Documentation"
        description: "Full API docs"
        icon: "ExternalLink"
        click_action:
          type: "external_link"
          target: "https://api.example.com/docs"
          open_in_new_tab: true  # Optional
```

**What happens:**
- Opens URL in new tab (or same tab)
- External link indicator shown

---

### 4. Expand Inline Content

**Reveal content** with animation.

```yaml
sections:
  - type: "expandable_card"
    trigger: "click_icon"
    icon: "ChevronDown"
    collapsed_title: "Why This Matters"
    collapsed_text: "Click to learn more..."
    expanded_content: |
      Here's the detailed explanation that appears
      when the user clicks the icon.

      - Point 1
      - Point 2
      - Point 3
    animation: "slide-down"
```

**What happens:**
1. Initial state: Collapsed
2. User clicks icon
3. Content slides down smoothly
4. Click again to collapse

---

## Clickable Elements

### Images

**Make images clickable:**

```yaml
sections:
  - type: "image_clickable"
    image: "/images/architecture-diagram.png"
    alt: "Architecture Diagram"
    click_action:
      type: "navigate_to_subpage"
      target: "architecture-detail"
    hover_effect: "zoom"  # ← Visual feedback
```

**Hover effects:**
- `zoom` - Slight enlargement
- `lift` - Rises with shadow
- `glow` - Subtle glow
- `border` - Border highlights

---

### Text Links

**Clickable text with inline navigation:**

```yaml
sections:
  - type: "text_with_links"
    content: |
      Learn about [[Security Basics|security-basics]]
      or explore [[Advanced Topics|advanced-topics]].

      External link: [[Documentation|https://docs.example.com]]
```

**Syntax:** `[[Display Text|target]]`

**Targets can be:**
- Page ID: `security-basics`
- External URL: `https://example.com`
- Popup: `popup:popup-id`

---

### Feature Grids

**Most common clickable pattern:**

```yaml
sections:
  - type: "feature_grid"
    columns: 3
    features:
      - name: "Feature A"
        icon: "Zap"
        description: "Fast and efficient"
        click_action:
          type: "navigate_to_subpage"
          target: "feature-a"

      - name: "Feature B"
        icon: "Shield"
        description: "Secure and reliable"
        click_action:
          type: "show_popup"
          popup_id: "feature-b-popup"

      - name: "Feature C"
        icon: "Link"
        description: "Read more"
        click_action:
          type: "external_link"
          target: "https://example.com/feature-c"
```

**Each card can have different action!**

---

## Expandable Content

### Pattern 1: Expandable Card

**Single collapsible section:**

```yaml
sections:
  - type: "expandable_card"
    trigger: "click_icon"  # click, click_icon, click_anywhere
    icon: "Info"
    collapsed_title: "Additional Information"
    collapsed_text: "Click to expand..."
    expanded_content: |
      This content appears when expanded.

      You can include:
      - Lists
      - **Bold text**
      - Multiple paragraphs
    animation: "slide-down"
```

**Trigger options:**
- `click` - Click title to expand
- `click_icon` - Click only icon
- `click_anywhere` - Click anywhere on card

---

### Pattern 2: Expandable Section

**Larger collapsible sections:**

```yaml
sections:
  - type: "expandable_section"
    trigger: "click"
    collapsed:
      title: "Advanced Configuration"
      icon: "Settings"
      text: "Optional preview text..."
    expanded:
      content: |
        # Advanced Settings

        Here's the full content...
      animation: "slide-down"
    max_height: "400px"  # Optional scroll if too long
```

---

### Pattern 3: Accordion

**Multiple sections, only one open:**

```yaml
sections:
  - type: "accordion"
    allow_multiple: false  # Only one open at a time
    items:
      - title: "Question 1: What is security?"
        content: |
          Security is the practice of protecting systems...

      - title: "Question 2: Why is it important?"
        content: |
          Security is critical because...

      - title: "Question 3: How do I get started?"
        content: |
          Start by understanding the basics...
```

**Perfect for FAQs!**

---

## Popups and Modals

### Simple Popup

```yaml
# Trigger
sections:
  - type: "clickable_cards"
    cards:
      - title: "Learn More"
        click_action:
          type: "show_popup"
          popup_id: "learn-more"

# Define popup
popups:
  - id: "learn-more"
    size: "medium"  # small, medium, large, full-screen
    title: "More Information"
    content: |
      This is a simple popup with text content.

      It can include markdown formatting.
    actions:
      - label: "Close"
        action:
          type: "close_popup"
```

---

### Advanced Popup with Sections

```yaml
popups:
  - id: "advanced-popup"
    size: "large"
    title: "Feature Details"
    animation: "scale-in"  # Popup entrance animation

    sections:
      # Text section
      - type: "text"
        content: "Detailed explanation..."

      # Image
      - type: "image"
        src: "/images/feature-diagram.png"
        alt: "Feature Diagram"

      # Code example
      - type: "code_block"
        language: "yaml"
        code: |
          example:
            setting: "value"

      # List
      - type: "list"
        list_style: "bullet"
        items:
          - "Benefit 1"
          - "Benefit 2"

    # Multiple action buttons
    actions:
      - label: "View Full Page"
        action:
          type: "navigate_to_subpage"
          target: "feature-detail-page"

      - label: "Close"
        action:
          type: "close_popup"
```

---

## Interactive Diagrams

### Hotspot Clicking

**Click specific areas of an image with invisible hotspots:**

```yaml
sections:
  - type: "interactive_diagram"
    image: "/images/architecture.png"
    hotspots:
      # API Gateway hotspot (left side)
      - x: 20              # X coordinate (percentage: 0-100)
        y: 50              # Y coordinate (percentage: 0-100)
        radius: 50         # Click area radius (pixels)
        click_action:
          type: "show_popup"
          popup_id: "api-gateway-detail"
        hover_text: "API Gateway - Click to learn more"

      # Database hotspot (center)
      - x: 50
        y: 50
        radius: 50
        click_action:
          type: "navigate_to_subpage"
          target: "database-architecture"
        hover_text: "Database Layer"

      # External service hotspot (right side)
      - x: 80
        y: 50
        radius: 50
        click_action:
          type: "external_link"
          target: "https://partner-service.com"
          open_in_new_tab: true
        hover_text: "Partner Service"
```

**IMPORTANT: Coordinate System**
- `x` and `y` are **percentages** (0-100), not pixels
- `x: 0` = far left, `x: 100` = far right
- `y: 0` = top, `y: 100` = bottom
- `radius` is in **pixels** (typically 30-60 for good UX)
- Hotspots are **invisible** - users discover them by hovering
- Cursor changes to pointer when hovering over hotspots

**How to find coordinates:**
1. Open image in browser or design tool
2. Note the position as a percentage of width/height
   - Element at left third: x ≈ 33
   - Element at center: x = 50, y = 50
   - Element at right quarter: x ≈ 75
3. Test and adjust coordinates in the browser
4. Use generous radius (50-60px) to make hotspots easy to find

---

## Tabbed Content

### Navigate Between Tabs

```yaml
sections:
  - type: "tabbed_content"
    tabs:
      # Inline content (no navigation)
      - label: "Overview"
        target_type: "inline_content"
        content: |
          This content shows without navigation.

      # Navigate to sub-page
      - label: "Details"
        target_type: "subpage"
        target: "details-page-id"

      # External link
      - label: "API Docs"
        target_type: "external_link"
        url: "https://api.example.com"
```

**Target types:**
- `inline_content` - Show content directly
- `subpage` - Navigate to page
- `external_link` - Open URL

---

## Hover Effects

### On Images

```yaml
sections:
  - type: "image_clickable"
    image: "/images/product.png"
    hover_effect: "zoom"  # zoom, lift, glow, border, brightness
    click_action:
      type: "navigate_to_subpage"
      target: "product-detail"
```

### On Cards

```yaml
sections:
  - type: "feature_grid"
    features:
      - name: "Feature"
        icon: "Star"
        description: "Description"
        hover_effect: "lift"  # Rises with shadow
```

### On Buttons

**Automatic!** Buttons have built-in hover effects from UNIFIED_LAYOUT_SPECIFICATION.

---

## Complete Interactive Page Example

```yaml
page:
  id: "interactive-demo"

  titles:
    page_header: "Interactive Features Demo"
    menu_title: "Interactive Demo"
    agenda_title: "Interactive Demo"
    breadcrumb: "Demo"

  parent: null
  icon: "Sparkles"

sections:
  # Hero
  - type: "hero"
    heading: "Explore Interactive Features"
    subtitle: "Click, expand, and discover"

  # Clickable image
  - type: "image_clickable"
    image: "/images/architecture.png"
    alt: "System Architecture"
    click_action:
      type: "navigate_to_subpage"
      target: "architecture-detail"
    hover_effect: "zoom"

  # Expandable card
  - type: "expandable_card"
    trigger: "click_icon"
    icon: "Info"
    collapsed_title: "Why This Architecture?"
    collapsed_text: "Click to learn more..."
    expanded_content: |
      This architecture was chosen because:
      - **Scalable:** Handles millions of requests
      - **Secure:** Multiple layers of protection
      - **Flexible:** Easy to extend and modify
    animation: "slide-down"

  # Feature grid with different actions
  - type: "feature_grid"
    columns: 3
    features:
      # Navigate to page
      - name: "Components"
        icon: "Box"
        description: "Explore system components"
        click_action:
          type: "navigate_to_subpage"
          target: "components"

      # Show popup
      - name: "Quick Guide"
        icon: "BookOpen"
        description: "5-minute overview"
        click_action:
          type: "show_popup"
          popup_id: "quick-guide"

      # External link
      - name: "Full Docs"
        icon: "ExternalLink"
        description: "Complete documentation"
        click_action:
          type: "external_link"
          target: "https://docs.example.com"
          open_in_new_tab: true

  # Accordion FAQ
  - type: "accordion"
    allow_multiple: false
    items:
      - title: "How do I get started?"
        content: "Follow the quick start guide..."

      - title: "What are the requirements?"
        content: "You need Node.js 18+ and..."

      - title: "Where can I get help?"
        content: "Visit our community forum..."

  # Interactive diagram
  - type: "interactive_diagram"
    image: "/images/flow-diagram.png"
    hotspots:
      - x: 25              # Left side (25% from left)
        y: 50              # Middle vertically
        radius: 50
        click_action:
          type: "show_popup"
          popup_id: "step-1-detail"
        hover_text: "Step 1: Authentication"

      - x: 75              # Right side (75% from left)
        y: 50              # Middle vertically
        radius: 50
        click_action:
          type: "show_popup"
          popup_id: "step-2-detail"
        hover_text: "Step 2: Processing"

  # Text with links
  - type: "text_with_links"
    content: |
      Ready to dive deeper? Explore [[Components|components]]
      or check out [[Best Practices|best-practices]].

# Sub-pages
sub_pages:
  - file: "pages/interactive-demo/components.md"
  - file: "pages/interactive-demo/best-practices.md"

# Popups
popups:
  - id: "quick-guide"
    size: "large"
    title: "5-Minute Quick Start"
    sections:
      - type: "steps"
        steps:
          - number: 1
            title: "Install"
            description: "npm install package"
          - number: 2
            title: "Configure"
            description: "Update config file"
          - number: 3
            title: "Run"
            description: "npm start"
    actions:
      - label: "View Full Guide"
        action:
          type: "navigate_to_subpage"
          target: "full-guide"
      - label: "Close"
        action:
          type: "close_popup"

  - id: "step-1-detail"
    size: "medium"
    title: "Step 1: Authentication"
    content: |
      The authentication step verifies user credentials...
    actions:
      - label: "Close"
        action:
          type: "close_popup"

  - id: "step-2-detail"
    size: "medium"
    title: "Step 2: Processing"
    content: |
      After authentication, the request is processed...
    actions:
      - label: "Close"
        action:
          type: "close_popup"

navigation:
  show_breadcrumbs: true
  show_page_tree: true
  back_to_agenda_button: true
```

---

## Animation Options

### Entry Animations

**Applied when page/element loads:**

```yaml
settings:
  default_animation: "fade-in"  # fade-in, slide-in-up, scale-in, etc.
```

**See animations-reference.md for all options.**

### Expansion Animations

**Applied when content expands:**

```yaml
- type: "expandable_card"
  expanded:
    animation: "slide-down"  # slide-down, fade-in, scale-expand
```

### Popup Animations

**Applied when popup appears:**

```yaml
popups:
  - id: "my-popup"
    animation: "scale-in"  # fade-in, slide-in-right, scale-in
```

---

## Best Practices

### 1. Provide Visual Feedback

**Always use hover effects on clickable elements:**

```yaml
# Good
- type: "image_clickable"
  hover_effect: "zoom"  # ← User knows it's clickable

# Avoid
- type: "image_clickable"
  # No hover effect - user might not realize it's clickable
```

### 2. Don't Overuse Popups

**Good:**
- Quick reference information
- Definitions or tooltips
- Preview before navigating

**Avoid:**
- Long form content (use pages instead)
- Multiple nested popups
- Critical information (use regular sections)

### 3. Progressive Disclosure

**Hide complexity until needed:**

```yaml
# Show overview first
- type: "text"
  content: "Here's a simple explanation..."

# Detailed info in expandable
- type: "expandable_card"
  collapsed_title: "Advanced Details"
  expanded_content: "Complex technical information..."
```

### 4. Consistent Interactions

**Same type of content, same interaction:**

```yaml
# Good - all features navigate same way
- type: "feature_grid"
  features:
    - name: "Feature A"
      click_action:
        type: "navigate_to_subpage"
    - name: "Feature B"
      click_action:
        type: "navigate_to_subpage"  # ← Consistent

# Avoid - inconsistent interactions confuse users
    - name: "Feature C"
      click_action:
        type: "show_popup"  # ← Different! Why?
```

### 5. Provide Escape Hatches

**Always allow users to close/go back:**

```yaml
popups:
  - id: "my-popup"
    actions:
      - label: "Close"  # ← Always provide!
        action:
          type: "close_popup"

      # Optional: navigation
      - label: "View Full Page"
        action:
          type: "navigate_to_subpage"
          target: "detail-page"
```

---

## Common Patterns

### Pattern 1: Drill-Down Navigation

**Overview → Summary → Detail:**

```yaml
# Level 1: Overview page with feature grid
sections:
  - type: "feature_grid"
    features:
      - name: "Feature A"
        click_action:
          type: "navigate_to_subpage"  # → Level 2
          target: "feature-a-summary"

# Level 2: Summary page with expandables
sections:
  - type: "expandable_card"
    collapsed_title: "Technical Details"
    expanded_content: "..."

  - type: "text_with_links"
    content: "See [[full documentation|feature-a-detail]]"  # → Level 3

# Level 3: Detail page
```

### Pattern 2: Quick Preview

**Popup for preview, link to full page:**

```yaml
sections:
  - type: "clickable_cards"
    cards:
      - title: "Security Features"
        description: "Click for preview"
        click_action:
          type: "show_popup"
          popup_id: "security-preview"

popups:
  - id: "security-preview"
    title: "Security Features Preview"
    content: "Quick overview..."
    actions:
      - label: "View Full Details"  # ← Navigate to full page
        action:
          type: "navigate_to_subpage"
          target: "security-full"
      - label: "Close"
        action:
          type: "close_popup"
```

### Pattern 3: Interactive Tutorial

**Guide users through steps:**

```yaml
sections:
  # Step 1
  - type: "expandable_card"
    collapsed_title: "Step 1: Setup"
    expanded_content: |
      Instructions for step 1...

      [[Continue to Step 2|step-2]]

# Each step is expandable
# Links navigate to next step
```

---

## Troubleshooting

### Issue: Click doesn't work

**Check:**
- Target page/popup exists
- IDs match exactly (case-sensitive)
- `click_action` is properly formatted

### Issue: Popup doesn't appear

**Check:**
- Popup `id` matches `popup_id` in click action
- Popup is defined in same page or globally
- No YAML syntax errors

### Issue: Expansion doesn't animate

**Check:**
- `animation` field is set
- Animation name is valid (see animations-reference.md)
- UNIFIED_LAYOUT_SPECIFICATION supports that animation

### Issue: Hover effect not showing

**Check:**
- `hover_effect` is set
- Element type supports hover effects
- Effect name is valid

---

## Quick Reference

### Click Actions

```yaml
# Navigate
click_action:
  type: "navigate_to_subpage"
  target: "page-id"

# Popup
click_action:
  type: "show_popup"
  popup_id: "popup-id"

# External
click_action:
  type: "external_link"
  target: "https://example.com"
  open_in_new_tab: true
```

### Expandable

```yaml
- type: "expandable_card"
  trigger: "click_icon"
  icon: "ChevronDown"
  collapsed_title: "Title"
  expanded_content: "Content"
  animation: "slide-down"
```

### Popup

```yaml
popups:
  - id: "popup-id"
    size: "medium"
    title: "Title"
    content: "Content"
    actions:
      - label: "Close"
        action:
          type: "close_popup"
```

---

## Remember

**All interactions defined in YAML:**
✅ No React code
✅ No JavaScript
✅ Just configuration

**Visual effects from UNIFIED_LAYOUT_SPECIFICATION:**
✅ Consistent styling
✅ Professional animations
✅ Accessible interactions

---

**Last Updated:** December 16, 2024
**Version:** 1.0

**Congratulations!** You can now create fully interactive content using only YAML configuration!
