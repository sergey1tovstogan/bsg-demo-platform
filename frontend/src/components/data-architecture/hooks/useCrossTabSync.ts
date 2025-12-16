// useCrossTabSync - Hook for cross-tab/component communication via custom events
import { useEffect, useCallback } from 'react'
import type { AnimationTrigger } from '../demo/types'
import { UI_CONFIG, DEBUG_CONFIG } from '../config/simulation.config'

/**
 * Custom event type for animation triggers
 */
interface AnimationTriggerEvent extends CustomEvent {
  detail: AnimationTrigger
}

/**
 * useCrossTabSync Hook
 * Enables communication between Demo tab and Content tab for animation synchronization
 */
export const useCrossTabSync = (config?: {
  onTrigger?: (trigger: AnimationTrigger) => void
  enabled?: boolean
}) => {
  const { onTrigger, enabled = true } = config || {}

  /**
   * Send animation trigger to listening components
   */
  const sendTrigger = useCallback(
    (trigger: AnimationTrigger) => {
      if (!enabled || !UI_CONFIG.ENABLE_CROSS_TAB_SYNC) return

      // Create and dispatch custom event
      const event = new CustomEvent(UI_CONFIG.CROSS_TAB_EVENT_NAME, {
        detail: trigger,
        bubbles: true,
        composed: true
      })

      window.dispatchEvent(event)

      if (DEBUG_CONFIG.ENABLE_CONSOLE_LOGS) {
        console.log('[CrossTabSync] Trigger sent:', trigger)
      }
    },
    [enabled]
  )

  /**
   * Send multiple triggers in batch
   */
  const sendTriggers = useCallback(
    (triggers: AnimationTrigger[]) => {
      triggers.forEach((trigger) => sendTrigger(trigger))
    },
    [sendTrigger]
  )

  /**
   * Listen for animation triggers
   */
  useEffect(() => {
    if (!enabled || !UI_CONFIG.ENABLE_CROSS_TAB_SYNC || !onTrigger) return

    const handleTrigger = (event: Event) => {
      const animationEvent = event as AnimationTriggerEvent
      const trigger = animationEvent.detail

      if (trigger) {
        if (DEBUG_CONFIG.ENABLE_CONSOLE_LOGS) {
          console.log('[CrossTabSync] Trigger received:', trigger)
        }
        onTrigger(trigger)
      }
    }

    // Add event listener
    window.addEventListener(UI_CONFIG.CROSS_TAB_EVENT_NAME, handleTrigger)

    if (DEBUG_CONFIG.ENABLE_CONSOLE_LOGS) {
      console.log('[CrossTabSync] Listener registered')
    }

    // Cleanup
    return () => {
      window.removeEventListener(UI_CONFIG.CROSS_TAB_EVENT_NAME, handleTrigger)
      if (DEBUG_CONFIG.ENABLE_CONSOLE_LOGS) {
        console.log('[CrossTabSync] Listener unregistered')
      }
    }
  }, [enabled, onTrigger])

  return {
    sendTrigger,
    sendTriggers,
    isEnabled: enabled && UI_CONFIG.ENABLE_CROSS_TAB_SYNC
  }
}

export default useCrossTabSync
