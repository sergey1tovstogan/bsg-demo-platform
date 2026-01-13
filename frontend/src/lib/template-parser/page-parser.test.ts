/**
 * Page Parser Tests (TEST FIRST!)
 * Tests for parsing page definition files with all 4 title variants
 */

import { describe, it, expect } from 'vitest';
import { parsePageDefinition } from './page-parser';

describe('Page Parser', () => {
  describe('Required Fields - All 4 Title Variants', () => {
    it('should parse page with all 4 title variants', () => {
      const content = `---
page:
  id: "intro-page"
  titles:
    page_header: "Introduction to the Platform"
    menu_title: "Introduction"
    agenda_title: "Getting Started: Introduction"
    breadcrumb: "Intro"
  parent: null
  sections: []
---`;

      const result = parsePageDefinition(content);

      expect(result.errors).toHaveLength(0);
      expect(result.page).toBeDefined();
      expect(result.page?.id).toBe('intro-page');
      expect(result.page?.titles.page_header).toBe('Introduction to the Platform');
      expect(result.page?.titles.menu_title).toBe('Introduction');
      expect(result.page?.titles.agenda_title).toBe('Getting Started: Introduction');
      expect(result.page?.titles.breadcrumb).toBe('Intro');
    });

    it('should error on missing id', () => {
      const content = `---
page:
  titles:
    page_header: "Test"
    menu_title: "Test"
    agenda_title: "Test"
    breadcrumb: "Test"
  parent: null
  sections: []
---`;

      const result = parsePageDefinition(content);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('id'))).toBe(true);
    });

    it('should error on missing titles', () => {
      const content = `---
page:
  id: "test"
  parent: null
  sections: []
---`;

      const result = parsePageDefinition(content);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('titles'))).toBe(true);
    });

    it('should error on missing page_header', () => {
      const content = `---
page:
  id: "test"
  titles:
    menu_title: "Test"
    agenda_title: "Test"
    breadcrumb: "Test"
  parent: null
  sections: []
---`;

      const result = parsePageDefinition(content);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('page_header'))).toBe(true);
    });

    it('should error on missing menu_title', () => {
      const content = `---
page:
  id: "test"
  titles:
    page_header: "Test"
    agenda_title: "Test"
    breadcrumb: "Test"
  parent: null
  sections: []
---`;

      const result = parsePageDefinition(content);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('menu_title'))).toBe(true);
    });

    it('should error on missing agenda_title', () => {
      const content = `---
page:
  id: "test"
  titles:
    page_header: "Test"
    menu_title: "Test"
    breadcrumb: "Test"
  parent: null
  sections: []
---`;

      const result = parsePageDefinition(content);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('agenda_title'))).toBe(true);
    });

    it('should error on missing breadcrumb', () => {
      const content = `---
page:
  id: "test"
  titles:
    page_header: "Test"
    menu_title: "Test"
    agenda_title: "Test"
  parent: null
  sections: []
---`;

      const result = parsePageDefinition(content);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('breadcrumb'))).toBe(true);
    });
  });

  describe('Parent Reference', () => {
    it('should parse page with null parent (root page)', () => {
      const content = `---
page:
  id: "root-page"
  titles:
    page_header: "Root Page"
    menu_title: "Root"
    agenda_title: "Root"
    breadcrumb: "Root"
  parent: null
  sections: []
---`;

      const result = parsePageDefinition(content);

      expect(result.errors).toHaveLength(0);
      expect(result.page?.parent).toBeNull();
    });

    it('should parse page with parent reference', () => {
      const content = `---
page:
  id: "child-page"
  titles:
    page_header: "Child Page"
    menu_title: "Child"
    agenda_title: "Child"
    breadcrumb: "Child"
  parent: "parent-page-id"
  sections: []
---`;

      const result = parsePageDefinition(content);

      expect(result.errors).toHaveLength(0);
      expect(result.page?.parent).toBe('parent-page-id');
    });
  });

  describe('Optional Fields', () => {
    it('should parse page with descriptions', () => {
      const content = `---
page:
  id: "test"
  titles:
    page_header: "Test"
    menu_title: "Test"
    agenda_title: "Test"
    breadcrumb: "Test"
  description:
    short: "Short description"
    long: "This is a longer description of the page content"
  parent: null
  sections: []
---`;

      const result = parsePageDefinition(content);

      expect(result.errors).toHaveLength(0);
      expect(result.page?.description?.short).toBe('Short description');
      expect(result.page?.description?.long).toBe('This is a longer description of the page content');
    });

    it('should parse page with metadata', () => {
      const content = `---
page:
  id: "test"
  titles:
    page_header: "Test"
    menu_title: "Test"
    agenda_title: "Test"
    breadcrumb: "Test"
  metadata:
    author: "Test Author"
    version: "1.0.0"
    last_updated: "2024-12-17"
    tags:
      - tutorial
      - beginner
    difficulty: "intermediate"
    estimated_time: "15 minutes"
  parent: null
  sections: []
---`;

      const result = parsePageDefinition(content);

      expect(result.errors).toHaveLength(0);
      expect(result.page?.metadata?.author).toBe('Test Author');
      expect(result.page?.metadata?.tags).toEqual(['tutorial', 'beginner']);
      expect(result.page?.metadata?.difficulty).toBe('intermediate');
    });

    it('should parse page with icon', () => {
      const content = `---
page:
  id: "test"
  titles:
    page_header: "Test"
    menu_title: "Test"
    agenda_title: "Test"
    breadcrumb: "Test"
  icon: "BookOpen"
  parent: null
  sections: []
---`;

      const result = parsePageDefinition(content);

      expect(result.errors).toHaveLength(0);
      expect(result.page?.icon).toBe('BookOpen');
    });

    it('should parse page with navigation settings', () => {
      const content = `---
page:
  id: "test"
  titles:
    page_header: "Test"
    menu_title: "Test"
    agenda_title: "Test"
    breadcrumb: "Test"
  parent: null

navigation:
  show_breadcrumbs: true
  show_back_button: true
  show_next_previous: true
  back_to_agenda_button: true
  siblings:
    previous: "prev-page-id"
    next: "next-page-id"

sections: []
---`;

      const result = parsePageDefinition(content);

      expect(result.errors).toHaveLength(0);
      expect(result.page?.navigation?.show_breadcrumbs).toBe(true);
      expect(result.page?.navigation?.siblings?.previous).toBe('prev-page-id');
      expect(result.page?.navigation?.siblings?.next).toBe('next-page-id');
    });
  });

  describe('Sections Array', () => {
    it('should parse page with empty sections', () => {
      const content = `---
page:
  id: "test"
  titles:
    page_header: "Test"
    menu_title: "Test"
    agenda_title: "Test"
    breadcrumb: "Test"
  parent: null
  sections: []
---`;

      const result = parsePageDefinition(content);

      expect(result.errors).toHaveLength(0);
      expect(result.page?.sections).toEqual([]);
    });

    it('should parse page with sections', () => {
      const content = `---
page:
  id: "test"
  titles:
    page_header: "Test"
    menu_title: "Test"
    agenda_title: "Test"
    breadcrumb: "Test"
  parent: null

sections:
  - type: "hero"
    heading: "Welcome"
    subtitle: "Get started here"
  - type: "text"
    content: "This is some text content"
  - type: "divider"
---`;

      const result = parsePageDefinition(content);

      expect(result.errors).toHaveLength(0);
      expect(result.page?.sections).toHaveLength(3);
      expect(result.page?.sections[0].type).toBe('hero');
      expect(result.page?.sections[1].type).toBe('text');
      expect(result.page?.sections[2].type).toBe('divider');
    });
  });

  describe('Sub-pages', () => {
    it('should parse page with sub-pages', () => {
      const content = `---
page:
  id: "parent"
  titles:
    page_header: "Parent Page"
    menu_title: "Parent"
    agenda_title: "Parent"
    breadcrumb: "Parent"
  parent: null
  sections: []
  sub_pages:
    - file: "pages/child1.md"
      order: 1
    - file: "pages/child2.md"
      order: 2
---`;

      const result = parsePageDefinition(content);

      expect(result.errors).toHaveLength(0);
      expect(result.page?.sub_pages).toHaveLength(2);
      expect(result.page?.sub_pages?.[0].file).toBe('pages/child1.md');
      expect(result.page?.sub_pages?.[0].order).toBe(1);
    });

    it('should handle missing sub_pages', () => {
      const content = `---
page:
  id: "test"
  titles:
    page_header: "Test"
    menu_title: "Test"
    agenda_title: "Test"
    breadcrumb: "Test"
  parent: null
  sections: []
---`;

      const result = parsePageDefinition(content);

      expect(result.errors).toHaveLength(0);
      expect(result.page?.sub_pages).toBeUndefined();
    });
  });

  describe('Popups', () => {
    it('should parse page with popups', () => {
      const content = `---
page:
  id: "test"
  titles:
    page_header: "Test"
    menu_title: "Test"
    agenda_title: "Test"
    breadcrumb: "Test"
  parent: null
  sections: []
  popups:
    - id: "popup-1"
      size: "medium"
      title: "Test Popup"
      content: "Popup content here"
      actions:
        - label: "Close"
          action:
            type: "close_popup"
---`;

      const result = parsePageDefinition(content);

      expect(result.errors).toHaveLength(0);
      expect(result.page?.popups).toHaveLength(1);
      expect(result.page?.popups?.[0].id).toBe('popup-1');
      expect(result.page?.popups?.[0].size).toBe('medium');
      expect(result.page?.popups?.[0].title).toBe('Test Popup');
    });

    it('should handle missing popups', () => {
      const content = `---
page:
  id: "test"
  titles:
    page_header: "Test"
    menu_title: "Test"
    agenda_title: "Test"
    breadcrumb: "Test"
  parent: null
  sections: []
---`;

      const result = parsePageDefinition(content);

      expect(result.errors).toHaveLength(0);
      expect(result.page?.popups).toBeUndefined();
    });
  });

  describe('Complete Page Example', () => {
    it('should parse complete page with all features', () => {
      const content = `---
page:
  id: "complete-page"
  titles:
    page_header: "Complete Example Page"
    menu_title: "Example"
    agenda_title: "Complete Example"
    breadcrumb: "Example"
  description:
    short: "A complete page example"
    long: "This page demonstrates all available features"
  metadata:
    author: "Demo Author"
    version: "1.0.0"
    tags:
      - example
      - complete
    difficulty: "intermediate"
  parent: "parent-id"
  icon: "FileText"
  sub_pages:
    - file: "child1.md"
  popups:
    - id: "popup1"
      size: "small"
      title: "Info"
      content: "Information"
      actions:
        - label: "OK"
          action:
            type: "close_popup"

navigation:
  show_breadcrumbs: true
  show_back_button: true

sections:
  - type: "hero"
    heading: "Welcome"
  - type: "text"
    content: "Content here"
---`;

      const result = parsePageDefinition(content);

      expect(result.errors).toHaveLength(0);
      expect(result.page?.id).toBe('complete-page');
      expect(result.page?.titles.page_header).toBe('Complete Example Page');
      expect(result.page?.parent).toBe('parent-id');
      expect(result.page?.sections).toHaveLength(2);
      expect(result.page?.sub_pages).toHaveLength(1);
      expect(result.page?.popups).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed YAML', () => {
      const content = `---
bad yaml: here:
---`;

      const result = parsePageDefinition(content);

      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should provide helpful error messages', () => {
      const content = `---
page:
  id: "test"
  titles:
    page_header: "Missing other titles"
  parent: null
---`;

      const result = parsePageDefinition(content);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toBeDefined();
      expect(result.errors[0].message.length).toBeGreaterThan(0);
    });
  });
});
