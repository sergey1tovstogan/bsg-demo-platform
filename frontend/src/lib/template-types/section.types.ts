/**
 * Section type definitions
 * Covers all 31 section types from Phase 1
 */

import { ExpandableAnimation } from './animation.types';

/**
 * Click action types
 */
export interface ClickAction {
  type: 'navigate_to_subpage' | 'show_popup' | 'external_link';
  target?: string;      // page ID or URL
  popup_id?: string;    // for show_popup
  open_in_new_tab?: boolean; // for external_link
}

/**
 * Base section interface
 */
export interface BaseSection {
  type: string;
}

/**
 * ============================================
 * CONTENT DISPLAY SECTIONS (9 types)
 * ============================================
 */

/**
 * Hero section - Page headers with title/subtitle
 */
export interface HeroSection extends BaseSection {
  type: 'hero';
  heading: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
}

/**
 * Text section - Regular paragraph content with markdown
 */
export interface TextSection extends BaseSection {
  type: 'text';
  content: string;
  align?: 'left' | 'center' | 'right' | 'justify';
}

/**
 * Text with links section - Text with action links
 */
export interface TextWithLinksSection extends BaseSection {
  type: 'text_with_links';
  content: string;
  links?: Array<{
    label: string;
    action: ClickAction;
  }>;
}

/**
 * Image section - Static images
 */
export interface ImageSection extends BaseSection {
  type: 'image';
  src: string;
  alt: string;
  caption?: string;
  width?: 'full' | 'half' | 'third';
}

/**
 * Video section - Embedded videos (YouTube, Vimeo, MP4)
 */
export interface VideoSection extends BaseSection {
  type: 'video';
  src: string;
  caption?: string;
  aspect_ratio?: '16:9' | '4:3' | '1:1';
}

/**
 * Code block section - Syntax-highlighted code
 */
export interface CodeBlockSection extends BaseSection {
  type: 'code_block';
  code: string;
  language?: string;
  title?: string;
}

/**
 * Quote section - Blockquotes with attribution
 */
export interface QuoteSection extends BaseSection {
  type: 'quote';
  text: string;
  citation?: string;
}

/**
 * Divider section - Visual separators
 */
export interface DividerSection extends BaseSection {
  type: 'divider';
  style?: 'solid' | 'dashed' | 'dotted' | 'thick';
}

/**
 * Embed section - iframe embeds
 */
export interface EmbedSection extends BaseSection {
  type: 'embed';
  url: string;
  height?: string;
  title?: string;
}

/**
 * ============================================
 * NAVIGATION & INTERACTIVE SECTIONS (6 types)
 * ============================================
 */

/**
 * Clickable image section - Images with click actions
 */
export interface ImageClickableSection extends BaseSection {
  type: 'image_clickable';
  src: string;
  alt: string;
  caption?: string;
  action: ClickAction;
}

/**
 * Feature item for feature grid
 */
export interface FeatureItem {
  title: string;
  icon?: string;
  description: string;
}

/**
 * Feature grid section - Clickable feature cards (2-4 columns)
 */
export interface FeatureGridSection extends BaseSection {
  type: 'feature_grid';
  features: FeatureItem[];
  columns?: 2 | 3 | 4;
}

/**
 * Clickable card item
 */
export interface ClickableCardItem {
  title: string;
  description: string;
  icon?: string;
  hover_effect?: string;
  click_action: ClickAction;
}

/**
 * Clickable cards section - Navigation card grids
 */
export interface ClickableCardsSection extends BaseSection {
  type: 'clickable_cards';
  cards: ClickableCardItem[];
  columns?: 2 | 3 | 4;
}

/**
 * Tab item for tabbed content
 */
export interface TabItem {
  label: string;
  icon?: string;
  content?: string;
  click_action?: ClickAction;
}

/**
 * Tabbed content section - Tab interface
 */
export interface TabbedContentSection extends BaseSection {
  type: 'tabbed_content';
  tabs: TabItem[];
}

/**
 * Hotspot for interactive diagrams
 */
export interface Hotspot {
  x: number;
  y: number;
  radius: number;
  click_action: ClickAction;
  hover_text?: string;
}

/**
 * Interactive diagram section - Images with clickable hotspots
 */
export interface InteractiveDiagramSection extends BaseSection {
  type: 'interactive_diagram';
  image: string;
  hotspots: Hotspot[];
}

/**
 * Text with navigation section - Alternative navigation text
 */
export interface TextWithNavigationSection extends BaseSection {
  type: 'text_with_navigation';
  content: string;
  links: Array<{
    text: string;
    click_action: ClickAction;
  }>;
}

/**
 * ============================================
 * DATA PRESENTATION SECTIONS (6 types)
 * ============================================
 */

/**
 * List section - Bullet/numbered/checklist
 */
export interface ListSection extends BaseSection {
  type: 'list';
  list_type?: 'bullet' | 'numbered' | 'checklist';
  items: string[];
}

/**
 * Comparison item for comparison grid
 */
export interface ComparisonItem {
  title: string;
  badge?: string;
  heading?: string;
  subheading?: string;
  points?: string[];
  features: Array<{
    label: string;
    included: boolean;
  }>;
}

/**
 * Comparison grid section - Side-by-side comparisons
 */
export interface ComparisonGridSection extends BaseSection {
  type: 'comparison_grid';
  items: ComparisonItem[];
}

/**
 * Key-value pair item
 */
export interface KeyValuePair {
  key: string;
  value: string;
}

/**
 * Key-value pairs section - Label-value displays
 */
export interface KeyValuePairsSection extends BaseSection {
  type: 'key_value_pairs';
  pairs: KeyValuePair[];
}

/**
 * Step item for steps section
 */
export interface StepItem {
  title?: string;
  description: string;
}

/**
 * Steps section - Numbered step-by-step guides
 */
export interface StepsSection extends BaseSection {
  type: 'steps';
  steps: StepItem[];
}

/**
 * Timeline event item
 */
export interface TimelineEvent {
  date?: string;
  title: string;
  description: string;
}

/**
 * Timeline section - Chronological events
 */
export interface TimelineSection extends BaseSection {
  type: 'timeline';
  events: TimelineEvent[];
}

/**
 * Table section - Structured data tables
 */
export interface TableSection extends BaseSection {
  type: 'table';
  headers: string[];
  rows: string[][];
  striped?: boolean;
  compact?: boolean;
}

/**
 * ============================================
 * EXPANDABLE CONTENT SECTIONS (3 types)
 * ============================================
 */

/**
 * Expandable section - Collapsible content blocks
 */
export interface ExpandableSection extends BaseSection {
  type: 'expandable_section';
  trigger: 'click' | 'hover';
  collapsed: {
    title: string;
    icon?: string;
    text?: string;
  };
  expanded: {
    content: string;
    animation?: ExpandableAnimation;
  };
  max_height?: string;
}

/**
 * Expandable card section - Card-style expandable content
 */
export interface ExpandableCardSection extends BaseSection {
  type: 'expandable_card';
  trigger: 'click' | 'hover';
  collapsed_title: string;
  expanded_content: string;
  icon?: string;
  animation?: ExpandableAnimation;
}

/**
 * Accordion item
 */
export interface AccordionItem {
  title: string;
  content: string;
}

/**
 * Accordion section - Multiple expandable items
 */
export interface AccordionSection extends BaseSection {
  type: 'accordion';
  allow_multiple?: boolean;
  items: AccordionItem[];
}

/**
 * ============================================
 * SPECIAL ELEMENTS SECTIONS (7 types)
 * ============================================
 */

/**
 * Alert section - Info/success/warning/error callouts
 */
export interface AlertSection extends BaseSection {
  type: 'alert';
  alert_type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  content: string;
  dismissible?: boolean;
  icon?: string;
}

/**
 * Stat item for stats section
 */
export interface StatItem {
  label: string;
  value: string;
  description?: string;
}

/**
 * Stats section - Key metrics display
 */
export interface StatsSection extends BaseSection {
  type: 'stats';
  stats: StatItem[];
  columns?: 2 | 3 | 4;
}

/**
 * Download file item
 */
export interface DownloadFile {
  name: string;
  url: string;
  description?: string;
  size?: string;
}

/**
 * Download section - File download links
 */
export interface DownloadSection extends BaseSection {
  type: 'download';
  files: DownloadFile[];
}

/**
 * Gallery image item
 */
export interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
  hover_effect?: string;
}

/**
 * Gallery section - Image grids
 */
export interface GallerySection extends BaseSection {
  type: 'gallery';
  images: GalleryImage[];
  columns?: 2 | 3 | 4;
}

/**
 * Card list item
 */
export interface CardListItem {
  title?: string;
  content: string;
}

/**
 * Card list section - Vertical list of cards
 */
export interface CardListSection extends BaseSection {
  type: 'card_list';
  cards: CardListItem[];
}

/**
 * Progress section - Progress indicators
 */
export interface ProgressSection extends BaseSection {
  type: 'progress';
  label: string;
  value: number;
  max?: number;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

/**
 * Tags section - Tag/badge clouds
 */
export interface TagsSection extends BaseSection {
  type: 'tags';
  tags: string[];
  style?: 'default' | 'primary' | 'success' | 'outline';
}

/**
 * Loading section - Loading state indicators
 */
export interface LoadingSection extends BaseSection {
  type: 'loading';
  style: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  message?: string;
}

/**
 * ============================================
 * UNION TYPE - ALL 31 SECTIONS
 * ============================================
 */

/**
 * Union type of all section types
 * This enables discriminated unions for type-safe section rendering
 */
export type Section =
  // Content Display (9)
  | HeroSection
  | TextSection
  | TextWithLinksSection
  | ImageSection
  | VideoSection
  | CodeBlockSection
  | QuoteSection
  | DividerSection
  | EmbedSection
  // Navigation & Interactive (6)
  | ImageClickableSection
  | FeatureGridSection
  | ClickableCardsSection
  | TabbedContentSection
  | InteractiveDiagramSection
  | TextWithNavigationSection
  // Data Presentation (6)
  | ListSection
  | ComparisonGridSection
  | KeyValuePairsSection
  | StepsSection
  | TimelineSection
  | TableSection
  // Expandable (3)
  | ExpandableSection
  | ExpandableCardSection
  | AccordionSection
  // Special (7)
  | AlertSection
  | StatsSection
  | DownloadSection
  | GallerySection
  | CardListSection
  | ProgressSection
  | TagsSection
  | LoadingSection;
