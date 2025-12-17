# Reusing Pages Guide: Save 50% Creation Time

**Purpose:** Learn how to reuse pages from the library to create cards faster
**Goal:** Demonstrate how page reuse saves 50% creation time
**Related:** quick-start-guide.md, card-definition-template.md, page-template.md

---

## Overview

The page library contains **pre-built, reusable pages** that you can include in your cards without creating them from scratch.

**Benefits:**
- ⚡ **50% faster** card creation
- ✅ **Consistent quality** across cards
- 🔄 **One update, many cards** benefit
- 📝 **Less maintenance** - fix once, apply everywhere

**Core Principle:** Write once, reuse many times.

---

## Understanding the Page Library

### Library Structure

```
content/pages/library/
  ├─ intro/                    # Introduction pages
  │   ├─ basic-intro.md       # Beginner-friendly
  │   ├─ detailed-intro.md    # Comprehensive
  │   └─ technical-intro.md   # Developer-focused
  │
  ├─ architecture/             # Architecture pages
  │   ├─ high-level-overview.md
  │   ├─ detailed-architecture.md
  │   └─ component-deep-dive.md
  │
  ├─ best-practices/           # Best practices
  │   ├─ beginner.md
  │   ├─ intermediate.md
  │   └─ advanced.md
  │
  ├─ getting-started/          # Getting started
  │   ├─ quick-start.md
  │   └─ step-by-step-guide.md
  │
  └─ common-sections/          # Common pages
      ├─ faq.md
      ├─ troubleshooting.md
      └─ glossary.md
```

### How It Works

**Library pages** are just regular page templates stored in `/content/pages/library/`.

**Any card** can reference them instead of creating custom pages.

**Result:** Multiple cards share the same page content.

---

## Quick Example: Before vs After

### Before (Without Reuse)

**Card A:**
```
content/pages/cards/security-basics/
  ├─ card-definition.md
  ├─ agenda.md
  └─ pages/
      ├─ introduction.md  ← Created custom intro
      ├─ overview.md
      └─ next-steps.md
```

**Card B:**
```
content/pages/cards/api-basics/
  ├─ card-definition.md
  ├─ agenda.md
  └─ pages/
      ├─ introduction.md  ← Created ANOTHER custom intro (duplicate!)
      ├─ endpoints.md
      └─ examples.md
```

**Time:** Created 2 introductions (duplicate work!)

---

### After (With Reuse)

**Library:**
```
content/pages/library/intro/
  └─ basic-intro.md  ← Created ONCE
```

**Card A:**
```yaml
card:
  pages:
    - file: "content/pages/library/intro/basic-intro.md"  # ← Reuse!
    - file: "content/pages/cards/security-basics/pages/overview.md"
```

**Card B:**
```yaml
card:
  pages:
    - file: "content/pages/library/intro/basic-intro.md"  # ← Reuse!
    - file: "content/pages/cards/api-basics/pages/endpoints.md"
```

**Time Saved:** 50% (created intro once, used twice!)

---

## When to Reuse Pages

### ✅ Good Candidates for Reuse

**Generic content that applies to multiple cards:**
- Introduction pages
- Architecture overviews
- Best practices
- FAQ pages
- Troubleshooting guides
- Glossaries
- Getting started guides

**Different audience levels:**
- Beginner introductions
- Intermediate deep-dives
- Expert technical details

---

### ❌ Don't Reuse When

**Content is card-specific:**
- Feature-specific details
- Unique workflows
- Card-specific examples
- Custom configurations

**Better to create custom pages when content is unique.**

---

## Step-by-Step: Using Library Pages

### Step 1: Browse the Library

Check what's available in `/content/pages/library/`:

```bash
content/pages/library/
  ├─ intro/
  ├─ architecture/
  ├─ best-practices/
  ├─ getting-started/
  └─ common-sections/
```

### Step 2: Pick a Page

Choose a page that fits your needs:

**Example:** Your card needs an introduction for beginners.

**Library has:** `content/pages/library/intro/basic-intro.md`

**Perfect match!**

### Step 3: Reference It

In your `card-definition.md`, reference the library page:

```yaml
card:
  id: "my-new-card"
  name: "My New Card"

  pages:
    # Reuse library introduction
    - file: "content/pages/library/intro/basic-intro.md"
      order: 1

    # Add custom pages
    - file: "content/pages/cards/my-new-card/pages/features.md"
      order: 2
```

### Step 4: Done!

That's it. The library page is now part of your card.

**Time saved:** Didn't create a custom intro!

---

## Complete Example

### Scenario

Creating a "Security Basics" card for beginners.

### Planning

**Needed pages:**
1. Introduction (beginner level)
2. Core Concepts
3. Best Practices (beginner level)
4. Next Steps

**Check library:**
- ✅ `library/intro/basic-intro.md` exists
- ✅ `library/best-practices/beginner.md` exists
- ❌ No "Core Concepts" or "Next Steps"

**Decision:**
- Reuse: Introduction + Best Practices
- Create: Core Concepts + Next Steps

### Implementation

**card-definition.md:**
```yaml
card:
  id: "security-basics"
  name: "Security Basics"
  category: "security"
  color_theme: "red"
  icon: "Shield"

  pages:
    # Reused from library (saves time!)
    - file: "content/pages/library/intro/basic-intro.md"
      order: 1

    # Custom page (specific to security)
    - file: "content/pages/cards/security-basics/pages/core-concepts.md"
      order: 2

    # Reused from library (saves time!)
    - file: "content/pages/library/best-practices/beginner.md"
      order: 3

    # Custom page (specific to this card)
    - file: "content/pages/cards/security-basics/pages/next-steps.md"
      order: 4
```

### Result

**Created:** 2 pages (Core Concepts, Next Steps)
**Reused:** 2 pages (Introduction, Best Practices)

**Time saved:** 50%! ⚡

---

## Advanced: Different Audiences

Use library pages to target different audiences with same card structure.

### Beginner Card

```yaml
card:
  id: "security-beginner"
  name: "Security for Beginners"

  pages:
    - file: "content/pages/library/intro/basic-intro.md"
    - file: "content/pages/library/architecture/high-level-overview.md"
    - file: "content/pages/library/best-practices/beginner.md"
```

**Audience:** Non-technical users

---

### Expert Card

```yaml
card:
  id: "security-expert"
  name: "Advanced Security"

  pages:
    - file: "content/pages/library/intro/technical-intro.md"
    - file: "content/pages/library/architecture/component-deep-dive.md"
    - file: "content/pages/library/best-practices/advanced.md"
```

**Audience:** Security professionals

---

### Same Structure, Different Depth

**Both cards have:**
- Introduction
- Architecture
- Best Practices

**But beginner uses basic versions, expert uses advanced versions.**

**Result:** Consistent structure, appropriate depth per audience.

---

## Creating Library Pages

### When to Add to Library

Add pages to library when:
- Content will be used by 2+ cards
- Content is generic enough
- Different audience levels needed

### How to Create

**1. Create the page in library directory:**

```
content/pages/library/intro/basic-intro.md
```

**2. Use standard page template:**

```yaml
page:
  id: "basic-intro"  # Unique ID

  titles:
    page_header: "Introduction to the Platform"
    menu_title: "Introduction"
    agenda_title: "Introduction"
    breadcrumb: "Intro"

  description:
    short: "Platform basics"
    long: "Learn fundamental concepts"

  metadata:
    author: "Platform Team"
    tags: ["introduction", "beginner"]
    difficulty: "beginner"

  parent: null  # Library pages don't have parents
  icon: "BookOpen"

sections:
  - type: "hero"
    heading: "Welcome!"
    subtitle: "Let's get started"

  # ... more sections
```

**3. Reference from any card:**

```yaml
card:
  pages:
    - file: "content/pages/library/intro/basic-intro.md"
```

---

## Best Practices

### 1. Keep Library Pages Generic

**Good:**
```yaml
# library/intro/basic-intro.md
sections:
  - type: "text"
    content: "This platform helps you work efficiently."
```

**Bad:**
```yaml
# library/intro/basic-intro.md
sections:
  - type: "text"
    content: "The security module helps you secure APIs."  # Too specific!
```

### 2. Create Variants for Audiences

Instead of one introduction, create three:
- `basic-intro.md` (beginners)
- `detailed-intro.md` (intermediate)
- `technical-intro.md` (experts)

### 3. Use Clear Naming

**Good:** `high-level-architecture.md`, `detailed-architecture.md`

**Bad:** `arch1.md`, `arch2.md`

### 4. Document Library Pages

Add metadata to help others find pages:

```yaml
metadata:
  author: "Platform Team"
  tags: ["introduction", "beginner", "overview"]
  difficulty: "beginner"
  estimated_time: "5 minutes"
  description: "Generic introduction suitable for any beginner card"
```

### 5. Update Once, Benefit Many Times

When you update a library page, **all cards using it** get the update automatically.

**Example:**
- Update `library/intro/basic-intro.md`
- 5 cards using it all get updated content
- No need to edit 5 separate pages!

---

## Mixing Custom and Library Pages

You can mix both approaches in one card.

### Example: Hybrid Card

```yaml
card:
  id: "hybrid-example"
  name: "Hybrid Example"

  pages:
    # Library page (reused)
    - file: "content/pages/library/intro/basic-intro.md"
      order: 1

    # Custom page (specific to this card)
    - file: "content/pages/cards/hybrid-example/pages/unique-feature.md"
      order: 2

    # Library page (reused)
    - file: "content/pages/library/best-practices/beginner.md"
      order: 3

    # Custom page with sub-pages
    - file: "content/pages/cards/hybrid-example/pages/advanced-config.md"
      order: 4

    # Library page (reused)
    - file: "content/pages/library/common-sections/faq.md"
      order: 5
```

**Result:**
- 3 library pages (reused, saved time)
- 2 custom pages (card-specific content)
- Best of both worlds!

---

## Library Page Catalog

### Introduction Pages

| File | Audience | Description |
|------|----------|-------------|
| `intro/basic-intro.md` | Beginner | Simple, friendly introduction |
| `intro/detailed-intro.md` | Intermediate | Comprehensive overview |
| `intro/technical-intro.md` | Expert | Technical deep-dive |

### Architecture Pages

| File | Audience | Description |
|------|----------|-------------|
| `architecture/high-level-overview.md` | Beginner | Executive-level overview |
| `architecture/detailed-architecture.md` | Intermediate | Technical architecture |
| `architecture/component-deep-dive.md` | Expert | Component details |

### Best Practices

| File | Audience | Description |
|------|----------|-------------|
| `best-practices/beginner.md` | Beginner | Essential practices |
| `best-practices/intermediate.md` | Intermediate | Advanced techniques |
| `best-practices/advanced.md` | Expert | Expert patterns |

### Getting Started

| File | Audience | Description |
|------|----------|-------------|
| `getting-started/quick-start.md` | Beginner | 5-minute quick start |
| `getting-started/step-by-step-guide.md` | Beginner | Detailed walkthrough |

### Common Sections

| File | Audience | Description |
|------|----------|-------------|
| `common-sections/faq.md` | All | Frequently asked questions |
| `common-sections/troubleshooting.md` | All | Common issues & solutions |
| `common-sections/glossary.md` | All | Term definitions |

---

## Real-World Example

### Scenario

Creating 5 cards for different services:
- Security Basics
- API Basics
- Database Basics
- Deployment Basics
- Monitoring Basics

### Without Reuse

**Total pages to create:** 5 cards × 5 pages = **25 pages**

**Time:** 25 pages × 10 minutes = **250 minutes (4+ hours)**

### With Reuse

**Library pages (created once):**
1. `library/intro/basic-intro.md`
2. `library/architecture/high-level-overview.md`
3. `library/best-practices/beginner.md`
4. `library/getting-started/quick-start.md`
5. `library/common-sections/faq.md`

**Custom pages (per card):**
- 0-1 custom pages per card (card-specific features)

**Total pages to create:**
- 5 library pages (reused across all cards)
- 5 custom pages (one per card)
- **= 10 pages total**

**Time:** 10 pages × 10 minutes = **100 minutes (1.7 hours)**

**Time saved:** 150 minutes = **60% faster!** ⚡

---

## Tips for Success

### 1. Check Library First

Before creating a page, always check if library has something similar.

### 2. Start with Library Pages

Use library pages to get started quickly, customize later if needed.

### 3. Contribute Back to Library

When you create a great generic page, add it to the library for others.

### 4. Version Library Pages

If you need to make breaking changes, create a new version:
- `intro/basic-intro-v1.md`
- `intro/basic-intro-v2.md`

### 5. Document Usage

In library pages, add comments showing which cards use them:

```yaml
# Used by: security-basics, api-basics, database-basics
metadata:
  used_by: ["security-basics", "api-basics", "database-basics"]
```

---

## Common Questions

### Q: Can I modify library pages for my card?

**A:** No, library pages are shared. If you need modifications:
1. Use a different library variant (e.g., `detailed-intro.md` instead of `basic-intro.md`)
2. Copy library page to your card directory and customize it
3. Create a new library variant if many cards need it

### Q: What if a library page changes?

**A:** All cards using it automatically get the updated content. This is a feature (consistency) but test changes carefully.

### Q: Can library pages have sub-pages?

**A:** Yes! Library pages can reference other library pages as sub-pages.

### Q: How do I know which cards use a library page?

**A:** Add `used_by` metadata to library pages to track usage.

---

## Quick Reference

**To use a library page:**

```yaml
card:
  pages:
    - file: "content/pages/library/[category]/[page].md"
```

**To create a library page:**

1. Create in `/content/pages/library/[category]/[page].md`
2. Use standard page template
3. Keep content generic
4. Add metadata for discoverability

**Benefits:**
- ⚡ 50% faster card creation
- ✅ Consistent quality
- 🔄 One update benefits all
- 📝 Less maintenance

---

## Next Steps

**Practice:**
1. Browse the page library
2. Create a card using 50% library pages
3. Create your own library page

**Learn more:**
- `quick-start-guide.md` - Create your first card
- `hierarchical-navigation-guide.md` - Create nested pages
- `card-definition-template.md` - Card structure reference

---

**Last Updated:** December 16, 2024
**Version:** 1.0

**Remember:** Write once, reuse many times! 🔄
