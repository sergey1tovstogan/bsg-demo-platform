/**
 * Card definition types
 * Represents the top-level card structure
 */

import { NavigationConfig } from './navigation.types';
import { AnimationType } from './animation.types';

/**
 * Color theme options for cards
 */
export type ColorTheme =
  | 'blue'
  | 'emerald'
  | 'violet'
  | 'red'
  | 'amber'
  | 'indigo'
  | 'cyan'
  | 'pink'
  | 'green'
  | 'orange';

/**
 * Difficulty level
 */
export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/**
 * Card status
 */
export type CardStatus = 'draft' | 'review' | 'published' | 'archived';

/**
 * Card metadata (optional fields)
 */
export interface CardMetadata {
  author?: string;
  version?: string;
  last_updated?: string;
  tags?: string[];
  difficulty?: Difficulty;
  estimated_time?: string;
  prerequisites?: string[];
  related_cards?: string[];
  status?: CardStatus;
  language?: string;
  audience?: string[];
}

/**
 * Page reference in card definition
 */
export interface PageReference {
  file: string;
  order?: number;
}

/**
 * Card settings
 */
export interface CardSettings {
  default_animation: AnimationType;
  transition_speed: string | number;
  max_depth: number;
  enable_search?: boolean;
  enable_bookmarks?: boolean;
  respect_reduced_motion?: boolean;
}

/**
 * Card description
 */
export interface CardDescription {
  short?: string;
  long?: string;
}

/**
 * Agenda reference
 */
export interface AgendaReference {
  file: string;
}

/**
 * Complete card definition
 */
export interface CardDefinition {
  id: string;
  name: string;
  category: string;
  color_theme: ColorTheme;
  icon: string;
  description?: CardDescription;
  metadata?: CardMetadata;
  agenda: AgendaReference;
  navigation: NavigationConfig;
  pages: PageReference[];
  settings: CardSettings;
}
