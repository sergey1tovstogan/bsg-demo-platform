// StepCard - Transaction step UI component with status indicators
import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Loader2, Circle } from 'lucide-react'
import type { StepCardProps } from './types'

/**
 * Status icon mapper
 */
const StatusIcon: React.FC<{ status: StepCardProps['status'] }> = ({ status }) => {
  switch (status) {
    case 'idle':
      return <Circle className="w-6 h-6 text-gray-400" />
    case 'loading':
      return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
    case 'success':
      return <CheckCircle2 className="w-6 h-6 text-green-500" />
    case 'error':
      return <XCircle className="w-6 h-6 text-red-500" />
  }
}

/**
 * Status badge component
 */
const StatusBadge: React.FC<{ status: StepCardProps['status'] }> = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'idle':
        return 'bg-gray-100 text-gray-700'
      case 'loading':
        return 'bg-blue-100 text-blue-700'
      case 'success':
        return 'bg-green-100 text-green-700'
      case 'error':
        return 'bg-red-100 text-red-700'
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
    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor()}`}>
      {getStatusText()}
    </span>
  )
}

/**
 * Result data display component
 */
const ResultData: React.FC<{ data: any }> = ({ data }) => {
  if (!data) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-4 p-3 bg-gray-900 rounded-lg border border-gray-700"
    >
      <div className="text-xs text-gray-400 mb-2 font-mono">Response Data:</div>
      <pre className="text-xs text-green-400 font-mono overflow-x-auto max-h-40 overflow-y-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </motion.div>
  )
}

/**
 * StepCard Component - Individual transaction step card
 */
export const StepCard: React.FC<StepCardProps> = ({
  stepNumber,
  title,
  description,
  status,
  disabled,
  onExecute,
  resultData,
  icon
}) => {
  // Determine card border color based on status
  const getBorderColor = () => {
    switch (status) {
      case 'idle':
        return 'border-gray-700'
      case 'loading':
        return 'border-blue-500'
      case 'success':
        return 'border-green-500'
      case 'error':
        return 'border-red-500'
    }
  }

  // Determine if execute button should be shown
  const showExecuteButton = status === 'idle' || status === 'error'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: stepNumber * 0.1 }}
      className={`
        relative bg-gray-800 rounded-xl p-6 border-2 transition-all duration-300
        ${getBorderColor()}
        ${status === 'loading' ? 'shadow-lg shadow-blue-500/20' : ''}
        ${status === 'success' ? 'shadow-lg shadow-green-500/20' : ''}
        ${status === 'error' ? 'shadow-lg shadow-red-500/20' : ''}
      `}
    >
      {/* Step number badge */}
      <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
        {stepNumber}
      </div>

      {/* Header section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          {/* Icon */}
          <div className="p-2 bg-gray-700 rounded-lg">
            {icon}
          </div>

          {/* Title and description */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <StatusBadge status={status} />
            </div>
            <p className="text-sm text-gray-400">{description}</p>
          </div>
        </div>

        {/* Status icon */}
        <div className="ml-4">
          <StatusIcon status={status} />
        </div>
      </div>

      {/* Action button */}
      {showExecuteButton && (
        <motion.button
          whileHover={{ scale: disabled ? 1 : 1.02 }}
          whileTap={{ scale: disabled ? 1 : 0.98 }}
          onClick={onExecute}
          disabled={disabled}
          className={`
            w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200
            ${
              disabled
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 shadow-lg hover:shadow-teal-500/50'
            }
          `}
        >
          {status === 'error' ? 'Retry Action' : 'Execute Action'}
        </motion.button>
      )}

      {/* Loading state */}
      {status === 'loading' && (
        <div className="flex items-center justify-center gap-2 py-2.5">
          <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
          <span className="text-sm text-blue-500 font-medium">Executing transaction...</span>
        </div>
      )}

      {/* Success message */}
      {status === 'success' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center gap-2 py-2.5 bg-green-500/10 rounded-lg border border-green-500/30"
        >
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-500 font-medium">Transaction completed successfully!</span>
        </motion.div>
      )}

      {/* Error message */}
      {status === 'error' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 bg-red-500/10 rounded-lg border border-red-500/30 mb-3"
        >
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-medium text-red-500 mb-1">Transaction Failed</div>
              <div className="text-xs text-red-400">
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

      {/* Loading progress bar */}
      {status === 'loading' && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-b-xl"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, ease: 'linear' }}
        />
      )}
    </motion.div>
  )
}

export default StepCard
