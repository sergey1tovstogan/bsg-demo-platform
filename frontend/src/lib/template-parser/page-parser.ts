/**
 * Page Definition Parser
 * Parses page MD files into PageDefinition objects with all 4 title variants
 */

import { parseMarkdownFile, validateRequiredFields, ParseError } from './yaml-utils';
import type {
  PageDefinition,
  PageTitles,
  PageDescription,
  PageMetadata,
  PageNavigation,
  PageReference,
  PopupDefinition,
  Section,
} from '../template-types';

/**
 * Page parse result
 */
export interface PageParseResult {
  page?: PageDefinition;
  errors: ParseError[];
}

/**
 * Parse page definition from MD file content
 *
 * @param content - Raw markdown file content
 * @returns PageParseResult with parsed page or errors
 *
 * @example
 * ```typescript
 * const result = parsePageDefinition(fileContent);
 * if (result.errors.length === 0) {
 *   console.log('Page:', result.page.titles.page_header);
 * }
 * ```
 */
export function parsePageDefinition(content: string): PageParseResult {
  // Parse YAML
  const { data, errors: yamlErrors } = parseMarkdownFile(content);

  // If YAML parsing failed, return early
  if (yamlErrors.length > 0) {
    return { errors: yamlErrors };
  }

  // Validate required fields - including ALL 4 title variants
  const requiredFields = [
    'page.id',
    'page.titles',
    'page.titles.page_header',
    'page.titles.menu_title',
    'page.titles.agenda_title',
    'page.titles.breadcrumb',
  ];

  const validationErrors = validateRequiredFields(data, requiredFields);

  if (validationErrors.length > 0) {
    return { errors: validationErrors };
  }

  const errors: ParseError[] = [];

  try {
    // Build PageDefinition
    // Note: sections and navigation are at root level in YAML, not under page
    const page: PageDefinition = {
      id: data.page.id,
      titles: parsePageTitles(data.page.titles),
      description: parsePageDescription(data.page.description),
      metadata: parsePageMetadata(data.page.metadata),
      parent: data.page.parent,
      icon: data.page.icon,
      sections: parseSections(data.sections || []), // At root level!
      sub_pages: parseSubPages(data.page.sub_pages),
      popups: parsePopups(data.page.popups),
      navigation: parsePageNavigation(data.navigation), // At root level!
    };

    return { page, errors: [] };
  } catch (error) {
    errors.push({
      type: 'VALIDATION_ERROR',
      message: error instanceof Error ? error.message : 'Unknown parsing error',
    });
    return { errors };
  }
}

/**
 * Parse page titles (all 4 variants)
 */
function parsePageTitles(data: any): PageTitles {
  return {
    page_header: data.page_header,
    menu_title: data.menu_title,
    agenda_title: data.agenda_title,
    breadcrumb: data.breadcrumb,
  };
}

/**
 * Parse page description
 */
function parsePageDescription(data: any): PageDescription | undefined {
  if (!data) return undefined;

  return {
    short: data.short,
    long: data.long,
  };
}

/**
 * Parse page metadata
 */
function parsePageMetadata(data: any): PageMetadata | undefined {
  if (!data) return undefined;

  return {
    author: data.author,
    version: data.version,
    last_updated: data.last_updated,
    tags: data.tags,
    difficulty: data.difficulty,
    estimated_time: data.estimated_time,
  };
}

/**
 * Parse page navigation settings
 */
function parsePageNavigation(data: any): PageNavigation | undefined {
  if (!data) return undefined;

  return {
    show_breadcrumbs: data.show_breadcrumbs,
    show_back_button: data.show_back_button,
    show_next_previous: data.show_next_previous,
    back_to_agenda_button: data.back_to_agenda_button,
    siblings: data.siblings
      ? {
          previous: data.siblings.previous,
          next: data.siblings.next,
        }
      : undefined,
  };
}

/**
 * Parse sections array
 * Note: This is a basic parser that preserves section data as-is.
 * Full section validation will be done by section-parser.ts
 */
function parseSections(data: any[]): Section[] {
  if (!Array.isArray(data)) return [];

  // For now, just pass through the section data
  // The section-parser.ts will do full validation
  return data as Section[];
}

/**
 * Parse sub-pages references
 */
function parseSubPages(data: any): PageReference[] | undefined {
  if (!data || !Array.isArray(data)) return undefined;

  return data.map((page) => ({
    file: page.file,
    order: page.order,
  }));
}

/**
 * Parse popups
 */
function parsePopups(data: any): PopupDefinition[] | undefined {
  if (!data || !Array.isArray(data)) return undefined;

  return data.map((popup) => ({
    id: popup.id,
    size: popup.size,
    title: popup.title,
    animation: popup.animation,
    sections: popup.sections,
    content: popup.content,
    actions: popup.actions || [],
  }));
}
