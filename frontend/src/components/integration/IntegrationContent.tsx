// IntegrationContent - Unified Integration page with Event Flow + REST API Catalog
// Reuses look and feel from /platform/data-architecture (User Journey, API Inspector, Event Stream)
// without TDH/ODS/SDS. REST APIs use API Inspector but have no Kafka events.
import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  RefreshCw,
  TrendingUp,
  User,
  CreditCard,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Terminal,
  Cloud,
  Power,
  Wrench,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  XCircle
} from 'lucide-react'
import { useSimulation } from '../data-architecture/hooks/useSimulation'
import { useCrossTabSync } from '../data-architecture/hooks/useCrossTabSync'
import { StepCard } from '../data-architecture/demo/StepCard'
import { ApiInspector } from '../data-architecture/demo/ApiInspector'
import { KafkaEventStream } from '../data-architecture/demo/KafkaEventStream'
import { TRANSACTION_STEPS, API_CONFIG, API_ENDPOINTS } from '../data-architecture/config/simulation.config'
import { apiService } from '../../services/api'
import type { ApiLog, RestApiType } from '../data-architecture/demo/types'

// Editable JSON request body - uses visible textarea to avoid cursor/position misalignment
// (overlay approach caused typed characters to appear in wrong place, e.g. amount "11" ending up in beneficiaryId)
const RequestBodyEditor: React.FC<{
  value: string
  onChange: (value: string) => void
  placeholder?: string
}> = ({ value, onChange, placeholder }) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      spellCheck={false}
      className="w-full min-h-[140px] max-h-48 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg font-mono text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent"
      aria-label="Request body"
    />
  )
}

// GET Customer - same path as POST Create Customer (/v5.7.0/party/customers) + customerId from Create Customer response
// GET Accounts - same base URL as Create Customer/Open Account (transactingress), path: /v4.9.0/holdings/accounts/{accountId}/balances
const GetCustomerCard: React.FC<{
  customerId: string | undefined
  onExecute: () => Promise<void>
  status: 'idle' | 'loading' | 'success' | 'error'
  resultData?: unknown
  onClearResult?: () => void
  isExpanded?: boolean
  onToggle?: () => void
}> = ({ customerId, onExecute, status, resultData, isExpanded = true, onToggle }) => {
  const disabled = !customerId
  const borderClass = status === 'success'
    ? 'border-2 border-emerald-500 shadow-lg shadow-emerald-500/20'
    : status === 'error'
      ? 'border-2 border-red-500 shadow-lg shadow-red-500/20'
      : 'border-2 border-slate-200 dark:border-slate-700'
  const isCollapsible = onToggle !== undefined
  const showContent = !isCollapsible || isExpanded

  return (
    <div className={`relative w-full min-w-0 bg-white dark:bg-slate-800 rounded-xl p-5 transition-all duration-300 ${borderClass}`}>
      <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-[#003366] to-[#00A3E0] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
        2
      </div>
      <div
        className={`flex items-start justify-between ${isCollapsible ? 'cursor-pointer' : ''} ${showContent ? 'mb-4' : ''}`}
        onClick={isCollapsible ? onToggle : undefined}
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <User className="w-5 h-5 text-[#003366] dark:text-[#00A3E0]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-1 text-xs font-bold rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100">GET</span>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Get Customer</h3>
              {status === 'success' && <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700">Completed</span>}
              {status === 'error' && <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700">Failed</span>}
              {isCollapsible && (isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />)}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Retrieve customer details by ID from Create Customer</p>
            {customerId && <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-mono">Customer ID: {customerId}</p>}
          </div>
        </div>
      </div>
      {showContent && (status === 'idle' || status === 'error') && (
        <motion.button
          whileHover={{ scale: disabled ? 1 : 1.02 }}
          whileTap={{ scale: disabled ? 1 : 0.98 }}
          onClick={onExecute}
          disabled={disabled}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
            disabled ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed' : 'bg-[#003366] text-white hover:bg-[#004080] shadow-md hover:shadow-lg hover:shadow-[#003366]/30'
          }`}
        >
          Execute Action
        </motion.button>
      )}
      {showContent && status === 'loading' && (
        <div className="flex items-center justify-center gap-2 py-2.5">
          <Loader2 className="w-4 h-4 text-[#003366] dark:text-[#00A3E0] animate-spin" />
          <span className="text-sm text-[#003366] dark:text-[#00A3E0] font-medium">Executing...</span>
        </div>
      )}
      {showContent && status === 'success' && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
          <div className="flex items-center justify-center gap-2 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">Transaction completed successfully!</span>
          </div>
          {resultData && (
            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-600 dark:text-slate-400 mb-2 font-semibold">Response Data:</div>
              <pre className="text-xs text-[#003366] dark:text-[#00A3E0] font-mono overflow-x-auto max-h-40 overflow-y-auto w-full">
                {JSON.stringify(resultData, null, 2)}
              </pre>
            </div>
          )}
        </motion.div>
      )}
      {showContent && status === 'error' && resultData && (
        <div className="p-3 mt-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-red-600 dark:text-red-400">{String((resultData as { error?: string })?.error ?? 'Request failed')}</div>
          </div>
        </div>
      )}
    </div>
  )
}

// GET Accounts card - placed in Retail Customer Journey, uses accountId from Open Account
const GetAccountsCard: React.FC<{
  accountId: string | undefined
  onExecute: () => Promise<void>
  status: 'idle' | 'loading' | 'success' | 'error'
  resultData?: unknown
  onClearResult?: () => void
  isExpanded?: boolean
  onToggle?: () => void
}> = ({ accountId, onExecute, status, resultData, isExpanded = true, onToggle }) => {
  const disabled = !accountId
  const borderClass = status === 'success'
    ? 'border-2 border-emerald-500 shadow-lg shadow-emerald-500/20'
    : status === 'error'
      ? 'border-2 border-red-500 shadow-lg shadow-red-500/20'
      : 'border-2 border-slate-200 dark:border-slate-700'
  const isCollapsible = onToggle !== undefined
  const showContent = !isCollapsible || isExpanded

  return (
    <div className={`relative w-full min-w-0 bg-white dark:bg-slate-800 rounded-xl p-5 transition-all duration-300 ${borderClass}`}>
      <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-[#003366] to-[#00A3E0] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
        4
      </div>
      <div
        className={`flex items-start justify-between ${isCollapsible ? 'cursor-pointer' : ''} ${showContent ? 'mb-4' : ''}`}
        onClick={isCollapsible ? onToggle : undefined}
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <CreditCard className="w-5 h-5 text-[#003366] dark:text-[#00A3E0]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-1 text-xs font-bold rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100">GET</span>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Get Accounts</h3>
              {status === 'success' && <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700">Completed</span>}
              {status === 'error' && <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700">Failed</span>}
              {isCollapsible && (isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />)}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Retrieve account balances by ID from Open Account</p>
            {accountId && <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-mono">Account ID: {accountId}</p>}
          </div>
        </div>
      </div>
      {showContent && (status === 'idle' || status === 'error') && (
        <motion.button
          whileHover={{ scale: disabled ? 1 : 1.02 }}
          whileTap={{ scale: disabled ? 1 : 0.98 }}
          onClick={onExecute}
          disabled={disabled}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
            disabled ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed' : 'bg-[#003366] text-white hover:bg-[#004080] shadow-md hover:shadow-lg hover:shadow-[#003366]/30'
          }`}
        >
          Execute Action
        </motion.button>
      )}
      {showContent && status === 'loading' && (
        <div className="flex items-center justify-center gap-2 py-2.5">
          <Loader2 className="w-4 h-4 text-[#003366] dark:text-[#00A3E0] animate-spin" />
          <span className="text-sm text-[#003366] dark:text-[#00A3E0] font-medium">Executing...</span>
        </div>
      )}
      {showContent && status === 'success' && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
          <div className="flex items-center justify-center gap-2 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">Transaction completed successfully!</span>
          </div>
          {resultData && (
            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-600 dark:text-slate-400 mb-2 font-semibold">Response Data:</div>
              <pre className="text-xs text-[#003366] dark:text-[#00A3E0] font-mono overflow-x-auto max-h-40 overflow-y-auto w-full">
                {JSON.stringify(resultData, null, 2)}
              </pre>
            </div>
          )}
        </motion.div>
      )}
      {showContent && status === 'error' && resultData && (
        <div className="p-3 mt-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-red-600 dark:text-red-400">{String((resultData as { error?: string })?.error ?? 'Request failed')}</div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper to create ApiLog from REST API response
const createRestApiLog = (
  type: RestApiType,
  endpoint: string,
  method: 'GET' | 'POST',
  request: unknown,
  response: unknown,
  statusCode: number,
  duration: number
): ApiLog => ({
  id: `REST_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
  timestamp: Date.now(),
  type,
  endpoint,
  method,
  request: request ?? {},
  response: response ?? {},
  duration,
  status: statusCode >= 200 && statusCode < 300 ? 'success' : 'error',
  statusCode
})

// REST API card configuration
const REST_APIS = [
  {
    id: 'PAYMENT_ORDERS' as RestApiType,
    title: 'Payment Orders',
    method: 'POST' as const,
    url: 'https://mdsworkbench.temenos.com/irf-extension-api/api/v1.0.0/order/paymentOrders',
    docUrl: undefined,
    defaultBody: { header: {}, body: { beneficiaryId: 'BEN2507900006', debitAccountId: '11215', amount: 800, sourceOfFundsTR: 'CASH', extensionData: { taxSegmentTR: 'B' } } }
  },
  {
    id: 'SECURITY_TRADES' as RestApiType,
    title: 'Security Trades',
    method: 'GET' as const,
    url: 'https://api.temenos.com/api/v4.0.0/holdings/securityTrades/trades',
    docUrl: 'https://developer.temenos.com/service/security-trades#tag/WEALTH/operation/getSecurityTrades',
    defaultBody: null
  },
  {
    id: 'PORTFOLIO' as RestApiType,
    title: 'Portfolio',
    method: 'POST' as const,
    url: 'https://mdsworkbench.temenos.com/irf-provider-container/api/v3.3.0/holdings/cryptoPortfolios/',
    docUrl: undefined,
    defaultBody: { header: {}, body: { referenceCurrency: 'USD', valuationCurrency: 'USD', portfolioName: 'Bank USD Portfolio', investmentProgram: '9', managedAccount: '4', startDate: '2019-08-24', memoAccount: 'Y' } }
  }
]

// Event Source Indicator (from TemenosTransactionSimulator)
const EventSourceIndicator: React.FC<{
  mode: 'mock' | 'real'
  eventCount: number
  connectionStatus?: 'connected' | 'connecting' | 'disconnected' | 'error'
  eventHubHealth?: { status: string; buffer_size?: number; message?: string; error?: string }
  connectionError?: string | null
  onManualReconnect?: () => void
}> = ({ mode, eventCount, connectionStatus, eventHubHealth, connectionError, onManualReconnect }) => {
  const isMock = mode === 'mock'
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
          isMock ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700' : 'bg-[#00A3E0]/10 text-[#003366] dark:text-[#00A3E0] border-[#00A3E0]/30'
        }`}
      >
        {isMock ? <><Wrench className="w-3.5 h-3.5" /><span>Mock Events</span></> : <><Cloud className="w-3.5 h-3.5" /><span>Real API Events</span></>}
      </div>
      {!isMock && connectionStatus && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-500' : connectionStatus === 'connecting' ? 'bg-amber-500 animate-pulse' : connectionStatus === 'error' ? 'bg-red-500' : 'bg-slate-400'}`} />
            <span className="text-xs text-slate-700 dark:text-slate-300 capitalize font-medium">{connectionStatus}</span>
            {eventHubHealth?.buffer_size !== undefined && connectionStatus === 'connected' && (
              <span className="text-xs text-slate-500 dark:text-slate-400">| Buffer: {eventHubHealth.buffer_size}</span>
            )}
          </div>
          {connectionError && connectionStatus !== 'connected' && onManualReconnect && (
            <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 px-2.5 py-1 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800 max-w-md">
              <span className="flex-1">{connectionError}</span>
              <button onClick={onManualReconnect} disabled={connectionStatus === 'connecting'} className="flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 rounded text-red-700 dark:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" title="Click to manually reconnect">
                <Power className="w-3 h-3" />
                <span>Reconnect</span>
              </button>
            </div>
          )}
        </div>
      )}
      {!isMock && connectionStatus === 'connected' && (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-md border border-emerald-200 dark:border-emerald-800">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Live</span>
        </div>
      )}
      {eventCount > 0 && <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{eventCount} {eventCount === 1 ? 'event' : 'events'}</span>}
    </div>
  )
}

const relativeBaseUrl = '/api/v1/components/data-architecture/events'
const directBackendUrl = 'https://bsg-demo-backend.jollydune-6bb98d42.eastus.azurecontainerapps.io/api/v1/components/data-architecture/events'

export function IntegrationContent() {
  const simulation = useSimulation()
  const { sendTriggers } = useCrossTabSync()
  const [kafkaPaused, setKafkaPaused] = useState(false)
  const [apiMode] = useState<'mock' | 'real'>('real')
  const [restApiLogs, setRestApiLogs] = useState<ApiLog[]>([])
  const [eventHubHealth, setEventHubHealth] = useState<{ status: string; running?: boolean; buffer_size?: number; message?: string; error?: string } | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>('connecting')
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [kafkaExpanded, setKafkaExpanded] = useState(false)
  const [retailCustomerJourneyExpanded, setRetailCustomerJourneyExpanded] = useState(true)
  const [variousApiExpanded, setVariousApiExpanded] = useState(true)
  const [eventStreamResetTime, setEventStreamResetTime] = useState(() => Date.now())
  const [getCustomerStatus, setGetCustomerStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [getCustomerResult, setGetCustomerResult] = useState<unknown>(undefined)
  const [getAccountsStatus, setGetAccountsStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [getAccountsResult, setGetAccountsResult] = useState<unknown>(undefined)
  // Which Retail Customer Journey step cards are expanded (1=Create Customer, 2=Get Customer, 3=Open Account, 4=Get Accounts)
  const [expandedStepIds, setExpandedStepIds] = useState<Set<number>>(() => new Set([1]))

  // REST API state per API
  const [restApiState, setRestApiState] = useState<Record<string, { loading: boolean; body?: string; param?: string; collapsed?: boolean; lastResult?: 'success' | 'error'; lastError?: string }>>(() =>
    Object.fromEntries(REST_APIS.map((a) => [a.id, { loading: false, body: a.defaultBody ? JSON.stringify(a.defaultBody, null, 2) : undefined, param: a.id === 'PORTFOLIO' ? '100291-3' : undefined, collapsed: false }]))
  )

  // Merge logs: Event Flow + REST APIs, sorted by timestamp
  const mergedLogs = React.useMemo(() => {
    const all = [...simulation.state.apiLogs, ...restApiLogs]
    return all.sort((a, b) => a.timestamp - b.timestamp)
  }, [simulation.state.apiLogs, restApiLogs])

  const handleClearLogs = useCallback(() => {
    simulation.clearApiLogs()
    setRestApiLogs([])
  }, [simulation])

  // Enable EventStore when connected
  useEffect(() => {
    if (connectionStatus === 'connected' && !simulation.isEventStoreEnabled()) {
      simulation.enableEventStore()
    }
  }, [connectionStatus, simulation])

  useEffect(() => {
    const triggers = simulation.state.animationTriggers
    if (triggers.length > 0) {
      sendTriggers([triggers[triggers.length - 1]])
    }
  }, [simulation.state.animationTriggers, sendTriggers])

  // Event Hub health check (simplified from TemenosTransactionSimulator)
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const baseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:8000/api/v1/components/data-architecture/events' : relativeBaseUrl
        const healthUrl = `${baseUrl}/health`
        let response = await fetch(healthUrl, { method: 'GET', headers: { Accept: 'application/json', 'Content-Type': 'application/json' } })
        let contentType = response.headers.get('content-type') || ''
        let isJson = contentType.includes('application/json')
        if (!isJson && response.status === 200 && baseUrl === relativeBaseUrl) {
          const text = await response.text()
          if (text.includes('<!doctype') || text.includes('<html')) {
            response = await fetch(`${directBackendUrl}/health`, { method: 'GET', headers: { Accept: 'application/json', 'Content-Type': 'application/json' } })
            contentType = response.headers.get('content-type') || ''
            isJson = contentType.includes('application/json')
          }
        }
        if (response.ok && isJson) {
          const health = await response.json()
          setEventHubHealth(health)
          setConnectionStatus(health.running || health.connected ? 'connected' : 'disconnected')
          setConnectionError(health.message || health.error || null)
        } else {
          setConnectionStatus('error')
          setConnectionError(`Health check failed: ${response.status}`)
        }
      } catch (err) {
        setConnectionStatus('error')
        setConnectionError(err instanceof Error ? err.message : 'Unknown error')
      }
    }
    checkHealth()
    const interval = setInterval(checkHealth, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleManualReconnect = async () => {
    setConnectionStatus('connecting')
    setConnectionError(null)
    try {
      const baseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:8000/api/v1/components/data-architecture/events' : relativeBaseUrl
      let startUrl = `${baseUrl}/start`
      let res = await fetch(startUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      let ct = res.headers.get('content-type') || ''
      if (!ct.includes('application/json') && res.status === 200 && baseUrl === relativeBaseUrl) {
        const text = await res.text()
        if (text.includes('<!doctype') || text.includes('<html')) {
          startUrl = `${directBackendUrl}/start`
          res = await fetch(startUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' } })
          ct = res.headers.get('content-type') || ''
        }
      }
      if (res.ok && ct.includes('application/json')) {
        const result = await res.json()
        if (result.success) {
          setConnectionError(null)
          setTimeout(() => {
            fetch(`${baseUrl}/health`).then(async r => {
              const h = await r.json().catch(() => ({}))
              setEventHubHealth(h)
              setConnectionStatus(h.running || h.connected ? 'connected' : 'disconnected')
            })
          }, 2000)
        } else {
          setConnectionError(result.error || result.message || 'Unknown error')
          setConnectionStatus('disconnected')
        }
      } else {
        setConnectionError(`Failed: ${res.status}`)
        setConnectionStatus('disconnected')
      }
    } catch (e) {
      setConnectionError(e instanceof Error ? e.message : 'Unknown error')
      setConnectionStatus('error')
    }
  }

  const handleExecuteStep = async (stepNumber: number) => {
    setVariousApiExpanded(false)
    setRetailCustomerJourneyExpanded(true)
    // Collapse previous steps, expand current: step 1 -> expand 1, step 2 (Open Account) -> expand 3
    const stepId = stepNumber === 1 ? 1 : 3
    setExpandedStepIds(new Set([stepId]))
    switch (stepNumber) {
      case 1: await simulation.executeCreateCustomer(); break
      case 2: await simulation.executeOpenAccount(); break
    }
  }

  const handleGetCustomer = async () => {
    const customerId = simulation.state.transactions.customerId
    if (!customerId) return
    setExpandedStepIds(new Set([2])) // Collapse Create Customer, expand Get Customer
    setGetCustomerStatus('loading')
    setGetCustomerResult(undefined)
    const url = `${API_CONFIG.REAL_API_BASE_URL}${API_ENDPOINTS.CREATE_CUSTOMER}/${customerId}`
    const start = Date.now()
    try {
      const proxyData = await apiService.proxyRequest(url, 'GET', undefined, 'demo_user')
      const duration = Date.now() - start
      const statusCode = (proxyData as { status?: number }).status ?? 200
      const data = (proxyData as { data?: unknown }).data
      const log = createRestApiLog('CUSTOMER', url, 'GET', {}, data, statusCode, duration)
      simulation.addApiLog(log)
      setGetCustomerStatus('success')
      setGetCustomerResult(data)
    } catch (err: unknown) {
      const duration = Date.now() - start
      const error = err as { response?: { data?: { detail?: string } }; message?: string }
      const errorMsg = error.response?.data?.detail || error.message || 'Request failed'
      const log = createRestApiLog('CUSTOMER', url, 'GET', {}, { error: errorMsg }, 500, duration)
      simulation.addApiLog(log)
      setGetCustomerStatus('error')
      setGetCustomerResult({ error: errorMsg })
    }
  }

  const handleGetAccounts = async () => {
    const accountId = simulation.state.transactions.accountId
    if (!accountId) return
    setExpandedStepIds(new Set([4])) // Collapse previous, expand Get Accounts
    setGetAccountsStatus('loading')
    setGetAccountsResult(undefined)
    const url = `${API_CONFIG.REAL_API_BASE_URL}${API_ENDPOINTS.GET_ACCOUNTS_BALANCES}/${accountId}/balances`
    const start = Date.now()
    try {
      const proxyData = await apiService.proxyRequest(url, 'GET', undefined, 'demo_user')
      const duration = Date.now() - start
      const statusCode = (proxyData as { status?: number }).status ?? 200
      const data = (proxyData as { data?: unknown }).data
      const log = createRestApiLog('ACCOUNTS', url, 'GET', {}, data, statusCode, duration)
      simulation.addApiLog(log)
      // Treat 4xx/5xx or HTML error response as failure (proxy returns 200 with error body in some cases)
      const isErrorResponse = statusCode >= 400 || (typeof data === 'object' && data !== null && 'text' in data &&
        typeof (data as { text?: string }).text === 'string' &&
        ((data as { text: string }).text.includes('</html>') || (data as { text: string }).text.toLowerCase().includes('not found')))
      if (isErrorResponse) {
        const errorMsg = statusCode >= 400
          ? `Request failed (${statusCode})`
          : String((data as { text?: string }).text ?? 'Unknown error')
        setGetAccountsStatus('error')
        setGetAccountsResult({ error: errorMsg })
      } else {
        setGetAccountsStatus('success')
        setGetAccountsResult(data)
      }
    } catch (err: unknown) {
      const duration = Date.now() - start
      const error = err as { response?: { data?: { detail?: string } }; message?: string }
      const errorMsg = error.response?.data?.detail || error.message || 'Request failed'
      const log = createRestApiLog('ACCOUNTS', url, 'GET', {}, { error: errorMsg }, 500, duration)
      simulation.addApiLog(log)
      setGetAccountsStatus('error')
      setGetAccountsResult({ error: errorMsg })
    }
  }

  const handleReset = () => {
    setEventStreamResetTime(Date.now())
    simulation.resetSimulation()
    setKafkaPaused(false)
    setGetCustomerStatus('idle')
    setGetCustomerResult(undefined)
    setGetAccountsStatus('idle')
    setGetAccountsResult(undefined)
    setExpandedStepIds(new Set([1]))
    setRestApiLogs([])
    setRestApiState((s) => {
      const next = { ...s }
      REST_APIS.forEach((a) => {
        if (next[a.id]) next[a.id] = { ...next[a.id], loading: false, lastResult: undefined, lastError: undefined }
      })
      return next
    })
  }

  // Auto-reset event flow when user enters Integration (prevents errors from stale state)
  useEffect(() => {
    setEventStreamResetTime(Date.now())
    simulation.resetSimulation()
    setKafkaPaused(false)
    setGetCustomerStatus('idle')
    setGetCustomerResult(undefined)
    setGetAccountsStatus('idle')
    setGetAccountsResult(undefined)
    setExpandedStepIds(new Set([1]))
    setRestApiLogs([])
    setRestApiState((s) => {
      const next = { ...s }
      REST_APIS.forEach((a) => {
        if (next[a.id]) next[a.id] = { ...next[a.id], loading: false, lastResult: undefined, lastError: undefined }
      })
      return next
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount when entering Integration
  }, [])

  const executeRestApi = async (api: typeof REST_APIS[0]) => {
    const state = restApiState[api.id] || {}
    setRetailCustomerJourneyExpanded(false)
    setVariousApiExpanded(true)
    setKafkaExpanded(false) // Auto-hide Kafka Event Stream (no events for these APIs)
    simulation.clearApiLogs()
    setRestApiState((s) => {
      const next = { ...s }
      REST_APIS.forEach((a) => {
        if (next[a.id]) next[a.id] = { ...next[a.id], lastResult: undefined, lastError: undefined }
      })
      next[api.id] = { ...next[api.id], loading: true }
      return next
    })
    const start = Date.now()
    let url = api.url
    if (api.id === 'PORTFOLIO' && state.param) url += state.param

    let requestBody: unknown = undefined
    if (api.method === 'POST' && state.body) {
      try {
        requestBody = JSON.parse(state.body)
      } catch {
        setRestApiState((s) => ({ ...s, [api.id]: { ...s[api.id], loading: false } }))
        return
      }
    }

    try {
      const proxyData = await apiService.proxyRequest(url, api.method, requestBody, 'demo_user')
      const duration = Date.now() - start
      const statusCode = (proxyData as { status?: number }).status ?? 200
      const log = createRestApiLog(api.id, url, api.method, requestBody, (proxyData as { data?: unknown }).data, statusCode, duration)
      setRestApiLogs((prev) => [...prev, log])
      setRestApiState((s) => ({ ...s, [api.id]: { ...s[api.id], loading: false, lastResult: 'success' } }))
    } catch (err: unknown) {
      const duration = Date.now() - start
      const error = err as { response?: { data?: { detail?: string } }; message?: string }
      const errorMsg = error.response?.data?.detail || error.message || 'Request failed'
      const log = createRestApiLog(api.id, url, api.method, requestBody, { error: errorMsg }, 500, duration)
      setRestApiLogs((prev) => [...prev, log])
      setRestApiState((s) => ({ ...s, [api.id]: { ...s[api.id], loading: false, lastResult: 'error', lastError: errorMsg } }))
    }
  }

  const isComplete = simulation.getCurrentStepStatus('CREATE_CUSTOMER') === 'success' && simulation.getCurrentStepStatus('OPEN_ACCOUNT') === 'success'

  // Filter Kafka events to only show those after the last reset (don't display old ones)
  const filteredKafkaEvents = React.useMemo(
    () => simulation.state.kafkaEvents.filter((e) => e.timestamp >= eventStreamResetTime),
    [simulation.state.kafkaEvents, eventStreamResetTime]
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#003366] to-[#00A3E0] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              Integration
            </h1>
            <p className="text-slate-600 dark:text-slate-400 ml-13">
              Event-driven data flow and REST API catalog
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition-all border-2 border-slate-300 dark:border-slate-600 hover:border-[#003366] dark:hover:border-[#00A3E0] font-semibold shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Reset Event Flow
          </motion.button>
        </div>

        {isComplete && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Event Flow Complete!</h3>
                <p className="text-slate-700 dark:text-slate-300">All transactions executed. Check API Inspector and Kafka Event Stream.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main split: Left = APIs (scrollable), Right = API Inspector (sticky) - side-by-side from 768px */}
        <div className="grid md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(380px,1fr)] gap-6 pb-8 min-h-[520px]">
          {/* Left column - scrollable: Retail Customer Journey and Various API Calls */}
          <div className="space-y-6 w-full min-h-0 overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar">
            {/* Retail Customer Journey - expandable group; auto-collapses when Various API Calls is expanded */}
            <div className="w-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <button
                onClick={() => {
                  setRetailCustomerJourneyExpanded(!retailCustomerJourneyExpanded)
                  if (!retailCustomerJourneyExpanded) setVariousApiExpanded(false)
                }}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#003366]/10 dark:bg-[#003366]/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-[#003366] dark:text-[#00A3E0]" />
                  </div>
                  Retail Customer Journey
                </h3>
                {retailCustomerJourneyExpanded ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
              </button>
              {retailCustomerJourneyExpanded && (
                <div className="px-5 pb-5 pt-0 space-y-4">
                  <StepCard stepNumber={1} title={TRANSACTION_STEPS.CREATE_CUSTOMER.title} description={TRANSACTION_STEPS.CREATE_CUSTOMER.description} status={simulation.getCurrentStepStatus('CREATE_CUSTOMER')} disabled={!simulation.isStepAvailable(1)} onExecute={() => handleExecuteStep(1)} resultData={simulation.state.transactions.customerId ? { customerId: simulation.state.transactions.customerId } : undefined} icon={<User className="w-5 h-5 text-[#003366] dark:text-[#00A3E0]" />} isExpanded={expandedStepIds.has(1)} onToggle={() => setExpandedStepIds((prev) => { const next = new Set(prev); if (next.has(1)) next.delete(1); else next.add(1); return next })} />
                  <GetCustomerCard
                    customerId={simulation.state.transactions.customerId}
                    onExecute={handleGetCustomer}
                    status={getCustomerStatus}
                    resultData={getCustomerResult}
                    isExpanded={expandedStepIds.has(2)}
                    onToggle={() => setExpandedStepIds((prev) => { const next = new Set(prev); if (next.has(2)) next.delete(2); else next.add(2); return next })}
                  />
                  <StepCard stepNumber={2} title={TRANSACTION_STEPS.OPEN_ACCOUNT.title} description={TRANSACTION_STEPS.OPEN_ACCOUNT.description} status={simulation.getCurrentStepStatus('OPEN_ACCOUNT')} disabled={!simulation.isStepAvailable(2)} onExecute={() => handleExecuteStep(2)} resultData={simulation.state.transactions.accountId ? { accountId: simulation.state.transactions.accountId } : undefined} icon={<CreditCard className="w-5 h-5 text-[#003366] dark:text-[#00A3E0]" />} isExpanded={expandedStepIds.has(3)} onToggle={() => setExpandedStepIds((prev) => { const next = new Set(prev); if (next.has(3)) next.delete(3); else next.add(3); return next })}
                  />
                  <GetAccountsCard
                    accountId={simulation.state.transactions.accountId}
                    onExecute={handleGetAccounts}
                    status={getAccountsStatus}
                    resultData={getAccountsResult}
                    isExpanded={expandedStepIds.has(4)}
                    onToggle={() => setExpandedStepIds((prev) => { const next = new Set(prev); if (next.has(4)) next.delete(4); else next.add(4); return next })}
                  />
                </div>
              )}
            </div>

            {/* Various API Calls - expandable group; auto-collapses when Retail Customer Journey is expanded */}
            <div className="w-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <button
                onClick={() => {
                  setVariousApiExpanded(!variousApiExpanded)
                  if (!variousApiExpanded) setRetailCustomerJourneyExpanded(false)
                }}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#00A3E0]/10 dark:bg-[#00A3E0]/20 flex items-center justify-center">
                    <Terminal className="w-4 h-4 text-[#00A3E0]" />
                  </div>
                  Various API Calls
                </h3>
                {variousApiExpanded ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
              </button>
              {variousApiExpanded && (
                <div className="px-5 pb-5 pt-0">
                  <div className="space-y-4">
                {REST_APIS.map((api) => {
                  const state = restApiState[api.id] || {}
                  const isLoading = state.loading
                  const borderClass = state.lastResult === 'success'
                    ? 'border-2 border-emerald-500 shadow-lg shadow-emerald-500/20'
                    : state.lastResult === 'error'
                      ? 'border-2 border-red-500 shadow-lg shadow-red-500/20'
                      : 'border border-slate-200 dark:border-slate-700'
                  return (
                    <div key={api.id} className={`bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 transition-all duration-300 ${borderClass}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-bold rounded ${api.method === 'POST' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100' : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100'}`}>{api.method}</span>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">{api.title}</h4>
                        {api.docUrl && (
                          <a href={api.docUrl} target="_blank" rel="noopener noreferrer" className="text-[#00A3E0] hover:text-[#003366] dark:hover:text-[#00A3E0]" title="API docs"><ExternalLink className="w-4 h-4" /></a>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-mono truncate">{api.url}{api.id === 'PORTFOLIO' && state.param ? state.param : ''}</p>
                      {api.id === 'PORTFOLIO' && (
                        <div className="mb-3">
                          <input type="text" value={state.param || ''} onChange={(e) => setRestApiState((s) => ({ ...s, [api.id]: { ...s[api.id], param: e.target.value } }))} placeholder="Portfolio ID" className="px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 dark:text-white w-24" />
                        </div>
                      )}
                      {api.method === 'POST' && api.defaultBody && (
                        <div className="mb-4">
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Request body</label>
                          <RequestBodyEditor
                            value={state.body || ''}
                            onChange={(body) => setRestApiState((s) => ({ ...s, [api.id]: { ...s[api.id], body } }))}
                          />
                        </div>
                      )}
                      {/* Execute button - same look and feel as Retail Customer Journey StepCard */}
                      {!isLoading ? (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => executeRestApi(api)}
                          className="w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 bg-[#003366] text-white hover:bg-[#004080] shadow-md hover:shadow-lg hover:shadow-[#003366]/30"
                        >
                          Execute Action
                        </motion.button>
                      ) : (
                        <div className="flex items-center justify-center gap-2 py-2.5">
                          <Loader2 className="w-4 h-4 text-[#003366] dark:text-[#00A3E0] animate-spin" />
                          <span className="text-sm text-[#003366] dark:text-[#00A3E0] font-medium">Executing...</span>
                        </div>
                      )}
                      {/* Success message - same green box as Retail Customer Journey */}
                      {state.lastResult === 'success' && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center justify-center gap-2 py-2.5 mt-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">Transaction completed successfully!</span>
                        </motion.div>
                      )}
                      {/* Error message */}
                      {state.lastResult === 'error' && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-3 mt-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                        >
                          <div className="flex items-start gap-2">
                            <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Transaction Failed</div>
                              <div className="text-xs text-red-600 dark:text-red-400">
                                {state.lastError || 'An unexpected error occurred. Please try again.'}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )
                })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right column - sticky so Inspector stays visible while left scrolls */}
          <div className="space-y-6 md:sticky md:top-6 md:self-start min-h-0">
            {/* API Inspector - fixed height for consistent side-by-side view */}
            <div className="h-[420px]">
              <ApiInspector logs={mergedLogs} isLoading={simulation.state.stage !== 'IDLE' && simulation.state.stage !== 'FINISHED'} onClear={handleClearLogs} />
            </div>

            {/* Kafka Event Stream - expandable on user request (hidden by default) */}
            {kafkaExpanded ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <EventSourceIndicator mode={apiMode} eventCount={filteredKafkaEvents.length} connectionStatus={connectionStatus} eventHubHealth={eventHubHealth || undefined} connectionError={connectionError} onManualReconnect={handleManualReconnect} />
                  </div>
                  <button
                    onClick={() => setKafkaExpanded(false)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="Hide Kafka Event Stream"
                  >
                    <ChevronUp className="w-4 h-4" />
                    Hide
                  </button>
                </div>
                <div className="h-[420px]">
                  <KafkaEventStream events={filteredKafkaEvents} onClear={simulation.clearKafkaEvents} onPause={() => setKafkaPaused(!kafkaPaused)} isPaused={kafkaPaused} />
                </div>
              </div>
            ) : (
              <button
                onClick={() => setKafkaExpanded(true)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-[#00A3E0] dark:hover:border-[#00A3E0] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-slate-600 dark:text-slate-400 hover:text-[#00A3E0]"
              >
                <Cloud className="w-4 h-4" />
                <span className="font-medium">Show Kafka Event Stream</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default IntegrationContent
