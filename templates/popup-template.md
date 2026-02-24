# Popup Template

**Purpose:** Modal/overlay content that appears on demand
**Use this for:** Quick information, detailed explanations, or focused content without leaving current page
**Related:** page-template.md, subpage-template.md

---

## Template Structure

```yaml
popup:
  # === POPUP IDENTIFICATION ===
  id: "popup-unique-id"  # Required. Unique identifier (lowercase, hyphenated)

  # === APPEARANCE ===
  size: "medium"  # Required. small, medium, large, full-screen
  animation: "scale-in"  # Optional. fade-in, slide-in-right, slide-in-left, slide-in-top, scale-in

  # === CONTENT ===
  title: "Popup Title"  # Required. Main heading shown at top of popup

  # Sections (same types as page sections)
  sections:
    - type: "text"
      content: "Content here..."

    - type: "image"
      src: "/images/example.png"
      alt: "Description"

  # === ACTIONS (Footer Buttons) ===
  actions:
    - label: "Button Text"  # Button label
      action:
        type: "navigate_to_page"  # navigate_to_page, navigate_to_subpage, external_link, close_popup
        target: "page-id"  # Target page/subpage ID or URL

    - label: "Close"
      action:
        type: "close_popup"
```

---

## How Popups Are Triggered

Popups are **defined in pages** but **triggered by user actions**. The popup definition goes in the page file, but the trigger is defined in the section that opens it.

### Trigger from Feature Grid
```yaml
# In page file
sections:
  - type: "feature_grid"
    columns: 3
    features:
      - name: "Data Protection"
        icon: "Lock"
        description: "Encrypt sensitive data"
        click_action:
          type: "show_popup"
          popup_id: "popup-data-protection"  # References popup ID

# Popup definition in same page file
popups:
  - id: "popup-data-protection"
    size: "large"
    title: "Data Protection Details"
    sections:
      - type: "text"
        content: "Detailed information..."
```

### Trigger from Clickable Image
```yaml
sections:
  - type: "image_clickable"
    image: "/images/diagram.png"
    alt: "Architecture Diagram"
    click_action:
      type: "show_popup"
      popup_id: "popup-architecture-detail"

popups:
  - id: "popup-architecture-detail"
    size: "full-screen"
    title: "Architecture Deep Dive"
    sections:
      - type: "image"
        src: "/images/detailed-architecture.png"
```

### Trigger from Interactive Diagram Hotspot
```yaml
sections:
  - type: "interactive_diagram"
    image: "/images/system-diagram.png"
    hotspots:
      - x: 30             # X percentage (0-100, left to right)
        y: 50             # Y percentage (0-100, top to bottom)
        radius: 50        # Pixels (50-60 recommended)
        click_action:
          type: "show_popup"
          popup_id: "popup-component-a"
        hover_text: "Click to learn more about Component A"

      - x: 70             # Right side hotspot
        y: 50
        radius: 50
        click_action:
          type: "navigate_to_subpage"
          target: "detail-page"
        hover_text: "View component details"
    # Hotspots are invisible - users discover them by hovering

popups:
  - id: "popup-component-a"
    size: "medium"
    title: "Component A Details"
    sections:
      - type: "text"
        content: "Component A handles..."
```

---

## Popup Sizes

Choose size based on content amount:

### Small
```yaml
popup:
  id: "popup-small-example"
  size: "small"  # ~400px wide, good for quick tips
  title: "Quick Tip"
  sections:
    - type: "text"
      content: "Short message or tip"
```

### Medium
```yaml
popup:
  id: "popup-medium-example"
  size: "medium"  # ~600px wide, good for detailed info
  title: "More Information"
  sections:
    - type: "text"
      content: "Detailed explanation with multiple paragraphs"
    - type: "image"
      src: "/images/example.png"
```

### Large
```yaml
popup:
  id: "popup-large-example"
  size: "large"  # ~800px wide, good for comprehensive content
  title: "Comprehensive Guide"
  sections:
    - type: "text"
      content: "Extensive documentation..."
    - type: "code_block"
      language: "yaml"
      code: |
        configuration:
          key: value
```

### Full-Screen
```yaml
popup:
  id: "popup-fullscreen-example"
  size: "full-screen"  # Full browser window, good for large images/diagrams
  title: "Full Architecture Diagram"
  sections:
    - type: "image"
      src: "/images/large-diagram.png"
      alt: "Complete system architecture"
```

---

## Animation Types

### Scale-In (Default, Recommended)
```yaml
popup:
  animation: "scale-in"  # Popup grows from center
```

### Fade-In
```yaml
popup:
  animation: "fade-in"  # Popup fades in smoothly
```

### Slide-In (Directional)
```yaml
popup:
  animation: "slide-in-right"  # Slides in from right
  # or: slide-in-left, slide-in-top, slide-in-bottom
```

---

## Supported Section Types in Popups

Popups support most page section types. Common ones:

### 1. Text Section
```yaml
sections:
  - type: "text"
    content: |
      Regular paragraph text.
      Multiple paragraphs supported.
```

### 2. Image
```yaml
sections:
  - type: "image"
    src: "/images/example.png"
    alt: "Descriptive alt text"
    caption: "Optional caption"
```

### 3. Code Block
```yaml
sections:
  - type: "code_block"
    language: "yaml"  # yaml, javascript, python, etc.
    code: |
      example:
        key: "value"
```

### 4. List
```yaml
sections:
  - type: "list"
    list_style: "bullet"  # bullet, numbered, checklist
    items:
      - "First item"
      - "Second item"
      - "Third item"
```

### 5. Alert/Callout
```yaml
sections:
  - type: "alert"
    alert_type: "warning"  # info, success, warning, error
    title: "Important"
    content: "Warning message"
```

### 6. Comparison Grid
```yaml
sections:
  - type: "comparison_grid"
    columns: 2
    items:
      - heading: "Option A"
        points:
          - "Feature 1"
          - "Feature 2"
      - heading: "Option B"
        points:
          - "Feature X"
          - "Feature Y"
```

### 7. Video
```yaml
sections:
  - type: "video"
    video_url: "https://youtube.com/embed/video-id"
    caption: "Optional video caption"
```

---

## Action Buttons

Popups can have multiple action buttons in the footer.

### Navigate to Page
```yaml
actions:
  - label: "View Full Page"
    action:
      type: "navigate_to_page"
      target: "full-page-id"
```

### Navigate to Sub-Page
```yaml
actions:
  - label: "Learn More"
    action:
      type: "navigate_to_subpage"
      target: "detailed-subpage-id"
```

### External Link
```yaml
actions:
  - label: "Official Docs"
    action:
      type: "external_link"
      url: "https://docs.example.com"
```

### Close Popup (Always Include This)
```yaml
actions:
  - label: "Close"
    action:
      type: "close_popup"
```

---

## Complete Example: Info Popup

```yaml
popup:
  id: "popup-sso-overview"
  size: "medium"
  animation: "scale-in"
  title: "Single Sign-On Overview"

  sections:
    # Introduction text
    - type: "text"
      content: |
        Single Sign-On (SSO) allows users to log in once and access
        multiple applications without re-entering credentials.

    # Image
    - type: "image"
      src: "/images/sso-flow-diagram.png"
      alt: "SSO Authentication Flow"
      caption: "How SSO authentication works"

    # Key benefits list
    - type: "list"
      list_style: "bullet"
      items:
        - "Improved user experience"
        - "Reduced password fatigue"
        - "Enhanced security"
        - "Centralized access control"

    # Alert callout
    - type: "alert"
      alert_type: "info"
      title: "Implementation Required"
      content: "SSO requires configuration with your identity provider (Okta, Azure AD, etc.)"

  actions:
    - label: "View Full SSO Guide"
      action:
        type: "navigate_to_subpage"
        target: "sso-implementation-guide"
    - label: "Close"
      action:
        type: "close_popup"
```

---

## Complete Example: Code Documentation Popup

```yaml
popup:
  id: "popup-api-config"
  size: "large"
  animation: "fade-in"
  title: "API Configuration Example"

  sections:
    # Explanation
    - type: "text"
      content: |
        Configure your API integration by adding the following
        to your configuration file:

    # Code example
    - type: "code_block"
      language: "yaml"
      code: |
        api:
          endpoint: "https://api.example.com/v1"
          authentication:
            type: "oauth2"
            client_id: "your-client-id"
            client_secret: "your-client-secret"
          timeout: 30
          retry:
            max_attempts: 3
            backoff: "exponential"

    # Warning
    - type: "alert"
      alert_type: "warning"
      title: "Security Best Practice"
      content: "Never commit credentials to version control. Use environment variables."

    # Next steps
    - type: "text"
      content: |
        After configuration, test your connection using the
        validation endpoint: /api/validate

  actions:
    - label: "View Full API Documentation"
      action:
        type: "external_link"
        url: "https://api-docs.example.com"
    - label: "Close"
      action:
        type: "close_popup"
```

---

## Complete Example: Comparison Popup

```yaml
popup:
  id: "popup-saml-vs-oauth"
  size: "large"
  animation: "slide-in-top"
  title: "SAML vs OAuth Comparison"

  sections:
    # Introduction
    - type: "text"
      content: |
        Both SAML and OAuth are authentication protocols, but they
        serve different purposes and use cases.

    # Comparison grid
    - type: "comparison_grid"
      columns: 2
      items:
        - heading: "SAML 2.0"
          points:
            - "XML-based protocol"
            - "Enterprise SSO standard"
            - "Best for internal apps"
            - "Complex implementation"
            - "Strong security features"

        - heading: "OAuth 2.0"
          points:
            - "JSON-based protocol"
            - "API authorization standard"
            - "Best for third-party apps"
            - "Simpler implementation"
            - "Delegated access"

    # Recommendation
    - type: "alert"
      alert_type: "info"
      title: "When to Use Which"
      content: "Use SAML for enterprise SSO and internal applications. Use OAuth for API access and third-party integrations."

  actions:
    - label: "SAML Setup Guide"
      action:
        type: "navigate_to_subpage"
        target: "saml-configuration"
    - label: "OAuth Setup Guide"
      action:
        type: "navigate_to_subpage"
        target: "oauth-configuration"
    - label: "Close"
      action:
        type: "close_popup"
```

---

## Complete Example: Full-Screen Diagram Popup

```yaml
popup:
  id: "popup-architecture-fullscreen"
  size: "full-screen"
  animation: "fade-in"
  title: "Complete System Architecture"

  sections:
    # Large diagram
    - type: "image"
      src: "/images/complete-architecture-4k.png"
      alt: "Full system architecture diagram"
      caption: "Click to zoom in on specific components"

    # Explanation
    - type: "text"
      content: |
        This diagram shows the complete end-to-end architecture
        including all microservices, databases, and external integrations.

  actions:
    - label: "Download High-Res Version"
      action:
        type: "external_link"
        url: "/downloads/architecture-diagram.pdf"
    - label: "View Architecture Documentation"
      action:
        type: "navigate_to_subpage"
        target: "architecture-documentation"
    - label: "Close"
      action:
        type: "close_popup"
```

---

## Popup Definition Location

Popups are **defined in the page file** that triggers them:

```yaml
# page file: saas-services.md
page:
  id: "saas-services"
  # ... page configuration ...

sections:
  - type: "feature_grid"
    features:
      - name: "Data Protection"
        click_action:
          type: "show_popup"
          popup_id: "popup-data-protection"  # References popup below

# Popup definitions at end of same file
popups:
  - id: "popup-data-protection"
    size: "large"
    title: "Data Protection Deep Dive"
    sections:
      - type: "text"
        content: "..."

  - id: "popup-encryption"
    size: "medium"
    title: "Encryption Details"
    sections:
      - type: "text"
        content: "..."
```

---

## Best Practices

1. **Size Selection**:
   - Small: Quick tips, confirmations (< 100 words)
   - Medium: Detailed info, short guides (100-300 words)
   - Large: Comprehensive content, multiple sections (300-600 words)
   - Full-Screen: Large images, detailed diagrams

2. **Content Amount**:
   - Keep popups focused and concise
   - If content is extensive, link to full page instead
   - Use "View Full Page" action for deep dives

3. **Actions**:
   - Always include "Close" button
   - Provide "Learn More" or "View Full Page" for deeper content
   - Maximum 3-4 action buttons

4. **Animation**:
   - Use `scale-in` for general popups (default)
   - Use `fade-in` for full-screen popups
   - Use `slide-in-*` for contextual popups (e.g., from sidebar)

5. **Accessibility**:
   - Always provide meaningful titles
   - Include alt text for all images
   - Ensure close button is always visible

---

## Validation Checklist

Before finalizing your popup:

- [ ] `id` is unique across all popups
- [ ] `size` is appropriate for content amount
- [ ] `title` is clear and descriptive
- [ ] All section types are valid
- [ ] All images have `alt` text
- [ ] At least one action button exists
- [ ] "Close" action is included
- [ ] All `navigate_to_page` targets exist
- [ ] All `external_link` URLs are valid
- [ ] Popup is referenced in at least one page section

---

## Tips

1. **Use Popups For**:
   - Quick explanations
   - Glossary terms
   - Code examples
   - Image zoom/detail views
   - Short FAQs

2. **Don't Use Popups For**:
   - Long-form content (use pages instead)
   - Complex navigation flows
   - Multiple related topics (use sub-pages)
   - Primary content (popups are supplementary)

3. **Navigation Flow**:
   - Popups can navigate to pages (creating a "Learn More" path)
   - Pages should NOT navigate to popups
   - Popups are "dead ends" in navigation (can only close or navigate away)

4. **Content Strategy**:
   - Popup content should make sense standalone
   - Provide context in the popup title
   - Use actions to connect to related full pages

---

**Next Steps:**
1. Define popup in page file's `popups` section
2. Reference popup ID in page section's `click_action`
3. Test that popup opens correctly
4. Verify all action buttons work as expected

---

**Note:** All visual styling (popup overlay, shadow, border radius, backdrop, animations) is defined in `UNIFIED_LAYOUT_SPECIFICATION.md`. This template focuses solely on content structure and interaction behavior.
