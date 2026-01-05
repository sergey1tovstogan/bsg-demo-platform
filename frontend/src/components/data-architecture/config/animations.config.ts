/**
 * Animation sequences and path metadata for Data Architecture visualization
 */

import type { AnimationPath, AnimationStep, PathMetadata } from '../types'

// ============================================================================
// Animation Sequences
// ============================================================================

export const ANIMATION_SEQUENCES: Record<AnimationPath, Readonly<AnimationStep>[]> = {
  'path-c': [
    // Path 1 (path-c): Events → Pub/Sub → Microservices - Components appear first, then arrows
    { componentId: 'events_left', delay: 0, type: 'component' },
    { componentId: 'pub_sub', delay: 0, type: 'component' },
    { componentId: 'microservices', delay: 0, type: 'component' },
    { componentId: 'arrow-events-pubsub', delay: 1000, type: 'arrow' },
    { componentId: 'arrow-pubsub-microservices', delay: 1000, type: 'arrow' },
  ],

  'path-a': [
    // Path 2 (path-a): Events → Pub/Sub → (Microservices greyed + ETL + Data Hub + Analytics)
    { componentId: 'events_left', delay: 0, type: 'component' },
    { componentId: 'pub_sub', delay: 0, type: 'component' },
    { componentId: 'arrow-events-pubsub', delay: 1000, type: 'arrow' },
    // Show greyed out microservices path and ETL/data hub/analytics at same time
    { componentId: 'arrow-pubsub-microservices', delay: 2000, type: 'arrow' },
    { componentId: 'microservices', delay: 2000, type: 'component' },
    { componentId: 'etl', delay: 2000, type: 'component' },
    { componentId: 'data_hub', delay: 2000, type: 'component' },
    { componentId: 'analytics', delay: 2000, type: 'component' },
    // Forked arrows (main → horizontal → down to both sides) and data stores appear together
    { componentId: 'arrow-pubsub-fork-main', delay: 2500, type: 'arrow' },
    { componentId: 'arrow-fork-horizontal-left', delay: 2500, type: 'arrow' },
    { componentId: 'arrow-fork-horizontal-right', delay: 2500, type: 'arrow' },
    { componentId: 'arrow-fork-etl', delay: 2500, type: 'arrow' },
    { componentId: 'arrow-fork-datahub', delay: 2500, type: 'arrow' },
    { componentId: 'ods', delay: 2500, type: 'component' },
    { componentId: 'sds', delay: 2500, type: 'component' },
    { componentId: 'ads', delay: 2500, type: 'component' },
    // Data Warehouse appears in cascade effect when bubbles reach fork
    { componentId: 'data_warehouse', delay: 2500, type: 'component' },
    // Intermittent arrows to DWH appear shortly after
    { componentId: 'arrow-etl-dwh', delay: 3000, type: 'arrow' },
    { componentId: 'arrow-sds-dwh', delay: 3000, type: 'arrow' },
  ],

  'path-b': [
    // Path 3 (path-b): EOD Process - File → ETL → Data Warehouse
    // First show greyed out Path 1 and Path 2 components with animation
    { componentId: 'events_left', delay: 0, type: 'component' },
    { componentId: 'pub_sub', delay: 0, type: 'component' },
    { componentId: 'microservices', delay: 0, type: 'component' },
    { componentId: 'data_hub', delay: 0, type: 'component' },
    { componentId: 'analytics', delay: 0, type: 'component' },
    { componentId: 'ods', delay: 0, type: 'component' },
    { componentId: 'sds', delay: 0, type: 'component' },
    { componentId: 'ads', delay: 0, type: 'component' },
    { componentId: 'arrow-events-pubsub', delay: 500, type: 'arrow' },
    { componentId: 'arrow-pubsub-microservices', delay: 500, type: 'arrow' },
    { componentId: 'arrow-pubsub-fork-main', delay: 500, type: 'arrow' },
    { componentId: 'arrow-fork-horizontal-left', delay: 500, type: 'arrow' },
    { componentId: 'arrow-fork-horizontal-right', delay: 500, type: 'arrow' },
    { componentId: 'arrow-fork-etl', delay: 500, type: 'arrow' },
    { componentId: 'arrow-fork-datahub', delay: 500, type: 'arrow' },
    { componentId: 'arrow-sds-dwh', delay: 500, type: 'arrow' },

    // Now show Path 3 active components
    { componentId: 'file_left', delay: 1000, type: 'component' },
    { componentId: 'etl', delay: 2000, type: 'component' },
    { componentId: 'data_warehouse', delay: 3000, type: 'component' },
    { componentId: 'arrow-file-etl', delay: 4000, type: 'arrow' },
    { componentId: 'arrow-etl-dwh', delay: 5000, type: 'arrow' },
  ],
}

// ============================================================================
// Path Descriptions
// ============================================================================

export const PATH_DESCRIPTIONS: Record<AnimationPath, string> = {
  'path-c': 'Event-Driven Path: Core → Events → Pub/Sub → Microservices',
  'path-a': 'Event-Driven Path: Core → Events → Pub/Sub → Data Hub + Analytics (Data Events only)',
  'path-b': 'EOD Process (Flat Files): Core → File → ETL → Data Warehouse',
}

// ============================================================================
// Path Metadata
// ============================================================================

export const PATH_METADATA: Record<AnimationPath, PathMetadata> = {
  'path-c': {
    id: 'path-c',
    name: 'Path 1',
    description: PATH_DESCRIPTIONS['path-c'],
    shortDescription: 'Event Driven: Business Events (only)',
  },
  'path-a': {
    id: 'path-a',
    name: 'Path 2',
    description: PATH_DESCRIPTIONS['path-a'],
    shortDescription: 'Event Driven: Data Events',
  },
  'path-b': {
    id: 'path-b',
    name: 'Path 3',
    description: PATH_DESCRIPTIONS['path-b'],
    shortDescription: 'EOD Process: Flat Files',
  },
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get animation sequence for a specific path
 */
export function getSequenceForPath(path: AnimationPath): Readonly<AnimationStep>[] {
  return ANIMATION_SEQUENCES[path]
}

/**
 * Check if a component is part of a specific path's animation sequence
 */
export function isComponentInPath(componentId: string, path: AnimationPath): boolean {
  return ANIMATION_SEQUENCES[path].some((step) => step.componentId === componentId)
}

/**
 * Get all component IDs that are part of a path's animation
 */
export function getPathComponentIds(path: AnimationPath): string[] {
  return ANIMATION_SEQUENCES[path].map((step) => step.componentId)
}

/**
 * Get the total duration of a path's animation sequence
 */
export function getPathDuration(path: AnimationPath): number {
  const sequence = ANIMATION_SEQUENCES[path]
  if (sequence.length === 0) return 0

  return Math.max(...sequence.map((step) => step.delay))
}

/**
 * Get combined component IDs from multiple paths
 */
export function getCombinedPathComponents(paths: AnimationPath[]): Set<string> {
  const combined = new Set<string>()
  paths.forEach((path) => {
    ANIMATION_SEQUENCES[path].forEach((step) => combined.add(step.componentId))
  })
  return combined
}
