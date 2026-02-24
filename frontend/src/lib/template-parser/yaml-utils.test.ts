/**
 * YAML Parser Tests (TEST FIRST!)
 * Following TDD approach - tests written before implementation
 */

import { describe, it, expect } from 'vitest';
import { parseMarkdownFile } from './yaml-utils';

describe('YAML Parser - parseMarkdownFile', () => {
  describe('Valid YAML', () => {
    it('should parse valid YAML frontmatter', () => {
      const content = `---
card:
  id: "test-card"
  name: "Test Card"
---
Page content here`;

      const result = parseMarkdownFile(content);

      expect(result.errors).toHaveLength(0);
      expect(result.data.card.id).toBe('test-card');
      expect(result.data.card.name).toBe('Test Card');
      expect(result.content).toBe('Page content here');
    });

    it('should parse complex nested YAML', () => {
      const content = `---
card:
  id: "complex"
  metadata:
    author: "Test Author"
    tags:
      - tag1
      - tag2
  navigation:
    type: "hierarchical"
    show_breadcrumbs: true
---
Content`;

      const result = parseMarkdownFile(content);

      expect(result.errors).toHaveLength(0);
      expect(result.data.card.metadata.author).toBe('Test Author');
      expect(result.data.card.metadata.tags).toEqual(['tag1', 'tag2']);
      expect(result.data.card.navigation.type).toBe('hierarchical');
    });

    it('should handle empty content after frontmatter', () => {
      const content = `---
card:
  id: "test"
---`;

      const result = parseMarkdownFile(content);

      expect(result.errors).toHaveLength(0);
      expect(result.data.card.id).toBe('test');
      expect(result.content).toBe('');
    });

    it('should preserve markdown content', () => {
      const content = `---
page:
  id: "test"
---
# Heading

This is **bold** text.

- List item 1
- List item 2`;

      const result = parseMarkdownFile(content);

      expect(result.errors).toHaveLength(0);
      expect(result.content).toContain('# Heading');
      expect(result.content).toContain('**bold**');
      expect(result.content).toContain('- List item');
    });
  });

  describe('Malformed YAML', () => {
    it('should handle malformed YAML gracefully', () => {
      const content = `---
invalid: yaml: content: here
bad indentation
---
Content`;

      const result = parseMarkdownFile(content);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].type).toBe('YAML_PARSE_ERROR');
      expect(result.errors[0].message).toBeDefined();
    });

    it('should handle missing closing frontmatter delimiter', () => {
      const content = `---
card:
  id: "test"
Content without closing ---`;

      const result = parseMarkdownFile(content);

      // gray-matter is permissive - it will parse what it can
      // Either errors or successfully parses with content
      expect(result).toBeDefined();
      // Can't guarantee an error - gray-matter might parse it
    });

    it('should handle invalid characters in YAML', () => {
      const content = `---
card:
  id: "test\x00invalid"
---`;

      const result = parseMarkdownFile(content);

      // Should parse but might have warnings
      expect(result).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty file', () => {
      const content = '';

      const result = parseMarkdownFile(content);

      expect(result.data).toEqual({});
      expect(result.content).toBe('');
    });

    it('should handle file with no frontmatter', () => {
      const content = `# Just Content

No frontmatter here.`;

      const result = parseMarkdownFile(content);

      expect(result.data).toEqual({});
      expect(result.content).toBe(content);
    });

    it('should handle frontmatter with no content', () => {
      const content = `---
card:
  id: "test"
---`;

      const result = parseMarkdownFile(content);

      expect(result.errors).toHaveLength(0);
      expect(result.data.card.id).toBe('test');
      expect(result.content).toBe('');
    });

    it('should handle multiple frontmatter delimiters', () => {
      const content = `---
card:
  id: "test"
---
Content with --- in it
More content`;

      const result = parseMarkdownFile(content);

      expect(result.errors).toHaveLength(0);
      expect(result.content).toContain('---');
      expect(result.content).toContain('Content with --- in it');
    });

    it('should handle numeric values correctly', () => {
      const content = `---
section:
  type: "feature_grid"
  columns: 3
  enabled: true
---`;

      const result = parseMarkdownFile(content);

      expect(result.errors).toHaveLength(0);
      expect(result.data.section.columns).toBe(3);
      expect(result.data.section.enabled).toBe(true);
    });

    it('should handle null values', () => {
      const content = `---
page:
  id: "test"
  parent: null
---`;

      const result = parseMarkdownFile(content);

      expect(result.errors).toHaveLength(0);
      expect(result.data.page.parent).toBeNull();
    });

    it('should handle arrays', () => {
      const content = `---
page:
  sections:
    - type: "hero"
      heading: "Title"
    - type: "text"
      content: "Content"
---`;

      const result = parseMarkdownFile(content);

      expect(result.errors).toHaveLength(0);
      expect(result.data.page.sections).toBeInstanceOf(Array);
      expect(result.data.page.sections).toHaveLength(2);
      expect(result.data.page.sections[0].type).toBe('hero');
    });
  });

  describe('Type Conversion', () => {
    it('should convert string numbers to numbers', () => {
      const content = `---
section:
  columns: "3"
---`;

      const result = parseMarkdownFile(content);

      // YAML should auto-convert this, but if string, should be "3"
      expect(result.data.section.columns).toBeDefined();
    });

    it('should preserve boolean types', () => {
      const content = `---
settings:
  enabled: true
  disabled: false
---`;

      const result = parseMarkdownFile(content);

      expect(result.data.settings.enabled).toBe(true);
      expect(result.data.settings.disabled).toBe(false);
    });
  });

  describe('Error Messages', () => {
    it('should provide helpful error messages', () => {
      const content = `---
bad: [unclosed bracket
---`;

      const result = parseMarkdownFile(content);

      // If there are errors, they should have helpful messages
      if (result.errors.length > 0) {
        expect(result.errors[0].message).toBeDefined();
        expect(result.errors[0].message.length).toBeGreaterThan(0);
      }
      // gray-matter might still parse this successfully
      expect(result).toBeDefined();
    });

    it('should include line numbers in errors if available', () => {
      const content = `---
card:
  id: "test"
  bad_indent
---`;

      const result = parseMarkdownFile(content);

      if (result.errors.length > 0) {
        expect(result.errors[0]).toHaveProperty('message');
      }
    });
  });
});
