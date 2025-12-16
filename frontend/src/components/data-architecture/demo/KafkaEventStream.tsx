// KafkaEventStream - Live Kafka event stream viewer
import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Pause, Play, Zap, Database, ArrowRight } from 'lucide-react'
import type { KafkaEventStreamProps, KafkaEvent } from './types'
import { UI_CONFIG } from '../config/simulation.config'

/**
 * Event type badge
 */
const EventTypeBadge: React.FC<{ type: KafkaEvent['type'] }> = ({ type }) => {
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-bold ${
        type === 'business'
          ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
          : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
      }`}
    >
      {type === 'business' ? (
        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3" />
          BUSINESS
        </span>
      ) : (
        <span className="flex items-center gap-1">
          <Database className="w-3 h-3" />
          DATA
        </span>
      )}
    </span>
  )
}

/**
 * Event metadata display
 */
const EventMetadata: React.FC<{ event: KafkaEvent }> = ({ event }) => {
  return (
    <div className="flex items-center gap-3 text-xs text-gray-400 font-mono">
      <span>
        Partition: <span className="text-green-400">{event.partition}</span>
      </span>
      <span className="text-gray-600">|</span>
      <span>
        Offset: <span className="text-green-400">{event.offset}</span>
      </span>
      {event.transactionType && (
        <>
          <span className="text-gray-600">|</span>
          <span>
            Type: <span className="text-teal-400">{event.transactionType}</span>
          </span>
        </>
      )}
    </div>
  )
}

/**
 * Event payload preview
 */
const PayloadPreview: React.FC<{ payload: any }> = ({ payload }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  // Get first few keys for preview
  const previewKeys = Object.keys(payload).slice(0, 3)
  const hasMore = Object.keys(payload).length > 3

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-xs text-green-400 hover:text-green-300 font-mono mb-1 flex items-center gap-1"
      >
        <ArrowRight
          className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
        />
        Payload
      </button>

      {isExpanded ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-900 rounded p-2 border border-gray-700"
        >
          <pre className="text-xs text-green-400 font-mono overflow-x-auto max-h-32 overflow-y-auto">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </motion.div>
      ) : (
        <div className="text-xs text-gray-500 font-mono pl-4">
          {previewKeys.map((key, idx) => (
            <div key={idx}>
              {key}: {JSON.stringify(payload[key])}
            </div>
          ))}
          {hasMore && <div className="text-gray-600">...</div>}
        </div>
      )}
    </div>
  )
}

/**
 * Individual Kafka event entry
 */
const KafkaEventEntry: React.FC<{ event: KafkaEvent; index: number }> = ({ event, index }) => {
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    } as Intl.DateTimeFormatOptions)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      className="border-l-2 border-green-500 pl-4 py-3 hover:bg-green-950/30 transition-colors"
    >
      {/* Event header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3 flex-1">
          {/* Event type badge */}
          <EventTypeBadge type={event.type} />

          {/* Topic name */}
          <span className="text-sm text-green-400 font-mono">{event.topic}</span>

          {/* Event ID */}
          <span className="text-xs text-gray-500 font-mono">ID: {event.id}</span>
        </div>

        {/* Timestamp */}
        <span className="text-xs text-gray-500 font-mono">{formatTimestamp(event.timestamp)}</span>
      </div>

      {/* Event metadata */}
      <EventMetadata event={event} />

      {/* Payload preview */}
      <PayloadPreview payload={event.payload} />
    </motion.div>
  )
}

/**
 * KafkaEventStream Component - Main Kafka event stream viewer
 */
export const KafkaEventStream: React.FC<KafkaEventStreamProps> = ({
  events,
  onClear,
  onPause,
  isPaused = false
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [localPaused, setLocalPaused] = useState(isPaused)

  // Auto-scroll to bottom when new events arrive (unless paused)
  useEffect(() => {
    if (UI_CONFIG.KAFKA_EVENT_AUTO_SCROLL && !localPaused && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
    }
  }, [events, localPaused])

  const handlePauseToggle = () => {
    setLocalPaused(!localPaused)
    onPause?.()
  }

  // Count events by type
  const businessEvents = events.filter((e) => e.type === 'business').length
  const dataEvents = events.filter((e) => e.type === 'data').length

  return (
    <div className="bg-gradient-to-br from-gray-900 via-green-950/20 to-gray-900 rounded-xl border border-green-800/30 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="bg-green-950/40 px-4 py-3 border-b border-green-800/30 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-green-500" />
            <h3 className="text-sm font-semibold text-green-400">Kafka Event Stream</h3>
            {events.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-mono">
                  {events.length} {events.length === 1 ? 'event' : 'events'}
                </span>
                <span className="text-gray-600">|</span>
                <span className="text-xs text-teal-400 font-mono">
                  {businessEvents} business
                </span>
                <span className="text-gray-600">|</span>
                <span className="text-xs text-purple-400 font-mono">
                  {dataEvents} data
                </span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Pause/Resume button */}
            <button
              onClick={handlePauseToggle}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-green-950/60 transition-colors"
            >
              {localPaused ? (
                <>
                  <Play className="w-3.5 h-3.5" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  Pause
                </>
              )}
            </button>

            {/* Clear button */}
            <button
              onClick={onClear}
              disabled={events.length === 0}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                ${
                  events.length === 0
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-300 hover:text-white hover:bg-green-950/60'
                }
              `}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Events container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-green-800 scrollbar-track-gray-900"
      >
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Zap className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">No events emitted yet</p>
            <p className="text-xs mt-1">Execute a transaction to see Kafka events here</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {events.map((event, index) => (
              <KafkaEventEntry key={event.id} event={event} index={index} />
            ))}
          </AnimatePresence>
        )}

        {/* Paused indicator */}
        {localPaused && events.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 justify-center text-yellow-400 text-sm py-2 bg-yellow-950/20 rounded border border-yellow-800/30"
          >
            <Pause className="w-4 h-4" />
            <span>Stream paused</span>
          </motion.div>
        )}
      </div>

      {/* Footer with streaming indicator */}
      <div className="bg-green-950/40 px-4 py-2 border-t border-green-800/30 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-2">
          {!localPaused && events.length > 0 && (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-400">Live streaming</span>
            </>
          )}
        </div>

        {/* Stats */}
        {events.length > 0 && (
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>
              Latest:{' '}
              <span className="text-green-400 font-mono">
                {new Date(events[events.length - 1].timestamp).toLocaleTimeString()}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default KafkaEventStream
