# Visual Card Editor: Detailed Specification & Implementation Plan

**Version:** 2.0
**Last Updated:** January 3, 2026
**Purpose:** Complete technical and functional specification for Visual Card Editor implementation
**Prerequisite:** Read `VisualEditorSpecification.md` first

---

## Table of Contents

1. [Technical Architecture Details](#1-technical-architecture-details)
2. [Complete Field Mapping Reference](#2-complete-field-mapping-reference)
3. [Section Editor Specifications (All 31 Types)](#3-section-editor-specifications-all-31-types)
4. [Test Specifications](#4-test-specifications)
5. [Validation Rules & Error Messages](#5-validation-rules--error-messages)
6. [Implementation Phases](#6-implementation-phases)
7. [Component API Reference](#7-component-api-reference)
8. [Performance Optimization Strategy](#8-performance-optimization-strategy)

---

## 1. Technical Architecture Details

### 1.1 EditorContext Implementation

**File:** `frontend/src/contexts/EditorContext.tsx`

```typescript
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { CardDefinition, AgendaDefinition, PageDefinition, PopupDefinition, Section } from '@/lib/template-types';

// ===== STATE =====

interface EditorState {
  // Mode
  mode: 'card' | 'agenda' | 'page';

  // Data
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

  // History
  history: EditorStateSnapshot[];
  historyIndex: number;
  maxHistoryLength: 50;

  // UI
  previewMode: 'desktop' | 'tablet' | 'mobile';
  showSectionGallery: boolean;
  showMediaManager: boolean;

  // Validation
  validationErrors: ValidationError[];
  validationWarnings: ValidationWarning[];
}

interface EditorStateSnapshot {
  timestamp: Date;
  cardData: CardDefinition | null;
  agendaData: AgendaDefinition | null;
  pagesMap: Map<string, PageDefinition>;
  description: string; // for undo/redo UI
}

interface ValidationError {
  field: string;
  message: string;
  type: 'critical' | 'warning' | 'info';
}

// ===== ACTIONS =====

type EditorAction =
  // Card actions
  | { type: 'SET_CARD_DATA'; payload: Partial<CardDefinition> }
  | { type: 'CREATE_NEW_CARD'; payload?: { template?: string } }
  | { type: 'LOAD_CARD_SUCCESS'; payload: { card: CardDefinition; agenda: AgendaDefinition; pages: Map<string, PageDefinition> } }
  | { type: 'LOAD_CARD_ERROR'; payload: { error: string } }

  // Agenda actions
  | { type: 'SET_AGENDA_DATA'; payload: Partial<AgendaDefinition> }
  | { type: 'ADD_AGENDA_ITEM'; payload: AgendaItem }
  | { type: 'REMOVE_AGENDA_ITEM'; payload: { itemId: string } }
  | { type: 'REORDER_AGENDA_ITEMS'; payload: { fromIndex: number; toIndex: number } }

  // Page actions
  | { type: 'CREATE_PAGE'; payload: { parentId?: string } }
  | { type: 'DELETE_PAGE'; payload: { pageId: string } }
  | { type: 'UPDATE_PAGE'; payload: { pageId: string; data: Partial<PageDefinition> } }
  | { type: 'SET_ACTIVE_PAGE'; payload: { pageId: string } }

  // Section actions
  | { type: 'ADD_SECTION'; payload: { sectionType: string; index?: number } }
  | { type: 'UPDATE_SECTION'; payload: { index: number; data: Partial<Section> } }
  | { type: 'DELETE_SECTION'; payload: { index: number } }
  | { type: 'REORDER_SECTIONS'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'DUPLICATE_SECTION'; payload: { index: number } }

  // History actions
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CREATE_SNAPSHOT'; payload: { description: string } }

  // Validation actions
  | { type: 'SET_VALIDATION_ERRORS'; payload: ValidationError[] }
  | { type: 'CLEAR_VALIDATION' }

  // UI actions
  | { type: 'SET_MODE'; payload: { mode: 'card' | 'agenda' | 'page' } }
  | { type: 'SET_PREVIEW_MODE'; payload: { mode: 'desktop' | 'tablet' | 'mobile' } }
  | { type: 'TOGGLE_SECTION_GALLERY' }
  | { type: 'TOGGLE_MEDIA_MANAGER' }

  // Save actions
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS'; payload: { timestamp: Date } }
  | { type: 'SAVE_ERROR'; payload: { error: string } };

// ===== REDUCER =====

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_CARD_DATA':
      return {
        ...state,
        cardData: { ...state.cardData!, ...action.payload },
        isDirty: true,
      };

    case 'ADD_SECTION': {
      if (!state.activePageId) return state;

      const page = state.pagesMap.get(state.activePageId);
      if (!page) return state;

      const sections = [...(page.sections || [])];
      const index = action.payload.index ?? sections.length;

      // Create default section based on type
      const newSection = createDefaultSection(action.payload.sectionType);
      sections.splice(index, 0, newSection);

      const updatedPage = { ...page, sections };
      const updatedPagesMap = new Map(state.pagesMap);
      updatedPagesMap.set(state.activePageId, updatedPage);

      return {
        ...state,
        pagesMap: updatedPagesMap,
        isDirty: true,
        activeSectionIndex: index,
      };
    }

    case 'UPDATE_SECTION': {
      if (!state.activePageId) return state;

      const page = state.pagesMap.get(state.activePageId);
      if (!page || !page.sections) return state;

      const sections = [...page.sections];
      sections[action.payload.index] = {
        ...sections[action.payload.index],
        ...action.payload.data,
      };

      const updatedPage = { ...page, sections };
      const updatedPagesMap = new Map(state.pagesMap);
      updatedPagesMap.set(state.activePageId, updatedPage);

      return {
        ...state,
        pagesMap: updatedPagesMap,
        isDirty: true,
      };
    }

    case 'REORDER_SECTIONS': {
      if (!state.activePageId) return state;

      const page = state.pagesMap.get(state.activePageId);
      if (!page || !page.sections) return state;

      const sections = [...page.sections];
      const [removed] = sections.splice(action.payload.fromIndex, 1);
      sections.splice(action.payload.toIndex, 0, removed);

      const updatedPage = { ...page, sections };
      const updatedPagesMap = new Map(state.pagesMap);
      updatedPagesMap.set(state.activePageId, updatedPage);

      return {
        ...state,
        pagesMap: updatedPagesMap,
        isDirty: true,
      };
    }

    case 'UNDO': {
      if (state.historyIndex <= 0) return state;

      const snapshot = state.history[state.historyIndex - 1];
      return {
        ...state,
        cardData: snapshot.cardData,
        agendaData: snapshot.agendaData,
        pagesMap: snapshot.pagesMap,
        historyIndex: state.historyIndex - 1,
        isDirty: true,
      };
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;

      const snapshot = state.history[state.historyIndex + 1];
      return {
        ...state,
        cardData: snapshot.cardData,
        agendaData: snapshot.agendaData,
        pagesMap: snapshot.pagesMap,
        historyIndex: state.historyIndex + 1,
        isDirty: true,
      };
    }

    case 'CREATE_SNAPSHOT': {
      const snapshot: EditorStateSnapshot = {
        timestamp: new Date(),
        cardData: state.cardData,
        agendaData: state.agendaData,
        pagesMap: new Map(state.pagesMap),
        description: action.payload.description,
      };

      // Remove any redo history
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(snapshot);

      // Trim if exceeds max length
      if (newHistory.length > state.maxHistoryLength) {
        newHistory.shift();
      }

      return {
        ...state,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    // ... other cases

    default:
      return state;
  }
}

// ===== CONTEXT =====

interface EditorContextValue {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;

  // Convenience methods
  setCardData: (data: Partial<CardDefinition>) => void;
  loadCard: (cardId: string) => Promise<void>;
  saveCard: () => Promise<void>;

  addSection: (type: string, index?: number) => void;
  updateSection: (index: number, data: Partial<Section>) => void;
  deleteSection: (index: number) => void;

  undo: () => void;
  redo: () => void;

  validate: () => ValidationResult;
}

const EditorContext = createContext<EditorContextValue | null>(null);

// ===== PROVIDER =====

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  // Auto-save effect
  useEffect(() => {
    if (!state.isDirty || !state.autoSaveEnabled) return;

    const timer = setTimeout(() => {
      saveCard();
    }, 5000); // 5 second debounce

    return () => clearTimeout(timer);
  }, [state.cardData, state.agendaData, state.pagesMap]);

  // Snapshot creation effect (for undo/redo)
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({ type: 'CREATE_SNAPSHOT', payload: { description: 'Auto' } });
    }, 1000); // 1 second debounce

    return () => clearTimeout(timer);
  }, [state.cardData, state.agendaData, state.pagesMap]);

  // Convenience methods
  const setCardData = (data: Partial<CardDefinition>) => {
    dispatch({ type: 'SET_CARD_DATA', payload: data });
  };

  const loadCard = async (cardId: string) => {
    try {
      // Use existing parsers
      const cardData = await loadCardDefinition(cardId);
      const agendaData = await loadAgendaDefinition(cardId);
      const pages = await loadAllPages(cardId);

      dispatch({
        type: 'LOAD_CARD_SUCCESS',
        payload: { card: cardData, agenda: agendaData, pages },
      });
    } catch (error) {
      dispatch({
        type: 'LOAD_CARD_ERROR',
        payload: { error: error.message },
      });
    }
  };

  const saveCard = async () => {
    try {
      dispatch({ type: 'SAVE_START' });

      // Transform state to YAML and write files
      await writeCardDefinition(state.cardData!);
      await writeAgendaDefinition(state.agendaData!);

      for (const [pageId, pageData] of state.pagesMap.entries()) {
        await writePage(pageId, pageData);
      }

      dispatch({ type: 'SAVE_SUCCESS', payload: { timestamp: new Date() } });
    } catch (error) {
      dispatch({ type: 'SAVE_ERROR', payload: { error: error.message } });
    }
  };

  const addSection = (type: string, index?: number) => {
    dispatch({ type: 'ADD_SECTION', payload: { sectionType: type, index } });
  };

  const updateSection = (index: number, data: Partial<Section>) => {
    dispatch({ type: 'UPDATE_SECTION', payload: { index, data } });
  };

  const deleteSection = (index: number) => {
    dispatch({ type: 'DELETE_SECTION', payload: { index } });
  };

  const undo = () => {
    dispatch({ type: 'UNDO' });
  };

  const redo = () => {
    dispatch({ type: 'REDO' });
  };

  const validate = (): ValidationResult => {
    const errors: ValidationError[] = [];

    // Card validation
    if (state.cardData) {
      if (!state.cardData.name || state.cardData.name.length < 3) {
        errors.push({
          field: 'card.name',
          message: 'Card name must be at least 3 characters',
          type: 'critical',
        });
      }

      if (!state.cardData.icon) {
        errors.push({
          field: 'card.icon',
          message: 'Please select an icon',
          type: 'critical',
        });
      }

      // ... more validation
    }

    dispatch({ type: 'SET_VALIDATION_ERRORS', payload: errors });

    return {
      valid: errors.filter(e => e.type === 'critical').length === 0,
      errors,
    };
  };

  const value: EditorContextValue = {
    state,
    dispatch,
    setCardData,
    loadCard,
    saveCard,
    addSection,
    updateSection,
    deleteSection,
    undo,
    redo,
    validate,
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within EditorProvider');
  }
  return context;
}

// ===== HELPER FUNCTIONS =====

function createDefaultSection(type: string): Section {
  const defaults: Record<string, Partial<Section>> = {
    hero: {
      type: 'hero',
      heading: 'New Heading',
      subtitle: 'Add a subtitle',
      align: 'left',
    },
    text: {
      type: 'text',
      content: 'Add your content here...',
      align: 'left',
    },
    // ... all 31 types
  };

  return (defaults[type] || { type }) as Section;
}
```

### 1.2 File Writer Implementation

**File:** `frontend/src/lib/file-writer/index.ts`

```typescript
import yaml from 'js-yaml';
import { CardDefinition, AgendaDefinition, PageDefinition } from '@/lib/template-types';

/**
 * Writes card definition to file system
 */
export async function writeCardDefinition(
  cardData: CardDefinition
): Promise<void> {
  const yamlContent = yaml.dump({ card: cardData }, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
  });

  const markdown = `# ${cardData.name} - Card Definition\n\n\`\`\`yaml\n${yamlContent}\n\`\`\`\n`;

  const filePath = `content/pages/cards/${cardData.id}/card-definition.md`;

  await writeFile(filePath, markdown);
}

/**
 * Writes agenda definition to file system
 */
export async function writeAgendaDefinition(
  cardId: string,
  agendaData: AgendaDefinition
): Promise<void> {
  const yamlContent = yaml.dump({ agenda: agendaData }, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
  });

  const markdown = `# ${agendaData.title}\n\n\`\`\`yaml\n${yamlContent}\n\`\`\`\n`;

  const filePath = `content/pages/cards/${cardId}/agenda.md`;

  await writeFile(filePath, markdown);
}

/**
 * Writes page definition to file system
 */
export async function writePage(
  cardId: string,
  pageId: string,
  pageData: PageDefinition
): Promise<void> {
  // Convert page data to YAML structure
  const yamlContent = yaml.dump(
    {
      page: {
        id: pageData.id,
        titles: pageData.titles,
        description: pageData.description,
        metadata: pageData.metadata,
        parent: pageData.parent,
        icon: pageData.icon,
      },
      sections: pageData.sections || [],
      sub_pages: pageData.subPages || [],
      popups: pageData.popups || [],
      navigation: pageData.navigation || {},
    },
    {
      indent: 2,
      lineWidth: 120,
      noRefs: true,
    }
  );

  const markdown = `# ${pageData.titles.page_header}\n\n\`\`\`yaml\n${yamlContent}\n\`\`\`\n`;

  const filePath = `content/pages/cards/${cardId}/pages/${pageId}.md`;

  await writeFile(filePath, markdown);
}

/**
 * Writes file to file system
 * In browser: use File System Access API
 * In Node: use fs module
 */
async function writeFile(path: string, content: string): Promise<void> {
  // Browser environment
  if (typeof window !== 'undefined') {
    // Use File System Access API if available
    if ('showSaveFilePicker' in window) {
      // Modern browsers
      const handle = await getFileHandle(path);
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
    } else {
      // Fallback: trigger download
      triggerDownload(path, content);
    }
  } else {
    // Node environment (for local development)
    const fs = await import('fs/promises');
    const pathModule = await import('path');

    const fullPath = pathModule.join(process.cwd(), path);
    await fs.writeFile(fullPath, content, 'utf-8');
  }
}

// Helper: Get file handle for File System Access API
async function getFileHandle(path: string) {
  // Implementation depends on whether we have directory access
  // This would be set up during initial editor load

  // For now, simplified version:
  const opts = {
    types: [{
      description: 'Markdown files',
      accept: { 'text/markdown': ['.md'] },
    }],
    suggestedName: path.split('/').pop(),
  };

  return await (window as any).showSaveFilePicker(opts);
}

// Helper: Trigger download as fallback
function triggerDownload(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.split('/').pop() || 'file.md';
  a.click();
  URL.revokeObjectURL(url);
}
```

---

## 2. Complete Field Mapping Reference

### 2.1 Card Definition Fields

| YAML Path | TypeScript Type | UI Component | Validation | Default | Required |
|-----------|----------------|--------------|------------|---------|----------|
| `card.id` | `string` | Text Input (read-only after creation) | `^[a-z0-9-]+$`, unique | `slugify(name)` | Yes |
| `card.name` | `string` | Text Input | 3-100 chars | "Untitled Card" | Yes |
| `card.category` | `string` | Combobox | One of standard or custom | "technical" | Yes |
| `card.color_theme` | `string` | Color Swatch Grid | One of 10 themes | "blue" | Yes |
| `card.icon` | `string` | Icon Picker Modal | Valid Lucide icon name | "FileText" | Yes |
| `card.description.short` | `string` | Text Input | 0-120 chars | "" | No |
| `card.description.long` | `string` | Textarea | 0-500 chars | "" | No |
| `card.metadata.author` | `string` | Text Input | 0-100 chars | "" | No |
| `card.metadata.version` | `string` | Text Input | Semver format | "1.0" | No |
| `card.metadata.last_updated` | `string` | Date Picker | ISO date | today | No |
| `card.metadata.tags` | `string[]` | Tag Input | Array of strings | [] | No |
| `card.metadata.difficulty` | `'beginner' \| 'intermediate' \| 'advanced' \| 'expert'` | Radio Group | One of 4 levels | "intermediate" | No |
| `card.metadata.estimated_time` | `string` | Text Input | e.g., "15 minutes" | "" | No |
| `card.agenda.file` | `string` | Text Input (auto-filled) | Valid path | auto | Yes |
| `card.navigation.type` | `'hierarchical' \| 'tabs' \| 'linear'` | Segmented Control | One of 3 | "hierarchical" | Yes |
| `card.navigation.show_breadcrumbs` | `boolean` | Toggle Switch | - | true | No |
| `card.navigation.show_page_tree` | `boolean` | Toggle Switch | - | true | No |
| `card.navigation.allow_back_to_agenda` | `boolean` | Toggle Switch | - | true | No |
| `card.navigation.show_next_previous` | `boolean` | Toggle Switch | - | true | No |
| `card.settings.default_animation` | `'fade-in' \| 'slide-in' \| 'scale-in' \| 'none'` | Dropdown | One of 4 | "fade-in" | No |
| `card.settings.transition_speed` | `string` | Text Input | e.g., "300ms" | "300ms" | No |
| `card.settings.max_depth` | `number` | Number Input | 1-10 | 5 | No |

### 2.2 Agenda Definition Fields

| YAML Path | TypeScript Type | UI Component | Validation | Default | Required |
|-----------|----------------|--------------|------------|---------|----------|
| `agenda.title` | `string` | Text Input | 3-100 chars | "Explore Topics" | Yes |
| `agenda.subtitle` | `string` | Text Input | 0-200 chars | "" | No |
| `agenda.layout.type` | `'grid' \| 'list' \| 'carousel'` | Visual Card Selector | One of 3 | "grid" | Yes |
| `agenda.layout.columns` | `2 \| 3 \| 4` | Slider (if grid) | 2-4 | 3 | No |
| `agenda.layout.gap` | `'small' \| 'medium' \| 'large'` | Radio Group | One of 3 | "large" | No |
| `agenda.animation.type` | `string` | Dropdown | Animation name | "stagger-fade-in" | No |
| `agenda.animation.delay_between_items` | `string` | Text Input | e.g., "0.1s" | "0.1s" | No |
| `agenda.items[].id` | `string` | Text Input (auto) | `^[a-z0-9-]+$`, unique | auto | Yes |
| `agenda.items[].order` | `number` | Number (auto from position) | >= 1 | auto | Yes |
| `agenda.items[].titles.agenda_title` | `string` | Text Input | 3-50 chars | "" | Yes |
| `agenda.items[].description` | `string` | Textarea | 0-200 chars | "" | No |
| `agenda.items[].icon` | `string` | Icon Picker | Valid icon name | "FileText" | Yes |
| `agenda.items[].target.type` | `'page' \| 'external_link'` | Radio Buttons | One of 2 | "page" | Yes |
| `agenda.items[].target.page_id` | `string` | Dropdown (if type=page) | Valid page ID | "" | Conditional |
| `agenda.items[].target.url` | `string` | URL Input (if type=external_link) | Valid URL | "" | Conditional |
| `agenda.items[].image` | `string` | Image Picker | Valid path | "" | No |

### 2.3 Page Definition Fields

| YAML Path | TypeScript Type | UI Component | Validation | Default | Required |
|-----------|----------------|--------------|------------|---------|----------|
| `page.id` | `string` | Text Input (read-only) | `^[a-z0-9-]+$`, unique | auto | Yes |
| `page.titles.page_header` | `string` | Text Input (large) | 3-100 chars | "New Page" | Yes |
| `page.titles.menu_title` | `string` | Text Input | 3-50 chars | Same as page_header | No |
| `page.titles.agenda_title` | `string` | Text Input | 3-50 chars | Same as page_header | No |
| `page.titles.breadcrumb` | `string` | Text Input (small) | 3-30 chars | Same as page_header | No |
| `page.description.short` | `string` | Text Input | 0-120 chars | "" | No |
| `page.description.long` | `string` | Textarea | 0-500 chars | "" | No |
| `page.metadata.*` | Various | Same as card metadata | Same | Same | No |
| `page.parent` | `string \| null` | Dropdown | Valid page ID or null | null | No |
| `page.icon` | `string` | Icon Picker | Valid icon name | "FileText" | Yes |
| `sections[]` | `Section[]` | Dynamic Section Editors | Valid section | [] | No |
| `sub_pages[].file` | `string` | Text (auto from page ID) | Valid path | auto | No |
| `popups[]` | `Popup[]` | Popup Editor | Valid popup | [] | No |
| `navigation.*` | Various | Same as card navigation | Same | Inherit from card | No |

---

## 3. Section Editor Specifications (All 31 Types)

For each section type, we specify:
- **Fields**: All editable fields
- **UI Layout**: How fields are arranged
- **Validation**: Rules for each field
- **Default Values**: Initial state
- **Test Requirements**: What to test

### 3.1 Hero Section

**Type:** `hero`
**Category:** Content
**Complexity:** Low

**Fields:**

| Field | Type | UI Component | Validation | Default | Required |
|-------|------|--------------|------------|---------|----------|
| `heading` | `string` | Text Input (large) | 3-200 chars | "New Heading" | Yes |
| `subtitle` | `string` | Text Input | 0-300 chars | "" | No |
| `align` | `'left' \| 'center' \| 'right'` | Radio Buttons | One of 3 | "left" | No |

**UI Layout:**
```
┌───────────────────────────────────────────────┐
│ Hero Section                                  │
├───────────────────────────────────────────────┤
│ Heading *                                     │
│ [_____________________________________]       │
│                                               │
│ Subtitle                                      │
│ [_____________________________________]       │
│                                               │
│ Alignment                                     │
│ (•) Left  ( ) Center  ( ) Right              │
└───────────────────────────────────────────────┘
```

**Tests:**
```typescript
describe('HeroSectionEditor', () => {
  it('should render all fields', () => { /* ... */ });
  it('should require heading field', () => { /* ... */ });
  it('should validate heading min length (3 chars)', () => { /* ... */ });
  it('should validate heading max length (200 chars)', () => { /* ... */ });
  it('should default to left alignment', () => { /* ... */ });
  it('should update parent state on change', () => { /* ... */ });
  it('should support keyboard navigation', () => { /* ... */ });
});
```

### 3.2 Text Section

**Type:** `text`
**Category:** Content
**Complexity:** Low

**Fields:**

| Field | Type | UI Component | Validation | Default | Required |
|-------|------|--------------|------------|---------|----------|
| `content` | `string` | Textarea with Markdown toolbar | Non-empty | "Add content..." | Yes |
| `align` | `'left' \| 'center' \| 'right' \| 'justify'` | Radio Buttons | One of 4 | "left" | No |

**UI Layout:**
```
┌───────────────────────────────────────────────┐
│ Text Section                                  │
├───────────────────────────────────────────────┤
│ Content * (Markdown supported)                │
│ [B] [I] [List] [Link] [Preview]              │
│ ┌─────────────────────────────────────────┐  │
│ │ Add content...                          │  │
│ │                                         │  │
│ │                                         │  │
│ │                                         │  │
│ └─────────────────────────────────────────┘  │
│                                               │
│ Alignment                                     │
│ (•) Left  ( ) Center  ( ) Right  ( ) Justify │
└───────────────────────────────────────────────┘
```

**Markdown Toolbar:**
- Bold (Ctrl+B)
- Italic (Ctrl+I)
- Bullet List
- Numbered List
- Insert Link
- Toggle Preview

**Tests:**
```typescript
describe('TextSectionEditor', () => {
  it('should render markdown editor', () => { /* ... */ });
  it('should require content', () => { /* ... */ });
  it('should support markdown formatting', () => { /* ... */ });
  it('should have markdown toolbar', () => { /* ... */ });
  it('should preview markdown on toggle', () => { /* ... */ });
  it('should default to left alignment', () => { /* ... */ });
});
```

### 3.3 Feature Grid Section

**Type:** `feature_grid`
**Category:** Navigation
**Complexity:** High

**Fields:**

| Field | Type | UI Component | Validation | Default | Required |
|-------|------|--------------|------------|---------|----------|
| `columns` | `2 \| 3 \| 4` | Slider | 2-4 | 3 | Yes |
| `features` | `Feature[]` | Nested List Editor | Min 1 feature | [default] | Yes |
| `features[].name` | `string` | Text Input | 3-50 chars | "Feature Name" | Yes |
| `features[].icon` | `string` | Icon Picker Button | Valid icon | "Star" | Yes |
| `features[].description` | `string` | Textarea | 0-200 chars | "" | No |
| `features[].click_action` | `ClickAction` | Click Action Editor | Valid action | null | No |

**UI Layout:**
```
┌───────────────────────────────────────────────┐
│ Feature Grid Section                          │
├───────────────────────────────────────────────┤
│ Columns: [====•====] 3                        │
│                                               │
│ Features (3)                           [+ Add]│
│                                               │
│ ┌───────────────────────────────────────────┐│
│ │ ≡ [⭐] Feature Name          [↑][↓][×]   ││
│ │   Description: Brief description...       ││
│ │   Click Action: Navigate to page ▾        ││
│ └───────────────────────────────────────────┘│
│                                               │
│ ┌───────────────────────────────────────────┐│
│ │ ≡ [🔒] Security                [↑][↓][×]   ││
│ │   Description: Enterprise security...     ││
│ │   Click Action: Show popup ▾              ││
│ └───────────────────────────────────────────┘│
│                                               │
│ ┌───────────────────────────────────────────┐│
│ │ ≡ [⚡] Performance             [↑][↓][×]   ││
│ │   Description: Fast and efficient...      ││
│ │   Click Action: External link ▾           ││
│ └───────────────────────────────────────────┘│
└───────────────────────────────────────────────┘
```

**Click Action Editor (Sub-component):**
```
┌───────────────────────────────────────────────┐
│ Click Action                                  │
├───────────────────────────────────────────────┤
│ Action Type                                   │
│ (•) Navigate to Page                          │
│ ( ) Show Popup                                │
│ ( ) External Link                             │
│ ( ) None                                      │
│                                               │
│ Target Page (if Navigate selected)            │
│ [Select page...                        ▾]    │
└───────────────────────────────────────────────┘
```

**Tests:**
```typescript
describe('FeatureGridSectionEditor', () => {
  // List management
  it('should render feature list', () => { /* ... */ });
  it('should add new feature on button click', () => { /* ... */ });
  it('should remove feature', () => { /* ... */ });
  it('should reorder features via drag-and-drop', () => { /* ... */ });
  it('should reorder features via keyboard (up/down buttons)', () => { /* ... */ });

  // Field validation
  it('should require at least 1 feature', () => { /* ... */ });
  it('should validate feature name (3-50 chars)', () => { /* ... */ });
  it('should require icon for each feature', () => { /* ... */ });

  // Columns
  it('should adjust column count with slider', () => { /* ... */ });
  it('should default to 3 columns', () => { /* ... */ });

  // Click actions
  it('should render click action editor', () => { /* ... */ });
  it('should validate click action based on type', () => { /* ... */ });
  it('should show target page dropdown when navigate selected', () => { /* ... */ });
  it('should show popup dropdown when show popup selected', () => { /* ... */ });
  it('should show URL input when external link selected', () => { /* ... */ });
});
```

### 3.4 Interactive Diagram Section

**Type:** `interactive_diagram`
**Category:** Interactive
**Complexity:** Very High

**Fields:**

| Field | Type | UI Component | Validation | Default | Required |
|-------|------|--------------|------------|---------|----------|
| `image` | `string` | Image Picker + Canvas | Valid image path | "" | Yes |
| `hotspots` | `Hotspot[]` | Canvas Plotter | Valid hotspots | [] | No |
| `hotspots[].x` | `number` | Canvas (visual) | 0 to image width | 0 | Yes |
| `hotspots[].y` | `number` | Canvas (visual) | 0 to image height | 0 | Yes |
| `hotspots[].radius` | `number` | Number Input | 10-100 | 30 | Yes |
| `hotspots[].click_action` | `ClickAction` | Click Action Editor | Valid action | required | Yes |
| `hotspots[].hover_text` | `string` | Text Input | 0-100 chars | "" | No |

**UI Layout:**
```
┌───────────────────────────────────────────────┐
│ Interactive Diagram Section                   │
├───────────────────────────────────────────────┤
│ Image *                                       │
│ [Choose Image...]                             │
│                                               │
│ Canvas (Click to add hotspots)                │
│ ┌─────────────────────────────────────────┐  │
│ │                                         │  │
│ │    [IMAGE]        ⊕ (hotspot 1)        │  │
│ │                                         │  │
│ │              ⊕ (hotspot 2)              │  │
│ │                                         │  │
│ └─────────────────────────────────────────┘  │
│                                               │
│ Hotspots (2)                         [+ Add]  │
│                                               │
│ ┌───────────────────────────────────────────┐│
│ │ Hotspot 1              [Edit] [Delete]    ││
│ │ Position: (100, 150) | Radius: 30px       ││
│ │ Hover: "API Gateway"                      ││
│ │ Action: Show popup "api-details"          ││
│ └───────────────────────────────────────────┘│
│                                               │
│ ┌───────────────────────────────────────────┐│
│ │ Hotspot 2              [Edit] [Delete]    ││
│ │ Position: (300, 200) | Radius: 40px       ││
│ │ Hover: "Database Layer"                   ││
│ │ Action: Navigate to "db-architecture"     ││
│ └───────────────────────────────────────────┘│
└───────────────────────────────────────────────┘
```

**Canvas Interaction:**
1. Click on image → modal opens to configure hotspot
2. Drag existing hotspot to reposition
3. Resize hotspot (drag radius handle)
4. Delete hotspot (click and press Delete key)

**Hotspot Editor Modal:**
```
┌───────────────────────────────────────────────┐
│ Configure Hotspot                        [×]  │
├───────────────────────────────────────────────┤
│ Position (auto-filled from click)             │
│ X: [100  ] px    Y: [150  ] px                │
│                                               │
│ Radius                                        │
│ [====•====] 30 px                             │
│                                               │
│ Hover Text                                    │
│ [API Gateway - Click to learn more___]        │
│                                               │
│ Click Action *                                │
│ (•) Navigate to Page [Select...        ▾]    │
│ ( ) Show Popup                                │
│ ( ) External Link                             │
│                                               │
│          [Cancel]              [Save]         │
└───────────────────────────────────────────────┘
```

**Tests:**
```typescript
describe('InteractiveDiagramSectionEditor', () => {
  // Image selection
  it('should open image picker on button click', () => { /* ... */ });
  it('should require image', () => { /* ... */ });
  it('should load image on canvas', () => { /* ... */ });

  // Canvas interaction
  it('should add hotspot on canvas click', () => { /* ... */ });
  it('should open hotspot modal with coordinates', () => { /* ... */ });
  it('should allow dragging hotspot to reposition', () => { /* ... */ });
  it('should allow resizing hotspot', () => { /* ... */ });
  it('should delete hotspot on delete key', () => { /* ... */ });
  it('should show hotspot hover text on mouse over', () => { /* ... */ });

  // Hotspot validation
  it('should validate hotspot coordinates within image bounds', () => { /* ... */ });
  it('should validate radius (10-100)', () => { /* ... */ });
  it('should require click action', () => { /* ... */ });

  // Accessibility
  it('should support keyboard navigation for hotspot list', () => { /* ... */ });
  it('should provide text alternative for canvas', () => { /* ... */ });
});
```

### 3.5-3.31 Other Section Editors

Due to space constraints, here's the summary table for remaining 27 section types:

| Type | Category | Complexity | Key Fields | Special UI |
|------|----------|------------|------------|------------|
| `text_with_links` | Content | Medium | `content` (with `[[link]]` syntax) | Link syntax helper |
| `image` | Content | Low | `image`, `alt`, `caption`, `size`, `align` | Image picker |
| `image_clickable` | Navigation | Medium | `image`, `alt`, `click_action`, `hover_effect` | Image + action editor |
| `video` | Content | Low | `video_url`, `caption`, `aspect_ratio` | URL validator |
| `code_block` | Special | Medium | `language`, `code`, `filename`, `show_line_numbers` | Syntax highlighter |
| `list` | Data | Low | `list_style`, `items[]` | Item list editor |
| `alert` | Special | Low | `alert_type`, `title`, `content`, `dismissible` | Type selector |
| `feature_grid` | Navigation | High | `columns`, `features[]` | (See 3.3) |
| `clickable_cards` | Navigation | High | `columns`, `cards[]` | Similar to feature_grid |
| `comparison_grid` | Data | High | `columns`, `items[]` | Matrix editor |
| `expandable_section` | Expandable | Medium | `trigger`, `collapsed`, `expanded` | Dual content editor |
| `expandable_card` | Expandable | Medium | `trigger`, `icon`, `collapsed_*`, `expanded_*` | Card preview |
| `tabbed_content` | Interactive | High | `tabs[]` | Tab list editor |
| `interactive_diagram` | Interactive | Very High | `image`, `hotspots[]` | (See 3.4) |
| `steps` | Data | Medium | `orientation`, `steps[]` | Step list editor |
| `timeline` | Data | Medium | `events[]` | Event list editor |
| `key_value_pairs` | Data | Low | `layout`, `pairs[]` | Key-value list |
| `quote` | Content | Low | `content`, `author`, `role`, `avatar` | Simple form |
| `divider` | Content | Low | `style`, `spacing` | Style selector |
| `stats` | Special | Medium | `layout`, `stats[]` | Stats list editor |
| `table` | Data | High | `headers[]`, `rows[][]`, `stripe`, `compact` | Matrix editor |
| `embed` | Special | Low | `url`, `height`, `title`, `allow` | URL + iframe settings |
| `download` | Special | Medium | `files[]` | File list editor |
| `gallery` | Special | Medium | `columns`, `images[]` | Image grid editor |
| `card_list` | Special | Medium | `items[]` | Card list editor |
| `progress` | Special | Medium | `items[]` | Progress list editor |
| `tags` | Special | Low | `tags[]` | Tag list editor |
| `accordion` | Expandable | Medium | `allow_multiple`, `items[]` | Accordion list |
| `loading` | Special | Low | `style`, `message`, `size` | Style selector |

**Note:** Each section editor will have:
- Dedicated test suite (10-20 tests)
- Field validation
- Accessibility compliance
- Keyboard support
- Dark mode styling

---

## 4. Test Specifications

### 4.1 Unit Test Structure

**Location:** `frontend/src/components/editor/__tests__/`

**Coverage Target:** > 90%

**Test Categories:**

1. **Component Rendering**
   - Renders without errors
   - Renders all expected fields
   - Applies correct styling
   - Supports dark mode

2. **User Interactions**
   - Field updates trigger state changes
   - Buttons perform expected actions
   - Keyboard shortcuts work
   - Drag-and-drop functions correctly

3. **Validation**
   - Shows errors for invalid input
   - Clears errors when fixed
   - Prevents save with critical errors
   - Shows warnings for non-critical issues

4. **Accessibility**
   - All fields have labels
   - Keyboard navigation works
   - ARIA attributes present
   - Focus management correct

5. **State Management**
   - Context updates propagate
   - Undo/redo works
   - Auto-save triggers
   - Dirty state tracked

**Example Test File:**

```typescript
// CardConfigForm.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { EditorProvider } from '@/contexts/EditorContext';
import { CardConfigForm } from '@/components/editor/CardConfigForm';

expect.extend(toHaveNoViolations);

describe('CardConfigForm', () => {
  // Test wrapper with context
  function renderWithContext(ui: React.ReactElement) {
    return render(
      <EditorProvider>
        {ui}
      </EditorProvider>
    );
  }

  describe('Rendering', () => {
    it('should render all required fields', () => {
      renderWithContext(<CardConfigForm />);

      expect(screen.getByLabelText('Card Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Unique ID')).toBeInTheDocument();
      expect(screen.getByLabelText('Category')).toBeInTheDocument();
      expect(screen.getByLabelText('Theme Color')).toBeInTheDocument();
      expect(screen.getByLabelText('Icon')).toBeInTheDocument();
    });

    it('should have no accessibility violations', async () => {
      const { container } = renderWithContext(<CardConfigForm />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Card Name Field', () => {
    it('should update card name on input', async () => {
      const user = userEvent.setup();
      renderWithContext(<CardConfigForm />);

      const nameInput = screen.getByLabelText('Card Name');
      await user.clear(nameInput);
      await user.type(nameInput, 'My Test Card');

      expect(nameInput).toHaveValue('My Test Card');
    });

    it('should show error for name < 3 chars', async () => {
      const user = userEvent.setup();
      renderWithContext(<CardConfigForm />);

      const nameInput = screen.getByLabelText('Card Name');
      await user.clear(nameInput);
      await user.type(nameInput, 'AB');
      await user.tab(); // Trigger blur

      await waitFor(() => {
        expect(screen.getByText(/name must be at least 3 characters/i))
          .toBeInTheDocument();
      });
    });

    it('should auto-generate ID from name', async () => {
      const user = userEvent.setup();
      renderWithContext(<CardConfigForm />);

      const nameInput = screen.getByLabelText('Card Name');
      await user.clear(nameInput);
      await user.type(nameInput, 'My Test Card');

      const idInput = screen.getByLabelText('Unique ID');
      expect(idInput).toHaveValue('my-test-card');
    });
  });

  describe('Icon Picker', () => {
    it('should open modal when icon button clicked', async () => {
      const user = userEvent.setup();
      renderWithContext(<CardConfigForm />);

      const iconButton = screen.getByLabelText('Select icon');
      await user.click(iconButton);

      expect(screen.getByRole('dialog', { name: 'Icon Picker' }))
        .toBeInTheDocument();
    });

    it('should filter icons by search', async () => {
      const user = userEvent.setup();
      renderWithContext(<CardConfigForm />);

      const iconButton = screen.getByLabelText('Select icon');
      await user.click(iconButton);

      const searchInput = screen.getByPlaceholderText('Search icons...');
      await user.type(searchInput, 'star');

      // Should show star-related icons only
      expect(screen.getByLabelText('Star')).toBeVisible();
      expect(screen.queryByLabelText('Home')).not.toBeInTheDocument();
    });

    it('should update icon on selection', async () => {
      const user = userEvent.setup();
      renderWithContext(<CardConfigForm />);

      const iconButton = screen.getByLabelText('Select icon');
      await user.click(iconButton);

      const starIcon = screen.getByLabelText('Star');
      await user.click(starIcon);

      // Modal should close
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      // Icon should update (visual check)
      const iconPreview = screen.getByTestId('icon-preview');
      expect(iconPreview).toHaveAttribute('data-icon', 'Star');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate through fields with Tab', async () => {
      const user = userEvent.setup();
      renderWithContext(<CardConfigForm />);

      const nameInput = screen.getByLabelText('Card Name');
      const categoryInput = screen.getByLabelText('Category');
      const iconButton = screen.getByLabelText('Select icon');

      nameInput.focus();
      expect(nameInput).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText('Unique ID')).toHaveFocus();

      await user.tab();
      expect(categoryInput).toHaveFocus();
    });

    it('should support Ctrl+S to save', async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();
      renderWithContext(<CardConfigForm onSave={onSave} />);

      await user.keyboard('{Control>}s{/Control}');

      expect(onSave).toHaveBeenCalled();
    });
  });

  describe('State Integration', () => {
    it('should update editor context on change', async () => {
      const user = userEvent.setup();
      const TestComponent = () => {
        const { state } = useEditor();
        return (
          <>
            <CardConfigForm />
            <div data-testid="card-name">{state.cardData?.name}</div>
          </>
        );
      };

      renderWithContext(<TestComponent />);

      const nameInput = screen.getByLabelText('Card Name');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Name');

      expect(screen.getByTestId('card-name')).toHaveTextContent('Updated Name');
    });
  });
});
```

### 4.2 Integration Test Examples

**File:** `frontend/src/components/editor/__tests__/integration/CreateCardFlow.test.tsx`

```typescript
describe('Create Card Flow (Integration)', () => {
  it('should create complete card from scratch', async () => {
    const user = userEvent.setup();
    render(<EditorApp />);

    // Step 1: Click "New Card"
    await user.click(screen.getByRole('button', { name: 'New Card' }));

    // Step 2: Fill card config
    await user.type(screen.getByLabelText('Card Name'), 'Security Guide');
    await user.selectOptions(screen.getByLabelText('Category'), 'security');

    // Step 3: Select icon
    await user.click(screen.getByLabelText('Select icon'));
    await user.click(screen.getByLabelText('Shield'));

    // Step 4: Navigate to Agenda
    await user.click(screen.getByRole('tab', { name: 'Agenda' }));

    // Step 5: Add agenda item
    await user.click(screen.getByRole('button', { name: 'Add Item' }));
    await user.type(screen.getByLabelText('Title'), 'Introduction');
    await user.click(screen.getByRole('button', { name: 'Create New Page' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    // Step 6: Navigate to new page
    await user.click(screen.getByRole('tab', { name: 'Pages' }));
    await user.click(screen.getByText('Introduction'));

    // Step 7: Add section
    await user.click(screen.getByRole('button', { name: 'Add Section' }));
    await user.click(screen.getByText('Hero'));
    await user.type(screen.getByLabelText('Heading'), 'Welcome to Security Guide');

    // Step 8: Save card
    await user.click(screen.getByRole('button', { name: 'Save' }));

    // Verify success
    await waitFor(() => {
      expect(screen.getByText('Card saved successfully')).toBeInTheDocument();
    });

    // Verify file was created (mock)
    expect(mockFileWriter.writeCardDefinition).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Security Guide',
        category: 'security',
        icon: 'Shield',
      })
    );
  });
});
```

### 4.3 E2E Test Examples

**File:** `e2e/editor.spec.ts` (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Visual Editor E2E', () => {
  test('should create and preview card', async ({ page }) => {
    // Navigate to editor
    await page.goto('/editor/new');

    // Fill card name
    await page.getByLabel('Card Name').fill('Test Card');

    // Select icon
    await page.getByLabel('Select icon').click();
    await page.getByLabel('Star').click();

    // Switch to preview mode
    await page.getByRole('button', { name: 'Preview' }).click();

    // Verify preview renders
    await expect(page.getByRole('heading', { name: 'Test Card' })).toBeVisible();

    // Test responsive preview
    await page.getByLabel('Select preview device').click();
    await page.getByText('Mobile').click();

    // Verify mobile layout
    await expect(page.locator('[data-preview-mode="mobile"]')).toBeVisible();

    // Save card
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByRole('button', { name: 'Save' }).click();

    // Verify success toast
    await expect(page.getByText('Card saved successfully')).toBeVisible();
  });

  test('should support undo/redo', async ({ page }) => {
    await page.goto('/editor/new');

    // Make change
    await page.getByLabel('Card Name').fill('Original Name');
    await page.waitForTimeout(100); // Wait for snapshot

    // Make another change
    await page.getByLabel('Card Name').fill('Updated Name');
    await page.waitForTimeout(100);

    // Undo
    await page.keyboard.press('Control+Z');
    await expect(page.getByLabel('Card Name')).toHaveValue('Original Name');

    // Redo
    await page.keyboard.press('Control+Shift+Z');
    await expect(page.getByLabel('Card Name')).toHaveValue('Updated Name');
  });
});
```

---

## 5. Validation Rules & Error Messages

### 5.1 Card-Level Validation

| Rule | Condition | Error Type | Message | Action |
|------|-----------|------------|---------|--------|
| Unique ID | `card.id` already exists | Critical | "Card ID '{id}' already exists. Please choose a different name." | Block save |
| Required Name | `card.name` is empty or < 3 chars | Critical | "Card name must be at least 3 characters." | Block save |
| Valid Icon | `card.icon` not in Lucide list | Critical | "Invalid icon name. Please select from icon picker." | Block save |
| Valid Theme | `card.color_theme` not in allowed list | Critical | "Invalid color theme. Please select a valid theme." | Block save |
| Agenda File | `card.agenda.file` doesn't exist | Warning | "Agenda file not found. Create agenda before publishing." | Allow save |
| No Pages | `card.pages` is empty | Warning | "Card has no pages. Add at least one page." | Allow save |

### 5.2 Agenda-Level Validation

| Rule | Condition | Error Type | Message | Action |
|------|-----------|------------|---------|--------|
| No Items | `agenda.items` is empty | Warning | "Agenda has no items. Add at least one topic." | Allow save |
| Item Title | `items[].titles.agenda_title` < 3 chars | Critical | "Item {index}: Title must be at least 3 characters." | Block save |
| Missing Target | `items[].target.page_id` or `url` is empty | Critical | "Item {index}: Please specify a target page or URL." | Block save |
| Invalid Page | `items[].target.page_id` doesn't exist | Warning | "Item {index}: Target page '{page_id}' not found." | Allow save |
| Invalid URL | `items[].target.url` is not valid URL | Critical | "Item {index}: Invalid URL format." | Block save |

### 5.3 Page-Level Validation

| Rule | Condition | Error Type | Message | Action |
|------|-----------|------------|---------|--------|
| Missing Title | `page.titles.page_header` < 3 chars | Critical | "Page title must be at least 3 characters." | Block save |
| Circular Parent | `page.parent` creates circular reference | Critical | "Circular parent reference detected. Choose a different parent." | Block save |
| Invalid Parent | `page.parent` doesn't exist | Warning | "Parent page '{parent}' not found." | Allow save |
| No Sections | `sections` is empty | Info | "Page has no content sections. Consider adding sections." | Allow save |

### 5.4 Section-Level Validation

Examples for common sections:

**Hero Section:**
- `heading` empty or < 3 chars → Critical: "Hero heading must be at least 3 characters."

**Feature Grid:**
- `features` empty → Critical: "Feature grid must have at least 1 feature."
- `features[i].name` empty → Critical: "Feature {i+1}: Name is required."
- `features[i].click_action.target` empty → Warning: "Feature {i+1}: No click action configured."

**Interactive Diagram:**
- `image` empty → Critical: "Please select an image for the diagram."
- `hotspots[i].x/y` out of bounds → Critical: "Hotspot {i+1}: Position is outside image bounds."
- `hotspots[i].click_action` empty → Critical: "Hotspot {i+1}: Click action is required."

### 5.5 Validation UI

**Inline Errors (Field-level):**
```
┌───────────────────────────────────────────────┐
│ Card Name *                                   │
│ [AB_________________________________]         │
│ ⚠ Name must be at least 3 characters         │
└───────────────────────────────────────────────┘
```

**Error Summary (Top of form):**
```
┌───────────────────────────────────────────────┐
│ ⚠ 3 errors must be fixed before saving       │
│ • Card name must be at least 3 characters     │
│ • Please select an icon                       │
│ • Agenda item 1: Title is required            │
│                                   [Fix Errors]│
└───────────────────────────────────────────────┘
```

**Save Dialog (When errors exist):**
```
┌───────────────────────────────────────────────┐
│ Cannot Save Card                         [×]  │
├───────────────────────────────────────────────┤
│ Please fix the following errors:              │
│                                               │
│ Critical Errors (2)                           │
│ • Card name must be at least 3 characters     │
│ • Agenda item 1: Title is required            │
│                                               │
│ Warnings (1)                                  │
│ • Card has no pages                           │
│                                               │
│          [Cancel]    [Go to First Error]      │
└───────────────────────────────────────────────┘
```

---

## 6. Implementation Phases

### Phase 1: Foundation (Week 1) - 20 hours

**Goal:** Set up architecture, state management, and basic UI shell

**Tasks:**

1. **EditorContext Setup** (4 hours)
   - [ ] Create EditorContext with initial state
   - [ ] Implement reducer with all actions
   - [ ] Add undo/redo logic
   - [ ] Write 15+ tests for state management
   - [ ] Test undo/redo with 50 steps

2. **File Writer** (3 hours)
   - [ ] Implement `writeCardDefinition()`
   - [ ] Implement `writeAgendaDefinition()`
   - [ ] Implement `writePage()`
   - [ ] Add File System Access API integration
   - [ ] Write 10+ tests

3. **Editor Shell UI** (6 hours)
   - [ ] Create EditorLayout component
   - [ ] Implement EditorHeader (nav bar)
   - [ ] Implement EditorSidebar (stage navigator)
   - [ ] Add Save Status Indicator
   - [ ] Add Undo/Redo buttons
   - [ ] Write 10+ tests
   - [ ] Accessibility audit

4. **Live Preview Integration** (4 hours)
   - [ ] Create PreviewPane component
   - [ ] Integrate existing CardRenderer
   - [ ] Add device mode selector (desktop/tablet/mobile)
   - [ ] Test preview updates
   - [ ] Write 8+ tests

5. **Auto-save & Dirty Tracking** (3 hours)
   - [ ] Implement debounced auto-save
   - [ ] Add dirty state tracking
   - [ ] Add "unsaved changes" warning on navigation
   - [ ] Write 8+ tests

**Acceptance Criteria:**
- [ ] Editor loads without errors
- [ ] State management working (tested)
- [ ] Undo/redo functional
- [ ] Live preview renders
- [ ] Auto-save triggers correctly
- [ ] All tests passing (50+)
- [ ] Zero accessibility violations

---

### Phase 2: Card & Agenda Forms (Week 2) - 18 hours

**Goal:** Implement Card Config and Agenda Builder

**Tasks:**

1. **CardConfigForm** (10 hours)
   - [ ] Implement all form fields (see 2.1)
   - [ ] Add field validation
   - [ ] Create IconPicker modal component
   - [ ] Create ColorThemePicker component
   - [ ] Implement metadata collapsible section
   - [ ] Add inline error display
   - [ ] Write 25+ tests
   - [ ] Accessibility audit

2. **AgendaBuilder** (8 hours)
   - [ ] Implement layout selector (grid/list/carousel)
   - [ ] Create agenda items list with drag-and-drop
   - [ ] Implement item editor drawer
   - [ ] Add click action selector
   - [ ] Add reorder functionality (drag + keyboard)
   - [ ] Write 20+ tests
   - [ ] Accessibility audit

**Acceptance Criteria:**
- [ ] All card fields editable
- [ ] Icon picker functional
- [ ] Agenda items can be added/removed/reordered
- [ ] Validation works and shows errors
- [ ] All tests passing (45+)
- [ ] WCAG 2.1 AA compliant

---

### Phase 3: Section Editors (Weeks 3-4) - 32 hours

**Goal:** Implement editors for all 31 section types

**Priority Tiers:**

**Tier 1: Essential (10 types, 12 hours)**
- [ ] Hero (1h)
- [ ] Text (1h)
- [ ] Image (1h)
- [ ] Feature Grid (2h)
- [ ] Clickable Cards (2h)
- [ ] Alert (1h)
- [ ] List (1h)
- [ ] Code Block (2h)
- [ ] Expandable Section (1h)

**Tier 2: Common (10 types, 10 hours)**
- [ ] Text with Links (1h)
- [ ] Image Clickable (1h)
- [ ] Video (1h)
- [ ] Comparison Grid (2h)
- [ ] Expandable Card (1h)
- [ ] Tabbed Content (2h)
- [ ] Steps (1h)
- [ ] Key-Value Pairs (1h)

**Tier 3: Advanced (11 types, 10 hours)**
- [ ] Interactive Diagram (4h - most complex)
- [ ] Timeline (1h)
- [ ] Quote (0.5h)
- [ ] Divider (0.5h)
- [ ] Stats (1h)
- [ ] Table (1h)
- [ ] Embed (0.5h)
- [ ] Download (1h)
- [ ] Gallery (1h)
- [ ] Card List (1h)
- [ ] Progress (1h)
- [ ] Tags (0.5h)
- [ ] Accordion (1h)
- [ ] Loading (0.5h)

**Per Section Tasks:**
1. Create section editor component
2. Implement all field inputs
3. Add validation
4. Write 10-15 tests
5. Accessibility check

**Acceptance Criteria:**
- [ ] All 31 section editors implemented
- [ ] All tests passing (300+)
- [ ] All editors keyboard accessible
- [ ] All editors WCAG compliant

---

### Phase 4: Polish & Features (Week 5) - 10 hours

**Goal:** Media Manager, shortcuts, help, final polish

**Tasks:**

1. **Media Manager** (4 hours)
   - [ ] Implement media library grid
   - [ ] Add upload zone (drag-and-drop)
   - [ ] Add basic image editor (crop, resize)
   - [ ] Add alt-text editor
   - [ ] Write 10+ tests

2. **Keyboard Shortcuts** (2 hours)
   - [ ] Implement global shortcuts (Ctrl+S, Ctrl+Z, etc.)
   - [ ] Add shortcuts cheatsheet modal
   - [ ] Test all shortcuts

3. **Help & Documentation** (2 hours)
   - [ ] Add contextual help tooltips
   - [ ] Create getting started guide (in-app)
   - [ ] Add example templates

4. **Final Polish** (2 hours)
   - [ ] Performance optimization
   - [ ] Dark mode refinement
   - [ ] Responsive layout fixes
   - [ ] Final accessibility audit

**Acceptance Criteria:**
- [ ] Media Manager functional
- [ ] All shortcuts work
- [ ] Help available
- [ ] Performance targets met
- [ ] Zero accessibility violations

---

## 7. Component API Reference

### 7.1 useEditor Hook

```typescript
const {
  // State
  state,
  dispatch,

  // Card operations
  setCardData,
  createNewCard,
  loadCard,
  saveCard,

  // Agenda operations
  setAgendaData,
  addAgendaItem,
  removeAgendaItem,
  reorderAgendaItems,

  // Page operations
  createPage,
  deletePage,
  updatePage,
  setActivePage,

  // Section operations
  addSection,
  updateSection,
  deleteSection,
  reorderSections,
  duplicateSection,

  // History
  undo,
  redo,
  createSnapshot,

  // Validation
  validate,
  clearValidation,

  // UI
  setPreviewMode,
  toggleSectionGallery,
  toggleMediaManager,
} = useEditor();
```

### 7.2 Section Editor Props

```typescript
interface SectionEditorProps<T extends Section> {
  // Data
  section: T;
  index: number;

  // Callbacks
  onChange: (data: Partial<T>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;

  // State
  isActive: boolean;
  hasErrors: boolean;
  errors: ValidationError[];
}

// Usage example:
<HeroSectionEditor
  section={heroSection}
  index={0}
  onChange={(data) => updateSection(0, data)}
  onDelete={() => deleteSection(0)}
  // ... other props
/>
```

---

## 8. Performance Optimization Strategy

### 8.1 Critical Performance Paths

1. **Initial Load** (< 500ms target)
   - Lazy load section editors (code-split)
   - Use React.lazy() for heavy components
   - Preload only essentials

2. **Live Preview Update** (< 100ms target)
   - Debounce state updates (100ms)
   - Memoize CardRenderer props
   - Use React.memo for section components

3. **Auto-save** (< 500ms target)
   - Debounce file writes (5 seconds)
   - Use worker for YAML generation
   - Batch multiple writes

4. **Section List Rendering** (60fps)
   - Virtual scrolling for > 20 sections
   - Use `react-window` or `react-virtualized`
   - Lazy render section editors

### 8.2 Optimization Techniques

**Memoization:**
```typescript
const MemoizedSectionEditor = React.memo(SectionEditor, (prev, next) => {
  return prev.section === next.section && prev.isActive === next.isActive;
});
```

**Lazy Loading:**
```typescript
const InteractiveDiagramEditor = React.lazy(() =>
  import('./sections/InteractiveDiagramEditor')
);

// In SectionRenderer:
<Suspense fallback={<LoadingSkeleton />}>
  {type === 'interactive_diagram' && <InteractiveDiagramEditor {...props} />}
</Suspense>
```

**Debouncing:**
```typescript
const debouncedUpdate = useMemo(
  () => debounce((data: Partial<Section>) => {
    updateSection(index, data);
  }, 100),
  [index]
);
```

---

## Next Steps

1. ✅ Read this specification thoroughly
2. ✅ Review with stakeholders
3. ✅ Approve Phase 1 tasks
4. → **Begin Phase 1 implementation** (TDD approach!)
5. → Write tests BEFORE implementing each component
6. → Daily progress review
7. → Phase 1 demo after Week 1

---

**Document Version:** 2.0
**Last Updated:** January 3, 2026
**Status:** Ready for Implementation
**Estimated Total Effort:** 80 hours (4 weeks, 2 developers)
**First Milestone:** Phase 1 complete in 1 week
