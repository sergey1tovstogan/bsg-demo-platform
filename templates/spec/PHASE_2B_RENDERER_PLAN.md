# Phase 2B: React Renderer Implementation - Detailed Plan

**Project:** Content Template System - Phase 2B
**Date:** December 17, 2024
**Status:** READY FOR IMPLEMENTATION
**Prerequisite:** Phase 2A Complete ✅ (200/200 tests passing)
**Quality Standard:** RIGHT THE FIRST TIME - Test-first approach MANDATORY

---

## 🎯 Executive Summary

Phase 2B transforms the **parser infrastructure** from Phase 2A into **live, interactive React components**. We will create 31 section type components, complete navigation system, popup management, and animation framework - all following the **UNIFIED_LAYOUT_SPECIFICATION** and maintaining strict test-first development.

### Key Objectives

1. ✅ Create 31 React components for all section types
2. ✅ Implement navigation system (breadcrumbs, page tree, tab bar)
3. ✅ Build popup/modal system
4. ✅ Implement animation framework
5. ✅ Create custom hooks for template management
6. ✅ Apply Temenos brand styling throughout
7. ✅ Maintain 100% test coverage
8. ✅ Ensure WCAG 2.1 AA accessibility compliance

**Estimated Effort:** 3-4 hours (with comprehensive testing)
**Quality Level:** HIGHEST - Right the first time

---

## 📚 Table of Contents

1. [**STEP-BY-STEP IMPLEMENTATION GUIDE**](#step-by-step-implementation-guide) ⭐ **START HERE**
2. [Design Principles](#design-principles)
3. [Styling Standards](#styling-standards)
4. [Architecture Overview](#architecture-overview)
5. [Implementation Phases](#implementation-phases)
6. [Component Specifications](#component-specifications)
7. [Testing Strategy](#testing-strategy)
8. [Success Criteria](#success-criteria)
9. [Deliverables](#deliverables)

---

## ⭐ STEP-BY-STEP IMPLEMENTATION GUIDE

**READ THIS FIRST:** This guide breaks Phase 2B into small, verifiable steps. **DO NOT skip steps. DO NOT move forward until current step is 100% complete.**

### 🎯 Implementation Philosophy

1. **Small Steps** - Each step is 15-30 minutes max
2. **Test First** - Write test before code (TDD)
3. **Verify Immediately** - Test and check after each step
4. **Commit Often** - Commit after each completed step
5. **No Batch Testing** - Test incrementally, not at the end

### ⚠️ MANDATORY CHECKPOINT SYSTEM

After EACH step, you must complete this checklist:

```
✅ CHECKPOINT: Step [X] Complete

- [ ] Tests written FIRST (before code) ✅
- [ ] Tests run and initially FAIL (red) ✅
- [ ] Code implemented ✅
- [ ] Tests run and now PASS (green) ✅
- [ ] Manual verification done ✅
- [ ] Dark mode checked ✅
- [ ] Accessibility checked ✅
- [ ] No console errors ✅
- [ ] Git commit created ✅
- [ ] Step documented in progress file ✅

If ANY checkbox is unchecked, DO NOT proceed to next step.
```

---

## 📋 STEP-BY-STEP IMPLEMENTATION SEQUENCE

### SESSION 1: Foundation Setup (45 min)

#### STEP 1: Install Dependencies (5 min)

**What:** Install required npm packages

**Commands:**
```bash
cd frontend
npm install --save react-markdown rehype-sanitize lucide-react
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest jsdom
```

**Verification:**
- [ ] Check `package.json` - all packages listed
- [ ] Run `npm list react-markdown` - shows version
- [ ] Run `npm list @testing-library/react` - shows version
- [ ] No errors in terminal

**Commit:**
```bash
git add package.json package-lock.json
git commit -m "Add dependencies for Phase 2B renderer components"
```

**🚦 CHECKPOINT:** All dependencies installed, no errors

---

#### STEP 2: Create Directory Structure (5 min)

**What:** Create all necessary directories

**Commands:**
```bash
cd frontend/src

# Main renderer directories
mkdir -p components/template-renderer
mkdir -p components/template-sections/content
mkdir -p components/template-sections/navigation
mkdir -p components/template-sections/data
mkdir -p components/template-sections/expandable
mkdir -p components/template-sections/special
mkdir -p components/template-navigation

# Hook directory (may exist)
mkdir -p hooks

# Test directories
mkdir -p components/template-renderer/__tests__
mkdir -p components/template-sections/__tests__
mkdir -p components/template-navigation/__tests__
```

**Verification:**
- [ ] Run `tree components/template-renderer` - shows structure
- [ ] Run `tree components/template-sections` - shows all 5 subdirs
- [ ] Run `tree components/template-navigation` - directory exists
- [ ] All directories created successfully

**Commit:**
```bash
git add components/
git commit -m "Create directory structure for Phase 2B components"
```

**🚦 CHECKPOINT:** All directories created

---

#### STEP 3: Create useClickAction Hook (Test First) (15 min)

**What:** Custom hook for handling click actions

**Step 3a:** Write test FIRST (5 min)

**File:** `frontend/src/hooks/useClickAction.test.ts`

```typescript
import { renderHook } from '@testing-library/react';
import { useClickAction } from './useClickAction';
import { ClickAction } from '@/lib/template-types';

// Mock useNavigation
jest.mock('@/components/template-navigation/NavigationProvider', () => ({
  useNavigation: () => ({
    navigateToPage: jest.fn(),
    showPopup: jest.fn(),
  }),
}));

describe('useClickAction', () => {
  it('should return a function', () => {
    const action: ClickAction = {
      type: 'navigate_to_subpage',
      target: 'page-1'
    };
    const { result } = renderHook(() => useClickAction(action));
    expect(typeof result.current).toBe('function');
  });

  it('should handle navigate_to_subpage action', () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('@/components/template-navigation/NavigationProvider'), 'useNavigation').mockReturnValue({
      navigateToPage: mockNavigate,
      showPopup: jest.fn(),
    });

    const action: ClickAction = {
      type: 'navigate_to_subpage',
      target: 'page-1'
    };

    const { result } = renderHook(() => useClickAction(action));
    result.current();

    expect(mockNavigate).toHaveBeenCalledWith('page-1');
  });

  it('should handle show_popup action', () => {
    const mockShowPopup = jest.fn();
    jest.spyOn(require('@/components/template-navigation/NavigationProvider'), 'useNavigation').mockReturnValue({
      navigateToPage: jest.fn(),
      showPopup: mockShowPopup,
    });

    const action: ClickAction = {
      type: 'show_popup',
      popup_id: 'popup-1'
    };

    const { result } = renderHook(() => useClickAction(action));
    result.current();

    expect(mockShowPopup).toHaveBeenCalledWith('popup-1');
  });

  it('should handle external_link action in new tab', () => {
    const mockOpen = jest.fn();
    window.open = mockOpen;

    const action: ClickAction = {
      type: 'external_link',
      target: 'https://example.com',
      open_in_new_tab: true
    };

    const { result } = renderHook(() => useClickAction(action));
    result.current();

    expect(mockOpen).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
  });

  it('should do nothing when action is undefined', () => {
    const { result } = renderHook(() => useClickAction(undefined));
    expect(() => result.current()).not.toThrow();
  });
});
```

**Step 3b:** Run test - should FAIL (2 min)

```bash
npm test -- hooks/useClickAction.test.ts --run
```

**Expected:** Tests FAIL (red) - file doesn't exist yet

**Step 3c:** Implement hook (5 min)

**File:** `frontend/src/hooks/useClickAction.ts`

```typescript
import { useCallback } from 'react';
import { ClickAction } from '@/lib/template-types';
import { useNavigation } from '@/components/template-navigation/NavigationProvider';

export function useClickAction(action?: ClickAction) {
  const { navigateToPage, showPopup } = useNavigation();

  return useCallback(() => {
    if (!action) return;

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
            window.open(action.target, '_blank', 'noopener,noreferrer');
          } else {
            window.location.href = action.target;
          }
        }
        break;
    }
  }, [action, navigateToPage, showPopup]);
}
```

**Step 3d:** Run test - should PASS (2 min)

```bash
npm test -- hooks/useClickAction.test.ts --run
```

**Expected:** All tests PASS (green)

**Step 3e:** Verification Checklist

- [ ] All 5 tests passing ✅
- [ ] No TypeScript errors (`npm run build`) ✅
- [ ] Hook exported from types ✅
- [ ] No console warnings ✅

**Commit:**
```bash
git add hooks/useClickAction.ts hooks/useClickAction.test.ts
git commit -m "Add useClickAction hook with full test coverage"
```

**🚦 CHECKPOINT:** useClickAction hook complete with 5/5 tests passing

---

#### STEP 4: Create NavigationProvider (Test First) (20 min)

**What:** Context provider for navigation state

**Step 4a:** Write test FIRST (8 min)

**File:** `frontend/src/components/template-navigation/NavigationProvider.test.tsx`

```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NavigationProvider, useNavigation } from './NavigationProvider';
import { CardDefinition } from '@/lib/template-types';

const mockCard: CardDefinition = {
  id: 'test-card',
  name: 'Test Card',
  category: 'test',
  color_theme: 'blue',
  icon: 'Box',
  agenda: { file: 'agenda.md' },
  navigation: {
    type: 'hierarchical',
    show_breadcrumbs: true,
    show_page_tree: true,
    allow_back_to_agenda: true
  },
  pages: [],
  settings: {
    default_animation: 'fade-in',
    transition_speed: '300ms',
    max_depth: 5
  }
};

function TestComponent() {
  const { currentPage, navigateToPage, backToAgenda, breadcrumbs } = useNavigation();
  return (
    <div>
      <div data-testid="current-page">{currentPage || 'agenda'}</div>
      <div data-testid="breadcrumbs">{breadcrumbs.length}</div>
      <button onClick={() => navigateToPage('page-1')}>Navigate</button>
      <button onClick={backToAgenda}>Back to Agenda</button>
    </div>
  );
}

describe('NavigationProvider', () => {
  it('should render children', () => {
    render(
      <NavigationProvider card={mockCard}>
        <div>Test Content</div>
      </NavigationProvider>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should provide navigation context', () => {
    render(
      <NavigationProvider card={mockCard}>
        <TestComponent />
      </NavigationProvider>
    );
    expect(screen.getByTestId('current-page')).toHaveTextContent('agenda');
  });

  it('should navigate to page', () => {
    render(
      <NavigationProvider card={mockCard}>
        <TestComponent />
      </NavigationProvider>
    );

    fireEvent.click(screen.getByText('Navigate'));
    expect(screen.getByTestId('current-page')).toHaveTextContent('page-1');
  });

  it('should return to agenda', () => {
    render(
      <NavigationProvider card={mockCard}>
        <TestComponent />
      </NavigationProvider>
    );

    fireEvent.click(screen.getByText('Navigate'));
    fireEvent.click(screen.getByText('Back to Agenda'));
    expect(screen.getByTestId('current-page')).toHaveTextContent('agenda');
  });

  it('should throw error when useNavigation used outside provider', () => {
    // Suppress console.error for this test
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useNavigation must be used within NavigationProvider');

    spy.mockRestore();
  });
});
```

**Step 4b:** Run test - should FAIL (2 min)

```bash
npm test -- components/template-navigation/NavigationProvider.test.tsx --run
```

**Expected:** Tests FAIL (red)

**Step 4c:** Implement NavigationProvider (8 min)

**File:** `frontend/src/components/template-navigation/NavigationProvider.tsx`

```typescript
import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { CardDefinition, PageDefinition } from '@/lib/template-types';
import { NavigationBuilder } from '@/lib/template-parser/navigation-builder';
import { FileLoader } from '@/lib/template-parser/file-loader';

interface NavigationContextValue {
  card: CardDefinition;
  currentPage: string | null;
  hierarchy: any;
  breadcrumbs: any[];
  popupStack: string[];
  navigateToPage: (pageId: string) => void;
  navigateBack: () => void;
  backToAgenda: () => void;
  showPopup: (popupId: string) => void;
  closePopup: () => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({
  card,
  children
}: {
  card: CardDefinition;
  children: React.ReactNode;
}) {
  const [currentPage, setCurrentPage] = useState<string | null>(null);
  const [hierarchy, setHierarchy] = useState<any>(null);
  const [popupStack, setPopupStack] = useState<string[]>([]);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);

  // Build hierarchy on mount
  useEffect(() => {
    const builder = new NavigationBuilder([]);
    const loader = new FileLoader();

    // Load all pages and build hierarchy
    if (card.pages.length > 0) {
      Promise.all(
        card.pages.map(pageRef => loader.loadPage(pageRef.file))
      ).then(pages => {
        const pageMap = new Map(pages.map((p: any) => [p.id, p]));
        const nav = builder.buildHierarchy(pageMap);
        setHierarchy(nav);
      }).catch(err => {
        console.error('Failed to build navigation hierarchy:', err);
      });
    }
  }, [card]);

  const navigateToPage = (pageId: string) => {
    if (currentPage) {
      setNavigationHistory(prev => [...prev, currentPage]);
    }
    setCurrentPage(pageId);
  };

  const navigateBack = () => {
    if (navigationHistory.length > 0) {
      const prev = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(h => h.slice(0, -1));
      setCurrentPage(prev);
    }
  };

  const backToAgenda = () => {
    setCurrentPage(null);
    setNavigationHistory([]);
  };

  const showPopup = (popupId: string) => {
    setPopupStack(prev => [...prev, popupId]);
  };

  const closePopup = () => {
    setPopupStack(prev => prev.slice(0, -1));
  };

  const breadcrumbs = useMemo(() => {
    if (!currentPage || !hierarchy) return [];
    const builder = new NavigationBuilder([]);
    return builder.buildBreadcrumbs(currentPage, hierarchy);
  }, [currentPage, hierarchy]);

  const value: NavigationContextValue = {
    card,
    currentPage,
    hierarchy,
    breadcrumbs,
    popupStack,
    navigateToPage,
    navigateBack,
    backToAgenda,
    showPopup,
    closePopup,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}
```

**Step 4d:** Run test - should PASS (2 min)

```bash
npm test -- components/template-navigation/NavigationProvider.test.tsx --run
```

**Expected:** All 5 tests PASS (green)

**Step 4e:** Verification Checklist

- [ ] All 5 tests passing ✅
- [ ] No TypeScript errors ✅
- [ ] NavigationProvider exports correctly ✅
- [ ] useNavigation hook works ✅

**Commit:**
```bash
git add components/template-navigation/NavigationProvider.tsx components/template-navigation/NavigationProvider.test.tsx
git commit -m "Add NavigationProvider with context and state management

- Implements navigation state (currentPage, hierarchy, breadcrumbs)
- Provides navigation functions (navigateToPage, backToAgenda, etc.)
- Includes useNavigation hook with error handling
- Full test coverage (5/5 tests passing)"
```

**🚦 CHECKPOINT:** NavigationProvider complete with 5/5 tests passing

---

### SESSION 2: First Section Components (60 min)

#### STEP 5: Create HeroSection Component (Test First) (15 min)

**What:** First section component - Hero with heading and subtitle

**Step 5a:** Write test FIRST (5 min)

**File:** `frontend/src/components/template-sections/content/HeroSection.test.tsx`

```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import { HeroSection } from './HeroSection';
import { HeroSection as HeroSectionType } from '@/lib/template-types';

describe('HeroSection', () => {
  it('should render heading', () => {
    const props: HeroSectionType = {
      type: 'hero',
      heading: 'Test Heading'
    };
    render(<HeroSection {...props} />);
    expect(screen.getByText('Test Heading')).toBeInTheDocument();
  });

  it('should render heading as H1', () => {
    const props: HeroSectionType = {
      type: 'hero',
      heading: 'Test Heading'
    };
    render(<HeroSection {...props} />);
    const heading = screen.getByText('Test Heading');
    expect(heading.tagName).toBe('H1');
  });

  it('should apply correct typography classes', () => {
    const props: HeroSectionType = {
      type: 'hero',
      heading: 'Test'
    };
    render(<HeroSection {...props} />);
    const heading = screen.getByText('Test');
    expect(heading).toHaveClass('text-3xl', 'font-bold', 'tracking-tight');
  });

  it('should render optional subtitle', () => {
    const props: HeroSectionType = {
      type: 'hero',
      heading: 'Test',
      subtitle: 'Test Subtitle'
    };
    render(<HeroSection {...props} />);
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('should not render subtitle when not provided', () => {
    const props: HeroSectionType = {
      type: 'hero',
      heading: 'Test'
    };
    render(<HeroSection {...props} />);
    expect(screen.queryByText('Test Subtitle')).not.toBeInTheDocument();
  });

  it('should apply center alignment', () => {
    const props: HeroSectionType = {
      type: 'hero',
      heading: 'Test',
      align: 'center'
    };
    const { container } = render(<HeroSection {...props} />);
    expect(container.firstChild).toHaveClass('text-center');
  });

  it('should apply right alignment', () => {
    const props: HeroSectionType = {
      type: 'hero',
      heading: 'Test',
      align: 'right'
    };
    const { container } = render(<HeroSection {...props} />);
    expect(container.firstChild).toHaveClass('text-right');
  });

  it('should default to left alignment', () => {
    const props: HeroSectionType = {
      type: 'hero',
      heading: 'Test'
    };
    const { container } = render(<HeroSection {...props} />);
    expect(container.firstChild).toHaveClass('text-left');
  });

  it('should have semantic banner role', () => {
    const props: HeroSectionType = {
      type: 'hero',
      heading: 'Test'
    };
    const { container } = render(<HeroSection {...props} />);
    expect(container.firstChild).toHaveAttribute('role', 'banner');
  });
});
```

**Step 5b:** Run test - should FAIL (2 min)

```bash
npm test -- components/template-sections/content/HeroSection.test.tsx --run
```

**Expected:** Tests FAIL (red)

**Step 5c:** Implement HeroSection (5 min)

**File:** `frontend/src/components/template-sections/content/HeroSection.tsx`

```typescript
import React from 'react';
import { HeroSection as HeroSectionType } from '@/lib/template-types';

export function HeroSection({
  heading,
  subtitle,
  align = 'left'
}: HeroSectionType) {
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  return (
    <div
      className={`hero-section space-y-3 ${alignmentClass}`}
      role="banner"
    >
      {/* H1 styling from UNIFIED_LAYOUT_SPECIFICATION Section 4.2 */}
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
        {heading}
      </h1>

      {subtitle && (
        /* Body Large from spec */
        <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
          {subtitle}
        </p>
      )}
    </div>
  );
}
```

**Step 5d:** Run test - should PASS (2 min)

```bash
npm test -- components/template-sections/content/HeroSection.test.tsx --run
```

**Expected:** All 9 tests PASS (green)

**Step 5e:** Manual Verification (3 min)

Create a test page to verify styling:

**File:** `frontend/src/components/template-sections/content/HeroSection.stories.tsx` (optional, for Storybook)

OR

Start dev server and check in browser:
```bash
npm run dev
```

**Visual Checks:**
- [ ] Heading is large and bold (32px, 700 weight) ✅
- [ ] Subtitle is smaller and lighter ✅
- [ ] Center alignment works ✅
- [ ] Dark mode colors correct ✅
- [ ] Spacing between heading and subtitle is 12px ✅

**Step 5f:** Verification Checklist

- [ ] All 9 tests passing ✅
- [ ] No TypeScript errors ✅
- [ ] Typography matches UNIFIED_LAYOUT_SPECIFICATION ✅
- [ ] Dark mode works ✅
- [ ] Semantic HTML (H1, role) ✅
- [ ] Visual verification done ✅

**Commit:**
```bash
git add components/template-sections/content/HeroSection.tsx components/template-sections/content/HeroSection.test.tsx
git commit -m "Add HeroSection component with UNIFIED_LAYOUT_SPECIFICATION styling

- Implements hero section with heading and optional subtitle
- Follows typography standards (H1: text-3xl font-bold tracking-tight)
- Supports left/center/right alignment
- Full dark mode support
- Semantic HTML with banner role
- Test coverage: 9/9 tests passing"
```

**🚦 CHECKPOINT:** HeroSection complete with 9/9 tests passing

---

#### STEP 6: Create TextSection Component (Test First) (15 min)

**What:** Text section with Markdown support

[Similar structure to Step 5 - test first, implement, verify, commit]

**Step 6a:** Write test FIRST
**Step 6b:** Run test - should FAIL
**Step 6c:** Implement TextSection
**Step 6d:** Run test - should PASS
**Step 6e:** Manual verification
**Step 6f:** Verification checklist
**Step 6g:** Git commit

**🚦 CHECKPOINT:** TextSection complete with tests passing

---

#### STEP 7: Create AlertSection Component (Test First) (15 min)

**What:** Alert component with 4 types (info/success/warning/error)

[Similar structure - test first, implement, verify, commit]

**🚦 CHECKPOINT:** AlertSection complete with tests passing

---

#### STEP 8: Create SectionRenderer (15 min)

**What:** Router component that renders correct section based on type

**Note:** Initially implement with just the 3 components created so far (Hero, Text, Alert). Will add others incrementally.

**🚦 CHECKPOINT:** SectionRenderer working with 3 section types

---

### SESSION 3: Integration Testing (30 min)

#### STEP 9: Create Simple Integration Test (15 min)

**What:** Test that SectionRenderer correctly routes to components

**File:** `frontend/src/components/template-renderer/integration.test.tsx`

```typescript
describe('Section Rendering Integration', () => {
  it('should render HeroSection for hero type', () => {
    const section = { type: 'hero', heading: 'Test' };
    render(<SectionRenderer section={section} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should render TextSection for text type', () => {
    const section = { type: 'text', content: '**Bold**' };
    render(<SectionRenderer section={section} />);
    expect(screen.getByText('Bold')).toBeInTheDocument();
  });

  it('should render AlertSection for alert type', () => {
    const section = { type: 'alert', alert_type: 'info', content: 'Info message' };
    render(<SectionRenderer section={section} />);
    expect(screen.getByText('Info message')).toBeInTheDocument();
  });
});
```

**🚦 CHECKPOINT:** Integration tests passing

---

#### STEP 10: Progress Review & Documentation (15 min)

**What:** Document progress and plan next steps

**File:** `templates/spec/PHASE_2B_PROGRESS.md`

```markdown
# Phase 2B Progress Report

## Session 1: Foundation Setup ✅
- Dependencies installed
- Directory structure created
- useClickAction hook complete (5/5 tests)
- NavigationProvider complete (5/5 tests)

## Session 2: First Components ✅
- HeroSection complete (9/9 tests)
- TextSection complete (X/X tests)
- AlertSection complete (X/X tests)
- SectionRenderer (3 types working)

## Session 3: Integration ✅
- Integration tests passing (3/3)

## Total Progress
- Hooks: 1/5 (20%)
- Sections: 3/31 (10%)
- Navigation: 1/6 (17%)
- Tests: 22/~200 (11%)

## Next Steps
- Continue with remaining 28 section components
- Follow same pattern: test-first, implement, verify, commit
```

**Commit:**
```bash
git add templates/spec/PHASE_2B_PROGRESS.md
git commit -m "Document Phase 2B progress after 3 sessions

- Foundation complete (dependencies, structure, core hooks)
- 3 section components implemented with full tests
- Integration tests passing
- Ready to continue with remaining 28 sections"
```

**🚦 CHECKPOINT:** Progress documented, ready for next session

---

## 📋 REMAINING STEPS PATTERN

For EACH of the remaining 28 section components, follow this exact pattern:

### STEP TEMPLATE: Create [ComponentName] (15 min)

**Step Xa:** Write test FIRST (5 min)
- Create `[ComponentName].test.tsx`
- Write 5-10 comprehensive tests
- Cover all props, edge cases, accessibility
- Run test - expect FAIL (red)

**Step Xb:** Implement component (8 min)
- Create `[ComponentName].tsx`
- Follow UNIFIED_LAYOUT_SPECIFICATION styling
- Use Tailwind classes (no inline styles)
- Support dark mode
- Add ARIA labels and semantic HTML
- Run test - expect PASS (green)

**Step Xc:** Manual verification (3 min)
- Check styling in browser
- Toggle dark mode
- Test keyboard navigation
- Verify against spec

**Step Xd:** Verification checklist
- [ ] All tests passing ✅
- [ ] No TypeScript errors ✅
- [ ] Styling matches spec ✅
- [ ] Dark mode works ✅
- [ ] Accessibility verified ✅
- [ ] Visual check done ✅

**Step Xe:** Git commit
```bash
git add components/template-sections/[category]/[ComponentName].tsx
git add components/template-sections/[category]/[ComponentName].test.tsx
git commit -m "Add [ComponentName] component with full test coverage

- Brief description of component
- Styling matches UNIFIED_LAYOUT_SPECIFICATION
- Test coverage: X/X tests passing"
```

**Step Xf:** Update SectionRenderer
- Add import for new component
- Add case to switch statement
- Run integration tests
- Commit SectionRenderer update

**🚦 CHECKPOINT:** [ComponentName] complete

---

## 🚨 WHEN TO STOP AND ASK

**Stop implementation and ask the user if:**

1. **Tests failing repeatedly** (>3 attempts)
   - Ask: "Tests for [Component] are failing. Error: [error]. Should I continue or debug?"

2. **Styling uncertainty**
   - Ask: "The spec doesn't clearly define [aspect]. Should I use [option A] or [option B]?"

3. **TypeScript errors**
   - Ask: "Getting TypeScript error: [error]. Need help resolving this."

4. **Time exceeding estimate**
   - Ask: "Step is taking longer than expected. Continue or take break?"

5. **Missing dependencies**
   - Ask: "Need [package] for [feature]. OK to install?"

**DO NOT:**
- Skip tests to "speed up"
- Guess at styling when spec is clear
- Move forward with failing tests
- Commit broken code

---

## 📊 PROGRESS TRACKING

After EVERY 5 components completed, update progress:

```bash
echo "Completed: [Component1], [Component2], [Component3], [Component4], [Component5]
Tests passing: X/200
Coverage: Y%
Time elapsed: Z hours
Next: [Component6]" >> templates/spec/PHASE_2B_DAILY_LOG.md

git add templates/spec/PHASE_2B_DAILY_LOG.md
git commit -m "Update progress: 5 more components complete"
```

---

## ✅ FINAL VERIFICATION (Before declaring Phase 2B complete)

**Run ALL verification steps:**

```bash
# 1. All tests must pass
npm test -- --run
# Expected: 200+ tests passing, 0 failures

# 2. TypeScript build must succeed
npm run build
# Expected: Build successful, 0 errors

# 3. Lint checks
npm run lint
# Expected: 0 errors, 0 warnings

# 4. Check test coverage
npm test -- --coverage
# Expected: >90% coverage on all files

# 5. Visual verification in browser
npm run dev
# Check: All components render correctly

# 6. Dark mode verification
# Toggle dark mode in browser
# Check: All components look correct in dark mode

# 7. Accessibility audit
npm run a11y-audit (if available)
# Check: No WCAG violations

# 8. Performance check
# Open DevTools > Performance
# Record while navigating
# Check: No performance issues, 60fps animations
```

**Final Checklist:**

- [ ] All 31 section components implemented ✅
- [ ] All tests passing (>200 tests) ✅
- [ ] No TypeScript errors ✅
- [ ] Test coverage >90% ✅
- [ ] All visual checks done ✅
- [ ] Dark mode working ✅
- [ ] Accessibility verified ✅
- [ ] Performance acceptable ✅
- [ ] All components use UNIFIED_LAYOUT_SPECIFICATION ✅
- [ ] All commits have meaningful messages ✅
- [ ] Progress documented ✅
- [ ] Ready for Phase 3 ✅

**ONLY when all checkboxes are checked, Phase 2B is complete.**

---

## Design Principles

### Core Principles from Phase 1

#### 1. Separation of Concerns
```
Content (MD Files)              Layout (Unified Spec)
├─ What to show                 ├─ Temenos brand colors
├─ Text and images              ├─ Inter typography
├─ Interaction logic            ├─ 4px baseline spacing
├─ Navigation flow              ├─ Component styling
└─ Popup triggers               └─ Animation curves
```

**CRITICAL:** React components ONLY handle rendering. They NEVER define:
- Colors (use CSS variables from spec)
- Font sizes (use Tailwind classes from spec)
- Spacing values (use 4px baseline grid)
- Animations (use predefined animation classes)

#### 2. PowerPoint-Like Simplicity
- **Content creators** fill in YAML templates
- **React components** render based on parsed data
- **UNIFIED_LAYOUT_SPECIFICATION** provides ALL styling
- **NO custom styling** in content files

#### 3. Content Creator Focus
Users specify:
- ✅ WHAT information to show
- ✅ HOW users navigate
- ✅ WHAT happens on click
- ❌ NOT: colors, fonts, spacing

#### 4. Test-First Development (TDD)
- Write test FIRST for each component
- Implement minimal code to pass test
- Refactor while keeping tests green
- NO code without tests

---

## Styling Standards

### Temenos Brand Colors

From UNIFIED_LAYOUT_SPECIFICATION.md:

#### Primary Brand Colors
```typescript
const BRAND_COLORS = {
  // Primary Interactive
  primary: '#003366',        // Temenos Navy
  primaryHover: '#004080',   // Lighter navy
  primaryActive: '#002244',  // Darker navy

  // Secondary Interactive
  secondary: '#0066CC',      // Temenos Blue
  secondaryHover: '#0052A3',

  // Accent
  accent: '#00A3E0',         // Temenos Cyan
  accentHover: '#008FC7',

  // Functional
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#60A5FA',
}
```

#### Usage Rules
- **Primary buttons:** Temenos Navy background (#003366)
- **Active tabs:** Temenos Navy background + Temenos Cyan border bottom
- **Links:** Temenos Blue (#0066CC), hover to Temenos Cyan (#00A3E0)
- **Status indicators:** Functional colors (success/warning/error/info)

### Typography Standards

From UNIFIED_LAYOUT_SPECIFICATION.md:

```typescript
const TYPOGRAPHY = {
  // Font Family
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',

  // Headings
  h1: {
    fontSize: '2rem',      // 32px
    fontWeight: 700,       // Bold
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
    className: 'text-3xl font-bold tracking-tight'
  },

  h2: {
    fontSize: '1.5rem',    // 24px
    fontWeight: 600,       // Semi-Bold
    lineHeight: 1.3,
    className: 'text-2xl font-semibold'
  },

  h3: {
    fontSize: '1.25rem',   // 20px
    fontWeight: 600,
    lineHeight: 1.4,
    className: 'text-xl font-semibold'
  },

  h4: {
    fontSize: '1.125rem',  // 18px
    fontWeight: 600,
    lineHeight: 1.5,
    className: 'text-lg font-semibold'
  },

  // Body Text
  bodyLarge: {
    fontSize: '1.125rem',  // 18px
    fontWeight: 400,
    lineHeight: 1.7,
    className: 'text-lg leading-relaxed'
  },

  bodyRegular: {
    fontSize: '1rem',      // 16px
    fontWeight: 400,
    lineHeight: 1.6,
    className: 'text-base leading-normal'
  },

  bodySmall: {
    fontSize: '0.875rem',  // 14px
    fontWeight: 400,
    lineHeight: 1.5,
    className: 'text-sm'
  },

  // Special
  code: {
    fontFamily: 'Fira Code, Monaco, monospace',
    fontSize: '0.875rem',
    className: 'font-mono text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded'
  }
}
```

### Spacing Standards

**4px Baseline Grid:**
```typescript
const SPACING = {
  xs: '0.25rem',   // 4px   - Tight spacing
  sm: '0.5rem',    // 8px   - Small gaps
  md: '1rem',      // 16px  - Default spacing
  lg: '1.5rem',    // 24px  - Section spacing
  xl: '2rem',      // 32px  - Major breaks
  '2xl': '3rem',   // 48px  - Page-level spacing
  '3xl': '4rem',   // 64px  - Hero sections
}

// Tailwind Classes
// p-1 = 4px, p-2 = 8px, p-4 = 16px, p-6 = 24px, p-8 = 32px
```

### Component Styling Standards

#### Buttons (Primary)
```css
/* From UNIFIED_LAYOUT_SPECIFICATION.md Section 6.1 */
.btn-primary {
  background: #003366;           /* Temenos Navy */
  color: white;
  font-size: 16px;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: all 200ms;
}

.btn-primary:hover {
  background: #004080;
  box-shadow: 0 10px 15px rgba(0,0,0,0.1);
  transform: translateY(-1px);
}
```

**Tailwind Class:**
```jsx
className="bg-[#003366] text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-[#004080] hover:shadow-lg hover:-translate-y-0.5 active:bg-[#002244] active:shadow-sm transition-all duration-200"
```

#### Tabs (Active)
```css
/* From UNIFIED_LAYOUT_SPECIFICATION.md Section 6.2 */
.tab-active {
  background: #003366;           /* Temenos Navy */
  color: white;
  font-size: 16px;
  font-weight: 600;
  padding: 12px 20px;
  border-radius: 8px 8px 0 0;
  border-bottom: 3px solid #00A3E0;  /* Temenos Cyan */
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transform: scale(1.02);
}
```

**Tailwind Class:**
```jsx
className="bg-[#003366] text-white font-semibold text-base px-5 py-3 rounded-t-lg border-b-3 border-[#00A3E0] shadow-md scale-105 flex items-center gap-2 transition-all duration-200"
```

#### Cards (Standard)
```css
/* From UNIFIED_LAYOUT_SPECIFICATION.md Section 6.3 */
.card-standard {
  background: white;  /* Light mode */
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: all 200ms;
}

.card-standard:hover {
  box-shadow: 0 10px 15px rgba(0,0,0,0.1);
  transform: translateY(-4px);
  border-color: #CBD5E1;
}
```

**Tailwind Class:**
```jsx
className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-md hover:shadow-lg hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200"
```

### Animation Standards

From UNIFIED_LAYOUT_SPECIFICATION.md:

```typescript
const ANIMATIONS = {
  // Entry Animations
  fadeIn: 'animate-fade-in',               // 300ms fade
  slideInUp: 'animate-slide-in-up',        // 300ms from bottom
  slideInDown: 'animate-slide-in-down',    // 300ms from top
  slideInLeft: 'animate-slide-in-left',    // 300ms from left
  slideInRight: 'animate-slide-in-right',  // 300ms from right
  scaleIn: 'animate-scale-in',             // 300ms grow
  bounceIn: 'animate-bounce-in',           // 500ms bounce

  // Hover Effects
  hoverZoom: 'hover:scale-110',
  hoverLift: 'hover:-translate-y-1',
  hoverGlow: 'hover:shadow-lg',
  hoverBorder: 'hover:border-[#00A3E0]',
  hoverBrightness: 'hover:brightness-110',

  // Transitions
  transitionAll: 'transition-all duration-200',
  transitionFast: 'transition-all duration-150',
  transitionSlow: 'transition-all duration-300',

  // Loading
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
}
```

### Accessibility Standards

**WCAG 2.1 Level AA Compliance REQUIRED:**

```typescript
const ACCESSIBILITY = {
  // Color Contrast
  minContrastNormal: 4.5,    // Normal text (< 18pt)
  minContrastLarge: 3.0,     // Large text (≥ 18pt)
  minContrastUI: 3.0,        // Interactive elements

  // Focus States
  focusRing: 'focus:outline-none focus:ring-3 focus:ring-[#0066CC]/50 focus:ring-offset-2',

  // ARIA Labels (Required)
  ariaLabel: true,           // All icon-only buttons
  ariaLabelledBy: true,      // Complex components
  ariaCurrent: true,         // Active navigation
  ariaExpanded: true,        // Collapsible sections
  ariaHidden: true,          // Decorative icons

  // Semantic HTML
  useButton: true,           // Not div with onClick
  useAnchor: true,           // For links, not button
  useNav: true,              // Navigation landmarks
  useMain: true,             // Main content area
  useHeader: true,           // Page/section headers
  useFooter: true,           // Page/section footers

  // Alt Text
  allImages: true,           // All images must have alt
  decorativeEmpty: true,     // Decorative: alt=""

  // Keyboard Navigation
  tabOrder: true,            // Logical tab order
  enterSpace: true,          // Activate with Enter/Space
  escape: true,              // Close modals with Escape
  arrowKeys: true,           // Navigate tabs (optional)
}
```

---

## Architecture Overview

### High-Level Flow

```
MD/YAML Templates (Phase 1)
          ↓
    Parser (Phase 2A) ✅ COMPLETE
          ↓
   Parsed TypeScript Objects
          ↓
    Section Renderer (Phase 2B) ← WE ARE HERE
          ↓
   31 Section Components
          ↓
    Styled with UNIFIED_LAYOUT_SPECIFICATION
          ↓
    Live Interactive UI
```

### Directory Structure (To Create)

```
frontend/src/
├─ components/
│   ├─ template-renderer/               # Main renderers
│   │   ├─ CardRenderer.tsx             # Render entire card
│   │   ├─ AgendaRenderer.tsx           # Render agenda/landing page
│   │   ├─ PageRenderer.tsx             # Render individual pages
│   │   ├─ SectionRenderer.tsx          # Route to section components
│   │   └─ PopupRenderer.tsx            # Render modals
│   │
│   ├─ template-sections/               # 31 Section Components
│   │   ├─ content/                     # Content Display (9 types)
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
│   │   ├─ navigation/                  # Interactive (6 types)
│   │   │   ├─ ImageClickableSection.tsx
│   │   │   ├─ FeatureGridSection.tsx
│   │   │   ├─ ClickableCardsSection.tsx
│   │   │   ├─ TabbedContentSection.tsx
│   │   │   ├─ InteractiveDiagramSection.tsx
│   │   │   └─ TextWithNavigationSection.tsx
│   │   │
│   │   ├─ data/                        # Data Presentation (6 types)
│   │   │   ├─ ListSection.tsx
│   │   │   ├─ ComparisonGridSection.tsx
│   │   │   ├─ KeyValuePairsSection.tsx
│   │   │   ├─ StepsSection.tsx
│   │   │   ├─ TimelineSection.tsx
│   │   │   └─ TableSection.tsx
│   │   │
│   │   ├─ expandable/                  # Expandable (3 types)
│   │   │   ├─ ExpandableSectionComponent.tsx
│   │   │   ├─ ExpandableCardComponent.tsx
│   │   │   └─ AccordionSection.tsx
│   │   │
│   │   └─ special/                     # Special Elements (7 types)
│   │       ├─ AlertSection.tsx
│   │       ├─ StatsSection.tsx
│   │       ├─ DownloadSection.tsx
│   │       ├─ GallerySection.tsx
│   │       ├─ CardListSection.tsx
│   │       ├─ ProgressSection.tsx
│   │       └─ TagsSection.tsx
│   │
│   └─ template-navigation/             # Navigation Components
│       ├─ NavigationProvider.tsx       # Context + state management
│       ├─ Breadcrumbs.tsx              # Auto-generated breadcrumbs
│       ├─ PageTree.tsx                 # Sidebar page tree
│       ├─ TabBar.tsx                   # Horizontal tabs
│       ├─ NavigationButtons.tsx        # Back/Next/Agenda buttons
│       └─ ProgressIndicator.tsx        # Steps/bar/dots
│
└─ hooks/
    ├─ useTemplateParser.ts             # Parse templates
    ├─ useNavigation.ts                 # Navigation management
    ├─ usePopup.ts                      # Popup state
    ├─ useClickAction.ts                # Handle click actions
    └─ useAnimation.ts                  # Animation utilities
```

**Total Files to Create:** ~50+ files (31 sections + 6 navigation + 5 main + 5 hooks + tests)

---

## Implementation Phases

### Phase 2B.1: Foundation Components (1 hour) - CRITICAL

**Main renderer infrastructure**

#### Task 2B.1.1: Main Renderer Components (30 min)

**Test First:**
```typescript
// CardRenderer.test.tsx
describe('CardRenderer', () => {
  it('should render card with parsed definition', () => {
    const card = {
      id: 'test-card',
      name: 'Test Card',
      category: 'test',
      color_theme: 'blue',
      icon: 'TestIcon'
    };
    render(<CardRenderer card={card} />);
    expect(screen.getByText('Test Card')).toBeInTheDocument();
  });

  it('should render agenda by default', () => {
    const card = mockCard();
    render(<CardRenderer card={card} />);
    expect(screen.getByTestId('agenda-renderer')).toBeInTheDocument();
  });

  it('should switch to page when navigating', () => {
    const card = mockCard();
    render(<CardRenderer card={card} />);
    fireEvent.click(screen.getByText('Page 1'));
    expect(screen.getByTestId('page-renderer')).toBeInTheDocument();
  });
});
```

**Create:**
1. `CardRenderer.tsx` - Top-level card container
2. `AgendaRenderer.tsx` - Landing page with navigation cards
3. `PageRenderer.tsx` - Individual page renderer
4. `SectionRenderer.tsx` - Routes sections to components
5. `PopupRenderer.tsx` - Modal/overlay renderer

**Tailwind Styling (from UNIFIED_LAYOUT_SPECIFICATION):**
```tsx
// CardRenderer.tsx
<div
  className="max-w-7xl mx-auto px-6 py-8 bg-slate-50 dark:bg-slate-900 min-h-screen"
  data-card-id={card.id}
  data-theme={card.color_theme}
>
  {/* Content */}
</div>

// PageRenderer.tsx
<div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
  {/* Navigation */}
  {card.navigation.show_breadcrumbs && <Breadcrumbs />}
  {card.navigation.show_page_tree && <PageTree />}

  {/* Content */}
  <main className="p-6 space-y-6">
    {page.sections.map((section, idx) => (
      <SectionRenderer key={idx} section={section} />
    ))}
  </main>

  {/* Navigation Buttons */}
  <NavigationButtons />
</div>
```

**Test Checklist:**
- [ ] CardRenderer renders with valid card ✅
- [ ] AgendaRenderer displays by default ✅
- [ ] PageRenderer shows when navigating ✅
- [ ] SectionRenderer routes to correct component ✅
- [ ] PopupRenderer shows/hides modals ✅
- [ ] All renderers apply correct styling ✅
- [ ] Dark mode works ✅
- [ ] Responsive layout works ✅

#### Task 2B.1.2: SectionRenderer (15 min)

**Critical component that routes to all 31 section types**

```tsx
// SectionRenderer.tsx
import React from 'react';
import { Section } from '@/lib/template-types';

// Content Display
import { HeroSection } from '../template-sections/content/HeroSection';
import { TextSection } from '../template-sections/content/TextSection';
// ... import all 31 section types

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
    case 'quote':
      return <QuoteSection {...section} />;
    case 'divider':
      return <DividerSection {...section} />;
    case 'embed':
      return <EmbedSection {...section} />;

    case 'feature_grid':
      return <FeatureGridSection {...section} />;
    case 'clickable_cards':
      return <ClickableCardsSection {...section} />;
    case 'tabbed_content':
      return <TabbedContentSection {...section} />;
    case 'interactive_diagram':
      return <InteractiveDiagramSection {...section} />;
    case 'text_with_navigation':
      return <TextWithNavigationSection {...section} />;

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

    case 'expandable_section':
      return <ExpandableSectionComponent {...section} />;
    case 'expandable_card':
      return <ExpandableCardComponent {...section} />;
    case 'accordion':
      return <AccordionSection {...section} />;

    case 'alert':
      return <AlertSection {...section} />;
    case 'stats':
      return <StatsSection {...section} />;
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

    case 'loading':
      return <LoadingSection {...section} />;

    default:
      const exhaustiveCheck: never = section;
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg">
          <p className="text-sm text-red-700 dark:text-red-400">
            Unknown section type: {(section as any).type}
          </p>
        </div>
      );
  }
}
```

**Test:**
```typescript
describe('SectionRenderer', () => {
  it('should route to HeroSection for hero type', () => {
    const section: HeroSection = {
      type: 'hero',
      heading: 'Test'
    };
    render(<SectionRenderer section={section} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should route to TextSection for text type', () => {
    const section: TextSection = {
      type: 'text',
      content: 'Test content'
    };
    render(<SectionRenderer section={section} />);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  // Test all 31 section types (critical!)
});
```

---

### Phase 2B.2: Content Display Components (45 min)

**9 section types for displaying content**

#### 1. HeroSection.tsx (5 min)

**From Phase 1 examples:**
```yaml
- type: hero
  heading: "Observability: The Complete Guide"
  subtitle: "Monitor, measure, and optimize your systems"
  align: center
```

**Test First:**
```tsx
// HeroSection.test.tsx
describe('HeroSection', () => {
  it('should render heading and subtitle', () => {
    render(<HeroSection
      type="hero"
      heading="Test Heading"
      subtitle="Test Subtitle"
    />);
    expect(screen.getByText('Test Heading')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('should apply center alignment', () => {
    const { container } = render(<HeroSection
      type="hero"
      heading="Test"
      align="center"
    />);
    expect(container.firstChild).toHaveClass('text-center');
  });

  it('should use H1 typography from spec', () => {
    render(<HeroSection type="hero" heading="Test" />);
    const heading = screen.getByText('Test');
    expect(heading.tagName).toBe('H1');
    expect(heading).toHaveClass('text-3xl', 'font-bold', 'tracking-tight');
  });
});
```

**Implementation:**
```tsx
// HeroSection.tsx
import React from 'react';
import { HeroSection as HeroSectionType } from '@/lib/template-types';

export function HeroSection({
  heading,
  subtitle,
  align = 'left'
}: HeroSectionType) {
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  return (
    <div
      className={`hero-section space-y-3 ${alignmentClass}`}
      role="banner"
    >
      {/* H1 styling from UNIFIED_LAYOUT_SPECIFICATION Section 4.2 */}
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
        {heading}
      </h1>

      {subtitle && (
        /* Body Large from spec */
        <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
          {subtitle}
        </p>
      )}
    </div>
  );
}
```

**Verification:**
- [ ] Renders heading as H1 with correct styling ✅
- [ ] Renders optional subtitle ✅
- [ ] Applies alignment (left/center/right) ✅
- [ ] Uses typography from UNIFIED_LAYOUT_SPECIFICATION ✅
- [ ] Dark mode works ✅
- [ ] Semantic HTML (role="banner") ✅
- [ ] Test passes ✅

#### 2. TextSection.tsx (5 min)

**Supports Markdown rendering**

```tsx
// TextSection.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { TextSection as TextSectionType } from '@/lib/template-types';

export function TextSection({
  content,
  align = 'left'
}: TextSectionType) {
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  }[align];

  return (
    <div className={`text-section ${alignmentClass}`}>
      {/* Body Regular from UNIFIED_LAYOUT_SPECIFICATION */}
      <ReactMarkdown
        className="prose prose-slate dark:prose-invert max-w-none text-base leading-normal text-slate-600 dark:text-slate-300"
        components={{
          h1: ({ children }) => <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mt-8 mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mt-6 mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mt-4 mb-2">{children}</h3>,
          p: ({ children }) => <p className="mb-4">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>,
          code: ({ inline, children }) => inline ? (
            <code className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{children}</code>
          ) : (
            <code className="block font-mono text-sm bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto">{children}</code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
```

**Test:**
```tsx
describe('TextSection', () => {
  it('should render markdown content', () => {
    render(<TextSection type="text" content="**Bold** and *italic*" />);
    expect(screen.getByText('Bold')).toHaveStyle({ fontWeight: '700' });
  });

  it('should sanitize dangerous HTML', () => {
    const dangerous = '<script>alert("XSS")</script>';
    render(<TextSection type="text" content={dangerous} />);
    expect(screen.queryByText('alert')).not.toBeInTheDocument();
  });

  it('should render code blocks with syntax highlighting', () => {
    const code = '```\nconst x = 1;\n```';
    render(<TextSection type="text" content={code} />);
    expect(screen.getByText('const x = 1;')).toHaveClass('font-mono');
  });
});
```

#### 3. TextWithLinksSection.tsx (10 min)

**Parse `[[Display Text|target-page-id]]` syntax**

```tsx
// TextWithLinksSection.tsx
import React from 'react';
import { TextWithLinksSection as TextWithLinksSectionType } from '@/lib/template-types';
import { useNavigation } from '@/hooks/useNavigation';

export function TextWithLinksSection({ content }: TextWithLinksSectionType) {
  const { navigateToPage } = useNavigation();

  // Parse [[text|target]] syntax
  const parseLinks = (text: string) => {
    const linkRegex = /\[\[([^\]|]+)\|([^\]]+)\]\]/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      // Add text before link
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      // Add link
      const [, displayText, targetId] = match;
      parts.push(
        <button
          key={match.index}
          onClick={() => navigateToPage(targetId)}
          className="text-[#0066CC] hover:text-[#00A3E0] underline transition-colors duration-150 font-medium"
        >
          {displayText}
        </button>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  return (
    <div className="text-with-links text-base leading-normal text-slate-600 dark:text-slate-300">
      {parseLinks(content)}
    </div>
  );
}
```

**Test:**
```tsx
describe('TextWithLinksSection', () => {
  it('should parse [[text|target]] syntax', () => {
    const content = 'Learn about [[Architecture|arch-page]] here.';
    render(<TextWithLinksSection type="text_with_links" content={content} />);
    expect(screen.getByText('Architecture')).toBeInTheDocument();
  });

  it('should navigate on link click', () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('@/hooks/useNavigation'), 'useNavigation').mockReturnValue({
      navigateToPage: mockNavigate
    });

    const content = 'Go to [[Page|page-id]].';
    render(<TextWithLinksSection type="text_with_links" content={content} />);
    fireEvent.click(screen.getByText('Page'));
    expect(mockNavigate).toHaveBeenCalledWith('page-id');
  });

  it('should handle multiple links', () => {
    const content = 'See [[A|a]] and [[B|b]].';
    render(<TextWithLinksSection type="text_with_links" content={content} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });
});
```

#### 4-9. Other Content Display Components

**Create similarly with test-first approach:**
- `ImageSection.tsx` - Display images with captions
- `VideoSection.tsx` - Embed videos (YouTube, Vimeo, MP4)
- `CodeBlockSection.tsx` - Syntax highlighting with Prism
- `QuoteSection.tsx` - Blockquotes with attribution
- `DividerSection.tsx` - Visual separators
- `EmbedSection.tsx` - iframe embeds

**Each component must:**
- Follow UNIFIED_LAYOUT_SPECIFICATION styling
- Have comprehensive tests (rendering, props, edge cases)
- Support light/dark mode
- Be accessible (ARIA labels, semantic HTML)
- Use Tailwind classes (no inline styles)

---

### Phase 2B.3: Navigation & Interactive Components (45 min)

**6 section types for navigation and interaction**

#### 1. ImageClickableSection.tsx (10 min)

**With click actions and hover effects**

```tsx
// ImageClickableSection.tsx
import React from 'react';
import { ImageClickableSection as ImageClickableSectionType } from '@/lib/template-types';
import { useClickAction } from '@/hooks/useClickAction';

export function ImageClickableSection({
  image,
  alt,
  caption,
  click_action,
  hover_effect = 'zoom'
}: ImageClickableSectionType) {
  const handleClick = useClickAction(click_action);

  // Hover effects from UNIFIED_LAYOUT_SPECIFICATION Section 9.1
  const hoverEffectClass = {
    zoom: 'hover:scale-110',
    lift: 'hover:-translate-y-1 hover:shadow-lg',
    glow: 'hover:shadow-xl hover:shadow-[#00A3E0]/50',
    border: 'hover:border-[#00A3E0] hover:border-4',
    brightness: 'hover:brightness-110',
  }[hover_effect];

  return (
    <figure className="image-clickable space-y-2">
      <div
        className={`
          relative overflow-hidden rounded-xl cursor-pointer
          transition-all duration-200
          ${hoverEffectClass}
        `}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Navigate to ${click_action?.target || 'destination'}`}
      >
        <img
          src={image}
          alt={alt}
          className="w-full h-auto"
        />
      </div>

      {caption && (
        <figcaption className="text-sm text-slate-600 dark:text-slate-400 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
```

**Test:**
```tsx
describe('ImageClickableSection', () => {
  it('should render image with alt text', () => {
    render(<ImageClickableSection
      type="image_clickable"
      image="/test.png"
      alt="Test Image"
      click_action={{ type: 'navigate_to_subpage', target: 'page-1' }}
    />);
    const img = screen.getByAltText('Test Image');
    expect(img).toBeInTheDocument();
  });

  it('should apply hover effect class', () => {
    const { container } = render(<ImageClickableSection
      type="image_clickable"
      image="/test.png"
      alt="Test"
      click_action={{ type: 'navigate_to_subpage', target: 'page-1' }}
      hover_effect="zoom"
    />);
    expect(container.querySelector('div')).toHaveClass('hover:scale-110');
  });

  it('should call click handler on click', () => {
    const mockHandle = jest.fn();
    jest.spyOn(require('@/hooks/useClickAction'), 'useClickAction').mockReturnValue(mockHandle);

    render(<ImageClickableSection
      type="image_clickable"
      image="/test.png"
      alt="Test"
      click_action={{ type: 'navigate_to_subpage', target: 'page-1' }}
    />);

    fireEvent.click(screen.getByRole('button'));
    expect(mockHandle).toHaveBeenCalled();
  });

  it('should be keyboard accessible', () => {
    const mockHandle = jest.fn();
    jest.spyOn(require('@/hooks/useClickAction'), 'useClickAction').mockReturnValue(mockHandle);

    render(<ImageClickableSection
      type="image_clickable"
      image="/test.png"
      alt="Test"
      click_action={{ type: 'navigate_to_subpage', target: 'page-1' }}
    />);

    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(mockHandle).toHaveBeenCalled();
  });
});
```

#### 2. FeatureGridSection.tsx (10 min)

**Grid of clickable feature cards**

```tsx
// FeatureGridSection.tsx
import React from 'react';
import { FeatureGridSection as FeatureGridSectionType } from '@/lib/template-types';
import { useClickAction } from '@/hooks/useClickAction';
import * as LucideIcons from 'lucide-react';

export function FeatureGridSection({
  columns = 3,
  features
}: FeatureGridSectionType) {
  const gridColsClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  }[columns];

  return (
    <div className={`feature-grid grid grid-cols-1 ${gridColsClass} gap-6`}>
      {features.map((feature, index) => (
        <FeatureCard key={index} feature={feature} />
      ))}
    </div>
  );
}

function FeatureCard({ feature }: { feature: any }) {
  const handleClick = useClickAction(feature.click_action);
  const Icon = (LucideIcons as any)[feature.icon] || LucideIcons.Box;

  const hoverEffectClass = feature.hover_effect ? {
    zoom: 'hover:scale-105',
    lift: 'hover:-translate-y-2',
    glow: 'hover:shadow-xl hover:shadow-[#00A3E0]/30',
    border: 'hover:border-[#00A3E0]',
    brightness: 'hover:brightness-110',
  }[feature.hover_effect] : '';

  // Card styling from UNIFIED_LAYOUT_SPECIFICATION Section 6.3
  return (
    <div
      className={`
        bg-white dark:bg-slate-800
        border border-slate-200 dark:border-slate-700
        rounded-xl p-6
        shadow-md
        transition-all duration-200
        cursor-pointer
        ${hoverEffectClass}
        ${feature.click_action ? 'hover:border-slate-300 dark:hover:border-slate-600' : ''}
      `}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (feature.click_action && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
      role={feature.click_action ? 'button' : undefined}
      tabIndex={feature.click_action ? 0 : undefined}
    >
      {/* Icon */}
      <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-[#00A3E0]/10">
        <Icon className="w-6 h-6 text-[#00A3E0]" aria-hidden="true" />
      </div>

      {/* Name - H4 from spec */}
      <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">
        {feature.name}
      </h4>

      {/* Description - Body Regular from spec */}
      <p className="text-base leading-normal text-slate-600 dark:text-slate-300">
        {feature.description}
      </p>
    </div>
  );
}
```

**Test:**
```tsx
describe('FeatureGridSection', () => {
  const mockFeatures = [
    { name: 'Feature 1', icon: 'Zap', description: 'Desc 1' },
    { name: 'Feature 2', icon: 'Shield', description: 'Desc 2' },
    { name: 'Feature 3', icon: 'Lock', description: 'Desc 3' },
  ];

  it('should render all features', () => {
    render(<FeatureGridSection type="feature_grid" columns={3} features={mockFeatures} />);
    expect(screen.getByText('Feature 1')).toBeInTheDocument();
    expect(screen.getByText('Feature 2')).toBeInTheDocument();
    expect(screen.getByText('Feature 3')).toBeInTheDocument();
  });

  it('should apply correct grid columns', () => {
    const { container } = render(<FeatureGridSection type="feature_grid" columns={2} features={mockFeatures} />);
    expect(container.firstChild).toHaveClass('md:grid-cols-2');
  });

  it('should render icons', () => {
    render(<FeatureGridSection type="feature_grid" columns={3} features={mockFeatures} />);
    // Icons are SVGs, check they exist
    const cards = screen.getAllByRole('button');
    expect(cards).toHaveLength(3);
  });

  it('should handle click actions', () => {
    const featuresWithAction = [
      { ...mockFeatures[0], click_action: { type: 'navigate_to_subpage', target: 'page-1' } }
    ];

    const mockHandle = jest.fn();
    jest.spyOn(require('@/hooks/useClickAction'), 'useClickAction').mockReturnValue(mockHandle);

    render(<FeatureGridSection type="feature_grid" columns={3} features={featuresWithAction} />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockHandle).toHaveBeenCalled();
  });
});
```

#### 3-6. Other Navigation Components

**Create with test-first approach:**
- `ClickableCardsSection.tsx` - Navigation card grids
- `TabbedContentSection.tsx` - Tab interface with state management
- `InteractiveDiagramSection.tsx` - SVG overlays for hotspots
- `TextWithNavigationSection.tsx` - Alternative navigation text

---

### Phase 2B.4: Data Presentation Components (30 min)

**6 section types for displaying data**

Create with test-first approach:
- `ListSection.tsx` - Bullet/numbered/checklist
- `ComparisonGridSection.tsx` - Side-by-side comparisons
- `KeyValuePairsSection.tsx` - Data displays
- `StepsSection.tsx` - Numbered step-by-step guides
- `TimelineSection.tsx` - Chronological events
- `TableSection.tsx` - Structured data tables

**Each must use UNIFIED_LAYOUT_SPECIFICATION styling**

---

### Phase 2B.5: Expandable Content Components (20 min)

**3 section types with expand/collapse functionality**

#### AccordionSection.tsx Example

```tsx
// AccordionSection.tsx
import React, { useState } from 'react';
import { AccordionSection as AccordionSectionType } from '@/lib/template-types';
import { ChevronDown } from 'lucide-react';

export function AccordionSection({
  allow_multiple,
  items
}: AccordionSectionType) {
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    if (allow_multiple) {
      setOpenIndexes((prev) => {
        const next = new Set(prev);
        if (next.has(index)) {
          next.delete(index);
        } else {
          next.add(index);
        }
        return next;
      });
    } else {
      setOpenIndexes((prev) =>
        prev.has(index) ? new Set() : new Set([index])
      );
    }
  };

  return (
    <div className="accordion space-y-2">
      {items.map((item, index) => (
        <div
          key={index}
          className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
        >
          {/* Accordion Header */}
          <button
            className="w-full flex items-center justify-between p-4 text-left bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200"
            onClick={() => toggleItem(index)}
            aria-expanded={openIndexes.has(index)}
            aria-controls={`accordion-content-${index}`}
          >
            <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
              {item.title}
            </h4>
            <ChevronDown
              className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${
                openIndexes.has(index) ? 'transform rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </button>

          {/* Accordion Content */}
          {openIndexes.has(index) && (
            <div
              id={`accordion-content-${index}`}
              className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 animate-slide-down"
            >
              <p className="text-base leading-normal text-slate-600 dark:text-slate-300">
                {item.content}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

### Phase 2B.6: Special Elements Components (30 min)

**7 section types for special UI elements**

#### AlertSection.tsx Example

**From UNIFIED_LAYOUT_SPECIFICATION Section 6.8:**

```tsx
// AlertSection.tsx
import React, { useState } from 'react';
import { AlertSection as AlertSectionType } from '@/lib/template-types';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

export function AlertSection({
  alert_type,
  title,
  content,
  dismissible = false,
  icon: customIcon
}: AlertSectionType) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  // Alert type configuration from UNIFIED_LAYOUT_SPECIFICATION
  const alertConfig = {
    info: {
      bgClass: 'bg-blue-50 dark:bg-blue-900/20',
      borderClass: 'border-blue-500',
      iconClass: 'text-blue-600 dark:text-blue-400',
      titleClass: 'text-blue-800 dark:text-blue-300',
      contentClass: 'text-blue-700 dark:text-blue-400',
      Icon: Info,
    },
    success: {
      bgClass: 'bg-green-50 dark:bg-green-900/20',
      borderClass: 'border-green-500',
      iconClass: 'text-green-600 dark:text-green-400',
      titleClass: 'text-green-800 dark:text-green-300',
      contentClass: 'text-green-700 dark:text-green-400',
      Icon: CheckCircle,
    },
    warning: {
      bgClass: 'bg-amber-50 dark:bg-amber-900/20',
      borderClass: 'border-amber-500',
      iconClass: 'text-amber-600 dark:text-amber-400',
      titleClass: 'text-amber-800 dark:text-amber-300',
      contentClass: 'text-amber-700 dark:text-amber-400',
      Icon: AlertCircle,
    },
    error: {
      bgClass: 'bg-red-50 dark:bg-red-900/20',
      borderClass: 'border-red-500',
      iconClass: 'text-red-600 dark:text-red-400',
      titleClass: 'text-red-800 dark:text-red-300',
      contentClass: 'text-red-700 dark:text-red-400',
      Icon: XCircle,
    },
  }[alert_type];

  const { bgClass, borderClass, iconClass, titleClass, contentClass, Icon } = alertConfig;

  return (
    <div
      className={`${bgClass} border-l-4 ${borderClass} p-4 rounded-r-lg`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <Icon className={`w-5 h-5 ${iconClass} flex-shrink-0 mt-0.5`} aria-hidden="true" />

        {/* Content */}
        <div className="flex-1">
          {title && (
            <h4 className={`font-semibold ${titleClass} mb-1`}>
              {title}
            </h4>
          )}
          <p className={`text-sm ${contentClass}`}>
            {content}
          </p>
        </div>

        {/* Dismiss Button */}
        {dismissible && (
          <button
            onClick={() => setIsDismissed(true)}
            className={`${iconClass} hover:opacity-70 transition-opacity flex-shrink-0`}
            aria-label="Dismiss alert"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
```

**Test:**
```tsx
describe('AlertSection', () => {
  it('should render info alert with correct styling', () => {
    render(<AlertSection type="alert" alert_type="info" content="Info message" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-blue-50', 'border-blue-500');
  });

  it('should render all alert types', () => {
    const types: Array<'info' | 'success' | 'warning' | 'error'> = ['info', 'success', 'warning', 'error'];
    types.forEach(type => {
      const { unmount } = render(<AlertSection type="alert" alert_type={type} content="Test" />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
      unmount();
    });
  });

  it('should dismiss when dismiss button clicked', () => {
    render(<AlertSection type="alert" alert_type="info" content="Test" dismissible={true} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Dismiss alert'));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should not show dismiss button when not dismissible', () => {
    render(<AlertSection type="alert" alert_type="info" content="Test" dismissible={false} />);
    expect(screen.queryByLabelText('Dismiss alert')).not.toBeInTheDocument();
  });
});
```

**Create other special components:**
- `StatsSection.tsx` - Key metrics display
- `DownloadSection.tsx` - File download links
- `GallerySection.tsx` - Image grids with lightbox
- `CardListSection.tsx` - Vertical card lists
- `ProgressSection.tsx` - Progress indicators
- `TagsSection.tsx` - Tag clouds

---

### Phase 2B.7: Navigation System (45 min)

**Navigation components and context**

#### NavigationProvider.tsx (15 min)

```tsx
// NavigationProvider.tsx
import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { CardDefinition, PageDefinition } from '@/lib/template-types';
import { NavigationBuilder } from '@/lib/template-parser/navigation-builder';
import { FileLoader } from '@/lib/template-parser/file-loader';

interface NavigationContextValue {
  card: CardDefinition;
  currentPage: string | null;
  hierarchy: any;
  breadcrumbs: any[];
  popupStack: string[];
  navigateToPage: (pageId: string) => void;
  navigateBack: () => void;
  backToAgenda: () => void;
  showPopup: (popupId: string) => void;
  closePopup: () => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({
  card,
  children
}: {
  card: CardDefinition;
  children: React.ReactNode;
}) {
  const [currentPage, setCurrentPage] = useState<string | null>(null);
  const [hierarchy, setHierarchy] = useState<any>(null);
  const [popupStack, setPopupStack] = useState<string[]>([]);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);

  // Build hierarchy on mount
  useEffect(() => {
    const builder = new NavigationBuilder([]);
    const loader = new FileLoader();

    // Load all pages and build hierarchy
    Promise.all(
      card.pages.map(pageRef => loader.loadPage(pageRef.file))
    ).then(pages => {
      const pageMap = new Map(pages.map(p => [p.id, p]));
      const nav = builder.buildHierarchy(pageMap);
      setHierarchy(nav);
    });
  }, [card]);

  const navigateToPage = (pageId: string) => {
    if (currentPage) {
      setNavigationHistory(prev => [...prev, currentPage]);
    }
    setCurrentPage(pageId);
    window.history.pushState({}, '', `/cards/${card.id}/${pageId}`);
  };

  const navigateBack = () => {
    if (navigationHistory.length > 0) {
      const prev = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(h => h.slice(0, -1));
      setCurrentPage(prev);
      window.history.back();
    }
  };

  const backToAgenda = () => {
    setCurrentPage(null);
    setNavigationHistory([]);
    window.history.pushState({}, '', `/cards/${card.id}`);
  };

  const showPopup = (popupId: string) => {
    setPopupStack(prev => [...prev, popupId]);
  };

  const closePopup = () => {
    setPopupStack(prev => prev.slice(0, -1));
  };

  const breadcrumbs = useMemo(() => {
    if (!currentPage || !hierarchy) return [];
    const builder = new NavigationBuilder([]);
    return builder.buildBreadcrumbs(currentPage, hierarchy);
  }, [currentPage, hierarchy]);

  const value: NavigationContextValue = {
    card,
    currentPage,
    hierarchy,
    breadcrumbs,
    popupStack,
    navigateToPage,
    navigateBack,
    backToAgenda,
    showPopup,
    closePopup,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}
```

#### Breadcrumbs.tsx (10 min)

```tsx
// Breadcrumbs.tsx
import React from 'react';
import { useNavigation } from './NavigationProvider';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs() {
  const { breadcrumbs, navigateToPage, backToAgenda } = useNavigation();

  if (breadcrumbs.length === 0) return null;

  return (
    <nav
      className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4"
      aria-label="Breadcrumb"
    >
      {/* Home / Agenda */}
      <button
        onClick={backToAgenda}
        className="flex items-center gap-1 hover:text-[#0066CC] dark:hover:text-[#00A3E0] transition-colors"
        aria-label="Back to agenda"
      >
        <Home className="w-4 h-4" aria-hidden="true" />
        <span>Home</span>
      </button>

      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.pageId}>
          <ChevronRight className="w-4 h-4" aria-hidden="true" />

          {index < breadcrumbs.length - 1 ? (
            <button
              onClick={() => navigateToPage(crumb.pageId)}
              className="hover:text-[#0066CC] dark:hover:text-[#00A3E0] hover:underline transition-colors"
            >
              {crumb.label}
            </button>
          ) : (
            <span
              className="font-semibold text-[#003366] dark:text-[#00A3E0]"
              aria-current="page"
            >
              {crumb.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
```

#### Other Navigation Components

**Create:**
- `PageTree.tsx` - Sidebar with collapsible page hierarchy
- `TabBar.tsx` - Horizontal tab navigation (use UNIFIED_LAYOUT_SPECIFICATION Section 6.2)
- `NavigationButtons.tsx` - Back/Next/Agenda buttons
- `ProgressIndicator.tsx` - Steps/bar/dots for linear navigation

---

### Phase 2B.8: Popup System (20 min)

```tsx
// PopupRenderer.tsx
import React, { useEffect } from 'react';
import { PopupDefinition } from '@/lib/template-types';
import { X } from 'lucide-react';
import { SectionRenderer } from './SectionRenderer';

interface PopupRendererProps {
  popup: PopupDefinition;
  isOpen: boolean;
  onClose: () => void;
}

export function PopupRenderer({ popup, isOpen, onClose }: PopupRendererProps) {
  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent body scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Size classes from UNIFIED_LAYOUT_SPECIFICATION
  const sizeClass = {
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
    'full-screen': 'max-w-full h-full m-0 rounded-none',
  }[popup.size];

  // Animation classes
  const animationClass = popup.animation ? {
    'fade-in': 'animate-fade-in',
    'scale-in': 'animate-scale-in',
    'slide-in-up': 'animate-slide-in-up',
    'slide-in-down': 'animate-slide-in-down',
  }[popup.animation] : 'animate-scale-in';

  return (
    <>
      {/* Backdrop - From UNIFIED_LAYOUT_SPECIFICATION Section 8.2 */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Popup */}
      <div
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title"
      >
        <div
          className={`
            bg-white dark:bg-slate-800
            rounded-xl shadow-2xl
            w-full ${sizeClass}
            max-h-[90vh] overflow-hidden
            ${animationClass}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <h2
              id="popup-title"
              className="text-2xl font-semibold text-slate-800 dark:text-slate-100"
            >
              {popup.title}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {popup.content && (
              <p className="text-base leading-normal text-slate-600 dark:text-slate-300">
                {popup.content}
              </p>
            )}

            {popup.sections && (
              <div className="space-y-6">
                {popup.sections.map((section, index) => (
                  <SectionRenderer key={index} section={section} />
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          {popup.actions && popup.actions.length > 0 && (
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
              {popup.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    // Handle action
                    if (action.action.type === 'close_popup') {
                      onClose();
                    }
                    // Other actions handled by useClickAction
                  }}
                  className="bg-[#003366] text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-[#004080] hover:shadow-lg hover:-translate-y-0.5 active:bg-[#002244] active:shadow-sm transition-all duration-200"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
```

---

### Phase 2B.9: Custom Hooks (30 min)

#### useTemplateParser.ts

```tsx
// useTemplateParser.ts
import { useState, useEffect } from 'react';
import { CardDefinition } from '@/lib/template-types';
import { FileLoader } from '@/lib/template-parser/file-loader';
import { parseCardDefinition } from '@/lib/template-parser/card-parser';

export function useTemplateParser(cardId: string) {
  const [card, setCard] = useState<CardDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loader = new FileLoader();

    loader
      .loadCard(cardId)
      .then((content) => {
        const parsed = parseCardDefinition(content);
        setCard(parsed);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [cardId]);

  return { card, loading, error };
}
```

#### useClickAction.ts

```tsx
// useClickAction.ts
import { useCallback } from 'react';
import { ClickAction } from '@/lib/template-types';
import { useNavigation } from '@/components/template-navigation/NavigationProvider';

export function useClickAction(action?: ClickAction) {
  const { navigateToPage, showPopup } = useNavigation();

  return useCallback(() => {
    if (!action) return;

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
            window.open(action.target, '_blank', 'noopener,noreferrer');
          } else {
            window.location.href = action.target;
          }
        }
        break;
    }
  }, [action, navigateToPage, showPopup]);
}
```

#### Other hooks

- `useNavigation.ts` - Already defined in NavigationProvider
- `usePopup.ts` - Popup state management
- `useAnimation.ts` - Animation utilities

---

## Testing Strategy

### Unit Testing (Component Level)

**For EACH of 31 section components:**

```typescript
describe('[ComponentName]', () => {
  it('should render with required props', () => {
    // Test basic rendering
  });

  it('should apply correct styling from UNIFIED_LAYOUT_SPECIFICATION', () => {
    // Test Tailwind classes are applied
  });

  it('should support light and dark mode', () => {
    // Test dark mode classes
  });

  it('should handle optional props', () => {
    // Test optional fields
  });

  it('should be keyboard accessible', () => {
    // Test tab order, Enter/Space keys
  });

  it('should have proper ARIA labels', () => {
    // Test accessibility
  });

  it('should handle click actions', () => {
    // Test interactions
  });

  it('should apply hover effects', () => {
    // Test hover states
  });
});
```

### Integration Testing

**Test complete flows:**

```typescript
describe('Template Rendering Integration', () => {
  it('should load and render simple-card', async () => {
    const { card } = await useTemplateParser('simple-card');
    render(<CardRenderer card={card} />);

    // Verify agenda renders
    expect(screen.getByTestId('agenda-renderer')).toBeInTheDocument();

    // Navigate to page
    fireEvent.click(screen.getByText('Introduction'));
    expect(screen.getByTestId('page-renderer')).toBeInTheDocument();

    // Verify sections render
    expect(screen.getByText('Welcome')).toBeInTheDocument(); // Hero
  });

  it('should navigate through 5-level hierarchy in complex-card', async () => {
    const { card } = await useTemplateParser('complex-card');
    render(<CardRenderer card={card} />);

    // Navigate Level 1 → 2 → 3 → 4 → 5
    fireEvent.click(screen.getByText('Architecture'));
    fireEvent.click(screen.getByText('Overview'));
    fireEvent.click(screen.getByText('Details'));
    fireEvent.click(screen.getByText('Layer 1'));
    fireEvent.click(screen.getByText('Component A'));
    fireEvent.click(screen.getByText('Implementation'));

    // Verify breadcrumbs show all 5 levels
    const breadcrumbs = screen.getAllByRole('button', { name: /breadcrumb/i });
    expect(breadcrumbs).toHaveLength(5);
  });

  it('should show popup on click action', async () => {
    // Test popup trigger and display
  });

  it('should handle expandable sections', async () => {
    // Test accordion/expandable
  });
});
```

### Accessibility Testing

**WCAG 2.1 AA Compliance:**

```typescript
describe('Accessibility', () => {
  it('should have sufficient color contrast', () => {
    // Test contrast ratios (4.5:1 for normal text, 3:1 for large)
  });

  it('should support keyboard navigation', () => {
    // Test Tab, Enter, Space, Escape, Arrow keys
  });

  it('should have proper ARIA attributes', () => {
    // Test aria-label, aria-labelledby, aria-expanded, etc.
  });

  it('should use semantic HTML', () => {
    // Test <button>, <a>, <nav>, <main>, <header>, <footer>
  });

  it('should have alt text on all images', () => {
    // Test images have alt attributes
  });

  it('should announce navigation changes to screen readers', () => {
    // Test aria-live regions
  });
});
```

### Visual Regression Testing

**Test styling matches UNIFIED_LAYOUT_SPECIFICATION:**

```typescript
describe('Visual Regression', () => {
  it('should match typography from spec', () => {
    // H1: text-3xl font-bold tracking-tight
    // H2: text-2xl font-semibold
    // Body: text-base leading-normal
  });

  it('should match color scheme', () => {
    // Primary: #003366
    // Secondary: #0066CC
    // Accent: #00A3E0
  });

  it('should match spacing', () => {
    // Card padding: p-6 (24px)
    // Section gap: space-y-6 (24px)
  });

  it('should match component styling', () => {
    // Buttons, tabs, cards match spec
  });
});
```

---

## Success Criteria

### Rendering Success

- [ ] All 31 section types render correctly ✅
- [ ] All sections match UNIFIED_LAYOUT_SPECIFICATION styling ✅
- [ ] Light and dark modes work ✅
- [ ] Responsive layouts work (mobile/tablet/desktop) ✅
- [ ] Animations are smooth (60fps) ✅

### Navigation Success

- [ ] Breadcrumbs generate correctly ✅
- [ ] Page tree displays hierarchy ✅
- [ ] Tab bar switches views ✅
- [ ] Back/Next/Agenda buttons work ✅
- [ ] 5-level hierarchy navigation works ✅

### Interaction Success

- [ ] All click actions work (navigate/popup/external) ✅
- [ ] All hover effects work ✅
- [ ] Expandable sections expand/collapse ✅
- [ ] Popups open/close correctly ✅
- [ ] Keyboard navigation works ✅

### Integration Success

- [ ] Load and render simple-card ✅
- [ ] Load and render medium-card ✅
- [ ] Load and render complex-card (5 levels!) ✅
- [ ] All 18 example files render ✅
- [ ] No console errors or warnings ✅

### Accessibility Success

- [ ] WCAG 2.1 AA compliance ✅
- [ ] Keyboard accessible ✅
- [ ] Screen reader friendly ✅
- [ ] Proper ARIA labels ✅
- [ ] Semantic HTML ✅

### Performance Success

- [ ] Render page in <200ms ✅
- [ ] Navigate in <50ms ✅
- [ ] Animations 60fps ✅
- [ ] No memory leaks ✅

---

## Deliverables

### Code Deliverables

- [ ] 5 Main renderer files (Card, Agenda, Page, Section, Popup)
- [ ] 31 Section component files (9 content + 6 navigation + 6 data + 3 expandable + 7 special)
- [ ] 6 Navigation component files (Provider, Breadcrumbs, PageTree, TabBar, Buttons, Progress)
- [ ] 5 Custom hook files (Parser, Navigation, Popup, ClickAction, Animation)
- [ ] ~50 Test files (1 test per component + integration tests)

**Total: ~100+ files**

### Documentation Deliverables

- [ ] Component API documentation (props, examples)
- [ ] Styling guide (how components apply UNIFIED_LAYOUT_SPECIFICATION)
- [ ] Testing guide (how to test components)
- [ ] Integration guide (how to use in existing app)

### Testing Deliverables

- [ ] Unit tests for all components (>90% coverage)
- [ ] Integration tests for complete flows
- [ ] Accessibility tests (WCAG AA compliance)
- [ ] Visual regression tests
- [ ] Performance benchmarks

---

## Phase 2B Checklist

### Foundation (2B.1)
- [ ] CardRenderer.tsx ✅
- [ ] AgendaRenderer.tsx ✅
- [ ] PageRenderer.tsx ✅
- [ ] SectionRenderer.tsx ✅
- [ ] PopupRenderer.tsx ✅

### Content Display (2B.2) - 9 components
- [ ] HeroSection.tsx ✅
- [ ] TextSection.tsx ✅
- [ ] TextWithLinksSection.tsx ✅
- [ ] ImageSection.tsx ✅
- [ ] VideoSection.tsx ✅
- [ ] CodeBlockSection.tsx ✅
- [ ] QuoteSection.tsx ✅
- [ ] DividerSection.tsx ✅
- [ ] EmbedSection.tsx ✅

### Navigation & Interactive (2B.3) - 6 components
- [ ] ImageClickableSection.tsx ✅
- [ ] FeatureGridSection.tsx ✅
- [ ] ClickableCardsSection.tsx ✅
- [ ] TabbedContentSection.tsx ✅
- [ ] InteractiveDiagramSection.tsx ✅
- [ ] TextWithNavigationSection.tsx ✅

### Data Presentation (2B.4) - 6 components
- [ ] ListSection.tsx ✅
- [ ] ComparisonGridSection.tsx ✅
- [ ] KeyValuePairsSection.tsx ✅
- [ ] StepsSection.tsx ✅
- [ ] TimelineSection.tsx ✅
- [ ] TableSection.tsx ✅

### Expandable (2B.5) - 3 components
- [ ] ExpandableSectionComponent.tsx ✅
- [ ] ExpandableCardComponent.tsx ✅
- [ ] AccordionSection.tsx ✅

### Special (2B.6) - 7 components
- [ ] AlertSection.tsx ✅
- [ ] StatsSection.tsx ✅
- [ ] DownloadSection.tsx ✅
- [ ] GallerySection.tsx ✅
- [ ] CardListSection.tsx ✅
- [ ] ProgressSection.tsx ✅
- [ ] TagsSection.tsx ✅

### Navigation System (2B.7) - 6 components
- [ ] NavigationProvider.tsx ✅
- [ ] Breadcrumbs.tsx ✅
- [ ] PageTree.tsx ✅
- [ ] TabBar.tsx ✅
- [ ] NavigationButtons.tsx ✅
- [ ] ProgressIndicator.tsx ✅

### Popup System (2B.8)
- [ ] PopupRenderer.tsx ✅
- [ ] Popup management hooks ✅

### Custom Hooks (2B.9) - 5 hooks
- [ ] useTemplateParser.ts ✅
- [ ] useNavigation.ts ✅
- [ ] usePopup.ts ✅
- [ ] useClickAction.ts ✅
- [ ] useAnimation.ts ✅

### Testing
- [ ] Unit tests for all 31 sections ✅
- [ ] Integration tests (3 example cards) ✅
- [ ] Accessibility tests ✅
- [ ] Visual regression tests ✅
- [ ] Performance tests ✅

### Final Verification
- [ ] All tests passing (100%) ✅
- [ ] Zero console errors ✅
- [ ] UNIFIED_LAYOUT_SPECIFICATION applied ✅
- [ ] WCAG 2.1 AA compliance ✅
- [ ] Performance targets met ✅
- [ ] Documentation complete ✅

---

## Quality Standards (NON-NEGOTIABLE)

### Test-First Development (TDD)
- ✅ Write test BEFORE implementation (EVERY component)
- ✅ Run test (expect red/fail)
- ✅ Implement minimal code to pass
- ✅ Run test (expect green/pass)
- ✅ Refactor if needed
- ✅ Run test again (still green)

### Styling Standards
- ✅ Use UNIFIED_LAYOUT_SPECIFICATION (NO custom colors/fonts/spacing)
- ✅ Use Tailwind utility classes (NO inline styles)
- ✅ Support light and dark modes (ALWAYS)
- ✅ Support mobile/tablet/desktop (ALWAYS)

### Accessibility Standards
- ✅ WCAG 2.1 AA compliance (MANDATORY)
- ✅ Keyboard navigation (MANDATORY)
- ✅ Screen reader friendly (MANDATORY)
- ✅ Proper ARIA labels (MANDATORY)
- ✅ Semantic HTML (MANDATORY)

### Performance Standards
- ✅ Render page <200ms (MANDATORY)
- ✅ Navigate <50ms (MANDATORY)
- ✅ Animations 60fps (MANDATORY)
- ✅ No memory leaks (MANDATORY)

---

## Next Steps

**After Phase 2B Complete:**

1. **Integration Testing** - Test with all 18 example files from Phase 1
2. **User Acceptance Testing** - Get feedback from content creators
3. **Performance Optimization** - Profile and optimize bottlenecks
4. **Documentation** - Complete user and developer docs
5. **Phase 3: Migration** - Convert existing observability card to new system

---

**END OF PHASE 2B PLAN**

**Status:** READY FOR IMPLEMENTATION ✅
**Quality Standard:** RIGHT THE FIRST TIME - Test-first approach MANDATORY
**Estimated Effort:** 3-4 hours (with comprehensive testing)
**Date:** December 17, 2024

**Remember:** Testing is NOT optional. Quality is NOT negotiable. Apply UNIFIED_LAYOUT_SPECIFICATION. No custom styling in components.
