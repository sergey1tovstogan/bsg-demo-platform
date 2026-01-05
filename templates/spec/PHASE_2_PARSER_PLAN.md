# Phase 2: MD Template Parser Implementation Plan

**Date:** December 17, 2024
**Phase:** 2 of 3 - Parser & React Component Renderer
**Status:** PLANNING
**Prerequisite:** Phase 1 Complete ✅

---

## ⚠️ CRITICAL: RIGHT THE FIRST TIME PRINCIPLE

**This implementation follows MANDATORY quality requirements:**

### 🎯 Quality Standards
- **Testing is MANDATORY** - Every component, every parser, every function
- **Risk mitigation is MANDATORY** - All high-risk areas must have mitigation strategies
- **Verification is MANDATORY** - Test after each step, not at the end
- **Quality over speed** - Take time to do it right the first time
- **Systematic approach** - Follow test-driven development principles
- **Zero tolerance for skipped tests** - If it's not tested, it's not done

### 📐 Implementation Philosophy
1. **Write test FIRST**, then implement
2. **Verify IMMEDIATELY** after implementation
3. **Test INCREMENTALLY** (don't batch testing)
4. **Document ISSUES** as they arise
5. **Fix IMMEDIATELY**, don't defer
6. **Validate INTEGRATION** at each phase boundary

### ✅ Definition of Done
A task is complete ONLY when:
- [ ] Implementation is finished
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual verification completed
- [ ] Edge cases tested
- [ ] Error handling verified
- [ ] Documentation updated
- [ ] Code reviewed (self-review minimum)

**DO NOT PROCEED TO NEXT TASK UNTIL CURRENT TASK IS 100% COMPLETE**

---

## Executive Summary

Phase 2 will build the **MD/YAML Parser** and **React Component Renderer** to transform all Phase 1 templates into live, interactive React components. This phase is the bridge between static template files and a working system.

**Key Objectives:**
1. Parse all 30+ section types from Phase 1
2. Build hierarchical navigation system
3. Create React renderers for every component
4. Implement all interaction patterns (click, expand, animate)
5. Support all 3 navigation types (hierarchical, tabs, linear)
6. Handle popups and modals
7. Enable hot-reload for instant preview

**Estimated Effort:** 4-6 hours (with comprehensive testing)
**Quality Level:** HIGHEST - Right the first time

---

## Table of Contents

1. [Phase 1 Inventory](#phase-1-inventory)
2. [Architecture Overview](#architecture-overview)
3. [Parser Implementation](#parser-implementation)
4. [Type System](#type-system)
5. [React Renderer Implementation](#react-renderer-implementation)
6. [Navigation System](#navigation-system)
7. [Implementation Phases](#implementation-phases)
8. [Testing Strategy](#testing-strategy)
9. [Success Criteria](#success-criteria)

---

## Phase 1 Inventory

### ✅ Completed in Phase 1

#### Template Files (5)
1. `card-definition-template.md` - Card structure
2. `agenda-template.md` - Landing page
3. `page-template.md` - Content pages
4. `subpage-template.md` - Nested pages
5. `popup-template.md` - Modals

#### Reference Documents (4)
6. `section-types-reference.md` - 30+ section types
7. `animations-reference.md` - Animation system
8. `navigation-reference.md` - Navigation patterns
9. `metadata-reference.md` - Metadata fields

#### User Guides (4)
10. `quick-start-guide.md` - Quick start
11. `reusing-pages-guide.md` - Page library usage
12. `hierarchical-navigation-guide.md` - Navigation setup
13. `interactions-guide.md` - Interactions reference

#### Examples (3 cards, 18 files)
- **Simple card:** 4 files, 2 levels
- **Medium card:** 6 files, 3 levels
- **Complex card:** 8 files, 5 levels

#### Library Pages (6 reusable pages)
- Introduction templates (3)
- Architecture templates (1)
- Best practices (1)
- Common sections (1)

---

## Complete Feature Inventory from Phase 1

### 🎯 Section Types to Parse (30+)

#### Content Display (9 types)
1. **hero** - Page headers with title/subtitle
2. **text** - Regular paragraph content
3. **text_with_links** - Text with `[[navigation|target]]` syntax
4. **image** - Static images
5. **video** - Embedded videos (YouTube, Vimeo, MP4)
6. **code_block** - Syntax-highlighted code
7. **quote** - Blockquotes with attribution
8. **divider** - Visual separators
9. **embed** - iframe embeds

#### Navigation & Interactive (6 types)
10. **image_clickable** - Images with click actions
11. **feature_grid** - Clickable feature cards (2-4 columns)
12. **clickable_cards** - Navigation card grids
13. **tabbed_content** - Tab interface
14. **interactive_diagram** - Images with clickable hotspots
15. **text_with_navigation** - Alternative to text_with_links

#### Data Presentation (6 types)
16. **list** - Bullet/numbered/checklist
17. **comparison_grid** - Side-by-side comparisons
18. **key_value_pairs** - Label-value displays
19. **steps** - Numbered step-by-step guides
20. **timeline** - Chronological events
21. **table** - Structured data tables

#### Expandable Content (3 types)
22. **expandable_section** - Collapsible content blocks
23. **expandable_card** - Card-style expandable content
24. **accordion** - Multiple expandable items

#### Special Elements (9 types)
25. **alert** - Info/success/warning/error callouts
26. **stats** - Key metrics display
27. **download** - File download links
28. **gallery** - Image grids
29. **card_list** - Vertical list of cards
30. **progress** - Progress indicators
31. **tags** - Tag/badge clouds

**Total: 31 Section Types**

---

### 🔧 Click Action Types (3)

1. **navigate_to_subpage** - Navigate to another page
   - `target`: page ID

2. **show_popup** - Display popup overlay
   - `popup_id`: popup identifier

3. **external_link** - Open external URL
   - `target`: URL
   - `open_in_new_tab`: boolean

---

### 🎬 Animation Types

#### Entry Animations (8)
- `fade-in` (default)
- `slide-in-up`
- `slide-in-down`
- `slide-in-left`
- `slide-in-right`
- `scale-in`
- `bounce-in`
- `stagger-fade-in`
- `none`

#### Hover Effects (5)
- `zoom`
- `lift`
- `glow`
- `border`
- `brightness`

#### Expandable Animations (4)
- `slide-down`
- `slide-up`
- `fade-in`
- `scale-expand`

#### Page Transitions (4)
- `fade`
- `slide-left`
- `slide-right`
- `scale-fade`
- `instant`

#### Loading Animations (4)
- `spinner`
- `dots`
- `pulse`
- `skeleton`

**Total: 25+ Animation Types**

---

### 🧭 Navigation Types (3)

1. **Hierarchical** - Tree structure with breadcrumbs
   - Breadcrumbs
   - Page tree sidebar
   - Back button
   - Next/Previous (optional)
   - Back to Agenda

2. **Tabs** - Horizontal tab bar
   - Tab bar
   - Back to Agenda

3. **Linear** - Step-by-step progression
   - Next/Previous buttons
   - Progress indicator (steps/bar/dots)
   - Back to Agenda

---

### 📋 Metadata Fields

#### Card Metadata (Required)
- `id`, `name`, `category`, `color_theme`, `icon`

#### Card Metadata (Optional)
- `description.short`, `description.long`
- `metadata.author`, `metadata.version`, `metadata.last_updated`
- `metadata.tags[]`, `metadata.difficulty`, `metadata.estimated_time`
- `metadata.prerequisites[]`, `metadata.related_cards[]`
- `metadata.status`, `metadata.language`, `metadata.audience[]`

#### Page Metadata (Required)
- `id`
- `titles.page_header`, `titles.menu_title`, `titles.agenda_title`, `titles.breadcrumb`

#### Page Metadata (Optional)
- `description.short`, `description.long`
- `parent` (page ID or null)
- `icon`
- Same metadata fields as cards

#### Navigation Metadata
- `navigation.type` (hierarchical/tabs/linear)
- `navigation.show_breadcrumbs`
- `navigation.show_page_tree`
- `navigation.show_back_button`
- `navigation.show_next_previous`
- `navigation.back_to_agenda_button`
- `navigation.siblings.previous`, `navigation.siblings.next`

---

### 🎨 Popup Configuration

- `id` - Unique identifier
- `size` - small/medium/large/full-screen
- `title` - Popup heading
- `animation` - Entry animation
- `sections[]` - Array of section types (same as pages)
- `actions[]` - Footer buttons
  - `label` - Button text
  - `action.type` - navigate_to_page/navigate_to_subpage/external_link/close_popup
  - `action.target` or `action.url`

---

### 📁 File Structure to Support

```
/content/pages/
  ├─ cards/
  │   └─ [card-id]/
  │       ├─ card-definition.md
  │       ├─ agenda.md
  │       └─ pages/
  │           ├─ page1.md
  │           └─ page1/
  │               └─ subpage1.md
  └─ library/
      └─ [category]/
          └─ reusable-page.md
```

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────┐
│         MD/YAML Template Files              │
│  (Phase 1: 37 files, 200KB documentation)   │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │   Template Parser    │
         │  (gray-matter + YAML)│
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │   TypeScript Types   │
         │  (Card, Page, Section)│
         └──────────┬────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │  Navigation Builder  │
         │  (Hierarchy, Routes) │
         └──────────┬────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │  Section Renderer    │
         │  (30+ React Components)│
         └──────────┬────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │   React UI (Live)    │
         │  (Interactive Cards) │
         └──────────────────────┘
```

### Directory Structure (To Create)

```
frontend/src/
├─ lib/
│   ├─ template-parser/
│   │   ├─ index.ts                    # Main parser entry
│   │   ├─ card-parser.ts              # Parse card definitions
│   │   ├─ agenda-parser.ts            # Parse agendas
│   │   ├─ page-parser.ts              # Parse pages
│   │   ├─ section-parser.ts           # Parse sections
│   │   ├─ popup-parser.ts             # Parse popups
│   │   ├─ navigation-builder.ts       # Build nav hierarchy
│   │   ├─ file-loader.ts              # Load MD files
│   │   └─ yaml-utils.ts               # YAML helpers
│   │
│   └─ template-types/
│       ├─ index.ts                    # Export all types
│       ├─ card.types.ts               # Card interfaces
│       ├─ page.types.ts               # Page interfaces
│       ├─ section.types.ts            # Section interfaces
│       ├─ navigation.types.ts         # Navigation interfaces
│       ├─ metadata.types.ts           # Metadata interfaces
│       ├─ animation.types.ts          # Animation interfaces
│       └─ popup.types.ts              # Popup interfaces
│
├─ components/
│   ├─ template-renderer/
│   │   ├─ index.tsx                   # Main renderer
│   │   ├─ CardRenderer.tsx            # Render cards
│   │   ├─ AgendaRenderer.tsx          # Render agendas
│   │   ├─ PageRenderer.tsx            # Render pages
│   │   ├─ SectionRenderer.tsx         # Route to sections
│   │   └─ PopupRenderer.tsx           # Render popups
│   │
│   ├─ template-sections/
│   │   ├─ content/                    # Content display sections
│   │   │   ├─ HeroSection.tsx
│   │   │   ├─ TextSection.tsx
│   │   │   ├─ TextWithLinksSection.tsx
│   │   │   ├─ ImageSection.tsx
│   │   │   ├─ VideoSection.tsx
│   │   │   ├─ CodeBlockSection.tsx
│   │   │   ├─ QuoteSection.tsx
│   │   │   ├─ DividerSection.tsx
│   │   │   └─ EmbedSection.tsx
│   │   │
│   │   ├─ navigation/                 # Navigation sections
│   │   │   ├─ ImageClickableSection.tsx
│   │   │   ├─ FeatureGridSection.tsx
│   │   │   ├─ ClickableCardsSection.tsx
│   │   │   ├─ TabbedContentSection.tsx
│   │   │   └─ InteractiveDiagramSection.tsx
│   │   │
│   │   ├─ data/                       # Data presentation
│   │   │   ├─ ListSection.tsx
│   │   │   ├─ ComparisonGridSection.tsx
│   │   │   ├─ KeyValuePairsSection.tsx
│   │   │   ├─ StepsSection.tsx
│   │   │   ├─ TimelineSection.tsx
│   │   │   └─ TableSection.tsx
│   │   │
│   │   ├─ expandable/                 # Expandable content
│   │   │   ├─ ExpandableSectionComponent.tsx
│   │   │   ├─ ExpandableCardComponent.tsx
│   │   │   └─ AccordionSection.tsx
│   │   │
│   │   └─ special/                    # Special elements
│   │       ├─ AlertSection.tsx
│   │       ├─ StatsSection.tsx
│   │       ├─ DownloadSection.tsx
│   │       ├─ GallerySection.tsx
│   │       ├─ CardListSection.tsx
│   │       ├─ ProgressSection.tsx
│   │       └─ TagsSection.tsx
│   │
│   └─ template-navigation/
│       ├─ Breadcrumbs.tsx             # Breadcrumb component
│       ├─ PageTree.tsx                # Sidebar page tree
│       ├─ TabBar.tsx                  # Horizontal tabs
│       ├─ NavigationButtons.tsx       # Back/Next/Agenda buttons
│       ├─ ProgressIndicator.tsx       # Progress bar/steps/dots
│       └─ NavigationProvider.tsx      # Navigation context
│
└─ hooks/
    ├─ useTemplateParser.ts            # Parse templates hook
    ├─ useNavigation.ts                # Navigation hook
    ├─ usePopup.ts                     # Popup management hook
    └─ useAnimation.ts                 # Animation hook
```

**Total New Files:** ~70+ files

---

## Parser Implementation

### Phase 2A: Core Parser Infrastructure

#### Task 2A.1: TypeScript Type System

**File:** `frontend/src/lib/template-types/`

**Create comprehensive TypeScript interfaces for:**

1. **card.types.ts**
```typescript
export interface CardDefinition {
  id: string;
  name: string;
  category: string;
  color_theme: ColorTheme;
  icon: string;
  description?: {
    short?: string;
    long?: string;
  };
  metadata?: CardMetadata;
  agenda: {
    file: string;
  };
  navigation: NavigationConfig;
  pages: PageReference[];
  settings: CardSettings;
}

export interface CardMetadata {
  author?: string;
  version?: string;
  last_updated?: string;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimated_time?: string;
  prerequisites?: string[];
  related_cards?: string[];
  status?: 'draft' | 'review' | 'published' | 'archived';
  language?: string;
  audience?: string[];
}

export interface CardSettings {
  default_animation: AnimationType;
  transition_speed: string | number;
  max_depth: number;
  enable_search?: boolean;
  enable_bookmarks?: boolean;
  respect_reduced_motion?: boolean;
}

export type ColorTheme =
  | 'blue' | 'emerald' | 'violet' | 'red'
  | 'amber' | 'indigo' | 'cyan' | 'pink'
  | 'green' | 'orange';

export interface PageReference {
  file: string;
  order?: number;
}
```

2. **page.types.ts**
```typescript
export interface PageDefinition {
  id: string;
  titles: PageTitles;
  description?: {
    short?: string;
    long?: string;
  };
  metadata?: PageMetadata;
  parent: string | null;
  icon?: string;
  sections: Section[];
  sub_pages?: PageReference[];
  popups?: PopupDefinition[];
  navigation?: PageNavigation;
}

export interface PageTitles {
  page_header: string;
  menu_title: string;
  agenda_title: string;
  breadcrumb: string;
}

export interface PageMetadata {
  author?: string;
  version?: string;
  last_updated?: string;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimated_time?: string;
}

export interface PageNavigation {
  show_breadcrumbs?: boolean;
  show_back_button?: boolean;
  show_next_previous?: boolean;
  back_to_agenda_button?: boolean;
  siblings?: {
    previous?: string | null;
    next?: string | null;
  };
}
```

3. **section.types.ts** (31 section type interfaces)
```typescript
export type Section =
  | HeroSection
  | TextSection
  | TextWithLinksSection
  | ImageSection
  | ImageClickableSection
  | VideoSection
  | CodeBlockSection
  | QuoteSection
  | DividerSection
  | EmbedSection
  | FeatureGridSection
  | ClickableCardsSection
  | TabbedContentSection
  | InteractiveDiagramSection
  | ListSection
  | ComparisonGridSection
  | KeyValuePairsSection
  | StepsSection
  | TimelineSection
  | TableSection
  | ExpandableSection
  | ExpandableCardSection
  | AccordionSection
  | AlertSection
  | StatsSection
  | DownloadSection
  | GallerySection
  | CardListSection
  | ProgressSection
  | TagsSection
  | LoadingSection;

export interface BaseSection {
  type: string;
}

export interface HeroSection extends BaseSection {
  type: 'hero';
  heading: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TextSection extends BaseSection {
  type: 'text';
  content: string;
  align?: 'left' | 'center' | 'right' | 'justify';
}

export interface TextWithLinksSection extends BaseSection {
  type: 'text_with_links';
  content: string; // Contains [[Display|target]] syntax
}

export interface ImageSection extends BaseSection {
  type: 'image';
  image: string;
  alt: string;
  caption?: string;
  size?: 'small' | 'medium' | 'large' | 'full';
  align?: 'left' | 'center' | 'right';
}

export interface ImageClickableSection extends BaseSection {
  type: 'image_clickable';
  image: string;
  alt: string;
  caption?: string;
  click_action: ClickAction;
  hover_effect?: HoverEffect;
}

export interface ClickAction {
  type: 'navigate_to_subpage' | 'show_popup' | 'external_link';
  target?: string;      // page ID or URL
  popup_id?: string;    // for show_popup
  open_in_new_tab?: boolean; // for external_link
}

export type HoverEffect = 'zoom' | 'lift' | 'glow' | 'border' | 'brightness';

export interface FeatureGridSection extends BaseSection {
  type: 'feature_grid';
  columns: 2 | 3 | 4;
  features: FeatureItem[];
}

export interface FeatureItem {
  name: string;
  icon: string;
  description: string;
  click_action?: ClickAction;
  hover_effect?: HoverEffect;
}

export interface ExpandableSection extends BaseSection {
  type: 'expandable_section';
  trigger: 'click' | 'hover';
  collapsed: {
    title: string;
    icon?: string;
    text?: string;
  };
  expanded: {
    content: string;
    animation?: ExpandableAnimation;
  };
  max_height?: string;
}

export interface AccordionSection extends BaseSection {
  type: 'accordion';
  allow_multiple: boolean;
  items: AccordionItem[];
}

export interface AccordionItem {
  title: string;
  content: string;
}

export interface InteractiveDiagramSection extends BaseSection {
  type: 'interactive_diagram';
  image: string;
  hotspots: Hotspot[];
}

export interface Hotspot {
  x: number;
  y: number;
  radius: number;
  click_action: ClickAction;
  hover_text?: string;
}

export interface CodeBlockSection extends BaseSection {
  type: 'code_block';
  language: string;
  code: string;
  filename?: string;
  show_line_numbers?: boolean;
  highlight_lines?: string;
}

export interface AlertSection extends BaseSection {
  type: 'alert';
  alert_type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  content: string;
  dismissible?: boolean;
  icon?: string;
}

// ... Continue for all 31 section types
```

4. **animation.types.ts**
```typescript
export type AnimationType =
  | 'fade-in'
  | 'slide-in-up' | 'slide-in-down' | 'slide-in-left' | 'slide-in-right'
  | 'scale-in'
  | 'bounce-in'
  | 'stagger-fade-in'
  | 'none';

export type ExpandableAnimation =
  | 'slide-down'
  | 'slide-up'
  | 'fade-in'
  | 'scale-expand';

export type PageTransition =
  | 'fade'
  | 'slide-left'
  | 'slide-right'
  | 'scale-fade'
  | 'instant';

export type LoadingAnimation =
  | 'spinner'
  | 'dots'
  | 'pulse'
  | 'skeleton';
```

5. **navigation.types.ts**
```typescript
export interface NavigationConfig {
  type: 'hierarchical' | 'tabs' | 'linear';
  show_breadcrumbs: boolean;
  show_page_tree: boolean;
  allow_back_to_agenda: boolean;
  show_next_previous?: boolean;
  tab_position?: 'top' | 'bottom';
  show_progress?: boolean;
  progress_style?: 'steps' | 'bar' | 'dots';
}

export interface NavigationHierarchy {
  card: CardDefinition;
  pages: PageNode[];
}

export interface PageNode {
  page: PageDefinition;
  children: PageNode[];
  parent: PageNode | null;
  level: number;
  path: string[];
}

export interface Breadcrumb {
  label: string;
  path: string;
  icon?: string;
}
```

6. **popup.types.ts**
```typescript
export interface PopupDefinition {
  id: string;
  size: 'small' | 'medium' | 'large' | 'full-screen';
  title: string;
  animation?: AnimationType;
  sections?: Section[];
  content?: string; // Simple text-only popup
  actions: PopupAction[];
}

export interface PopupAction {
  label: string;
  action: {
    type: 'navigate_to_page' | 'navigate_to_subpage' | 'external_link' | 'close_popup';
    target?: string;
    url?: string;
  };
}
```

**Deliverable:** Complete TypeScript type system covering all Phase 1 features

---

#### Task 2A.2: YAML Parser Infrastructure

**File:** `frontend/src/lib/template-parser/yaml-utils.ts`

**Implement:**

1. **Frontmatter extraction** using `gray-matter`
2. **YAML validation**
3. **Type conversion** (strings to proper types)
4. **Error handling** with detailed error messages
5. **Default value injection**

```typescript
import matter from 'gray-matter';
import yaml from 'js-yaml';

export function parseMarkdownFile(content: string): {
  data: any;
  content: string;
  errors: ParseError[];
} {
  try {
    const { data, content: markdown } = matter(content);
    return {
      data,
      content: markdown,
      errors: []
    };
  } catch (error) {
    return {
      data: {},
      content: '',
      errors: [createParseError(error)]
    };
  }
}

export function validateYAML(data: any, schema: any): ValidationResult {
  // Validate against TypeScript interfaces
  // Return detailed errors for missing/invalid fields
}
```

**Deliverable:** Robust YAML parsing with error handling

---

#### Task 2A.3: File Loader System

**File:** `frontend/src/lib/template-parser/file-loader.ts`

**Implement:**

1. **Dynamic MD file loading** (support both `/content/pages/` and `/content/pages/library/`)
2. **File path resolution** (handle relative paths)
3. **Caching** (avoid re-parsing same files)
4. **Hot-reload support** (watch for file changes)
5. **Library page resolution** (resolve library references)

```typescript
export class FileLoader {
  private cache: Map<string, any> = new Map();

  async loadCard(cardId: string): Promise<CardDefinition> {
    const path = `/content/pages/cards/${cardId}/card-definition.md`;
    return this.loadAndParseFile(path, parseCard);
  }

  async loadPage(filePath: string): Promise<PageDefinition> {
    return this.loadAndParseFile(filePath, parsePage);
  }

  async loadLibraryPage(libraryPath: string): Promise<PageDefinition> {
    const path = `/content/pages/library/${libraryPath}`;
    return this.loadAndParseFile(path, parsePage);
  }

  private async loadAndParseFile<T>(
    path: string,
    parser: (content: string) => T
  ): Promise<T> {
    // Check cache
    if (this.cache.has(path)) {
      return this.cache.get(path);
    }

    // Load file
    const response = await fetch(path);
    const content = await response.text();

    // Parse
    const parsed = parser(content);

    // Cache
    this.cache.set(path, parsed);

    return parsed;
  }

  clearCache() {
    this.cache.clear();
  }
}
```

**Deliverable:** File loading system with caching

---

### Phase 2B: Specialized Parsers

#### Task 2B.1: Card Definition Parser

**File:** `frontend/src/lib/template-parser/card-parser.ts`

**Parse:**
- Card metadata (id, name, category, color_theme, icon)
- Optional metadata (author, version, tags, difficulty, etc.)
- Agenda reference
- Navigation configuration
- Page references (including library pages)
- Global settings

```typescript
export function parseCardDefinition(content: string): CardDefinition {
  const { data, errors } = parseMarkdownFile(content);

  // Validate required fields
  validateRequired(data.card, ['id', 'name', 'category', 'color_theme', 'icon']);

  // Parse and type-check
  const card: CardDefinition = {
    id: data.card.id,
    name: data.card.name,
    category: data.card.category,
    color_theme: data.card.color_theme as ColorTheme,
    icon: data.card.icon,
    description: data.card.description,
    metadata: parseCardMetadata(data.card.metadata),
    agenda: { file: data.card.agenda.file },
    navigation: parseNavigationConfig(data.card.navigation),
    pages: parsePageReferences(data.card.pages),
    settings: parseCardSettings(data.card.settings)
  };

  return card;
}
```

**Deliverable:** Card definition parser with validation

---

#### Task 2B.2: Page Parser

**File:** `frontend/src/lib/template-parser/page-parser.ts`

**Parse:**
- Page ID and titles (all 4 variants)
- Descriptions
- Metadata
- Parent reference
- Icon
- All 31 section types
- Sub-page references
- Popup definitions
- Navigation configuration

```typescript
export function parsePage(content: string): PageDefinition {
  const { data } = parseMarkdownFile(content);

  // Validate required fields
  validateRequired(data.page, ['id', 'titles']);
  validateRequired(data.page.titles, [
    'page_header', 'menu_title', 'agenda_title', 'breadcrumb'
  ]);

  // Parse sections
  const sections = data.sections?.map(parseSectionType) || [];

  // Parse popups
  const popups = data.popups?.map(parsePopup) || [];

  const page: PageDefinition = {
    id: data.page.id,
    titles: data.page.titles,
    description: data.page.description,
    metadata: data.page.metadata,
    parent: data.page.parent,
    icon: data.page.icon,
    sections,
    sub_pages: data.sub_pages,
    popups,
    navigation: data.navigation
  };

  return page;
}
```

**Deliverable:** Page parser supporting all features

---

#### Task 2B.3: Section Parser (31 types)

**File:** `frontend/src/lib/template-parser/section-parser.ts`

**Parse all 31 section types with proper type discrimination:**

```typescript
export function parseSectionType(sectionData: any): Section {
  const type = sectionData.type;

  switch (type) {
    case 'hero':
      return parseHeroSection(sectionData);
    case 'text':
      return parseTextSection(sectionData);
    case 'text_with_links':
      return parseTextWithLinksSection(sectionData);
    case 'image':
      return parseImageSection(sectionData);
    case 'image_clickable':
      return parseImageClickableSection(sectionData);
    case 'video':
      return parseVideoSection(sectionData);
    case 'code_block':
      return parseCodeBlockSection(sectionData);
    case 'feature_grid':
      return parseFeatureGridSection(sectionData);
    case 'clickable_cards':
      return parseClickableCardsSection(sectionData);
    case 'expandable_section':
      return parseExpandableSection(sectionData);
    case 'expandable_card':
      return parseExpandableCardSection(sectionData);
    case 'accordion':
      return parseAccordionSection(sectionData);
    case 'interactive_diagram':
      return parseInteractiveDiagramSection(sectionData);
    case 'tabbed_content':
      return parseTabbedContentSection(sectionData);
    case 'list':
      return parseListSection(sectionData);
    case 'comparison_grid':
      return parseComparisonGridSection(sectionData);
    case 'key_value_pairs':
      return parseKeyValuePairsSection(sectionData);
    case 'steps':
      return parseStepsSection(sectionData);
    case 'timeline':
      return parseTimelineSection(sectionData);
    case 'table':
      return parseTableSection(sectionData);
    case 'alert':
      return parseAlertSection(sectionData);
    case 'stats':
      return parseStatsSection(sectionData);
    case 'quote':
      return parseQuoteSection(sectionData);
    case 'divider':
      return parseDividerSection(sectionData);
    case 'embed':
      return parseEmbedSection(sectionData);
    case 'download':
      return parseDownloadSection(sectionData);
    case 'gallery':
      return parseGallerySection(sectionData);
    case 'card_list':
      return parseCardListSection(sectionData);
    case 'progress':
      return parseProgressSection(sectionData);
    case 'tags':
      return parseTagsSection(sectionData);
    default:
      throw new Error(`Unknown section type: ${type}`);
  }
}
```

**For each section type, create parser:**

```typescript
function parseFeatureGridSection(data: any): FeatureGridSection {
  return {
    type: 'feature_grid',
    columns: data.columns || 3,
    features: data.features.map(parseFeatureItem)
  };
}

function parseFeatureItem(data: any): FeatureItem {
  return {
    name: data.name,
    icon: data.icon,
    description: data.description,
    click_action: data.click_action ? parseClickAction(data.click_action) : undefined,
    hover_effect: data.hover_effect
  };
}

function parseClickAction(data: any): ClickAction {
  return {
    type: data.type,
    target: data.target,
    popup_id: data.popup_id,
    open_in_new_tab: data.open_in_new_tab
  };
}
```

**Deliverable:** Complete section parser for all 31 types

---

#### Task 2B.4: Navigation Builder

**File:** `frontend/src/lib/template-parser/navigation-builder.ts`

**Build:**
- Hierarchical page tree from `parent` fields
- Breadcrumb trails
- Sibling relationships
- Navigation paths
- Route mapping

```typescript
export class NavigationBuilder {
  buildHierarchy(card: CardDefinition, pages: Map<string, PageDefinition>): NavigationHierarchy {
    // Build page tree
    const rootPages = this.findRootPages(pages);
    const pageNodes = rootPages.map(page => this.buildPageNode(page, pages, null, 0));

    return {
      card,
      pages: pageNodes
    };
  }

  private buildPageNode(
    page: PageDefinition,
    allPages: Map<string, PageDefinition>,
    parent: PageNode | null,
    level: number
  ): PageNode {
    const children = this.findChildren(page.id, allPages)
      .map(child => this.buildPageNode(child, allPages, null, level + 1));

    const path = parent ? [...parent.path, page.id] : [page.id];

    return {
      page,
      children,
      parent,
      level,
      path
    };
  }

  buildBreadcrumbs(pageId: string, hierarchy: NavigationHierarchy): Breadcrumb[] {
    const node = this.findNode(pageId, hierarchy);
    if (!node) return [];

    const breadcrumbs: Breadcrumb[] = [];
    let current: PageNode | null = node;

    while (current) {
      breadcrumbs.unshift({
        label: current.page.titles.breadcrumb,
        path: this.buildPath(current),
        icon: current.page.icon
      });
      current = current.parent;
    }

    return breadcrumbs;
  }
}
```

**Deliverable:** Navigation hierarchy builder

---

### Phase 2C: React Renderer System

#### Task 2C.1: Main Renderer Components

**Files:**
- `frontend/src/components/template-renderer/CardRenderer.tsx`
- `frontend/src/components/template-renderer/PageRenderer.tsx`
- `frontend/src/components/template-renderer/SectionRenderer.tsx`

**CardRenderer.tsx**
```typescript
import { CardDefinition } from '@/lib/template-types';
import { PageRenderer } from './PageRenderer';
import { NavigationProvider } from '@/components/template-navigation/NavigationProvider';

export function CardRenderer({ card }: { card: CardDefinition }) {
  const [currentPage, setCurrentPage] = useState<string | null>(null);

  return (
    <NavigationProvider card={card}>
      <div className="card-container" data-card-id={card.id} data-theme={card.color_theme}>
        {currentPage === null ? (
          <AgendaRenderer card={card} />
        ) : (
          <PageRenderer pageId={currentPage} card={card} />
        )}
      </div>
    </NavigationProvider>
  );
}
```

**PageRenderer.tsx**
```typescript
export function PageRenderer({ pageId, card }: { pageId: string; card: CardDefinition }) {
  const page = usePageData(pageId);
  const navigation = useNavigation();

  return (
    <div className="page-container">
      {/* Navigation components based on card.navigation.type */}
      {card.navigation.show_breadcrumbs && <Breadcrumbs />}
      {card.navigation.show_page_tree && <PageTree />}

      {/* Page content */}
      <main>
        {page.sections.map((section, index) => (
          <SectionRenderer key={index} section={section} />
        ))}
      </main>

      {/* Navigation buttons */}
      <NavigationButtons />

      {/* Popups */}
      {page.popups?.map(popup => (
        <PopupRenderer key={popup.id} popup={popup} />
      ))}
    </div>
  );
}
```

**SectionRenderer.tsx**
```typescript
export function SectionRenderer({ section }: { section: Section }) {
  switch (section.type) {
    case 'hero':
      return <HeroSection {...section} />;
    case 'text':
      return <TextSection {...section} />;
    case 'text_with_links':
      return <TextWithLinksSection {...section} />;
    case 'image':
      return <ImageSection {...section} />;
    case 'image_clickable':
      return <ImageClickableSection {...section} />;
    case 'video':
      return <VideoSection {...section} />;
    case 'code_block':
      return <CodeBlockSection {...section} />;
    case 'feature_grid':
      return <FeatureGridSection {...section} />;
    case 'clickable_cards':
      return <ClickableCardsSection {...section} />;
    case 'expandable_section':
      return <ExpandableS ectionComponent {...section} />;
    case 'expandable_card':
      return <ExpandableCardComponent {...section} />;
    case 'accordion':
      return <AccordionSection {...section} />;
    case 'interactive_diagram':
      return <InteractiveDiagramSection {...section} />;
    case 'tabbed_content':
      return <TabbedContentSection {...section} />;
    case 'list':
      return <ListSection {...section} />;
    case 'comparison_grid':
      return <ComparisonGridSection {...section} />;
    case 'key_value_pairs':
      return <KeyValuePairsSection {...section} />;
    case 'steps':
      return <StepsSection {...section} />;
    case 'timeline':
      return <TimelineSection {...section} />;
    case 'table':
      return <TableSection {...section} />;
    case 'alert':
      return <AlertSection {...section} />;
    case 'stats':
      return <StatsSection {...section} />;
    case 'quote':
      return <QuoteSection {...section} />;
    case 'divider':
      return <DividerSection {...section} />;
    case 'embed':
      return <EmbedSection {...section} />;
    case 'download':
      return <DownloadSection {...section} />;
    case 'gallery':
      return <GallerySection {...section} />;
    case 'card_list':
      return <CardListSection {...section} />;
    case 'progress':
      return <ProgressSection {...section} />;
    case 'tags':
      return <TagsSection {...section} />;
    default:
      return <div>Unknown section type</div>;
  }
}
```

**Deliverable:** Main rendering infrastructure

---

#### Task 2C.2: Content Display Components (9 types)

**Create React components for:**

1. **HeroSection.tsx**
```typescript
export function HeroSection({ heading, subtitle, align }: HeroSection) {
  return (
    <div className={`hero-section align-${align || 'left'}`}>
      <h1>{heading}</h1>
      {subtitle && <p className="subtitle">{subtitle}</p>}
    </div>
  );
}
```

2. **TextSection.tsx** - Render markdown content
3. **TextWithLinksSection.tsx** - Parse `[[text|target]]` syntax and create navigation links
4. **ImageSection.tsx** - Display images with captions
5. **VideoSection.tsx** - Embed YouTube/Vimeo/MP4 videos
6. **CodeBlockSection.tsx** - Syntax highlighting using Prism/Highlight.js
7. **QuoteSection.tsx** - Blockquotes with attribution
8. **DividerSection.tsx** - Visual separators
9. **EmbedSection.tsx** - iframe embeds

**Key Implementation:**
- Markdown rendering (use `react-markdown`)
- Syntax highlighting (use `prism-react-renderer`)
- Responsive images
- Video player controls
- Accessibility (ARIA labels, alt text)

**Deliverable:** 9 content display components

---

#### Task 2C.3: Navigation & Interactive Components (6 types)

**Create React components for:**

1. **ImageClickableSection.tsx**
```typescript
export function ImageClickableSection({
  image, alt, caption, click_action, hover_effect
}: ImageClickableSection) {
  const handleClick = useClickAction(click_action);

  return (
    <div
      className={`image-clickable hover-${hover_effect || 'zoom'}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <img src={image} alt={alt} />
      {caption && <p className="caption">{caption}</p>}
    </div>
  );
}
```

2. **FeatureGridSection.tsx** - Grid of clickable feature cards
3. **ClickableCardsSection.tsx** - Navigation card grids
4. **TabbedContentSection.tsx** - Tab interface with routing
5. **InteractiveDiagramSection.tsx** - SVG overlays for hotspots
6. **TextWithNavigationSection.tsx** - Alternative navigation text

**Key Implementation:**
- Click action handlers (navigate, popup, external)
- Hover effect animations (CSS transitions)
- Keyboard navigation
- Tab state management
- SVG hotspot positioning

**Deliverable:** 6 interactive navigation components

---

#### Task 2C.4: Data Presentation Components (6 types)

**Create React components for:**

1. **ListSection.tsx** - Bullet/numbered/checklist rendering
2. **ComparisonGridSection.tsx** - Side-by-side comparison tables
3. **KeyValuePairsSection.tsx** - Data display grids
4. **StepsSection.tsx** - Numbered step-by-step guides
5. **TimelineSection.tsx** - Chronological event displays
6. **TableSection.tsx** - Structured data tables

**Key Implementation:**
- Responsive grids
- Semantic HTML (proper `<table>`, `<ol>`, `<ul>`)
- Highlight/badge support
- Mobile-friendly layouts

**Deliverable:** 6 data presentation components

---

#### Task 2C.5: Expandable Content Components (3 types)

**Create React components for:**

1. **ExpandableSectionComponent.tsx**
```typescript
export function ExpandableSectionComponent({
  trigger, collapsed, expanded, max_height
}: ExpandableSection) {
  const [isExpanded, setIsExpanded] = useState(false);
  const animation = expanded.animation || 'slide-down';

  return (
    <div className="expandable-section">
      <div
        className="collapsed-state"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Icon name={collapsed.icon || 'ChevronDown'} />
        <h3>{collapsed.title}</h3>
        {collapsed.text && <p>{collapsed.text}</p>}
      </div>

      {isExpanded && (
        <div
          className={`expanded-state animation-${animation}`}
          style={{ maxHeight: max_height }}
        >
          <Markdown>{expanded.content}</Markdown>
        </div>
      )}
    </div>
  );
}
```

2. **ExpandableCardComponent.tsx** - Card-style expansion
3. **AccordionSection.tsx** - Multiple expandable items

**Key Implementation:**
- Animation state management
- CSS transitions for smooth animations
- Auto-scroll to expanded content
- Keyboard accessibility (arrow keys)
- Single vs multiple expansion logic

**Deliverable:** 3 expandable components

---

#### Task 2C.6: Special Elements Components (7 types)

**Create React components for:**

1. **AlertSection.tsx** - Info/success/warning/error callouts
2. **StatsSection.tsx** - Key metrics display
3. **DownloadSection.tsx** - File download links
4. **GallerySection.tsx** - Image grids with lightbox
5. **CardListSection.tsx** - Vertical card lists
6. **ProgressSection.tsx** - Progress indicators
7. **TagsSection.tsx** - Tag clouds

**Key Implementation:**
- Alert color theming (info=blue, success=green, warning=yellow, error=red)
- Icon integration (Lucide icons)
- Download file size formatting
- Lightbox modal for gallery
- Click handlers for tags

**Deliverable:** 7 special element components

---

### Phase 2D: Navigation System Implementation

#### Task 2D.1: Navigation Components

**Create:**

1. **Breadcrumbs.tsx**
```typescript
export function Breadcrumbs() {
  const { breadcrumbs } = useNavigation();

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {breadcrumbs.map((crumb, index) => (
          <li key={index}>
            {index < breadcrumbs.length - 1 ? (
              <Link to={crumb.path}>
                {crumb.icon && <Icon name={crumb.icon} />}
                {crumb.label}
              </Link>
            ) : (
              <span aria-current="page">{crumb.label}</span>
            )}
            {index < breadcrumbs.length - 1 && <span className="separator">›</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

2. **PageTree.tsx** - Sidebar with collapsible page hierarchy
3. **TabBar.tsx** - Horizontal tab navigation
4. **NavigationButtons.tsx** - Back/Next/Agenda buttons
5. **ProgressIndicator.tsx** - Steps/bar/dots display

**Deliverable:** 5 navigation UI components

---

#### Task 2D.2: Navigation Context & Routing

**File:** `frontend/src/components/template-navigation/NavigationProvider.tsx`

**Implement:**
- Navigation state management
- Route handling
- History management
- Breadcrumb generation
- Page tree state

```typescript
export function NavigationProvider({ card, children }: NavigationProviderProps) {
  const [currentPage, setCurrentPage] = useState<string | null>(null);
  const [hierarchy, setHierarchy] = useState<NavigationHierarchy | null>(null);
  const [popupStack, setPopupStack] = useState<string[]>([]);

  // Build hierarchy on mount
  useEffect(() => {
    const builder = new NavigationBuilder();
    const pages = loadAllPages(card);
    const nav = builder.buildHierarchy(card, pages);
    setHierarchy(nav);
  }, [card]);

  const navigateToPage = (pageId: string) => {
    setCurrentPage(pageId);
    // Update browser history
    window.history.pushState({}, '', `/cards/${card.id}/${pageId}`);
  };

  const showPopup = (popupId: string) => {
    setPopupStack([...popupStack, popupId]);
  };

  const closePopup = () => {
    setPopupStack(popupStack.slice(0, -1));
  };

  const breadcrumbs = useMemo(() => {
    if (!currentPage || !hierarchy) return [];
    const builder = new NavigationBuilder();
    return builder.buildBreadcrumbs(currentPage, hierarchy);
  }, [currentPage, hierarchy]);

  return (
    <NavigationContext.Provider value={{
      card,
      currentPage,
      hierarchy,
      breadcrumbs,
      popupStack,
      navigateToPage,
      showPopup,
      closePopup
    }}>
      {children}
    </NavigationContext.Provider>
  );
}
```

**Deliverable:** Navigation context system

---

### Phase 2E: Popup System

#### Task 2E.1: Popup Renderer

**File:** `frontend/src/components/template-renderer/PopupRenderer.tsx`

**Implement:**
- Modal overlay
- Size variations (small/medium/large/full-screen)
- Entry animations
- Section rendering within popups
- Action button handlers
- Close on overlay click
- Escape key handling

```typescript
export function PopupRenderer({ popup, isOpen, onClose }: PopupRendererProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div
        className={`popup size-${popup.size} animation-${popup.animation || 'scale-in'}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title"
      >
        <div className="popup-header">
          <h2 id="popup-title">{popup.title}</h2>
          <button onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="popup-content">
          {popup.content && <Markdown>{popup.content}</Markdown>}
          {popup.sections?.map((section, index) => (
            <SectionRenderer key={index} section={section} />
          ))}
        </div>

        <div className="popup-actions">
          {popup.actions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleAction(action)}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Deliverable:** Complete popup system

---

### Phase 2F: Custom Hooks

#### Task 2F.1: Template Parser Hook

**File:** `frontend/src/hooks/useTemplateParser.ts`

```typescript
export function useTemplateParser(cardId: string) {
  const [card, setCard] = useState<CardDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loader = new FileLoader();

    loader.loadCard(cardId)
      .then(setCard)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [cardId]);

  return { card, loading, error };
}
```

**Deliverable:** Parser hook

---

#### Task 2F.2: Navigation Hook

**File:** `frontend/src/hooks/useNavigation.ts`

```typescript
export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}
```

**Deliverable:** Navigation hook

---

#### Task 2F.3: Popup Management Hook

**File:** `frontend/src/hooks/usePopup.ts`

```typescript
export function usePopup() {
  const { popupStack, showPopup, closePopup } = useNavigation();

  const isOpen = (popupId: string) => popupStack.includes(popupId);

  return {
    isOpen,
    showPopup,
    closePopup
  };
}
```

**Deliverable:** Popup management hook

---

#### Task 2F.4: Click Action Hook

**File:** `frontend/src/hooks/useClickAction.ts`

```typescript
export function useClickAction(action?: ClickAction) {
  const { navigateToPage, showPopup } = useNavigation();

  if (!action) return () => {};

  return () => {
    switch (action.type) {
      case 'navigate_to_subpage':
        if (action.target) {
          navigateToPage(action.target);
        }
        break;

      case 'show_popup':
        if (action.popup_id) {
          showPopup(action.popup_id);
        }
        break;

      case 'external_link':
        if (action.target) {
          if (action.open_in_new_tab) {
            window.open(action.target, '_blank');
          } else {
            window.location.href = action.target;
          }
        }
        break;
    }
  };
}
```

**Deliverable:** Click action handler hook

---

## Implementation Phases

### 🔵 Phase 2A: Foundation (2-3 hours)

**Priority: CRITICAL**

**MANDATORY: Test-First Approach - Write tests BEFORE implementation**

#### Task 2A.1: TypeScript Type System (30-45 min)
- [ ] **IMPLEMENT:** Create 7 type definition files
- [ ] **TEST (Unit):** Type exports work correctly
- [ ] **TEST (Integration):** Import types in test file, no errors
- [ ] **VERIFY:** Run `tsc --noEmit` - zero errors
- [ ] **VERIFY:** All 31 section types have interfaces
- [ ] **VERIFY:** No `any` types in code
- [ ] **DOCUMENT:** Add TSDoc comments to all interfaces

#### Task 2A.2: YAML Parser Infrastructure (45 min)
- [ ] **TEST FIRST:** Write test cases for valid/invalid YAML
- [ ] **IMPLEMENT:** yaml-utils.ts with gray-matter
- [ ] **TEST (Unit):** Parse valid YAML frontmatter
- [ ] **TEST (Unit):** Handle malformed YAML gracefully
- [ ] **TEST (Unit):** Validate required fields
- [ ] **TEST (Unit):** Type conversion works
- [ ] **TEST (Edge):** Empty file
- [ ] **TEST (Edge):** No frontmatter
- [ ] **TEST (Edge):** Invalid characters
- [ ] **VERIFY:** All tests pass
- [ ] **DOCUMENT:** Error codes and messages

#### Task 2A.3: File Loader (45 min)
- [ ] **TEST FIRST:** Write test cases for file loading
- [ ] **IMPLEMENT:** file-loader.ts with fetch + caching
- [ ] **TEST (Unit):** Load existing file
- [ ] **TEST (Unit):** Handle 404 errors
- [ ] **TEST (Unit):** Cache works (second load is cached)
- [ ] **TEST (Unit):** Cache clear works
- [ ] **TEST (Unit):** Library path resolution
- [ ] **TEST (Integration):** Load all 18 example files
- [ ] **TEST (Edge):** Network error
- [ ] **TEST (Edge):** Retry logic works
- [ ] **VERIFY:** All 18 files load successfully
- [ ] **PROFILE:** Check performance (<50ms per file)

#### Task 2A.4: Card Parser (30 min)
- [ ] **TEST FIRST:** Write test for simple-card definition
- [ ] **IMPLEMENT:** card-parser.ts
- [ ] **TEST (Unit):** Parse required fields
- [ ] **TEST (Unit):** Parse optional metadata
- [ ] **TEST (Unit):** Parse navigation config
- [ ] **TEST (Unit):** Parse page references
- [ ] **TEST (Integration):** Parse simple-card
- [ ] **TEST (Integration):** Parse medium-card
- [ ] **TEST (Integration):** Parse complex-card
- [ ] **TEST (Edge):** Missing required field shows helpful error
- [ ] **TEST (Edge):** Invalid color_theme shows error
- [ ] **VERIFY:** All 3 cards parse successfully
- [ ] **VERIFY:** Error messages are helpful

#### Task 2A.5: Page Parser (30 min)
- [ ] **TEST FIRST:** Write test for intro page
- [ ] **IMPLEMENT:** page-parser.ts
- [ ] **TEST (Unit):** Parse all 4 title variants
- [ ] **TEST (Unit):** Parse parent reference
- [ ] **TEST (Unit):** Parse sections array
- [ ] **TEST (Unit):** Parse sub_pages
- [ ] **TEST (Unit):** Parse popups
- [ ] **TEST (Integration):** Parse each of 18 example pages
- [ ] **TEST (Edge):** Missing title variant shows error
- [ ] **TEST (Edge):** Invalid parent ID shows error
- [ ] **VERIFY:** All 18 pages parse successfully

#### Task 2A.6: Section Parser (1 hour - CRITICAL)
- [ ] **TEST FIRST:** Write test for EACH of 31 section types
- [ ] **IMPLEMENT:** section-parser.ts with all 31 parsers
- [ ] **TEST (Unit):** Each section type parses correctly (31 tests)
- [ ] **TEST (Unit):** Each section validates required fields
- [ ] **TEST (Unit):** Click actions parse correctly
- [ ] **TEST (Unit):** Hover effects parse correctly
- [ ] **TEST (Unit):** Animations parse correctly
- [ ] **TEST (Integration):** Parse all sections from 18 example pages
- [ ] **TEST (Edge):** Unknown section type shows error
- [ ] **TEST (Edge):** Missing required field shows which field
- [ ] **VERIFY:** Run checklist - all 31 types tested
- [ ] **VERIFY:** All tests pass
- [ ] **DOCUMENT:** Section type validation rules

**31 Section Type Test Checklist:**
- [ ] hero
- [ ] text
- [ ] text_with_links
- [ ] image
- [ ] image_clickable
- [ ] video
- [ ] code_block
- [ ] quote
- [ ] divider
- [ ] embed
- [ ] feature_grid
- [ ] clickable_cards
- [ ] tabbed_content
- [ ] interactive_diagram
- [ ] list
- [ ] comparison_grid
- [ ] key_value_pairs
- [ ] steps
- [ ] timeline
- [ ] table
- [ ] expandable_section
- [ ] expandable_card
- [ ] accordion
- [ ] alert
- [ ] stats
- [ ] download
- [ ] gallery
- [ ] card_list
- [ ] progress
- [ ] tags
- [ ] loading

#### Task 2A.7: Navigation Builder (45 min)
- [ ] **TEST FIRST:** Write test for 5-level hierarchy
- [ ] **IMPLEMENT:** navigation-builder.ts
- [ ] **TEST (Unit):** Build hierarchy from parent fields
- [ ] **TEST (Unit):** Detect circular references
- [ ] **TEST (Unit):** Detect orphaned pages
- [ ] **TEST (Unit):** Generate breadcrumbs correctly
- [ ] **TEST (Unit):** Find siblings correctly
- [ ] **TEST (Integration):** Build complex-card hierarchy (5 levels!)
- [ ] **TEST (Edge):** Circular reference (A→B→A) throws error
- [ ] **TEST (Edge):** Orphaned page shows warning
- [ ] **TEST (Edge):** Duplicate page ID throws error
- [ ] **VERIFY:** Navigate to level 5, breadcrumbs show all 5 levels
- [ ] **VERIFY:** Page tree structure is correct
- [ ] **PROFILE:** Performance <50ms for 100-page hierarchy

**Phase 2A Deliverable:** Complete parser infrastructure

**Phase 2A Final Verification:**
- [ ] All unit tests pass (run `npm test -- parser`)
- [ ] All integration tests pass
- [ ] Parse simple-card successfully
- [ ] Parse medium-card successfully
- [ ] Parse complex-card successfully (5 levels!)
- [ ] All 18 example files parse
- [ ] All 31 section types parse
- [ ] Navigation hierarchy builds correctly
- [ ] Performance targets met
- [ ] Zero TypeScript errors
- [ ] Error messages are helpful
- [ ] Documentation complete

**DO NOT PROCEED TO PHASE 2B UNTIL ALL CHECKS ABOVE PASS**

---

### 🟢 Phase 2B: Core Rendering (1-2 hours)

**Priority: HIGH**

1. ✅ Create main renderer components (Card, Page, Section)
2. ✅ Implement 9 content display components
3. ✅ Implement 6 navigation/interactive components
4. ✅ Implement 6 data presentation components
5. ✅ Implement 3 expandable content components
6. ✅ Implement 7 special element components

**Deliverable:** All 31 section type components

**Test:** Render each section type individually

---

### 🟡 Phase 2C: Navigation System (1 hour)

**Priority: HIGH**

1. ✅ Create navigation components (Breadcrumbs, PageTree, TabBar, Buttons, Progress)
2. ✅ Implement NavigationProvider context
3. ✅ Build routing logic
4. ✅ Implement all 3 navigation types (hierarchical, tabs, linear)

**Deliverable:** Complete navigation system

**Test:** Navigate through 5-level hierarchy in complex-card

---

### 🟠 Phase 2D: Popups & Polish (30-45 min)

**Priority: MEDIUM**

1. ✅ Create popup renderer
2. ✅ Implement popup management
3. ✅ Add animations
4. ✅ Create custom hooks

**Deliverable:** Working popup system

**Test:** Test all popup sizes and actions

---

### 🔴 Phase 2E: Integration & Testing (30-45 min)

**Priority: HIGH**

1. ✅ Integrate parser + renderer
2. ✅ Test all 3 example cards
3. ✅ Test all section types
4. ✅ Test all click actions
5. ✅ Test all navigation patterns
6. ✅ Performance optimization

**Deliverable:** Fully integrated system

**Test:** End-to-end testing with all Phase 1 examples

---

## Testing Strategy

### Unit Tests (Parser)

**Test each parser function:**
- ✅ Card definition parser with valid/invalid YAML
- ✅ Page parser with all title variants
- ✅ Section parser for each of 31 types
- ✅ Navigation builder for hierarchy construction
- ✅ Breadcrumb generation
- ✅ Error handling for missing fields

**Files:** `*.test.ts` alongside parser files

---

### Component Tests (Renderer)

**Test each React component:**
- ✅ Rendering with valid props
- ✅ Click action handling
- ✅ Hover effects
- ✅ Expandable state management
- ✅ Animation triggers
- ✅ Accessibility (ARIA labels, keyboard navigation)

**Files:** `*.test.tsx` alongside component files

---

### Integration Tests

**Test complete flows:**
- ✅ Load card → parse → render
- ✅ Navigate page hierarchy
- ✅ Click feature grid → navigate to sub-page
- ✅ Click image → show popup
- ✅ Expand accordion → collapse
- ✅ Navigate breadcrumbs
- ✅ Use back button
- ✅ Linear navigation (next/previous)

**Files:** `integration.test.tsx`

---

### Example Card Validation

**Test with Phase 1 examples:**

1. **Simple Card**
   - ✅ 2-level hierarchy
   - ✅ Basic sections (hero, text, feature grid)
   - ✅ Agenda navigation

2. **Medium Card**
   - ✅ 3-level hierarchy
   - ✅ Popups
   - ✅ Interactive diagrams
   - ✅ Expandable sections

3. **Complex Card**
   - ✅ 5-level deep hierarchy
   - ✅ Library page reuse
   - ✅ Complete navigation (breadcrumbs, page tree, buttons)
   - ✅ Advanced animations

---

## Success Criteria

### ✅ Parser Success Criteria

- [ ] Parse all 31 section types without errors
- [ ] Handle all metadata fields (required and optional)
- [ ] Support all 3 navigation types
- [ ] Build correct page hierarchy from `parent` fields
- [ ] Generate accurate breadcrumbs
- [ ] Load library pages correctly
- [ ] Cache parsed files for performance
- [ ] Provide detailed error messages for invalid YAML

---

### ✅ Renderer Success Criteria

- [ ] Render all 31 section types correctly
- [ ] Support all click actions (navigate, popup, external)
- [ ] Display all hover effects
- [ ] Animate expandable content
- [ ] Show/hide popups correctly
- [ ] Navigate hierarchical structure
- [ ] Display tabs correctly
- [ ] Show linear progress indicators
- [ ] Render breadcrumbs
- [ ] Display page tree with highlighting
- [ ] Handle navigation buttons (back, next, previous, agenda)

---

### ✅ Integration Success Criteria

- [ ] Load and render simple-card example
- [ ] Load and render medium-card example
- [ ] Load and render complex-card example (5 levels!)
- [ ] Navigate from agenda to level 5 page
- [ ] Breadcrumbs show correct path at all levels
- [ ] Page tree highlights current page
- [ ] All click actions work
- [ ] All popups open/close correctly
- [ ] Library page reuse works
- [ ] No console errors or warnings

---

### ✅ Performance Criteria

- [ ] Parse card definition in <100ms
- [ ] Render page in <200ms
- [ ] Page navigation feels instant (<50ms)
- [ ] Animations are smooth (60fps)
- [ ] No memory leaks on navigation
- [ ] File caching works (no re-parsing)

---

### ✅ Accessibility Criteria

- [ ] All interactive elements are keyboard accessible
- [ ] Screen reader announces page changes
- [ ] Proper ARIA labels on all components
- [ ] Focus management on popups
- [ ] Color contrast meets WCAG AA
- [ ] Alt text on all images

---

## Checklist: Complete Feature Coverage

### Section Types (31)

- [ ] hero
- [ ] text
- [ ] text_with_links
- [ ] image
- [ ] image_clickable
- [ ] video
- [ ] code_block
- [ ] quote
- [ ] divider
- [ ] embed
- [ ] feature_grid
- [ ] clickable_cards
- [ ] tabbed_content
- [ ] interactive_diagram
- [ ] list
- [ ] comparison_grid
- [ ] key_value_pairs
- [ ] steps
- [ ] timeline
- [ ] table
- [ ] expandable_section
- [ ] expandable_card
- [ ] accordion
- [ ] alert
- [ ] stats
- [ ] download
- [ ] gallery
- [ ] card_list
- [ ] progress
- [ ] tags
- [ ] loading

### Click Actions (3)

- [ ] navigate_to_subpage
- [ ] show_popup
- [ ] external_link

### Navigation Types (3)

- [ ] Hierarchical (breadcrumbs + page tree)
- [ ] Tabs (horizontal tab bar)
- [ ] Linear (next/previous + progress)

### Navigation Components (5)

- [ ] Breadcrumbs
- [ ] Page Tree
- [ ] Tab Bar
- [ ] Navigation Buttons (Back, Next, Previous, Agenda)
- [ ] Progress Indicator (steps/bar/dots)

### Animations

- [ ] Entry animations (8 types)
- [ ] Hover effects (5 types)
- [ ] Expandable animations (4 types)
- [ ] Page transitions (4 types)
- [ ] Loading animations (4 types)

### Popups

- [ ] 4 sizes (small, medium, large, full-screen)
- [ ] Entry animations
- [ ] Section rendering in popups
- [ ] Action buttons
- [ ] Close handlers (click, escape, overlay)

### Metadata Support

- [ ] Card metadata (all fields)
- [ ] Page metadata (all fields)
- [ ] Multi-context titles (4 variants)
- [ ] Descriptions (short, long)
- [ ] Parent-child relationships
- [ ] Sibling relationships

---

## Risk Mitigation (MANDATORY IMPLEMENTATION)

### High-Risk Areas with MANDATORY Mitigations

#### 1. Complex Section Parser
- **Risk:** Missing edge cases in 31 section types
- **Impact:** CRITICAL - Broken sections = broken cards
- **Mitigation Actions (MANDATORY):**
  - [ ] Create unit test for EACH of 31 section types
  - [ ] Test with valid data
  - [ ] Test with missing required fields
  - [ ] Test with invalid data types
  - [ ] Test with edge cases (empty strings, null, undefined)
  - [ ] Validate against ALL Phase 1 examples (18 files)
  - [ ] Create section type checklist (verify all 31 parsed)
  - [ ] Add detailed error messages for each failure case
  - [ ] Implement schema validation using Zod or Yup
  - [ ] Test with malformed YAML
  - [ ] Test with extra unknown fields
- **Verification:** Run `npm test -- section-parser` - 100% pass required

#### 2. Navigation Hierarchy Builder
- **Risk:** Incorrect parent-child relationships, circular references, orphaned pages
- **Impact:** CRITICAL - Broken navigation = unusable system
- **Mitigation Actions (MANDATORY):**
  - [ ] Implement circular reference detection algorithm
  - [ ] Test with valid 5-level hierarchy (complex-card)
  - [ ] Test with circular reference (A → B → A)
  - [ ] Test with orphaned pages (page with non-existent parent)
  - [ ] Test with missing parent field
  - [ ] Test with duplicate page IDs
  - [ ] Verify breadcrumb generation at each level
  - [ ] Verify page tree structure accuracy
  - [ ] Add hierarchy validation before rendering
  - [ ] Implement detailed logging for hierarchy build
  - [ ] Create visual hierarchy debugger
- **Verification:** Navigate complex-card to level 5, verify breadcrumbs show 5 levels

#### 3. Performance with Deep Hierarchies
- **Risk:** Slow rendering with 5-level hierarchies, memory leaks
- **Impact:** HIGH - Poor UX, browser crashes
- **Mitigation Actions (MANDATORY):**
  - [ ] Implement React.memo for all section components
  - [ ] Use useMemo for expensive calculations
  - [ ] Use useCallback for event handlers
  - [ ] Implement virtual scrolling for page tree (if >50 pages)
  - [ ] Lazy load sub-pages (don't parse until needed)
  - [ ] Implement file caching (parse once, cache result)
  - [ ] Profile with React DevTools Profiler
  - [ ] Test with 100+ page hierarchy (stress test)
  - [ ] Monitor memory usage in DevTools
  - [ ] Implement cleanup in useEffect hooks
  - [ ] Test rapid navigation (click 20 times fast)
- **Performance Targets (MANDATORY):**
  - [ ] Parse card: <100ms
  - [ ] Render page: <200ms
  - [ ] Navigation: <50ms
  - [ ] No memory increase after 100 navigations
- **Verification:** Run performance benchmarks, all must pass

#### 4. File Loading in Browser
- **Risk:** Cannot use Node.js `fs`, CORS issues, file not found
- **Impact:** CRITICAL - Cannot load templates = system broken
- **Mitigation Actions (MANDATORY):**
  - [ ] Use fetch() API exclusively
  - [ ] Serve MD files from `/public/content/` or configure Vite
  - [ ] Implement proper CORS headers (if needed)
  - [ ] Add retry logic (3 attempts with exponential backoff)
  - [ ] Implement cache with TTL (15 min)
  - [ ] Add cache.clear() for development
  - [ ] Test with all 18 example files
  - [ ] Test with library page references
  - [ ] Test with missing files (404 error handling)
  - [ ] Test with network offline
  - [ ] Add loading states
  - [ ] Add error boundaries
- **Verification:** Load all 18 example files successfully

#### 5. Markdown Rendering Security
- **Risk:** XSS vulnerabilities in user-provided MD content
- **Impact:** CRITICAL - Security breach
- **Mitigation Actions (MANDATORY):**
  - [ ] Use `react-markdown` library (battle-tested)
  - [ ] Enable XSS protection (built-in)
  - [ ] Sanitize HTML with `rehype-sanitize`
  - [ ] Disable raw HTML by default
  - [ ] Test with malicious input (`<script>alert('XSS')</script>`)
  - [ ] Test with `javascript:` URLs
  - [ ] Test with `data:` URLs
  - [ ] Test with event handlers (onclick, onerror)
  - [ ] Review security audit checklist
  - [ ] Add Content Security Policy headers
- **Verification:** Attempt XSS attacks, all must be blocked

#### 6. Type Safety
- **Risk:** Runtime type errors from incorrect YAML parsing
- **Impact:** HIGH - Crashes, broken features
- **Mitigation Actions (MANDATORY):**
  - [ ] Use TypeScript strict mode
  - [ ] Implement runtime validation (Zod schemas)
  - [ ] Add type guards for all union types
  - [ ] Test type narrowing works correctly
  - [ ] Add TSDoc comments for all types
  - [ ] Use discriminated unions for sections
  - [ ] Verify no `any` types in production code
  - [ ] Run `tsc --noEmit` with zero errors
- **Verification:** `npm run type-check` - zero errors

#### 7. Error Handling & User Feedback
- **Risk:** Silent failures, cryptic errors
- **Impact:** HIGH - Users confused, difficult debugging
- **Mitigation Actions (MANDATORY):**
  - [ ] Implement error boundaries at each level
  - [ ] Add detailed error messages (not just "Parse error")
  - [ ] Include file path, line number in errors
  - [ ] Show which field is missing/invalid
  - [ ] Add suggestion for fix in error message
  - [ ] Implement graceful degradation (show what works)
  - [ ] Add error logging to console
  - [ ] Test error scenarios deliberately
  - [ ] Create error documentation
  - [ ] Add "Report Issue" button on errors
- **Verification:** Trigger each error type, verify message is helpful

#### 8. Accessibility
- **Risk:** Not keyboard accessible, not screen reader friendly
- **Impact:** MEDIUM - Excludes users with disabilities
- **Mitigation Actions (MANDATORY):**
  - [ ] Add ARIA labels to all interactive elements
  - [ ] Ensure tab order is logical
  - [ ] Add keyboard shortcuts (documented)
  - [ ] Test with screen reader (NVDA/JAWS)
  - [ ] Verify color contrast (WCAG AA)
  - [ ] Add skip links
  - [ ] Ensure focus visible
  - [ ] Test keyboard-only navigation
  - [ ] Add alt text to all images
  - [ ] Use semantic HTML
- **Verification:** Complete WCAG 2.1 Level AA audit

---

## Next Steps After Phase 2

**Phase 3: Migration & Testing** (Session 3)
- Convert existing observability card to new system
- Full user acceptance testing
- Documentation refinement
- Performance optimization
- Production deployment

---

## File Tracking Checklist

### Parser Files (8)

- [ ] `template-parser/index.ts`
- [ ] `template-parser/card-parser.ts`
- [ ] `template-parser/page-parser.ts`
- [ ] `template-parser/section-parser.ts`
- [ ] `template-parser/popup-parser.ts`
- [ ] `template-parser/navigation-builder.ts`
- [ ] `template-parser/file-loader.ts`
- [ ] `template-parser/yaml-utils.ts`

### Type Files (7)

- [ ] `template-types/index.ts`
- [ ] `template-types/card.types.ts`
- [ ] `template-types/page.types.ts`
- [ ] `template-types/section.types.ts`
- [ ] `template-types/navigation.types.ts`
- [ ] `template-types/metadata.types.ts`
- [ ] `template-types/animation.types.ts`
- [ ] `template-types/popup.types.ts`

### Renderer Files (5)

- [ ] `template-renderer/index.tsx`
- [ ] `template-renderer/CardRenderer.tsx`
- [ ] `template-renderer/AgendaRenderer.tsx`
- [ ] `template-renderer/PageRenderer.tsx`
- [ ] `template-renderer/SectionRenderer.tsx`
- [ ] `template-renderer/PopupRenderer.tsx`

### Section Components (31)

**Content (9):**
- [ ] `template-sections/content/HeroSection.tsx`
- [ ] `template-sections/content/TextSection.tsx`
- [ ] `template-sections/content/TextWithLinksSection.tsx`
- [ ] `template-sections/content/ImageSection.tsx`
- [ ] `template-sections/content/VideoSection.tsx`
- [ ] `template-sections/content/CodeBlockSection.tsx`
- [ ] `template-sections/content/QuoteSection.tsx`
- [ ] `template-sections/content/DividerSection.tsx`
- [ ] `template-sections/content/EmbedSection.tsx`

**Navigation (6):**
- [ ] `template-sections/navigation/ImageClickableSection.tsx`
- [ ] `template-sections/navigation/FeatureGridSection.tsx`
- [ ] `template-sections/navigation/ClickableCardsSection.tsx`
- [ ] `template-sections/navigation/TabbedContentSection.tsx`
- [ ] `template-sections/navigation/InteractiveDiagramSection.tsx`
- [ ] `template-sections/navigation/TextWithNavigationSection.tsx`

**Data (6):**
- [ ] `template-sections/data/ListSection.tsx`
- [ ] `template-sections/data/ComparisonGridSection.tsx`
- [ ] `template-sections/data/KeyValuePairsSection.tsx`
- [ ] `template-sections/data/StepsSection.tsx`
- [ ] `template-sections/data/TimelineSection.tsx`
- [ ] `template-sections/data/TableSection.tsx`

**Expandable (3):**
- [ ] `template-sections/expandable/ExpandableSectionComponent.tsx`
- [ ] `template-sections/expandable/ExpandableCardComponent.tsx`
- [ ] `template-sections/expandable/AccordionSection.tsx`

**Special (7):**
- [ ] `template-sections/special/AlertSection.tsx`
- [ ] `template-sections/special/StatsSection.tsx`
- [ ] `template-sections/special/DownloadSection.tsx`
- [ ] `template-sections/special/GallerySection.tsx`
- [ ] `template-sections/special/CardListSection.tsx`
- [ ] `template-sections/special/ProgressSection.tsx`
- [ ] `template-sections/special/TagsSection.tsx`

### Navigation Components (6)

- [ ] `template-navigation/NavigationProvider.tsx`
- [ ] `template-navigation/Breadcrumbs.tsx`
- [ ] `template-navigation/PageTree.tsx`
- [ ] `template-navigation/TabBar.tsx`
- [ ] `template-navigation/NavigationButtons.tsx`
- [ ] `template-navigation/ProgressIndicator.tsx`

### Hooks (4)

- [ ] `hooks/useTemplateParser.ts`
- [ ] `hooks/useNavigation.ts`
- [ ] `hooks/usePopup.ts`
- [ ] `hooks/useClickAction.ts`

**Total Files to Create:** ~70 files

---

## Summary

Phase 2 transforms the **static MD templates** from Phase 1 into a **live, interactive React application**.

**Key Achievements:**
- ✅ Parse 31 section types
- ✅ Build hierarchical navigation (up to 5 levels)
- ✅ Render all interactive elements
- ✅ Support 3 navigation patterns
- ✅ Implement popup system
- ✅ Enable hot-reload
- ✅ Complete integration testing

**Estimated Effort:** 4-6 hours

**Next Phase:** Migration of existing observability card + production deployment

---

**END OF PHASE 2 PLAN**

**Status:** READY FOR IMPLEMENTATION ✅

**Date Created:** December 17, 2024
**Last Updated:** December 17, 2024
