# Quick Start Guide: Create Your First Card in 15 Minutes

**Purpose:** Get started creating your first card quickly and easily
**Goal:** Non-technical users can create a working card in 15-30 minutes
**Related:** card-definition-template.md, page-template.md, agenda-template.md

---

## Overview

This guide walks you through creating your first card from scratch using our PowerPoint-like template system.

**You'll create:**
- A simple card with an agenda
- 2-3 content pages
- Basic navigation
- Interactive elements

**No coding required!** Just fill in YAML templates.

**Time:** 15-30 minutes

---

## What You'll Build

A "Getting Started" card with:
- **Agenda page** - Landing page with 3 topic cards
- **Introduction page** - Welcome text and overview
- **Key Features page** - Clickable feature grid
- **Next Steps page** - Action items list

**Navigation:** Users can navigate between pages, return to agenda, use breadcrumbs.

---

## Prerequisites

- Text editor (VS Code, Notepad++, or any editor)
- Access to `/content/pages/cards/` directory
- 10-15 minutes of time

**No technical knowledge needed!**

---

## Step 1: Create Your Card Directory (2 minutes)

### 1.1 Create folder structure

```
content/pages/cards/getting-started/
  ├─ card-definition.md    (we'll create this)
  ├─ agenda.md             (we'll create this)
  └─ pages/
      ├─ introduction.md   (we'll create this)
      ├─ features.md       (we'll create this)
      └─ next-steps.md     (we'll create this)
```

### 1.2 Create the folders

In your file system, create:
1. `content/pages/cards/getting-started/`
2. `content/pages/cards/getting-started/pages/`

---

## Step 2: Define Your Card (3 minutes)

### 2.1 Create `card-definition.md`

Create file: `content/pages/cards/getting-started/card-definition.md`

Copy and paste this:

```yaml
card:
  # Basic information
  id: "getting-started"
  name: "Getting Started"
  category: "onboarding"
  color_theme: "blue"
  icon: "Rocket"

  # Descriptions
  description:
    short: "Learn the basics quickly"
    long: "A beginner-friendly introduction to the platform"

  # Metadata
  metadata:
    author: "Platform Team"
    version: "1.0"
    last_updated: "2024-12-16"
    tags: ["beginner", "tutorial", "onboarding"]
    difficulty: "beginner"
    estimated_time: "15 minutes"

  # Agenda (landing page)
  agenda:
    file: "content/pages/cards/getting-started/agenda.md"

  # Navigation settings
  navigation:
    type: "hierarchical"  # Tree-like navigation
    show_breadcrumbs: true
    show_page_tree: true
    allow_back_to_agenda: true
    show_next_previous: true

  # Pages (we'll create these next)
  pages:
    - file: "content/pages/cards/getting-started/pages/introduction.md"
      order: 1
    - file: "content/pages/cards/getting-started/pages/features.md"
      order: 2
    - file: "content/pages/cards/getting-started/pages/next-steps.md"
      order: 3

  # Global settings
  settings:
    default_animation: "fade-in"
    transition_speed: "300ms"
    max_depth: 3
```

### 2.2 What you just did

- **Created a card** with ID "getting-started"
- **Chose a blue color theme** (from UNIFIED_LAYOUT_SPECIFICATION.md)
- **Added metadata** for organization
- **Defined 3 pages** that we'll create next
- **Configured navigation** (breadcrumbs, page tree, etc.)

**That's it!** Your card is defined. Now let's add content.

---

## Step 3: Create the Agenda (Landing Page) (3 minutes)

### 3.1 Create `agenda.md`

Create file: `content/pages/cards/getting-started/agenda.md`

Copy and paste this:

```yaml
agenda:
  title: "Welcome to Getting Started"
  subtitle: "Choose a topic to begin your journey"

  # Layout
  layout:
    type: "grid"
    columns: 3
    gap: "large"

  # Animation
  animation:
    type: "stagger-fade-in"
    delay_between_items: "0.1s"

  # Agenda items (the cards users see)
  items:
    - id: "intro"
      order: 1
      titles:
        agenda_title: "Introduction"
      description: "Get started with the basics"
      icon: "BookOpen"
      target:
        type: "page"
        page_id: "introduction"
      color_theme: "blue"

    - id: "features"
      order: 2
      titles:
        agenda_title: "Key Features"
      description: "Discover what you can do"
      icon: "Star"
      target:
        type: "page"
        page_id: "features"
      color_theme: "emerald"

    - id: "next"
      order: 3
      titles:
        agenda_title: "Next Steps"
      description: "Where to go from here"
      icon: "ArrowRight"
      target:
        type: "page"
        page_id: "next-steps"
      color_theme: "violet"
```

### 3.2 What you just did

- **Created a landing page** with 3 clickable cards
- **Each card** navigates to a different page
- **Used stagger animation** (cards fade in sequentially)
- **Chose icons** from Lucide icon library

---

## Step 4: Create Page 1 - Introduction (3 minutes)

### 4.1 Create `pages/introduction.md`

Create file: `content/pages/cards/getting-started/pages/introduction.md`

Copy and paste this:

```yaml
page:
  id: "introduction"

  # Titles for different contexts
  titles:
    page_header: "Introduction to the Platform"
    menu_title: "Introduction"
    agenda_title: "Introduction"
    breadcrumb: "Intro"

  # Descriptions
  description:
    short: "Platform basics"
    long: "Learn the fundamental concepts and get oriented"

  # Metadata
  metadata:
    author: "Platform Team"
    tags: ["introduction", "beginner"]
    difficulty: "beginner"
    estimated_time: "5 minutes"

  # No parent (top-level page)
  parent: null

  # Icon
  icon: "BookOpen"

# Page content sections
sections:
  # Hero section (big title)
  - type: "hero"
    heading: "Welcome to the Platform!"
    subtitle: "Let's get you started on the right foot"

  # Introduction text
  - type: "text"
    content: |
      This platform helps you manage and deploy your applications efficiently.

      In this guide, you'll learn:
      - The core concepts
      - How to navigate the platform
      - Key features and capabilities

  # Alert callout
  - type: "alert"
    alert_type: "info"
    title: "New User?"
    content: "If this is your first time, take your time to explore each section!"

  # Simple list
  - type: "list"
    list_style: "bullet"
    items:
      - "Easy to use interface"
      - "Powerful automation capabilities"
      - "Enterprise-grade security"
      - "Comprehensive documentation"

  # Text with link to next page
  - type: "text_with_links"
    content: |
      Ready to explore? Check out our [[Key Features|features]] next!

# No sub-pages for this simple page
sub_pages: []

# Navigation config
navigation:
  show_breadcrumbs: true
  show_back_button: false  # First page, no back needed
  show_next_previous: true
  back_to_agenda_button: true

  siblings:
    previous: null  # First page
    next: "features"
```

### 4.2 What you just did

- **Created a welcome page** with hero heading
- **Added informative text** and lists
- **Included an alert** for new users
- **Added a navigation link** to the next page
- **Configured navigation** (breadcrumbs, next button)

---

## Step 5: Create Page 2 - Key Features (3 minutes)

### 5.1 Create `pages/features.md`

Create file: `content/pages/cards/getting-started/pages/features.md`

Copy and paste this:

```yaml
page:
  id: "features"

  titles:
    page_header: "Key Features and Capabilities"
    menu_title: "Features"
    agenda_title: "Key Features"
    breadcrumb: "Features"

  description:
    short: "Explore main features"
    long: "Discover the powerful features available to you"

  metadata:
    tags: ["features", "capabilities"]
    difficulty: "beginner"
    estimated_time: "5 minutes"

  parent: null
  icon: "Star"

sections:
  # Hero
  - type: "hero"
    heading: "Powerful Features"
    subtitle: "Everything you need to succeed"

  # Expandable section (click to show more)
  - type: "expandable_card"
    trigger: "click_icon"
    icon: "Info"
    collapsed_title: "Why These Features Matter"
    collapsed_text: "Click to learn more..."
    expanded_content: |
      These features are designed to:
      - **Save time** through automation
      - **Reduce errors** with validation
      - **Improve security** with built-in controls
      - **Scale easily** as your needs grow
    animation: "slide-down"

  # Feature grid (3 columns of clickable cards)
  - type: "feature_grid"
    columns: 3
    features:
      - name: "Easy Deployment"
        icon: "Rocket"
        description: "Deploy applications with one click"

      - name: "Real-time Monitoring"
        icon: "Activity"
        description: "Track performance and health"

      - name: "Automated Backups"
        icon: "Database"
        description: "Your data is always protected"

      - name: "Team Collaboration"
        icon: "Users"
        description: "Work together seamlessly"

      - name: "API Integration"
        icon: "Zap"
        description: "Connect with any service"

      - name: "24/7 Support"
        icon: "HeadphonesIcon"
        description: "We're here when you need us"

  # Call to action
  - type: "alert"
    alert_type: "success"
    title: "Ready to Get Started?"
    content: "Head to the Next Steps page to begin using these features!"

sub_pages: []

navigation:
  show_breadcrumbs: true
  show_back_button: true
  show_next_previous: true
  back_to_agenda_button: true

  siblings:
    previous: "introduction"
    next: "next-steps"
```

### 5.2 What you just did

- **Created a features page** with expandable content
- **Added a feature grid** with 6 features
- **Used icons** to make it visual
- **Added navigation** to previous and next pages

---

## Step 6: Create Page 3 - Next Steps (2 minutes)

### 6.1 Create `pages/next-steps.md`

Create file: `content/pages/cards/getting-started/pages/next-steps.md`

Copy and paste this:

```yaml
page:
  id: "next-steps"

  titles:
    page_header: "Your Next Steps"
    menu_title: "Next Steps"
    agenda_title: "Next Steps"
    breadcrumb: "Next"

  description:
    short: "Where to go next"
    long: "Recommended actions to continue your journey"

  metadata:
    tags: ["next-steps", "actions"]
    difficulty: "beginner"
    estimated_time: "3 minutes"

  parent: null
  icon: "ArrowRight"

sections:
  # Hero
  - type: "hero"
    heading: "You're Ready to Begin!"
    subtitle: "Here's what to do next"

  # Numbered steps
  - type: "steps"
    orientation: "vertical"
    steps:
      - number: 1
        title: "Explore the Dashboard"
        description: "Familiarize yourself with the main interface"

      - number: 2
        title: "Create Your First Project"
        description: "Start with a simple project to learn the basics"

      - number: 3
        title: "Invite Team Members"
        description: "Collaboration makes everything better"

      - number: 4
        title: "Check Out Advanced Features"
        description: "When you're ready, explore more capabilities"

  # Resources
  - type: "card_list"
    items:
      - icon: "BookOpen"
        title: "Read the Full Documentation"
        description: "Comprehensive guides for every feature"

      - icon: "Video"
        title: "Watch Video Tutorials"
        description: "Visual walkthroughs of common tasks"

      - icon: "MessageCircle"
        title: "Join the Community"
        description: "Connect with other users and get help"

  # Final message
  - type: "alert"
    alert_type: "info"
    title: "Need Help?"
    content: "Contact our support team anytime at support@example.com"

sub_pages: []

navigation:
  show_breadcrumbs: true
  show_back_button: true
  show_next_previous: true
  back_to_agenda_button: true

  siblings:
    previous: "features"
    next: null  # Last page
```

### 6.2 What you just did

- **Created a next steps page** with action items
- **Used numbered steps** for clear progression
- **Added resource cards** for further learning
- **Completed the navigation chain**

---

## Step 7: Test Your Card (2 minutes)

### 7.1 Verify all files exist

Check that you have:
```
content/pages/cards/getting-started/
  ├─ card-definition.md ✓
  ├─ agenda.md ✓
  └─ pages/
      ├─ introduction.md ✓
      ├─ features.md ✓
      └─ next-steps.md ✓
```

### 7.2 Check for errors

- All file paths match in card-definition.md?
- All page IDs match in navigation (siblings)?
- No typos in YAML syntax?

### 7.3 View your card

Open the platform and navigate to your card. You should see:
1. **Agenda page** with 3 colorful cards
2. **Click any card** → navigates to that page
3. **Breadcrumbs** at top showing your path
4. **Page tree** in sidebar showing all pages
5. **Next/Previous buttons** to move between pages
6. **Back to Agenda** button always available

---

## What You've Accomplished

**In 15-30 minutes, you've created:**

✅ A complete card with navigation
✅ An attractive agenda (landing page)
✅ 3 content pages with different section types
✅ Automatic breadcrumbs and navigation
✅ Interactive elements (expandable content, feature grids)
✅ Professional animations

**All without writing any code!**

---

## Next Steps

### Enhance Your Card

**Add more content:**
- Add more pages
- Create sub-pages (nested pages)
- Add images and diagrams

**Make it interactive:**
- Add clickable images
- Create popups
- Use expandable sections

**Improve navigation:**
- Add more agenda items
- Create deeper hierarchies
- Use different navigation styles

### Learn More

**Guides:**
- `hierarchical-navigation-guide.md` - Create nested pages
- `reusing-pages-guide.md` - Save time with page library
- `interactions-guide.md` - Add clicks, animations, popups

**References:**
- `section-types-reference.md` - All 30+ section types
- `animations-reference.md` - Animation options
- `navigation-reference.md` - Navigation patterns
- `metadata-reference.md` - Metadata fields

---

## Common Issues & Solutions

### Issue: Card doesn't appear

**Solution:**
- Check `card-definition.md` has correct `id`
- Verify file is in `content/pages/cards/[card-id]/`
- Restart the platform if needed

### Issue: Page not found when clicking

**Solution:**
- Check page `id` in page file matches `page_id` in target
- Verify file path is correct
- Check for typos in IDs

### Issue: Navigation broken

**Solution:**
- Verify `siblings` IDs match actual page IDs
- Check `parent` field is correct (or null for top-level)
- Ensure all referenced pages exist

### Issue: YAML syntax error

**Solution:**
- Check indentation (use spaces, not tabs)
- Verify all quotes match (`"` or `'`)
- Ensure colons have space after them (`: ` not `:`)
- Use a YAML validator online

---

## Tips for Success

### 1. Start Simple
Begin with 2-3 pages, add more later.

### 2. Copy Examples
Use this guide's examples as templates.

### 3. Use Icons Wisely
Browse [Lucide Icons](https://lucide.dev) for perfect icons.

### 4. Test Often
Create one page, test it, then add more.

### 5. Consistent IDs
Use lowercase-with-hyphens for all IDs.

### 6. Read References
Browse section-types-reference.md for inspiration.

### 7. Reuse Pages
Check the page library before creating new pages.

---

## Customization Ideas

**Make it yours:**

### Change the Theme
```yaml
card:
  color_theme: "emerald"  # Try different colors!
  # Options: blue, emerald, violet, red, amber, indigo, cyan, pink, green, orange
```

### Add Your Logo
```yaml
sections:
  - type: "image"
    image: "/images/your-logo.png"
    alt: "Company Logo"
    size: "medium"
```

### Add a Video
```yaml
sections:
  - type: "video"
    video_url: "https://youtube.com/embed/YOUR_VIDEO_ID"
    caption: "Watch our introduction video"
```

### Make Images Clickable
```yaml
sections:
  - type: "image_clickable"
    image: "/images/diagram.png"
    alt: "Architecture Diagram"
    click_action:
      type: "navigate_to_subpage"
      target: "architecture-detail"
    hover_effect: "zoom"
```

---

## Quick Reference: Section Types

**Most commonly used:**

```yaml
# Hero (page heading)
- type: "hero"
  heading: "Title"
  subtitle: "Subtitle"

# Text paragraph
- type: "text"
  content: "Your text here"

# Feature grid (clickable cards)
- type: "feature_grid"
  columns: 3
  features:
    - name: "Feature"
      icon: "Icon"
      description: "Description"

# Alert/callout
- type: "alert"
  alert_type: "info"  # info, success, warning, error
  title: "Title"
  content: "Message"

# List
- type: "list"
  list_style: "bullet"  # bullet, numbered, checklist
  items:
    - "Item 1"
    - "Item 2"

# Expandable content
- type: "expandable_card"
  trigger: "click_icon"
  icon: "Info"
  collapsed_title: "Click to expand"
  expanded_content: "Hidden content"

# Steps
- type: "steps"
  steps:
    - number: 1
      title: "Step 1"
      description: "Do this"
```

**See section-types-reference.md for all 30+ types!**

---

## Congratulations!

You've successfully created your first card using the template system.

**You learned:**
- How to structure a card
- How to create an agenda
- How to add content pages
- How to configure navigation
- How to use different section types

**This is just the beginning!** The template system supports:
- Unlimited page depth (5+ levels)
- Page reuse from library
- Advanced interactions
- Popups and modals
- Custom animations
- And much more!

**Keep exploring and building great content!**

---

**Last Updated:** December 16, 2024
**Version:** 1.0

**Next:** Try `hierarchical-navigation-guide.md` to create nested pages!
