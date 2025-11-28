import type { AnimationPath, DataFlowSegment } from '../types'

/**
 * Timing Constants for Animations and Data Flow
 */
export const TIMING = {
  /** Delay before animation sequence starts (ms) */
  ANIMATION_START_DELAY: 100,

  /** Delay before spawning dots after arrows appear (ms) */
  SPAWNING_START_DELAY: 1300,

  /** Interval between spawning business events (ms) */
  BUSINESS_EVENT_INTERVAL: 3500,

  /** Delay for data event after business event (ms) */
  DATA_EVENT_DELAY: 1500,

  /** Check interval for data flow updates (ms) */
  ANIMATION_CHECK_INTERVAL: 50,

  /** Buffer time between segment transitions (ms) */
  TRANSITION_BUFFER: 100,

  /** Component fade transition duration (ms) */
  COMPONENT_TRANSITION_DURATION: 500,
} as const

/**
 * Duration for each data flow segment (ms)
 */
export const SEGMENT_DURATIONS: Record<DataFlowSegment, number> = {
  'events-pubsub': 2000,
  'pubsub-microservices': 2000,
  'pubsub-fork-main': 1000,
  'fork-horizontal-left': 800,
  'fork-horizontal-right': 800,
  'fork-etl': 1000,
  'fork-datahub': 1000,
  // Legacy segments (not currently used in active flows)
  'pubsub-datahub': 2000,
  'datahub-analytics': 2000,
  'pubsub-etl': 2000,
}

/**
 * Components to grey out for each path
 */
export const PATH_GREYED_COMPONENTS: Record<AnimationPath, ReadonlyArray<string>> = {
  'path-c': [],

  'path-a': [
    'arrow-pubsub-microservices',
    'microservices',
  ],

  'path-b': [
    'events_left',
    'pub_sub',
    'microservices',
    'arrow-events-pubsub',
    'arrow-pubsub-microservices',
    'arrow-pubsub-fork-main',
    'arrow-fork-horizontal-left',
    'arrow-fork-horizontal-right',
    'arrow-fork-etl',
    'arrow-fork-datahub',
    'data_hub',
    'analytics',
    'ods',
    'sds',
    'ads',
    'arrow-sds-dwh',
  ],
}

/**
 * Segment transition configuration
 * Maps each segment to its possible next segments based on conditions
 *
 * Note: This structure is prepared for Step 8 (useDataFlow hook)
 * The actual transition logic will be implemented when extracting data flow logic
 */
export interface SegmentTransition {
  /** Target segment to transition to */
  nextSegment: DataFlowSegment | null
  /** Arrow ID for the next segment */
  nextPathId?: string
  /** Condition function to determine if transition should occur */
  condition?: (context: {
    dotType: 'business' | 'data'
    selectedPath: AnimationPath
    shouldSpawnPath1And2: boolean
  }) => boolean
  /** Special handling (e.g., 'split' for fork) */
  special?: 'split' | 'end'
  /** For split transitions, define multiple next segments */
  splitTargets?: Array<{
    segment: DataFlowSegment
    pathId: string
    idSuffix: string
  }>
}

/**
 * Segment Transitions Map
 * This will be fully implemented in Step 8 when creating useDataFlow hook
 * For now, we prepare the structure with type safety
 */
export const SEGMENT_TRANSITIONS: Record<DataFlowSegment, SegmentTransition> = {
  'events-pubsub': {
    nextSegment: null, // Will be determined by dot type
    special: undefined,
    condition: () => true, // Placeholder
  },

  'pubsub-microservices': {
    nextSegment: null,
    special: 'end',
  },

  'pubsub-fork-main': {
    nextSegment: null,
    special: 'split',
    splitTargets: [
      {
        segment: 'fork-horizontal-left',
        pathId: 'arrow-fork-horizontal-left',
        idSuffix: '-left',
      },
      {
        segment: 'fork-horizontal-right',
        pathId: 'arrow-fork-horizontal-right',
        idSuffix: '-right',
      },
    ],
  },

  'fork-horizontal-left': {
    nextSegment: 'fork-etl',
    nextPathId: 'arrow-fork-etl',
  },

  'fork-horizontal-right': {
    nextSegment: 'fork-datahub',
    nextPathId: 'arrow-fork-datahub',
  },

  'fork-etl': {
    nextSegment: null,
    special: 'end',
  },

  'fork-datahub': {
    nextSegment: null,
    special: 'end',
  },

  // Legacy segments (not currently used in active flows)
  'pubsub-datahub': {
    nextSegment: null,
    special: 'end',
  },

  'datahub-analytics': {
    nextSegment: null,
    special: 'end',
  },

  'pubsub-etl': {
    nextSegment: null,
    special: 'end',
  },
}

/**
 * Helper: Get duration for a segment
 */
export function getSegmentDuration(segment: DataFlowSegment): number {
  return SEGMENT_DURATIONS[segment]
}

/**
 * Helper: Get greyed components for a path
 */
export function getGreyedComponents(path: AnimationPath): ReadonlyArray<string> {
  return PATH_GREYED_COMPONENTS[path]
}

/**
 * Helper: Check if a component should be greyed out
 */
export function isComponentGreyed(componentId: string, path: AnimationPath): boolean {
  return PATH_GREYED_COMPONENTS[path].includes(componentId)
}
