// Event Transaction Group Component - Groups and displays events by transaction
import React, { useState, forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, Clock, Activity } from 'lucide-react'
import type { EventGroup, KafkaEvent } from './types'
import { calculateTransactionMetrics, getGroupLabel } from '../services/eventAggregator'
import { THEME_CONFIG } from '../config/simulation.config'

interface EventTransactionGroupProps {
  group: EventGroup
  renderEvent: (event: KafkaEvent, index: number) => React.ReactNode
}

/**
 * Transaction type icon and color
 */
const TransactionBadge: React.FC<{ transactionType?: string }> = ({ transactionType }) => {
  const getConfig = () => {
    switch (transactionType) {
      case 'CREATE_CUSTOMER':
        return { label: 'Customer', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: '👤' }
      case 'OPEN_ACCOUNT':
        return { label: 'Account', color: 'bg-green-500/20 text-green-300 border-green-500/30', icon: '💳' }
      case 'SEND_PAYMENT':
        return { label: 'Payment', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', icon: '💸' }
      default:
        return { label: 'Transaction', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30', icon: '📋' }
    }
  }

  const { label, color, icon } = getConfig()

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border ${color}`}>
      <span className="text-sm">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </div>
  )
}

/**
 * Metrics display component
 */
const MetricsDisplay: React.FC<{ group: EventGroup }> = ({ group }) => {
  const metrics = calculateTransactionMetrics(group)

  return (
    <div className="flex items-center gap-4 text-xs">
      <div className="flex items-center gap-1.5">
        <Activity size={12} className="text-gray-400" />
        <span className="text-gray-400">Events:</span>
        <span className="text-gray-200 font-medium">{metrics.totalEvents}</span>
        <span className="text-gray-500">
          ({metrics.businessEvents} business, {metrics.dataEvents} data)
        </span>
      </div>

      {metrics.duration > 0 && (
        <div className="flex items-center gap-1.5">
          <Clock size={12} className="text-gray-400" />
          <span className="text-gray-400">Duration:</span>
          <span className="text-gray-200 font-medium">{formatDuration(metrics.duration)}</span>
        </div>
      )}
    </div>
  )
}

/**
 * Format duration in ms to human readable format
 */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}min`
}

/**
 * Format timestamp to readable time
 */
function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

/**
 * Main EventTransactionGroup component
 * Uses forwardRef to support AnimatePresence exit animations
 */
export const EventTransactionGroup = forwardRef<HTMLDivElement, EventTransactionGroupProps>(
  ({ group, renderEvent }, ref) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const label = getGroupLabel(group)
  const startTime = formatTime(group.startTime)

  return (
    <div ref={ref} className="border border-gray-700/50 rounded-lg bg-gray-800/30 overflow-hidden">
      {/* Group header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-700/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          {/* Expand/collapse icon */}
          <div className="text-gray-400">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>

          {/* Transaction badge */}
          <TransactionBadge transactionType={group.transactionType} />

          {/* Group info */}
          <div className="flex flex-col items-start gap-1">
            <span className="text-sm font-medium text-gray-200">{label}</span>
            <span className="text-xs text-gray-400">{startTime}</span>
          </div>
        </div>

        {/* Metrics */}
        <div className="flex items-center gap-4">
          <MetricsDisplay group={group} />
        </div>
      </button>

      {/* Event list (collapsible) */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-700/30">
              {/* Timeline connector */}
              <div className="relative px-4 py-2">
                {/* Vertical line */}
                <div
                  className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-600 via-gray-700 to-gray-600"
                  style={{
                    background: `linear-gradient(to bottom, ${THEME_CONFIG.BUSINESS_EVENT_COLOR}40, ${THEME_CONFIG.DATA_EVENT_COLOR}40)`
                  }}
                />

                {/* Events */}
                <div className="space-y-3 relative">
                  {group.events.map((event, index) => (
                    <div key={event.id} className="flex items-start gap-3 relative">
                      {/* Timeline node */}
                      <div
                        className="w-2 h-2 rounded-full border-2 bg-gray-900 z-10 mt-2 flex-shrink-0"
                        style={{
                          borderColor:
                            event.type === 'business'
                              ? THEME_CONFIG.BUSINESS_EVENT_COLOR
                              : THEME_CONFIG.DATA_EVENT_COLOR
                        }}
                      />

                      {/* Event content */}
                      <div className="flex-1 -mt-0.5">
                        {renderEvent(event, index)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
    </div>
  )
})

EventTransactionGroup.displayName = 'EventTransactionGroup'

export default EventTransactionGroup
