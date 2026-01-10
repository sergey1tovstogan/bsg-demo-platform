# Hover Effects Demo

```yaml
page:
  id: "hover-effects"

  titles:
    page_header: "Hover Effects"
    menu_title: "Hover Effects"
    agenda_title: "Hover Effects"
    breadcrumb: "Hover"

  description:
    short: "Interactive hover animations"
    long: "See how interactive elements respond when you hover over them"

  parent: null
  icon: "MousePointer"

sections:
  - type: "hero"
    heading: "Hover Effects"
    subtitle: "Move your mouse over the cards below to see the effects"
    align: "center"

  - type: "text"
    content: |
      Hover effects provide visual feedback when users interact with clickable elements.
      Try hovering over each card below to see the different animation styles!

  - type: "alert"
    alert_type: "info"
    title: "💡 Tip"
    content: "Hover effects are automatically faster than entry animations (150-200ms) for responsive feedback."

  - type: "divider"

  # Note: Since we can't actually set different hover effects per card in feature_grid,
  # we'll describe them in the content and use popups to explain
  - type: "feature_grid"
    columns: 3
    features:
      - name: "zoom"
        icon: "ZoomIn"
        description: "Element slightly enlarges (scale 1.0 → 1.05). Perfect for images and cards."
        hover_effect: "zoom"
        click_action:
          type: "show_popup"
          popup_id: "zoom-detail"

      - name: "lift"
        icon: "MoveUp"
        description: "Element rises with enhanced shadow. Great for cards and panels."
        hover_effect: "lift"
        click_action:
          type: "show_popup"
          popup_id: "lift-detail"

      - name: "glow"
        icon: "Sparkle"
        description: "Subtle glow or border highlight. Ideal for icons and badges."
        hover_effect: "glow"
        click_action:
          type: "show_popup"
          popup_id: "glow-detail"

      - name: "border"
        icon: "Square"
        description: "Border color change or appearance. Good for outlined elements."
        hover_effect: "border"
        click_action:
          type: "show_popup"
          popup_id: "border-detail"

      - name: "brightness"
        icon: "Sun"
        description: "Image brightness increases. Perfect for photo galleries."
        hover_effect: "brightness"
        click_action:
          type: "show_popup"
          popup_id: "brightness-detail"

  - type: "divider"

  - type: "text"
    content: |
      ### Usage Examples

      Hover effects are applied to specific interactive sections:

  - type: "code_block"
    language: "yaml"
    code: |
      # On clickable images
      - type: "image_clickable"
        src: "/images/diagram.png"
        hover_effect: "zoom"
        click_action:
          type: "navigate_to_subpage"
          target: "detail-page"

      # On feature grids
      - type: "feature_grid"
        features:
          - name: "Feature"
            hover_effect: "lift"

      # On image galleries
      - type: "gallery"
        images:
          - src: "/images/photo.png"
            hover_effect: "brightness"

popups:
  - id: "zoom-detail"
    title: "zoom Effect"
    sections:
      - type: "text"
        content: |
          **Visual Effect:** Element smoothly scales from 1.0 to 1.05

          **Best for:**
          - Images (clickable or in galleries)
          - Cards and panels
          - Buttons
          - Any clickable element

          **Example:**
          ```yaml
          - type: "image_clickable"
            src: "/images/architecture.png"
            hover_effect: "zoom"
          ```

      - type: "alert"
        alert_type: "success"
        content: "Most versatile hover effect. Works great on almost any clickable element!"

  - id: "lift-detail"
    title: "lift Effect"
    sections:
      - type: "text"
        content: |
          **Visual Effect:** Element translates up slightly + shadow becomes more prominent

          **Best for:**
          - Cards
          - Panels
          - Interactive containers
          - Feature grids

          **Example:**
          ```yaml
          - type: "clickable_cards"
            cards:
              - title: "Feature"
                hover_effect: "lift"
          ```

      - type: "alert"
        alert_type: "info"
        content: "Creates depth and makes cards feel more interactive!"

  - id: "glow-detail"
    title: "glow Effect"
    sections:
      - type: "text"
        content: |
          **Visual Effect:** Subtle glow or border highlight appears

          **Best for:**
          - Icons
          - Badges
          - Small special elements
          - Accent highlights

          **Example:**
          ```yaml
          - type: "feature_grid"
            features:
              - name: "Security"
                icon: "Shield"
                hover_effect: "glow"
          ```

  - id: "border-detail"
    title: "border Effect"
    sections:
      - type: "text"
        content: |
          **Visual Effect:** Border color changes or becomes visible

          **Best for:**
          - Images in grids
          - Outlined elements
          - Selection indicators
          - Thumbnail navigation

          **Example:**
          ```yaml
          - type: "image_clickable"
            src: "/images/screenshot.png"
            hover_effect: "border"
          ```

  - id: "brightness-detail"
    title: "brightness Effect"
    sections:
      - type: "text"
        content: |
          **Visual Effect:** Image brightness filter increases

          **Best for:**
          - Image galleries
          - Photo grids
          - Thumbnails
          - Product images

          **Example:**
          ```yaml
          - type: "gallery"
            columns: 3
            images:
              - src: "/images/photo1.png"
                hover_effect: "brightness"
          ```

      - type: "alert"
        alert_type: "warning"
        content: "Best used specifically for images, not text-based cards."

navigation:
  show_breadcrumbs: true
  show_page_tree: true
  show_next_previous: true
  back_to_agenda_button: true
```
