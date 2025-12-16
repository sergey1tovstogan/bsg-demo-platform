# Content Template System Implementation Plan

**Version:** 1.0
**Date:** December 16, 2024
**Status:** Ready for Implementation

---

## 🎯 Goal

Create simple, user-friendly templates (like PowerPoint) where content creators:
- Focus ONLY on **content** (text, images, information)
- Define **navigation** (click this to go here)
- Configure **interactions** (click to expand, animate, show details)
- **Reuse pages** from a library to create cards with different detail levels
- **Choose templates visually** from a gallery with examples

**Layout and styling are ONLY in the Unified Layout Specification.**

---

## 📋 Requirements

### 1. Hierarchical Page Structure
```
Card
  └─ Agenda (landing page)
       ├─ Page 1: Introduction
       │    ├─ Sub-page 1.1: History
       │    │    └─ Sub-page 1.1.1: Timeline
       │    └─ Sub-page 1.2: Key Concepts
       ├─ Page 2: Architecture
       │    ├─ Sub-page 2.1: Components
       │    ├─ Sub-page 2.2: Data Flow
       │    └─ Sub-page 2.3: Security
       └─ Page 3: Best Practices
```

### 2. Navigation Triggers
- Click on **text** → navigate to sub-page
- Click on **image** → navigate to sub-page or show popup
- Click on **card/box** → navigate to sub-page
- Click on **button** → navigate to sub-page or external link
- Click on **icon** → expand inline content (animation)

### 3. Rich Metadata Per Page
```yaml
page:
  id: "intro-history"

  # Different titles for different contexts
  titles:
    page_header: "The Complete History of Observability"
    menu_title: "History"
    agenda_title: "History & Evolution"
    breadcrumb: "History"

  description:
    short: "Learn the history"  # For agenda cards
    long: "A comprehensive look at how observability evolved..."  # For page header

  # Configuration metadata for future use
  metadata:
    author: "Technical Team"
    version: "1.2"
    last_updated: "2024-12-16"
    tags: ["beginner", "overview"]
    estimated_time: "5 minutes"
```

### 4. Reusable Page Library
```
/content/pages/library/
  ├─ intro-templates/
  │   ├─ basic-intro.md
  │   ├─ detailed-intro.md
  │   └─ expert-intro.md
  ├─ architecture-templates/
  │   ├─ high-level-arch.md
  │   ├─ detailed-arch.md
  │   └─ technical-deep-dive.md
  └─ best-practices/
      ├─ beginner-practices.md
      └─ advanced-practices.md
```

**Use Case**:
- Card A (beginner audience) → uses `basic-intro.md` + `high-level-arch.md`
- Card B (expert audience) → uses `detailed-intro.md` + `technical-deep-dive.md`

### 5. Visual Template Gallery
Create a showcase page showing:
- Screenshot of rendered template
- Template name and description
- Use cases ("Best for: Feature comparison")
- Code snippet to use it
- Live preview link

### 6. Inline Animations (Expanding Content)
```yaml
sections:
  - type: "expandable_text"
    trigger: "click"
    initial_text: "What is observability?"
    expanded_content: "Detailed explanation that appears when clicked..."
    animation: "slide-down"

  - type: "image_with_overlay"
    image: "/path/to/diagram.png"
    overlay_trigger: "click"
    overlay_content: "Detailed explanation of diagram components"
    overlay_position: "right"  # or "bottom", "popup"
```

### 7. Navigation System Components
- **Breadcrumbs**: Home > Security > SaaS Services > Overview
- **Page tree menu**: Sidebar showing current page + sub-pages
- **Back button**: Return to parent page
- **Next/Previous**: Navigate siblings
- **Back to Agenda**: Always available

---

## 📁 Template Structure

### **Template 1: Card Definition** (`card-definition-template.md`)
Defines the overall card and references reusable pages

```yaml
card:
  id: "security"
  name: "Security"
  icon: "Shield"
  category_color: "#EF4444"

  # Agenda configuration
  agenda:
    file: "agenda.md"  # Reference to agenda template

  # Navigation style
  navigation:
    type: "hierarchical"  # or "tabs", "linear"
    show_breadcrumbs: true
    show_page_tree: true
    allow_back_to_agenda: true

  # Pages - can reference library pages or custom pages
  pages:
    - file: "pages/intro.md"          # Custom page
    - file: "library/arch-overview.md" # Reused from library
    - file: "pages/saas-services.md"  # Custom page with sub-pages

  # Global settings
  settings:
    default_animation: "fade-in"
    transition_speed: "300ms"
    max_depth: 5  # Maximum sub-page nesting
```

### **Template 2: Agenda** (`agenda-template.md`)
Landing page with navigation items

```yaml
agenda:
  title: "Explore Security"
  subtitle: "Choose a topic to dive deep"

  # Layout
  layout:
    type: "grid"  # or "list", "carousel", "cards"
    columns: 3
    gap: "large"

  # Animation
  animation:
    type: "stagger-fade-in"
    delay_between_items: "0.1s"

  # Agenda items (can navigate to pages or external links)
  items:
    - id: "intro"
      order: 1
      titles:
        agenda_title: "Introduction to Security"
      description: "Security fundamentals and key concepts"
      icon: "Shield"

      # Navigation target
      target:
        type: "page"  # or "external_link"
        page_id: "intro"

      # Visual
      image: "/images/security-intro.png"  # Optional
      color_theme: "red"
```

### **Template 3: Page** (`page-template.md`)
Individual content page with sections and sub-pages

```yaml
page:
  id: "saas-services"

  # Multi-context titles
  titles:
    page_header: "SaaS Security Services: Complete Guide"
    menu_title: "SaaS Services"
    agenda_title: "SaaS Security Services"
    breadcrumb: "SaaS"

  # Descriptions
  description:
    short: "Cloud security services"
    long: "Comprehensive guide to Temenos SaaS security offerings"

  # Metadata for configuration
  metadata:
    author: "Security Team"
    version: "2.1"
    last_updated: "2024-12-16"
    tags: ["security", "saas", "cloud"]
    difficulty: "intermediate"
    estimated_time: "10 minutes"

  # Parent page (for navigation)
  parent: "security-overview"  # null if top-level

  # Icon for navigation
  icon: "Cloud"

# === CONTENT SECTIONS ===
sections:
  - type: "hero"
    heading: "SaaS Security Services"
    subtitle: "Enterprise-grade cloud security"

  - type: "image_clickable"
    image: "/images/security-architecture.png"
    alt: "Security Architecture Diagram"
    click_action:
      type: "navigate_to_subpage"
      target: "architecture-detail"  # Sub-page ID

  - type: "expandable_card"
    trigger: "click_icon"
    icon: "Info"
    collapsed_title: "Why SaaS Security Matters"
    collapsed_text: "Click to learn more..."
    expanded_content: |
      Detailed explanation that appears with slide-down animation.
      Can include multiple paragraphs and formatting.
    animation: "slide-down"

  - type: "feature_grid"
    columns: 3
    features:
      - name: "Identity & Access"
        icon: "Key"
        description: "Manage user access"
        # Click this card to navigate to sub-page
        click_action:
          type: "navigate_to_subpage"
          target: "identity-access"

      - name: "Data Protection"
        icon: "Lock"
        description: "Encrypt sensitive data"
        click_action:
          type: "show_popup"
          popup_id: "popup-data-protection"

  - type: "text_with_links"
    content: |
      Learn about our [[architecture|architecture-detail]]
      or explore [[best practices|best-practices]].
    # [[link text|target-page-id]] syntax for inline navigation

# === SUB-PAGES ===
sub_pages:
  - file: "pages/saas-services/identity-access.md"
  - file: "pages/saas-services/data-protection.md"
  - file: "pages/saas-services/architecture-detail.md"
  - file: "pages/saas-services/best-practices.md"

# === POPUPS ===
popups:
  - id: "popup-data-protection"
    size: "large"
    title: "Data Protection Deep Dive"
    content: "Detailed information..."
    actions:
      - label: "Go to Full Page"
        action:
          type: "navigate_to_subpage"
          target: "data-protection"

# === NAVIGATION ===
navigation:
  show_breadcrumbs: true
  show_back_button: true
  show_next_previous: true
  back_to_agenda_button: true

  # Siblings (for next/previous)
  siblings:
    previous: "intro"
    next: "architecture"
```

### **Template 4: Sub-Page** (`subpage-template.md`)
Same structure as page template, but includes parent reference

```yaml
page:
  id: "identity-access"
  parent: "saas-services"  # Parent page ID

  # Can have its own sub-pages
  sub_pages:
    - file: "pages/saas-services/identity-access/sso.md"
    - file: "pages/saas-services/identity-access/mfa.md"
```

### **Template 5: Popup** (`popup-template.md`)
Modal/overlay content

```yaml
popup:
  id: "popup-data-protection"

  # Trigger (defined in page, but documented here)
  trigger:
    type: "click"
    element: "feature-card-data-protection"

  # Appearance
  size: "large"  # small, medium, large, full-screen
  animation: "scale-in"  # fade-in, slide-in-right, scale-in

  # Content
  title: "Data Protection in Detail"

  sections:
    - type: "text"
      content: "Detailed explanation..."

    - type: "image"
      src: "/images/data-protection.png"

    - type: "code_block"
      language: "yaml"
      code: |
        encryption:
          algorithm: "AES-256"

  # Actions
  actions:
    - label: "View Full Page"
      action:
        type: "navigate_to_page"
        target: "data-protection-full"
    - label: "Close"
      action:
        type: "close_popup"
```

---

## 📚 Interactive Section Types

### Navigation Sections

#### 1. **Clickable Image**
```yaml
- type: "image_clickable"
  image: "/path/to/image.png"
  alt: "Description"
  click_action:
    type: "navigate_to_subpage"  # or "show_popup", "external_link"
    target: "page-id"
  hover_effect: "zoom"  # optional
```

#### 2. **Clickable Card Grid**
```yaml
- type: "clickable_cards"
  columns: 3
  cards:
    - title: "Card 1"
      description: "Description"
      icon: "Icon"
      click_action:
        type: "navigate_to_subpage"
        target: "subpage-1"
```

#### 3. **Expandable Content**
```yaml
- type: "expandable_section"
  trigger: "click"  # or "hover"
  collapsed:
    title: "Click to expand"
    icon: "ChevronDown"
  expanded:
    content: "Full content here..."
    animation: "slide-down"
  max_height: "400px"
```

#### 4. **Interactive Diagram**
```yaml
- type: "interactive_diagram"
  image: "/path/to/diagram.png"
  hotspots:
    - x: 100
      y: 150
      radius: 30
      click_action:
        type: "show_popup"
        popup_id: "component-detail"
      hover_text: "Click to learn more"
```

#### 5. **Text with Inline Links**
```yaml
- type: "text_with_navigation"
  content: |
    Learn about [[Architecture|arch-page]] or
    dive into [[Best Practices|practices-page]].
  # [[Display Text|target-page-id]] syntax
```

#### 6. **Tabbed Content**
```yaml
- type: "tabbed_content"
  tabs:
    - label: "Overview"
      target_type: "inline_content"
      content: "Overview text..."
    - label: "Details"
      target_type: "subpage"
      target: "details-subpage-id"
```

---

## 🗂️ Page Library Structure

```
/content/pages/
  ├─ library/           # Reusable pages
  │   ├─ intro/
  │   │   ├─ basic-intro.md
  │   │   ├─ detailed-intro.md
  │   │   └─ technical-intro.md
  │   ├─ architecture/
  │   │   ├─ high-level.md
  │   │   ├─ detailed.md
  │   │   └─ deep-dive.md
  │   ├─ best-practices/
  │   │   ├─ beginner.md
  │   │   ├─ intermediate.md
  │   │   └─ advanced.md
  │   └─ common-sections/
  │       ├─ getting-started.md
  │       ├─ troubleshooting.md
  │       └─ faq.md
  │
  ├─ cards/             # Card-specific pages
  │   ├─ security/
  │   │   ├─ card-definition.md
  │   │   ├─ agenda.md
  │   │   └─ pages/
  │   │       ├─ saas-services.md
  │   │       └─ saas-services/
  │   │           ├─ identity.md
  │   │           └─ identity/
  │   │               ├─ sso.md
  │   │               └─ mfa.md
  │   └─ observability/
  │       ├─ card-definition.md
  │       └─ ...
```

---

## 🎨 Visual Template Gallery

Create a showcase component:

```
/frontend/src/components/template-gallery/TemplateGallery.tsx

Gallery shows:
├─ Section Templates
│   ├─ Hero Section
│   │   ├─ Screenshot
│   │   ├─ Description: "Large title with subtitle"
│   │   ├─ Use case: "Page headers, introductions"
│   │   ├─ Code snippet (YAML)
│   │   └─ [Use This Template] button
│   ├─ Feature Grid
│   ├─ Comparison Grid
│   └─ ...
│
├─ Page Templates
│   ├─ Introduction Page
│   │   ├─ Screenshot of rendered page
│   │   ├─ Description
│   │   ├─ Sections included
│   │   └─ [Copy Template] button
│   ├─ Architecture Page
│   └─ ...
│
└─ Complete Card Examples
    ├─ Observability Card
    │   ├─ Full preview
    │   ├─ All files included
    │   └─ [Clone This Card] button
    └─ ...
```

---

## 🔄 Navigation System Implementation

### Breadcrumb Navigation
```
Home > Security > SaaS Services > Identity & Access > SSO
```

### Page Tree (Sidebar)
```
📁 Security
  ├─ 📄 Introduction
  ├─ 📁 SaaS Services ← (current)
  │   ├─ 📄 Identity & Access
  │   │   ├─ 📄 SSO
  │   │   └─ 📄 MFA
  │   ├─ 📄 Data Protection
  │   └─ 📄 Architecture
  └─ 📄 Best Practices
```

### Navigation Buttons
```
[← Back to Agenda]   [← Previous Page]   [Next Page →]
```

### Navigation Metadata in Page
```yaml
navigation:
  breadcrumbs:
    enabled: true
    items:
      - label: "Home"
        target: "/"
      - label: "Security"
        target: "/security"
      - label: "SaaS Services"
        target: "/security/saas-services"

  page_tree:
    enabled: true
    show_siblings: true
    show_children: true

  buttons:
    back_to_agenda: true
    previous_page: "intro"
    next_page: "architecture"
```

---

## 📋 Complete Deliverables

### Phase 1: Template Files

#### Core Templates
1. **`templates/card-definition-template.md`** - Card structure with page references
2. **`templates/agenda-template.md`** - Landing page with navigation items
3. **`templates/page-template.md`** - Page with sections and sub-pages
4. **`templates/subpage-template.md`** - Sub-page template (extends page)
5. **`templates/popup-template.md`** - Modal/overlay content

#### Reference Documents
6. **`templates/section-types-reference.md`** - All 30+ section types with examples
7. **`templates/animations-reference.md`** - Animation types and usage
8. **`templates/navigation-reference.md`** - Navigation patterns and configuration
9. **`templates/metadata-reference.md`** - All metadata fields explained

#### Guides
10. **`templates/quick-start-guide.md`** - Create your first card in 15 minutes
11. **`templates/reusing-pages-guide.md`** - How to use page library
12. **`templates/hierarchical-navigation-guide.md`** - Creating nested pages
13. **`templates/interactions-guide.md`** - Click actions, animations, popups

### Phase 2: Visual Examples

#### Example 1: Simple Card (2 levels)
```
examples/simple-card/
  ├─ card-definition.md
  ├─ agenda.md
  ├─ pages/
  │   ├─ intro.md
  │   └─ features.md
  └─ SCREENSHOTS/
      ├─ agenda-view.png
      ├─ intro-page.png
      └─ features-page.png
```

#### Example 2: Medium Card (3 levels with popups)
```
examples/medium-card/
  ├─ card-definition.md
  ├─ agenda.md
  ├─ pages/
  │   ├─ overview.md
  │   ├─ architecture.md
  │   └─ architecture/
  │       ├─ components.md
  │       └─ data-flow.md
  └─ SCREENSHOTS/
```

#### Example 3: Complex Card (5 levels, reused pages, animations)
```
examples/complex-card/
  ├─ card-definition.md
  ├─ agenda.md
  ├─ pages/
  │   ├─ intro.md (references library/intro/detailed-intro.md)
  │   ├─ architecture.md
  │   └─ architecture/
  │       ├─ overview.md
  │       ├─ details.md
  │       └─ details/
  │           ├─ layer-1.md
  │           └─ layer-1/
  │               └─ component-a.md
  └─ SCREENSHOTS/
```

### Phase 3: Visual Template Gallery

#### Gallery Component Files
```
frontend/src/components/template-gallery/
  ├─ TemplateGallery.tsx          # Main gallery component
  ├─ SectionTemplates.tsx          # Section type showcase
  ├─ PageTemplates.tsx             # Full page templates
  ├─ CardExamples.tsx              # Complete card examples
  └─ templates-data.ts             # Template metadata and screenshots
```

#### Screenshot Library
```
frontend/public/template-screenshots/
  ├─ sections/
  │   ├─ hero-section.png
  │   ├─ feature-grid-3col.png
  │   ├─ comparison-grid.png
  │   ├─ expandable-card.png
  │   └─ ... (30+ section types)
  ├─ pages/
  │   ├─ intro-page-example.png
  │   ├─ architecture-page-example.png
  │   └─ ...
  └─ cards/
      ├─ observability-card-full.png
      └─ security-card-full.png
```

### Phase 4: Page Library

#### Starter Library
```
content/pages/library/
  ├─ intro/
  │   ├─ basic-intro.md           # Simple introduction
  │   ├─ detailed-intro.md        # Comprehensive introduction
  │   └─ technical-intro.md       # Developer-focused
  ├─ architecture/
  │   ├─ high-level-overview.md   # Executive view
  │   ├─ detailed-architecture.md # Technical view
  │   └─ component-deep-dive.md   # Deep technical
  ├─ getting-started/
  │   ├─ quick-start.md
  │   └─ step-by-step-guide.md
  └─ common-sections/
      ├─ faq.md
      ├─ troubleshooting.md
      └─ best-practices.md
```

---

## 🎯 Complete Example: Security Card

```
content/cards/security/
  ├─ card-definition.md
  ├─ agenda.md
  └─ pages/
      ├─ intro.md
      ├─ saas-services.md
      └─ saas-services/
          ├─ identity.md
          ├─ data-protection.md
          ├─ architecture.md
          └─ identity/
              ├─ sso.md
              └─ mfa.md
                  └─ mfa/
                      ├─ setup.md
                      └─ troubleshooting.md
```

**Navigation Flow:**
```
Agenda
  ├─ [Click "SaaS Services" card]
  └─→ SaaS Services Page
       ├─ [Click "Identity & Access" feature card]
       └─→ Identity Page
            ├─ [Click "Multi-Factor Auth" image]
            └─→ MFA Page
                 ├─ [Click "Setup Guide" text link]
                 └─→ Setup Page
```

---

## ✅ Success Criteria

Templates are successful when:
1. ✅ Non-technical user creates a card in 30 minutes
2. ✅ Creating 5-level nested navigation is easy
3. ✅ Reusing pages from library saves 50% creation time
4. ✅ Visual gallery helps users pick right templates
5. ✅ Changing one MD file updates the content instantly
6. ✅ Navigation (breadcrumbs, back buttons) works automatically
7. ✅ All interactions (click to expand, navigate) defined in MD
8. ✅ No React code needed for content changes

---

## 📅 Implementation Timeline

### Phase 1: Template Creation (Session 1)
**Estimated Time: 2-3 hours**

Deliverables:
- ✅ 13 template files
- ✅ 3 complete examples with different complexity
- ✅ Template gallery component with screenshots
- ✅ Starter page library (10 reusable pages)
- ✅ Visual documentation

### Phase 2: Parser & Renderer (Session 2 - After User Feedback)
**Estimated Time: 4-6 hours**

Tasks:
- Parse MD templates into React components
- Implement hierarchical navigation system
- Build preview mode
- Create hot-reload for rapid iteration

### Phase 3: Migration & Testing (Session 3)
**Estimated Time: 3-4 hours**

Tasks:
- Convert existing observability card to new system
- Test all navigation patterns
- User acceptance testing
- Documentation refinement

---

## 🎨 Visual Example Output

For each template, deliverables include:

1. **Template MD File** - YAML structure to fill in
2. **Filled Example** - Real content example
3. **Screenshot** - How it looks when rendered
4. **Use Case** - When to use this template
5. **Code Snippet** - Copy-paste starter code

This creates a complete visual library where users can:
- Browse screenshots
- Find the pattern they want
- Copy the template
- Fill in their content
- See it rendered immediately

---

## 📝 Design Principles

### 1. Separation of Concerns
```
Content (MD Files)          Layout (Unified Spec)
- What to show              - How colors look
- Text and images           - Typography sizes
- Interaction logic         - Spacing values
- Navigation flow           - Animation curves
- Popup triggers            - Component styling
```

### 2. PowerPoint-Like Simplicity
- **Slides = Pages**: Each page is like a PowerPoint slide
- **Agenda = Slide Master**: Landing page shows all available "slides"
- **Sections = Content Blocks**: Like text boxes and images on a slide
- **Popups = Presenter Notes**: Additional detail on demand
- **Animations = Slide Transitions**: Smooth entry/exit effects

### 3. Content Creator Focus
Users filling in templates should think about:
- ✅ "What information do I want to show?"
- ✅ "How should users navigate through it?"
- ✅ "What should happen when they click this?"
- ❌ NOT: "What color should this be?"
- ❌ NOT: "What font size?"
- ❌ NOT: "How much padding?"

---

## 📊 Total Deliverables Summary

**~40 files across:**
- 13 Template files
- 9 Guide/Reference documents
- 3 Example card sets (with multiple files each)
- 1 Template gallery component (5 files)
- 10+ Screenshot library
- 10 Starter library pages

**End Result:** A complete, visual, easy-to-use system for creating interactive card content without touching React code.

---

**END OF PLAN**
