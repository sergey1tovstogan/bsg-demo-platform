# Hierarchical Navigation Guide: Creating 5-Level Nested Pages

**Purpose:** Learn how to create deep, multi-level page hierarchies easily
**Goal:** Demonstrate that 5-level nested navigation is simple with YAML
**Related:** navigation-reference.md, page-template.md, quick-start-guide.md

---

## Overview

Create complex, nested page structures like documentation sites or knowledge bases **without any coding**.

**What you'll learn:**
- How to create 5+ levels of nested pages
- How navigation works automatically
- How breadcrumbs and page trees are generated
- How to structure deep content hierarchies

**No React code needed!** Just YAML configuration.

---

## Understanding Hierarchical Navigation

### What is Hierarchical Navigation?

A tree-like structure where pages can have child pages (sub-pages), which can have their own children.

```
Card
 └─ Agenda
     ├─ Page 1: Introduction
     │   ├─ Sub-page 1.1: History
     │   │   └─ Sub-page 1.1.1: Timeline
     │   │       └─ Sub-page 1.1.1.1: 2020s
     │   │           └─ Sub-page 1.1.1.1.1: 2024
     │   └─ Sub-page 1.2: Key Concepts
     ├─ Page 2: Architecture
     │   ├─ Sub-page 2.1: Components
     │   ├─ Sub-page 2.2: Data Flow
     │   └─ Sub-page 2.3: Security
     └─ Page 3: Best Practices
```

**That's 5 levels deep!** (Card → Page → Sub-page → Sub-sub-page → Sub-sub-sub-page → Sub-sub-sub-sub-page)

### Why Use Hierarchical Navigation?

**Perfect for:**
- Documentation sites
- Knowledge bases
- Training materials
- Complex product guides
- Multi-chapter content

**Benefits:**
- Clear organization
- Easy to navigate
- Scalable to any depth
- Automatic breadcrumbs
- Automatic page tree menu

---

## Quick Example: 3 Levels

Before diving into 5 levels, let's start simple.

### File Structure

```
content/pages/cards/security/
  ├─ card-definition.md
  ├─ agenda.md
  └─ pages/
      ├─ introduction.md                    # Level 1
      └─ saas-services.md                   # Level 1
          └─ saas-services/
              └─ identity.md                # Level 2 (child of saas-services)
                  └─ identity/
                      └─ sso.md             # Level 3 (child of identity)
```

### Level 1: Top-Level Page

**File:** `pages/saas-services.md`

```yaml
page:
  id: "saas-services"

  titles:
    page_header: "SaaS Security Services"
    menu_title: "SaaS Services"
    agenda_title: "SaaS Security Services"
    breadcrumb: "SaaS"

  parent: null  # ← No parent = top level

  # This page HAS children
  sub_pages:
    - file: "pages/saas-services/identity.md"
    - file: "pages/saas-services/data-protection.md"

sections:
  - type: "hero"
    heading: "SaaS Security Services"
```

### Level 2: Child Page

**File:** `pages/saas-services/identity.md`

```yaml
page:
  id: "identity"

  titles:
    page_header: "Identity & Access Management"
    menu_title: "Identity"
    agenda_title: "Identity & Access"
    breadcrumb: "Identity"

  parent: "saas-services"  # ← Parent is saas-services

  # This page also HAS children
  sub_pages:
    - file: "pages/saas-services/identity/sso.md"
    - file: "pages/saas-services/identity/mfa.md"

sections:
  - type: "hero"
    heading: "Identity & Access Management"
```

### Level 3: Grandchild Page

**File:** `pages/saas-services/identity/sso.md`

```yaml
page:
  id: "sso"

  titles:
    page_header: "Single Sign-On (SSO)"
    menu_title: "SSO"
    agenda_title: "Single Sign-On"
    breadcrumb: "SSO"

  parent: "identity"  # ← Parent is identity

  sub_pages: []  # No children (leaf node)

sections:
  - type: "hero"
    heading: "Single Sign-On"
```

### Result

**Automatic breadcrumbs:**
```
Home > Security > SaaS Services > Identity > SSO
```

**Automatic page tree:**
```
📁 Security
  ├─ 📄 Introduction
  └─ 📁 SaaS Services
      ├─ 📁 Identity ← (current)
      │   ├─ 📄 SSO ← (you are here)
      │   └─ 📄 MFA
      └─ 📄 Data Protection
```

**That's it!** Navigation works automatically based on `parent` field.

---

## Creating 5 Levels: Step by Step

Now let's create a full 5-level hierarchy.

### The Structure

```
Security Card
  └─ Introduction (Level 1)
      └─ History (Level 2)
          └─ Timeline (Level 3)
              └─ 2020s (Level 4)
                  └─ 2024 (Level 5)
```

### Step 1: Create Directory Structure

```bash
content/pages/cards/security/pages/
  ├─ introduction.md
  └─ introduction/
      └─ history.md
          └─ history/
              └─ timeline.md
                  └─ timeline/
                      └─ 2020s.md
                          └─ 2020s/
                              └─ 2024.md
```

### Step 2: Level 1 - Introduction

**File:** `pages/introduction.md`

```yaml
page:
  id: "introduction"

  titles:
    page_header: "Introduction to Security"
    menu_title: "Introduction"
    agenda_title: "Introduction"
    breadcrumb: "Intro"

  parent: null  # Top level

  icon: "BookOpen"

  # Has ONE child: history
  sub_pages:
    - file: "pages/introduction/history.md"

sections:
  - type: "hero"
    heading: "Introduction to Security"
    subtitle: "Learn the fundamentals"

  - type: "text"
    content: |
      Security is critical for modern applications.
      Explore the history to understand how we got here.

  # Link to child page
  - type: "text_with_links"
    content: |
      Dive into the [[History of Security|history]]

navigation:
  show_breadcrumbs: true
  show_page_tree: true
  siblings:
    previous: null
    next: null
```

### Step 3: Level 2 - History

**File:** `pages/introduction/history.md`

```yaml
page:
  id: "history"

  titles:
    page_header: "History of Security"
    menu_title: "History"
    agenda_title: "Security History"
    breadcrumb: "History"

  parent: "introduction"  # ← Parent is introduction

  icon: "Clock"

  # Has ONE child: timeline
  sub_pages:
    - file: "pages/introduction/history/timeline.md"

sections:
  - type: "hero"
    heading: "History of Security"
    subtitle: "From early days to modern practices"

  - type: "text"
    content: |
      Security has evolved dramatically over the decades.
      View the detailed timeline to see key milestones.

  # Link to child page
  - type: "text_with_links"
    content: |
      View the [[Complete Timeline|timeline]]

navigation:
  show_breadcrumbs: true
  show_page_tree: true
  siblings:
    previous: null
    next: null
```

### Step 4: Level 3 - Timeline

**File:** `pages/introduction/history/timeline.md`

```yaml
page:
  id: "timeline"

  titles:
    page_header: "Security Timeline"
    menu_title: "Timeline"
    agenda_title: "Historical Timeline"
    breadcrumb: "Timeline"

  parent: "history"  # ← Parent is history

  icon: "Calendar"

  # Has ONE child: 2020s
  sub_pages:
    - file: "pages/introduction/history/timeline/2020s.md"

sections:
  - type: "hero"
    heading: "Security Timeline"
    subtitle: "Key events and milestones"

  - type: "timeline"
    events:
      - date: "1970s"
        title: "Early Encryption"
        description: "DES algorithm introduced"
      - date: "1990s"
        title: "SSL/TLS"
        description: "Secure web communications"
      - date: "2000s"
        title: "Cloud Security"
        description: "Security moves to the cloud"
      - date: "2020s"
        title: "Modern Era"
        description: "Zero trust and AI-powered security"

  # Link to child page
  - type: "text_with_links"
    content: |
      Explore the [[2020s in detail|2020s]]

navigation:
  show_breadcrumbs: true
  show_page_tree: true
```

### Step 5: Level 4 - 2020s

**File:** `pages/introduction/history/timeline/2020s.md`

```yaml
page:
  id: "2020s"

  titles:
    page_header: "Security in the 2020s"
    menu_title: "2020s"
    agenda_title: "The 2020s"
    breadcrumb: "2020s"

  parent: "timeline"  # ← Parent is timeline

  icon: "TrendingUp"

  # Has ONE child: 2024
  sub_pages:
    - file: "pages/introduction/history/timeline/2020s/2024.md"

sections:
  - type: "hero"
    heading: "Security in the 2020s"
    subtitle: "Modern approaches and challenges"

  - type: "text"
    content: |
      The 2020s brought significant changes:
      - Zero Trust Architecture
      - AI-powered threat detection
      - Quantum-resistant cryptography
      - Supply chain security

  - type: "steps"
    steps:
      - number: 1
        title: "2020-2021"
        description: "Pandemic accelerates cloud adoption"
      - number: 2
        title: "2022-2023"
        description: "AI security tools emerge"
      - number: 3
        title: "2024"
        description: "Quantum security becomes priority"

  # Link to child page
  - type: "text_with_links"
    content: |
      See what happened in [[2024|2024]]

navigation:
  show_breadcrumbs: true
  show_page_tree: true
```

### Step 6: Level 5 - 2024

**File:** `pages/introduction/history/timeline/2020s/2024.md`

```yaml
page:
  id: "2024"

  titles:
    page_header: "Security Milestones in 2024"
    menu_title: "2024"
    agenda_title: "2024 Milestones"
    breadcrumb: "2024"

  parent: "2020s"  # ← Parent is 2020s

  icon: "Star"

  sub_pages: []  # ← No children (deepest level)

sections:
  - type: "hero"
    heading: "2024: A Pivotal Year"
    subtitle: "Major security advancements"

  - type: "text"
    content: |
      2024 marked several major milestones in security:

  - type: "card_list"
    items:
      - icon: "Shield"
        title: "Post-Quantum Cryptography"
        description: "NIST finalizes quantum-resistant algorithms"

      - icon: "Brain"
        title: "AI Security Assistants"
        description: "AI-powered security analysis becomes mainstream"

      - icon: "Lock"
        title: "Zero Trust Adoption"
        description: "70% of enterprises adopt zero trust"

  - type: "alert"
    alert_type: "success"
    title: "Congratulations!"
    content: "You've navigated through 5 levels of content!"

navigation:
  show_breadcrumbs: true
  show_page_tree: true
  show_back_button: true
  back_to_agenda_button: true
```

### Step 7: Configure Card

**File:** `card-definition.md`

```yaml
card:
  id: "security"
  name: "Security"
  category: "security"
  color_theme: "red"
  icon: "Shield"

  navigation:
    type: "hierarchical"  # ← Enable hierarchical navigation
    show_breadcrumbs: true
    show_page_tree: true
    allow_back_to_agenda: true

  pages:
    - file: "content/pages/cards/security/pages/introduction.md"

  settings:
    max_depth: 5  # ← Allow 5 levels
```

### Result: Automatic Navigation

**When viewing the 2024 page, users see:**

**Breadcrumbs:**
```
Home > Security > Intro > History > Timeline > 2020s > 2024
```

**Page Tree:**
```
📁 Security
  └─ 📁 Introduction
      └─ 📁 History
          └─ 📁 Timeline
              └─ 📁 2020s
                  └─ 📄 2024 ← (you are here)
```

**Buttons:**
- [← Back to 2020s]
- [Back to Agenda]

**ALL AUTOMATIC!** No coding required.

---

## Key Principles

### 1. The `parent` Field

**This is the ONLY thing** that creates hierarchy:

```yaml
page:
  id: "child-page"
  parent: "parent-page-id"  # ← Creates parent-child relationship
```

**Rules:**
- `parent: null` = top-level page
- `parent: "page-id"` = child of that page
- Parent must exist

### 2. The `sub_pages` List

**Declares which files are children:**

```yaml
# Parent page
page:
  id: "parent"
  sub_pages:
    - file: "path/to/child1.md"
    - file: "path/to/child2.md"
```

**Important:** Child pages ALSO need `parent: "parent"` set!

### 3. File Organization

**Mirror the hierarchy in file structure:**

```
pages/
  └─ level1.md
      └─ level1/
          └─ level2.md
              └─ level2/
                  └─ level3.md
```

**Makes it easy to find files!**

---

## Common Patterns

### Pattern 1: Documentation Site

```
Card: API Documentation
  ├─ Getting Started (Level 1)
  │   ├─ Installation (Level 2)
  │   └─ Quick Start (Level 2)
  ├─ API Reference (Level 1)
  │   ├─ Authentication (Level 2)
  │   │   ├─ OAuth (Level 3)
  │   │   └─ API Keys (Level 3)
  │   └─ Endpoints (Level 2)
  │       ├─ Users (Level 3)
  │       │   ├─ Create User (Level 4)
  │       │   └─ Update User (Level 4)
  │       └─ Products (Level 3)
  └─ Examples (Level 1)
```

**5 levels deep, perfectly organized!**

### Pattern 2: Training Course

```
Card: Security Training
  ├─ Module 1: Basics (Level 1)
  │   ├─ Lesson 1.1: Introduction (Level 2)
  │   │   ├─ Section 1.1.1: What is Security? (Level 3)
  │   │   │   ├─ Reading: Definition (Level 4)
  │   │   │   └─ Quiz: Check Understanding (Level 4)
  │   │   └─ Section 1.1.2: Why It Matters (Level 3)
  │   └─ Lesson 1.2: Core Concepts (Level 2)
  └─ Module 2: Advanced (Level 1)
```

### Pattern 3: Product Guide

```
Card: Product Features
  ├─ Feature Set A (Level 1)
  │   ├─ Feature A1 (Level 2)
  │   │   ├─ How It Works (Level 3)
  │   │   │   ├─ Technical Details (Level 4)
  │   │   │   │   └─ API Spec (Level 5)
  │   │   │   └─ User Guide (Level 4)
  │   │   └─ Configuration (Level 3)
  │   └─ Feature A2 (Level 2)
  └─ Feature Set B (Level 1)
```

---

## Navigation Between Levels

### Going Down (Into Children)

Use clickable elements to navigate to sub-pages:

```yaml
# Parent page
sections:
  # Clickable cards
  - type: "feature_grid"
    columns: 3
    features:
      - name: "History"
        icon: "Clock"
        description: "Learn the history"
        click_action:
          type: "navigate_to_subpage"
          target: "history"  # ← Navigate to child page

  # Or inline links
  - type: "text_with_links"
    content: |
      Explore the [[History|history]] of security.
```

### Going Up (To Parent)

**Automatic back button:**

```yaml
navigation:
  show_back_button: true  # ← Back to parent
```

**Or breadcrumbs:**

```yaml
navigation:
  show_breadcrumbs: true  # ← Click any ancestor
```

### Going Sideways (Between Siblings)

**Configure siblings:**

```yaml
navigation:
  siblings:
    previous: "sso"
    next: "mfa"
```

**Automatic next/previous buttons!**

---

## Best Practices

### 1. Don't Go Too Deep Without Reason

**5 levels is maximum recommended.**

**Good:**
```
Level 1: Main Topic
Level 2: Sub-Topic
Level 3: Specific Concept
Level 4: Detail
Level 5: Fine Detail
```

**Avoid:**
```
Level 6+: Users get lost!
```

### 2. Provide Multiple Navigation Paths

Don't rely only on linear flow:

```yaml
navigation:
  show_breadcrumbs: true      # Jump to any ancestor
  show_page_tree: true        # See full structure
  show_back_button: true      # Go to parent
  back_to_agenda_button: true # Escape hatch
```

### 3. Use Descriptive Breadcrumb Titles

```yaml
titles:
  page_header: "Complete History of Security Practices"  # Long
  breadcrumb: "History"  # ← Short, clear
```

### 4. Group Related Content

**Good structure:**
```
Authentication/
  ├─ OAuth/
  ├─ SAML/
  └─ API Keys/
```

**Poor structure:**
```
Random mix of topics at each level
```

### 5. Test Navigation Flow

Create a test path through all 5 levels:

1. Start at agenda
2. Navigate to Level 1
3. Navigate to Level 2
4. Navigate to Level 3
5. Navigate to Level 4
6. Navigate to Level 5
7. Use back button to return
8. Use breadcrumbs to jump
9. Use page tree to navigate

**All should work automatically!**

---

## Troubleshooting

### Issue: Page not showing in tree

**Check:**
- `parent` field is correct
- Parent page exists
- Parent page lists this file in `sub_pages`

### Issue: Breadcrumbs wrong

**Check:**
- `parent` chain is correct
- All ancestors have `breadcrumb` title set

### Issue: Can't navigate to sub-page

**Check:**
- `sub_pages` lists the correct file path
- File actually exists at that path
- Page IDs match in click actions

### Issue: Back button doesn't work

**Check:**
- `parent` field is set (not null)
- Parent page exists

---

## Complete 5-Level Example

Here's the complete file structure for reference:

```
content/pages/cards/security/
  ├─ card-definition.md
  ├─ agenda.md
  └─ pages/
      └─ introduction.md (Level 1)
          └─ introduction/
              └─ history.md (Level 2)
                  └─ history/
                      └─ timeline.md (Level 3)
                          └─ timeline/
                              └─ 2020s.md (Level 4)
                                  └─ 2020s/
                                      └─ 2024.md (Level 5)
```

**Total files:** 6 page files + 1 card definition + 1 agenda = 8 files

**Time to create:** ~30-40 minutes (copying and customizing templates)

**Result:** Fully functional 5-level navigation with automatic breadcrumbs, page tree, and back buttons!

---

## Quick Reference

### Creating a Child Page

```yaml
# 1. Create the file in parent's subdirectory
# pages/parent/child.md

# 2. Set parent field
page:
  id: "child"
  parent: "parent"  # ← Links to parent

# 3. Add to parent's sub_pages
# In parent page:
sub_pages:
  - file: "pages/parent/child.md"
```

### Navigation Configuration

```yaml
card:
  navigation:
    type: "hierarchical"  # ← Enable hierarchy
    show_breadcrumbs: true
    show_page_tree: true
    max_depth: 5  # ← Allow 5 levels

page:
  navigation:
    show_back_button: true
    back_to_agenda_button: true
```

---

## Congratulations!

You now know how to create **5-level hierarchical navigation** with just YAML configuration!

**Remember:**
- Use `parent` field to create hierarchy
- List children in `sub_pages`
- Navigation works automatically
- No coding required!

**Next Steps:**
- Try creating your own 5-level structure
- Experiment with different content types
- Combine with page library for faster creation

---

**Last Updated:** December 16, 2024
**Version:** 1.0

**Next:** Try `interactions-guide.md` to add clicks, animations, and popups!
