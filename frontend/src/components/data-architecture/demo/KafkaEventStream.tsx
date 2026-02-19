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
 * Event type badge - High contrast, accessible colors
 * Using Temenos brand colors for consistency
 */
const EventTypeBadge: React.FC<{ type: KafkaEvent['type'] }> = ({ type }) => {
  return (
    <span
      className={`px-2.5 py-1 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 ${
        type === 'business'
          ? 'bg-[#003366] text-white shadow-sm' // Temenos Navy
          : 'bg-[#00A3E0] text-white shadow-sm' // Temenos Cyan
      }`}
    >
      {type === 'business' ? (
        <>
          <Zap className="w-3 h-3" />
          BUSINESS
        </>
      ) : (
        <>
          <Database className="w-3 h-3" />
          DATA
        </>
      )}
    </span>
  )
}

/**
 * Event metadata display - improved contrast
 */
const EventMetadata: React.FC<{ event: KafkaEvent }> = ({ event }) => {
  return (
    <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-mono">
      <span>
        Partition: <span className="text-slate-800 dark:text-slate-200 font-medium">{event.partition}</span>
      </span>
      <span className="text-slate-300 dark:text-slate-600">|</span>
      <span>
        Offset: <span className="text-slate-800 dark:text-slate-200 font-medium">{event.offset}</span>
      </span>
      {event.transactionType && (
        <>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span>
            Type: <span className="text-[#003366] dark:text-[#00A3E0] font-semibold">{event.transactionType}</span>
          </span>
        </>
      )}
    </div>
  )
}

/**
 * Event payload preview with CloudEvents field highlighting
 * Improved contrast and accessibility
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
        className="text-xs text-[#003366] dark:text-[#00A3E0] hover:text-[#0066CC] dark:hover:text-cyan-300 font-mono mb-1 flex items-center gap-1 font-medium"
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
          className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700"
        >
          {/* CloudEvents Fields - Highlighted */}
          {highlightedFields.length > 0 && (
            <div className="mb-2 pb-2 border-b border-slate-300 dark:border-slate-600">
              <div className="text-amber-700 dark:text-amber-400 text-xs font-semibold mb-1">CloudEvents Fields:</div>
              {highlightedFields.map((key) => (
                <div key={key} className="text-xs font-mono ml-2">
                  <span className="text-[#003366] dark:text-[#00A3E0] font-medium">{key}:</span>{' '}
                  <span className="text-slate-700 dark:text-slate-300">{JSON.stringify(payload[key])}</span>
                </div>
              ))}
            </div>
          )}
          {/* Other Fields */}
          {otherFields.length > 0 && (
            <div>
              <div className="text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1">Additional Data:</div>
              <pre className="text-xs text-slate-600 dark:text-slate-400 font-mono overflow-x-auto max-h-48 overflow-y-auto">
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
        <div className="text-xs text-slate-600 dark:text-slate-400 font-mono pl-4">
          {highlightedFields.slice(0, 3).map((key, idx) => (
            <div key={idx} className="truncate">
              <span className="text-[#003366] dark:text-[#00A3E0] font-medium">{key}:</span>{' '}
              <span className="text-slate-700 dark:text-slate-300">{JSON.stringify(payload[key])}</span>
            </div>
          ))}
          {highlightedFields.length > 3 && <div className="text-slate-500 dark:text-slate-500">... +{highlightedFields.length - 3} more fields</div>}
        </div>
      )}
    </div>
  )
}

/**
 * Individual Kafka event entry - improved accessibility and contrast
 */
const KafkaEventEntry: React.FC<{ event: KafkaEvent; index: number; hideCategoryBadge?: boolean }> = ({ event, index, hideCategoryBadge = false }) => {
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

  // Use Temenos brand colors for the border
  const borderColor = event.type === 'business' ? 'border-l-[#003366]' : 'border-l-[#00A3E0]'

  return (
    <EventHighlighter eventId={event.id} eventTimestamp={event.timestamp}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ delay: index * 0.05 }}
        className={`border-l-3 ${borderColor} pl-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-r-lg`}
      >
        {/* Event header */}
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Event type badge */}
            <EventTypeBadge type={event.type} />

            {/* Topic name */}
            <span className="text-sm text-slate-700 dark:text-slate-300 font-mono font-medium">{event.topic}</span>

            {/* Customer ID Badge (if available) */}
            {event.payload?.entityid && (
              <span className="text-xs bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 px-2.5 py-1 rounded-md font-mono border border-violet-300 dark:border-violet-600 font-medium">
                Customer: {event.payload.entityid}
              </span>
            )}

            {/* Event ID */}
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">ID: {event.id}</span>
          </div>

          {/* Timestamp */}
          <span className="text-xs text-slate-600 dark:text-slate-400 font-mono font-medium">{formatTimestamp(event.timestamp)}</span>
        </div>

        {/* Event metadata */}
        <EventMetadata event={event} />

        {/* Business context (if available) */}
        {businessContext && (
          <div className="mt-3">
            <EventBusinessContext context={businessContext} hideCategoryBadge={hideCategoryBadge} />
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
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full shadow-sm">
      {/* Header - Using Temenos brand colors */}
      <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-[#003366] dark:text-[#00A3E0]" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Kafka Event Stream</h3>
            {events.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                  {events.length} {events.length === 1 ? 'event' : 'events'}
                </span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="text-xs text-[#003366] dark:text-[#00A3E0] font-mono font-medium">
                  {businessEvents} business
                </span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="text-xs text-[#00A3E0] dark:text-cyan-400 font-mono font-medium">
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
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                groupingEnabled
                  ? 'bg-[#003366] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {groupingEnabled ? 'Grouped' : 'List'}
            </button>

            {/* Pause/Resume button */}
            <button
              onClick={handlePauseToggle}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 transition-all"
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
                flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border
                ${
                  events.length === 0
                    ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-600'
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
        className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50 dark:bg-slate-900/50 scrollbar-thin scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-600 scrollbar-track-slate-200 dark:scrollbar-track-slate-800"
      >
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
            <Zap className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No events emitted yet</p>
            <p className="text-xs mt-1 text-slate-500 dark:text-slate-500">Execute a transaction to see Kafka events here</p>
          </div>
        ) : groupingEnabled && eventGroups.length > 0 ? (
          // Grouped view
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {eventGroups.map((group: any) => (
                <EventTransactionGroup
                  key={group.id}
                  group={group}
                  renderEvent={(event: any, index: number) => <KafkaEventEntry key={event.id} event={event} index={index} hideCategoryBadge />}
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
            className="flex items-center gap-2 justify-center text-amber-700 dark:text-amber-400 text-sm py-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700"
          >
            <Pause className="w-4 h-4" />
            <span className="font-medium">Stream paused</span>
          </motion.div>
        )}
      </div>

      {/* Footer with streaming indicator */}
      <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!localPaused && events.length > 0 && (
            <>
              <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Live streaming</span>
            </>
          )}
        </div>

        {/* Stats */}
        {events.length > 0 && (
          <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
            <span>
              Latest:{' '}
              <span className="text-slate-800 dark:text-slate-200 font-mono font-medium">
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
