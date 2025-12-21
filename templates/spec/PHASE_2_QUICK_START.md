# Phase 2 Quick Start - RIGHT THE FIRST TIME

**Purpose:** Resume Phase 2 implementation with MANDATORY quality standards
**Date:** December 17, 2024
**Quality Level:** HIGHEST - Zero tolerance for skipped tests

---

## ⚠️ CRITICAL: READ THIS FIRST

### 🎯 RIGHT THE FIRST TIME PRINCIPLE

**This is NOT a rush job. This is a QUALITY implementation.**

**MANDATORY Requirements:**
- ✅ **Test FIRST, implement SECOND** - Write tests before code
- ✅ **Verify IMMEDIATELY** - Test after each small change
- ✅ **Test INCREMENTALLY** - Don't batch testing at the end
- ✅ **Fix IMMEDIATELY** - No "I'll fix it later"
- ✅ **Document ISSUES** - Track everything
- ✅ **Quality over Speed** - Take time to do it RIGHT

### 🚫 ABSOLUTELY FORBIDDEN

- ❌ Skipping tests ("I'll test later")
- ❌ Implementing without tests
- ❌ Deferring bug fixes
- ❌ Rushing to "finish faster"
- ❌ Using `any` types in TypeScript
- ❌ Silent failures (errors must be visible)
- ❌ Untested edge cases
- ❌ Missing error handling

### ✅ Definition of Done

**A task is NOT done until:**
1. Implementation complete
2. Unit tests written AND passing
3. Integration tests written AND passing
4. Edge cases tested
5. Error handling tested
6. Manual verification completed
7. Performance benchmarked
8. Documentation updated
9. Code self-reviewed
10. Checklist 100% complete

**If any of the above is incomplete, THE TASK IS NOT DONE.**

---

## 📚 Planning Documents

Three documents guide Phase 2:

1. **PHASE_2_PARSER_PLAN.md** (Main plan - 2500+ lines)
   - Complete architecture
   - All 70+ files to create
   - Code examples
   - Comprehensive testing strategy
   - MANDATORY risk mitigations

2. **PHASE_2_REVIEW_CHECKLIST.md** (Verification - 600+ lines)
   - Feature-by-feature verification
   - Section type checklist
   - Integration testing steps

3. **PHASE_2_QUICK_START.md** (This file)
   - Quick resume guide
   - Quality requirements
   - Testing checklist
   - First steps

---

## 🔢 Key Numbers

### Phase 1 Deliverables (Completed ✅)
- **13** Template files
- **31** Section types documented
- **3** Navigation types documented
- **25+** Animations documented
- **3** Example cards (simple, medium, complex)
- **18** Total example files
- **6** Library pages
- **37** Total files
- **~202KB** Documentation

### Phase 2 Requirements (To Build with TESTS)
- **31** Section types to parse & render (100% coverage required)
- **3** Click action types
- **3** Navigation types
- **~70** Files to create
- **~200+** Unit tests to write
- **~50+** Integration tests to write
- **~4-8 hours** Estimated effort (with comprehensive testing)

---

## 🧪 TESTING REQUIREMENTS (MANDATORY)

### Test Coverage Requirements

**Parser Tests:**
- [ ] Unit test for EACH of 31 section types (31 tests minimum)
- [ ] Unit test for card parser (valid + invalid)
- [ ] Unit test for page parser (all 4 titles + parent)
- [ ] Unit test for navigation builder (hierarchy + breadcrumbs)
- [ ] Integration test: Parse all 18 example files
- [ ] Edge case test: Malformed YAML
- [ ] Edge case test: Missing required fields
- [ ] Edge case test: Circular references
- [ ] Edge case test: Orphaned pages
- [ ] Performance test: Parse <100ms per card

**Component Tests:**
- [ ] Unit test for EACH of 31 section components
- [ ] Rendering test (component renders)
- [ ] Props test (all props work)
- [ ] Click action test (navigates correctly)
- [ ] Hover effect test (CSS applies)
- [ ] Animation test (animations trigger)
- [ ] Expandable test (expand/collapse works)
- [ ] Accessibility test (ARIA labels, keyboard)

**Navigation Tests:**
- [ ] Breadcrumb generation (all 5 levels)
- [ ] Page tree structure (correct hierarchy)
- [ ] Tab navigation (tabs switch)
- [ ] Linear navigation (next/prev works)
- [ ] Back button (returns to parent)
- [ ] Back to Agenda (always works)

**Integration Tests:**
- [ ] Load simple-card → navigate → verify
- [ ] Load medium-card → popup → verify
- [ ] Load complex-card → 5 levels → verify
- [ ] Click feature grid → navigate
- [ ] Click image → show popup
- [ ] Expand accordion → verify content
- [ ] Navigate breadcrumb → correct page

**Performance Tests:**
- [ ] Parse card: <100ms
- [ ] Render page: <200ms
- [ ] Navigate: <50ms
- [ ] Memory: No leaks after 100 navigations
- [ ] File load: <50ms (with cache)

**Security Tests:**
- [ ] XSS attempt: `<script>alert('XSS')</script>` → blocked
- [ ] XSS attempt: `javascript:alert('XSS')` → blocked
- [ ] XSS attempt: Event handlers (onclick) → blocked
- [ ] HTML sanitization works

**Total Tests Required:** 200+ tests

**Coverage Target:** >90% code coverage

---

## 🚀 Implementation Sequence (Test-First!)

### Phase 2A: Foundation (2-3 hours) - CRITICAL PATH

**Each step follows this pattern:**
1. **Write test first** (TDD approach)
2. **Run test** (should fail - red)
3. **Implement minimal code** to pass test
4. **Run test** (should pass - green)
5. **Refactor** if needed
6. **Run test again** (still green)
7. **Write next test**
8. **Repeat**

#### Step 1: TypeScript Types (30-45 min)

**TEST CHECKLIST:**
- [ ] Create type-test.ts file
- [ ] Test type exports work
- [ ] Test discriminated unions work
- [ ] Test all 31 section types have interfaces
- [ ] Run `tsc --noEmit` - zero errors

**IMPLEMENTATION:**
- [ ] Create `frontend/src/lib/template-types/` directory
- [ ] Create index.ts (exports)
- [ ] Create card.types.ts (CardDefinition, CardMetadata, etc.)
- [ ] Create page.types.ts (PageDefinition, PageTitles, etc.)
- [ ] Create section.types.ts (ALL 31 section interfaces)
- [ ] Create navigation.types.ts (NavigationConfig, PageNode, etc.)
- [ ] Create animation.types.ts (AnimationType, etc.)
- [ ] Create popup.types.ts (PopupDefinition, etc.)

**VERIFICATION:**
- [ ] All files created (7 files)
- [ ] All types exported
- [ ] Zero TypeScript errors
- [ ] No `any` types
- [ ] TSDoc comments added
- [ ] All 31 section types have interfaces

**BEFORE NEXT STEP:** Verify checklist 100% complete

---

#### Step 2: YAML Parser (45 min)

**TEST FIRST:**
```typescript
// yaml-utils.test.ts
describe('parseMarkdownFile', () => {
  it('should parse valid YAML frontmatter', () => {
    const content = `---
card:
  id: "test"
  name: "Test"
---
Content`;
    const result = parseMarkdownFile(content);
    expect(result.data.card.id).toBe('test');
  });

  it('should handle malformed YAML', () => {
    const content = `---
invalid: yaml: content
---`;
    const result = parseMarkdownFile(content);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  // Add more tests...
});
```

**IMPLEMENT:** yaml-utils.ts

**TEST CHECKLIST:**
- [ ] Parse valid YAML
- [ ] Handle malformed YAML
- [ ] Validate required fields
- [ ] Type conversion works
- [ ] Empty file handled
- [ ] No frontmatter handled
- [ ] Invalid characters handled
- [ ] All tests pass

**VERIFICATION:**
- [ ] Run `npm test -- yaml-utils`
- [ ] All tests pass (green)
- [ ] Error messages are helpful
- [ ] Documentation complete

---

#### Step 3: File Loader (45 min)

**TEST FIRST:**
```typescript
// file-loader.test.ts
describe('FileLoader', () => {
  it('should load existing file', async () => {
    const loader = new FileLoader();
    const content = await loader.loadFile('/content/pages/cards/simple-card/card-definition.md');
    expect(content).toBeDefined();
  });

  it('should handle 404 errors', async () => {
    const loader = new FileLoader();
    await expect(loader.loadFile('/nonexistent.md')).rejects.toThrow();
  });

  it('should cache files', async () => {
    const loader = new FileLoader();
    const first = await loader.loadFile('/test.md');
    const second = await loader.loadFile('/test.md'); // Should be cached
    expect(first).toBe(second); // Same object reference
  });

  // Add more tests...
});
```

**IMPLEMENT:** file-loader.ts

**TEST CHECKLIST:**
- [ ] Load existing file
- [ ] Handle 404
- [ ] Cache works
- [ ] Cache clear works
- [ ] Library path resolution
- [ ] Load all 18 example files
- [ ] Network error handling
- [ ] Retry logic works
- [ ] All tests pass

**VERIFICATION:**
- [ ] Run `npm test -- file-loader`
- [ ] All 18 files load successfully
- [ ] Performance <50ms per file (with cache)
- [ ] Error handling works

---

#### Step 4: Card Parser (30 min)

**TEST FIRST:** Write test for simple-card

**TEST CHECKLIST:**
- [ ] Parse required fields (id, name, category, color_theme, icon)
- [ ] Parse optional metadata
- [ ] Parse navigation config
- [ ] Parse page references
- [ ] Parse simple-card
- [ ] Parse medium-card
- [ ] Parse complex-card
- [ ] Missing required field → helpful error
- [ ] Invalid color_theme → error
- [ ] All tests pass

**VERIFICATION:**
- [ ] All 3 cards parse
- [ ] Error messages helpful

---

#### Step 5: Page Parser (30 min)

**TEST FIRST:** Write test for intro page

**TEST CHECKLIST:**
- [ ] Parse all 4 title variants
- [ ] Parse parent reference
- [ ] Parse sections array
- [ ] Parse sub_pages
- [ ] Parse popups
- [ ] Parse each of 18 pages
- [ ] Missing title → error
- [ ] Invalid parent → error
- [ ] All tests pass

---

#### Step 6: Section Parser (1 hour) **CRITICAL**

**THIS IS THE MOST IMPORTANT PART - DO NOT RUSH**

**TEST FIRST:** Write test for EACH section type

```typescript
// section-parser.test.ts
describe('parseSectionType', () => {
  describe('hero section', () => {
    it('should parse valid hero section', () => {
      const data = { type: 'hero', heading: 'Test', subtitle: 'Subtitle' };
      const result = parseSectionType(data);
      expect(result.type).toBe('hero');
      expect(result.heading).toBe('Test');
    });

    it('should require heading', () => {
      const data = { type: 'hero' }; // Missing heading
      expect(() => parseSectionType(data)).toThrow('heading is required');
    });
  });

  // Repeat for ALL 31 section types!
  describe('text section', () => { /* ... */ });
  describe('image section', () => { /* ... */ });
  // ... 28 more describe blocks
});
```

**31 SECTION TYPE TEST CHECKLIST:**
- [ ] hero (required: heading)
- [ ] text (required: content)
- [ ] text_with_links (required: content)
- [ ] image (required: image, alt)
- [ ] image_clickable (required: image, alt, click_action)
- [ ] video (required: video_url)
- [ ] code_block (required: language, code)
- [ ] quote (required: content)
- [ ] divider (optional: style)
- [ ] embed (required: url)
- [ ] feature_grid (required: columns, features)
- [ ] clickable_cards (required: columns, cards)
- [ ] tabbed_content (required: tabs)
- [ ] interactive_diagram (required: image, hotspots)
- [ ] list (required: list_style, items)
- [ ] comparison_grid (required: columns, items)
- [ ] key_value_pairs (required: pairs)
- [ ] steps (required: steps)
- [ ] timeline (required: events)
- [ ] table (required: headers, rows)
- [ ] expandable_section (required: trigger, collapsed, expanded)
- [ ] expandable_card (required: trigger, collapsed_title, expanded_content)
- [ ] accordion (required: allow_multiple, items)
- [ ] alert (required: alert_type, content)
- [ ] stats (required: stats)
- [ ] download (required: files)
- [ ] gallery (required: columns, images)
- [ ] card_list (required: items)
- [ ] progress (required: items)
- [ ] tags (required: tags)
- [ ] loading (required: style)

**VERIFICATION:**
- [ ] Run `npm test -- section-parser`
- [ ] ALL 31 section types pass
- [ ] Click actions parse
- [ ] Hover effects parse
- [ ] Animations parse
- [ ] Parse all sections from 18 example pages
- [ ] Unknown section type → error
- [ ] Missing field → helpful error
- [ ] Checklist 100% complete

**DO NOT SKIP ANY SECTION TYPE - THIS IS CRITICAL**

---

#### Step 7: Navigation Builder (45 min)

**TEST FIRST:** Write test for 5-level hierarchy

**TEST CHECKLIST:**
- [ ] Build hierarchy from parent fields
- [ ] Detect circular references
- [ ] Detect orphaned pages
- [ ] Generate breadcrumbs
- [ ] Find siblings
- [ ] Build complex-card (5 levels!)
- [ ] Circular ref (A→B→A) → error
- [ ] Orphaned page → warning
- [ ] Duplicate ID → error
- [ ] All tests pass

**VERIFICATION:**
- [ ] Navigate to level 5
- [ ] Breadcrumbs show all 5 levels
- [ ] Page tree structure correct
- [ ] Performance <50ms for 100 pages

---

### Phase 2A Final Verification (MANDATORY)

**DO NOT PROCEED TO PHASE 2B UNTIL ALL CHECKS PASS:**

- [ ] All unit tests pass (`npm test -- parser`)
- [ ] All integration tests pass
- [ ] Parse simple-card ✅
- [ ] Parse medium-card ✅
- [ ] Parse complex-card (5 levels!) ✅
- [ ] All 18 example files parse ✅
- [ ] All 31 section types parse ✅
- [ ] Navigation hierarchy builds ✅
- [ ] Performance <100ms per card ✅
- [ ] Zero TypeScript errors ✅
- [ ] Error messages helpful ✅
- [ ] Documentation complete ✅
- [ ] Code reviewed ✅

**Phase 2A Status:** [ ] COMPLETE (check when done)

---

## 🛡️ Risk Mitigation (MANDATORY)

### Must Implement These Safeguards

#### 1. Circular Reference Detection
```typescript
// MANDATORY: Implement this in navigation-builder.ts
function detectCircularReferences(pages: Map<string, PageDefinition>): string[] {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const cycles: string[] = [];

  function dfs(pageId: string, path: string[]) {
    if (recursionStack.has(pageId)) {
      cycles.push(`Circular reference: ${path.join(' → ')} → ${pageId}`);
      return;
    }
    if (visited.has(pageId)) return;

    visited.add(pageId);
    recursionStack.add(pageId);

    const page = pages.get(pageId);
    if (page?.parent) {
      dfs(page.parent, [...path, pageId]);
    }

    recursionStack.delete(pageId);
  }

  pages.forEach((_, id) => dfs(id, []));
  return cycles;
}
```

#### 2. Schema Validation with Zod
```typescript
// MANDATORY: Use Zod for runtime validation
import { z } from 'zod';

const HeroSectionSchema = z.object({
  type: z.literal('hero'),
  heading: z.string().min(1, 'Heading is required'),
  subtitle: z.string().optional(),
  align: z.enum(['left', 'center', 'right']).optional()
});

// Use in parser:
const result = HeroSectionSchema.safeParse(data);
if (!result.success) {
  throw new Error(`Hero section validation failed: ${result.error.message}`);
}
```

#### 3. Performance Monitoring
```typescript
// MANDATORY: Profile all operations
function profileOperation<T>(name: string, fn: () => T): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  const duration = end - start;

  console.log(`[PROFILE] ${name}: ${duration.toFixed(2)}ms`);

  if (duration > 100) {
    console.warn(`[SLOW] ${name} took ${duration.toFixed(2)}ms (>100ms target)`);
  }

  return result;
}

// Usage:
const card = profileOperation('Parse card definition', () => parseCardDefinition(content));
```

#### 4. Error Boundaries
```typescript
// MANDATORY: Wrap all renderers
class TemplateErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Template Error]', error, errorInfo);
    // Log to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorDisplay error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

---

## 📋 Daily Checklist

**At start of each work session:**
- [ ] Read PHASE_2_PARSER_PLAN.md (risk mitigation section)
- [ ] Review what was completed last session
- [ ] Verify all tests still pass (`npm test`)
- [ ] Clear head - no rushing

**During implementation:**
- [ ] Write test FIRST
- [ ] Implement minimal code
- [ ] Run test (expect green)
- [ ] Refactor if needed
- [ ] Run test again
- [ ] Commit with meaningful message
- [ ] Move to next test

**At end of each task:**
- [ ] All tests pass
- [ ] All checklists complete
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Performance checked
- [ ] Mark task as DONE

**At end of each session:**
- [ ] Run full test suite
- [ ] Fix any failures
- [ ] Commit all work
- [ ] Update progress in plan
- [ ] Note any blockers

---

## 🎯 Success Criteria (Non-Negotiable)

### Parser Success
- [ ] Parse ALL 31 section types
- [ ] Parse ALL 18 example files
- [ ] Build correct 5-level hierarchy
- [ ] Generate accurate breadcrumbs
- [ ] Detect circular references
- [ ] Handle ALL error cases
- [ ] Performance <100ms per card
- [ ] 100% test coverage for parsers

### Quality Success
- [ ] Zero `any` types
- [ ] Zero TypeScript errors
- [ ] All tests pass (200+ tests)
- [ ] >90% code coverage
- [ ] Helpful error messages
- [ ] Complete documentation
- [ ] Performance targets met
- [ ] Security tests pass

### Integration Success
- [ ] Load simple-card
- [ ] Load medium-card
- [ ] Load complex-card (5 levels!)
- [ ] All sections render
- [ ] All navigation works
- [ ] All popups work
- [ ] All click actions work
- [ ] Zero console errors

**If ANY of the above fails, Phase 2 is NOT complete.**

---

## 🔧 Tools & Setup

### Required Packages
```bash
npm install --save gray-matter js-yaml react-markdown
npm install --save-dev @types/react-markdown zod @testing-library/react vitest
```

### Test Setup
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      reporter: ['text', 'html'],
      threshold: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90
      }
    }
  }
});
```

### VS Code Settings (Recommended)
```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "editor.codeActionsOnSave": {
    "source.fixAll": true
  },
  "editor.formatOnSave": true
}
```

---

## 🚨 Red Flags - STOP if You See These

**STOP and reassess if:**
- ❌ Tests are failing but you keep coding
- ❌ You're tempted to skip a test
- ❌ Error messages are cryptic
- ❌ Performance is slow but "good enough"
- ❌ TypeScript errors but "it compiles"
- ❌ Code is getting messy
- ❌ You don't understand what you just wrote
- ❌ You're rushing to finish

**If you see any red flag, STOP and:**
1. Review the code
2. Refactor if needed
3. Add missing tests
4. Fix all errors
5. Only then continue

---

## 💡 Remember

> "Weeks of coding can save you hours of planning."

**This is the PLANNING phase completed.**
**The IMPLEMENTATION phase requires DISCIPLINE.**

- **Quality over speed**
- **Tests over features**
- **Right the first time over quick and broken**

**You are building the foundation for the entire system.**
**If the parser is broken, everything is broken.**
**Take the time to do it RIGHT.**

---

## 📞 Next Action

**Start with Phase 2A, Task 1:**

1. Create `frontend/src/lib/template-types/` directory
2. Create type definition files (7 files)
3. Write type tests
4. Run `tsc --noEmit`
5. Verify all 31 section types have interfaces
6. Complete checklist
7. Move to Task 2

**DO NOT SKIP STEPS**
**DO NOT RUSH**
**DO IT RIGHT**

---

**Status:** READY TO IMPLEMENT ✅

**Quality Standard:** HIGHEST - Right the first time

**Estimated Time:** 4-8 hours (with comprehensive testing)

**Date:** December 17, 2024

**Remember:** Testing is NOT optional. Quality is NOT negotiable.
