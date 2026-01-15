/**
 * Template Types - Main Export File
 *
 * This module exports all TypeScript types for the MD template system.
 * Covers all 31 section types, 3 navigation types, popups, animations, and metadata.
 *
 * @module template-types
 */

// Animation types
export type {
  AnimationType,
  HoverEffect,
  ExpandableAnimation,
  PageTransition,
  LoadingAnimation,
} from './animation.types';

// Card types
export type {
  ColorTheme,
  Difficulty,
  CardStatus,
  CardMetadata,
  PageReference,
  CardSettings,
  CardDescription,
  AgendaReference,
  CardDefinition,
} from './card.types';

// Navigation types
export type {
  NavigationType,
  ProgressStyle,
  TabPosition,
  NavigationConfig,
  PageNode,
  NavigationHierarchy,
  Breadcrumb,
  Siblings,
} from './navigation.types';

// Page types
export type {
  PageTitles,
  PageDescription,
  PageMetadata,
  PageNavigation,
  PageDefinition,
} from './page.types';

// Section types (all 31 section types)
export type {
  ClickAction,
  BaseSection,
  // Content Display (9)
  HeroSection,
  TextSection,
  TextWithLinksSection,
  ImageSection,
  VideoSection,
  CodeBlockSection,
  QuoteSection,
  DividerSection,
  EmbedSection,
  // Navigation & Interactive (6)
  ImageClickableSection,
  FeatureItem,
  FeatureGridSection,
  ClickableCardItem,
  ClickableCardsSection,
  TabItem,
  TabbedContentSection,
  Hotspot,
  InteractiveDiagramSection,
  TextWithNavigationSection,
  // Data Presentation (6)
  ListSection,
  ComparisonItem,
  ComparisonGridSection,
  KeyValuePair,
  KeyValuePairsSection,
  StepItem,
  StepsSection,
  TimelineEvent,
  TimelineSection,
  TableSection,
  // Expandable (3)
  ExpandableSection,
  ExpandableCardSection,
  AccordionItem,
  AccordionSection,
  // Special (7)
  AlertSection,
  StatItem,
  StatsSection,
  DownloadFile,
  DownloadSection,
  GalleryImage,
  GallerySection,
  CardListItem,
  CardListSection,
  ProgressSection,
  TagsSection,
  LoadingSection,
  // Union type
  Section,
} from './section.types';

// Popup types
export type {
  PopupSize,
  PopupAction,
  PopupDefinition,
} from './popup.types';

// Agenda types
export type {
  AgendaItem,
  AgendaDefinition,
} from './agenda.types';
