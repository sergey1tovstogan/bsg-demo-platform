/**
 * Type System Tests
 * Verifies that all type definitions work correctly
 */

import { describe, it, expect } from 'vitest';
import type {
  // All section types
  Section,
  HeroSection,
  TextSection,
  FeatureGridSection,
  ExpandableSection,
  AlertSection,
  // Card types
  CardDefinition,
  ColorTheme,
  // Page types
  PageDefinition,
  PageTitles,
  // Navigation types
  NavigationConfig,
  NavigationType,
  // Popup types
  PopupDefinition,
  // Animation types
  AnimationType,
  HoverEffect,
} from './index';

describe('Template Types', () => {
  describe('Section Types', () => {
    it('should accept valid hero section', () => {
      const heroSection: HeroSection = {
        type: 'hero',
        heading: 'Test Heading',
        subtitle: 'Test Subtitle',
        align: 'center',
      };

      expect(heroSection.type).toBe('hero');
      expect(heroSection.heading).toBe('Test Heading');
    });

    it('should accept valid text section', () => {
      const textSection: TextSection = {
        type: 'text',
        content: 'Test content',
        align: 'left',
      };

      expect(textSection.type).toBe('text');
    });

    it('should accept valid feature grid section', () => {
      const featureGrid: FeatureGridSection = {
        type: 'feature_grid',
        features: [
          {
            title: 'Feature 1',
            icon: 'icon-name',
            description: 'Description',
          },
        ],
        columns: 3,
      };

      expect(featureGrid.columns).toBe(3);
      expect(featureGrid.features).toHaveLength(1);
    });

    it('should accept valid expandable section', () => {
      const expandable: ExpandableSection = {
        type: 'expandable_section',
        trigger: 'click',
        collapsed: {
          title: 'Click to expand',
        },
        expanded: {
          content: 'Expanded content here',
        },
      };

      expect(expandable.trigger).toBe('click');
    });

    it('should accept valid alert section', () => {
      const alert: AlertSection = {
        type: 'alert',
        alert_type: 'success',
        content: 'Operation successful!',
      };

      expect(alert.alert_type).toBe('success');
    });

    it('should accept all section types in union', () => {
      const sections: Section[] = [
        { type: 'hero', heading: 'Title' },
        { type: 'text', content: 'Content' },
        { type: 'divider' },
      ];

      expect(sections).toHaveLength(3);
    });
  });

  describe('Card Types', () => {
    it('should accept valid color themes', () => {
      const themes: ColorTheme[] = ['blue', 'emerald', 'violet', 'red'];
      expect(themes).toContain('blue');
    });

    it('should accept valid card definition', () => {
      const card: Partial<CardDefinition> = {
        id: 'test-card',
        name: 'Test Card',
        category: 'Testing',
        color_theme: 'blue',
        icon: 'test-icon',
      };

      expect(card.id).toBe('test-card');
      expect(card.color_theme).toBe('blue');
    });
  });

  describe('Page Types', () => {
    it('should accept valid page titles', () => {
      const titles: PageTitles = {
        page_header: 'Page Header',
        menu_title: 'Menu',
        agenda_title: 'Agenda Item',
        breadcrumb: 'Breadcrumb',
      };

      expect(titles.page_header).toBe('Page Header');
    });

    it('should accept valid page definition', () => {
      const page: Partial<PageDefinition> = {
        id: 'test-page',
        titles: {
          page_header: 'Test Page',
          menu_title: 'Test',
          agenda_title: 'Test',
          breadcrumb: 'Test',
        },
        parent: null,
        sections: [],
      };

      expect(page.id).toBe('test-page');
      expect(page.parent).toBeNull();
    });
  });

  describe('Navigation Types', () => {
    it('should accept all navigation types', () => {
      const navTypes: NavigationType[] = ['hierarchical', 'tabs', 'linear'];
      expect(navTypes).toHaveLength(3);
    });

    it('should accept valid navigation config', () => {
      const navConfig: NavigationConfig = {
        type: 'hierarchical',
        show_breadcrumbs: true,
        show_page_tree: true,
        allow_back_to_agenda: true,
      };

      expect(navConfig.type).toBe('hierarchical');
      expect(navConfig.show_breadcrumbs).toBe(true);
    });
  });

  describe('Popup Types', () => {
    it('should accept valid popup definition', () => {
      const popup: PopupDefinition = {
        id: 'test-popup',
        size: 'medium',
        title: 'Test Popup',
        content: 'Simple popup content',
        actions: [
          {
            label: 'Close',
            action: { type: 'close_popup' },
          },
        ],
      };

      expect(popup.size).toBe('medium');
      expect(popup.actions).toHaveLength(1);
    });
  });

  describe('Animation Types', () => {
    it('should accept all animation types', () => {
      const animations: AnimationType[] = [
        'fade-in',
        'slide-in-up',
        'scale-in',
        'none',
      ];

      expect(animations).toContain('fade-in');
    });

    it('should accept all hover effects', () => {
      const effects: HoverEffect[] = ['zoom', 'lift', 'glow'];
      expect(effects).toContain('zoom');
    });
  });
});

// Type-only tests (compilation tests)
describe('Type Compilation', () => {
  it('should allow type discrimination on Section union', () => {
    const section: Section = { type: 'hero', heading: 'Test' };

    if (section.type === 'hero') {
      // TypeScript should know this is a HeroSection
      expect(section.heading).toBeDefined();
    }
  });

  it('should enforce required fields', () => {
    // This should compile successfully
    const validHero: HeroSection = {
      type: 'hero',
      heading: 'Required heading',
    };

    expect(validHero).toBeDefined();

    // The following would cause TypeScript errors (commented out for test):
    // const invalidHero: HeroSection = {
    //   type: 'hero',
    //   // Missing required 'heading' field
    // };
  });
});
