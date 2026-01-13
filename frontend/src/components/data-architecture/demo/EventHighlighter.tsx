// Event Highlighter Component - Highlights new events with animation
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { EVENT_DISPLAY_CONFIG } from '../config/simulation.config'

interface EventHighlighterProps {
  eventId: string
  eventTimestamp: number
  children: React.ReactNode
  enabled?: boolean
}

/**
 * Wrapper component that highlights events when they first appear
 */
export const EventHighlighter: React.FC<EventHighlighterProps> = ({
  eventId,
  eventTimestamp,
  children,
  enabled = EVENT_DISPLAY_CONFIG.HIGHLIGHT_NEW_EVENTS
}) => {
  const [isNew, setIsNew] = useState(false)
  const [hasBeenSeen, setHasBeenSeen] = useState(false)

  useEffect(() => {
    if (!enabled) return

    // Check if event is "new" (within highlight duration)
    const now = Date.now()
    const eventAge = now - eventTimestamp
    const isEventNew = eventAge <= EVENT_DISPLAY_CONFIG.HIGHLIGHT_DURATION_MS

    if (isEventNew && !hasBeenSeen) {
      setIsNew(true)
      setHasBeenSeen(true)

      // Clear highlight after duration
      const timer = setTimeout(() => {
        setIsNew(false)
      }, EVENT_DISPLAY_CONFIG.HIGHLIGHT_DURATION_MS)

      return () => clearTimeout(timer)
    }
  }, [eventId, eventTimestamp, enabled, hasBeenSeen])

  if (!enabled || !isNew) {
    return <>{children}</>
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: 'easeOut'
      }}
      className="relative"
    >
      {/* Pulse background effect - Temenos Cyan accent */}
      <motion.div
        className="absolute inset-0 rounded-lg pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0, 0.3, 0.15, 0],
          scale: [0.98, 1, 1, 1]
        }}
        transition={{
          duration: EVENT_DISPLAY_CONFIG.HIGHLIGHT_DURATION_MS / 1000,
          ease: 'easeInOut',
          times: [0, 0.1, 0.5, 1]
        }}
        style={{
          background: 'radial-gradient(circle, rgba(0, 163, 224, 0.3) 0%, rgba(0, 163, 224, 0) 70%)', // Temenos Cyan
          filter: 'blur(8px)'
        }}
      />

      {/* Glow border effect - Temenos Cyan */}
      <motion.div
        className="absolute inset-0 rounded-lg pointer-events-none border-2"
        initial={{ opacity: 0, borderColor: 'rgba(0, 163, 224, 0)' }}
        animate={{
          opacity: [1, 0.6, 0],
          borderColor: [
            'rgba(0, 163, 224, 0.5)', // Temenos Cyan
            'rgba(0, 163, 224, 0.3)',
            'rgba(0, 163, 224, 0)'
          ]
        }}
        transition={{
          duration: EVENT_DISPLAY_CONFIG.HIGHLIGHT_DURATION_MS / 1000,
          ease: 'easeInOut'
        }}
      />

      {/* Content */}
      {children}
    </motion.div>
  )
}

/**
 * Simple version without animation for performance-sensitive contexts
 */
export const EventHighlighterSimple: React.FC<EventHighlighterProps> = ({
  eventId,
  eventTimestamp,
  children,
  enabled = EVENT_DISPLAY_CONFIG.HIGHLIGHT_NEW_EVENTS
}) => {
  const [isNew, setIsNew] = useState(false)

  useEffect(() => {
    if (!enabled) return

    const now = Date.now()
    const eventAge = now - eventTimestamp
    const isEventNew = eventAge <= EVENT_DISPLAY_CONFIG.HIGHLIGHT_DURATION_MS

    if (isEventNew) {
      setIsNew(true)
      const timer = setTimeout(() => {
        setIsNew(false)
      }, EVENT_DISPLAY_CONFIG.HIGHLIGHT_DURATION_MS)

      return () => clearTimeout(timer)
    }
  }, [eventId, eventTimestamp, enabled])

  if (!enabled || !isNew) {
    return <>{children}</>
  }

  return (
    <div className="relative animate-pulse">
      <div className="absolute inset-0 bg-[#00A3E0]/10 rounded-lg pointer-events-none" /> {/* Temenos Cyan */}
      {children}
    </div>
  )
}

export default EventHighlighter
