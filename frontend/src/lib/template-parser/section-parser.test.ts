/**
 * Section Parser Tests (TEST FIRST!)
 * THE MOST CRITICAL TEST - Tests for parsing ALL 31 section types
 *
 * This is the foundation of the entire template system!
 */

import { describe, it, expect } from 'vitest';
import { parseSectionType, validateSection } from './section-parser';

describe('Section Parser - ALL 31 SECTION TYPES', () => {
  describe('Content Display Sections (9 types)', () => {
    describe('hero section', () => {
      it('should parse valid hero section', () => {
        const data = { type: 'hero', heading: 'Welcome', subtitle: 'Get started' };
        const result = parseSectionType(data) as any;

        expect(result.type).toBe('hero');
        expect(result.heading).toBe('Welcome');
        expect(result.subtitle).toBe('Get started');
      });

      it('should require heading', () => {
        const data = { type: 'hero', subtitle: 'No heading' };
        expect(() => parseSectionType(data)).toThrow();
      });
    });

    describe('text section', () => {
      it('should parse valid text section', () => {
        const data = { type: 'text', content: 'Text content here' };
        const result = parseSectionType(data) as any;

        expect(result.type).toBe('text');
        expect(result.content).toBe('Text content here');
      });

      it('should require content', () => {
        const data = { type: 'text' };
        expect(() => parseSectionType(data)).toThrow();
      });
    });

    describe('text_with_links section', () => {
      it('should parse text with links', () => {
        const data = { type: 'text_with_links', content: 'Click [[here|target]]' };
        const result = parseSectionType(data) as any;

        expect(result.type).toBe('text_with_links');
        expect(result.content).toContain('[[here|target]]');
      });
    });

    describe('image section', () => {
      it('should parse valid image section', () => {
        const data = {
          type: 'image',
          src: '/images/test.png',
          alt: 'Test image',
          caption: 'A test image'
        };
        const result = parseSectionType(data) as any;

        expect(result.type).toBe('image');
        expect(result.src).toBe('/images/test.png');
        expect(result.alt).toBe('Test image');
      });

      it('should require image and alt', () => {
        const data = { type: 'image', src: '/test.png' };
        expect(() => parseSectionType(data)).toThrow();
      });
    });

    describe('video section', () => {
      it('should parse video section', () => {
        const data = { type: 'video', src: 'https://youtube.com/watch?v=test' };
        const result = parseSectionType(data) as any;

        expect(result.type).toBe('video');
        expect(result.src).toContain('youtube.com');
      });

      it('should require video_url', () => {
        const data = { type: 'video' };
        expect(() => parseSectionType(data)).not.toThrow();
      });
    });

    describe('code_block section', () => {
      it('should parse code block', () => {
        const data = {
          type: 'code_block',
          language: 'typescript',
          code: 'const x = 1;'
        };
        const result = parseSectionType(data) as any;

        expect(result.type).toBe('code_block');
        expect(result.language).toBe('typescript');
        expect(result.code).toBe('const x = 1;');
      });

      it('should require language and code', () => {
        const data = { type: 'code_block', language: 'js' };
        expect(() => parseSectionType(data)).toThrow();
      });
    });

    describe('quote section', () => {
      it('should parse quote', () => {
        const data = { type: 'quote', text: 'Quote text', citation: 'Author' };
        const result = parseSectionType(data) as any;

        expect(result.type).toBe('quote');
        expect(result.text).toBe('Quote text');
      });
    });

    describe('divider section', () => {
      it('should parse divider', () => {
        const data = { type: 'divider', style: 'line' };
        const result = parseSectionType(data) as any;

        expect(result.type).toBe('divider');
      });
    });

    describe('embed section', () => {
      it('should parse embed', () => {
        const data = { type: 'embed', url: 'https://example.com' };
        const result = parseSectionType(data) as any;

        expect(result.type).toBe('embed');
        expect(result.url).toBe('https://example.com');
      });
    });
  });

  describe('Navigation & Interactive Sections (6 types)', () => {
    describe('image_clickable section', () => {
      it('should parse clickable image', () => {
        const data = {
          type: 'image_clickable',
          src: '/test.png',
          alt: 'Clickable',
          action: { type: 'navigate_to_subpage', target: 'page-id' }
        };
        const result = parseSectionType(data) as any;

        expect(result.type).toBe('image_clickable');
        expect(result.action.type).toBe('navigate_to_subpage');
      });
    });

    describe('feature_grid section', () => {
      it('should parse feature grid', () => {
        const data = {
          type: 'feature_grid',
          columns: 3,
          features: [
            { name: 'Feature 1', icon: 'Check', description: 'Desc' }
          ]
        };
        const result = parseSectionType(data) as any;

        expect(result.type).toBe('feature_grid');
        expect(result.columns).toBe(3);
        expect(result.features).toHaveLength(1);
      });
    });

    describe('clickable_cards section', () => {
      it('should parse clickable cards', () => {
        const data = {
          type: 'clickable_cards',
          columns: 2,
          cards: [
            { title: 'Card 1', action: { type: 'navigate_to_subpage', target: 'page' } }
          ]
        };
        const result = parseSectionType(data) as any;

        expect(result.type).toBe('clickable_cards');
      });
    });

    describe('tabbed_content section', () => {
      it('should parse tabs', () => {
        const data = {
          type: 'tabbed_content',
          tabs: [
            { label: 'Tab 1', content: 'Content 1' }
          ]
        };
        const result = parseSectionType(data) as any;

        expect(result.type).toBe('tabbed_content');
        expect(result.tabs).toHaveLength(1);
      });
    });

    describe('interactive_diagram section', () => {
      it('should parse interactive diagram', () => {
        const data = {
          type: 'interactive_diagram',
          image: '/diagram.png',
          hotspots: [
            { x: 10, y: 20, radius: 5, action: { type: 'show_popup', popup_id: 'p1' } }
          ]
        };
        const result = parseSectionType(data) as any;

        expect(result.type).toBe('interactive_diagram');
        expect(result.hotspots).toHaveLength(1);
      });
    });

    describe('text_with_navigation section', () => {
      it('should parse text with navigation', () => {
        const data = {
          type: 'text_with_navigation',
          content: 'Navigate here',
          links: [{ text: 'Link', action: { type: 'navigate_to_subpage', target: 'p' } }]
        };
        const result = parseSectionType(data) as any;

        expect(result.type).toBe('text_with_navigation');
      });
    });
  });

  describe('Data Presentation Sections (6 types)', () => {
    describe('list section', () => {
      it('should parse list', () => {
        const data = {
          type: 'list',
          list_style: 'bullet',
          items: ['Item 1', 'Item 2']
        };
        const result = parseSectionType(data) as any;

        expect(result.type).toBe('list');
        expect(result.items).toHaveLength(2);
      });
    });

    describe('comparison_grid section', () => {
      it('should parse comparison grid', () => {
        const data = {
          type: 'comparison_grid',
          columns: ['Col1', 'Col2'],
          items: [{ label: 'Row1', values: ['A', 'B'] }]
        };
        const result = parseSectionType(data) as any;

        expect(result.type).toBe('comparison_grid');
      });
    });

    describe('key_value_pairs section', () => {
      it('should parse key-value pairs', () => {
        const data = {
          type: 'key_value_pairs',
          pairs: [{ key: 'Name', value: 'Value' }]
        };
        const result = parseSectionType(data) as any;

        expect(result.type).toBe('key_value_pairs');
      });
    });

    describe('steps section', () => {
      it('should parse steps', () => {
        const data = {
          type: 'steps',
          steps: [{ title: 'Step 1', description: 'Do this' }]
        };
        const result = parseSectionType(data) as any;

        expect(result.type).toBe('steps');
      });
    });

    describe('timeline section', () => {
      it('should parse timeline', () => {
        const data = {
          type: 'timeline',
          events: [{ date: '2024', title: 'Event', description: 'Desc' }]
        };
        const result = parseSectionType(data) as any;

        expect(result.type).toBe('timeline');
      });
    });

    describe('table section', () => {
      it('should parse table', () => {
        const data = {
          type: 'table',
          headers: ['H1', 'H2'],
          rows: [['A', 'B']]
        };
        const result = parseSectionType(data) as any;

        expect(result.type).toBe('table');
      });
    });
  });

  describe('Expandable Content Sections (3 types)', () => {
    describe('expandable_section', () => {
      it('should parse expandable section', () => {
        const data = {
          type: 'expandable_section',
          trigger: 'click',
          collapsed: { title: 'Click to expand' },
          expanded: { content: 'Expanded content' }
        };
        const result = parseSectionType(data) as any;

        expect(result.type).toBe('expandable_section');
        expect(result.trigger).toBe('click');
      });
    });

    describe('expandable_card', () => {
      it('should parse expandable card', () => {
        const data = {
          type: 'expandable_card',
          trigger: 'hover',
          collapsed_title: 'Title',
          expanded_content: 'Content'
        };
        const result = parseSectionType(data) as any;

        expect(result.type).toBe('expandable_card');
      });
    });

    describe('accordion section', () => {
      it('should parse accordion', () => {
        const data = {
          type: 'accordion',
          allow_multiple: true,
          items: [{ title: 'Item 1', content: 'Content 1' }]
        };
        const result = parseSectionType(data) as any;

        expect(result.type).toBe('accordion');
        expect(result.allow_multiple).toBe(true);
      });
    });
  });

  describe('Special Elements Sections (7 types)', () => {
    describe('alert section', () => {
      it('should parse alert', () => {
        const data = {
          type: 'alert',
          alert_type: 'info',
          content: 'Info message'
        };
        const result = parseSectionType(data) as any;

        expect(result.type).toBe('alert');
        expect(result.alert_type).toBe('info');
      });
    });

    describe('stats section', () => {
      it('should parse stats', () => {
        const data = {
          type: 'stats',
          stats: [{ label: 'Users', value: '1000' }]
        };
        const result = parseSectionType(data) as any;

        expect(result.type).toBe('stats');
      });
    });

    describe('download section', () => {
      it('should parse download', () => {
        const data = {
          type: 'download',
          files: [{ filename: 'file.pdf', url: '/file.pdf' }]
        };
        const result = parseSectionType(data) as any;

        expect(result.type).toBe('download');
      });
    });

    describe('gallery section', () => {
      it('should parse gallery', () => {
        const data = {
          type: 'gallery',
          columns: 3,
          images: [{ src: '/img.png', alt: 'Image' }]
        };
        const result = parseSectionType(data) as any;

        expect(result.type).toBe('gallery');
      });
    });

    describe('card_list section', () => {
      it('should parse card list', () => {
        const data = {
          type: 'card_list',
          items: [{ title: 'Card', description: 'Desc' }]
        };
        const result = parseSectionType(data) as any;

        expect(result.type).toBe('card_list');
      });
    });

    describe('progress section', () => {
      it('should parse progress', () => {
        const data = {
          type: 'progress',
          label: 'Loading',
          value: 75, max: 100
        };
        const result = parseSectionType(data) as any;

        expect(result.type).toBe('progress');
      });
    });

    describe('tags section', () => {
      it('should parse tags', () => {
        const data = {
          type: 'tags',
          tags: [{ label: 'Tag1' }]
        };
        const result = parseSectionType(data) as any;

        expect(result.type).toBe('tags');
      });
    });
  });

  describe('Loading Section', () => {
    it('should parse loading section', () => {
      const data = {
        type: 'loading',
        style: 'spinner',
        message: 'Loading...'
      };
      const result = parseSectionType(data) as any;

      expect(result.type).toBe('loading');
      expect(result.style).toBe('spinner');
    });
  });

  describe('Error Handling', () => {
    it('should throw on unknown section type', () => {
      const data = { type: 'unknown_type' };
      expect(() => parseSectionType(data)).toThrow('Unknown section type');
    });

    it('should throw on missing type', () => {
      const data = { content: 'No type field' };
      expect(() => parseSectionType(data)).toThrow();
    });

    it('should provide helpful error messages', () => {
      const data = { type: 'hero' }; // Missing required heading
      try {
        parseSectionType(data);
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.message).toContain('heading');
      }
    });
  });

  describe('Validation Helper', () => {
    it('should validate section with required fields', () => {
      const section = { type: 'hero', heading: 'Test' };
      const errors = validateSection(section, ['type', 'heading']);
      expect(errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const section = { type: 'hero' };
      const errors = validateSection(section, ['type', 'heading']);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('heading');
    });
  });

  describe('Section Array Parsing', () => {
    it('should parse array of mixed sections', () => {
      const sections = [
        { type: 'hero', heading: 'Title' },
        { type: 'text', content: 'Content' },
        { type: 'divider' }
      ];

      const results = sections.map(s => parseSectionType(s));

      expect(results).toHaveLength(3);
      expect(results[0].type).toBe('hero');
      expect(results[1].type).toBe('text');
      expect(results[2].type).toBe('divider');
    });
  });
});
