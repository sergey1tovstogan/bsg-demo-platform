# Navigation Reference

**Purpose:** Complete guide to navigation patterns and configuration
**Use this for:** Setting up navigation, breadcrumbs, menus, and user flows
**Related:** card-definition-template.md, hierarchical-navigation-guide.md

---

## Overview

Navigation defines **HOW users move through content**. The template system supports:
- Hierarchical navigation (tree structure with sub-pages)
- Tab navigation (horizontal sections)
- Linear navigation (step-by-step flow)
- Custom navigation (mixed approaches)

**Key Principle:** Navigation is configured in YAML, works automatically.

---

## Navigation Types

### 1. Hierarchical Navigation

Tree-like structure with unlimited nesting.

```yaml
card:
  navigation:
    type: "hierarchical"
    show_breadcrumbs: true
    show_page_tree: true
    allow_back_to_agenda: true
    show_next_previous: true
```

**Structure:**
```
Card
 └─ Agenda
     ├─ Page 1
     │   ├─ Page 1.1
     │   │   └─ Page 1.1.1
     │   └─ Page 1.2
     ├─ Page 2
     └─ Page 3
```

**When to use:**
- Complex topics with multiple levels
- Documentation sites
- Comprehensive guides
- Topic exploration

**User can navigate via:**
- Breadcrumbs (Home > Page 1 > Page 1.1)
- Page tree menu (sidebar with full structure)
- Back button (to parent)
- Next/Previous (siblings)
- Back to Agenda

---

### 2. Tab Navigation

Horizontal tabs for top-level pages.

```yaml
card:
  navigation:
    type: "tabs"
    show_breadcrumbs: false  # Usually not needed with tabs
    show_page_tree: false
    allow_back_to_agenda: true
    tab_position: "top"  # top or bottom
```

**When to use:**
- 3-7 distinct sections at same level
- Dashboard-style content
- Category browsing
- No deep hierarchy needed

**User can navigate via:**
- Tab bar (always visible)
- Back to Agenda

**Limitations:**
- Sub-pages displayed inline or as separate sections
- Not ideal for deep hierarchies

---

### 3. Linear Navigation

Step-by-step progression through content.

```yaml
card:
  navigation:
    type: "linear"
    show_breadcrumbs: false
    show_page_tree: false
    allow_back_to_agenda: true
    show_next_previous: true
    show_progress: true  # Shows step X of Y
```

**When to use:**
- Tutorials
- Onboarding flows
- Guided tours
- Sequential processes

**User can navigate via:**
- Next button (to next step)
- Previous button (to previous step)
- Progress indicator (shows position)
- Back to Agenda (escape hatch)

**Cannot:**
- Jump to arbitrary pages
- See full navigation tree

---

## Navigation Components

### Breadcrumbs

Shows current location in hierarchy.

```yaml
navigation:
  breadcrumbs:
    enabled: true
    separator: ">"  # >, /, •, → (optional)
    show_icons: false  # Show page icons (optional)
```

**Appearance:**
```
Home > Security > SaaS Services > Identity & Access
```

**Automatically generated from:**
- Page hierarchy (parent-child relationships)
- Page `breadcrumb` titles

**Configuration per page:**
```yaml
page:
  titles:
    breadcrumb: "IAM"  # Short form for breadcrumb
```

**Click behavior:**
- Each breadcrumb link navigates to that page
- Current page is not clickable

---

### Page Tree / Sidebar Menu

Shows hierarchical page structure.

```yaml
navigation:
  page_tree:
    enabled: true
    position: "left"  # left, right
    collapsible: true  # Can collapse tree branches
    show_siblings: true  # Show pages at same level
    show_children: true  # Show child pages
    show_icons: true  # Show page icons
    max_depth: 5  # Limit visible depth
```

**Appearance:**
```
📁 Security (current card)
  ├─ 📄 Introduction
  ├─ 📁 SaaS Services ← (current page, expanded)
  │   ├─ 📄 Identity & Access
  │   │   ├─ 📄 SSO
  │   │   └─ 📄 MFA ← (you are here)
  │   ├─ 📄 Data Protection
  │   └─ 📄 Network Security
  └─ 📄 Best Practices
```

**Behavior:**
- Click to navigate to page
- Current page highlighted
- Parent pages collapsible
- Auto-scrolls to current page

---

### Back Button

Returns to parent page.

```yaml
navigation:
  show_back_button: true
  back_button_label: "Back"  # optional custom label
```

**Behavior:**
- Navigates to `parent` page
- Disabled if at top level (no parent)
- Can customize label per page

---

### Next/Previous Buttons

Navigate between sibling pages.

```yaml
navigation:
  show_next_previous: true
  next_label: "Next"  # optional
  previous_label: "Previous"  # optional
```

**Requires configuration:**
```yaml
page:
  navigation:
    siblings:
      previous: "intro-page"  # ID of previous page
      next: "architecture-page"  # ID of next page
```

**Behavior:**
- Previous button disabled if first
- Next button disabled if last
- Shows page title on hover

---

### Back to Agenda Button

Always available escape hatch.

```yaml
navigation:
  back_to_agenda_button: true
  agenda_label: "Back to Agenda"  # optional
```

**Behavior:**
- Always visible (unless disabled)
- Returns to card's agenda page
- Useful when deep in hierarchy

---

### Progress Indicator

Shows position in linear flow.

```yaml
navigation:
  show_progress: true
  progress_style: "steps"  # steps, bar, dots
```

**Styles:**

**steps:**
```
Step 3 of 7
```

**bar:**
```
[████████░░░░░░] 43%
```

**dots:**
```
● ● ● ○ ○ ○ ○
```

**Only useful with linear navigation.**

---

## Navigation Patterns

### Pattern 1: Deep Hierarchy (Hierarchical)

```yaml
card:
  navigation:
    type: "hierarchical"
    show_breadcrumbs: true
    show_page_tree: true
    allow_back_to_agenda: true
    show_next_previous: false  # Tree navigation is primary
```

**User navigates via:**
1. Page tree (see all pages, click to jump)
2. Breadcrumbs (understand location, navigate up)
3. In-content links (clickable cards, images)
4. Back to Agenda (escape)

**Good for:** Documentation, knowledge bases, complex topics

---

### Pattern 2: Tabbed Dashboard (Tabs)

```yaml
card:
  navigation:
    type: "tabs"
    show_breadcrumbs: false
    show_page_tree: false
    allow_back_to_agenda: true
    tab_position: "top"
```

**User navigates via:**
1. Tab bar (switch between sections)
2. In-content links (if sub-pages exist)
3. Back to Agenda

**Good for:** Dashboards, category browsing, parallel sections

---

### Pattern 3: Tutorial Flow (Linear)

```yaml
card:
  navigation:
    type: "linear"
    show_breadcrumbs: false
    show_page_tree: false
    allow_back_to_agenda: true
    show_next_previous: true
    show_progress: true
```

**User navigates via:**
1. Next button (primary action)
2. Previous button (go back)
3. Progress indicator (see position)
4. Back to Agenda (exit tutorial)

**Good for:** Tutorials, onboarding, courses, step-by-step guides

---

### Pattern 4: Hybrid (Mixed)

```yaml
card:
  navigation:
    type: "hierarchical"  # Base is hierarchical
    show_breadcrumbs: true
    show_page_tree: true
    allow_back_to_agenda: true
    show_next_previous: true  # Also add linear nav
```

**User navigates via:**
1. Page tree (jump to any page)
2. Next/Previous (sequential reading)
3. Breadcrumbs (location awareness)
4. In-content links
5. Back to Agenda

**Good for:** Long-form content that can be read sequentially OR browsed

---

## In-Content Navigation

Navigation embedded within page content.

### Clickable Cards/Feature Grids

```yaml
sections:
  - type: "feature_grid"
    columns: 3
    features:
      - name: "Security Basics"
        icon: "Shield"
        description: "Learn fundamentals"
        click_action:
          type: "navigate_to_subpage"
          target: "security-basics"  # Navigate to this page

      - name: "Advanced Topics"
        icon: "Zap"
        description: "Deep dive"
        click_action:
          type: "navigate_to_subpage"
          target: "security-advanced"
```

**Creates clickable navigation cards within content.**

---

### Text Links

```yaml
sections:
  - type: "text_with_links"
    content: |
      Before continuing, review our [[Security Guide|security-guide]]
      and [[Best Practices|best-practices]].
```

**Syntax:** `[[Display Text|target-page-id]]`

---

### Clickable Images

```yaml
sections:
  - type: "image_clickable"
    image: "/images/architecture.png"
    click_action:
      type: "navigate_to_subpage"
      target: "architecture-details"
```

---

### Tabbed Navigation

```yaml
sections:
  - type: "tabbed_content"
    tabs:
      - label: "Overview"
        target_type: "inline_content"
        content: "Overview text..."

      - label: "Details"
        target_type: "subpage"
        target: "details-page-id"  # Navigates to page
```

---

## Navigation Configuration Examples

### Example 1: Documentation Site

```yaml
card:
  id: "api-docs"
  name: "API Documentation"

  navigation:
    type: "hierarchical"
    show_breadcrumbs: true
    show_page_tree: true
    allow_back_to_agenda: true
    show_next_previous: true  # Helpful for reading through

  pages:
    - file: "pages/introduction.md"
    - file: "pages/authentication.md"
    - file: "pages/endpoints.md"  # Has sub-pages
    - file: "pages/examples.md"
```

**Navigation setup in page:**
```yaml
# endpoints.md
page:
  id: "endpoints"
  parent: null  # Top-level

  navigation:
    siblings:
      previous: "authentication"
      next: "examples"

sub_pages:
  - file: "pages/endpoints/users.md"
  - file: "pages/endpoints/products.md"
```

**Result:**
- Breadcrumbs: Home > API Docs > Endpoints > Users
- Page tree shows all pages
- Next/Previous for sequential reading
- Back to Agenda always available

---

### Example 2: Dashboard

```yaml
card:
  id: "dashboard"
  name: "Analytics Dashboard"

  navigation:
    type: "tabs"
    tab_position: "top"
    allow_back_to_agenda: true

  pages:
    - file: "pages/overview.md"
    - file: "pages/metrics.md"
    - file: "pages/reports.md"
    - file: "pages/settings.md"
```

**Result:**
- Tab bar: [Overview] [Metrics] [Reports] [Settings]
- No breadcrumbs or page tree
- Quick switching between sections

---

### Example 3: Tutorial

```yaml
card:
  id: "security-tutorial"
  name: "Security Tutorial"

  navigation:
    type: "linear"
    show_progress: true
    progress_style: "steps"
    allow_back_to_agenda: true

  pages:
    - file: "pages/step1-introduction.md"
    - file: "pages/step2-setup.md"
    - file: "pages/step3-configuration.md"
    - file: "pages/step4-testing.md"
    - file: "pages/step5-deployment.md"
```

**Page configuration:**
```yaml
# step3-configuration.md
page:
  id: "step3"
  navigation:
    siblings:
      previous: "step2"
      next: "step4"
```

**Result:**
- "Step 3 of 5" indicator
- [← Previous] [Next →] buttons
- No tree or breadcrumbs
- Linear flow

---

## Advanced Navigation

### Conditional Navigation

Show/hide navigation elements based on page.

```yaml
page:
  id: "special-page"

  navigation:
    show_breadcrumbs: false  # Override card setting
    show_back_button: false  # Hide back button
    back_to_agenda_button: true  # But show agenda button
```

**Use for:**
- Landing pages (no back button needed)
- Full-screen experiences
- Special pages that don't fit hierarchy

---

### External Links

Navigate to external URLs.

```yaml
sections:
  - type: "clickable_cards"
    cards:
      - title: "API Documentation"
        description: "Complete API reference"
        click_action:
          type: "external_link"
          target: "https://api.example.com/docs"
          open_in_new_tab: true  # optional
```

---

### Cross-Card Navigation

Link to pages in different cards.

```yaml
sections:
  - type: "text_with_links"
    content: |
      For security details, see the
      [[Security Card|/cards/security/introduction]].
```

**Syntax:** Use full path for cross-card links

---

### Popup Navigation

Show content in popup instead of navigating.

```yaml
sections:
  - type: "feature_grid"
    features:
      - name: "Quick Preview"
        icon: "Eye"
        description: "Preview in popup"
        click_action:
          type: "show_popup"
          popup_id: "preview-popup"
```

---

## Navigation UX Best Practices

### 1. Provide Multiple Paths

Don't rely on single navigation method.

**Good:**
- Breadcrumbs + Page tree + In-content links
- Users can navigate their preferred way

**Avoid:**
- Only in-content links (hard to discover)
- Only next/previous (can't jump ahead)

---

### 2. Show Current Location

Always indicate where user is.

**Good:**
- Breadcrumbs show path
- Page tree highlights current page
- Page title matches navigation

**Avoid:**
- User doesn't know where they are
- Unclear how to get back

---

### 3. Make Escape Easy

Provide "back to Agenda" or similar escape.

**Good:**
- Always-visible "Back to Agenda"
- Breadcrumb link to home
- Persistent navigation menu

**Avoid:**
- Users feel trapped in deep hierarchy
- No way to restart or go home

---

### 4. Progressive Disclosure

Don't show all pages at once if overwhelming.

**Good:**
- Collapsible page tree
- Show current + siblings + children
- Depth limit (max_depth: 3)

**Avoid:**
- 50 pages visible in tree
- Overwhelming navigation

---

### 5. Consistent Patterns

Use same navigation pattern throughout card.

**Good:**
- All pages use same navigation style
- Predictable behavior
- User learns once, applies everywhere

**Avoid:**
- Different nav on every page
- Inconsistent button positions

---

### 6. Match Content Type

Choose navigation type that fits content.

| Content Type | Best Navigation |
|--------------|-----------------|
| Documentation | Hierarchical + tree |
| Tutorial | Linear + progress |
| Dashboard | Tabs |
| Reference | Hierarchical + search |
| Course | Linear + modules |
| Guide | Hierarchical + next/prev |

---

## Navigation Decision Tree

```
What type of content?
├─ Sequential/Tutorial → Linear navigation
│  ├─ Show progress indicator
│  ├─ Next/Previous buttons
│  └─ Allow escape to agenda
│
├─ Parallel sections (3-7) → Tab navigation
│  ├─ Tab bar at top
│  ├─ No breadcrumbs needed
│  └─ Allow back to agenda
│
├─ Complex hierarchy → Hierarchical navigation
│  ├─ Breadcrumbs (yes)
│  ├─ Page tree (yes)
│  ├─ Next/Previous (optional)
│  └─ Back to agenda (yes)
│
└─ Simple (1-3 pages) → Minimal navigation
   ├─ Breadcrumbs (optional)
   ├─ In-content links
   └─ Back to agenda (yes)
```

---

## Navigation Testing Checklist

Before finalizing navigation:

**Hierarchy:**
- [ ] All pages have correct `parent` set
- [ ] Page tree shows accurate structure
- [ ] No orphaned pages (unreachable)

**Breadcrumbs:**
- [ ] Path is correct for all pages
- [ ] Titles are appropriate (not too long)
- [ ] All links work

**Next/Previous:**
- [ ] Sibling configuration correct
- [ ] Logical flow (matches reading order)
- [ ] First page has no previous
- [ ] Last page has no next

**Links:**
- [ ] All in-content links work
- [ ] External links open correctly
- [ ] No broken page IDs

**Mobile:**
- [ ] Navigation works on small screens
- [ ] Page tree collapsible/hideable
- [ ] Breadcrumbs don't overflow

**Accessibility:**
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Focus indicators visible

---

## Complete Navigation Example

```yaml
# Card-level navigation
card:
  id: "security-guide"
  name: "Security Guide"

  navigation:
    type: "hierarchical"
    show_breadcrumbs: true
    show_page_tree: true
    allow_back_to_agenda: true
    show_next_previous: true

  pages:
    - file: "pages/introduction.md"
    - file: "pages/saas-services.md"  # Has sub-pages
    - file: "pages/best-practices.md"

# Page-level navigation
# pages/saas-services.md
page:
  id: "saas-services"
  parent: null  # Top-level page

  titles:
    page_header: "SaaS Security Services"
    breadcrumb: "SaaS"  # Shorter for breadcrumb

  navigation:
    show_breadcrumbs: true  # Inherits from card
    show_back_button: true  # Show even at top level
    show_next_previous: true

    siblings:
      previous: "introduction"
      next: "best-practices"

  sub_pages:
    - file: "pages/saas-services/identity.md"
    - file: "pages/saas-services/data-protection.md"

# Sub-page navigation
# pages/saas-services/identity.md
page:
  id: "identity"
  parent: "saas-services"  # Parent is SaaS Services page

  titles:
    breadcrumb: "Identity"

  navigation:
    siblings:
      previous: null  # First sub-page
      next: "data-protection"

  sub_pages:
    - file: "pages/saas-services/identity/sso.md"
    - file: "pages/saas-services/identity/mfa.md"
```

**Resulting navigation:**

**Breadcrumbs on SSO page:**
```
Home > Security Guide > SaaS > Identity > SSO
```

**Page tree:**
```
📁 Security Guide
  ├─ 📄 Introduction
  ├─ 📁 SaaS Services (expanded)
  │   ├─ 📁 Identity (expanded, current)
  │   │   ├─ 📄 SSO ← (you are here)
  │   │   └─ 📄 MFA
  │   └─ 📄 Data Protection
  └─ 📄 Best Practices
```

**Buttons on SSO page:**
- [← Back to Identity] (parent button)
- [← Previous: SSO] [Next: MFA →] (siblings within Identity)
- [Back to Agenda] (always available)

---

## Quick Reference

**Navigation Types:**
- `hierarchical` - Tree structure, unlimited depth
- `tabs` - Horizontal tabs, flat structure
- `linear` - Step-by-step, sequential

**Components:**
- Breadcrumbs - Location indicator
- Page tree - Full navigation menu
- Back button - Return to parent
- Next/Previous - Sibling navigation
- Back to Agenda - Escape hatch
- Progress - Position in linear flow

**Configuration Levels:**
1. Card-level (global defaults)
2. Page-level (overrides)
3. Section-level (in-content navigation)

---

**Last Updated:** December 16, 2024
**Version:** 1.0
