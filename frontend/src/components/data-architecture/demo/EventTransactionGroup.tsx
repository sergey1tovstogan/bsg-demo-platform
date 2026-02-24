// Event Transaction Group Component - Groups and displays events by transaction
// Structure: API call (Customer/Account/Payment) > Business Events (expandable) | Data Events (expandable)
import React, { useState, forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, Clock, Activity, Zap, Database } from 'lucide-react'
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
 * Expandable sub-group for Business or Data events within an API call group
 */
const EventCategorySubGroup: React.FC<{
  type: 'business' | 'data'
  events: KafkaEvent[]
  renderEvent: (event: KafkaEvent, index: number) => React.ReactNode
  defaultExpanded?: boolean
}> = ({ type, events, renderEvent, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const isBusiness = type === 'business'
  const label = isBusiness ? 'Business Events' : 'Data Events'
  const Icon = isBusiness ? Zap : Database
  const bgClass = isBusiness ? 'bg-[#003366]/5 dark:bg-[#003366]/10' : 'bg-[#00A3E0]/5 dark:bg-[#00A3E0]/10'
  const borderClass = isBusiness ? 'border-[#003366]/20 dark:border-[#003366]/30' : 'border-[#00A3E0]/20 dark:border-[#00A3E0]/30'
  const textClass = isBusiness ? 'text-[#003366] dark:text-[#00A3E0]' : 'text-[#00A3E0] dark:text-cyan-400'

  if (events.length === 0) return null

  return (
    <div className={`rounded-lg border ${borderClass} ${bgClass} overflow-hidden`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between hover:opacity-90 transition-opacity"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronDown size={14} className={textClass} /> : <ChevronRight size={14} className={textClass} />}
          <Icon size={14} className={textClass} />
          <span className={`text-xs font-semibold ${textClass}`}>{label}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">({events.length})</span>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-0 space-y-2">
              {events.map((event, index) => (
                <div key={event.id} className="pl-4 border-l-2 border-slate-200 dark:border-slate-600">
                  {renderEvent(event, index)}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Main EventTransactionGroup component
 * Uses forwardRef to support AnimatePresence exit animations
 */
export const EventTransactionGroup = forwardRef<HTMLDivElement, EventTransactionGroupProps>(
  ({ group, renderEvent }, ref) => {
  const [isExpanded, setIsExpanded] = useState(false)

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

      {/* Event list (collapsible) - grouped by Business Events | Data Events */}
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
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 space-y-3">
                <EventCategorySubGroup
                  type="business"
                  events={group.events.filter((e) => e.type === 'business')}
                  renderEvent={renderEvent}
                  defaultExpanded={false}
                />
                <EventCategorySubGroup
                  type="data"
                  events={group.events.filter((e) => e.type === 'data')}
                  renderEvent={renderEvent}
                  defaultExpanded={false}
                />
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
