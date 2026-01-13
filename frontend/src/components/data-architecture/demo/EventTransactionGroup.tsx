// Event Transaction Group Component - Groups and displays events by transaction
import React, { useState, forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, Clock, Activity } from 'lucide-react'
import type { EventGroup, KafkaEvent } from './types'
import { calculateTransactionMetrics, getGroupLabel } from '../services/eventAggregator'

interface EventTransactionGroupProps {
  group: EventGroup
  renderEvent: (event: KafkaEvent, index: number) => React.ReactNode
}

/**
 * Transaction type icon and color
 * Using high-contrast colors that are accessible and color-blind friendly
 */
const TransactionBadge: React.FC<{ transactionType?: string }> = ({ transactionType }) => {
  const getConfig = () => {
    switch (transactionType) {
      case 'CREATE_CUSTOMER':
        return { 
          label: 'Customer', 
          // Violet/purple - distinct from other colors, good for color blindness
          bgClass: 'bg-violet-100 dark:bg-violet-900/40',
          textClass: 'text-violet-700 dark:text-violet-300',
          borderClass: 'border-violet-300 dark:border-violet-600',
          icon: '👤' 
        }
      case 'OPEN_ACCOUNT':
        return { 
          label: 'Account', 
          // Teal/cyan - distinct and accessible
          bgClass: 'bg-cyan-100 dark:bg-cyan-900/40',
          textClass: 'text-cyan-700 dark:text-cyan-300',
          borderClass: 'border-cyan-300 dark:border-cyan-600',
          icon: '💳' 
        }
      case 'SEND_PAYMENT':
        return { 
          label: 'Payment', 
          // Orange - distinct from green/red, good for color blindness
          bgClass: 'bg-orange-100 dark:bg-orange-900/40',
          textClass: 'text-orange-700 dark:text-orange-300',
          borderClass: 'border-orange-300 dark:border-orange-600',
          icon: '💸' 
        }
      default:
        return { 
          label: 'Transaction', 
          bgClass: 'bg-slate-100 dark:bg-slate-700',
          textClass: 'text-slate-700 dark:text-slate-300',
          borderClass: 'border-slate-300 dark:border-slate-600',
          icon: '📋' 
        }
    }
  }

  const { label, bgClass, textClass, borderClass, icon } = getConfig()

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${bgClass} ${borderClass}`}>
      <span className="text-sm">{icon}</span>
      <span className={`text-xs font-semibold ${textClass}`}>{label}</span>
    </div>
  )
}

/**
 * Metrics display component - high contrast for accessibility
 */
const MetricsDisplay: React.FC<{ group: EventGroup }> = ({ group }) => {
  const metrics = calculateTransactionMetrics(group)

  return (
    <div className="flex items-center gap-4 text-xs">
      <div className="flex items-center gap-1.5">
        <Activity size={12} className="text-slate-500 dark:text-slate-400" />
        <span className="text-slate-500 dark:text-slate-400">Events:</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{metrics.totalEvents}</span>
        <span className="text-slate-500 dark:text-slate-400">
          ({metrics.businessEvents} business, {metrics.dataEvents} data)
        </span>
      </div>

      {metrics.duration > 0 && (
        <div className="flex items-center gap-1.5">
          <Clock size={12} className="text-slate-500 dark:text-slate-400" />
          <span className="text-slate-500 dark:text-slate-400">Duration:</span>
          <span className="text-slate-700 dark:text-slate-200 font-semibold">{formatDuration(metrics.duration)}</span>
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
    <div ref={ref} className="border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 overflow-hidden shadow-sm">
      {/* Group header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {/* Expand/collapse icon */}
          <div className="text-slate-500 dark:text-slate-400">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>

          {/* Transaction badge */}
          <TransactionBadge transactionType={group.transactionType} />

          {/* Group info */}
          <div className="flex flex-col items-start gap-1">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{startTime}</span>
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
            <div className="border-t border-slate-200 dark:border-slate-700">
              {/* Timeline connector */}
              <div className="relative px-4 py-3 bg-slate-50 dark:bg-slate-900/50">
                {/* Vertical line - using brand colors */}
                <div
                  className="absolute left-8 top-0 bottom-0 w-0.5"
                  style={{
                    background: `linear-gradient(to bottom, #00A3E0, #003366)`
                  }}
                />

                {/* Events */}
                <div className="space-y-3 relative">
                  {group.events.map((event, index) => (
                    <div key={event.id} className="flex items-start gap-3 relative">
                      {/* Timeline node - using distinct colors for accessibility */}
                      <div
                        className="w-3 h-3 rounded-full border-2 bg-white dark:bg-slate-800 z-10 mt-2 flex-shrink-0 shadow-sm"
                        style={{
                          borderColor:
                            event.type === 'business'
                              ? '#003366' // Temenos Navy for business events
                              : '#00A3E0' // Temenos Cyan for data events
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
