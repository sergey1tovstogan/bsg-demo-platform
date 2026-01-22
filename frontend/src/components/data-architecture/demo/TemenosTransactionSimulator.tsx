// TemenosTransactionSimulator - Main transaction simulator container
import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, TrendingUp, User, CreditCard, Send, CheckCircle2, Wrench, Globe, Cloud, Terminal, Zap, Power } from 'lucide-react'
import { useSimulation } from '../hooks/useSimulation'
import { useCrossTabSync } from '../hooks/useCrossTabSync'
import { StepCard } from './StepCard'
import { ApiInspector } from './ApiInspector'
import { KafkaEventStream } from './KafkaEventStream'
import { DatabaseRecordsTile } from './DatabaseRecordsTile'
import { TRANSACTION_STEPS, API_CONFIG } from '../config/simulation.config'
// import { apiService } from '../services/apiServiceAdapter' // Unused import

/**
 * Event Source Indicator component - Temenos brand styling
 * Shows whether events are from Mock or Real API source
 */
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
      {/* Event Source Badge */}
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
          isMock
            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700'
            : 'bg-[#00A3E0]/10 text-[#003366] dark:text-[#00A3E0] border-[#00A3E0]/30'
        }`}
      >
        {isMock ? (
          <>
            <Wrench className="w-3.5 h-3.5" />
            <span>Mock Events</span>
          </>
        ) : (
          <>
            <Cloud className="w-3.5 h-3.5" />
            <span>Real API Events</span>
          </>
        )}
      </div>

      {/* Event Hub Connection Status */}
      {!isMock && connectionStatus && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div
              className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-500'
                  : connectionStatus === 'connecting'
                  ? 'bg-amber-500 animate-pulse'
                  : connectionStatus === 'error'
                  ? 'bg-red-500'
                  : 'bg-slate-400'
              }`}
            />
            <span className="text-xs text-slate-700 dark:text-slate-300 capitalize font-medium">{connectionStatus}</span>
            {eventHubHealth?.buffer_size !== undefined && connectionStatus === 'connected' && (
              <span className="text-xs text-slate-500 dark:text-slate-400">| Buffer: {eventHubHealth.buffer_size}</span>
            )}
          </div>
          {connectionError && connectionStatus !== 'connected' && (
            <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 px-2.5 py-1 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800 max-w-md">
              <span className="flex-1">{connectionError}</span>
              {onManualReconnect && (
                <button
                  onClick={onManualReconnect}
                  disabled={connectionStatus === 'connecting'}
                  className="flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 rounded text-red-700 dark:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Click to manually reconnect"
                >
                  <Power className="w-3 h-3" />
                  <span>Reconnect</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Live indicator for real mode */}
      {!isMock && connectionStatus === 'connected' && (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-md border border-emerald-200 dark:border-emerald-800">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Live</span>
        </div>
      )}

      {/* Event Count */}
      {eventCount > 0 && (
        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          {eventCount} {eventCount === 1 ? 'event' : 'events'}
        </span>
      )}
    </div>
  )
}

/**
 * Stats display component - Temenos brand styling
 */
const StatsDisplay: React.FC<{ stats: any }> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* API Calls Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[#003366]/10 dark:bg-[#003366]/20 flex items-center justify-center">
            <Terminal className="w-4 h-4 text-[#003366] dark:text-[#00A3E0]" />
          </div>
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">API Calls</div>
        </div>
        <div className="text-3xl font-bold text-[#003366] dark:text-[#00A3E0]">{stats.totalApiCalls}</div>
        <div className="text-xs text-slate-600 dark:text-slate-400 mt-2 flex items-center gap-2">
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">{stats.successfulApiCalls} success</span>
          <span className="text-slate-400">/</span>
          <span className="text-red-600 dark:text-red-400 font-medium">{stats.failedApiCalls} failed</span>
        </div>
      </div>

      {/* Kafka Events Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[#00A3E0]/10 dark:bg-[#00A3E0]/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-[#00A3E0] dark:text-[#00A3E0]" />
          </div>
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Kafka Events</div>
        </div>
        <div className="text-3xl font-bold text-[#00A3E0] dark:text-cyan-400">{stats.totalKafkaEvents}</div>
        <div className="text-xs text-slate-600 dark:text-slate-400 mt-2 flex items-center gap-2">
          <span className="text-[#003366] dark:text-slate-300 font-medium">{stats.businessEvents} business</span>
          <span className="text-slate-400">/</span>
          <span className="text-[#00A3E0] dark:text-cyan-400 font-medium">{stats.dataEvents} data</span>
        </div>
      </div>
    </div>
  )
}

/**
 * TemenosTransactionSimulator - Main simulator container
 */
export const TemenosTransactionSimulator: React.FC = () => {
  const simulation = useSimulation()
  const [kafkaPaused, setKafkaPaused] = useState(false)
  // Always use real mode - mock mode disabled
  const [apiMode] = useState<'mock' | 'real'>('real')
  const { sendTriggers } = useCrossTabSync()

  // Event Hub health state
  const [eventHubHealth, setEventHubHealth] = useState<{ status: string; running?: boolean; buffer_size?: number; message?: string; error?: string } | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>('connecting')
  const [connectionError, setConnectionError] = useState<string | null>(null)
  
  // Enable EventStore polling when component mounts and connection is established
  useEffect(() => {
    // Wait a bit for health check to complete, then enable EventStore if connected
    const timer = setTimeout(() => {
      if (connectionStatus === 'connected' && !simulation.isEventStoreEnabled()) {
        console.log('[TemenosTransactionSimulator] Enabling EventStore polling')
        simulation.enableEventStore()
      }
    }, 3000) // Wait 3 seconds after mount
    
    return () => clearTimeout(timer)
  }, [connectionStatus, simulation])
  
  // Also enable EventStore when connection status changes to connected
  useEffect(() => {
    if (connectionStatus === 'connected' && !simulation.isEventStoreEnabled()) {
      console.log('[TemenosTransactionSimulator] Connection established, enabling EventStore polling')
      simulation.enableEventStore()
    }
  }, [connectionStatus, simulation])

  // Define backend URLs - shared across health check and reconnect functions
  const relativeBaseUrl = '/api/v1/components/data-architecture/events'
  const directBackendUrl = 'https://bsg-demo-backend.jollydune-6bb98d42.eastus.azurecontainerapps.io/api/v1/components/data-architecture/events'

  const stats = simulation.getStats()
  const isComplete = simulation.isSimulationComplete()

  // Send animation triggers to DataArchitectureContent when they are added
  useEffect(() => {
    const triggers = simulation.state.animationTriggers
    if (triggers.length > 0) {
      // Send only the latest trigger (to avoid sending duplicates)
      const latestTrigger = triggers[triggers.length - 1]
      sendTriggers([latestTrigger])
    }
  }, [simulation.state.animationTriggers, sendTriggers])

  // Check Event Hub health periodically and auto-reconnect if disconnected
  useEffect(() => {
    let reconnectAttempts = 0
    const maxReconnectAttempts = 3

    const checkEventHubHealth = async () => {
      try {
        // Use direct backend URL for localhost, relative URL for production (with direct fallback)
        const baseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
          ? 'http://localhost:8000/api/v1/components/data-architecture/events'
          : relativeBaseUrl
        
        const healthUrl = `${baseUrl}/health`
        console.log('[EventHub] Checking health at:', healthUrl)
        
        let response = await fetch(healthUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        })
        
        console.log('[EventHub] Health check response:', {
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type'),
          url: response.url,
        })
        
        // Check if response is OK and is JSON
        let contentType = response.headers.get('content-type') || ''
        let isJson = contentType.includes('application/json')
        
        // If we got HTML response (rewrite failed), try direct Container App URL as fallback
        if (!isJson && response.status === 200 && baseUrl === relativeBaseUrl) {
          const text = await response.text()
          if (text.includes('<!doctype') || text.includes('<html')) {
            console.warn('[EventHub] Received HTML from Static Web Apps rewrite, trying direct Container App URL')
            const directHealthUrl = `${directBackendUrl}/health`
            response = await fetch(directHealthUrl, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            })
            contentType = response.headers.get('content-type') || ''
            isJson = contentType.includes('application/json')
            console.log('[EventHub] Direct backend response:', {
              status: response.status,
              contentType,
              isJson,
            })
          }
        }
        
        if (response.ok && isJson) {
          const health = await response.json()
          setEventHubHealth(health)
          const isRunning = health.running || health.connected
          
          // Set connection status and error message
          if (isRunning) {
            setConnectionStatus('connected')
            setConnectionError(null)
            reconnectAttempts = 0 // Reset on success
          } else {
            setConnectionStatus('disconnected')
            // Show helpful error message if available
            if (health.message) {
              setConnectionError(health.message)
            } else if (health.error) {
              setConnectionError(health.error)
            } else if (!health.config_available) {
              setConnectionError('EventHub configuration not found')
            } else {
              setConnectionError(null)
            }
            
            // Auto-reconnect if disconnected and we haven't exceeded max attempts
            if (reconnectAttempts < maxReconnectAttempts) {
              console.log(`[EventHub] Auto-reconnecting (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})...`)
              reconnectAttempts++
              setConnectionStatus('connecting')
              
              try {
                // Try relative URL first, then fallback to direct Container App URL
                let startUrl = `${baseUrl}/start`
                let startResponse = await fetch(startUrl, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                })
                
                // Check content type before parsing JSON
                let startContentType = startResponse.headers.get('content-type') || ''
                let startIsJson = startContentType.includes('application/json')
                
                // If we got HTML response, try direct Container App URL as fallback
                if (!startIsJson && startResponse.status === 200 && baseUrl === relativeBaseUrl) {
                  const startText = await startResponse.text()
                  if (startText.includes('<!doctype') || startText.includes('<html')) {
                    console.warn('[EventHub] Reconnect: Received HTML from Static Web Apps rewrite, trying direct Container App URL')
                    startUrl = `${directBackendUrl}/start`
                    startResponse = await fetch(startUrl, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                    })
                    startContentType = startResponse.headers.get('content-type') || ''
                    startIsJson = startContentType.includes('application/json')
                  }
                }
                
                if (startResponse.ok && startIsJson) {
                  const result = await startResponse.json()
                  if (result.success) {
                    console.log('[EventHub] Successfully reconnected')
                    reconnectAttempts = 0 // Reset on success
                    setConnectionError(null)
                    // Re-check health after a short delay
                    setTimeout(() => checkEventHubHealth(), 2000)
                    return // Exit early to avoid setting status again
                  } else {
                    const errorMsg = result.error || result.message || 'Unknown error'
                    console.warn('[EventHub] Reconnect attempt failed:', errorMsg)
                    setConnectionError(errorMsg)
                    setConnectionStatus('disconnected')
                  }
                } else {
                  // Handle error response
                  let errorMessage = `Failed to start: ${startResponse.status} ${startResponse.statusText}`
                  
                  try {
                    const errorText = await startResponse.text()
                    console.warn('[EventHub] Reconnect request failed:', startResponse.status, errorText)
                    
                    if (startResponse.status === 404) {
                      errorMessage = 'Start endpoint not found (404). The backend may not be deployed yet with the latest changes, or the route may be incorrect.'
                    } else if (startResponse.status === 405) {
                      errorMessage = 'Method not allowed (405). The endpoint exists but POST method is not supported. Please check the backend configuration.'
                    } else if (errorText) {
                      // Check if response is HTML
                      if (errorText.includes('<!doctype') || errorText.includes('<html')) {
                        errorMessage = `Received HTML error page instead of JSON. Endpoint may not exist or routing is incorrect. (Status: ${startResponse.status})`
                      } else {
                        // Try to parse as JSON
                        try {
                          const errorJson = JSON.parse(errorText)
                          errorMessage = errorJson.detail || errorJson.error || errorJson.message || errorMessage
                        } catch {
                          // Not JSON, use text as-is (truncated)
                          errorMessage = `${errorMessage}: ${errorText.substring(0, 200)}`
                        }
                      }
                    }
                  } catch (textError) {
                    errorMessage = `Failed to start: ${startResponse.status} ${startResponse.statusText} (Could not read response)`
                  }
                  
                  setConnectionError(errorMessage)
                  setConnectionStatus('disconnected')
                }
              } catch (reconnectError) {
                const errorMsg = reconnectError instanceof Error ? reconnectError.message : 'Unknown error'
                console.error('[EventHub] Error during reconnect:', reconnectError)
                setConnectionError(`Reconnect error: ${errorMsg}`)
                setConnectionStatus('error')
              }
            } else {
              // Max attempts reached
              if (!connectionError) {
                setConnectionError('Auto-reconnect failed after multiple attempts')
              }
            }
          }
        } else {
          // Handle non-JSON or error responses
          let errorMessage = `Health check failed: ${response.status} ${response.statusText}`
          
          if (!isJson) {
            // Received HTML or other non-JSON response (likely an error page)
            try {
              const text = await response.text()
              console.error('[EventHub] Received non-JSON response:', {
                status: response.status,
                contentType,
                textPreview: text.substring(0, 200),
                responseUrl: response.url,
              })
              
              if (text.includes('<!doctype') || text.includes('<html')) {
                // Check if it's the index.html fallback
                if (text.includes('root') || text.includes('react') || text.includes('vite')) {
                  errorMessage = `Backend endpoint not accessible. The request was rewritten but the backend Container App may not be responding. Please check if the backend is deployed and accessible at: https://bsg-demo-backend.jollydune-6bb98d42.eastus.azurecontainerapps.io (Status: ${response.status})`
                } else {
                  errorMessage = `Health endpoint returned HTML instead of JSON. The endpoint may not exist or the backend may not be properly deployed. (Status: ${response.status})`
                }
              } else {
                errorMessage = `Health endpoint returned non-JSON response: ${text.substring(0, 100)}`
              }
            } catch (textError) {
              errorMessage = `Health check failed: ${response.status} ${response.statusText} (Could not read response)`
            }
          } else {
            // JSON response but status not OK
            try {
              const errorData = await response.json()
              errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage
            } catch (jsonError) {
              // Already have errorMessage from above
            }
          }
          
          setConnectionStatus('error')
          setConnectionError(errorMessage)
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        console.error('[EventHub] Health check error:', error)
        setConnectionStatus('error')
        setConnectionError(`Health check failed: ${errorMsg}`)
      }
    }

    // Check immediately on mount
    checkEventHubHealth()

    // Then check every 10 seconds
    const interval = setInterval(checkEventHubHealth, 10000)

    return () => clearInterval(interval)
  }, [])

  // Handle step execution
  const handleExecuteStep = async (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        await simulation.executeCreateCustomer()
        break
      case 2:
        await simulation.executeOpenAccount()
        break
      case 3:
        await simulation.executeSendPayment()
        break
    }
  }

  // Handle reset
  const handleReset = () => {
    simulation.resetSimulation()
    setKafkaPaused(false)
  }

  // Manual reconnect handler
  const handleManualReconnect = async () => {
    setConnectionStatus('connecting')
    setConnectionError(null)
    
    try {
      const baseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:8000/api/v1/components/data-architecture/events'
        : relativeBaseUrl
      
      let startUrl = `${baseUrl}/start`
      let startResponse = await fetch(startUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      // Check content type before parsing JSON
      let startContentType = startResponse.headers.get('content-type') || ''
      let startIsJson = startContentType.includes('application/json')
      
      // If we got HTML response, try direct Container App URL as fallback
      if (!startIsJson && startResponse.status === 200 && baseUrl === relativeBaseUrl) {
        const startText = await startResponse.text()
        if (startText.includes('<!doctype') || startText.includes('<html')) {
          console.warn('[EventHub] Manual reconnect: Received HTML from Static Web Apps rewrite, trying direct Container App URL')
          startUrl = `${directBackendUrl}/start`
          startResponse = await fetch(startUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          startContentType = startResponse.headers.get('content-type') || ''
          startIsJson = startContentType.includes('application/json')
        }
      }
      
      if (startResponse.ok && startIsJson) {
        const result = await startResponse.json()
        if (result.success) {
          console.log('[EventHub] Manually reconnected successfully')
          setConnectionError(null)
          // Re-check health after a short delay
          setTimeout(() => {
            const healthUrl = `${baseUrl}/health`
            fetch(healthUrl)
              .then(async res => {
                let contentType = res.headers.get('content-type') || ''
                let isJson = contentType.includes('application/json')
                
                // Fallback to direct URL if needed
                if (!isJson && res.status === 200 && baseUrl === relativeBaseUrl) {
                  const text = await res.text()
                  if (text.includes('<!doctype') || text.includes('<html')) {
                    const directHealthUrl = `${directBackendUrl}/health`
                    const fallbackRes = await fetch(directHealthUrl)
                    contentType = fallbackRes.headers.get('content-type') || ''
                    isJson = contentType.includes('application/json')
                    if (fallbackRes.ok && isJson) {
                      const health = await fallbackRes.json()
                      setEventHubHealth(health)
                      setConnectionStatus(health.running || health.connected ? 'connected' : 'disconnected')
                      return
                    }
                  }
                }
                
                if (res.ok && isJson) {
                  const health = await res.json()
                  setEventHubHealth(health)
                  setConnectionStatus(health.running || health.connected ? 'connected' : 'disconnected')
                } else {
                  const text = await res.text()
                  console.error('[EventHub] Health check after reconnect failed:', res.status, text.substring(0, 100))
                  setConnectionStatus('error')
                  setConnectionError(`Health check failed: ${res.status} ${text.includes('<!doctype') ? '(HTML response)' : text.substring(0, 50)}`)
                }
              })
              .catch(err => {
                console.error('[EventHub] Health check after reconnect failed:', err)
                setConnectionStatus('error')
                setConnectionError(`Health check error: ${err.message}`)
              })
          }, 2000)
        } else {
          const errorMsg = result.error || result.message || 'Unknown error'
          setConnectionError(errorMsg)
          setConnectionStatus('disconnected')
        }
      } else {
        // Handle error response
        let errorMessage = `Failed to start: ${startResponse.status} ${startResponse.statusText}`
        
        try {
          const errorText = await startResponse.text()
          
          if (startResponse.status === 404) {
            errorMessage = 'Start endpoint not found (404). The backend may not be deployed yet with the latest changes, or the route may be incorrect.'
          } else if (startResponse.status === 405) {
            errorMessage = 'Method not allowed (405). The endpoint exists but POST method is not supported. Please check the backend configuration.'
          } else if (errorText) {
            // Check if response is HTML
            if (errorText.includes('<!doctype') || errorText.includes('<html')) {
              errorMessage = `Received HTML error page instead of JSON. Endpoint may not exist or routing is incorrect. (Status: ${startResponse.status})`
            } else {
              // Try to parse as JSON
              try {
                const errorJson = JSON.parse(errorText)
                errorMessage = errorJson.detail || errorJson.error || errorJson.message || errorMessage
              } catch {
                // Not JSON, use text as-is (truncated)
                errorMessage = `${errorMessage}: ${errorText.substring(0, 200)}`
              }
            }
          }
        } catch (textError) {
          errorMessage = `Failed to start: ${startResponse.status} ${startResponse.statusText} (Could not read response)`
        }
        
        setConnectionError(errorMessage)
        setConnectionStatus('disconnected')
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      setConnectionError(`Reconnect error: ${errorMsg}`)
      setConnectionStatus('error')
    }
  }

  // API mode toggle disabled - always use real mode
  const handleApiModeToggle = useCallback(() => {
    // Disabled - always uses real mode
    console.warn('Mock mode is disabled - always using real API')
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header - Temenos brand styling */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#003366] to-[#00A3E0] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              Event Driven Data Flow
            </h1>
            <p className="text-slate-600 dark:text-slate-400 ml-13">
              Real-time demo user journey for consuming data events into Data Hub
            </p>
          </div>

          {/* Control buttons */}
          <div className="flex items-center gap-3">
            {/* API Mode Toggle (shown if configured) */}
            {/* API Mode Toggle - DISABLED: Always uses real mode */}
            {false && API_CONFIG.SHOW_API_TOGGLE && (
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700 rounded-lg px-4 py-2 border border-slate-200 dark:border-slate-600">
                <span className="text-sm text-slate-600 dark:text-slate-400">API Mode:</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleApiModeToggle}
                  className="flex items-center gap-2 px-3 py-1 rounded-md font-semibold text-sm transition-all bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700"
                >
                  <Globe className="w-4 h-4" />
                  Real
                </motion.button>
              </div>
            )}

            {/* Reset button - Temenos secondary button style */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReset}
              className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition-all border-2 border-slate-300 dark:border-slate-600 hover:border-[#003366] dark:hover:border-[#00A3E0] font-semibold shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Demo
            </motion.button>
          </div>
        </div>

        {/* Completion banner - Temenos brand styling */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                  Simulation Complete! 🎉
                </h3>
                <p className="text-slate-700 dark:text-slate-300">
                  All transactions executed successfully. Check the API Inspector and Kafka Event
                  Stream for details.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main content grid */}
        <div className="grid lg:grid-cols-[minmax(0,35%)_minmax(0,1fr)] gap-6 pb-8">
          {/* Left column - Stats + User journey steps */}
          <div className="space-y-6 w-full overflow-hidden">
            {/* Stats - aligned with User Journey */}
            <StatsDisplay stats={stats} />
            
            <div className="w-full bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#003366]/10 dark:bg-[#003366]/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-[#003366] dark:text-[#00A3E0]" />
                </div>
                User Journey
              </h2>

              <div className="space-y-4 w-full">
                {/* Step 1: Create Customer */}
                <StepCard
                  stepNumber={1}
                  title={TRANSACTION_STEPS.CREATE_CUSTOMER.title}
                  description={TRANSACTION_STEPS.CREATE_CUSTOMER.description}
                  status={simulation.getCurrentStepStatus('CREATE_CUSTOMER')}
                  disabled={!simulation.isStepAvailable(1)}
                  onExecute={() => handleExecuteStep(1)}
                  resultData={
                    simulation.state.transactions.customerId
                      ? { customerId: simulation.state.transactions.customerId }
                      : undefined
                  }
                  icon={<User className="w-5 h-5 text-[#003366] dark:text-[#00A3E0]" />}
                />

                {/* Step 2: Open Account */}
                <StepCard
                  stepNumber={2}
                  title={TRANSACTION_STEPS.OPEN_ACCOUNT.title}
                  description={TRANSACTION_STEPS.OPEN_ACCOUNT.description}
                  status={simulation.getCurrentStepStatus('OPEN_ACCOUNT')}
                  disabled={!simulation.isStepAvailable(2)}
                  onExecute={() => handleExecuteStep(2)}
                  resultData={
                    simulation.state.transactions.accountId
                      ? { accountId: simulation.state.transactions.accountId }
                      : undefined
                  }
                  icon={<CreditCard className="w-5 h-5 text-[#003366] dark:text-[#00A3E0]" />}
                />

                {/* Step 3: Send Payment */}
                <StepCard
                  stepNumber={3}
                  title={TRANSACTION_STEPS.SEND_PAYMENT.title}
                  description={TRANSACTION_STEPS.SEND_PAYMENT.description}
                  status={simulation.getCurrentStepStatus('SEND_PAYMENT')}
                  disabled={!simulation.isStepAvailable(3)}
                  onExecute={() => handleExecuteStep(3)}
                  resultData={
                    simulation.state.transactions.paymentId
                      ? { paymentId: simulation.state.transactions.paymentId }
                      : undefined
                  }
                  icon={<Send className="w-5 h-5 text-[#003366] dark:text-[#00A3E0]" />}
                />
              </div>
            </div>
          </div>

          {/* Right column - Logs and events */}
          <div className="space-y-6">
            {/* API Inspector */}
            <div className="h-[500px]">
              <ApiInspector
                logs={simulation.state.apiLogs}
                isLoading={simulation.state.stage !== 'IDLE' && simulation.state.stage !== 'FINISHED'}
                onClear={simulation.clearApiLogs}
              />
            </div>

            {/* Kafka Event Stream */}
            <div className="h-[500px]">
              {/* Event Source Indicator */}
              <div className="mb-2">
                <EventSourceIndicator
                  mode={apiMode}
                  eventCount={simulation.state.kafkaEvents.length}
                  connectionStatus={connectionStatus}
                  eventHubHealth={eventHubHealth || undefined}
                  connectionError={connectionError}
                  onManualReconnect={handleManualReconnect}
                />
              </div>
              <KafkaEventStream
                events={simulation.state.kafkaEvents}
                onClear={simulation.clearKafkaEvents}
                onPause={() => setKafkaPaused(!kafkaPaused)}
                isPaused={kafkaPaused}
              />
            </div>
          </div>
        </div>

        {/* Database Records Tile - Full width below grid */}
        <div className="mt-16">
          <DatabaseRecordsTile eventCount={simulation.state.kafkaEvents.length} />
        </div>

        {/* Current stage indicator (for debugging) */}
        {simulation.state.stage !== 'IDLE' && simulation.state.stage !== 'FINISHED' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed bottom-6 right-6 bg-[#003366]/10 dark:bg-[#00A3E0]/10 border border-[#003366]/30 dark:border-[#00A3E0]/30 rounded-lg px-4 py-2 backdrop-blur-sm shadow-lg"
          >
            <div className="text-sm text-[#003366] dark:text-[#00A3E0] font-mono font-medium">
              Stage: {simulation.state.stage}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default TemenosTransactionSimulator
