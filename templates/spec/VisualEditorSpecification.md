# Visual Card Editor Specification

**Version:** 2.0
**Target Audience:** Non-technical content creators (Product Managers, Technical Writers)
**Goal:** Enable users to create and manage cards through a WYSIWYG interface with zero YAML knowledge
**Last Updated:** January 3, 2026

---

## Table of Contents

1. [Overview & Core Philosophy](#1-overview--core-philosophy)
2. [System Architecture](#2-system-architecture)
3. [User Workflows](#3-user-workflows)
4. [UI Component Specifications](#4-ui-component-specifications)
5. [Integration with Existing System](#5-integration-with-existing-system)
6. [Quality Standards & Requirements](#6-quality-standards--requirements)
7. [Technical Constraints](#7-technical-constraints)
8. [Success Criteria](#8-success-criteria)

---

## 1. Overview & Core Philosophy

### 1.1 Purpose

The Visual Editor enables non-technical users to create, edit, and manage documentation cards without writing YAML or understanding the underlying template system. It bridges the gap between the powerful 31-section template system and users who need an intuitive, visual interface.

### 1.2 Core Principles

**No Code Experience Required**
- Users interact exclusively with forms, dropdowns, and visual builders
- YAML is generated automatically in the background
- All technical concepts are abstracted into user-friendly terms

**Instant Visual Feedback**
- Live preview shows exactly how content will appear
- Changes reflect immediately (< 100ms)
- What-you-see-is-what-you-get (WYSIWYG) approach

**Guided & Discoverable**
- Wizards guide users through complex tasks
- Contextual help and tooltips explain each option
- Section gallery helps discover available content types

**Safe & Reversible**
- Auto-save with clear save status indicators
- Undo/Redo for all operations (minimum 50 steps)
- Validation prevents invalid states
- Dirty checking warns before navigation

### 1.3 Key Features

1. **Card Configuration** - Visual form for card metadata (name, icon, theme, category)
2. **Agenda Builder** - Drag-and-drop interface for landing page items
3. **Page Editor** - Block-based content editor (similar to Notion)
4. **Section Gallery** - Visual catalog of all 31 section types with examples
5. **Media Manager** - Unified interface for uploading and managing images
6. **Live Preview** - Real-time rendering using existing SectionRenderer
7. **File Management** - Create, edit, duplicate, delete cards and pages
8. **Validation** - Real-time validation with helpful error messages

### 1.4 User Personas

**Primary: Technical Writer (Sarah)**
- Creates documentation cards weekly
- Comfortable with structured forms
- Needs rich formatting and media
- Values speed and consistency

**Secondary: Product Manager (Marcus)**
- Creates cards occasionally
- Limited technical knowledge
- Needs templates and examples
- Values simplicity and guidance

**Tertiary: Developer (Alex)**
- Creates cards rarely
- Could write YAML but prefers visual tools for speed
- Values keyboard shortcuts and efficiency
- Appreciates both visual and code views

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Visual Editor Layer                       │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Editor    │  │   Section    │  │   Media          │   │
│  │   Context   │  │   Gallery    │  │   Manager        │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓ (YAML Generation)
┌─────────────────────────────────────────────────────────────┐
│                   Transformation Layer                       │
│  ┌──────────────────┐         ┌───────────────────────┐    │
│  │  State → JSON    │   ↔     │  JSON → YAML          │    │
│  └──────────────────┘         └───────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓ (File I/O)
┌─────────────────────────────────────────────────────────────┐
│                    File System Layer                         │
│                  content/pages/cards/*/*.md                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓ (Parsing)
┌─────────────────────────────────────────────────────────────┐
│              Existing Template System (Read-Only)            │
│  Parser → Types → Navigation → Renderer → React Components  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 State Management Architecture

**EditorContext (React Context + useReducer)**

```typescript
interface EditorState {
  // Current editing mode
  mode: 'card' | 'agenda' | 'page';

  // Data being edited
  cardData: CardDefinition | null;
  agendaData: AgendaDefinition | null;
  pagesMap: Map<string, PageDefinition>;
  popupsMap: Map<string, PopupDefinition>;

  // Active selections
  activePageId: string | null;
  activeSectionIndex: number | null;

  // Metadata
  isDirty: boolean;
  lastSaved: Date | null;
  autoSaveEnabled: boolean;

  // History for undo/redo
  history: EditorStateSnapshot[];
  historyIndex: number;
  maxHistoryLength: 50;

  // UI state
  previewMode: 'desktop' | 'tablet' | 'mobile';
  showSectionGallery: boolean;
  showMediaManager: boolean;

  // Validation
  validationErrors: ValidationError[];
  validationWarnings: ValidationWarning[];
}

interface EditorActions {
  // Card operations
  setCardData: (data: Partial<CardDefinition>) => void;
  createNewCard: (template?: string) => void;
  loadCard: (cardId: string) => Promise<void>;
  saveCard: () => Promise<void>;

  // Agenda operations
  setAgendaData: (data: Partial<AgendaDefinition>) => void;
  addAgendaItem: (item: AgendaItem) => void;
  removeAgendaItem: (itemId: string) => void;
  reorderAgendaItems: (fromIndex: number, toIndex: number) => void;

  // Page operations
  createPage: (parentId?: string) => void;
  deletePage: (pageId: string) => void;
  updatePage: (pageId: string, data: Partial<PageDefinition>) => void;
  setActivePage: (pageId: string) => void;

  // Section operations
  addSection: (type: SectionType, index?: number) => void;
  updateSection: (index: number, data: Partial<Section>) => void;
  deleteSection: (index: number) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  duplicateSection: (index: number) => void;

  // History operations
  undo: () => void;
  redo: () => void;
  createSnapshot: () => void;

  // Validation
  validate: () => ValidationResult;
  clearValidation: () => void;

  // UI operations
  setPreviewMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  toggleSectionGallery: () => void;
  toggleMediaManager: () => void;
}
```

### 2.3 Data Flow

**Creation Flow:**
```
User Input (Form)
  → EditorContext State Update
    → Debounced Validation (300ms)
      → Live Preview Update (<100ms)
        → Auto-save Trigger (5s debounce)
          → State → JSON → YAML
            → File System Write
              → Success Notification
```

**Loading Flow:**
```
User Selects Card
  → Fetch .md files
    → Parse YAML (existing parser)
      → JSON → EditorState
        → Hydrate Forms
          → Render Preview
```

### 2.4 Component Hierarchy

```
EditorRoot
├── EditorProvider (Context)
├── EditorLayout
│   ├── EditorHeader
│   │   ├── CardSelector
│   │   ├── ViewModeSwitch (Edit | Preview)
│   │   ├── PreviewModeSelector (Desktop | Tablet | Mobile)
│   │   ├── SaveStatusIndicator
│   │   └── ActionButtons (Save, Publish, Export)
│   │
│   ├── EditorSidebar
│   │   ├── StageNavigator (Card | Agenda | Pages)
│   │   ├── PageTreeEditor (drag-and-drop hierarchy)
│   │   └── QuickActions
│   │
│   ├── EditorMainArea
│   │   ├── CardConfigForm (when mode='card')
│   │   ├── AgendaBuilder (when mode='agenda')
│   │   └── PageContentEditor (when mode='page')
│   │       ├── PageHeader (title, subtitle, metadata)
│   │       ├── SectionList (drag-and-drop)
│   │       │   ├── SectionEditorCard (per section)
│   │       │   │   ├── SectionTypeSelector
│   │       │   │   ├── SectionFields (dynamic per type)
│   │       │   │   └── SectionActions (move, duplicate, delete)
│   │       │   └── AddSectionButton
│   │       └── SubPagesManager
│   │
│   └── EditorPreviewPane (split or full-screen)
│       ├── PreviewHeader (device frame)
│       └── LivePreview (uses existing CardRenderer)
│
├── SectionGalleryModal
│   ├── CategoryFilter
│   ├── SearchBar
│   └── SectionGrid (31 types)
│       └── SectionCard
│           ├── Preview
│           ├── Description
│           ├── UseCase
│           └── InsertButton
│
└── MediaManagerModal
    ├── MediaLibrary (grid of existing images)
    ├── UploadZone (drag-and-drop)
    ├── ImageEditor (crop, resize, alt-text)
    └── MediaActions (select, delete, copy-url)
```

---

## 3. User Workflows

### 3.1 Workflow 1: Create New Card from Scratch

**User Story:** As Sarah (Technical Writer), I want to create a new security documentation card with 3 pages.

**Steps:**

1. **Initiate Creation**
   - Click "New Card" button
   - Select template: "Blank Card" or use a starter template
   - System creates empty EditorState

2. **Configure Card (Phase 1)**
   - Fill form: Name, Category, Color Theme, Icon, Description
   - See live preview update in sidebar card preview
   - Validation: unique ID auto-generated from name
   - **Save Point 1** (auto-save or manual)

3. **Build Agenda (Phase 2)**
   - Choose layout: Grid (3 columns selected)
   - Click "Add Item" → opens drawer
   - Fill: Title, Description, Icon, Target (create new page)
   - Repeat for 3 items
   - Drag to reorder
   - **Save Point 2**

4. **Create Pages (Phase 3)**
   - System auto-created 3 blank pages from agenda
   - Select page 1 from tree
   - Add sections:
     - Click "+ Add Section"
     - Section Gallery opens
     - Browse "Content" category
     - Click "Hero" → inserted at cursor
     - Fill: Heading, Subtitle
     - Click "+ Add Section"
     - Select "Feature Grid"
     - Fill: 3 features with icons
   - **Save Point 3**

5. **Add Media**
   - In Feature Grid, click icon picker → opens Media Manager
   - Upload new diagram
   - Crop to 16:9
   - Add alt text
   - Select → icon inserted

6. **Preview & Publish**
   - Toggle to Preview mode
   - Test navigation (agenda → pages)
   - Test responsive (Desktop → Mobile)
   - Click "Publish"
   - System validates, generates YAML, writes files
   - Success notification with link to live card

**Time Estimate:** 15-20 minutes
**Success Metric:** Card created without viewing any YAML

### 3.2 Workflow 2: Edit Existing Card

**User Story:** As Marcus (PM), I need to add a new page to the Observability card.

**Steps:**

1. Open card selector → choose "Observability"
2. System loads existing card (6 pages)
3. Click "Pages" in sidebar
4. Right-click "Stack" page → "Add Subpage"
5. Fill page form: Title, Icon, Description
6. Add sections: Hero, Text, Code Block
7. In agenda mode, add new navigation item pointing to new page
8. Save → System updates YAML files
9. Preview to verify

**Time Estimate:** 5-10 minutes

### 3.3 Workflow 3: Duplicate & Customize Section

**User Story:** As Alex (Developer), I want to reuse an expandable section pattern from another page.

**Steps:**

1. Navigate to source page
2. Hover over Expandable Card section
3. Click "Duplicate" button
4. Section copied with "(Copy)" suffix
5. Edit fields inline
6. Drag to new position
7. Auto-saved

**Time Estimate:** 1-2 minutes

---

## 4. UI Component Specifications

### 4.1 Global Navigation Bar

**Component:** `EditorHeader`

**Layout:** Fixed top bar, full width, dark background

**Elements:**

| Element | Type | Behavior | Accessibility |
|---------|------|----------|---------------|
| Card Selector | Dropdown | Opens modal with card list, search, recent | `aria-label="Select card to edit"` |
| View Mode Switch | Toggle (2 buttons) | "Edit" / "Preview" modes | `role="radiogroup"`, keyboard: left/right arrows |
| Preview Device | Button Group | Desktop / Tablet / Mobile icons | `aria-label="Select preview device"` |
| Save Status | Indicator | "Saved" (green), "Saving..." (blue), "Unsaved" (orange), "Error" (red) | `aria-live="polite"` |
| Save Button | Primary Button | Manually trigger save | Disabled when saved, kbd: Ctrl+S |
| Publish Button | Secondary Button | Validate + Save + Notify | `aria-label="Validate and publish card"` |
| Undo/Redo | Icon Buttons | Disabled when no history | kbd: Ctrl+Z, Ctrl+Shift+Z |

**Responsive Behavior:**
- < 768px: Collapse to hamburger menu
- Prioritize Save Status and Save Button on mobile

### 4.2 Card Settings Dashboard (Phase 1)

**Component:** `CardConfigForm`

**Layout:** Scrollable form, max-width 800px, centered

**Field Specifications:**

| Field | UI Component | Validation | Default | Accessibility |
|-------|--------------|------------|---------|---------------|
| **Card Name** | Text Input (large) | Required, 3-100 chars, `^[\w\s-]+$` | "Untitled Card" | `aria-required="true"`, `aria-describedby="name-hint"` |
| **Unique ID** | Text Input (read-only) | Auto-generated from name, lowercase+hyphens | `[slug-from-name]` | `aria-readonly="true"`, `aria-describedby="id-hint"` (hint: "Auto-generated from name") |
| **Category** | Combobox (searchable) | One of 7 standard or custom | "technical" | `aria-autocomplete="list"` |
| **Theme Color** | Color Swatch Grid | One of 10 predefined | "blue" | `role="radiogroup"`, each swatch: `aria-label="Blue theme"` |
| **Icon** | Icon Picker Button | Opens modal with 1000+ Lucide icons, searchable | "FileText" | `aria-haspopup="dialog"` |
| **Short Description** | Text Input | Max 120 chars, counter shown | "" | `aria-describedby="short-desc-counter"` |
| **Long Description** | Textarea | Max 500 chars, markdown hint | "" | `aria-describedby="long-desc-hint"` (hint: "Markdown supported") |
| **Navigation Type** | Segmented Control | hierarchical / tabs / linear | "hierarchical" | `role="radiogroup"` |
| **Default Animation** | Dropdown | fade-in / slide-in / scale-in / none | "fade-in" | Options described: "Fade in smoothly" |
| **Metadata (collapsible)** | Section | Author, version, tags, difficulty, time | (optional) | `aria-expanded="false"` |

**Validation Display:**
- Inline errors below fields (red text, error icon)
- Summary at top if > 3 errors
- Prevent save if critical errors exist

**Example Inline Error:**
```
Card Name: [             ]
         ⚠ Name must be at least 3 characters
```

### 4.3 Agenda Builder (Phase 2)

**Component:** `AgendaBuilder`

**Layout:** Two-column (desktop) or stacked (mobile)

**Left Panel: Layout Selector**
- Visual cards showing Grid / List / Carousel
- Selected state with blue border
- Click to change layout

**Right Panel: Items List**
- Drag handle (6 dots) on left
- Item preview card
- Edit / Delete actions on hover
- "+ Add Item" button at bottom

**Item Editor Drawer (slides from right):**

| Field | UI Component | Validation | Accessibility |
|-------|--------------|------------|---------------|
| Title | Text Input | Required, 3-50 chars | `aria-required="true"` |
| Description | Textarea | Max 200 chars | Character counter |
| Icon | Icon Picker | Same as card icon picker | `aria-haspopup="dialog"` |
| Target Type | Radio Buttons | Page / External Link | `role="radiogroup"` |
| Target Page (if Page) | Dropdown | Shows all pages, "Create New" option | `aria-haspopup="listbox"` |
| Target URL (if External) | URL Input | Validates URL format | `type="url"` |
| Image (optional) | Image Picker | Opens Media Manager | `aria-label="Select preview image"` |

**Drag-and-Drop:**
- Visual feedback: item lifts with shadow
- Drop indicator: blue line between items
- Keyboard alternative: Move Up / Move Down buttons
- Accessibility: `aria-grabbed="true"` during drag

### 4.4 Page Content Editor (Phase 3)

**Component:** `PageContentEditor`

**Layout:**
- Header: Page title/subtitle inline edit
- Section List: Vertical stack with gaps
- Add Section: Button between sections or at end

#### 4.4.1 Page Header

| Field | UI Component | Behavior |
|-------|--------------|----------|
| Page Header Title | Inline Text Input | Large font, auto-saves on blur |
| Menu Title | Inline Text Input | Smaller font, below header |
| Breadcrumb Title | Inline Text Input | Chip style |
| Description | Expandable Textarea | Click to expand |
| Icon | Icon Button | Opens icon picker |
| Parent Page | Dropdown | Changes hierarchy |

#### 4.4.2 Section List

Each section rendered as `SectionEditorCard`:

**Card Structure:**
```
┌─────────────────────────────────────────────────┐
│ ≡ [Section Type Dropdown ▾]  [Actions ⋮]       │
├─────────────────────────────────────────────────┤
│                                                 │
│   [Dynamic Fields based on Section Type]       │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Card Actions (⋮ menu):**
- Move Up / Move Down
- Duplicate
- Delete (with confirmation)
- Convert Type (experimental)

**Section Type Dropdown:**
- Grouped by category (Content, Navigation, Data, etc.)
- Search filter
- Changing type shows confirmation: "This will reset all fields. Continue?"

#### 4.4.3 Add Section Mechanism

**Trigger Options:**
1. "+ Add Section" button between existing sections
2. Slash command: Type `/` in empty state → command palette
3. Keyboard: Ctrl+Enter → inserts below current

**Section Gallery Modal:**
- 5 category tabs: Content | Navigation | Data | Expandable | Special
- Grid of section cards (3 columns)
- Each card:
  - Name
  - Icon
  - Description
  - "Best for: [use case]"
  - Screenshot preview (thumbnail)
  - "Insert" button

**Search & Filter:**
- Search bar at top: filters by name, description, use case
- Category filter: tabs
- Sort: Alphabetical / Most Used

---

## 5. Integration with Existing System

### 5.1 Leverage Existing Components

**Do NOT Rebuild:**
- SectionRenderer → use for live preview
- All 31 Section components → render preview
- TemplateParser → read existing cards
- NavigationProvider → preview navigation
- useClickAction, usePopup → preview interactions

**Bridge Pattern:**
```typescript
// Editor creates state
const editorState: EditorState = {...};

// Transform to template system format
const cardDefinition: CardDefinition = editorStateToCardDefinition(editorState);

// Use existing renderer for preview
<CardRenderer cardData={cardDefinition} />
```

### 5.2 File System Integration

**Read Operations:**
- Use existing `file-loader.ts` and parsers
- Load cards from `content/pages/cards/*/card-definition.md`

**Write Operations (NEW):**
- Create `file-writer.ts` module
- Functions:
  - `writeCardDefinition(cardId, data): Promise<void>`
  - `writeAgenda(cardId, data): Promise<void>`
  - `writePage(cardId, pageId, data): Promise<void>`
  - `createCardDirectory(cardId): Promise<void>`

**File Structure Maintained:**
```
content/pages/cards/[card-id]/
  ├── card-definition.md
  ├── agenda.md
  └── pages/
      ├── page-1.md
      └── page-2.md
```

### 5.3 Validation Strategy

**Leverage Existing Types:**
- Import all types from `lib/template-types`
- Use TypeScript for compile-time validation
- Runtime validation with Zod schemas (derive from TS types)

**Validation Layers:**
1. **Field-level:** As user types (e.g., URL format)
2. **Section-level:** Before save (e.g., required fields)
3. **Card-level:** Before publish (e.g., all pages have valid targets)

**Error Hierarchy:**
- **Critical:** Blocks save (missing required field)
- **Warning:** Allows save but warns (no description)
- **Info:** Suggestions (consider adding image)

---

## 6. Quality Standards & Requirements

### 6.1 Test-Driven Development (TDD)

**Mandatory Test Coverage:**

1. **Unit Tests (Vitest)** - BEFORE implementation
   - Every form component
   - Every editor component
   - Every transformation function (state ↔ YAML)
   - Validation logic
   - **Target:** > 90% coverage

2. **Integration Tests**
   - Complete workflows (create card, edit agenda, add section)
   - State management (undo/redo)
   - Auto-save behavior
   - **Target:** All critical paths covered

3. **End-to-End Tests (Playwright)**
   - Full card creation flow
   - Load existing card, edit, save
   - Section gallery usage
   - Media upload
   - **Target:** 3 complete user journeys

4. **Accessibility Tests (axe-core)**
   - All forms WCAG 2.1 AA compliant
   - Keyboard navigation works
   - Screen reader compatible
   - **Target:** Zero violations

**Test Specification Template:**
```typescript
// Example: CardConfigForm.test.tsx
describe('CardConfigForm', () => {
  describe('Card Name Field', () => {
    it('should render with accessible label', () => { /* ... */ });
    it('should validate minimum length (3 chars)', () => { /* ... */ });
    it('should show inline error for invalid input', () => { /* ... */ });
    it('should auto-generate ID from name', () => { /* ... */ });
    it('should support keyboard navigation', () => { /* ... */ });
  });

  describe('Icon Picker', () => {
    it('should open modal when clicked', () => { /* ... */ });
    it('should filter icons by search term', () => { /* ... */ });
    it('should update preview when icon selected', () => { /* ... */ });
    it('should close modal on selection', () => { /* ... */ });
  });

  // ... 50+ tests for complete coverage
});
```

### 6.2 Accessibility Requirements (WCAG 2.1 AA)

**Keyboard Navigation:**
- Tab through all interactive elements in logical order
- Enter/Space to activate buttons
- Escape to close modals
- Arrow keys for dropdowns and grids
- Ctrl+Z / Ctrl+Shift+Z for undo/redo
- Ctrl+S to save

**Screen Reader Support:**
- All form fields have labels (visible or `aria-label`)
- Required fields marked with `aria-required="true"`
- Error messages associated via `aria-describedby`
- Live regions for status updates (`aria-live="polite"`)
- Modal focus management (trap focus, restore on close)

**Visual Requirements:**
- Minimum contrast ratio: 4.5:1 for text, 3:1 for UI components
- Focus indicators visible (2px outline, high contrast)
- No reliance on color alone (use icons + text)
- Text resizable to 200% without loss of functionality

**Testing:**
```bash
# Run axe-core on every editor component
npm run test:a11y

# Manual tests
- Navigate with keyboard only
- Test with screen reader (NVDA, JAWS)
- Test with 200% zoom
- Test in high contrast mode
```

### 6.3 Performance Requirements

**Benchmarks:**

| Operation | Target | Critical |
|-----------|--------|----------|
| Initial Editor Load | < 500ms | < 1000ms |
| Switch between Card/Agenda/Page | < 100ms | < 200ms |
| Add Section | < 50ms | < 100ms |
| Live Preview Update | < 100ms | < 200ms |
| Auto-save | < 500ms | < 1000ms |
| Section Gallery Open | < 300ms | < 500ms |
| Media Manager Load | < 1000ms | < 2000ms |

**Optimization Strategies:**
- Debounce live preview updates (100ms)
- Debounce auto-save (5 seconds)
- Virtual scrolling for large section lists (> 20 sections)
- Lazy load section editor components (code-splitting)
- Optimize YAML generation (memoization)

**Monitoring:**
```typescript
// Performance tracking
performance.mark('editor-load-start');
// ... load editor
performance.mark('editor-load-end');
performance.measure('editor-load', 'editor-load-start', 'editor-load-end');

// Log if > target
const measure = performance.getEntriesByName('editor-load')[0];
if (measure.duration > 500) {
  console.warn(`Editor load slow: ${measure.duration}ms`);
}
```

### 6.4 Styling Standards

**Follow UNIFIED_LAYOUT_SPECIFICATION.md:**
- Use Tailwind utility classes ONLY
- No inline styles
- No custom CSS files (except for complex animations)
- Support light and dark modes
- Responsive breakpoints: 640px (mobile), 768px (tablet), 1024px (desktop)

**Component Patterns:**
- Forms: `max-w-2xl mx-auto p-6`
- Buttons: Primary (blue), Secondary (gray), Danger (red)
- Cards: `bg-white dark:bg-gray-800 rounded-lg shadow-md`
- Inputs: `border-gray-300 dark:border-gray-600 focus:ring-blue-500`

---

## 7. Technical Constraints

### 7.1 Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile: iOS Safari 14+, Chrome Android 90+

### 7.2 Dependencies

**Required:**
- React 18+
- TypeScript 5+
- Tailwind CSS 4+
- Vite (existing)
- Vitest (existing)

**New Dependencies (to evaluate):**
- `react-beautiful-dnd` or `@dnd-kit/core` for drag-and-drop
- `zod` for validation schemas
- `js-yaml` for YAML generation (or use existing)
- `react-markdown` for markdown preview

**Constraints:**
- Bundle size: Visual Editor < 200KB (gzipped)
- Tree-shakeable: Can be excluded from production builds if not used

### 7.3 Data Persistence

**Primary:** File system (markdown files)
**Secondary (optional):** LocalStorage for draft auto-save
**Versioning:** Git-based (files are committed)

**Auto-save Strategy:**
1. Debounced save to LocalStorage (1 second)
2. Debounced save to file system (5 seconds)
3. Manual save button (immediate)
4. On navigation away (prompt if unsaved)

---

## 8. Success Criteria

### 8.1 MVP Definition

**Must Have (v1.0):**
- [ ] Create new card from blank template
- [ ] Edit all card configuration fields
- [ ] Build agenda with drag-and-drop
- [ ] Create pages and add sections
- [ ] Support all 31 section types in editor
- [ ] Live preview using existing renderer
- [ ] Save to file system
- [ ] Load existing cards
- [ ] Section gallery with search
- [ ] Undo/Redo (minimum 50 steps)
- [ ] Validation with helpful errors
- [ ] Keyboard accessible
- [ ] WCAG 2.1 AA compliant

**Should Have (v1.1):**
- [ ] Media Manager with upload and editing
- [ ] Duplicate cards and pages
- [ ] Export to YAML (download)
- [ ] Import from YAML (upload)
- [ ] Card templates (starter kits)
- [ ] Keyboard shortcuts cheatsheet

**Nice to Have (v2.0):**
- [ ] Collaboration (multiple editors, real-time)
- [ ] Version history (git integration UI)
- [ ] AI-assisted content suggestions
- [ ] Drag-and-drop image upload inline
- [ ] Section templates library

### 8.2 Acceptance Tests

**Scenario 1: Create Card in 15 Minutes**
- User can create a 3-page card with 10+ sections in < 15 minutes
- No YAML knowledge required
- Pass rate: 80% of test users

**Scenario 2: Zero Critical Bugs**
- No data loss during editing
- No crashes during normal usage
- Auto-save recovers from interruptions

**Scenario 3: Accessibility**
- All critical paths navigable by keyboard
- Zero axe-core violations
- Screen reader compatible (tested with NVDA)

**Scenario 4: Performance**
- All operations within target benchmarks
- Smooth on standard hardware (4GB RAM, dual-core CPU)

---

## Next Steps

1. **Review & Approve Specification** - Stakeholder sign-off
2. **Read VisualEditorSpecificationDetails.md** - Detailed implementation guide
3. **Phase 1: Foundation** - EditorContext, State Management, Basic UI
4. **Phase 2: Forms** - Card Config, Agenda Builder
5. **Phase 3: Section Editors** - All 31 types
6. **Phase 4: Polish** - Media Manager, Shortcuts, Help

**Estimated Implementation Time:** 60-80 hours (3-4 weeks, 2 developers)

---

**Document Version:** 2.0
**Last Updated:** January 3, 2026
**Status:** Ready for Implementation
**Next Review:** After Phase 1 completion
