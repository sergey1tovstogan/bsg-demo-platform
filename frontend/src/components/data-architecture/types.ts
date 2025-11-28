/**
 * Type definitions for Data Architecture visualization component
 */

// ============================================================================
// Animation & Playback Types
// ============================================================================

/** Animation path identifiers */
export type AnimationPath = 'path-c' | 'path-a' | 'path-b'

/** Playback control states */
export type PlaybackState = 'idle' | 'playing' | 'paused' | 'completed'

/** Animation step definition */
export interface AnimationStep {
  componentId: string
  delay: number
  type: 'component' | 'arrow'
}

// ============================================================================
// Component & Arrow Types
// ============================================================================

/** Position and dimensions */
export interface Position {
  x: number
  y: number
  width: number
  height: number
}

/** Component definition */
export interface ComponentItem {
  id: string
  label: string
  image: string
  position: Position
  tooltip?: string
}

/** Arrow/connection definition */
export interface ArrowItem {
  id: string
  from: string
  to: string
  points: string // SVG path points
  label?: string
  dashArray?: string
  color?: string
}

// ============================================================================
// Data Flow Types
// ============================================================================

/** Data flow segment identifiers */
export type DataFlowSegment =
  | 'events-pubsub'
  | 'pubsub-microservices'
  | 'pubsub-datahub'
  | 'datahub-analytics'
  | 'pubsub-etl'
  | 'pubsub-fork-main'
  | 'fork-horizontal-left'
  | 'fork-horizontal-right'
  | 'fork-etl'
  | 'fork-datahub'

/** Animated data flow dot */
export interface DataFlowDot {
  id: string
  type: 'business' | 'data'
  pathId: string
  startTime: number
  segment: DataFlowSegment
}

// ============================================================================
// State Management Types (for Phase 2 refactoring)
// ============================================================================

/** Visibility state consolidation */
export interface VisibilityState {
  visible: Set<string>
  everAnimated: Set<string>
}

/** Path state consolidation */
export interface PathState {
  completedPaths: Set<AnimationPath>
  greyedComponents: Set<string>
  shouldSpawnContinuously: boolean
}

/** Spawning configuration */
export interface SpawningConfig {
  shouldSpawn: boolean
  spawningTrigger: number
}

// ============================================================================
// Transition Configuration Types (for Phase 2 refactoring)
// ============================================================================

/** Segment transition configuration */
export interface SegmentTransition {
  id: DataFlowSegment
  duration: number
  nextSegments: {
    if: (dot: DataFlowDot, context: TransitionContext) => boolean
    then: DataFlowSegment | DataFlowSegment[]
  }[]
  canDuplicate?: boolean
}

/** Context for transition decisions */
export interface TransitionContext {
  selectedPath: AnimationPath
  shouldSpawnPath1And2: boolean
}

// ============================================================================
// Animation Timing Constants
// ============================================================================

export interface AnimationTimingConfig {
  START_SPAWNING_DELAY: number
  DATA_EVENT_DELAY: number
  BUSINESS_EVENT_INTERVAL: number
  CLEANUP_INTERVAL: number
  SEGMENT_DURATIONS: Record<string, number>
}

// ============================================================================
// Path Configuration
// ============================================================================

/** Path metadata */
export interface PathMetadata {
  id: AnimationPath
  name: string
  description: string
  shortDescription: string
}

// ============================================================================
// Color Scheme
// ============================================================================

export interface ColorScheme {
  // Primary colors (Temenos brand)
  temenosBrand: string
  temenosAccent: string

  // Path colors (WCAG AA compliant)
  eventPath: string
  dataPath: string

  // Data flow dots
  businessEvent: string
  dataEvent: string

  // UI colors
  canvas: string
  canvasBorder: string

  // States
  greyOpacity: number
}
