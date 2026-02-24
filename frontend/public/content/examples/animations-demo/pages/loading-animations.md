# Loading Animations Demo

```yaml
page:
  id: "loading-animations"

  titles:
    page_header: "Loading Animations"
    menu_title: "Loading States"
    agenda_title: "Loading Animations"
    breadcrumb: "Loading"

  description:
    short: "Various loading animation styles"
    long: "Different ways to show loading states while content is being fetched"

  parent: null
  icon: "Loader"

sections:
  - type: "hero"
    heading: "Loading Animations"
    subtitle: "Indicate progress while content loads"
    align: "center"

  - type: "text"
    content: |
      Loading animations provide feedback to users while content is being fetched or processed.
      Choose the right style based on your use case and design needs.

  - type: "alert"
    alert_type: "info"
    title: "When to Use"
    content: "Show loading states for any operation that takes more than 200-300ms to complete."

  - type: "divider"

  - type: "text"
    content: |
      ### Available Loading Styles

  - type: "feature_grid"
    columns: 2
    features:
      - name: "spinner"
        icon: "Loader"
        description: "Rotating circle. The default and most common loading indicator."
        click_action:
          type: "show_popup"
          popup_id: "spinner-detail"

      - name: "dots"
        icon: "MoreHorizontal"
        description: "Bouncing dots. Lightweight and subtle, great for inline loading."
        click_action:
          type: "show_popup"
          popup_id: "dots-detail"

      - name: "pulse"
        icon: "Activity"
        description: "Pulsing element. Perfect for skeleton screens and placeholders."
        click_action:
          type: "show_popup"
          popup_id: "pulse-detail"

      - name: "skeleton"
        icon: "LayoutGrid"
        description: "Content-shaped placeholders. Best UX - shows page structure."
        click_action:
          type: "show_popup"
          popup_id: "skeleton-detail"

  - type: "divider"

  - type: "text"
    content: |
      ### Usage Example

  - type: "code_block"
    language: "yaml"
    code: |
      # Simple spinner
      sections:
        - type: "loading"
          style: "spinner"
          message: "Loading content..."

      # Dots with message
        - type: "loading"
          style: "dots"
          message: "Please wait"

      # Skeleton screen
        - type: "loading"
          style: "skeleton"
          layout: "card"  # card, list, text

  - type: "divider"

  - type: "text"
    content: |
      ### Choosing the Right Loading Style

  - type: "comparison_grid"
    items:
      - heading: "Quick Operations"
        subheading: "< 2 seconds"
        points:
          - text: "Use: spinner or dots"
            highlight: true
          - text: "Simple and effective"
            highlight: false
          - text: "Don't overthink it"
            highlight: false

      - heading: "Longer Operations"
        subheading: "> 2 seconds"
        points:
          - text: "Use: skeleton screens"
            highlight: true
          - text: "Shows page structure"
            highlight: true
          - text: "Better perceived performance"
            highlight: true

  - type: "divider"

  - type: "expandable_card"
    trigger: "click"
    icon: "Info"
    collapsed_title: "Performance Tip"
    collapsed_text: "Click to learn about perceived performance"
    expanded_content: |
      **Skeleton screens** dramatically improve perceived performance!

      Users feel the page loads faster when they see the structure appearing,
      even if the actual load time is the same. This is why skeleton screens
      are used by major platforms like Facebook, LinkedIn, and Medium.

      **Rule of thumb:**
      - If loading takes > 2 seconds → use skeleton
      - If loading is quick (< 2 seconds) → use spinner or dots
    animation: "slide-down"

popups:
  - id: "spinner-detail"
    title: "Spinner Loading"
    sections:
      - type: "text"
        content: |
          **Visual:** Rotating circle animation

          **Best for:**
          - Default loading state
          - API calls
          - General content loading
          - Quick operations (< 2 seconds)

          **Example:**
          ```yaml
          - type: "loading"
            style: "spinner"
            message: "Loading..."
          ```

      - type: "alert"
        alert_type: "success"
        content: "Most common and versatile. When in doubt, use spinner!"

  - id: "dots-detail"
    title: "Dots Loading"
    sections:
      - type: "text"
        content: |
          **Visual:** Three bouncing dots (...)

          **Best for:**
          - Lightweight indicators
          - Inline loading
          - Text content loading
          - Chat/messaging interfaces

          **Example:**
          ```yaml
          - type: "loading"
            style: "dots"
            message: "Typing"
          ```

      - type: "alert"
        alert_type: "info"
        content: "More subtle than spinner. Good for inline contexts."

  - id: "pulse-detail"
    title: "Pulse Loading"
    sections:
      - type: "text"
        content: |
          **Visual:** Gentle pulsing/fading animation

          **Best for:**
          - Skeleton screens
          - Content placeholders
          - Card loading states
          - Image placeholders

          **Example:**
          ```yaml
          - type: "loading"
            style: "pulse"
          ```

      - type: "alert"
        alert_type: "info"
        content: "Often combined with skeleton layouts for the best UX."

  - id: "skeleton-detail"
    title: "Skeleton Loading"
    sections:
      - type: "text"
        content: |
          **Visual:** Content-shaped gray boxes that pulse

          **Best for:**
          - Better UX than spinners
          - Card grids
          - List views
          - Long-loading content (> 2 seconds)

          **Example:**
          ```yaml
          - type: "loading"
            style: "skeleton"
            layout: "card"  # card, list, text
          ```

          **Layout options:**
          - `card`: Shows card-shaped placeholders
          - `list`: Shows list item placeholders
          - `text`: Shows text line placeholders

      - type: "alert"
        alert_type: "success"
        content: "Best perceived performance! Shows page structure while loading."

      - type: "text"
        content: |
          ### Why Skeleton Screens Are Better

          **Traditional spinner:** "Wait... something is happening"
          **Skeleton screen:** "Here's what's coming... almost ready!"

          Skeleton screens:
          - Show page structure immediately
          - Reduce perceived wait time
          - Feel more polished and modern
          - Match the shape of the actual content

navigation:
  show_breadcrumbs: true
  show_page_tree: true
  show_next_previous: true
  back_to_agenda_button: true
```
