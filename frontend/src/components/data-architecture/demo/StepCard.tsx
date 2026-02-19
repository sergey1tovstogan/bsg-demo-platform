// StepCard - Transaction step UI component with status indicators
import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Loader2, Circle, ChevronDown, ChevronRight } from 'lucide-react'
import type { StepCardProps } from './types'

/**
 * Status icon mapper - Temenos brand styling
 */
const StatusIcon: React.FC<{ status: StepCardProps['status'] }> = ({ status }) => {
  switch (status) {
    case 'idle':
      return <Circle className="w-6 h-6 text-slate-400" />
    case 'loading':
      return <Loader2 className="w-6 h-6 text-[#003366] dark:text-[#00A3E0] animate-spin" />
    case 'success':
      return <CheckCircle2 className="w-6 h-6 text-emerald-500" />
    case 'error':
      return <XCircle className="w-6 h-6 text-red-500" />
  }
}

/**
 * Status badge component - Temenos brand styling with accessible contrast
 */
const StatusBadge: React.FC<{ status: StepCardProps['status'] }> = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'idle':
        return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
      case 'loading':
        return 'bg-[#003366]/10 dark:bg-[#00A3E0]/20 text-[#003366] dark:text-[#00A3E0] border-[#003366]/20 dark:border-[#00A3E0]/30'
      case 'success':
        return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700'
      case 'error':
        return 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'idle':
        return 'Ready'
      case 'loading':
        return 'Processing...'
      case 'success':
        return 'Completed'
      case 'error':
        return 'Failed'
    }
  }

  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusColor()}`}>
      {getStatusText()}
    </span>
  )
}

/**
 * Result data display component - Temenos brand styling
 */
const ResultData: React.FC<{ data: any }> = ({ data }) => {
  if (!data) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 w-full min-w-0 overflow-hidden"
    >
      <div className="text-xs text-slate-600 dark:text-slate-400 mb-2 font-semibold">Response Data:</div>
      <pre className="text-xs text-[#003366] dark:text-[#00A3E0] font-mono overflow-x-auto max-h-40 overflow-y-auto w-full">
        {JSON.stringify(data, null, 2)}
      </pre>
    </motion.div>
  )
}

/**
 * StepCard Component - Individual transaction step card
 * Styled with Temenos brand colors
 */
export const StepCard: React.FC<StepCardProps> = ({
  stepNumber,
  title,
  description,
  status,
  disabled,
  onExecute,
  resultData,
  icon,
  isExpanded = true,
  onToggle
}) => {
  // Determine card border color based on status - Temenos brand colors
  const getBorderColor = () => {
    switch (status) {
      case 'idle':
        return 'border-slate-200 dark:border-slate-700'
      case 'loading':
        return 'border-[#003366] dark:border-[#00A3E0]'
      case 'success':
        return 'border-emerald-500'
      case 'error':
        return 'border-red-500'
    }
  }

  // Determine if execute button should be shown
  const showExecuteButton = status === 'idle' || status === 'error'

  const isCollapsible = onToggle !== undefined
  const showContent = !isCollapsible || isExpanded

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: stepNumber * 0.1 }}
      className={`
        relative w-full min-w-0 bg-white dark:bg-slate-800 rounded-xl p-5 border-2 transition-all duration-300 shadow-sm
        ${getBorderColor()}
        ${status === 'loading' ? 'shadow-lg shadow-[#003366]/20 dark:shadow-[#00A3E0]/20' : ''}
        ${status === 'success' ? 'shadow-lg shadow-emerald-500/20' : ''}
        ${status === 'error' ? 'shadow-lg shadow-red-500/20' : ''}
      `}
    >
      {/* Step number badge - Temenos Navy gradient */}
      <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-[#003366] to-[#00A3E0] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
        {stepNumber}
      </div>

      {/* Header section - clickable when collapsible */}
      <div
        className={`flex items-start justify-between ${isCollapsible ? 'cursor-pointer' : ''} ${showContent ? 'mb-4' : ''}`}
        onClick={isCollapsible ? onToggle : undefined}
      >
        <div className="flex items-center gap-3 flex-1">
          {/* Icon */}
          <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
            {icon}
          </div>

          {/* Title and description */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
              <StatusBadge status={status} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
          </div>
        </div>

        {/* Status icon and expand/collapse chevron */}
        <div className="ml-4 flex items-center gap-2">
          {isCollapsible && (isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />)}
          <StatusIcon status={status} />
        </div>
      </div>

      {/* Collapsible content */}
      {showContent && (
      <>
      {/* Action button - Temenos primary button style */}
      {showExecuteButton && (
        <motion.button
          whileHover={{ scale: disabled ? 1 : 1.02 }}
          whileTap={{ scale: disabled ? 1 : 0.98 }}
          onClick={onExecute}
          disabled={disabled}
          className={`
            w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200
            ${
              disabled
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                : 'bg-[#003366] text-white hover:bg-[#004080] shadow-md hover:shadow-lg hover:shadow-[#003366]/30'
            }
          `}
        >
          {status === 'error' ? 'Retry Action' : 'Execute Action'}
        </motion.button>
      )}

      {/* Loading state */}
      {status === 'loading' && (
        <div className="flex items-center justify-center gap-2 py-2.5">
          <Loader2 className="w-4 h-4 text-[#003366] dark:text-[#00A3E0] animate-spin" />
          <span className="text-sm text-[#003366] dark:text-[#00A3E0] font-medium">Executing transaction...</span>
        </div>
      )}

      {/* Success message */}
      {status === 'success' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center gap-2 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">Transaction completed successfully!</span>
        </motion.div>
      )}

      {/* Error message */}
      {status === 'error' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 mb-3"
        >
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Transaction Failed</div>
              <div className="text-xs text-red-600 dark:text-red-400">
                {resultData?.error || 'An unexpected error occurred. Please try again.'}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Result data display (for success status) */}
      {status === 'success' && resultData && (
        <ResultData data={resultData} />
      )}

      {/* Loading progress bar - Temenos gradient */}
      {status === 'loading' && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#003366] to-[#00A3E0] rounded-b-xl"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, ease: 'linear' }}
        />
      )}
      </>
      )}
    </motion.div>
  )
}

export default StepCard
