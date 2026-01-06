// KafkaEventStream - Live Kafka event stream viewer
import React, { useEffect, useRef, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Pause, Play, Zap, Database, ArrowRight, Layers } from 'lucide-react'
import type { KafkaEventStreamProps, KafkaEvent } from './types'
import { UI_CONFIG, EVENT_DISPLAY_CONFIG } from '../config/simulation.config'
import { EventBusinessContext } from './EventBusinessContext'
import { EventTransactionGroup } from './EventTransactionGroup'
import { EventHighlighter } from './EventHighlighter'
import { extractBusinessContext, hasBusinessContext } from '../services/businessContextExtractor'
import { groupEventsByCustomer } from '../services/eventAggregator'

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
    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
      <span>
        Partition: <span className="text-green-700 dark:text-green-400">{event.partition}</span>
      </span>
      <span className="text-slate-400 dark:text-slate-600">|</span>
      <span>
        Offset: <span className="text-green-700 dark:text-green-400">{event.offset}</span>
      </span>
      {event.transactionType && (
        <>
          <span className="text-slate-400 dark:text-slate-600">|</span>
          <span>
            Type: <span className="text-teal-600 dark:text-teal-400">{event.transactionType}</span>
          </span>
        </>
      )}
    </div>
  )
}

/**
 * Event payload preview with CloudEvents field highlighting
 */
const PayloadPreview: React.FC<{ payload: any; isFirst?: boolean }> = ({ payload, isFirst = false }) => {
  const [isExpanded, setIsExpanded] = useState(isFirst)

  // CloudEvents standard fields to highlight
  const cloudEventFields = ['specversion', 'type', 'entityid', 'entityname', 'businesskey', 'time', 'source', 'id', 'correlationid']
  const highlightedFields = Object.keys(payload).filter(key => cloudEventFields.includes(key.toLowerCase()))
  const otherFields = Object.keys(payload).filter(key => !cloudEventFields.includes(key.toLowerCase()))

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-xs text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-mono mb-1 flex items-center gap-1"
      >
        <ArrowRight
          className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
        />
        CloudEvents Payload {highlightedFields.length > 0 && `(${highlightedFields.length} key fields)`}
      </button>

      {isExpanded ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-slate-50 dark:bg-slate-900 rounded p-3 border border-slate-200 dark:border-slate-700"
        >
          {/* CloudEvents Fields - Highlighted */}
          {highlightedFields.length > 0 && (
            <div className="mb-2 pb-2 border-b border-slate-300 dark:border-slate-700">
              <div className="text-yellow-700 dark:text-yellow-400 text-xs font-semibold mb-1">CloudEvents Fields:</div>
              {highlightedFields.map((key) => (
                <div key={key} className="text-xs font-mono ml-2">
                  <span className="text-cyan-700 dark:text-cyan-400">{key}:</span>{' '}
                  <span className="text-green-700 dark:text-green-400">{JSON.stringify(payload[key])}</span>
                </div>
              ))}
            </div>
          )}
          {/* Other Fields */}
          {otherFields.length > 0 && (
            <div>
              <div className="text-slate-600 dark:text-slate-400 text-xs font-semibold mb-1">Additional Data:</div>
              <pre className="text-xs text-green-700 dark:text-green-400 font-mono overflow-x-auto max-h-48 overflow-y-auto">
                {JSON.stringify(
                  otherFields.reduce((acc, key) => ({ ...acc, [key]: payload[key] }), {}),
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </motion.div>
      ) : (
        // Show compact preview with key fields only
        <div className="text-xs text-slate-500 dark:text-slate-500 font-mono pl-4">
          {highlightedFields.slice(0, 3).map((key, idx) => (
            <div key={idx} className="truncate">
              <span className="text-cyan-700 dark:text-cyan-400">{key}:</span> {JSON.stringify(payload[key])}
            </div>
          ))}
          {highlightedFields.length > 3 && <div className="text-slate-400 dark:text-slate-600">... +{highlightedFields.length - 3} more fields</div>}
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

  // Extract business context if available
  const showBusinessContext = EVENT_DISPLAY_CONFIG.SHOW_BUSINESS_CONTEXT && hasBusinessContext(event)
  const businessContext = showBusinessContext ? extractBusinessContext(event) : null

  return (
    <EventHighlighter eventId={event.id} eventTimestamp={event.timestamp}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ delay: index * 0.05 }}
        className="border-l-2 border-green-500 pl-4 py-3 hover:bg-green-50/30 dark:hover:bg-green-950/30 transition-colors"
      >
        {/* Event header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3 flex-1">
            {/* Event type badge */}
            <EventTypeBadge type={event.type} />

            {/* Topic name */}
            <span className="text-sm text-green-700 dark:text-green-400 font-mono">{event.topic}</span>

            {/* Customer ID Badge (if available) */}
            {event.payload?.entityid && (
              <span className="text-xs bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded font-mono border border-blue-300 dark:border-blue-500/30">
                Customer: {event.payload.entityid}
              </span>
            )}

            {/* Event ID */}
            <span className="text-xs text-slate-500 dark:text-slate-500 font-mono">ID: {event.id}</span>
          </div>

          {/* Timestamp */}
          <span className="text-xs text-slate-500 dark:text-slate-500 font-mono">{formatTimestamp(event.timestamp)}</span>
        </div>

        {/* Event metadata */}
        <EventMetadata event={event} />

        {/* Business context (if available) */}
        {businessContext && (
          <div className="mt-3">
            <EventBusinessContext context={businessContext} />
          </div>
        )}

        {/* Payload preview */}
        <PayloadPreview payload={event.payload} isFirst={index === 0} />
      </motion.div>
    </EventHighlighter>
  )
}

/**
 * KafkaEventStream Component - Main Kafka event stream viewer
 */
// localStorage key for persisting grouping preference
const GROUPING_STORAGE_KEY = 'kafka-event-grouping'

export const KafkaEventStream: React.FC<KafkaEventStreamProps> = ({
  events,
  onClear,
  onPause,
  isPaused = false
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [localPaused, setLocalPaused] = useState(isPaused)
  const [groupingEnabled, setGroupingEnabled] = useState(() => {
    // Initialize from localStorage, fallback to config default
    const stored = localStorage.getItem(GROUPING_STORAGE_KEY)
    return stored !== null ? stored === 'true' : EVENT_DISPLAY_CONFIG.ENABLE_EVENT_GROUPING
  })

  // Group events if grouping is enabled
  const eventGroups = useMemo(() => {
    if (groupingEnabled && events.length > 0) {
      return groupEventsByCustomer(events)
    }
    return []
  }, [events, groupingEnabled])

  // Persist grouping preference to localStorage
  useEffect(() => {
    localStorage.setItem(GROUPING_STORAGE_KEY, String(groupingEnabled))
  }, [groupingEnabled])

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
    <div className="bg-gradient-to-br from-white via-green-50 to-white dark:from-slate-900 dark:via-green-950/20 dark:to-slate-900 rounded-xl border border-green-300/30 dark:border-green-800/30 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="bg-green-100/40 dark:bg-green-950/40 px-4 py-3 border-b border-green-300/30 dark:border-green-800/30 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-green-600 dark:text-green-500" />
            <h3 className="text-sm font-semibold text-green-700 dark:text-green-400">Kafka Event Stream</h3>
            {events.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {events.length} {events.length === 1 ? 'event' : 'events'}
                </span>
                <span className="text-slate-400 dark:text-slate-600">|</span>
                <span className="text-xs text-teal-600 dark:text-teal-400 font-mono">
                  {businessEvents} business
                </span>
                <span className="text-slate-400 dark:text-slate-600">|</span>
                <span className="text-xs text-purple-600 dark:text-purple-400 font-mono">
                  {dataEvents} data
                </span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Grouping toggle button */}
            <button
              onClick={() => setGroupingEnabled(!groupingEnabled)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                groupingEnabled
                  ? 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-green-100/60 dark:hover:bg-green-950/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {groupingEnabled ? 'Grouped' : 'List'}
            </button>

            {/* Pause/Resume button */}
            <button
              onClick={handlePauseToggle}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-green-100/60 dark:hover:bg-green-950/60 transition-colors"
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
                    ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-green-100/60 dark:hover:bg-green-950/60'
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
        className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-green-500 dark:scrollbar-thumb-green-800 scrollbar-track-slate-100 dark:scrollbar-track-slate-900"
      >
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-500">
            <Zap className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">No events emitted yet</p>
            <p className="text-xs mt-1">Execute a transaction to see Kafka events here</p>
          </div>
        ) : groupingEnabled && eventGroups.length > 0 ? (
          // Grouped view
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {eventGroups.map((group) => (
                <EventTransactionGroup
                  key={group.id}
                  group={group}
                  renderEvent={(event, index) => <KafkaEventEntry key={event.id} event={event} index={index} />}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          // List view
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
            className="flex items-center gap-2 justify-center text-yellow-700 dark:text-yellow-400 text-sm py-2 bg-yellow-100/20 dark:bg-yellow-950/20 rounded border border-yellow-300/30 dark:border-yellow-800/30"
          >
            <Pause className="w-4 h-4" />
            <span>Stream paused</span>
          </motion.div>
        )}
      </div>

      {/* Footer with streaming indicator */}
      <div className="bg-green-100/40 dark:bg-green-950/40 px-4 py-2 border-t border-green-300/30 dark:border-green-800/30 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-2">
          {!localPaused && events.length > 0 && (
            <>
              <div className="w-2 h-2 bg-green-600 dark:bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-700 dark:text-green-400">Live streaming</span>
            </>
          )}
        </div>

        {/* Stats */}
        {events.length > 0 && (
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Latest:{' '}
              <span className="text-green-700 dark:text-green-400 font-mono">
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
