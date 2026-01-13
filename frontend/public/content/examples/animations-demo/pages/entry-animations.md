# Entry Animations Demo

```yaml
page:
  id: "entry-animations"

  titles:
    page_header: "Entry Animations"
    menu_title: "Entry Animations"
    agenda_title: "Entry Animations"
    breadcrumb: "Entry"

  description:
    short: "How elements appear on page load"
    long: "Demonstration of all entry animation types available in the system"

  parent: null
  icon: "MoveDown"

sections:
  - type: "hero"
    heading: "Entry Animations"
    subtitle: "Watch how different animation styles bring content to life"
    align: "center"

  - type: "text"
    content: |
      Entry animations control how elements appear when a page loads.
      The default animation for this page is **fade-in**, but each card below
      represents a different animation style you can use.

  - type: "alert"
    alert_type: "info"
    title: "How to Use"
    content: |
      To apply these animations, set `default_animation` in your card settings:
      ```yaml
      settings:
        default_animation: "slide-in-up"
      ```

  - type: "divider"

  # Demonstrate different animations with cards
  - type: "clickable_cards"
    columns: 3
    cards:
      - title: "fade-in"
        description: "Simple opacity transition (default). Smooth and professional."
        icon: "Sparkles"
        click_action:
          type: "show_popup"
          popup_id: "fade-in-detail"

      - title: "slide-in-up"
        description: "Slides up from below. Great for cards and content blocks."
        icon: "ArrowUp"
        click_action:
          type: "show_popup"
          popup_id: "slide-in-up-detail"

      - title: "slide-in-down"
        description: "Slides down from above. Perfect for headers and notifications."
        icon: "ArrowDown"
        click_action:
          type: "show_popup"
          popup_id: "slide-in-down-detail"

      - title: "slide-in-left"
        description: "Slides in from left. Good for sequential items."
        icon: "ArrowLeft"
        click_action:
          type: "show_popup"
          popup_id: "slide-in-left-detail"

      - title: "slide-in-right"
        description: "Slides in from right. Alternative flow direction."
        icon: "ArrowRight"
        click_action:
          type: "show_popup"
          popup_id: "slide-in-right-detail"

      - title: "scale-in"
        description: "Grows from small to full size. Great for icons and callouts."
        icon: "Maximize"
        click_action:
          type: "show_popup"
          popup_id: "scale-in-detail"

      - title: "bounce-in"
        description: "Playful bounce effect. Use sparingly for special content!"
        icon: "Disc"
        click_action:
          type: "show_popup"
          popup_id: "bounce-in-detail"

      - title: "stagger-fade-in"
        description: "Children fade in sequentially. Perfect for lists and grids."
        icon: "List"
        click_action:
          type: "show_popup"
          popup_id: "stagger-detail"

      - title: "none"
        description: "No animation. Instant appearance for performance."
        icon: "Zap"
        click_action:
          type: "show_popup"
          popup_id: "none-detail"

  - type: "divider"

  - type: "text"
    content: |
      ### Animation Speed

      Control how fast animations run with `transition_speed`:
      - **fast** (150ms) - Snappy and modern
      - **normal** (300ms) - Default, well balanced
      - **slow** (500ms) - Deliberate emphasis
      - Custom: "250ms", "400ms", etc.

  - type: "code_block"
    language: "yaml"
    code: |
      card:
        settings:
          default_animation: "slide-in-up"
          transition_speed: "300ms"

popups:
  - id: "fade-in-detail"
    title: "fade-in Animation"
    sections:
      - type: "text"
        content: |
          **Effect:** Element fades from transparent to visible (opacity 0 → 1)

          **Best for:**
          - Default choice for most content
          - Text-heavy pages
          - Professional, subtle appearance

          **Example:**
          ```yaml
          settings:
            default_animation: "fade-in"
          ```

  - id: "slide-in-up-detail"
    title: "slide-in-up Animation"
    sections:
      - type: "text"
        content: |
          **Effect:** Element moves from below viewport while fading in

          **Best for:**
          - Cards and panels
          - Content blocks
          - Feature grids

          **Example:**
          ```yaml
          settings:
            default_animation: "slide-in-up"
          ```

  - id: "slide-in-down-detail"
    title: "slide-in-down Animation"
    sections:
      - type: "text"
        content: |
          **Effect:** Element moves from above viewport while fading in

          **Best for:**
          - Headers and hero sections
          - Dropdowns and menus
          - Notifications

          **Example:**
          ```yaml
          settings:
            default_animation: "slide-in-down"
          ```

  - id: "slide-in-left-detail"
    title: "slide-in-left Animation"
    sections:
      - type: "text"
        content: |
          **Effect:** Element moves from left side while fading in

          **Best for:**
          - Sidebar content
          - Sequential items
          - Reading flow emphasis

          **Example:**
          ```yaml
          settings:
            default_animation: "slide-in-left"
          ```

  - id: "slide-in-right-detail"
    title: "slide-in-right Animation"
    sections:
      - type: "text"
        content: |
          **Effect:** Element moves from right side while fading in

          **Best for:**
          - Opposite sidebar content
          - Alternative views
          - Contextual information

          **Example:**
          ```yaml
          settings:
            default_animation: "slide-in-right"
          ```

  - id: "scale-in-detail"
    title: "scale-in Animation"
    sections:
      - type: "text"
        content: |
          **Effect:** Element grows from 80% to full size (scale 0.8 → 1.0) + fade

          **Best for:**
          - Icons and badges
          - Important callouts
          - Interactive elements

          **Example:**
          ```yaml
          settings:
            default_animation: "scale-in"
          ```

  - id: "bounce-in-detail"
    title: "bounce-in Animation"
    sections:
      - type: "text"
        content: |
          **Effect:** Bouncy spring animation with fade-in

          **Best for:**
          - Success messages
          - Achievements
          - Playful, fun content
          - **Use sparingly!**

          **Example:**
          ```yaml
          settings:
            default_animation: "bounce-in"
          ```

  - id: "stagger-detail"
    title: "stagger-fade-in Animation"
    sections:
      - type: "text"
        content: |
          **Effect:** Children elements fade in sequentially with delay

          **Best for:**
          - Lists of items
          - Grid layouts
          - Agenda cards
          - Navigation menus

          **Example:**
          ```yaml
          agenda:
            animation:
              type: "stagger-fade-in"
              delay_between_items: "0.1s"
          ```

          **Delay options:**
          - 0.05s - Fast (many items)
          - 0.1s - Standard (recommended)
          - 0.15s - Slow (emphasis)

  - id: "none-detail"
    title: "none (No Animation)"
    sections:
      - type: "text"
        content: |
          **Effect:** Instant appearance, no transition

          **Best for:**
          - Performance-critical pages
          - Simple content
          - Accessibility preference (reduced motion)
          - Testing purposes

          **Example:**
          ```yaml
          settings:
            default_animation: "none"
          ```

navigation:
  show_breadcrumbs: true
  show_page_tree: true
  show_next_previous: true
  back_to_agenda_button: true
```
