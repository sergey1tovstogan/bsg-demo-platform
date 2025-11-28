import { useState, useEffect, useRef } from 'react'
import type { AnimationPath, DataFlowDot } from '../types'
import { TIMING, SEGMENT_DURATIONS } from '../config/transitions.config'

/**
 * Props for the useDataFlow hook
 */
interface UseDataFlowProps {
  /** Currently selected animation path (path-a, path-b, or path-c) */
  selectedPath: AnimationPath
  /** Whether to start spawning data flow dots */
  shouldStartSpawning: boolean
  /** Whether to spawn dots continuously (for looping animations) */
  shouldSpawnContinuously: boolean
}

/**
 * Return value from the useDataFlow hook
 */
interface UseDataFlowReturn {
  /** Array of currently active data flow dots being animated */
  activeDataFlows: DataFlowDot[]
  /** Setter for manually updating the active data flows */
  setActiveDataFlows: React.Dispatch<React.SetStateAction<DataFlowDot[]>>
  /** Setter for controlling spawning start state */
  setShouldStartSpawning: React.Dispatch<React.SetStateAction<boolean>>
}

/**
 * Custom hook for managing data flow spawning and transitions.
 *
 * Handles the lifecycle of animated dots (business and data events) as they move
 * through the data architecture diagram. Manages spawning, transitions between
 * segments, and cleanup of completed animations.
 *
 * @param props - Configuration for data flow behavior
 * @returns State and controls for managing active data flows
 *
 * @example
 * ```tsx
 * const { activeDataFlows, setActiveDataFlows, setShouldStartSpawning } = useDataFlow({
 *   selectedPath: 'path-c',
 *   shouldStartSpawning: true,
 *   shouldSpawnContinuously: false,
 * })
 * ```
 *
 * **Spawning Logic:**
 * - Business events spawn first on 'arrow-events-pubsub'
 * - Data events spawn 500ms after business events
 * - Recurring spawning continues at BUSINESS_EVENT_INTERVAL (5000ms)
 * - Only spawns for path-a, path-c, or when shouldSpawnContinuously is true
 *
 * **Transition Logic:**
 * - Dots move between segments based on SEGMENT_DURATIONS
 * - Business events: events → pubsub → microservices (end)
 * - Data events (path-a/path-b): events → pubsub → fork → split into left/right → ETL/DataHub (end)
 * - Data events (path-c): events → pubsub (end)
 */
export function useDataFlow({
  selectedPath,
  shouldStartSpawning,
  shouldSpawnContinuously,
}: UseDataFlowProps): UseDataFlowReturn {
  const [activeDataFlows, setActiveDataFlows] = useState<DataFlowDot[]>([])
  const [shouldStart, setShouldStartInternal] = useState(shouldStartSpawning)
  const spawningIntervalRef = useRef<number | null>(null)

  // Sync external shouldStartSpawning with internal state
  useEffect(() => {
    setShouldStartInternal(shouldStartSpawning)
  }, [shouldStartSpawning])

  // Spawn Business Event dots for event-driven paths
  useEffect(() => {
    console.log('[useDataFlow] Spawning effect triggered - path:', selectedPath, 'shouldStart:', shouldStart, 'shouldContinue:', shouldSpawnContinuously)

    // Determine if spawning should occur
    const shouldSpawn = selectedPath === 'path-c' || selectedPath === 'path-a' || shouldSpawnContinuously

    if (!shouldSpawn) {
      console.log('[useDataFlow] Spawning not needed, cleaning up')
      if (spawningIntervalRef.current) {
        clearInterval(spawningIntervalRef.current)
        spawningIntervalRef.current = null
      }
      return
    }

    if (!shouldStart) {
      console.log('[useDataFlow] Waiting for shouldStart flag')
      return
    }

    console.log(`[useDataFlow] Starting spawning with ${TIMING.SPAWNING_START_DELAY}ms delay`)

    const startSpawningTimeout = setTimeout(() => {
      // Spawn first Business Event
      const now = Date.now()
      setActiveDataFlows([{
        id: `business-${now}`,
        type: 'business',
        pathId: 'arrow-events-pubsub',
        startTime: now,
        segment: 'events-pubsub'
      }])

      // Spawn first Data Event after delay
      setTimeout(() => {
        const now = Date.now()
        setActiveDataFlows((prev) => [
          ...prev,
          {
            id: `data-${now}`,
            type: 'data',
            pathId: 'arrow-events-pubsub',
            startTime: now,
            segment: 'events-pubsub'
          }
        ])
      }, TIMING.DATA_EVENT_DELAY)

      // Set up recurring spawning
      spawningIntervalRef.current = setInterval(() => {
        const businessNow = Date.now()
        setActiveDataFlows((prev) => [
          ...prev,
          {
            id: `business-${businessNow}`,
            type: 'business',
            pathId: 'arrow-events-pubsub',
            startTime: businessNow,
            segment: 'events-pubsub'
          }
        ])

        setTimeout(() => {
          const dataNow = Date.now()
          setActiveDataFlows((prev) => [
            ...prev,
            {
              id: `data-${dataNow}`,
              type: 'data',
              pathId: 'arrow-events-pubsub',
              startTime: dataNow,
              segment: 'events-pubsub'
            }
          ])
        }, TIMING.DATA_EVENT_DELAY)
      }, TIMING.BUSINESS_EVENT_INTERVAL)
    }, TIMING.SPAWNING_START_DELAY)

    return () => {
      clearTimeout(startSpawningTimeout)
      if (spawningIntervalRef.current) {
        clearInterval(spawningIntervalRef.current)
        spawningIntervalRef.current = null
      }
    }
  }, [selectedPath, shouldStart, shouldSpawnContinuously])

  // Handle dot transitions between segments
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setActiveDataFlows((prev) => {
        const updated: DataFlowDot[] = []

        prev.forEach((dot) => {
          const age = now - dot.startTime

          if (dot.segment === 'events-pubsub') {
            const duration = SEGMENT_DURATIONS['events-pubsub']
            if (age < duration) {
              updated.push(dot)
            } else if (age >= duration && age < duration + TIMING.TRANSITION_BUFFER) {
              if (dot.type === 'business') {
                // Business events transition to microservices
                updated.push({
                  ...dot,
                  segment: 'pubsub-microservices',
                  pathId: 'arrow-pubsub-microservices',
                  startTime: now
                })
              } else if (dot.type === 'data' && (selectedPath === 'path-a' || (selectedPath === 'path-b' && shouldSpawnContinuously))) {
                // Data events in Path 2/3 transition to fork
                updated.push({
                  ...dot,
                  segment: 'pubsub-fork-main',
                  pathId: 'arrow-pubsub-fork-main',
                  startTime: now
                })
              }
              // Data events in Path 1 end at Pub/Sub
            }
          } else if (dot.segment === 'pubsub-microservices') {
            const duration = SEGMENT_DURATIONS['pubsub-microservices']
            if (age < duration) {
              updated.push(dot)
            }
          } else if (dot.segment === 'pubsub-fork-main') {
            const duration = SEGMENT_DURATIONS['pubsub-fork-main']
            if (age < duration) {
              updated.push(dot)
            } else if (age >= duration && age < duration + TIMING.TRANSITION_BUFFER) {
              // Split into two dots at fork center
              updated.push({
                ...dot,
                id: `${dot.id}-left`,
                segment: 'fork-horizontal-left',
                pathId: 'arrow-fork-horizontal-left',
                startTime: now
              })
              updated.push({
                ...dot,
                id: `${dot.id}-right`,
                segment: 'fork-horizontal-right',
                pathId: 'arrow-fork-horizontal-right',
                startTime: now
              })
            }
          } else if (dot.segment === 'fork-horizontal-left') {
            const duration = SEGMENT_DURATIONS['fork-horizontal-left']
            if (age < duration) {
              updated.push(dot)
            } else if (age >= duration && age < duration + TIMING.TRANSITION_BUFFER) {
              updated.push({
                ...dot,
                segment: 'fork-etl',
                pathId: 'arrow-fork-etl',
                startTime: now
              })
            }
          } else if (dot.segment === 'fork-horizontal-right') {
            const duration = SEGMENT_DURATIONS['fork-horizontal-right']
            if (age < duration) {
              updated.push(dot)
            } else if (age >= duration && age < duration + TIMING.TRANSITION_BUFFER) {
              updated.push({
                ...dot,
                segment: 'fork-datahub',
                pathId: 'arrow-fork-datahub',
                startTime: now
              })
            }
          } else if (dot.segment === 'fork-etl' || dot.segment === 'fork-datahub') {
            const duration = SEGMENT_DURATIONS[dot.segment]
            if (age < duration) {
              updated.push(dot)
            }
          }
        })

        return updated
      })
    }, TIMING.ANIMATION_CHECK_INTERVAL)

    return () => clearInterval(interval)
  }, [selectedPath, shouldSpawnContinuously])

  return {
    activeDataFlows,
    setActiveDataFlows,
    setShouldStartSpawning: setShouldStartInternal,
  }
}
