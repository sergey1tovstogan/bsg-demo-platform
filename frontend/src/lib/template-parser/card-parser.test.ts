/**
 * Card Parser Tests (TEST FIRST!)
 * Tests for parsing card definition files
 */

import { describe, it, expect } from 'vitest';
import { parseCardDefinition } from './card-parser';

describe('Card Parser', () => {
  describe('Required Fields', () => {
    it('should parse card with all required fields', () => {
      const content = `---
card:
  id: "simple-card"
  name: "Simple Card"
  category: "Examples"
  color_theme: "blue"
  icon: "BookOpen"
  agenda:
    file: "agenda.md"
  navigation:
    type: "hierarchical"
    show_breadcrumbs: true
    show_page_tree: true
    allow_back_to_agenda: true
  pages:
    - file: "pages/intro.md"
  settings:
    default_animation: "fade-in"
    transition_speed: "0.3s"
    max_depth: 5
---`;

      const result = parseCardDefinition(content);

      expect(result.errors).toHaveLength(0);
      expect(result.card).toBeDefined();
      expect(result.card?.id).toBe('simple-card');
      expect(result.card?.name).toBe('Simple Card');
      expect(result.card?.category).toBe('Examples');
      expect(result.card?.color_theme).toBe('blue');
      expect(result.card?.icon).toBe('BookOpen');
    });

    it('should error on missing id', () => {
      const content = `---
card:
  name: "Test Card"
  category: "Test"
  color_theme: "blue"
  icon: "icon"
---`;

      const result = parseCardDefinition(content);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('id');
    });

    it('should error on missing name', () => {
      const content = `---
card:
  id: "test"
  category: "Test"
  color_theme: "blue"
  icon: "icon"
---`;

      const result = parseCardDefinition(content);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('name');
    });

    it('should error on missing color_theme', () => {
      const content = `---
card:
  id: "test"
  name: "Test"
  category: "Test"
  icon: "icon"
---`;

      const result = parseCardDefinition(content);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('color_theme');
    });
  });

  describe('Optional Metadata', () => {
    it('should parse card with optional metadata', () => {
      const content = `---
card:
  id: "test"
  name: "Test"
  category: "Test"
  color_theme: "emerald"
  icon: "Star"
  description:
    short: "Short description"
    long: "Long description here"
  metadata:
    author: "Test Author"
    version: "1.0.0"
    last_updated: "2024-12-17"
    tags:
      - tag1
      - tag2
    difficulty: "intermediate"
    estimated_time: "30 minutes"
    status: "published"
  agenda:
    file: "agenda.md"
  navigation:
    type: "hierarchical"
    show_breadcrumbs: true
    show_page_tree: true
    allow_back_to_agenda: true
  pages: []
  settings:
    default_animation: "fade-in"
    transition_speed: "0.3s"
    max_depth: 5
---`;

      const result = parseCardDefinition(content);

      expect(result.errors).toHaveLength(0);
      expect(result.card?.description?.short).toBe('Short description');
      expect(result.card?.description?.long).toBe('Long description here');
      expect(result.card?.metadata?.author).toBe('Test Author');
      expect(result.card?.metadata?.version).toBe('1.0.0');
      expect(result.card?.metadata?.tags).toEqual(['tag1', 'tag2']);
      expect(result.card?.metadata?.difficulty).toBe('intermediate');
    });

    it('should work without optional metadata', () => {
      const content = `---
card:
  id: "minimal"
  name: "Minimal Card"
  category: "Test"
  color_theme: "violet"
  icon: "Circle"
  agenda:
    file: "agenda.md"
  navigation:
    type: "tabs"
    show_breadcrumbs: false
    show_page_tree: false
    allow_back_to_agenda: true
  pages: []
  settings:
    default_animation: "none"
    transition_speed: "0s"
    max_depth: 3
---`;

      const result = parseCardDefinition(content);

      expect(result.errors).toHaveLength(0);
      expect(result.card?.metadata).toBeUndefined();
      expect(result.card?.description).toBeUndefined();
    });
  });

  describe('Color Themes', () => {
    const themes = ['blue', 'emerald', 'violet', 'red', 'amber', 'indigo', 'cyan', 'pink', 'green', 'orange'];

    themes.forEach((theme) => {
      it(`should accept color_theme: ${theme}`, () => {
        const content = `---
card:
  id: "test"
  name: "Test"
  category: "Test"
  color_theme: "${theme}"
  icon: "icon"
  agenda:
    file: "agenda.md"
  navigation:
    type: "hierarchical"
    show_breadcrumbs: true
    show_page_tree: true
    allow_back_to_agenda: true
  pages: []
  settings:
    default_animation: "fade-in"
    transition_speed: "0.3s"
    max_depth: 5
---`;

        const result = parseCardDefinition(content);

        expect(result.errors).toHaveLength(0);
        expect(result.card?.color_theme).toBe(theme);
      });
    });

    it('should error on invalid color theme', () => {
      const content = `---
card:
  id: "test"
  name: "Test"
  category: "Test"
  color_theme: "invalid-color"
  icon: "icon"
  agenda:
    file: "agenda.md"
  navigation:
    type: "hierarchical"
    show_breadcrumbs: true
    show_page_tree: true
    allow_back_to_agenda: true
  pages: []
  settings:
    default_animation: "fade-in"
    transition_speed: "0.3s"
    max_depth: 5
---`;

      const result = parseCardDefinition(content);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.toLowerCase().includes('color') || e.message.includes('invalid-color'))).toBe(true);
    });
  });

  describe('Navigation Config', () => {
    it('should parse hierarchical navigation', () => {
      const content = `---
card:
  id: "test"
  name: "Test"
  category: "Test"
  color_theme: "blue"
  icon: "icon"
  agenda:
    file: "agenda.md"
  navigation:
    type: "hierarchical"
    show_breadcrumbs: true
    show_page_tree: true
    allow_back_to_agenda: true
  pages: []
  settings:
    default_animation: "fade-in"
    transition_speed: "0.3s"
    max_depth: 5
---`;

      const result = parseCardDefinition(content);

      expect(result.errors).toHaveLength(0);
      expect(result.card?.navigation.type).toBe('hierarchical');
      expect(result.card?.navigation.show_breadcrumbs).toBe(true);
      expect(result.card?.navigation.show_page_tree).toBe(true);
    });

    it('should parse tabs navigation', () => {
      const content = `---
card:
  id: "test"
  name: "Test"
  category: "Test"
  color_theme: "blue"
  icon: "icon"
  agenda:
    file: "agenda.md"
  navigation:
    type: "tabs"
    show_breadcrumbs: false
    show_page_tree: false
    allow_back_to_agenda: true
    tab_position: "top"
  pages: []
  settings:
    default_animation: "fade-in"
    transition_speed: "0.3s"
    max_depth: 3
---`;

      const result = parseCardDefinition(content);

      expect(result.errors).toHaveLength(0);
      expect(result.card?.navigation.type).toBe('tabs');
      expect(result.card?.navigation.tab_position).toBe('top');
    });

    it('should parse linear navigation', () => {
      const content = `---
card:
  id: "test"
  name: "Test"
  category: "Test"
  color_theme: "blue"
  icon: "icon"
  agenda:
    file: "agenda.md"
  navigation:
    type: "linear"
    show_breadcrumbs: false
    show_page_tree: false
    allow_back_to_agenda: true
    show_progress: true
    progress_style: "bar"
  pages: []
  settings:
    default_animation: "fade-in"
    transition_speed: "0.3s"
    max_depth: 3
---`;

      const result = parseCardDefinition(content);

      expect(result.errors).toHaveLength(0);
      expect(result.card?.navigation.type).toBe('linear');
      expect(result.card?.navigation.show_progress).toBe(true);
      expect(result.card?.navigation.progress_style).toBe('bar');
    });
  });

  describe('Page References', () => {
    it('should parse page references', () => {
      const content = `---
card:
  id: "test"
  name: "Test"
  category: "Test"
  color_theme: "blue"
  icon: "icon"
  agenda:
    file: "agenda.md"
  navigation:
    type: "hierarchical"
    show_breadcrumbs: true
    show_page_tree: true
    allow_back_to_agenda: true
  pages:
    - file: "pages/intro.md"
      order: 1
    - file: "pages/features.md"
      order: 2
  settings:
    default_animation: "fade-in"
    transition_speed: "0.3s"
    max_depth: 5
---`;

      const result = parseCardDefinition(content);

      expect(result.errors).toHaveLength(0);
      expect(result.card?.pages).toHaveLength(2);
      expect(result.card?.pages[0].file).toBe('pages/intro.md');
      expect(result.card?.pages[0].order).toBe(1);
    });

    it('should handle empty pages array', () => {
      const content = `---
card:
  id: "test"
  name: "Test"
  category: "Test"
  color_theme: "blue"
  icon: "icon"
  agenda:
    file: "agenda.md"
  navigation:
    type: "hierarchical"
    show_breadcrumbs: true
    show_page_tree: true
    allow_back_to_agenda: true
  pages: []
  settings:
    default_animation: "fade-in"
    transition_speed: "0.3s"
    max_depth: 5
---`;

      const result = parseCardDefinition(content);

      expect(result.errors).toHaveLength(0);
      expect(result.card?.pages).toEqual([]);
    });
  });

  describe('Settings', () => {
    it('should parse card settings', () => {
      const content = `---
card:
  id: "test"
  name: "Test"
  category: "Test"
  color_theme: "blue"
  icon: "icon"
  agenda:
    file: "agenda.md"
  navigation:
    type: "hierarchical"
    show_breadcrumbs: true
    show_page_tree: true
    allow_back_to_agenda: true
  pages: []
  settings:
    default_animation: "slide-in-up"
    transition_speed: "0.5s"
    max_depth: 10
    enable_search: true
    enable_bookmarks: true
    respect_reduced_motion: true
---`;

      const result = parseCardDefinition(content);

      expect(result.errors).toHaveLength(0);
      expect(result.card?.settings.default_animation).toBe('slide-in-up');
      expect(result.card?.settings.transition_speed).toBe('0.5s');
      expect(result.card?.settings.max_depth).toBe(10);
      expect(result.card?.settings.enable_search).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed YAML', () => {
      const content = `---
bad yaml: here:
---`;

      const result = parseCardDefinition(content);

      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should provide helpful error messages', () => {
      const content = `---
card:
  name: "Missing ID"
  category: "Test"
---`;

      const result = parseCardDefinition(content);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toBeDefined();
      expect(result.errors[0].message.length).toBeGreaterThan(0);
    });
  });
});
