/**
 * Popup/Modal type definitions
 * Supports popups with sections and action buttons
 */

import { Section } from './section.types';
import { AnimationType } from './animation.types';

/**
 * Popup size variants
 */
export type PopupSize = 'small' | 'medium' | 'large' | 'full-screen';

/**
 * Popup action button
 */
export interface PopupAction {
  label: string;
  action: {
    type: 'navigate_to_page' | 'navigate_to_subpage' | 'external_link' | 'close_popup';
    target?: string;  // page ID
    url?: string;     // for external_link
  };
}

/**
 * Complete popup definition
 */
export interface PopupDefinition {
  id: string;
  size: PopupSize;
  title: string;
  animation?: AnimationType;
  sections?: Section[];
  content?: string; // Simple text-only popup (alternative to sections)
  actions: PopupAction[];
}
