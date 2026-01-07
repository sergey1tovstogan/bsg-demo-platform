// DatabaseRecordsTile - Azure SQL database records display with event-driven refresh
import React, { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Database, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { DATABASE_RECORDS_CONFIG } from '../config/simulation.config'

interface DatabaseRecordsTileProps {
  /** Kafka event count - triggers refresh when changed */
  eventCount: number
  /** Backend API base URL */
  apiBaseUrl?: string
  /** Database connection name: 'tdh_ods' or 'tdh_sds' */
  connection?: string
}

interface QueryResponse {
  columns: string[]
  data: Record<string, string | number | boolean | null>[]
  row_count: number
  query: string
}

interface ConnectionStatus {
  status: string
  database: string
  host: string
  version?: string
  error?: string
}

/**
 * DatabaseRecordsTile Component - Displays Azure SQL records with event-driven refresh
 * Styled with Temenos brand colors to match existing components
 */
export const DatabaseRecordsTile: React.FC<DatabaseRecordsTileProps> = ({
  eventCount,
  // Use direct backend URL in production since Azure Static Web Apps rewrite doesn't support POST
  // CORS is already configured on the backend to allow Azure Static Web Apps domains
  apiBaseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8000/api/v1'
    : 'https://bsg-demo-platform-app.azurewebsites.net/api/v1',
  connection = 'tdh_ods'
}) => {
  const [records, setRecords] = useState<QueryResponse | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>({
    status: 'checking',
    database: 'unknown',
    host: 'unknown'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const lastEventCountRef = useRef<number>(0)
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * Test database connection
   */
  const testConnection = useCallback(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/database/connection/test?connection=${connection}`)
      if (!response.ok) {
        throw new Error('Connection test failed')
      }
      const data = await response.json()
      setConnectionStatus(data)
    } catch (err) {
      console.error('Connection test failed:', err)
      setConnectionStatus({
        status: 'failed',
        database: 'unknown',
        host: 'unknown',
        error: err instanceof Error ? err.message : 'Connection failed'
      })
    }
  }, [apiBaseUrl, connection])

  /**
   * Load database records using configured SQL query
   */
  const loadRecords = useCallback(async () => {
    if (!DATABASE_RECORDS_CONFIG.ENABLED || !DATABASE_RECORDS_CONFIG.SQL_QUERY) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${apiBaseUrl}/database/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: DATABASE_RECORDS_CONFIG.SQL_QUERY,
          limit: DATABASE_RECORDS_CONFIG.MAX_ROWS,
          connection: connection
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch records' }))
        throw new Error(errorData.detail || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setRecords(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load records'
      console.error('Error loading database records:', err)
      setError(errorMessage)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [apiBaseUrl, connection])

  /**
   * Manual refresh handler
   */
  const handleManualRefresh = useCallback(() => {
    setIsRefreshing(true)
    loadRecords()
  }, [loadRecords])

  /**
   * Format value for display
   */
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return 'NULL'
    }
    if (typeof value === 'boolean') {
      return value ? 'TRUE' : 'FALSE'
    }
    if (typeof value === 'object') {
      return JSON.stringify(value)
    }
    return String(value)
  }

  // Test connection on mount
  useEffect(() => {
    testConnection()
  }, [testConnection])

  // Load records on mount
  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  // Event-driven refresh: watch for Kafka event count changes
  useEffect(() => {
    // Only refresh if event count increased (new events received)
    if (eventCount > lastEventCountRef.current && DATABASE_RECORDS_CONFIG.AUTO_REFRESH) {
      // Clear any pending refresh
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }

      // Debounce refresh to avoid too many requests
      refreshTimeoutRef.current = setTimeout(() => {
        setIsRefreshing(true)
        loadRecords()
        lastEventCountRef.current = eventCount
      }, DATABASE_RECORDS_CONFIG.REFRESH_DEBOUNCE_MS)
    } else {
      lastEventCountRef.current = eventCount
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [eventCount, loadRecords])

  const isConnected = connectionStatus?.status === 'connected'

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#003366] to-[#00A3E0] flex items-center justify-center">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              TDH (ODS/SDS Records)
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {DATABASE_RECORDS_CONFIG.DESCRIPTION || 'Database records synced from Temenos events'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection Status Badges - Similar to Kafka Event Stream */}
          <div className="flex items-center gap-3">
            {/* Connected Status Badge - Always show */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected
                    ? 'bg-emerald-500'
                    : connectionStatus?.status === 'failed'
                    ? 'bg-red-500'
                    : connectionStatus?.status === 'connecting' || connectionStatus?.status === 'checking'
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-slate-400'
                }`}
              />
              <span className="text-xs text-slate-700 dark:text-slate-300 capitalize font-medium">
                {connectionStatus?.status === 'connected' 
                  ? 'Connected' 
                  : connectionStatus?.status || 'checking...'}
              </span>
            </div>

            {/* Live Indicator - Only show when connected */}
            {isConnected && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-md border border-emerald-200 dark:border-emerald-800">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Live</span>
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleManualRefresh}
            disabled={loading || isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-[#003366] text-white hover:bg-[#004080] rounded-lg transition-all font-semibold text-sm shadow-md hover:shadow-lg hover:shadow-[#003366]/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${(loading || isRefreshing) ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-5 bg-slate-50 dark:bg-slate-900/50">
        {loading && !records ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 dark:text-slate-400">
            <Loader2 className="w-12 h-12 mb-3 text-[#003366] dark:text-[#00A3E0] animate-spin" />
            <p className="text-sm font-medium">Loading database records...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 dark:text-red-400">Error Loading Records</p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
          </div>
        ) : records && records.data.length > 0 ? (
          <div className="space-y-4">
            {/* Records count */}
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="font-medium">
                  Showing {records.row_count} {records.row_count === 1 ? 'record' : 'records'}
                </span>
              </div>
              {isRefreshing && (
                <div className="flex items-center gap-2 text-[#003366] dark:text-[#00A3E0]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs font-medium">Refreshing...</span>
                </div>
              )}
            </div>

            {/* Records Table */}
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-100 dark:bg-slate-900 sticky top-0">
                  <tr>
                    {records.columns.map((column) => (
                      <th
                        key={column}
                        className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                  <AnimatePresence>
                    {records.data.map((row, rowIndex) => (
                      <motion.tr
                        key={rowIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: rowIndex * 0.02 }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        {records.columns.map((column) => (
                          <td
                            key={column}
                            className="px-4 py-3 text-sm text-slate-900 dark:text-slate-100 whitespace-nowrap font-mono"
                          >
                            {formatValue(row[column])}
                          </td>
                        ))}
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 dark:text-slate-400">
            <Database className="w-16 h-16 mb-3 opacity-30" />
            <p className="text-sm font-medium">No records found</p>
            <p className="text-xs mt-1">Execute a transaction to see database records here</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DatabaseRecordsTile

