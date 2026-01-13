/**
 * Section Parser
 * THE MOST CRITICAL PARSER - Parses ALL 31 section types
 *
 * This is the heart of the template system!
 */

import type { Section } from '../template-types';

/**
 * Parse a section from raw data into a typed Section object
 *
 * @param data - Raw section data from YAML
 * @returns Typed Section object
 * @throws Error if section type is unknown or required fields are missing
 */
export function parseSectionType(data: any): Section {
  if (!data || typeof data !== 'object') {
    throw new Error('Section data must be an object');
  }

  if (!data.type) {
    throw new Error('Section must have a type field');
  }

  const type = data.type as string;

  // Parse based on section type
  switch (type) {
    // Content Display (9 types)
    case 'hero':
      return parseHeroSection(data);
    case 'text':
      return parseTextSection(data);
    case 'text_with_links':
      return parseTextWithLinksSection(data);
    case 'image':
      return parseImageSection(data);
    case 'video':
      return parseVideoSection(data);
    case 'code_block':
      return parseCodeBlockSection(data);
    case 'quote':
      return parseQuoteSection(data);
    case 'divider':
      return parseDividerSection(data);
    case 'embed':
      return parseEmbedSection(data);

    // Navigation & Interactive (6 types)
    case 'image_clickable':
      return parseImageClickableSection(data);
    case 'feature_grid':
      return parseFeatureGridSection(data);
    case 'clickable_cards':
      return parseClickableCardsSection(data);
    case 'tabbed_content':
      return parseTabbedContentSection(data);
    case 'interactive_diagram':
      return parseInteractiveDiagramSection(data);
    case 'text_with_navigation':
      return parseTextWithNavigationSection(data);

    // Data Presentation (6 types)
    case 'list':
      return parseListSection(data);
    case 'comparison_grid':
      return parseComparisonGridSection(data);
    case 'key_value_pairs':
      return parseKeyValuePairsSection(data);
    case 'steps':
      return parseStepsSection(data);
    case 'timeline':
      return parseTimelineSection(data);
    case 'table':
      return parseTableSection(data);

    // Expandable (3 types)
    case 'expandable_section':
      return parseExpandableSection(data);
    case 'expandable_card':
      return parseExpandableCardSection(data);
    case 'accordion':
      return parseAccordionSection(data);

    // Special (7 types)
    case 'alert':
      return parseAlertSection(data);
    case 'stats':
      return parseStatsSection(data);
    case 'download':
      return parseDownloadSection(data);
    case 'gallery':
      return parseGallerySection(data);
    case 'card_list':
      return parseCardListSection(data);
    case 'progress':
      return parseProgressSection(data);
    case 'tags':
      return parseTagsSection(data);

    // Loading
    case 'loading':
      return parseLoadingSection(data);

    default:
      throw new Error(`Unknown section type: ${type}`);
  }
}

/**
 * Validate section has required fields
 *
 * @param section - Section data
 * @param requiredFields - Array of required field names
 * @returns Array of error messages (empty if valid)
 */
export function validateSection(section: any, requiredFields: string[]): string[] {
  const errors: string[] = [];

  for (const field of requiredFields) {
    if (!(field in section) || section[field] === undefined || section[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  return errors;
}

/**
 * Require fields helper
 */
function requireFields(data: any, fields: string[], sectionType: string): void {
  const errors = validateSection(data, fields);
  if (errors.length > 0) {
    throw new Error(`${sectionType} section: ${errors.join(', ')}`);
  }
}

// ============================================
// Content Display Sections (9 types)
// ============================================

function parseHeroSection(data: any): Section {
  requireFields(data, ['type', 'heading'], 'hero');
  return {
    type: 'hero',
    heading: data.heading,
    subtitle: data.subtitle,
    align: data.align,
  };
}

function parseTextSection(data: any): Section {
  requireFields(data, ['type', 'content'], 'text');
  return {
    type: 'text',
    content: data.content,
    align: data.align,
  };
}

function parseTextWithLinksSection(data: any): Section {
  requireFields(data, ['type', 'content'], 'text_with_links');
  return {
    type: 'text_with_links',
    content: data.content,
  };
}

function parseImageSection(data: any): Section {
  requireFields(data, ['type', 'src', 'alt'], 'image');
  return {
    type: 'image',
    src: data.src || data.image, // Support both field names
    alt: data.alt,
    caption: data.caption,
    width: data.width || data.size,
  };
}

function parseVideoSection(data: any): Section {
  requireFields(data, ['type'], 'video');
  return {
    type: 'video',
    src: data.src || data.video_url,
    caption: data.caption,
    aspect_ratio: data.aspect_ratio,
  };
}

function parseCodeBlockSection(data: any): Section {
  requireFields(data, ['type', 'code'], 'code_block');
  return {
    type: 'code_block',
    code: data.code,
    language: data.language,
    title: data.title || data.filename,
  };
}

function parseQuoteSection(data: any): Section {
  requireFields(data, ['type'], 'quote');
  return {
    type: 'quote',
    text: data.text || data.content,
    citation: data.citation || data.author,
  };
}

function parseDividerSection(data: any): Section {
  return {
    type: 'divider',
    style: data.style,
  };
}

function parseEmbedSection(data: any): Section {
  requireFields(data, ['type', 'url'], 'embed');
  return {
    type: 'embed',
    url: data.url,
    height: data.height,
    title: data.title,
  };
}

// ============================================
// Navigation & Interactive Sections (6 types)
// ============================================

function parseImageClickableSection(data: any): Section {
  requireFields(data, ['type', 'alt', 'action'], 'image_clickable');
  return {
    type: 'image_clickable',
    src: data.src || data.image,
    alt: data.alt,
    caption: data.caption,
    action: data.action || data.click_action,
  };
}

function parseFeatureGridSection(data: any): Section {
  requireFields(data, ['type', 'features'], 'feature_grid');
  return {
    type: 'feature_grid',
    features: data.features,
    columns: data.columns,
  };
}

function parseClickableCardsSection(data: any): Section {
  requireFields(data, ['type', 'cards'], 'clickable_cards');
  return {
    type: 'clickable_cards',
    cards: data.cards,
    columns: data.columns,
  };
}

function parseTabbedContentSection(data: any): Section {
  requireFields(data, ['type', 'tabs'], 'tabbed_content');
  return {
    type: 'tabbed_content',
    tabs: data.tabs,
  };
}

function parseInteractiveDiagramSection(data: any): Section {
  requireFields(data, ['type', 'image', 'hotspots'], 'interactive_diagram');
  return {
    type: 'interactive_diagram',
    image: data.image,
    hotspots: data.hotspots,
  };
}

function parseTextWithNavigationSection(data: any): Section {
  requireFields(data, ['type', 'content', 'links'], 'text_with_navigation');
  return {
    type: 'text_with_navigation',
    content: data.content,
    links: data.links,
  };
}

// ============================================
// Data Presentation Sections (6 types)
// ============================================

function parseListSection(data: any): Section {
  requireFields(data, ['type', 'items'], 'list');
  return {
    type: 'list',
    list_type: data.list_type || data.list_style,
    items: data.items,
  };
}

function parseComparisonGridSection(data: any): Section {
  requireFields(data, ['type', 'items'], 'comparison_grid');
  return {
    type: 'comparison_grid',
    items: data.items,
  };
}

function parseKeyValuePairsSection(data: any): Section {
  requireFields(data, ['type', 'pairs'], 'key_value_pairs');
  return {
    type: 'key_value_pairs',
    pairs: data.pairs,
  };
}

function parseStepsSection(data: any): Section {
  requireFields(data, ['type', 'steps'], 'steps');
  return {
    type: 'steps',
    steps: data.steps,
  };
}

function parseTimelineSection(data: any): Section {
  requireFields(data, ['type', 'events'], 'timeline');
  return {
    type: 'timeline',
    events: data.events,
  };
}

function parseTableSection(data: any): Section {
  requireFields(data, ['type', 'headers', 'rows'], 'table');
  return {
    type: 'table',
    headers: data.headers,
    rows: data.rows,
    striped: data.striped,
    compact: data.compact,
  };
}

// ============================================
// Expandable Content Sections (3 types)
// ============================================

function parseExpandableSection(data: any): Section {
  requireFields(data, ['type', 'trigger', 'collapsed', 'expanded'], 'expandable_section');
  return {
    type: 'expandable_section',
    trigger: data.trigger,
    collapsed: data.collapsed,
    expanded: data.expanded,
    max_height: data.max_height,
  };
}

function parseExpandableCardSection(data: any): Section {
  requireFields(data, ['type', 'trigger', 'collapsed_title', 'expanded_content'], 'expandable_card');
  return {
    type: 'expandable_card',
    trigger: data.trigger,
    collapsed_title: data.collapsed_title,
    expanded_content: data.expanded_content,
    icon: data.icon,
    animation: data.animation,
  };
}

function parseAccordionSection(data: any): Section {
  requireFields(data, ['type', 'items'], 'accordion');
  return {
    type: 'accordion',
    allow_multiple: data.allow_multiple,
    items: data.items,
  };
}

// ============================================
// Special Elements Sections (7 types)
// ============================================

function parseAlertSection(data: any): Section {
  requireFields(data, ['type', 'alert_type', 'content'], 'alert');
  return {
    type: 'alert',
    alert_type: data.alert_type,
    title: data.title,
    content: data.content,
    dismissible: data.dismissible,
    icon: data.icon,
  };
}

function parseStatsSection(data: any): Section {
  requireFields(data, ['type', 'stats'], 'stats');
  return {
    type: 'stats',
    stats: data.stats,
    columns: data.columns,
  };
}

function parseDownloadSection(data: any): Section {
  requireFields(data, ['type', 'files'], 'download');
  return {
    type: 'download',
    files: data.files,
  };
}

function parseGallerySection(data: any): Section {
  requireFields(data, ['type', 'images'], 'gallery');
  return {
    type: 'gallery',
    images: data.images,
    columns: data.columns,
  };
}

function parseCardListSection(data: any): Section {
  requireFields(data, ['type'], 'card_list');
  return {
    type: 'card_list',
    cards: data.cards || data.items,
  };
}

function parseProgressSection(data: any): Section {
  requireFields(data, ['type', 'label', 'value'], 'progress');
  return {
    type: 'progress',
    label: data.label,
    value: data.value,
    max: data.max,
    color: data.color,
  };
}

function parseTagsSection(data: any): Section {
  requireFields(data, ['type', 'tags'], 'tags');
  return {
    type: 'tags',
    tags: data.tags,
  };
}

// ============================================
// Loading Section
// ============================================

function parseLoadingSection(data: any): Section {
  requireFields(data, ['type', 'style'], 'loading');
  return {
    type: 'loading',
    style: data.style,
    message: data.message,
  };
}
