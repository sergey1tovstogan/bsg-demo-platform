/**
 * Barrel export for all configuration modules
 * Provides a single import point for all config files
 */

// Components configuration
export {
  STATIC_COMPONENTS,
  ANIMATED_COMPONENTS,
  ARROWS,
  getComponentById,
  getArrowById,
  getAllComponents,
} from './components.config'

// Animation sequences configuration
export {
  ANIMATION_SEQUENCES,
  PATH_DESCRIPTIONS,
  PATH_METADATA,
  getSequenceForPath,
  isComponentInPath,
  getPathComponentIds,
} from './animations.config'

// Transitions and timing configuration
export {
  TIMING,
  SEGMENT_DURATIONS,
  PATH_GREYED_COMPONENTS,
  SEGMENT_TRANSITIONS,
  getSegmentDuration,
  getGreyedComponents,
  isComponentGreyed,
} from './transitions.config'

// Re-export types for convenience
export type { ComponentItem, ArrowItem, AnimationStep } from '../types'
