/**
 * Page definition types
 * Represents content pages and their metadata
 */

import { Section } from './section.types';
import { PopupDefinition } from './popup.types';
import { PageReference } from './card.types';
import { Difficulty } from './card.types';

/**
 * Page titles - supports 4 different contexts
 */
export interface PageTitles {
  page_header: string;
  menu_title: string;
  agenda_title: string;
  breadcrumb: string;
}

/**
 * Page description
 */
export interface PageDescription {
  short?: string;
  long?: string;
}

/**
 * Page metadata (optional fields)
 */
export interface PageMetadata {
  author?: string;
  version?: string;
  last_updated?: string;
  tags?: string[];
  difficulty?: Difficulty;
  estimated_time?: string;
}

/**
 * Page-specific navigation settings
 */
export interface PageNavigation {
  show_breadcrumbs?: boolean;
  show_back_button?: boolean;
  show_next_previous?: boolean;
  back_to_agenda_button?: boolean;
  siblings?: {
    previous?: string | null;
    next?: string | null;
  };
}

/**
 * Complete page definition
 */
export interface PageDefinition {
  id: string;
  titles: PageTitles;
  description?: PageDescription;
  metadata?: PageMetadata;
  parent: string | null;
  icon?: string;
  sections: Section[];
  sub_pages?: PageReference[];
  popups?: PopupDefinition[];
  navigation?: PageNavigation;
}
