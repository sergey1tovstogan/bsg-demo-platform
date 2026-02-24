/**
 * Integration Tests - Phase 2A Final Verification
 *
 * Tests all parsers working together with real example files from Phase 1:
 * - Simple card (4 files, 2 levels)
 * - Medium card (6 files, 3 levels)
 * - Complex card (8 files, 5 levels)
 *
 * Total: 18 example files
 */

import { describe, it, expect } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { parseCardDefinition } from './card-parser';
import { parsePageDefinition } from './page-parser';
import { NavigationBuilder } from './navigation-builder';

// Path to examples directory
const EXAMPLES_DIR = path.join(process.cwd(), '..', 'examples');

/**
 * Helper to read and extract YAML from markdown code block
 */
async function readMarkdownFile(filePath: string): Promise<string> {
  const content = await fs.readFile(filePath, 'utf-8');

  // Extract YAML from code block if present
  const yamlBlockMatch = content.match(/```yaml\n([\s\S]*?)\n```/);
  if (yamlBlockMatch) {
    return `---\n${yamlBlockMatch[1]}\n---`;
  }

  return content;
}

/**
 * Helper to parse card and throw if errors
 */
function parseCard(content: string) {
  const result = parseCardDefinition(content);
  if (result.errors.length > 0) {
    throw new Error(`Card parse errors: ${result.errors.map(e => e.message).join(', ')}`);
  }
  return result.card!;
}

/**
 * Helper to parse page and throw if errors
 */
function parsePage(content: string) {
  const result = parsePageDefinition(content);
  if (result.errors.length > 0) {
    throw new Error(`Page parse errors: ${result.errors.map(e => e.message).join(', ')}`);
  }
  return result.page!;
}

describe('Integration Tests - All Parsers with Real Examples', () => {
  // ===========================================================================
  // SIMPLE CARD (4 files, 2 levels)
  // ===========================================================================

  describe('Simple Card Example', () => {
    it('should parse simple-card card definition', async () => {
      const cardPath = path.join(EXAMPLES_DIR, 'simple-card', 'card-definition.md');
      const content = await readMarkdownFile(cardPath);
      const card = parseCard(content);

      expect(card.id).toBe('simple-product-overview');
      expect(card.name).toBe('Product Overview');
      expect(card.category).toBe('product');
      expect(card.color_theme).toBe('blue');
      expect(card.icon).toBe('Box');
      expect(card.navigation.type).toBe('hierarchical');
      expect(card.navigation.show_breadcrumbs).toBe(true);
      expect(card.navigation.show_page_tree).toBe(true);
      expect(card.pages).toHaveLength(2);
    });

    it('should parse simple-card intro page', async () => {
      const pagePath = path.join(EXAMPLES_DIR, 'simple-card', 'pages', 'intro.md');
      const content = await readMarkdownFile(pagePath);
      const page = parsePage(content);

      expect(page.id).toBe('intro');
      expect(page.titles.page_header).toBe('Welcome to Our Product');
      expect(page.titles.menu_title).toBe('Introduction');
      expect(page.titles.breadcrumb).toBe('Intro');
      expect(page.parent).toBeNull();
      expect(page.sections.length).toBeGreaterThan(0);

      // Check section types
      const sectionTypes = page.sections.map(s => s.type);
      expect(sectionTypes).toContain('hero');
      expect(sectionTypes).toContain('text');
      expect(sectionTypes).toContain('list');
      expect(sectionTypes).toContain('alert');
      expect(sectionTypes).toContain('text_with_links');
    });

    it('should parse simple-card features page', async () => {
      const pagePath = path.join(EXAMPLES_DIR, 'simple-card', 'pages', 'features.md');
      const content = await readMarkdownFile(pagePath);
      const page = parsePage(content);

      expect(page.id).toBe('features');
      expect(page.titles.breadcrumb).toBe('Features');
      expect(page.parent).toBeNull();
      expect(page.sections.length).toBeGreaterThan(0);
    });

    it('should build simple-card navigation hierarchy (2 levels)', async () => {
      const builder = new NavigationBuilder();

      // Load card
      const cardPath = path.join(EXAMPLES_DIR, 'simple-card', 'card-definition.md');
      const cardContent = await readMarkdownFile(cardPath);
      const card = parseCard(cardContent);

      // Load pages
      const pages = new Map();
      const pageFiles = ['intro.md', 'features.md'];

      for (const file of pageFiles) {
        const pagePath = path.join(EXAMPLES_DIR, 'simple-card', 'pages', file);
        const content = await readMarkdownFile(pagePath);
        const page = parsePage(content);
        pages.set(page.id, page);
      }

      // Build hierarchy
      const hierarchy = builder.buildHierarchy(card, pages);

      expect(hierarchy.pages).toHaveLength(2);
      expect(hierarchy.pages[0].level).toBe(0);
      expect(hierarchy.pages[0].children).toHaveLength(0);
    });
  });

  // ===========================================================================
  // MEDIUM CARD (6 files, 3 levels)
  // ===========================================================================

  describe('Medium Card Example', () => {
    it('should parse medium-card card definition', async () => {
      const cardPath = path.join(EXAMPLES_DIR, 'medium-card', 'card-definition.md');
      const content = await readMarkdownFile(cardPath);
      const card = parseCard(content);

      expect(card.id).toBeDefined();
      expect(card.name).toBeDefined();
      expect(card.navigation.type).toBeDefined();
      expect(card.pages.length).toBeGreaterThan(0);
    });

    it('should parse medium-card overview page', async () => {
      const pagePath = path.join(EXAMPLES_DIR, 'medium-card', 'pages', 'overview.md');
      const content = await readMarkdownFile(pagePath);
      const page = parsePage(content);

      expect(page.id).toBe('overview');
      expect(page.titles).toBeDefined();
      expect(page.parent).toBeNull();
      expect(page.sections.length).toBeGreaterThan(0);
    });

    it('should parse medium-card architecture page (level 1)', async () => {
      const pagePath = path.join(EXAMPLES_DIR, 'medium-card', 'pages', 'architecture.md');
      const content = await readMarkdownFile(pagePath);
      const page = parsePage(content);

      expect(page.id).toBe('architecture');
      expect(page.parent).toBeNull();
    });

    it('should parse medium-card components page (level 2)', async () => {
      const pagePath = path.join(
        EXAMPLES_DIR,
        'medium-card',
        'pages',
        'architecture',
        'components.md'
      );
      const content = await readMarkdownFile(pagePath);
      const page = parsePage(content);

      expect(page.id).toBe('components');
      expect(page.parent).toBe('architecture');
    });

    it('should parse medium-card data-flow page (level 2)', async () => {
      const pagePath = path.join(
        EXAMPLES_DIR,
        'medium-card',
        'pages',
        'architecture',
        'data-flow.md'
      );
      const content = await readMarkdownFile(pagePath);
      const page = parsePage(content);

      expect(page.id).toBe('data-flow');
      expect(page.parent).toBe('architecture');
    });

    it('should build medium-card navigation hierarchy (3 levels)', async () => {
      const builder = new NavigationBuilder();

      // Load card
      const cardPath = path.join(EXAMPLES_DIR, 'medium-card', 'card-definition.md');
      const cardContent = await readMarkdownFile(cardPath);
      const card = parseCard(cardContent);

      // Load all pages
      const pages = new Map();
      const pageFiles = [
        { path: 'overview.md', id: 'overview' },
        { path: 'architecture.md', id: 'architecture' },
        { path: 'architecture/components.md', id: 'components' },
        { path: 'architecture/data-flow.md', id: 'data-flow' },
      ];

      for (const file of pageFiles) {
        const pagePath = path.join(EXAMPLES_DIR, 'medium-card', 'pages', file.path);
        const content = await readMarkdownFile(pagePath);
        const page = parsePage(content);
        pages.set(page.id, page);
      }

      // Build hierarchy
      const hierarchy = builder.buildHierarchy(card, pages);

      // Find architecture node
      const archNode = hierarchy.pages.find(p => p.page.id === 'architecture');
      expect(archNode).toBeDefined();
      expect(archNode?.level).toBe(0);
      expect(archNode?.children.length).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // COMPLEX CARD (8 files, 5 LEVELS!) - THE BIG TEST
  // ===========================================================================

  describe('Complex Card Example (5 levels)', () => {
    it('should parse complex-card card definition', async () => {
      const cardPath = path.join(EXAMPLES_DIR, 'complex-card', 'card-definition.md');
      const content = await readMarkdownFile(cardPath);
      const card = parseCard(content);

      expect(card.id).toBeDefined();
      expect(card.name).toBeDefined();
      expect(card.settings.max_depth).toBeGreaterThanOrEqual(5);
    });

    it('should parse level 1 (architecture.md)', async () => {
      const pagePath = path.join(EXAMPLES_DIR, 'complex-card', 'pages', 'architecture.md');
      const content = await readMarkdownFile(pagePath);
      const page = parsePage(content);

      expect(page.id).toBe('architecture');
      expect(page.parent).toBeNull();
    });

    it('should parse level 2 (overview.md)', async () => {
      const pagePath = path.join(
        EXAMPLES_DIR,
        'complex-card',
        'pages',
        'architecture',
        'overview.md'
      );
      const content = await readMarkdownFile(pagePath);
      const page = parsePage(content);

      expect(page.id).toBe('overview');
      expect(page.parent).toBe('architecture');
    });

    it('should parse level 3 (layer-1.md)', async () => {
      const pagePath = path.join(
        EXAMPLES_DIR,
        'complex-card',
        'pages',
        'architecture',
        'details',
        'layer-1.md'
      );
      const content = await readMarkdownFile(pagePath);
      const page = parsePage(content);

      expect(page.id).toBe('layer-1');
      expect(page.parent).toBe('details');
    });

    it('should parse level 4 (component-a.md)', async () => {
      const pagePath = path.join(
        EXAMPLES_DIR,
        'complex-card',
        'pages',
        'architecture',
        'details',
        'layer-1',
        'component-a.md'
      );
      const content = await readMarkdownFile(pagePath);
      const page = parsePage(content);

      expect(page.id).toBe('component-a');
      expect(page.parent).toBe('layer-1');
    });

    it('should parse level 5 (implementation.md) - THE DEEPEST!', async () => {
      const pagePath = path.join(
        EXAMPLES_DIR,
        'complex-card',
        'pages',
        'architecture',
        'details',
        'layer-1',
        'component-a',
        'implementation.md'
      );
      const content = await readMarkdownFile(pagePath);
      const page = parsePage(content);

      expect(page.id).toBe('implementation');
      expect(page.parent).toBe('component-a');
    });

    it('should build 5-level hierarchy and generate breadcrumbs', async () => {
      const builder = new NavigationBuilder();

      // Load card
      const cardPath = path.join(EXAMPLES_DIR, 'complex-card', 'card-definition.md');
      const cardContent = await readMarkdownFile(cardPath);
      const card = parseCard(cardContent);

      // Load all pages
      const pages = new Map();
      const pageFiles = [
        { path: 'architecture.md', id: 'architecture' },
        { path: 'architecture/overview.md', id: 'overview' },
        { path: 'architecture/details.md', id: 'details' },
        { path: 'architecture/details/layer-1.md', id: 'layer-1' },
        { path: 'architecture/details/layer-1/component-a.md', id: 'component-a' },
        {
          path: 'architecture/details/layer-1/component-a/implementation.md',
          id: 'implementation',
        },
      ];

      for (const file of pageFiles) {
        const pagePath = path.join(EXAMPLES_DIR, 'complex-card', 'pages', file.path);
        const content = await readMarkdownFile(pagePath);
        const page = parsePage(content);
        pages.set(page.id, page);
      }

      // Build hierarchy
      const hierarchy = builder.buildHierarchy(card, pages);

      // Find level 5 node
      const level1 = hierarchy.pages.find(p => p.page.id === 'architecture');
      expect(level1).toBeDefined();
      expect(level1?.level).toBe(0);

      const level2 = level1?.children.find(c => c.page.id === 'details');
      expect(level2).toBeDefined();
      expect(level2?.level).toBe(1);

      const level3 = level2?.children.find(c => c.page.id === 'layer-1');
      expect(level3).toBeDefined();
      expect(level3?.level).toBe(2);

      const level4 = level3?.children.find(c => c.page.id === 'component-a');
      expect(level4).toBeDefined();
      expect(level4?.level).toBe(3);

      const level5 = level4?.children.find(c => c.page.id === 'implementation');
      expect(level5).toBeDefined();
      expect(level5?.level).toBe(4);

      // Generate breadcrumbs for level 5 (should show all 5 levels)
      const breadcrumbs = builder.buildBreadcrumbs('implementation', hierarchy);
      expect(breadcrumbs).toHaveLength(5);
      expect(breadcrumbs.map(b => b.pageId)).toEqual([
        'architecture',
        'details',
        'layer-1',
        'component-a',
        'implementation',
      ]);
    });
  });

  // ===========================================================================
  // PERFORMANCE TESTS
  // ===========================================================================

  describe('Performance Tests', () => {
    it('should parse card definition in under 100ms', async () => {
      const cardPath = path.join(EXAMPLES_DIR, 'complex-card', 'card-definition.md');
      const content = await readMarkdownFile(cardPath);

      const start = performance.now();
      parseCard(content);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('should parse page in under 50ms', async () => {
      const pagePath = path.join(EXAMPLES_DIR, 'simple-card', 'pages', 'intro.md');
      const content = await readMarkdownFile(pagePath);

      const start = performance.now();
      parsePage(content);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(50);
    });

    it('should build 5-level hierarchy in under 50ms', async () => {
      const builder = new NavigationBuilder();

      // Load card
      const cardPath = path.join(EXAMPLES_DIR, 'complex-card', 'card-definition.md');
      const cardContent = await readMarkdownFile(cardPath);
      const card = parseCard(cardContent);

      // Load pages
      const pages = new Map();
      const pageFiles = [
        { path: 'architecture.md', id: 'architecture' },
        { path: 'architecture/overview.md', id: 'overview' },
        { path: 'architecture/details.md', id: 'details' },
        { path: 'architecture/details/layer-1.md', id: 'layer-1' },
        { path: 'architecture/details/layer-1/component-a.md', id: 'component-a' },
        {
          path: 'architecture/details/layer-1/component-a/implementation.md',
          id: 'implementation',
        },
      ];

      for (const file of pageFiles) {
        const pagePath = path.join(EXAMPLES_DIR, 'complex-card', 'pages', file.path);
        const content = await readMarkdownFile(pagePath);
        const page = parsePage(content);
        pages.set(page.id, page);
      }

      const start = performance.now();
      builder.buildHierarchy(card, pages);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(50);
    });
  });

  // ===========================================================================
  // SECTION TYPE COVERAGE
  // ===========================================================================

  describe('Section Type Coverage', () => {
    it('should parse all section types from examples', async () => {
      const allSectionTypes = new Set<string>();

      // Parse all pages and collect section types
      const allPageFiles = [
        'simple-card/pages/intro.md',
        'simple-card/pages/features.md',
        'medium-card/pages/overview.md',
        'medium-card/pages/architecture.md',
        'medium-card/pages/architecture/components.md',
        'medium-card/pages/architecture/data-flow.md',
      ];

      for (const file of allPageFiles) {
        try {
          const pagePath = path.join(EXAMPLES_DIR, file);
          const content = await readMarkdownFile(pagePath);
          const page = parsePage(content);

          page.sections.forEach(section => {
            allSectionTypes.add(section.type);
          });
        } catch (error) {
          // Skip files that don't exist or have issues
          console.warn(`Skipping ${file}: ${error}`);
        }
      }

      // Should have parsed multiple section types
      expect(allSectionTypes.size).toBeGreaterThan(3);

      // Check for common types
      console.log('Section types found:', Array.from(allSectionTypes).sort());
    });
  });

  // ===========================================================================
  // FILE COUNT VERIFICATION
  // ===========================================================================

  describe('File Count Verification', () => {
    it('should confirm 18 example files exist', async () => {
      const files = [
        // Simple card (4)
        'simple-card/card-definition.md',
        'simple-card/agenda.md',
        'simple-card/pages/intro.md',
        'simple-card/pages/features.md',
        // Medium card (6)
        'medium-card/card-definition.md',
        'medium-card/agenda.md',
        'medium-card/pages/overview.md',
        'medium-card/pages/architecture.md',
        'medium-card/pages/architecture/components.md',
        'medium-card/pages/architecture/data-flow.md',
        // Complex card (8)
        'complex-card/card-definition.md',
        'complex-card/agenda.md',
        'complex-card/pages/architecture.md',
        'complex-card/pages/architecture/overview.md',
        'complex-card/pages/architecture/details.md',
        'complex-card/pages/architecture/details/layer-1.md',
        'complex-card/pages/architecture/details/layer-1/component-a.md',
        'complex-card/pages/architecture/details/layer-1/component-a/implementation.md',
      ];

      expect(files).toHaveLength(18);

      // Verify each file exists
      for (const file of files) {
        const filePath = path.join(EXAMPLES_DIR, file);
        const exists = await fs
          .access(filePath)
          .then(() => true)
          .catch(() => false);
        expect(exists, `File should exist: ${file}`).toBe(true);
      }
    });
  });
});
