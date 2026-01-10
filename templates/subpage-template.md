# Sub-Page Template

**Purpose:** Individual content page that is a child of another page (2nd level or deeper)
**Use this for:** Creating pages nested under other pages (sub-pages, sub-sub-pages, etc.)
**Related:** page-template.md, card-definition-template.md, popup-template.md

---

## Template Structure

```yaml
page:
  # === PAGE IDENTIFICATION ===
  id: "unique-subpage-id"  # Required. Unique identifier (lowercase, hyphenated)

  # === PARENT PAGE (REQUIRED FOR SUB-PAGES) ===
  parent: "parent-page-id"  # Required. ID of the parent page this belongs to

  # === MULTI-CONTEXT TITLES ===
  # Different titles for different display contexts
  titles:
    page_header: "Full Sub-Page Title for Header"  # Shown at top of page
    menu_title: "Menu"  # Shown in navigation menus
    agenda_title: "Agenda Card Title"  # Shown on agenda cards (if linked from agenda)
    breadcrumb: "Short"  # Shown in breadcrumbs

  # === DESCRIPTIONS ===
  # Two formats supported:
  # Format 1: Simple string (for single description)
  description: "Single string description"

  # Format 2: Object with short and long (for different contexts)
  # description:
  #   short: "One-line summary"  # For cards and previews
  #   long: "Detailed explanation of page content"  # For page header area

  # === METADATA (Optional) ===
  metadata:
    author: "Team Name"
    version: "1.0"
    last_updated: "2024-12-16"
    tags: ["tag1", "tag2"]
    difficulty: "beginner"  # beginner, intermediate, advanced, expert
    estimated_time: "5 minutes"

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

  # Add more sections as needed (see section types in page-template.md)

# === SUB-PAGES (Optional - can nest up to 5 levels deep) ===
sub_pages:
  - file: "path/to/sub-subpage1.md"
  - file: "path/to/sub-subpage2.md"

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
    previous: "previous-sibling-id"  # null if first
    next: "next-sibling-id"  # null if last
```

---

## Key Differences from Top-Level Pages

### 1. Parent Reference (Required)
```yaml
page:
  id: "identity-access"
  parent: "saas-services"  # MUST reference parent page ID
```

### 2. Nesting Depth
Sub-pages can have their own sub-pages, up to 5 levels deep:

```
Level 1 (Top-level Page)
  └─ Level 2 (Sub-page)
       └─ Level 3 (Sub-sub-page)
            └─ Level 4
                 └─ Level 5 (Maximum depth)
```

### 3. Breadcrumb Navigation
Breadcrumbs automatically build from parent hierarchy:

```
Home > Security > SaaS Services > Identity & Access > SSO
```

### 4. Back Button Behavior
Back button navigates to the parent page (not agenda)

---

## Common Section Types

Sub-pages support all the same section types as regular pages. See `page-template.md` for the complete list of 16+ section types.

**Most Common for Sub-Pages:**

### 1. Hero Section
```yaml
- type: "hero"
  heading: "Sub-Page Heading"
  subtitle: "Supporting subtitle text"
```

### 2. Text Section
```yaml
- type: "text"
  content: |
    Detailed content specific to this sub-topic.
```

### 3. Clickable Image (Navigate Deeper)
```yaml
- type: "image_clickable"
  image: "/images/detail-diagram.png"
  alt: "Detailed Diagram"
  click_action:
    type: "navigate_to_subpage"  # Navigate to sub-sub-page
    target: "deeper-subpage-id"
```

### 4. Feature Grid (Navigate to Sub-Sub-Pages)
```yaml
- type: "feature_grid"
  columns: 3
  features:
    - name: "Feature A"
      icon: "Key"
      description: "Feature description"
      click_action:
        type: "navigate_to_subpage"
        target: "feature-a-detail"  # Sub-sub-page
```

### 5. Text with Navigation Links
```yaml
- type: "text_with_links"
  content: |
    Learn more about [[SSO Configuration|sso-config]] or
    [[Multi-Factor Authentication|mfa-setup]].
```

### 6. Alert/Callout
```yaml
- type: "alert"
  alert_type: "info"  # info, success, warning, error
  title: "Related Topic"
  content: "See the parent page for context."
```

---

## Complete Example: Sub-Page (Level 2)

```yaml
page:
  id: "identity-access"

  # REQUIRED: Parent page reference
  parent: "saas-services"

  titles:
    page_header: "Identity & Access Management: Complete Guide"
    menu_title: "Identity & Access"
    agenda_title: "Identity & Access Management"
    breadcrumb: "Identity"

  description:
    short: "User authentication and authorization"
    long: "Comprehensive guide to managing user identities and access controls"

  metadata:
    author: "Security Team"
    version: "1.5"
    last_updated: "2024-12-16"
    tags: ["security", "identity", "authentication"]
    difficulty: "intermediate"
    estimated_time: "8 minutes"

  icon: "Key"

sections:
  # Hero
  - type: "hero"
    heading: "Identity & Access Management"
    subtitle: "Secure user authentication and authorization"

  # Introduction text
  - type: "text"
    content: |
      Identity and Access Management (IAM) ensures that only authorized
      users can access specific resources and perform specific actions.

  # Clickable diagram to navigate deeper
  - type: "image_clickable"
    image: "/images/iam-architecture.png"
    alt: "IAM Architecture Diagram"
    click_action:
      type: "navigate_to_subpage"
      target: "iam-architecture-detail"
    hover_effect: "zoom"

  # Feature grid navigating to sub-sub-pages
  - type: "feature_grid"
    columns: 3
    features:
      - name: "Single Sign-On (SSO)"
        icon: "LogIn"
        description: "Unified authentication across systems"
        click_action:
          type: "navigate_to_subpage"
          target: "sso"  # Sub-sub-page

      - name: "Multi-Factor Authentication"
        icon: "Shield"
        description: "Extra layer of security"
        click_action:
          type: "navigate_to_subpage"
          target: "mfa"  # Sub-sub-page

      - name: "Role-Based Access Control"
        icon: "Users"
        description: "Permission management"
        click_action:
          type: "navigate_to_subpage"
          target: "rbac"  # Sub-sub-page

  # Text with navigation links
  - type: "text_with_links"
    content: |
      Learn about [[SSO configuration|sso]] or explore
      [[MFA setup options|mfa]].

  # Alert callout
  - type: "alert"
    alert_type: "info"
    title: "Related Content"
    content: "For an overview of all security services, see the parent SaaS Services page."

# Sub-sub-pages (Level 3)
sub_pages:
  - file: "pages/saas-services/identity-access/sso.md"
  - file: "pages/saas-services/identity-access/mfa.md"
  - file: "pages/saas-services/identity-access/rbac.md"

# Popups
popups:
  - id: "popup-sso-quick-info"
    size: "medium"
    title: "SSO Quick Overview"
    content: |
      SSO allows users to log in once and access multiple applications
      without re-entering credentials.
    actions:
      - label: "Learn More"
        action:
          type: "navigate_to_subpage"
          target: "sso"
      - label: "Close"
        action:
          type: "close_popup"

navigation:
  show_breadcrumbs: true
  show_back_button: true
  show_next_previous: true
  back_to_agenda_button: true

  siblings:
    previous: "saas-overview"
    next: "data-protection"
```

---

## Complete Example: Sub-Sub-Page (Level 3)

```yaml
page:
  id: "sso"

  # REQUIRED: Parent is the Level 2 page
  parent: "identity-access"

  titles:
    page_header: "Single Sign-On (SSO): Implementation Guide"
    menu_title: "SSO"
    agenda_title: "Single Sign-On"
    breadcrumb: "SSO"

  description:
    short: "Unified authentication across systems"
    long: "Detailed guide to implementing and configuring Single Sign-On"

  metadata:
    author: "Security Team"
    version: "1.2"
    last_updated: "2024-12-16"
    tags: ["sso", "authentication", "saml", "oauth"]
    difficulty: "advanced"
    estimated_time: "12 minutes"

  icon: "LogIn"

sections:
  - type: "hero"
    heading: "Single Sign-On (SSO)"
    subtitle: "Seamless authentication across multiple applications"

  - type: "text"
    content: |
      SSO enables users to authenticate once and gain access to multiple
      applications without re-entering credentials.

  - type: "expandable_card"
    trigger: "click_icon"
    icon: "Info"
    collapsed_title: "How SSO Works"
    collapsed_text: "Click to learn the authentication flow..."
    expanded_content: |
      1. User logs in to identity provider
      2. Identity provider validates credentials
      3. User receives authentication token
      4. Token grants access to multiple applications
    animation: "slide-down"

  - type: "feature_grid"
    columns: 2
    features:
      - name: "SAML Configuration"
        icon: "Settings"
        description: "Configure SAML-based SSO"
        click_action:
          type: "navigate_to_subpage"
          target: "sso-saml"  # Sub-sub-sub-page (Level 4)

      - name: "OAuth Integration"
        icon: "Link"
        description: "Set up OAuth 2.0 authentication"
        click_action:
          type: "navigate_to_subpage"
          target: "sso-oauth"  # Sub-sub-sub-page (Level 4)

  - type: "code_block"
    language: "yaml"
    code: |
      sso:
        provider: "okta"
        protocol: "saml2"
        entity_id: "https://app.example.com"

  - type: "alert"
    alert_type: "warning"
    title: "Security Considerations"
    content: "Always use HTTPS and validate tokens properly."

# Sub-sub-sub-pages (Level 4)
sub_pages:
  - file: "pages/saas-services/identity-access/sso/saml-config.md"
  - file: "pages/saas-services/identity-access/sso/oauth-setup.md"

navigation:
  show_breadcrumbs: true
  show_back_button: true
  show_next_previous: true
  back_to_agenda_button: true

  siblings:
    previous: null  # First sibling
    next: "mfa"
```

---

## Hierarchical Navigation Example

**Directory Structure:**
```
pages/saas-services/
  ├─ identity-access.md              (Level 2 - parent: "saas-services")
  └─ identity-access/
      ├─ sso.md                      (Level 3 - parent: "identity-access")
      ├─ mfa.md                      (Level 3 - parent: "identity-access")
      └─ sso/
          ├─ saml-config.md          (Level 4 - parent: "sso")
          └─ oauth-setup.md          (Level 4 - parent: "sso")
              └─ oauth-setup/
                  └─ provider-setup.md  (Level 5 - parent: "oauth-setup")
```

**Breadcrumb Trail:**
```
Home > Security > SaaS Services > Identity & Access > SSO > SAML Configuration
```

**Page Tree (Sidebar):**
```
📁 SaaS Services
  ├─ 📄 Overview
  ├─ 📁 Identity & Access ← (current)
  │   ├─ 📄 SSO
  │   │   ├─ 📄 SAML Config
  │   │   └─ 📄 OAuth Setup
  │   ├─ 📄 MFA
  │   └─ 📄 RBAC
  └─ 📄 Data Protection
```

---

## Validation Checklist

Before finalizing your sub-page:

- [ ] `id` is unique across all pages
- [ ] `parent` field correctly references parent page ID
- [ ] All title variants are provided
- [ ] Parent page exists and includes this sub-page in its `sub_pages` list
- [ ] All section types are valid
- [ ] All `click_action` targets exist
- [ ] All `icon` names are valid Lucide icons
- [ ] All image paths are correct
- [ ] All sub-page files exist (if nesting deeper)
- [ ] All popup IDs are unique
- [ ] Navigation siblings are correct
- [ ] Nesting depth does not exceed 5 levels

---

## Tips

1. **Logical Hierarchy**: Structure sub-pages from general to specific
2. **Consistent Depth**: Try to keep sibling pages at similar depth levels
3. **Parent Context**: Provide enough context so sub-page makes sense standalone
4. **Navigation Links**: Use text_with_links for cross-references
5. **Breadcrumbs**: Test that breadcrumb trail makes sense
6. **Back Button**: Verify back button goes to correct parent
7. **Maximum Depth**: Respect 5-level limit (card > page > sub > sub-sub > sub-sub-sub)

---

## Navigation Behavior

**Breadcrumbs** are automatically generated from:
- Page `breadcrumb` titles
- Parent-child relationships (following `parent` field)

**Back Button** navigates to `parent` page (not to agenda)

**Next/Previous** uses `siblings` configuration (siblings at same level)

**Back to Agenda** always available (returns to card's agenda)

---

## Parent-Child Relationship Requirements

### Parent Page MUST Include Sub-Page Reference

**Parent page (saas-services.md):**
```yaml
page:
  id: "saas-services"

sub_pages:
  - file: "pages/saas-services/identity-access.md"  # References this sub-page
  - file: "pages/saas-services/data-protection.md"
```

**This Sub-Page (identity-access.md):**
```yaml
page:
  id: "identity-access"
  parent: "saas-services"  # References parent page
```

Both references must match for navigation to work correctly.

---

**Next Steps:**
1. Ensure parent page includes this sub-page in its `sub_pages` list
2. Create any sub-sub-pages using this same template
3. Test navigation (breadcrumbs, back button, next/previous)
4. Verify page appears in page tree menu

---

**Note:** All visual styling (layouts, colors, typography, spacing, animations) is defined in `UNIFIED_LAYOUT_SPECIFICATION.md`. This template focuses solely on content structure and interaction behavior.
