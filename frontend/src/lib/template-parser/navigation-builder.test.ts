import { describe, it, expect } from 'vitest';
import { NavigationBuilder } from './navigation-builder';
import type { CardDefinition, PageDefinition } from '../template-types';

describe('NavigationBuilder', () => {
  // =============================================================================
  // Test Data Setup
  // =============================================================================

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
      allow_back_to_agenda: true,
    },
    pages: [],
    settings: {
      default_animation: 'fade-in',
      transition_speed: 300,
      max_depth: 5,
    },
  };

  // Simple 2-level hierarchy
  const page1: PageDefinition = {
    id: 'page1',
    titles: {
      page_header: 'Page 1 Header',
      menu_title: 'Page 1',
      agenda_title: 'Page 1 Agenda',
      breadcrumb: 'P1',
    },
    parent: null,
    sections: [],
  };

  const page1_1: PageDefinition = {
    id: 'page1-1',
    titles: {
      page_header: 'Page 1.1 Header',
      menu_title: 'Page 1.1',
      agenda_title: 'Page 1.1 Agenda',
      breadcrumb: 'P1.1',
    },
    parent: 'page1',
    sections: [],
  };

  // 5-level deep hierarchy (like complex-card)
  const level1: PageDefinition = {
    id: 'level1',
    titles: {
      page_header: 'Level 1',
      menu_title: 'Level 1',
      agenda_title: 'Level 1',
      breadcrumb: 'L1',
    },
    parent: null,
    sections: [],
  };

  const level2: PageDefinition = {
    id: 'level2',
    titles: {
      page_header: 'Level 2',
      menu_title: 'Level 2',
      agenda_title: 'Level 2',
      breadcrumb: 'L2',
    },
    parent: 'level1',
    sections: [],
  };

  const level3: PageDefinition = {
    id: 'level3',
    titles: {
      page_header: 'Level 3',
      menu_title: 'Level 3',
      agenda_title: 'Level 3',
      breadcrumb: 'L3',
    },
    parent: 'level2',
    sections: [],
  };

  const level4: PageDefinition = {
    id: 'level4',
    titles: {
      page_header: 'Level 4',
      menu_title: 'Level 4',
      agenda_title: 'Level 4',
      breadcrumb: 'L4',
    },
    parent: 'level3',
    sections: [],
  };

  const level5: PageDefinition = {
    id: 'level5',
    titles: {
      page_header: 'Level 5',
      menu_title: 'Level 5',
      agenda_title: 'Level 5',
      breadcrumb: 'L5',
    },
    parent: 'level4',
    sections: [],
  };

  // =============================================================================
  // Constructor Tests
  // =============================================================================

  describe('constructor', () => {
    it('should create NavigationBuilder instance', () => {
      const builder = new NavigationBuilder();
      expect(builder).toBeDefined();
      expect(builder).toBeInstanceOf(NavigationBuilder);
    });
  });

  // =============================================================================
  // buildHierarchy() Tests
  // =============================================================================

  describe('buildHierarchy()', () => {
    it('should build hierarchy with single root page', () => {
      const builder = new NavigationBuilder();
      const pages = new Map([['page1', page1]]);

      const hierarchy = builder.buildHierarchy(mockCard, pages);

      expect(hierarchy).toBeDefined();
      expect(hierarchy.card).toBe(mockCard);
      expect(hierarchy.pages).toHaveLength(1);
      expect(hierarchy.pages[0].page.id).toBe('page1');
      expect(hierarchy.pages[0].level).toBe(0);
      expect(hierarchy.pages[0].children).toHaveLength(0);
      expect(hierarchy.pages[0].parent).toBeNull();
    });

    it('should build hierarchy with parent-child relationship', () => {
      const builder = new NavigationBuilder();
      const pages = new Map([
        ['page1', page1],
        ['page1-1', page1_1],
      ]);

      const hierarchy = builder.buildHierarchy(mockCard, pages);

      expect(hierarchy.pages).toHaveLength(1); // Only root pages at top level
      expect(hierarchy.pages[0].page.id).toBe('page1');
      expect(hierarchy.pages[0].children).toHaveLength(1);
      expect(hierarchy.pages[0].children[0].page.id).toBe('page1-1');
      expect(hierarchy.pages[0].children[0].level).toBe(1);
      expect(hierarchy.pages[0].children[0].parent?.page.id).toBe('page1');
    });

    it('should build 5-level deep hierarchy', () => {
      const builder = new NavigationBuilder();
      const pages = new Map([
        ['level1', level1],
        ['level2', level2],
        ['level3', level3],
        ['level4', level4],
        ['level5', level5],
      ]);

      const hierarchy = builder.buildHierarchy(mockCard, pages);

      // Navigate to level 5
      const root = hierarchy.pages[0];
      expect(root.page.id).toBe('level1');
      expect(root.level).toBe(0);

      const l2 = root.children[0];
      expect(l2.page.id).toBe('level2');
      expect(l2.level).toBe(1);

      const l3 = l2.children[0];
      expect(l3.page.id).toBe('level3');
      expect(l3.level).toBe(2);

      const l4 = l3.children[0];
      expect(l4.page.id).toBe('level4');
      expect(l4.level).toBe(3);

      const l5 = l4.children[0];
      expect(l5.page.id).toBe('level5');
      expect(l5.level).toBe(4);
      expect(l5.children).toHaveLength(0);
    });

    it('should handle multiple root pages', () => {
      const builder = new NavigationBuilder();
      const page2: PageDefinition = {
        ...page1,
        id: 'page2',
        titles: { ...page1.titles, breadcrumb: 'P2' },
      };
      const pages = new Map([
        ['page1', page1],
        ['page2', page2],
      ]);

      const hierarchy = builder.buildHierarchy(mockCard, pages);

      expect(hierarchy.pages).toHaveLength(2);
      expect(hierarchy.pages[0].page.id).toBe('page1');
      expect(hierarchy.pages[1].page.id).toBe('page2');
    });

    it('should build correct path array for nested pages', () => {
      const builder = new NavigationBuilder();
      const pages = new Map([
        ['level1', level1],
        ['level2', level2],
        ['level3', level3],
      ]);

      const hierarchy = builder.buildHierarchy(mockCard, pages);

      const root = hierarchy.pages[0];
      expect(root.path).toEqual(['level1']);

      const l2 = root.children[0];
      expect(l2.path).toEqual(['level1', 'level2']);

      const l3 = l2.children[0];
      expect(l3.path).toEqual(['level1', 'level2', 'level3']);
    });
  });

  // =============================================================================
  // Circular Reference Detection
  // =============================================================================

  describe('circular reference detection', () => {
    it('should detect simple circular reference (A → B → A)', () => {
      const builder = new NavigationBuilder();
      const pageA: PageDefinition = {
        ...page1,
        id: 'pageA',
        parent: 'pageB', // Points to B
      };
      const pageB: PageDefinition = {
        ...page1,
        id: 'pageB',
        parent: 'pageA', // Points to A (circular!)
      };
      const pages = new Map([
        ['pageA', pageA],
        ['pageB', pageB],
      ]);

      expect(() => {
        builder.buildHierarchy(mockCard, pages);
      }).toThrow(/circular reference/i);
    });

    it('should detect complex circular reference (A → B → C → A)', () => {
      const builder = new NavigationBuilder();
      const pageA: PageDefinition = {
        ...page1,
        id: 'pageA',
        parent: null,
      };
      const pageB: PageDefinition = {
        ...page1,
        id: 'pageB',
        parent: 'pageA',
      };
      const pageC: PageDefinition = {
        ...page1,
        id: 'pageC',
        parent: 'pageB',
      };
      // Now make A point to C (circular!)
      pageA.parent = 'pageC';
      const pages = new Map([
        ['pageA', pageA],
        ['pageB', pageB],
        ['pageC', pageC],
      ]);

      expect(() => {
        builder.buildHierarchy(mockCard, pages);
      }).toThrow(/circular reference/i);
    });

    it('should allow self-referencing page with parent: null (not circular)', () => {
      const builder = new NavigationBuilder();
      const pages = new Map([['page1', page1]]);

      // Should NOT throw
      expect(() => {
        builder.buildHierarchy(mockCard, pages);
      }).not.toThrow();
    });
  });

  // =============================================================================
  // Orphaned Page Detection
  // =============================================================================

  describe('orphaned page detection', () => {
    it('should detect page with non-existent parent', () => {
      const builder = new NavigationBuilder();
      const orphan: PageDefinition = {
        ...page1,
        id: 'orphan',
        parent: 'non-existent-parent',
      };
      const pages = new Map([['orphan', orphan]]);

      expect(() => {
        builder.buildHierarchy(mockCard, pages);
      }).toThrow(/orphaned page|parent.*not found/i);
    });

    it('should provide helpful error message for orphaned pages', () => {
      const builder = new NavigationBuilder();
      const orphan: PageDefinition = {
        ...page1,
        id: 'my-orphan-page',
        parent: 'missing-parent',
      };
      const pages = new Map([['my-orphan-page', orphan]]);

      expect(() => {
        builder.buildHierarchy(mockCard, pages);
      }).toThrow(/my-orphan-page.*missing-parent/i);
    });
  });

  // =============================================================================
  // Duplicate Page ID Detection
  // =============================================================================

  describe('duplicate page ID detection', () => {
    it('should handle duplicate IDs in Map (Map handles this naturally)', () => {
      const builder = new NavigationBuilder();
      // Maps automatically handle duplicates by overwriting
      const page1_no_parent: PageDefinition = {
        ...page1,
        parent: null,
      };
      const page2: PageDefinition = {
        ...page1,
        id: 'page2',
        parent: null,
      };
      const pages = new Map([
        ['page1', page1_no_parent],
        ['page1', page2], // Overwrites first entry with page2
      ]);

      // Should work fine - Map keeps last value (page2 with id 'page1' key)
      const hierarchy = builder.buildHierarchy(mockCard, pages);
      expect(hierarchy.pages).toHaveLength(1);
      // The page at key 'page1' is actually page2 definition
      expect(hierarchy.pages[0].page.id).toBe('page2');
    });
  });

  // =============================================================================
  // buildBreadcrumbs() Tests
  // =============================================================================

  describe('buildBreadcrumbs()', () => {
    it('should generate breadcrumbs for root page', () => {
      const builder = new NavigationBuilder();
      const pages = new Map([['page1', page1]]);
      const hierarchy = builder.buildHierarchy(mockCard, pages);

      const breadcrumbs = builder.buildBreadcrumbs('page1', hierarchy);

      expect(breadcrumbs).toHaveLength(1);
      expect(breadcrumbs[0].label).toBe('P1'); // Uses breadcrumb title
      expect(breadcrumbs[0].pageId).toBe('page1');
    });

    it('should generate breadcrumbs for nested page', () => {
      const builder = new NavigationBuilder();
      const pages = new Map([
        ['page1', page1],
        ['page1-1', page1_1],
      ]);
      const hierarchy = builder.buildHierarchy(mockCard, pages);

      const breadcrumbs = builder.buildBreadcrumbs('page1-1', hierarchy);

      expect(breadcrumbs).toHaveLength(2);
      expect(breadcrumbs[0].label).toBe('P1');
      expect(breadcrumbs[0].pageId).toBe('page1');
      expect(breadcrumbs[1].label).toBe('P1.1');
      expect(breadcrumbs[1].pageId).toBe('page1-1');
    });

    it('should generate breadcrumbs for 5-level deep page', () => {
      const builder = new NavigationBuilder();
      const pages = new Map([
        ['level1', level1],
        ['level2', level2],
        ['level3', level3],
        ['level4', level4],
        ['level5', level5],
      ]);
      const hierarchy = builder.buildHierarchy(mockCard, pages);

      const breadcrumbs = builder.buildBreadcrumbs('level5', hierarchy);

      expect(breadcrumbs).toHaveLength(5);
      expect(breadcrumbs[0].label).toBe('L1');
      expect(breadcrumbs[1].label).toBe('L2');
      expect(breadcrumbs[2].label).toBe('L3');
      expect(breadcrumbs[3].label).toBe('L4');
      expect(breadcrumbs[4].label).toBe('L5');
    });

    it('should include icons in breadcrumbs if page has icon', () => {
      const builder = new NavigationBuilder();
      const pageWithIcon: PageDefinition = {
        ...page1,
        icon: 'Home',
      };
      const pages = new Map([['page1', pageWithIcon]]);
      const hierarchy = builder.buildHierarchy(mockCard, pages);

      const breadcrumbs = builder.buildBreadcrumbs('page1', hierarchy);

      expect(breadcrumbs[0].icon).toBe('Home');
    });

    it('should return empty array for non-existent page', () => {
      const builder = new NavigationBuilder();
      const pages = new Map([['page1', page1]]);
      const hierarchy = builder.buildHierarchy(mockCard, pages);

      const breadcrumbs = builder.buildBreadcrumbs('non-existent', hierarchy);

      expect(breadcrumbs).toHaveLength(0);
    });
  });

  // =============================================================================
  // findNode() Tests
  // =============================================================================

  describe('findNode()', () => {
    it('should find root node by ID', () => {
      const builder = new NavigationBuilder();
      const pages = new Map([['page1', page1]]);
      const hierarchy = builder.buildHierarchy(mockCard, pages);

      const node = builder.findNode('page1', hierarchy);

      expect(node).toBeDefined();
      expect(node?.page.id).toBe('page1');
    });

    it('should find nested node by ID', () => {
      const builder = new NavigationBuilder();
      const pages = new Map([
        ['page1', page1],
        ['page1-1', page1_1],
      ]);
      const hierarchy = builder.buildHierarchy(mockCard, pages);

      const node = builder.findNode('page1-1', hierarchy);

      expect(node).toBeDefined();
      expect(node?.page.id).toBe('page1-1');
    });

    it('should find deeply nested node (5 levels)', () => {
      const builder = new NavigationBuilder();
      const pages = new Map([
        ['level1', level1],
        ['level2', level2],
        ['level3', level3],
        ['level4', level4],
        ['level5', level5],
      ]);
      const hierarchy = builder.buildHierarchy(mockCard, pages);

      const node = builder.findNode('level5', hierarchy);

      expect(node).toBeDefined();
      expect(node?.page.id).toBe('level5');
      expect(node?.level).toBe(4);
    });

    it('should return null for non-existent page', () => {
      const builder = new NavigationBuilder();
      const pages = new Map([['page1', page1]]);
      const hierarchy = builder.buildHierarchy(mockCard, pages);

      const node = builder.findNode('non-existent', hierarchy);

      expect(node).toBeNull();
    });
  });

  // =============================================================================
  // findSiblings() Tests
  // =============================================================================

  describe('findSiblings()', () => {
    it('should find siblings for middle child', () => {
      const builder = new NavigationBuilder();
      const child1: PageDefinition = {
        ...page1,
        id: 'child1',
        parent: 'parent',
      };
      const child2: PageDefinition = {
        ...page1,
        id: 'child2',
        parent: 'parent',
      };
      const child3: PageDefinition = {
        ...page1,
        id: 'child3',
        parent: 'parent',
      };
      const parent: PageDefinition = {
        ...page1,
        id: 'parent',
        parent: null,
      };
      const pages = new Map([
        ['parent', parent],
        ['child1', child1],
        ['child2', child2],
        ['child3', child3],
      ]);
      const hierarchy = builder.buildHierarchy(mockCard, pages);

      const siblings = builder.findSiblings('child2', hierarchy);

      expect(siblings.previous).toBe('child1');
      expect(siblings.next).toBe('child3');
    });

    it('should return null for first child previous sibling', () => {
      const builder = new NavigationBuilder();
      const child1: PageDefinition = {
        ...page1,
        id: 'child1',
        parent: 'parent',
      };
      const child2: PageDefinition = {
        ...page1,
        id: 'child2',
        parent: 'parent',
      };
      const parent: PageDefinition = {
        ...page1,
        id: 'parent',
        parent: null,
      };
      const pages = new Map([
        ['parent', parent],
        ['child1', child1],
        ['child2', child2],
      ]);
      const hierarchy = builder.buildHierarchy(mockCard, pages);

      const siblings = builder.findSiblings('child1', hierarchy);

      expect(siblings.previous).toBeNull();
      expect(siblings.next).toBe('child2');
    });

    it('should return null for last child next sibling', () => {
      const builder = new NavigationBuilder();
      const child1: PageDefinition = {
        ...page1,
        id: 'child1',
        parent: 'parent',
      };
      const child2: PageDefinition = {
        ...page1,
        id: 'child2',
        parent: 'parent',
      };
      const parent: PageDefinition = {
        ...page1,
        id: 'parent',
        parent: null,
      };
      const pages = new Map([
        ['parent', parent],
        ['child1', child1],
        ['child2', child2],
      ]);
      const hierarchy = builder.buildHierarchy(mockCard, pages);

      const siblings = builder.findSiblings('child2', hierarchy);

      expect(siblings.previous).toBe('child1');
      expect(siblings.next).toBeNull();
    });

    it('should return null for only child', () => {
      const builder = new NavigationBuilder();
      const pages = new Map([
        ['page1', page1],
        ['page1-1', page1_1],
      ]);
      const hierarchy = builder.buildHierarchy(mockCard, pages);

      const siblings = builder.findSiblings('page1-1', hierarchy);

      expect(siblings.previous).toBeNull();
      expect(siblings.next).toBeNull();
    });

    it('should return null for root page with no siblings', () => {
      const builder = new NavigationBuilder();
      const pages = new Map([['page1', page1]]);
      const hierarchy = builder.buildHierarchy(mockCard, pages);

      const siblings = builder.findSiblings('page1', hierarchy);

      expect(siblings.previous).toBeNull();
      expect(siblings.next).toBeNull();
    });
  });

  // =============================================================================
  // Performance Tests
  // =============================================================================

  describe('performance', () => {
    it('should build 100-page hierarchy in under 50ms', () => {
      const builder = new NavigationBuilder();
      const pages = new Map<string, PageDefinition>();

      // Create 100 pages in a deep hierarchy
      for (let i = 0; i < 100; i++) {
        pages.set(`page${i}`, {
          id: `page${i}`,
          titles: {
            page_header: `Page ${i}`,
            menu_title: `Page ${i}`,
            agenda_title: `Page ${i}`,
            breadcrumb: `P${i}`,
          },
          parent: i === 0 ? null : `page${i - 1}`,
          sections: [],
        });
      }

      const start = performance.now();
      builder.buildHierarchy(mockCard, pages);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(50);
    });

    it('should find node in 100-page hierarchy quickly', () => {
      const builder = new NavigationBuilder();
      const pages = new Map<string, PageDefinition>();

      for (let i = 0; i < 100; i++) {
        pages.set(`page${i}`, {
          id: `page${i}`,
          titles: {
            page_header: `Page ${i}`,
            menu_title: `Page ${i}`,
            agenda_title: `Page ${i}`,
            breadcrumb: `P${i}`,
          },
          parent: i === 0 ? null : `page${i - 1}`,
          sections: [],
        });
      }

      const hierarchy = builder.buildHierarchy(mockCard, pages);

      const start = performance.now();
      builder.findNode('page99', hierarchy);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(10);
    });
  });

  // =============================================================================
  // Edge Cases
  // =============================================================================

  describe('edge cases', () => {
    it('should handle empty pages map', () => {
      const builder = new NavigationBuilder();
      const pages = new Map<string, PageDefinition>();

      const hierarchy = builder.buildHierarchy(mockCard, pages);

      expect(hierarchy.pages).toHaveLength(0);
    });

    it('should handle pages with undefined parent (treated as null)', () => {
      const builder = new NavigationBuilder();
      const pageWithUndefinedParent: PageDefinition = {
        ...page1,
        parent: undefined as any, // Force undefined
      };
      const pages = new Map([['page1', pageWithUndefinedParent]]);

      const hierarchy = builder.buildHierarchy(mockCard, pages);

      expect(hierarchy.pages).toHaveLength(1);
      expect(hierarchy.pages[0].parent).toBeNull();
    });

    it('should preserve page order when building hierarchy', () => {
      const builder = new NavigationBuilder();
      const page2: PageDefinition = {
        ...page1,
        id: 'page2',
      };
      const page3: PageDefinition = {
        ...page1,
        id: 'page3',
      };
      // Insert in specific order
      const pages = new Map([
        ['page3', page3],
        ['page1', page1],
        ['page2', page2],
      ]);

      const hierarchy = builder.buildHierarchy(mockCard, pages);

      // Should maintain Map insertion order
      expect(hierarchy.pages[0].page.id).toBe('page3');
      expect(hierarchy.pages[1].page.id).toBe('page1');
      expect(hierarchy.pages[2].page.id).toBe('page2');
    });
  });
});
