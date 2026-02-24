// Event Business Context Component - Displays user-friendly business fields from events
import React from 'react'
import type { EventBusinessContext as EventBusinessContextType } from './types'

interface EventBusinessContextProps {
  context: EventBusinessContextType
  /** When true, hides the category badge (e.g. when event is inside a group that already shows it) */
  hideCategoryBadge?: boolean
}

/**
 * Category badge component with color coding
 * Using high-contrast, accessible colors matching EventTransactionGroup
 */
const CategoryBadge: React.FC<{ category: 'customer' | 'account' | 'payment' }> = ({ category }) => {
  const getCategoryConfig = () => {
    switch (category) {
      case 'customer':
        return {
          label: 'Customer',
          icon: '👤',
          // Violet - distinct from other colors, good for color blindness
          bgClass: 'bg-violet-100 dark:bg-violet-900/40',
          textClass: 'text-violet-700 dark:text-violet-300',
          borderClass: 'border-violet-300 dark:border-violet-600'
        }
      case 'account':
        return {
          label: 'Account',
          icon: '💳',
          // Cyan - distinct and accessible (Temenos accent)
          bgClass: 'bg-cyan-100 dark:bg-cyan-900/40',
          textClass: 'text-cyan-700 dark:text-cyan-300',
          borderClass: 'border-cyan-300 dark:border-cyan-600'
        }
      case 'payment':
        return {
          label: 'Payment',
          icon: '💸',
          // Orange - distinct from green/red, good for color blindness
          bgClass: 'bg-orange-100 dark:bg-orange-900/40',
          textClass: 'text-orange-700 dark:text-orange-300',
          borderClass: 'border-orange-300 dark:border-orange-600'
        }
    }
  }

  const { label, icon, bgClass, textClass, borderClass } = getCategoryConfig()

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${bgClass} ${textClass} ${borderClass}`}>
      <span>{icon}</span>
      {label}
    </span>
  )
}

/**
 * Field display component for key-value pairs
 */
const Field: React.FC<{ label: string; value: any }> = ({ label, value }) => {
  // Format the value for display
  const formatValue = (val: any): string => {
    if (val === null || val === undefined) return '-'
    if (typeof val === 'object') return JSON.stringify(val)
    if (typeof val === 'boolean') return val ? 'Yes' : 'No'
    return String(val)
  }

  // Format label for display (convert camelCase to Title Case)
  const formatLabel = (lbl: string): string => {
    return lbl
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
  }

  return (
    <div className="flex items-baseline gap-3">
      <span className="text-slate-600 dark:text-slate-400 text-xs font-semibold min-w-[110px]">
        {formatLabel(label)}
      </span>
      <span className="text-slate-800 dark:text-slate-200 text-sm font-mono font-medium">
        {formatValue(value)}
      </span>
    </div>
  )
}

/**
 * Main EventBusinessContext component
 */
export const EventBusinessContext: React.FC<EventBusinessContextProps> = ({ context, hideCategoryBadge = false }) => {
  const { category, formattedSummary, primaryFields } = context

  // Only show primary fields (excluding summary info)
  const displayFields = Object.entries(primaryFields).filter(([key]) => {
    // Filter out fields that are already in the summary
    return !['customerName', 'name', 'email', 'accountType', 'type', 'reference'].includes(key)
  })

  return (
    <div className="space-y-3 px-4 py-3.5 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/60 shadow-sm">
      {/* Category badge and summary (badge hidden when inside grouped view to avoid duplication) */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2.5">
          {!hideCategoryBadge && (
            <div className="flex items-center gap-2">
              <CategoryBadge category={category} />
            </div>
          )}
          <p className="text-sm text-slate-700 dark:text-slate-200 font-semibold leading-relaxed">
            {formattedSummary}
          </p>
        </div>
      </div>

      {/* Primary fields */}
      {displayFields.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-700/40">
          {displayFields.map(([key, value]) => (
            <Field key={key} label={key} value={value} />
          ))}
        </div>
      )}
    </div>
  )
}

export default EventBusinessContext
