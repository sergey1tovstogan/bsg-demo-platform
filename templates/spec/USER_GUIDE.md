# Visual Editor & Content Template Guide

Welcome to the **Visual Editor**, a powerful tool designed to help you create rich, interactive documentation cards without writing a single line of code. This guide covers how to use the editor, structure your content, and utilize the full library of 30+ content sections.

---

## 🚀 Getting Started

### Accessing the Editor
1.  **Open the Application**: Navigate to the main dashboard.
2.  **Select "Visual Editor"**: Click on the "Visual Editor" link in the left sidebar (icon with a pen tool).
3.  **Visual Interface**: You will see a split screen:
    *   **Left Panel**: This is your **Code Editor** where you write YAML configuration.
    *   **Right Panel**: This is your **Live Preview** where you see changes instantly.

### Basic Workflow
1.  **Write YAML**: Enter content definition on the left using simple YAML syntax (key: value).
2.  **See Preview**: The right panel updates automatically as you type.
3.  **Copy Code**: Once satisfied, copy the code and save it to the appropriate `.md` file in the project.

---

## 📄 Card Structure

A complete "Card" consists of three main parts:

1.  **Card Definition** (`card-definition.md`): The master configuration file.
2.  **Agenda** (`agenda.md`): The landing page of the card.
3.  **Content Pages**: Individual pages referenced by the agenda/navigation.

### 1. Card Definition (`card-definition.md`)
This file defines the global settings for the card, including metadata, theme, and navigation structure.

```yaml
id: "my-card-id"
name: "My New Card"
category: "Tutorials"
color_theme: "blue"  # Options: blue, emerald, violet, red, amber, indigo, cyan, pink
icon: "Activity"     # Lucide icon name

description:
  short: "A short summary for the gallery."
  long: "A detailed description appearing on the intro."

# Configuration for the landing page
agenda:
  file: "agenda.md"

# Global Navigation Bar
navigation:
  title: "My Card"
  items:
    - id: "intro"
      label: "Introduction"
      icon: "BookOpen"
    - id: "deep-dive"
      label: "Deep Dive"
      icon: "Layers"

# List of all content pages
pages:
  - file: "pages/introduction.md"
  - file: "pages/deep-dive.md"

settings:
  default_animation: "slide_left"
  transition_speed: "normal"
  max_depth: 2
```

### 2. Agenda (`agenda.md`)
The Agenda is the visual table of contents. It greets the user and guides them to specific pages.

```yaml
title: "Welcome to My Card"
subtitle: "Explore the topics below"

layout:
  type: "grid"   # or "list"
  columns: 3     # 2, 3, or 4

items:
  - id: "topic-1"
    title: "Introduction"
    description: "Start your journey here."
    icon: "Flag"
    page_id: "intro"        # Must match a navigation item ID
    status: "active"        # active, locked, completed
    color_theme: "blue"
    
  - id: "topic-2"
    title: "Advanced Concepts"
    description: "Go deeper into the tech."
    icon: "Server"
    page_id: "deep-dive"
    status: "active"
```

---

## 🧩 Content Pages & Sections

Pages are composed of **Sections**. You can mix and match any of the 31 available section types to create rich layouts.

A page file (e.g., `pages/introduction.md`) looks like this:

```yaml
id: "intro"
title: "Introduction Page"
sections:
  - type: "hero"
    title: "Welcome"
    subtitle: "Let's get started"
  
  - type: "text"
    content: "Here is some introductory text..."
```

### Section Library

#### A. Content Display
| Type | Description |
|------|-------------|
| **hero** | Large header with title, subtitle, and optional badges. |
| **text** | Simple markdown text block. |
| **text_with_links** | Markdown text with stylized link list. |
| **image** | Single responsive image with caption. |
| **video** | Embed video player. |
| **code_block** | Syntax-highlighted code snippet with copy button. |
| **quote** | Stylized blockquote or testimonial. |
| **divider** | Visual separator line. |
| **embed** | Embed external content via Iframe. |

**Example: Text with Links**
```yaml
type: "text_with_links"
content: "## Resources\nCheck out these links:"
links:
  - text: "Documentation"
    url: "https://docs.example.com"
    icon: "FileText"
```

#### B. Navigation & Interactive
| Type | Description |
|------|-------------|
| **feature_grid** | Grid of icons/titles/descriptions. |
| **clickable_cards** | Cards that navigate to other pages. |
| **tabbed_content** | Content organized in tabs. |
| **interactive_diagram** | Image with clickable hotspots showing popups. |
| **text_with_navigation** | Text alongside navigational buttons. |

**Example: Feature Grid**
```yaml
type: "feature_grid"
columns: 3
items:
  - title: "Fast"
    description: "Lightning fast performance."
    icon: "Zap"
  - title: "Secure"
    description: "Enterprise grade security."
    icon: "Shield"
```

#### C. Data Presentation
| Type | Description |
|------|-------------|
| **list** | Bulleted or numbered lists. |
| **table** | Data tables with headers and rows. |
| **key_value_pairs** | Label-value definitions. |
| **steps** | Numbered step-by-step instructions. |
| **timeline** | Chronological event list. |
| **comparison_grid** | Side-by-side feature comparison ticks/crosses. |

**Example: Steps**
```yaml
type: "steps"
steps:
  - title: "Install"
    description: "Run `npm install`"
  - title: "Configure"
    description: "Edit config.yaml"
```

#### D. Expandable Content
| Type | Description |
|------|-------------|
| **accordion** | Stack of expandable items. |
| **expandable_section** | Single collapsible block. |
| **expandable_card** | Card that expands for more info. |

**Example: Accordion**
```yaml
type: "accordion"
items:
  - title: "Q: Is it free?"
    content: "A: Yes, the core version is free."
  - title: "Q: Can I upgrade?"
    content: "A: Yes, see pricing page."
```

#### E. Special Elements
| Type | Description |
|------|-------------|
| **alert** | Colored notice boxes (info, success, warning, error). |
| **stats** | Big number statistics display. |
| **tags** | Cloud of badges/tags. |
| **progress** | Progress bars. |
| **gallery** | Grid of images. |
| **download** | List of downloadable files. |
| **loading** | Loading spinners (for async states). |

**Example: Alert**
```yaml
type: "alert"
alert_type: "warning" # info, success, warning, error
title: "Important Note"
content: "Please restart the server after applying changes."
```

---

## 🎬 Interactions & Animations

### Interactive Diagrams
The `interactive_diagram` section allows you to create engaging visual flows.

1.  **Image**: Provide a base image (e.g., architecture diagram).
2.  **Hotspots**: Define interaction points using percentage coordinates (`x`, `y`) from 0-100.
3.  **Popups**: Define the content to show when clicked.

```yaml
type: "interactive_diagram"
image_src: "/images/my-diagram.png"
hotspots:
  - x: 50
    y: 50
    label: "Core Server"
    popup_content:
      title: "Core Server Details"
      description: "This handles the main processing logic."
      type: "info"
```

### Page Animations
Animations are controlled in `card-definition.md` under `settings`:

*   **Slide Left/Right**: Standard horizontal navigation.
*   **Fade**: Subtle dissolve transitions.
*   **Scale**: Zoom in/out effects.
*   **Transition Speed**: `fast`, `normal`, `slow`.

```yaml
settings:
  default_animation: "slide_left"
  transition_speed: "normal"
```

---

## 💡 Best Practices

1.  **Start Simple**: Begin with a clear `agenda` and `intro` page.
2.  **Mix Visuals**: Alternate between text-heavy sections and visual sections (grids, images, diagrams) to keep engagement high.
3.  **Use Icons**: We use the **Lucide** icon library. You can use any valid Lucide icon name (e.g., `ArrowRight`, `Settings`, `User`).
4.  **Consistency**: Stick to a consistent `color_theme` for your card to build brand identity.
5.  **Test**: Use the Visual Editor to preview your YAML before committing it to a file.

Happy creating! 🚀
