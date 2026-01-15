// ApiInspector - Terminal-style API request/response viewer
import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, ChevronDown, ChevronRight, Terminal, CheckCircle, XCircle } from 'lucide-react'
import type { ApiInspectorProps, ApiLog } from './types'
import { UI_CONFIG } from '../config/simulation.config'

/**
 * Syntax highlighter for JSON
 */
const JsonHighlight: React.FC<{ data: any }> = ({ data }) => {
  const jsonString = JSON.stringify(data, null, 2)

  // Simple syntax highlighting
  const highlighted = jsonString
    .replace(/"([^"]+)":/g, '<span class="text-blue-400">"$1":</span>')
    .replace(/: "([^"]+)"/g, ': <span class="text-green-400">"$1"</span>')
    .replace(/: (\d+)/g, ': <span class="text-yellow-400">$1</span>')
    .replace(/: (true|false)/g, ': <span class="text-purple-400">$1</span>')
    .replace(/: null/g, ': <span class="text-gray-500">null</span>')

  return (
    <pre
      className="text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words"
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  )
}

/**
 * HTTP method badge - High contrast, accessible colors
 */
const MethodBadge: React.FC<{ method: ApiLog['method'] }> = ({ method }) => {
  const getMethodColor = () => {
    switch (method) {
      case 'GET':
        return 'bg-[#003366] text-white' // Temenos Navy
      case 'POST':
        return 'bg-emerald-600 text-white'
      case 'PUT':
        return 'bg-amber-600 text-white'
      case 'DELETE':
        return 'bg-red-600 text-white'
    }
  }

  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${getMethodColor()}`}>
      {method}
    </span>
  )
}

/**
 * Status code badge - High contrast for accessibility
 */
const StatusBadge: React.FC<{ status: 'success' | 'error'; statusCode: number }> = ({
  status,
  statusCode
}) => {
  return (
    <span
      className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold ${
        status === 'success'
          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700'
          : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700'
      }`}
    >
      {statusCode}
    </span>
  )
}

/**
 * Individual API log entry - Temenos brand styling
 */
const ApiLogEntry = React.forwardRef<HTMLDivElement, { log: ApiLog }>(({ log }, ref) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    } as Intl.DateTimeFormatOptions)
  }

  // Use status-based border color
  const borderColor = log.status === 'success' ? 'border-l-[#003366]' : 'border-l-red-500'

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`border-l-3 ${borderColor} pl-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-r-lg`}
    >
      {/* Log header */}
      <div
        className="flex items-center justify-between cursor-pointer mb-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 flex-1">
          {/* Expand/collapse icon */}
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          )}

          {/* Status icon */}
          {log.status === 'success' ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500" />
          )}

          {/* Method badge */}
          <MethodBadge method={log.method} />

          {/* Endpoint */}
          <span className="text-sm text-slate-700 dark:text-slate-300 font-mono">{log.endpoint}</span>

          {/* Status code */}
          <StatusBadge status={log.status} statusCode={log.statusCode} />

          {/* Duration */}
          <span className="text-xs text-slate-500 dark:text-slate-500 font-mono">{log.duration}ms</span>
        </div>

        {/* Timestamp */}
        <span className="text-xs text-slate-500 dark:text-slate-500 font-mono">{formatTimestamp(log.timestamp)}</span>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="ml-7 space-y-3 overflow-hidden"
          >
            {/* Request section */}
            <div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 font-semibold flex items-center gap-2">
                <span className="text-[#003366] dark:text-[#00A3E0]">→</span> REQUEST
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                <JsonHighlight data={log.request} />
              </div>
            </div>

            {/* Response section */}
            <div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 font-semibold flex items-center gap-2">
                <span className="text-emerald-600 dark:text-emerald-400">←</span> RESPONSE
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                <JsonHighlight data={log.response} />
              </div>
            </div>

            {/* Transaction type */}
            <div className="text-xs text-slate-600 dark:text-slate-400 font-mono">
              Transaction: <span className="text-[#003366] dark:text-[#00A3E0] font-semibold">{log.type}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

ApiLogEntry.displayName = 'ApiLogEntry'

/**
 * ApiInspector Component - Main terminal-style API log viewer
 * Styled with Temenos brand colors
 */
export const ApiInspector: React.FC<ApiInspectorProps> = ({ logs, isLoading, onClear }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (UI_CONFIG.API_LOG_AUTO_SCROLL && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full shadow-sm">
      {/* Header - Temenos brand styling */}
      <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-[#003366] dark:text-[#00A3E0]" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">API Inspector</h3>
          {logs.length > 0 && (
            <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
              {logs.length} {logs.length === 1 ? 'request' : 'requests'}
            </span>
          )}
        </div>

        {/* Clear button */}
        <button
          onClick={onClear}
          disabled={logs.length === 0}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border
            ${
              logs.length === 0
                ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-600'
            }
          `}
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>

      {/* Logs container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50 dark:bg-slate-900/50 scrollbar-thin scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-600 scrollbar-track-slate-200 dark:scrollbar-track-slate-800"
      >
        {logs.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
            <Terminal className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No API requests yet</p>
            <p className="text-xs mt-1 text-slate-500 dark:text-slate-500">Execute a transaction to see API logs here</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {logs.map((log) => (
              <ApiLogEntry key={log.id} log={log} />
            ))}
          </AnimatePresence>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-[#003366] dark:text-[#00A3E0] text-sm py-2"
          >
            <div className="w-2 h-2 bg-[#003366] dark:bg-[#00A3E0] rounded-full animate-pulse" />
            <span className="font-medium">Processing request...</span>
          </motion.div>
        )}
      </div>

      {/* Footer with stats */}
      {logs.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2.5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <span>
            Success:{' '}
            <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
              {logs.filter((l) => l.status === 'success').length}
            </span>
          </span>
          <span>
            Failed:{' '}
            <span className="text-red-600 dark:text-red-400 font-mono font-semibold">
              {logs.filter((l) => l.status === 'error').length}
            </span>
          </span>
          <span>
            Avg Duration:{' '}
            <span className="text-slate-800 dark:text-slate-200 font-mono font-semibold">
              {logs.length > 0
                ? Math.round(logs.reduce((acc, l) => acc + l.duration, 0) / logs.length)
                : 0}
              ms
            </span>
          </span>
        </div>
      )}
    </div>
  )
}

export default ApiInspector
