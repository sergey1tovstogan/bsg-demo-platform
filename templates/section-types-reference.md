# Section Types Reference

**Purpose:** Complete reference for all available section types in the Content Template System
**Use this for:** Finding the right section type for your content needs
**Related:** page-template.md, interactions-guide.md

---

## Overview

Section types define **WHAT to show** and **how users interact** with content. All visual styling (colors, fonts, spacing) is handled by `UNIFIED_LAYOUT_SPECIFICATION.md`.

This reference contains **30+ section types** organized by purpose:
- Content Display (text, images, video)
- Navigation & Interaction (clickable elements, links)
- Data Presentation (grids, comparisons, lists)
- Expandable Content (accordions, collapsible sections)
- Special Elements (code blocks, alerts, diagrams)

---

## Quick Reference Table

| Section Type | Purpose | Interactive? | Navigation? |
|--------------|---------|--------------|-------------|
| hero | Page header with title/subtitle | No | No |
| text | Regular paragraph content | No | No |
| text_with_links | Paragraph with inline navigation | Yes | Yes |
| image | Static image | No | No |
| image_clickable | Image that navigates on click | Yes | Yes |
| video | Embedded video player | Yes | No |
| code_block | Syntax-highlighted code | No | No |
| list | Bullet/numbered/checklist | No | No |
| alert | Callout boxes (info/warning/error) | No | No |
| feature_grid | Grid of clickable feature cards | Yes | Yes |
| clickable_cards | Grid of navigation cards | Yes | Yes |
| comparison_grid | Side-by-side comparison | No | No |
| expandable_section | Collapsible content block | Yes | No |
| expandable_card | Card that expands on click | Yes | No |
| tabbed_content | Tabbed interface | Yes | Yes |
| interactive_diagram | Clickable image hotspots | Yes | Yes |
| steps | Numbered step-by-step guide | No | No |
| timeline | Chronological events | No | No |
| key_value_pairs | Label-value data display | No | No |
| quote | Blockquote with attribution | No | No |
| divider | Visual section separator | No | No |

---

## Content Display Sections

### 1. Hero Section

Large heading and subtitle for page headers.

```yaml
- type: "hero"
  heading: "Main Page Heading"
  subtitle: "Supporting subtitle text"
  align: "left"  # left, center, right (optional, default: left)
```

**When to use:**
- Start of every page for clear page title
- Landing sections for important announcements
- Section headers for major topics

**Example:**
```yaml
- type: "hero"
  heading: "Welcome to Security Services"
  subtitle: "Enterprise-grade protection for your cloud applications"
```

---

### 2. Text Section

Regular paragraph content with markdown support.

```yaml
- type: "text"
  content: |
    Regular paragraph text.

    Multiple paragraphs supported with blank lines.

    **Bold**, *italic*, and other markdown formatting works.
  align: "left"  # left, center, right, justify (optional)
```

**When to use:**
- Explanatory content
- Descriptions and documentation
- General information

**Markdown supported:**
- **Bold**: `**text**`
- *Italic*: `*text*`
- Lists (bullets, numbers)
- Headers: `### Heading`
- Links: `[text](url)`

---

### 3. Text with Inline Navigation Links

Paragraph with special navigation link syntax.

```yaml
- type: "text_with_links"
  content: |
    Learn about [[Architecture|architecture-page]] or
    explore [[Best Practices|best-practices-page]].

    External links: [[Documentation|https://docs.example.com]]
```

**Link Syntax:**
- `[[Display Text|target-page-id]]` - Navigate to page
- `[[Display Text|https://url]]` - External link
- `[[Display Text|popup:popup-id]]` - Show popup

**When to use:**
- In-context navigation
- Cross-references to related pages
- Natural reading flow with embedded links

---

### 4. Image Section

Static image display with caption.

```yaml
- type: "image"
  image: "/images/architecture-diagram.png"
  alt: "Architecture diagram showing components"
  caption: "System architecture overview"
  size: "large"  # small, medium, large, full (optional)
  align: "center"  # left, center, right (optional)
```

**When to use:**
- Diagrams and illustrations
- Screenshots and examples
- Visual explanations

**Image paths:**
- Absolute: `/images/diagram.png`
- Relative to content: `./images/local.png`

---

### 5. Video Section

Embedded video player.

```yaml
- type: "video"
  video_url: "https://youtube.com/embed/video-id"
  caption: "Introduction to the platform"
  aspect_ratio: "16:9"  # 16:9, 4:3, 1:1 (optional)
```

**Supported platforms:**
- YouTube: `https://youtube.com/embed/VIDEO_ID`
- Vimeo: `https://player.vimeo.com/video/VIDEO_ID`
- Direct MP4: `/videos/demo.mp4`

**When to use:**
- Tutorials and demonstrations
- Explanatory videos
- Product showcases

---

### 6. Code Block

Syntax-highlighted code with copy button.

```yaml
- type: "code_block"
  language: "yaml"  # yaml, javascript, python, typescript, etc.
  code: |
    card:
      id: "example"
      name: "Example Card"
      color_theme: "blue"
  filename: "config.yaml"  # optional
  show_line_numbers: true  # optional
  highlight_lines: "2,3"  # optional - highlight specific lines
```

**Supported languages:**
- yaml, json, xml
- javascript, typescript, jsx, tsx
- python, java, go, rust
- sql, bash, shell
- css, scss, html

**When to use:**
- Configuration examples
- Code snippets
- API examples
- Command-line instructions

---

### 7. Quote / Blockquote

Highlighted quote with optional attribution.

```yaml
- type: "quote"
  content: "The best way to predict the future is to invent it."
  author: "Alan Kay"
  role: "Computer Scientist"  # optional
  avatar: "/images/alan-kay.jpg"  # optional
```

**When to use:**
- Customer testimonials
- Expert opinions
- Important statements
- Design principles

---

### 8. Divider

Visual separator between sections.

```yaml
- type: "divider"
  style: "line"  # line, dots, wave (optional)
  spacing: "large"  # small, medium, large (optional)
```

**When to use:**
- Between major topic changes
- Visual breaks in long content
- Separating different types of information

---

## Navigation & Interactive Sections

### 9. Clickable Image

Image that navigates when clicked.

```yaml
- type: "image_clickable"
  image: "/images/architecture.png"
  alt: "Click to explore architecture"
  click_action:
    type: "navigate_to_subpage"  # or "show_popup", "external_link"
    target: "architecture-detail"  # page-id, popup-id, or URL
  hover_effect: "zoom"  # zoom, lift, glow, border (optional)
  caption: "Click to explore in detail"
```

**Click action types:**
- `navigate_to_subpage`: Go to another page
- `show_popup`: Display a popup overlay
- `external_link`: Open external URL

**When to use:**
- Clickable diagrams
- Preview images that lead to detail pages
- Interactive infographics

---

### 10. Feature Grid

Grid of feature cards with icons (clickable).

```yaml
- type: "feature_grid"
  columns: 3  # 2, 3, or 4
  features:
    - name: "Identity & Access"
      icon: "Key"  # Lucide icon name
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
        type: "external_link"
        target: "https://docs.example.com/network"
```

**When to use:**
- Feature overviews
- Service categories
- Topic navigation
- Product capabilities

**Grid layouts:**
- 2 columns: Good for comparisons
- 3 columns: Balanced layout (recommended)
- 4 columns: Dense information (use sparingly)

---

### 11. Clickable Cards

Simple grid of clickable navigation cards.

```yaml
- type: "clickable_cards"
  columns: 3
  cards:
    - title: "Getting Started"
      description: "Learn the basics"
      icon: "Rocket"
      image: "/images/getting-started.png"  # optional
      click_action:
        type: "navigate_to_subpage"
        target: "getting-started"

    - title: "Advanced Topics"
      description: "Deep dive into features"
      icon: "Zap"
      click_action:
        type: "navigate_to_subpage"
        target: "advanced"
```

**When to use:**
- Navigation menus
- Topic selection
- Course modules
- Documentation sections

**Card vs Feature Grid:**
- **Feature Grid**: Focus on icons and short descriptions
- **Clickable Cards**: Can include images, longer descriptions

---

### 12. Tabbed Content

Horizontal tabs for switching content or navigation.

```yaml
- type: "tabbed_content"
  tabs:
    - label: "Overview"
      target_type: "inline_content"
      content: |
        Overview content shown inline.
        Can include markdown.

    - label: "Details"
      target_type: "subpage"
      target: "details-subpage-id"

    - label: "API Reference"
      target_type: "external_link"
      url: "https://api.example.com/docs"
```

**Tab target types:**
- `inline_content`: Content shown directly (no page navigation)
- `subpage`: Navigate to different page
- `external_link`: Open external URL

**When to use:**
- Multiple views of same data
- Related but distinct sections
- Code examples in different languages
- Alternative explanations for different audiences

---

### 13. Interactive Diagram

Image with invisible clickable hotspots.

```yaml
- type: "interactive_diagram"
  image: "/images/architecture-diagram.png"
  hotspots:
    - x: 20            # X coordinate (percentage: 0-100, left to right)
      y: 50            # Y coordinate (percentage: 0-100, top to bottom)
      radius: 50       # Click area radius (pixels)
      click_action:
        type: "show_popup"
        popup_id: "component-detail"
      hover_text: "API Gateway - Click to learn more"

    - x: 50            # Center horizontally
      y: 50            # Center vertically
      radius: 50
      click_action:
        type: "navigate_to_subpage"
        target: "database-architecture"
      hover_text: "Database Layer"

    - x: 80            # Right side
      y: 50
      radius: 50
      click_action:
        type: "external_link"
        target: "https://docs.example.com"
        open_in_new_tab: true
      hover_text: "External Documentation"
```

**When to use:**
- Architecture diagrams
- System maps
- Process flows
- Interactive infographics

**IMPORTANT - Coordinate System:**
- **x and y are percentages** (0-100), not pixels
- x: 0 = far left, x: 100 = far right
- y: 0 = top, y: 100 = bottom
- **radius is in pixels** (50-60 recommended for easy clicking)
- **Hotspots are invisible** - users find them by hovering
- Cursor changes to pointer on hover

**Tips:**
- Position hotspots as percentages of image dimensions
- Use generous radius (50-60px) for better UX
- Test hotspots to ensure they don't overlap
- Keep hover text concise and descriptive
- Hotspots work for all three click action types

---

## Data Presentation Sections

### 14. List Section

Bullet points, numbered lists, or checklists.

```yaml
- type: "list"
  list_style: "bullet"  # bullet, numbered, checklist
  items:
    - "First item"
    - "Second item with **bold**"
    - "Third item with *italic*"
    - "Fourth item"
```

**List styles:**
- `bullet`: Unordered list with bullet points
- `numbered`: Ordered list (1, 2, 3...)
- `checklist`: Items with checkboxes

**When to use:**
- Feature lists
- Requirements
- Steps (use `steps` section for better formatting)
- Benefits or advantages

---

### 15. Comparison Grid

Side-by-side comparison of options.

```yaml
- type: "comparison_grid"
  columns: 2  # 2 or 3
  items:
    - heading: "Basic Plan"
      subheading: "$10/month"
      points:
        - text: "5 users included"
          highlight: false
        - text: "Basic features"
          highlight: false
        - text: "Email support"
          highlight: false

    - heading: "Pro Plan"
      subheading: "$25/month"
      badge: "Popular"  # optional
      points:
        - text: "25 users included"
          highlight: true
        - text: "All features"
          highlight: true
        - text: "24/7 phone support"
          highlight: true
```

**When to use:**
- Pricing tiers
- Product comparisons
- Feature matrices
- Before/after scenarios

---

### 16. Key-Value Pairs

Display label-value data.

```yaml
- type: "key_value_pairs"
  layout: "horizontal"  # horizontal, vertical
  pairs:
    - key: "Version"
      value: "2.1.0"
    - key: "Release Date"
      value: "December 16, 2024"
    - key: "Author"
      value: "Security Team"
    - key: "Status"
      value: "Production Ready"
      highlight: true  # optional
```

**When to use:**
- Metadata display
- Properties and attributes
- Configuration details
- Status information

---

### 17. Steps / Numbered Guide

Step-by-step instructions with visual numbering.

```yaml
- type: "steps"
  orientation: "vertical"  # vertical, horizontal
  steps:
    - number: 1
      title: "Install Dependencies"
      description: "Run npm install to get started"
      code: "npm install"  # optional

    - number: 2
      title: "Configure Settings"
      description: "Update your config file"
      code: "cp .env.example .env"

    - number: 3
      title: "Start Application"
      description: "Launch the development server"
      code: "npm run dev"
```

**When to use:**
- Tutorials
- Setup guides
- Process documentation
- Sequential workflows

**Better than lists when:**
- Order is critical
- Each step needs explanation
- Visual progression is important

---

### 18. Timeline

Chronological event display.

```yaml
- type: "timeline"
  events:
    - date: "2024-01"
      title: "Project Kickoff"
      description: "Initial planning and requirements gathering"

    - date: "2024-03"
      title: "Beta Release"
      description: "First public beta launched"
      highlight: true  # optional

    - date: "2024-06"
      title: "Version 1.0"
      description: "Production release"
```

**When to use:**
- Product roadmaps
- Project history
- Release notes
- Event chronologies

---

## Expandable Content Sections

### 19. Expandable Section

Collapsible content block with trigger.

```yaml
- type: "expandable_section"
  trigger: "click"  # click or hover
  collapsed:
    title: "Click to expand advanced options"
    icon: "ChevronDown"
    text: "Preview of content..."  # optional
  expanded:
    content: |
      Full detailed content that appears when expanded.

      Can include multiple paragraphs and **markdown**.
    animation: "slide-down"  # slide-down, fade-in
  max_height: "400px"  # optional - adds scrollbar if content is taller
```

**When to use:**
- Advanced options
- Optional details
- Lengthy explanations
- FAQ sections

**Trigger options:**
- `click`: User must click to expand
- `hover`: Expands on mouse hover

---

### 20. Expandable Card

Card-style expandable content with icon.

```yaml
- type: "expandable_card"
  trigger: "click_icon"  # click, click_icon, click_anywhere
  icon: "Info"
  collapsed_title: "Why This Matters"
  collapsed_text: "Click the icon to learn more..."
  expanded_content: |
    Detailed explanation that appears with slide-down animation.

    **Benefits:**
    - Benefit 1
    - Benefit 2
    - Benefit 3
  animation: "slide-down"
  start_expanded: false  # optional - default is collapsed
```

**Trigger options:**
- `click`: Click title to expand
- `click_icon`: Click only icon to expand
- `click_anywhere`: Click anywhere on card

**When to use:**
- "Why it matters" explanations
- Contextual help
- Additional details
- Educational callouts

---

### 21. Accordion

Multiple expandable sections (only one open at a time).

```yaml
- type: "accordion"
  allow_multiple: false  # false = only one open, true = multiple can be open
  items:
    - title: "What is observability?"
      content: |
        Observability is the ability to understand system state...

    - title: "Why is it important?"
      content: |
        Observability helps teams debug production issues...

    - title: "How do I get started?"
      content: |
        Start with basic metrics and logging...
```

**When to use:**
- FAQs
- Documentation sections
- Help content
- Multiple related topics

**Accordion vs Expandable Section:**
- **Accordion**: Multiple items, typically one open at a time
- **Expandable Section**: Single item, standalone

---

## Special Elements

### 22. Alert / Callout

Highlighted boxes for important information.

```yaml
- type: "alert"
  alert_type: "info"  # info, success, warning, error
  title: "Important Information"
  content: |
    This is important information users should know.
    Can include **markdown** formatting.
  dismissible: false  # optional - adds close button
  icon: "AlertCircle"  # optional - override default icon
```

**Alert types:**
- `info`: General information (blue)
- `success`: Positive confirmation (green)
- `warning`: Caution required (yellow/orange)
- `error`: Critical issues (red)

**When to use:**
- Important notices
- Prerequisites
- Warnings and caveats
- Success messages

---

### 23. Stats / Metrics

Display key numbers and statistics.

```yaml
- type: "stats"
  layout: "grid"  # grid, horizontal
  stats:
    - label: "Active Users"
      value: "10,000+"
      icon: "Users"
      trend: "up"  # up, down, neutral (optional)
      change: "+12%"  # optional

    - label: "Uptime"
      value: "99.9%"
      icon: "Activity"
      trend: "up"

    - label: "Response Time"
      value: "45ms"
      icon: "Zap"
      trend: "down"
      change: "-15ms"
```

**When to use:**
- Key performance indicators
- System metrics
- Business statistics
- Dashboard summaries

---

### 24. Table

Structured data in rows and columns.

```yaml
- type: "table"
  headers:
    - "Feature"
    - "Basic"
    - "Pro"
    - "Enterprise"
  rows:
    - ["Users", "5", "25", "Unlimited"]
    - ["Storage", "10 GB", "100 GB", "1 TB"]
    - ["Support", "Email", "Phone", "24/7 Dedicated"]
  stripe: true  # optional - alternating row colors
  compact: false  # optional - tighter spacing
```

**When to use:**
- Structured data
- Feature comparisons
- Configuration options
- Reference tables

**Keep tables simple:**
- Max 5 columns
- Max 10 rows
- Consider using comparison_grid for better mobile experience

---

### 25. Embed / iframe

Embed external content.

```yaml
- type: "embed"
  url: "https://example.com/embed"
  height: "400px"
  title: "External Content"  # for accessibility
  allow: "fullscreen"  # iframe allow attribute
```

**When to use:**
- Interactive demos
- Third-party tools
- External dashboards
- Embedded applications

**Security note:** Only embed trusted sources

---

### 26. Download / File Link

Link to downloadable files.

```yaml
- type: "download"
  files:
    - title: "API Documentation"
      description: "Complete API reference guide"
      file: "/downloads/api-docs.pdf"
      size: "2.5 MB"
      icon: "FileText"

    - title: "Code Examples"
      description: "Sample implementation code"
      file: "/downloads/examples.zip"
      size: "1.2 MB"
      icon: "Code"
```

**When to use:**
- Documentation downloads
- Code samples
- Templates and resources
- PDF guides

---

### 27. Gallery / Image Grid

Grid of images (optionally clickable).

```yaml
- type: "gallery"
  columns: 3  # 2, 3, 4
  images:
    - src: "/images/screenshot-1.png"
      alt: "Dashboard view"
      caption: "Main dashboard"
      click_action:  # optional
        type: "show_popup"
        popup_id: "screenshot-1-detail"

    - src: "/images/screenshot-2.png"
      alt: "Analytics view"
      caption: "Analytics page"
```

**When to use:**
- Screenshots showcase
- Product gallery
- Visual examples
- Photo collections

---

### 28. Card List / Feature List

Vertical list of cards with icons.

```yaml
- type: "card_list"
  items:
    - icon: "Check"
      title: "Easy to Use"
      description: "Intuitive interface designed for non-technical users"

    - icon: "Zap"
      title: "Fast Performance"
      description: "Optimized for speed and efficiency"

    - icon: "Shield"
      title: "Secure by Default"
      description: "Enterprise-grade security built-in"
```

**When to use:**
- Feature highlights
- Benefits lists
- Process steps
- Service offerings

**Card List vs Feature Grid:**
- **Card List**: Vertical, more text per item, sequential reading
- **Feature Grid**: Horizontal grid, scannable, equal weight items

---

### 29. Progress Indicator

Show completion or progress.

```yaml
- type: "progress"
  items:
    - label: "Getting Started"
      status: "completed"  # completed, current, pending

    - label: "Configuration"
      status: "current"

    - label: "Deployment"
      status: "pending"

    - label: "Testing"
      status: "pending"
```

**When to use:**
- Multi-step processes
- Course progress
- Implementation roadmaps
- Onboarding flows

---

### 30. Badge / Tag Cloud

Display tags or categories.

```yaml
- type: "tags"
  tags:
    - label: "Security"
      color: "red"  # optional
      clickable: true
      click_action:  # optional
        type: "navigate_to_subpage"
        target: "security-topics"

    - label: "Beginner"
      color: "green"

    - label: "Cloud"
      color: "blue"
```

**When to use:**
- Content categorization
- Topic tags
- Skill levels
- Technology stacks

---

## Combining Section Types

Effective pages combine multiple section types for rich content:

```yaml
sections:
  # Start with hero
  - type: "hero"
    heading: "API Security Best Practices"
    subtitle: "Protect your APIs from common vulnerabilities"

  # Introduction text
  - type: "text"
    content: |
      API security is critical for modern applications...

  # Key stats
  - type: "stats"
    stats:
      - label: "APIs Secured"
        value: "10,000+"
      - label: "Threats Blocked"
        value: "1M+/day"

  # Feature grid for navigation
  - type: "feature_grid"
    columns: 3
    features:
      - name: "Authentication"
        icon: "Key"
        description: "OAuth 2.0 and JWT"
        click_action:
          type: "navigate_to_subpage"
          target: "authentication"
      # ... more features

  # Expandable FAQ
  - type: "accordion"
    items:
      - title: "What is API security?"
        content: "..."
      # ... more FAQs

  # Alert for important info
  - type: "alert"
    alert_type: "warning"
    title: "Security Updates"
    content: "Remember to update dependencies regularly"

  # Next steps
  - type: "card_list"
    items:
      - title: "Read the Guide"
        description: "Complete security guide"
      - title: "Try Examples"
        description: "Hands-on examples"
```

---

## Best Practices

### 1. Start with Hero
Every page should begin with a hero section for clear context.

### 2. Mix Content Types
Combine text, images, and interactive elements for engaging pages.

### 3. Use Navigation Sections
Feature grids and clickable cards help users explore deeper.

### 4. Hide Details
Use expandable sections for advanced or optional information.

### 5. Visual Hierarchy
Order sections from general to specific, overview to details.

### 6. Break Up Text
Use images, code blocks, and lists to break up long text sections.

### 7. Guide Users
Use alerts, callouts, and card lists to guide users to next steps.

### 8. Test Interactions
Verify all click actions, popups, and navigation work correctly.

---

## Section Type Selection Guide

**For introductions:** hero, text, image

**For navigation:** feature_grid, clickable_cards, text_with_links

**For data:** list, table, comparison_grid, key_value_pairs

**For detailed content:** expandable_section, expandable_card, accordion

**For special content:** code_block, video, quote, alert

**For visual content:** image, image_clickable, gallery, interactive_diagram

**For process/steps:** steps, timeline, progress

---

## Reference

**All section types focus on CONTENT and INTERACTION.**

**Visual styling (colors, spacing, fonts) is defined in:**
`UNIFIED_LAYOUT_SPECIFICATION.md`

**For animation options, see:**
`animations-reference.md`

**For navigation patterns, see:**
`navigation-reference.md`

---

**Last Updated:** December 16, 2024
**Version:** 1.0
