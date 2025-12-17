# Metadata Reference

**Purpose:** Complete reference for all metadata fields in cards and pages
**Use this for:** Understanding what metadata to include and why
**Related:** card-definition-template.md, page-template.md

---

## Overview

Metadata provides **information ABOUT content** without being the content itself.

**Key benefits:**
- Discoverability (search, filtering, tagging)
- Organization (authorship, versioning, dating)
- User guidance (difficulty, time estimates)
- Future functionality (prerequisites, related content)

**Important:** Metadata is mostly **optional** but recommended for better content management.

---

## Metadata Levels

### 1. Card-Level Metadata
Information about the entire card.

### 2. Page-Level Metadata
Information about individual pages.

### 3. Section-Level Metadata
Information about specific sections (rare, mostly automatic).

---

## Card-Level Metadata

### Required Fields

#### id
Unique identifier for the card.

```yaml
card:
  id: "security-advanced"
```

**Rules:**
- Lowercase letters, numbers, hyphens only
- Must be unique across all cards
- Cannot contain spaces or special characters

**Examples:**
- `security-basics`
- `api-documentation`
- `data-flow-101`

**Used for:**
- URLs (`/cards/security-advanced`)
- File organization
- Cross-references

---

#### name
Display name for the card.

```yaml
card:
  name: "Advanced Security"
```

**Rules:**
- User-friendly, readable
- 1-5 words recommended
- Can include capitals, spaces

**Examples:**
- "Getting Started"
- "API Documentation"
- "Security Best Practices"

**Used for:**
- Card titles in UI
- Navigation menus
- Search results

---

#### category
Business domain or topic area.

```yaml
card:
  category: "security"
```

**Common categories:**
- `integration` - Integration and API content
- `security` - Security and compliance
- `data-architecture` - Data modeling, databases
- `deployment` - Infrastructure, DevOps
- `observability` - Monitoring, logging
- `design-time` - Development patterns
- Custom categories as needed

**Used for:**
- Filtering cards by topic
- Organizing card library
- Grouping related content

**Note:** Category ≠ Color theme (they're independent)

---

#### color_theme
Visual color scheme for the card.

```yaml
card:
  color_theme: "blue"
```

**Available themes:**
- `blue`, `emerald`, `violet`, `red`
- `amber`, `indigo`, `cyan`, `pink`
- `green`, `orange`

**Used for:**
- Visual identity
- Card styling
- User recognition

**Note:** Defined in UNIFIED_LAYOUT_SPECIFICATION.md

---

#### icon
Lucide icon name.

```yaml
card:
  icon: "Shield"
```

**Icon sources:**
- [Lucide Icons](https://lucide.dev)
- React component names (PascalCase)

**Examples:**
- `Shield`, `Lock`, `Key` - Security
- `Activity`, `BarChart`, `TrendingUp` - Observability
- `Database`, `Server`, `Cloud` - Infrastructure
- `Code`, `Zap`, `Cpu` - Development

**Used for:**
- Card visual identity
- Navigation icons
- Quick recognition

---

### Optional Fields

#### description
Short and long descriptions.

```yaml
card:
  description:
    short: "Learn security fundamentals"
    long: "Comprehensive guide to enterprise security practices and patterns"
```

**short:**
- 1 sentence, ~50 characters
- Used in card previews, lists
- Focus on main value

**long:**
- 1-2 sentences, ~150 characters
- Used in card detail view
- Can be more descriptive

---

#### metadata
Additional information about the card.

```yaml
card:
  metadata:
    author: "Security Team"
    version: "2.1"
    last_updated: "2024-12-16"
    tags: ["security", "beginner", "compliance"]
    difficulty: "intermediate"
    estimated_time: "30 minutes"
    prerequisites: ["basic-security"]
    related_cards: ["api-security", "data-protection"]
    status: "published"
```

**All fields optional and for future use.**

---

### Metadata Fields Explained

#### author
Who created or maintains this content.

```yaml
metadata:
  author: "Security Team"
```

**Can be:**
- Team name: "Platform Team"
- Individual: "John Smith"
- Organization: "Temenos Documentation"

**Used for:**
- Content ownership
- Contact information
- Credits

---

#### version
Content version number.

```yaml
metadata:
  version: "2.1"
```

**Format:**
- Semantic versioning: "2.1.0"
- Simple: "2.1"
- Named: "Spring 2024"

**Used for:**
- Change tracking
- Version comparison
- Content freshness

---

#### last_updated
When content was last modified.

```yaml
metadata:
  last_updated: "2024-12-16"
```

**Format:**
- ISO date: "2024-12-16"
- Friendly: "December 16, 2024"
- Timestamp: "2024-12-16T10:30:00Z"

**Used for:**
- Freshness indicator
- Sorting by recency
- Update notifications

---

#### tags
Keywords for categorization and search.

```yaml
metadata:
  tags: ["security", "beginner", "cloud", "compliance"]
```

**Guidelines:**
- Use lowercase
- 3-7 tags recommended
- Include topic, audience, technology

**Tag types:**
- **Topic:** "security", "performance", "api"
- **Audience:** "beginner", "expert", "developer"
- **Technology:** "cloud", "docker", "kubernetes"
- **Type:** "tutorial", "reference", "guide"

**Used for:**
- Search and filtering
- Related content discovery
- Tag clouds

---

#### difficulty
Content complexity level.

```yaml
metadata:
  difficulty: "intermediate"
```

**Levels:**
- `beginner` - No prior knowledge needed
- `intermediate` - Some experience required
- `advanced` - Deep expertise assumed
- `expert` - Specialized knowledge required

**Used for:**
- User guidance
- Content filtering
- Learning paths

---

#### estimated_time
How long to complete/read.

```yaml
metadata:
  estimated_time: "30 minutes"
```

**Formats:**
- "5 minutes"
- "1 hour"
- "30-45 minutes"
- "2 days" (for long courses)

**Used for:**
- User planning
- Time budgeting
- Content filtering

---

#### prerequisites
What users should know first.

```yaml
metadata:
  prerequisites: ["basic-security", "api-fundamentals"]
```

**Format:**
- Array of card IDs or concepts
- Link to actual prerequisite cards

**Used for:**
- Learning path guidance
- Showing required knowledge
- Prerequisites check

---

#### related_cards
Cards related to this one.

```yaml
metadata:
  related_cards: ["api-security", "data-protection", "compliance-guide"]
```

**Format:**
- Array of card IDs
- Can be used to suggest next steps

**Used for:**
- "Related content" suggestions
- Learning path recommendations
- Content discovery

---

#### status
Publishing status.

```yaml
metadata:
  status: "published"
```

**Common statuses:**
- `draft` - Work in progress
- `review` - Ready for review
- `published` - Live and visible
- `archived` - Old/deprecated

**Used for:**
- Content workflow
- Visibility control
- Filtering

---

#### language
Content language.

```yaml
metadata:
  language: "en"
```

**Format:** ISO language codes
- `en` - English
- `es` - Spanish
- `fr` - French
- `de` - German

**Used for:**
- Multilingual sites
- Language filtering
- Localization

---

#### audience
Target audience.

```yaml
metadata:
  audience: ["developers", "architects"]
```

**Common audiences:**
- "developers"
- "architects"
- "business-users"
- "administrators"
- "executives"

**Used for:**
- Content filtering
- Personalization
- Role-based views

---

## Page-Level Metadata

Similar to card metadata, but for individual pages.

```yaml
page:
  id: "saas-services"

  titles:
    page_header: "SaaS Security Services: Complete Guide"
    menu_title: "SaaS Services"
    agenda_title: "SaaS Security Services"
    breadcrumb: "SaaS"

  description:
    short: "Cloud security services"
    long: "Comprehensive guide to Temenos SaaS security offerings"

  metadata:
    author: "Security Team"
    version: "2.1"
    last_updated: "2024-12-16"
    tags: ["security", "saas", "cloud"]
    difficulty: "intermediate"
    estimated_time: "10 minutes"

  parent: "security-overview"
  icon: "Cloud"
```

### Page-Specific Fields

#### titles
Multiple title variants for different contexts.

```yaml
titles:
  page_header: "The Complete History of Observability"  # Page top
  menu_title: "History"  # Navigation menu
  agenda_title: "History & Evolution"  # Agenda card
  breadcrumb: "History"  # Breadcrumb trail
```

**Why multiple titles?**
- Space constraints (breadcrumbs need short titles)
- Context (agenda cards can be more descriptive)
- Clarity (page headers can be comprehensive)

**All required for optimal UX.**

---

#### parent
Parent page ID for hierarchy.

```yaml
page:
  parent: "security-overview"  # ID of parent page
```

**Values:**
- Page ID: `"security-overview"`
- `null`: Top-level page (no parent)

**Used for:**
- Navigation hierarchy
- Breadcrumbs generation
- Back button

---

#### icon
Page-specific icon (optional).

```yaml
page:
  icon: "Cloud"
```

**Used for:**
- Page tree menu
- Breadcrumbs (if enabled)
- Visual identification

---

## Metadata Best Practices

### 1. Be Consistent

Use same metadata structure across all cards/pages.

**Good:**
```yaml
# All cards have:
metadata:
  author: "..."
  version: "..."
  tags: [...]
  difficulty: "..."
```

**Avoid:**
```yaml
# Card 1 has author, Card 2 doesn't
# Inconsistent metadata makes filtering hard
```

---

### 2. Keep Tags Focused

Don't over-tag. 3-7 relevant tags is ideal.

**Good:**
```yaml
tags: ["security", "beginner", "cloud", "compliance"]
```

**Avoid:**
```yaml
tags: ["security", "cloud", "saas", "enterprise", "beginner",
       "tutorial", "guide", "2024", "best-practices", "compliance",
       "authentication", "authorization", "encryption"]
# Too many tags = noise
```

---

### 3. Update Dates Regularly

Keep `last_updated` current.

```yaml
metadata:
  last_updated: "2024-12-16"  # Update when content changes
```

**Why:** Users trust fresh content more.

---

### 4. Use Standard Difficulty Levels

Stick to: beginner, intermediate, advanced, expert.

**Good:**
```yaml
difficulty: "intermediate"
```

**Avoid:**
```yaml
difficulty: "medium-hard"  # Non-standard
```

---

### 5. Realistic Time Estimates

Test your content to estimate time accurately.

**Good:**
```yaml
estimated_time: "15 minutes"  # Tested with users
```

**Avoid:**
```yaml
estimated_time: "5 minutes"  # Actually takes 30 minutes
```

---

### 6. Link Prerequisites

Reference actual card IDs.

**Good:**
```yaml
prerequisites: ["security-basics", "api-fundamentals"]
# These cards exist
```

**Avoid:**
```yaml
prerequisites: ["you should know security"]
# Vague, not linkable
```

---

## Metadata for Search & Discovery

Good metadata enables powerful search and filtering.

### Searchable Fields

- Card/page names
- Descriptions
- Tags
- Author names
- Content (sections)

### Filterable Fields

- Category
- Difficulty
- Tags
- Author
- Date (last_updated)
- Status

### Example Use Cases

**Search query: "security beginner"**
- Matches: tags include "security" AND difficulty is "beginner"

**Filter: "Show all intermediate cloud content"**
- Filters: difficulty = "intermediate" AND tags include "cloud"

**Sort: "Most recently updated"**
- Sorts by: last_updated descending

---

## Complete Metadata Examples

### Example 1: Beginner Tutorial Card

```yaml
card:
  id: "security-101"
  name: "Security 101"
  category: "security"
  color_theme: "red"
  icon: "Shield"

  description:
    short: "Security fundamentals for beginners"
    long: "Learn the essential security concepts every developer should know"

  metadata:
    author: "Security Team"
    version: "1.0"
    last_updated: "2024-12-16"
    tags: ["security", "beginner", "tutorial"]
    difficulty: "beginner"
    estimated_time: "20 minutes"
    prerequisites: []  # No prerequisites
    related_cards: ["api-security", "cloud-security"]
    status: "published"
    language: "en"
    audience: ["developers", "students"]
```

---

### Example 2: Advanced Technical Page

```yaml
page:
  id: "advanced-encryption"

  titles:
    page_header: "Advanced Encryption Techniques and Implementation"
    menu_title: "Advanced Encryption"
    agenda_title: "Advanced Encryption Techniques"
    breadcrumb: "Encryption"

  description:
    short: "Deep dive into encryption methods"
    long: "Comprehensive technical guide to implementing enterprise-grade encryption"

  metadata:
    author: "Cryptography Team"
    version: "3.2"
    last_updated: "2024-12-10"
    tags: ["security", "encryption", "advanced", "cryptography"]
    difficulty: "expert"
    estimated_time: "45 minutes"

  parent: "security-deep-dive"
  icon: "Lock"
```

---

### Example 3: Reference Documentation Card

```yaml
card:
  id: "api-reference"
  name: "API Reference"
  category: "integration"
  color_theme: "blue"
  icon: "Code"

  description:
    short: "Complete API documentation"
    long: "Comprehensive reference for all API endpoints, parameters, and responses"

  metadata:
    author: "API Team"
    version: "4.1.2"
    last_updated: "2024-12-15"
    tags: ["api", "reference", "integration", "documentation"]
    difficulty: "intermediate"
    estimated_time: "Reference (varies)"
    prerequisites: ["api-basics"]
    related_cards: ["api-tutorial", "authentication-guide"]
    status: "published"
    language: "en"
    audience: ["developers", "integrators"]
```

---

## Metadata Validation Checklist

Before publishing, verify:

**Card Metadata:**
- [ ] `id` is unique and follows naming rules
- [ ] `name` is clear and concise
- [ ] `category` is appropriate
- [ ] `color_theme` is valid theme name
- [ ] `icon` is valid Lucide icon
- [ ] `short` and `long` descriptions provided
- [ ] `tags` are relevant (3-7 tags)
- [ ] `difficulty` is standard level
- [ ] `last_updated` is current
- [ ] `related_cards` IDs exist

**Page Metadata:**
- [ ] All four title variants provided
- [ ] Titles appropriate for each context
- [ ] `parent` ID is correct (or null)
- [ ] `icon` is valid (if specified)
- [ ] Page metadata consistent with card

---

## Future Metadata Uses

Metadata enables future functionality:

### Personalization
```yaml
# Show content based on user role
audience: ["developers"]

# Suggest based on difficulty
difficulty: "intermediate"
```

### Learning Paths
```yaml
# Guide users through sequence
prerequisites: ["security-basics"]
related_cards: ["api-security"]
```

### Content Management
```yaml
# Track content lifecycle
status: "published"
version: "2.1"
last_updated: "2024-12-16"
```

### Analytics
```yaml
# Track popular content
estimated_time: "30 minutes"
difficulty: "intermediate"
tags: ["security", "cloud"]
```

### Internationalization
```yaml
# Multi-language support
language: "en"
```

---

## Quick Reference

**Required Card Fields:**
- `id`, `name`, `category`, `color_theme`, `icon`

**Required Page Fields:**
- `id`, `titles` (all 4 variants)

**Recommended Metadata:**
- `author`, `version`, `last_updated`
- `tags`, `difficulty`, `estimated_time`

**Optional but Useful:**
- `prerequisites`, `related_cards`
- `status`, `language`, `audience`

**Remember:**
- Metadata is ABOUT content, not the content itself
- Enables search, filtering, and discovery
- Future-proofs your content structure
- Consistency across cards is key

---

**Last Updated:** December 16, 2024
**Version:** 1.0
