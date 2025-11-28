/**
 * Component and Arrow configuration for Data Architecture visualization
 */

import type { ComponentItem, ArrowItem } from '../types'

// ============================================================================
// Static Components (Always Visible)
// ============================================================================

export const STATIC_COMPONENTS: Readonly<ComponentItem>[] = [
  // Core system - Left side large dark blue box (8px grid aligned)
  {
    id: 'temenos_core',
    label: 'Temenos Core',
    image: 'Temenos_Core.png',
    position: { x: 40, y: 40, width: 176, height: 280 },
    tooltip: 'Core banking system handling commands and queries',
  },

  // Databases - Below core system in a row (8px grid aligned)
  {
    id: 'live',
    label: 'Live',
    image: 'Live.png',
    position: { x: 40, y: 336, width: 76, height: 76 },
    tooltip: 'Live operational database',
  },
  {
    id: 'archive',
    label: 'Archive',
    image: 'Archive.png',
    position: { x: 132, y: 336, width: 76, height: 76 },
    tooltip: 'Archive database for historical data',
  },
  {
    id: 'nvdb',
    label: 'NVDB',
    image: 'NVDB.png',
    position: { x: 40, y: 420, width: 168, height: 72 },
    tooltip: 'Non-volatile database',
  },
]

// ============================================================================
// Animated Components (Appear Based on Selected Path)
// ============================================================================

export const ANIMATED_COMPONENTS: Readonly<ComponentItem>[] = [
  // Tags over/near Temenos Core
  {
    id: 'events_left',
    label: 'Events',
    image: 'Events.png',
    position: { x: 184, y: 79, width: 104, height: 56 },
    tooltip: 'Event publishing system',
  },
  {
    id: 'file_left',
    label: 'File (low volume)',
    image: 'File.png',
    position: { x: 184, y: 220, width: 104, height: 56 },
    tooltip: 'File-based data export for low volume data',
  },

  // Middle tier - Build/Buy area
  {
    id: 'pub_sub',
    label: 'Pub/Sub (e.g., Kafka)',
    image: 'Pub_Sub.png',
    position: { x: 537, y: 66, width: 139, height: 82 },
    tooltip: 'Message broker for event streaming',
  },
  {
    id: 'etl',
    label: 'ETL',
    image: 'ETL.png',
    position: { x: 408, y: 246, width: 144, height: 64 },
    tooltip: 'Extract, Transform, Load processes',
  },

  // Center-right - Data Hub & Analytics band
  {
    id: 'data_hub',
    label: 'Data Hub',
    image: 'Data_Hub.png',
    position: { x: 656, y: 233, width: 152, height: 90 },
    tooltip: 'Centralized data hub with specialized stores',
  },
  {
    id: 'analytics',
    label: 'Analytics (optional)',
    image: 'Analytics.png',
    position: { x: 818, y: 246, width: 120, height: 64 },
    tooltip: 'Analytics and reporting platform',
  },

  // Cylinders overlaying bottom of Data Hub and Analytics
  {
    id: 'ods',
    label: 'ODS',
    image: 'ODS.png',
    position: { x: 666, y: 290, width: 59, height: 59 },
    tooltip: 'Operational Data Store',
  },
  {
    id: 'sds',
    label: 'SDS',
    image: 'SDS.png',
    position: { x: 742, y: 290, width: 59, height: 59 },
    tooltip: 'Staging Data Store',
  },
  {
    id: 'ads',
    label: 'ADS',
    image: 'ADS.png',
    position: { x: 850, y: 290, width: 59, height: 59 },
    tooltip: 'Analytical Data Store',
  },

  // Bottom - Data Warehouse bar
  {
    id: 'data_warehouse',
    label: 'Data Warehouse',
    image: 'DWH.png',
    position: { x: 418, y: 390, width: 462, height: 54 },
    tooltip: 'Centralized data repository for analytics',
  },

  // Right tier - Microservices panel
  {
    id: 'microservices',
    label: 'Business Microservices (optional)',
    image: 'Microservices.png',
    position: { x: 872, y: 39, width: 240, height: 136 },
    tooltip: 'Optional microservices with dedicated databases (Holdings, Party)',
  },
]

// ============================================================================
// Arrows/Connections
// ============================================================================

export const ARROWS: Readonly<ArrowItem>[] = [
  // Path 1 arrows - Event-Driven path
  {
    id: 'arrow-events-pubsub',
    from: 'events_left',
    to: 'pub_sub',
    points: 'M 288 107 L 552 107',
    dashArray: '5,5',
    color: '#293276',
  },
  {
    id: 'arrow-pubsub-microservices',
    from: 'pub_sub',
    to: 'microservices',
    points: 'M 661 107 L 887 107',
    dashArray: '5,5',
    color: '#293276',
  },

  // Path 2 forked arrows - From Pub/Sub down, then fork to ETL (left) and Data Hub (right)
  {
    id: 'arrow-pubsub-fork-main',
    from: 'pub_sub',
    to: 'fork',
    points: 'M 606 148 L 606 200',
    dashArray: '5,5',
    color: '#293276',
  },
  {
    id: 'arrow-fork-horizontal',
    from: 'fork',
    to: 'fork',
    points: 'M 480 200 L 732 200',
    dashArray: '5,5',
    color: '#293276',
  },
  {
    id: 'arrow-fork-horizontal-left',
    from: 'fork',
    to: 'etl',
    points: 'M 606 200 L 480 200',
    dashArray: '5,5',
    color: '#293276',
  },
  {
    id: 'arrow-fork-horizontal-right',
    from: 'fork',
    to: 'data_hub',
    points: 'M 606 200 L 732 200',
    dashArray: '5,5',
    color: '#293276',
  },
  {
    id: 'arrow-fork-etl',
    from: 'fork',
    to: 'etl',
    points: 'M 480 200 L 480 252',
    dashArray: '5,5',
    color: '#293276',
  },
  {
    id: 'arrow-fork-datahub',
    from: 'fork',
    to: 'data_hub',
    points: 'M 732 200 L 732 245',
    dashArray: '5,5',
    color: '#293276',
  },

  // Path 2 data flow arrows - ETL and SDS to Data Warehouse (intermittent)
  {
    id: 'arrow-etl-dwh',
    from: 'etl',
    to: 'data_warehouse',
    points: 'M 480 310 L 480 390',
    dashArray: '5,5',
    color: '#00B0F0',
  },
  {
    id: 'arrow-sds-dwh',
    from: 'sds',
    to: 'data_warehouse',
    points: 'M 771 349 L 771 390',
    dashArray: '5,5',
    color: '#00B0F0',
  },

  // Path 3 arrows - EOD Process (Flat Files) path
  {
    id: 'arrow-file-etl',
    from: 'file_left',
    to: 'etl',
    points: 'M 288 248 L 408 278',
    dashArray: '5,5',
    color: '#00B0F0',
  },
]

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get component by ID from both static and animated components
 */
export function getComponentById(id: string): ComponentItem | undefined {
  return (
    STATIC_COMPONENTS.find((c) => c.id === id) ||
    ANIMATED_COMPONENTS.find((c) => c.id === id)
  )
}

/**
 * Get arrow by ID
 */
export function getArrowById(id: string): ArrowItem | undefined {
  return ARROWS.find((a) => a.id === id)
}

/**
 * Get all components (static + animated)
 */
export function getAllComponents(): ComponentItem[] {
  return [...STATIC_COMPONENTS, ...ANIMATED_COMPONENTS]
}

/**
 * Check if component ID exists
 */
export function componentExists(id: string): boolean {
  return getComponentById(id) !== undefined
}

/**
 * Check if arrow ID exists
 */
export function arrowExists(id: string): boolean {
  return getArrowById(id) !== undefined
}
