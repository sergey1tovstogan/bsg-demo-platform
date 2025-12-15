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
      className="text-xs font-mono text-gray-300 whitespace-pre-wrap break-words"
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  )
}

/**
 * HTTP method badge
 */
const MethodBadge: React.FC<{ method: ApiLog['method'] }> = ({ method }) => {
  const getMethodColor = () => {
    switch (method) {
      case 'GET':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'POST':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'PUT':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'DELETE':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
    }
  }

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getMethodColor()}`}>
      {method}
    </span>
  )
}

/**
 * Status code badge
 */
const StatusBadge: React.FC<{ status: 'success' | 'error'; statusCode: number }> = ({
  status,
  statusCode
}) => {
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-mono ${
        status === 'success'
          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
          : 'bg-red-500/20 text-red-400 border border-red-500/30'
      }`}
    >
      {statusCode}
    </span>
  )
}

/**
 * Individual API log entry
 */
const ApiLogEntry: React.FC<{ log: ApiLog }> = ({ log }) => {
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

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="border-l-2 border-teal-500 pl-4 py-3 hover:bg-gray-800/50 transition-colors"
    >
      {/* Log header */}
      <div
        className="flex items-center justify-between cursor-pointer mb-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 flex-1">
          {/* Expand/collapse icon */}
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
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
          <span className="text-sm text-gray-300 font-mono">{log.endpoint}</span>

          {/* Status code */}
          <StatusBadge status={log.status} statusCode={log.statusCode} />

          {/* Duration */}
          <span className="text-xs text-gray-500 font-mono">{log.duration}ms</span>
        </div>

        {/* Timestamp */}
        <span className="text-xs text-gray-500 font-mono">{formatTimestamp(log.timestamp)}</span>
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
              <div className="text-xs text-gray-400 mb-1 font-semibold flex items-center gap-2">
                <span className="text-blue-400">→</span> REQUEST
              </div>
              <div className="bg-gray-900 rounded p-3 border border-gray-700">
                <JsonHighlight data={log.request} />
              </div>
            </div>

            {/* Response section */}
            <div>
              <div className="text-xs text-gray-400 mb-1 font-semibold flex items-center gap-2">
                <span className="text-green-400">←</span> RESPONSE
              </div>
              <div className="bg-gray-900 rounded p-3 border border-gray-700">
                <JsonHighlight data={log.response} />
              </div>
            </div>

            {/* Transaction type */}
            <div className="text-xs text-gray-500 font-mono">
              Transaction: <span className="text-teal-400">{log.type}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/**
 * ApiInspector Component - Main terminal-style API log viewer
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
    <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-teal-500" />
          <h3 className="text-sm font-semibold text-white">API Inspector</h3>
          {logs.length > 0 && (
            <span className="text-xs text-gray-400 font-mono">
              {logs.length} {logs.length === 1 ? 'request' : 'requests'}
            </span>
          )}
        </div>

        {/* Clear button */}
        <button
          onClick={onClear}
          disabled={logs.length === 0}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
            ${
              logs.length === 0
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
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
        className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900"
      >
        {logs.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Terminal className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">No API requests yet</p>
            <p className="text-xs mt-1">Execute a transaction to see API logs here</p>
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
            className="flex items-center gap-2 text-blue-400 text-sm py-2"
          >
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span>Processing request...</span>
          </motion.div>
        )}
      </div>

      {/* Footer with stats */}
      {logs.length > 0 && (
        <div className="bg-gray-800 px-4 py-2 border-t border-gray-700 flex items-center justify-between text-xs text-gray-400">
          <span>
            Success:{' '}
            <span className="text-green-400 font-mono">
              {logs.filter((l) => l.status === 'success').length}
            </span>
          </span>
          <span>
            Failed:{' '}
            <span className="text-red-400 font-mono">
              {logs.filter((l) => l.status === 'error').length}
            </span>
          </span>
          <span>
            Avg Duration:{' '}
            <span className="text-yellow-400 font-mono">
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
