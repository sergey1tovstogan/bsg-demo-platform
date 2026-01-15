/**
 * Animation type definitions for the template system
 * Covers all animation types documented in Phase 1
 */

/**
 * Entry animations - applied when sections first appear
 */
export type AnimationType =
  | 'fade-in'
  | 'slide-in-up'
  | 'slide-in-down'
  | 'slide-in-left'
  | 'slide-in-right'
  | 'scale-in'
  | 'bounce-in'
  | 'stagger-fade-in'
  | 'none';

/**
 * Hover effects - applied on mouse hover
 */
export type HoverEffect =
  | 'zoom'
  | 'lift'
  | 'glow'
  | 'border'
  | 'brightness';

/**
 * Expandable animations - applied when content expands/collapses
 */
export type ExpandableAnimation =
  | 'slide-down'
  | 'slide-up'
  | 'fade-in'
  | 'scale-expand';

/**
 * Page transitions - applied when navigating between pages
 */
export type PageTransition =
  | 'fade'
  | 'slide-left'
  | 'slide-right'
  | 'scale-fade'
  | 'instant';

/**
 * Loading animations - applied during loading states
 */
export type LoadingAnimation =
  | 'spinner'
  | 'dots'
  | 'pulse'
  | 'skeleton';
