/**
 * Navigation system type definitions
 * Covers hierarchical, tabs, and linear navigation patterns
 */

import { CardDefinition } from './card.types';
import { PageDefinition } from './page.types';

/**
 * Navigation type
 */
export type NavigationType = 'hierarchical' | 'tabs' | 'linear';

/**
 * Progress indicator style (for linear navigation)
 */
export type ProgressStyle = 'steps' | 'bar' | 'dots';

/**
 * Tab position (for tab navigation)
 */
export type TabPosition = 'top' | 'bottom';

/**
 * Navigation configuration
 */
export interface NavigationConfig {
  type: NavigationType;
  show_breadcrumbs: boolean;
  show_page_tree: boolean;
  allow_back_to_agenda: boolean;
  show_next_previous?: boolean;
  tab_position?: TabPosition;
  show_progress?: boolean;
  progress_style?: ProgressStyle;
}

/**
 * Page node in navigation hierarchy
 */
export interface PageNode {
  page: PageDefinition;
  children: PageNode[];
  parent: PageNode | null;
  level: number;
  path: string[];
}

/**
 * Complete navigation hierarchy
 */
export interface NavigationHierarchy {
  card: CardDefinition;
  pages: PageNode[];
}

/**
 * Breadcrumb item
 */
export interface Breadcrumb {
  label: string;
  pageId: string;
  path: string;
  icon?: string;
}

/**
 * Sibling pages (for next/previous navigation)
 */
export interface Siblings {
  previous: string | null;
  next: string | null;
}
