# Expandable Content Animations

```yaml
page:
  id: "expandable-animations"

  titles:
    page_header: "Expandable Content Animations"
    menu_title: "Expandables"
    agenda_title: "Expandable Animations"
    breadcrumb: "Expandables"

  description:
    short: "Animations for collapsible sections"
    long: "See how expandable content smoothly reveals and hides with different animation styles"

  parent: null
  icon: "ChevronsDownUp"

sections:
  - type: "hero"
    heading: "Expandable Content Animations"
    subtitle: "Click to expand and see different animation styles"
    align: "center"

  - type: "text"
    content: |
      Expandable sections use animations to smoothly reveal hidden content.
      Click on each section below to see the different animation options!

  # slide-down example (most common)
  - type: "expandable_card"
    trigger: "click"
    icon: "ChevronDown"
    collapsed_title: "slide-down (Default & Recommended)"
    collapsed_text: "Content slides down smoothly"
    expanded_content: |
      **Effect:** Height transitions from 0 to auto with smooth motion

      **Best for:**
      - Expandable sections (default choice)
      - Accordions
      - Dropdowns
      - FAQ sections

      **Example:**
      ```yaml
      - type: "expandable_section"
        expanded:
          animation: "slide-down"
      ```

      **Why it's default:** Natural, intuitive motion that matches user expectation.
    animation: "slide-down"

  - type: "expandable_card"
    trigger: "click"
    icon: "ChevronUp"
    collapsed_title: "slide-up"
    collapsed_text: "Content slides up when expanding"
    expanded_content: |
      **Effect:** Height transitions from bottom, slides upward

      **Best for:**
      - Bottom-aligned content
      - Upward expanding menus
      - Footer panels

      **Example:**
      ```yaml
      - type: "expandable_section"
        expanded:
          animation: "slide-up"
      ```

      **Use case:** When content needs to expand upward rather than downward.
    animation: "slide-up"

  - type: "expandable_card"
    trigger: "click"
    icon: "Sparkles"
    collapsed_title: "fade-in"
    collapsed_text: "Content fades in without sliding"
    expanded_content: |
      **Effect:** Simple opacity transition (0 → 1), no sliding

      **Best for:**
      - Simple reveals
      - Subtle changes
      - Text-heavy content
      - Minimal motion preference

      **Example:**
      ```yaml
      - type: "expandable_card"
        expanded:
          animation: "fade-in"
      ```

      **When to use:** When you want the least intrusive animation or when content is very text-heavy.
    animation: "fade-in"

  - type: "expandable_card"
    trigger: "click"
    icon: "Maximize"
    collapsed_title: "scale-expand"
    collapsed_text: "Content scales from center"
    expanded_content: |
      **Effect:** Scales from center point + fade-in (scale 0.95 → 1.0)

      **Best for:**
      - Modal-like expansions
      - Dramatic reveals
      - Important content

      **Example:**
      ```yaml
      - type: "expandable_section"
        expanded:
          animation: "scale-expand"
      ```

      **⚠️ Use sparingly!** This is a more dramatic animation, best reserved for special content.
    animation: "scale-expand"

  - type: "divider"

  - type: "text"
    content: |
      ### Accordion Example

      Accordions automatically use slide-down animation for consistent behavior:

  - type: "accordion"
    allow_multiple: false
    items:
      - title: "What are expandable animations?"
        content: |
          Expandable animations control how hidden content is revealed when users
          click to expand a section. The animation makes the transition smooth and
          helps users understand what's happening.

      - title: "Which animation should I use?"
        content: |
          **Default recommendation:** Use `slide-down` for most cases.

          - **slide-down**: Standard, intuitive (default)
          - **fade-in**: Subtle, minimal motion
          - **slide-up**: Special upward cases
          - **scale-expand**: Dramatic reveals (use sparingly)

      - title: "Can I customize animation speed?"
        content: |
          Yes! You can control animation speed:

          ```yaml
          - type: "expandable_section"
            expanded:
              animation: "slide-down"
              animation_speed: "fast"  # fast, normal, slow
          ```

          **Speeds:**
          - fast: 150ms
          - normal: 300ms (default)
          - slow: 500ms

  - type: "divider"

  - type: "alert"
    alert_type: "info"
    title: "Best Practice"
    content: |
      Stick with `slide-down` for most expandable content. It's the most natural
      and expected animation for users. Only use alternatives when you have a
      specific design reason!

navigation:
  show_breadcrumbs: true
  show_page_tree: true
  show_next_previous: true
  back_to_agenda_button: true
```
