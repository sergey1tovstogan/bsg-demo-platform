# Card Definition Template

**Purpose:** Defines the overall card structure and references reusable pages
**Use this for:** Creating a new card in the platform
**Related:** agenda-template.md, page-template.md

---

## Template Structure

```yaml
card:
  # === CARD IDENTIFICATION ===
  id: "card-unique-id"  # Required. Unique identifier (lowercase, hyphenated)
  name: "Card Display Name"  # Required. Shown in the main menu

  # === BUSINESS CATEGORY ===
  category: "category-name"  # Required. Business domain: integration, security, data-architecture, architecture, observability, devops, etc.

  # === VISUAL STYLING ===
  color_theme: "theme-name"  # Required. Visual theme: blue, emerald, violet, red, amber, indigo, cyan, pink, green, orange

  # === ICON ===
  icon: "IconName"  # Required. Lucide icon name (e.g., "Shield", "Activity", "Database")

  # === DESCRIPTION ===
  description:
    short: "Brief one-line description"  # For card preview
    long: "Detailed description of what this card covers"  # For card detail view

  # === METADATA (Optional - for configuration) ===
  metadata:
    author: "Team Name"
    version: "1.0"
    last_updated: "2024-12-16"
    tags: ["tag1", "tag2", "tag3"]
    difficulty: "beginner"  # beginner, intermediate, advanced, expert
    estimated_time: "15 minutes"

  # === AGENDA CONFIGURATION ===
  agenda:
    file: "content/pages/cards/[card-id]/agenda.md"  # Path to agenda template

  # === NAVIGATION STYLE ===
  navigation:
    type: "hierarchical"  # hierarchical, tabs, linear
    show_breadcrumbs: true
    show_page_tree: true
    allow_back_to_agenda: true
    show_next_previous: true

  # === PAGES ===
  # List all top-level pages for this card
  # Can reference custom pages OR library pages for reuse
  pages:
    # Custom page (specific to this card)
    - file: "content/pages/cards/[card-id]/pages/introduction.md"
      order: 1

    # Reused page from library
    - file: "content/pages/library/architecture/high-level-overview.md"
      order: 2

    # Page with sub-pages
    - file: "content/pages/cards/[card-id]/pages/main-topic.md"
      order: 3

  # === GLOBAL SETTINGS ===
  settings:
    default_animation: "fade-in"  # fade-in, slide-in, scale-in, none
    transition_speed: "300ms"
    max_depth: 5  # Maximum sub-page nesting level
    enable_search: true  # Enable search within card content
    enable_bookmarks: true  # Allow users to bookmark pages
```

---

## Instructions for Content Creators

### Step 1: Define Card Basics
1. Choose a unique `id` (lowercase, hyphenated, e.g., "security-advanced", "data-flow-basics")
2. Choose a display `name` (user-friendly, e.g., "Advanced Security", "Data Flow Basics")
3. Select a business `category`:
   - `integration` - For integration and API-related content
   - `security` - For security and compliance content
   - `data-architecture` - For data modeling and architecture
   - `architecture` - For architecture and infrastructure
   - `observability` - For monitoring and observability
   - `devops` - For DevOps, CI/CD, and development
   - Or create your own business category

4. Select a `color_theme` for visual identity (see UNIFIED_LAYOUT_SPECIFICATION.md for all options):
   - `blue`, `emerald`, `violet`, `red`, `amber`, `indigo`, `cyan`, `pink`, `green`, `orange`
   - **Note:** Color theme is independent from business category!

5. Pick an `icon` from [Lucide Icons](https://lucide.dev)

**Important:** The `category` describes WHAT the card is about (business domain). The `color_theme` describes HOW it looks (visual styling). These are completely independent!

### Step 2: Configure Agenda
1. Create an agenda file using `agenda-template.md`
2. Reference it in the `agenda.file` field

### Step 3: Add Pages
You have two options:

**Option A: Create Custom Pages**
- Use `page-template.md` to create new pages
- Place them in `content/pages/cards/[your-card-id]/pages/`
- Reference them in the `pages` list

**Option B: Reuse Library Pages**
- Browse `content/pages/library/` for existing pages
- Reference them directly in the `pages` list
- This saves time and ensures consistency!

### Step 4: Configure Navigation
Choose navigation style:
- **hierarchical**: Tree-like navigation with sub-pages (recommended for complex content with multiple levels)
- **tabs**: Horizontal tabs for top-level pages (recommended for distinct sections at same level)
- **linear**: Step-by-step progression with next/previous (recommended for tutorials and guided flows)

### Step 5: Test Your Card
1. Save the file
2. Check that all referenced files exist
3. Verify the card appears in the platform

---

## Examples

### Example 1: Simple Card (2 pages, no library reuse)
```yaml
card:
  id: "getting-started"
  name: "Getting Started"
  category: "onboarding"
  color_theme: "blue"
  icon: "Rocket"

  description:
    short: "Learn the basics"
    long: "A beginner-friendly introduction to the platform"

  agenda:
    file: "content/pages/cards/getting-started/agenda.md"

  navigation:
    type: "linear"
    show_breadcrumbs: true
    show_page_tree: false
    allow_back_to_agenda: true

  pages:
    - file: "content/pages/cards/getting-started/pages/welcome.md"
      order: 1
    - file: "content/pages/cards/getting-started/pages/first-steps.md"
      order: 2

  settings:
    default_animation: "fade-in"
    transition_speed: "300ms"
    max_depth: 2
```

### Example 2: Complex Card (Library Reuse + Custom Pages)
```yaml
card:
  id: "security-advanced"
  name: "Advanced Security"
  category: "security"
  color_theme: "red"
  icon: "Shield"

  description:
    short: "Enterprise security solutions"
    long: "Comprehensive guide to Temenos security architecture and best practices"

  metadata:
    author: "Security Team"
    version: "2.1"
    tags: ["security", "compliance", "best-practices"]
    difficulty: "intermediate"

  agenda:
    file: "content/pages/cards/security-advanced/agenda.md"

  navigation:
    type: "hierarchical"
    show_breadcrumbs: true
    show_page_tree: true
    allow_back_to_agenda: true

  pages:
    # Reuse introduction from library
    - file: "content/pages/library/intro/technical-intro.md"
      order: 1

    # Custom security-specific page with sub-pages
    - file: "content/pages/cards/security-advanced/pages/saas-services.md"
      order: 2

    # Reuse architecture overview
    - file: "content/pages/library/architecture/detailed-architecture.md"
      order: 3

    # Reuse best practices
    - file: "content/pages/library/best-practices/advanced.md"
      order: 4

  settings:
    default_animation: "slide-in"
    transition_speed: "400ms"
    max_depth: 5
```

### Example 3: Same Business Category, Different Color
```yaml
card:
  id: "security-basics"
  name: "Security Basics"
  category: "security"        # Same business category as above
  color_theme: "indigo"       # But different color theme!
  icon: "ShieldCheck"

  description:
    short: "Security fundamentals"
    long: "Essential security concepts for beginners"

  metadata:
    difficulty: "beginner"

  agenda:
    file: "content/pages/cards/security-basics/agenda.md"

  navigation:
    type: "linear"
    show_breadcrumbs: true
    show_page_tree: false
    allow_back_to_agenda: true

  pages:
    - file: "content/pages/library/intro/basic-intro.md"
      order: 1
    - file: "content/pages/cards/security-basics/pages/fundamentals.md"
      order: 2

  settings:
    default_animation: "fade-in"
    transition_speed: "300ms"
    max_depth: 3
```

---

## Validation Checklist

Before finalizing your card definition:

- [ ] `id` is unique and lowercase with hyphens
- [ ] `category` describes the business domain (what it's about)
- [ ] `color_theme` is a valid theme name from UNIFIED_LAYOUT_SPECIFICATION.md
- [ ] `icon` is a valid Lucide icon name
- [ ] `agenda.file` path is correct and file exists
- [ ] All referenced page files exist
- [ ] Navigation type matches your content structure
- [ ] `max_depth` is appropriate for your page hierarchy
- [ ] Metadata is complete (if used)

---

## Tips

1. **Start Simple**: Begin with 2-3 pages and expand later
2. **Reuse Library Pages**: Check the library before creating new pages (saves 50% time!)
3. **Separate Concepts**: Business category ≠ Color theme. They are independent!
4. **Test Navigation**: Ensure users can easily move between pages
5. **Metadata Helps**: Add tags and difficulty for better discoverability
6. **Visual Identity**: Choose color themes that help users identify card types visually

---

## Understanding Category vs Color Theme

**Category** (Business Domain):
- Describes what the card is about
- Used for filtering, searching, grouping
- Examples: "integration", "security", "data-architecture"

**Color Theme** (Visual Styling):
- Describes how the card looks
- Used for visual identity and wayfinding
- Examples: "blue", "red", "emerald"
- Defined in UNIFIED_LAYOUT_SPECIFICATION.md

**They are completely independent!** You can have:
- Multiple cards in "security" category with different colors
- Multiple cards with "blue" color theme in different categories

---

**Next Steps:**
1. Create your agenda using `agenda-template.md`
2. Create pages using `page-template.md`
3. Test the complete card in the platform

---

**Note:** All visual styling (colors, typography, spacing, layouts) is defined in `UNIFIED_LAYOUT_SPECIFICATION.md`. This template focuses solely on content, navigation, and structure.
