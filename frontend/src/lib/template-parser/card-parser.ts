/**
 * Card Definition Parser
 * Parses card definition MD files into CardDefinition objects
 */

import { parseMarkdownFile, validateRequiredFields, ParseError } from './yaml-utils';
import type {
  CardDefinition,
  ColorTheme,
  CardMetadata,
  PageReference,
  CardSettings,
  NavigationConfig,
} from '../template-types';

/**
 * Card parse result
 */
export interface CardParseResult {
  card?: CardDefinition;
  errors: ParseError[];
}

/**
 * Valid color themes
 */
const VALID_COLOR_THEMES: ColorTheme[] = [
  'blue',
  'emerald',
  'violet',
  'red',
  'amber',
  'indigo',
  'cyan',
  'pink',
  'green',
  'orange',
];

/**
 * Parse card definition from MD file content
 *
 * @param content - Raw markdown file content
 * @returns CardParseResult with parsed card or errors
 *
 * @example
 * ```typescript
 * const result = parseCardDefinition(fileContent);
 * if (result.errors.length === 0) {
 *   console.log('Card:', result.card.name);
 * }
 * ```
 */
export function parseCardDefinition(content: string): CardParseResult {
  // Parse YAML
  const { data, errors: yamlErrors } = parseMarkdownFile(content);

  // If YAML parsing failed, return early
  if (yamlErrors.length > 0) {
    return { errors: yamlErrors };
  }

  // Validate required fields
  const requiredFields = [
    'card.id',
    'card.name',
    'card.category',
    'card.color_theme',
    'card.icon',
    'card.agenda',
    'card.navigation',
    'card.pages',
    'card.settings',
  ];

  const validationErrors = validateRequiredFields(data, requiredFields);

  if (validationErrors.length > 0) {
    return { errors: validationErrors };
  }

  const errors: ParseError[] = [];

  // Validate color theme
  if (!VALID_COLOR_THEMES.includes(data.card.color_theme)) {
    errors.push({
      type: 'VALIDATION_ERROR',
      message: `Invalid color_theme "${data.card.color_theme}". Valid themes: ${VALID_COLOR_THEMES.join(', ')}`,
    });
    return { errors };
  }

  try {
    // Build CardDefinition
    const card: CardDefinition = {
      id: data.card.id,
      name: data.card.name,
      category: data.card.category,
      color_theme: data.card.color_theme as ColorTheme,
      icon: data.card.icon,
      description: data.card.description
        ? {
            short: data.card.description.short,
            long: data.card.description.long,
          }
        : undefined,
      metadata: parseCardMetadata(data.card.metadata),
      agenda: {
        file: data.card.agenda.file,
      },
      navigation: parseNavigationConfig(data.card.navigation),
      pages: parsePageReferences(data.card.pages),
      settings: parseCardSettings(data.card.settings),
    };

    return { card, errors: [] };
  } catch (error) {
    errors.push({
      type: 'VALIDATION_ERROR',
      message: error instanceof Error ? error.message : 'Unknown parsing error',
    });
    return { errors };
  }
}

/**
 * Parse card metadata
 */
function parseCardMetadata(data: any): CardMetadata | undefined {
  if (!data) return undefined;

  return {
    author: data.author,
    version: data.version,
    last_updated: data.last_updated,
    tags: data.tags,
    difficulty: data.difficulty,
    estimated_time: data.estimated_time,
    prerequisites: data.prerequisites,
    related_cards: data.related_cards,
    status: data.status,
    language: data.language,
    audience: data.audience,
  };
}

/**
 * Parse navigation configuration
 */
function parseNavigationConfig(data: any): NavigationConfig {
  return {
    type: data.type,
    show_breadcrumbs: data.show_breadcrumbs,
    show_page_tree: data.show_page_tree,
    allow_back_to_agenda: data.allow_back_to_agenda,
    show_next_previous: data.show_next_previous,
    tab_position: data.tab_position,
    show_progress: data.show_progress,
    progress_style: data.progress_style,
  };
}

/**
 * Parse page references
 */
function parsePageReferences(data: any[]): PageReference[] {
  if (!Array.isArray(data)) return [];

  return data.map((page) => ({
    file: page.file,
    order: page.order,
  }));
}

/**
 * Parse card settings
 */
function parseCardSettings(data: any): CardSettings {
  return {
    default_animation: data.default_animation,
    transition_speed: data.transition_speed,
    max_depth: data.max_depth,
    enable_search: data.enable_search,
    enable_bookmarks: data.enable_bookmarks,
    respect_reduced_motion: data.respect_reduced_motion,
  };
}
