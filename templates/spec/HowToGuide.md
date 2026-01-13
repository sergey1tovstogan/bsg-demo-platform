# How to Create a New Card

This guide provides a step-by-step process for adding a new card to the Content Template System.

## Overview

Creating a new card involves 5 main steps:
1.  **Structure**: Create the directory hierarchy.
2.  **Definition**: Configure the card's metadata and settings.
3.  **Agenda**: Build the landing page.
4.  **Content**: Author the markdown pages.
5.  **Registration**: Add the card to the global registry.

---

## Step 1: Create Folder Structure

All cards reside in `content/pages/cards/` (for production) or `examples/` (for demos).

Create a new directory for your card:

```bash
mkdir -p content/pages/cards/my-new-card/pages
```

## Step 2: Create Card Definition

Create a `card-definition.md` file in your card's root directory. This acts as the configuration file.

**File:** `content/pages/cards/my-new-card/card-definition.md`

```markdown
---
card:
  id: "my-new-card"
  title: "My New Card Title"
  description: "A brief description of what this card covers."
  # Path to the agenda file relative to this directory
  agenda: "./agenda.md"
  
  # Navigation Configuration
  navigation:
    enable_breadcrumbs: true
    enable_page_tree: true
    enable_search: true
    enable_next_prev: true
    
  # Visual Settings
  settings:
    default_animation: "fade-in"
    show_reading_time: true
---
```

## Step 3: Create the Agenda (Landing Page)

The agenda is the entry point for your card. It typically displays a grid of main topics.

**File:** `content/pages/cards/my-new-card/agenda.md`

```markdown
---
agenda:
  title: "Welcome to My Card"
  subtitle: "Everything you need to know"
  
  # Main navigation entry points
  items:
    - id: "intro"
      title: "Introduction"
      description: "Start your journey here"
      icon: "BookOpen" # Lucide icon name
      target:
        page_id: "intro-page"
    
    - id: "features"
      title: "Key Features"
      description: "Explore capabilities"
      icon: "Star"
      target:
        page_id: "features-page"
---
```

## Step 4: Create Content Pages

Create your markdown content files inside the `pages/` directory. Each file requires a `page` frontmatter block and a list of `sections`.

**File:** `content/pages/cards/my-new-card/pages/intro.md`

```markdown
---
page:
  id: "intro-page"
  title: "Introduction"
  # Parent ID allows breadcrumbs to work (points to agenda item ID or parent page ID)
  parent_id: "intro" 

sections:
  - type: "hero"
    heading: "Introduction"
    subtitle: "Getting started with this topic"
    align: "center"
    
  - type: "text"
    content: |
      ## Welcome
      This is a standard markdown text section. You can use:
      - Bullet points
      - **Bold** and *Italic* text
      - [Links](https://example.com)
      
  - type: "alert"
    alert_type: "info"
    title: "Did you know?"
    content: "You can combine multiple sections to create rich layouts."
---
```

## Step 5: Register the Card

To make your card visible in the Gallery, add it to the index file.

**File:** `content/index.json`

```json
{
  "cards": [
    // ... existing cards ...
    {
      "id": "my-new-card",
      "title": "My New Card Title",
      "description": "Short description for the gallery card.",
      "icon": "Zap", 
      "path": "/content/pages/cards/my-new-card/card-definition.md",
      "category": "technical",
      "tags": ["new", "tutorial"],
      "color_theme": "blue"
    }
  ]
}
```

## Best Practices

*   **Unique IDs**: Ensure every page has a unique `id`.
*   **Hierarchy**: Use `parent_id` to strictly define your breadcrumb trail.
*   **Images**: Store images in `frontend/public/images/` and reference them with `/images/filename.png`.
*   **Reusability**: Check `content/pages/library/` for common pages (like FAQs) you can reuse.
