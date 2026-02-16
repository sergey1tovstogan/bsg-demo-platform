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
  Send,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Terminal,
  Cloud,
  Power,
  Wrench,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useSimulation } from '../data-architecture/hooks/useSimulation'
import { useCrossTabSync } from '../data-architecture/hooks/useCrossTabSync'
import { StepCard } from '../data-architecture/demo/StepCard'
import { ApiInspector } from '../data-architecture/demo/ApiInspector'
import { KafkaEventStream } from '../data-architecture/demo/KafkaEventStream'
import { TRANSACTION_STEPS } from '../data-architecture/config/simulation.config'
import { apiService } from '../../services/api'
import type { ApiLog, RestApiType } from '../data-architecture/demo/types'

// JSON Syntax Highlighter for REST API cards
const JsonView = ({ data, rawText }: { data: unknown; rawText?: string }) => {
  if (!data) {
    if (rawText) {
      return <pre className="text-xs whitespace-pre-wrap font-mono">{rawText}</pre>
    }
    return <pre className="text-xs whitespace-pre-wrap text-gray-500">No data</pre>
  }
  const formattedJson = JSON.stringify(data, null, 2)
  const renderToken = (token: string, index: number) => {
    if (token.match(/^".*":$/)) {
      return <span key={index} className="text-[#BB6F62] dark:text-[#ff9e8f] font-semibold">{token}</span>
    } else if (token.match(/^".*"$/)) {
      return <span key={index} className="text-[#134CA2] dark:text-[#60a5fa]">{token}</span>
    } else if (token.match(/^-?\d+\.?\d*$/)) {
      return <span key={index} className="text-[#008456] dark:text-[#4ade80]">{token}</span>
    } else if (token === 'true' || token === 'false') {
      return <span key={index} className="text-purple-600 dark:text-purple-400 font-semibold">{token}</span>
    } else if (token === 'null') {
      return <span key={index} className="text-gray-500 dark:text-gray-400 font-semibold">{token}</span>
    } else {
      return <span key={index} className="dark:text-slate-300">{token}</span>
    }
  }
  const tokens = formattedJson
    .split(/("(?:\\.|[^"\\])*"(?:\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?|[{}[\],:]|\s+)/g)
    .filter(Boolean)
  return <pre className="text-xs whitespace-pre-wrap font-mono">{tokens.map((token, index) => renderToken(token, index))}</pre>
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
  },
  {
    id: 'CUSTOMER' as RestApiType,
    title: 'Customer',
    method: 'GET' as const,
    url: 'https://api.temenos.com/api/v5.7.0/party/customers/',
    docUrl: 'https://developer.temenos.com/service/customer-management#tag/RETAIL/operation/getCustomer',
    defaultBody: null
  },
  {
    id: 'ACCOUNTS' as RestApiType,
    title: 'Accounts',
    method: 'GET' as const,
    url: 'https://mdsworkbench.temenos.com/irf-provider-container/api/v4.9.0/holdings/accounts/balances',
    docUrl: undefined,
    defaultBody: null
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
  const [userJourneyExpanded, setUserJourneyExpanded] = useState(true)
  const [variousApiExpanded, setVariousApiExpanded] = useState(true)
  const [eventStreamResetTime, setEventStreamResetTime] = useState(() => Date.now())

  // REST API state per API
  const [restApiState, setRestApiState] = useState<Record<string, { loading: boolean; body?: string; param?: string; collapsed?: boolean }>>(() =>
    Object.fromEntries(REST_APIS.map((a) => [a.id, { loading: false, body: a.defaultBody ? JSON.stringify(a.defaultBody, null, 2) : undefined, param: a.id === 'PORTFOLIO' ? '100291-3' : a.id === 'CUSTOMER' ? '100291' : a.id === 'ACCOUNTS' ? 'EUR' : undefined, collapsed: false }]))
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
    switch (stepNumber) {
      case 1: await simulation.executeCreateCustomer(); break
      case 2: await simulation.executeOpenAccount(); break
      case 3: await simulation.executeSendPayment(); break
    }
  }

  const handleReset = () => {
    setEventStreamResetTime(Date.now())
    simulation.resetSimulation()
    setKafkaPaused(false)
  }

  const executeRestApi = async (api: typeof REST_APIS[0]) => {
    const state = restApiState[api.id] || {}
    setRestApiState((s) => ({ ...s, [api.id]: { ...s[api.id], loading: true } }))
    const start = Date.now()
    let url = api.url
    if (api.id === 'PORTFOLIO' && state.param) url += state.param
    else if (api.id === 'CUSTOMER' && state.param) url += state.param
    else if (api.id === 'ACCOUNTS' && state.param) url += `?currencyId=${state.param}`

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
    } catch (err: unknown) {
      const duration = Date.now() - start
      const error = err as { response?: { data?: { detail?: string } }; message?: string }
      const errorMsg = error.response?.data?.detail || error.message || 'Request failed'
      const log = createRestApiLog(api.id, url, api.method, requestBody, { error: errorMsg }, 500, duration)
      setRestApiLogs((prev) => [...prev, log])
    } finally {
      setRestApiState((s) => ({ ...s, [api.id]: { ...s[api.id], loading: false } }))
    }
  }

  const isComplete = simulation.isSimulationComplete()

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

        {/* Main grid: Left = User Journey + Various API Calls, Right = API Inspector (always) + Kafka (expandable) */}
        <div className="grid lg:grid-cols-[minmax(0,40%)_minmax(0,1fr)] gap-6 pb-8">
          {/* Left column - scrollable: User Journey and Various API Calls as independent groups */}
          <div className="space-y-6 w-full overflow-hidden">
            {/* User Journey - expandable group */}
            <div className="w-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <button
                onClick={() => setUserJourneyExpanded(!userJourneyExpanded)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#003366]/10 dark:bg-[#003366]/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-[#003366] dark:text-[#00A3E0]" />
                  </div>
                  User Journey
                </h3>
                {userJourneyExpanded ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
              </button>
              {userJourneyExpanded && (
                <div className="px-5 pb-5 pt-0 space-y-4">
                  <StepCard stepNumber={1} title={TRANSACTION_STEPS.CREATE_CUSTOMER.title} description={TRANSACTION_STEPS.CREATE_CUSTOMER.description} status={simulation.getCurrentStepStatus('CREATE_CUSTOMER')} disabled={!simulation.isStepAvailable(1)} onExecute={() => handleExecuteStep(1)} resultData={simulation.state.transactions.customerId ? { customerId: simulation.state.transactions.customerId } : undefined} icon={<User className="w-5 h-5 text-[#003366] dark:text-[#00A3E0]" />} />
                  <StepCard stepNumber={2} title={TRANSACTION_STEPS.OPEN_ACCOUNT.title} description={TRANSACTION_STEPS.OPEN_ACCOUNT.description} status={simulation.getCurrentStepStatus('OPEN_ACCOUNT')} disabled={!simulation.isStepAvailable(2)} onExecute={() => handleExecuteStep(2)} resultData={simulation.state.transactions.accountId ? { accountId: simulation.state.transactions.accountId } : undefined} icon={<CreditCard className="w-5 h-5 text-[#003366] dark:text-[#00A3E0]" />} />
                  <StepCard stepNumber={3} title={TRANSACTION_STEPS.SEND_PAYMENT.title} description={TRANSACTION_STEPS.SEND_PAYMENT.description} status={simulation.getCurrentStepStatus('SEND_PAYMENT')} disabled={!simulation.isStepAvailable(3)} onExecute={() => handleExecuteStep(3)} resultData={simulation.state.transactions.paymentId ? { paymentId: simulation.state.transactions.paymentId } : undefined} icon={<Send className="w-5 h-5 text-[#003366] dark:text-[#00A3E0]" />} />
                </div>
              )}
            </div>

            {/* Various API Calls - expandable group */}
            <div className="w-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <button
                onClick={() => setVariousApiExpanded(!variousApiExpanded)}
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
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Execute APIs below. Results appear in the API Inspector. No Kafka events for these APIs.</p>
                  <div className="space-y-4">
                {REST_APIS.map((api) => {
                  const state = restApiState[api.id] || {}
                  const isLoading = state.loading
                  return (
                    <div key={api.id} className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-bold rounded ${api.method === 'POST' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100' : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100'}`}>{api.method}</span>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">{api.title}</h4>
                        {api.docUrl && (
                          <a href={api.docUrl} target="_blank" rel="noopener noreferrer" className="text-[#00A3E0] hover:text-[#003366] dark:hover:text-[#00A3E0]" title="API docs"><ExternalLink className="w-4 h-4" /></a>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-mono truncate">{api.url}{api.id === 'PORTFOLIO' && state.param ? state.param : api.id === 'CUSTOMER' && state.param ? state.param : api.id === 'ACCOUNTS' && state.param ? `?currencyId=${state.param}` : ''}</p>
                      {(api.id === 'PORTFOLIO' || api.id === 'CUSTOMER' || api.id === 'ACCOUNTS') && (
                        <div className="mb-3">
                          <input type="text" value={state.param || ''} onChange={(e) => setRestApiState((s) => ({ ...s, [api.id]: { ...s[api.id], param: e.target.value } }))} placeholder={api.id === 'PORTFOLIO' ? 'Portfolio ID' : api.id === 'CUSTOMER' ? 'Customer ID' : 'Currency'} className="px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 dark:text-white w-24" />
                        </div>
                      )}
                      {api.method === 'POST' && api.defaultBody && (
                        <div className="mb-4">
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Request body</label>
                          <div className="relative">
                            <div className="w-full h-32 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg overflow-auto bg-white dark:bg-slate-900 pointer-events-none">
                              <JsonView data={(() => { try { return JSON.parse(state.body || '{}') } catch { return null } })()} rawText={state.body} />
                            </div>
                            <textarea value={state.body || ''} onChange={(e) => setRestApiState((s) => ({ ...s, [api.id]: { ...s[api.id], body: e.target.value } }))} className="absolute top-0 left-0 w-full h-32 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#003366] bg-transparent text-transparent caret-black dark:caret-white resize-none z-10" spellCheck={false} />
                          </div>
                        </div>
                      )}
                      {/* Execute button - same look and feel as User Journey StepCard */}
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
                    </div>
                  )
                })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right column - sticky: API Inspector always visible, Kafka Event Stream expandable below */}
          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            {/* API Inspector - always visible */}
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
