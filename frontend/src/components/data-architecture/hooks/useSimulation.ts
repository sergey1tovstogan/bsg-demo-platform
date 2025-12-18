// useSimulation - Main transaction orchestration hook
import { useCallback, useEffect, useRef } from 'react'
import { useSimulationState } from './useSimulationState'
import { apiService } from '../services/apiServiceAdapter'
import { mockDataGenerator } from '../services/mockDataGenerator'
import { eventStoreService, type EventStoreConnectionStatus } from '../services/eventStoreService'
import {
  SimulationStage,
  type TransactionType,
  type CustomerPayload,
  type AccountPayload,
  type PaymentPayload,
  type ApiLog,
  type AnimationTrigger,
  type KafkaEvent
} from '../demo/types'
import {
  API_ENDPOINTS,
  ANIMATION_CONFIG,
  DEBUG_CONFIG,
  EVENT_STORE_CONFIG
} from '../config/simulation.config'

/**
 * Poll for real events from Event Store API after a transaction
 */
async function pollRealEventsAfterTransaction(
  transactionStartTime: number,
  customerId?: string,
  _accountId?: string // Prefixed with _ to indicate intentionally unused
): Promise<KafkaEvent[]> {
  if (!EVENT_STORE_CONFIG.ENABLE_REAL_EVENTS) {
    return []
  }

  try {
    // Wait a bit for events to propagate to Event Hub
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Fetch recent events filtered by customer ID
    console.log('[DEBUG] Fetching events from Event Store for customer:', customerId)
    const result = await eventStoreService.fetchRecentEvents(2, 50, customerId)

    console.log('[DEBUG] Event Store response:', {
      success: result.success,
      total: result.total,
      eventsCount: result.events?.length || 0,
      error: result.error,
      source: result.source
    })

    if (!result.success) {
      console.error('[DEBUG] Event Store API error:', result.error)
      return []
    }

    if (result.events.length === 0) {
      console.warn('[DEBUG] Event Store returned 0 events. Check backend Event Hub consumer status.')
      return []
    }

    // Filter by customer ID and timestamp
    const transactionTime = transactionStartTime
    const filteredEvents = result.events.filter((event) => {
      // Filter by customer ID - match entityid field in payload
      const eventCustomerId = event.payload?.entityid
      const matchesCustomer = customerId
        ? eventCustomerId && String(eventCustomerId) === String(customerId)
        : true
      // Event must be after transaction started and match customer ID
      return matchesCustomer && event.timestamp >= transactionTime
    })

    console.log('[DEBUG] Filtered events (by customer ID and timestamp):', {
      totalReceived: result.events.length,
      afterTransaction: filteredEvents.length,
      customerId: customerId,
      transactionTime: new Date(transactionTime).toISOString()
    })

    return filteredEvents
  } catch (error) {
    console.error('[useSimulation] Error polling real events:', error)
    return []
  }
}

/**
 * Generate unique API log ID
 */
const generateLogId = (): string => {
  return `LOG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * useSimulation Hook
 * Main orchestration hook for transaction execution
 */
export const useSimulation = () => {
  const simulationState = useSimulationState()
  
  // Event Store state
  const eventStoreEnabled = useRef(false)
  const eventStoreUnsubscribe = useRef<(() => void) | null>(null)

  /**
   * Log debug messages if enabled
   */
  const debugLog = useCallback((message: string, data?: any) => {
    if (DEBUG_CONFIG.ENABLE_CONSOLE_LOGS) {
      console.log(`[Simulation] ${message}`, data || '')
    }
  }, [])

  /**
   * Create animation trigger for cross-tab communication
   */
  const createAnimationTrigger = useCallback(
    (type: 'business' | 'data', transactionType: TransactionType, eventId: string): AnimationTrigger => {
      return {
        id: `ANIM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        timestamp: Date.now(),
        metadata: {
          transactionType,
          eventId,
          description: `${type} event from ${transactionType}`
        }
      }
    },
    []
  )

  /**
   * Execute Create Customer transaction
   */
  const executeCreateCustomer = useCallback(async () => {
    debugLog('Starting CREATE_CUSTOMER transaction')

    // Set loading state
    simulationState.setStepStatus('CREATE_CUSTOMER', 'loading')
    simulationState.setStage(SimulationStage.USER_TO_API)

    // Generate sample customer payload
    const payload: CustomerPayload = mockDataGenerator.generateSampleCustomerPayload()

    const startTime = Date.now()

    try {
      // Simulate API call
      simulationState.setStage(SimulationStage.PROCESSING)
      const response = await apiService.createCustomer(payload)
      const duration = Date.now() - startTime

      // Extract status code from error message if available (format: "API Error (400): ...")
      let statusCode = response.success ? 201 : 400
      if (!response.success && response.error) {
        const statusMatch = response.error.match(/API Error \((\d+)\)/)
        if (statusMatch) {
          statusCode = parseInt(statusMatch[1], 10)
        }
      }

      // Create API log
      const apiLog: ApiLog = {
        id: generateLogId(),
        timestamp: startTime,
        type: 'CREATE_CUSTOMER',
        endpoint: API_ENDPOINTS.CREATE_CUSTOMER,
        method: 'POST',
        request: payload,
        response: response.success
          ? response.data
          : {
              data: response.data,
              error: response.error,
              fullResponse: response
            },
        duration,
        status: response.success ? 'success' : 'error',
        statusCode
      }

      simulationState.addApiLog(apiLog)

      if (response.success) {
        debugLog('CREATE_CUSTOMER succeeded', response.data)

        // Store customer ID and full customer data
        const customerId = response.data.customerId
        simulationState.setTransactionId('customerId', customerId)
        simulationState.setCustomerData(response.data)

        // Check if we're in real API mode
        const isRealMode = apiService.getServiceType() === 'real'

        // Add Kafka events
        if (response.events && response.events.length > 0) {
          simulationState.setStage(SimulationStage.API_TO_KAFKA)
          await new Promise((resolve) => setTimeout(resolve, ANIMATION_CONFIG.API_TO_KAFKA_DURATION))

          simulationState.setStage(SimulationStage.EMITTING)
          simulationState.addKafkaEvents(response.events)

          // Create animation triggers for cross-tab
          response.events.forEach((event) => {
            const trigger = createAnimationTrigger(event.type, 'CREATE_CUSTOMER', event.id)
            simulationState.addAnimationTrigger(trigger)
          })

          await new Promise((resolve) => setTimeout(resolve, ANIMATION_CONFIG.KAFKA_EMISSION_DURATION))
        }

        // If in real mode, poll for actual events from Event Store API
        if (isRealMode && EVENT_STORE_CONFIG.ENABLE_REAL_EVENTS) {
          debugLog('Polling for real events from Event Store API (FILTERING DISABLED FOR DEBUGGING)')
          const realEvents = await pollRealEventsAfterTransaction(startTime) // Removed customerId parameter
          
          debugLog(`Event Store API returned ${realEvents.length} events`)
          console.log('[DEBUG] Real events from Event Store:', realEvents)
          
          if (realEvents.length > 0) {
            debugLog(`Found ${realEvents.length} real events from Event Store`)
            simulationState.setStage(SimulationStage.API_TO_KAFKA)
            await new Promise((resolve) => setTimeout(resolve, ANIMATION_CONFIG.API_TO_KAFKA_DURATION))

            simulationState.setStage(SimulationStage.EMITTING)
            simulationState.addKafkaEvents(realEvents)

            // Create animation triggers for real events
            realEvents.forEach((event) => {
              const trigger = createAnimationTrigger(event.type, 'CREATE_CUSTOMER', event.id)
              simulationState.addAnimationTrigger(trigger)
            })

            await new Promise((resolve) => setTimeout(resolve, ANIMATION_CONFIG.KAFKA_EMISSION_DURATION))
          } else {
            debugLog('No real events found from Event Store API - check backend logs and Event Hub consumer status')
            console.warn('[DEBUG] No events received. Check:', {
              backendHealth: 'http://localhost:8000/api/v1/components/data-architecture/events/health',
              allEvents: 'http://localhost:8000/api/v1/components/data-architecture/events?limit=10',
              recentEvents: 'http://localhost:8000/api/v1/components/data-architecture/events/recent?minutes=5&limit=10'
            })
          }
        }

        // Set success state
        simulationState.setStepStatus('CREATE_CUSTOMER', 'success')
        simulationState.setStage(SimulationStage.FINISHED)
        simulationState.advanceStep()

        debugLog('CREATE_CUSTOMER completed successfully')
      } else {
        debugLog('CREATE_CUSTOMER failed', response.error)
        simulationState.setStepStatus('CREATE_CUSTOMER', 'error')
        simulationState.setStage(SimulationStage.IDLE)
      }

      return response
    } catch (error) {
      debugLog('CREATE_CUSTOMER error', error)
      const duration = Date.now() - startTime

      // Extract status code from error message if available (format: "API Error (400): ...")
      let statusCode = 500
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const statusMatch = errorMessage.match(/API Error \((\d+)\)/)
      if (statusMatch) {
        statusCode = parseInt(statusMatch[1], 10)
      }

      // Create error log
      const apiLog: ApiLog = {
        id: generateLogId(),
        timestamp: startTime,
        type: 'CREATE_CUSTOMER',
        endpoint: API_ENDPOINTS.CREATE_CUSTOMER,
        method: 'POST',
        request: payload,
        response: { error: errorMessage },
        duration,
        status: 'error',
        statusCode
      }

      simulationState.addApiLog(apiLog)
      simulationState.setStepStatus('CREATE_CUSTOMER', 'error')
      simulationState.setStage(SimulationStage.IDLE)

      return {
        success: false,
        data: {} as any,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }, [simulationState, debugLog, createAnimationTrigger])

  /**
   * Execute Open Account transaction
   */
  const executeOpenAccount = useCallback(async () => {
    debugLog('Starting OPEN_ACCOUNT transaction')

    // Check prerequisites
    const customerId = simulationState.getTransactionId('customerId')
    const customerData = simulationState.getCustomerData()

    if (!customerId) {
      debugLog('OPEN_ACCOUNT failed: No customer ID available')
      return {
        success: false,
        data: {} as any,
        error: 'Customer must be created first'
      }
    }

    if (!customerData) {
      debugLog('OPEN_ACCOUNT failed: No customer data available')
      return {
        success: false,
        data: {} as any,
        error: 'Customer data not found. Please create a customer first.'
      }
    }

    // Set loading state
    simulationState.setStepStatus('OPEN_ACCOUNT', 'loading')
    simulationState.setStage(SimulationStage.USER_TO_API)

    // Generate account payload with customer data
    const payload: AccountPayload = {
      ...mockDataGenerator.generateSampleAccountPayload(customerId),
      customerData: customerData
    }

    const startTime = Date.now()

    try {
      // Simulate API call
      simulationState.setStage(SimulationStage.PROCESSING)
      const response = await apiService.openAccount(payload)
      const duration = Date.now() - startTime

      // Create API log
      const apiLog: ApiLog = {
        id: generateLogId(),
        timestamp: startTime,
        type: 'OPEN_ACCOUNT',
        endpoint: API_ENDPOINTS.OPEN_ACCOUNT,
        method: 'POST',
        request: payload,
        response: response.success
          ? response.data
          : {
              data: response.data,
              error: response.error,
              fullResponse: response
            },
        duration,
        status: response.success ? 'success' : 'error',
        statusCode: response.success ? 201 : 400
      }

      simulationState.addApiLog(apiLog)

      if (response.success) {
        debugLog('OPEN_ACCOUNT succeeded', response.data)

        // Store account ID
        const accountId = response.data.accountId
        const customerId = simulationState.getTransactionId('customerId')
        simulationState.setTransactionId('accountId', accountId)

        // Check if we're in real API mode
        const isRealMode = apiService.getServiceType() === 'real'

        // Add Kafka events
        if (response.events && response.events.length > 0) {
          simulationState.setStage(SimulationStage.API_TO_KAFKA)
          await new Promise((resolve) => setTimeout(resolve, ANIMATION_CONFIG.API_TO_KAFKA_DURATION))

          simulationState.setStage(SimulationStage.EMITTING)
          simulationState.addKafkaEvents(response.events)

          // Create animation triggers for cross-tab
          response.events.forEach((event) => {
            const trigger = createAnimationTrigger(event.type, 'OPEN_ACCOUNT', event.id)
            simulationState.addAnimationTrigger(trigger)
          })

          await new Promise((resolve) => setTimeout(resolve, ANIMATION_CONFIG.KAFKA_EMISSION_DURATION))
        }

        // If in real mode, poll for actual events from Event Store API
        if (isRealMode && EVENT_STORE_CONFIG.ENABLE_REAL_EVENTS) {
          debugLog('Polling for real events from Event Store API')
          const realEvents = await pollRealEventsAfterTransaction(startTime, customerId, accountId)
          
          if (realEvents.length > 0) {
            debugLog(`Found ${realEvents.length} real events from Event Store`)
            simulationState.setStage(SimulationStage.API_TO_KAFKA)
            await new Promise((resolve) => setTimeout(resolve, ANIMATION_CONFIG.API_TO_KAFKA_DURATION))

            simulationState.setStage(SimulationStage.EMITTING)
            simulationState.addKafkaEvents(realEvents)

            // Create animation triggers for real events
            realEvents.forEach((event) => {
              const trigger = createAnimationTrigger(event.type, 'OPEN_ACCOUNT', event.id)
              simulationState.addAnimationTrigger(trigger)
            })

            await new Promise((resolve) => setTimeout(resolve, ANIMATION_CONFIG.KAFKA_EMISSION_DURATION))
          } else {
            debugLog('No real events found from Event Store API')
          }
        }

        // Set success state
        simulationState.setStepStatus('OPEN_ACCOUNT', 'success')
        simulationState.setStage(SimulationStage.FINISHED)
        simulationState.advanceStep()

        debugLog('OPEN_ACCOUNT completed successfully')
      } else {
        debugLog('OPEN_ACCOUNT failed', response.error)
        simulationState.setStepStatus('OPEN_ACCOUNT', 'error')
        simulationState.setStage(SimulationStage.IDLE)
      }

      return response
    } catch (error) {
      debugLog('OPEN_ACCOUNT error', error)
      const duration = Date.now() - startTime

      // Create error log
      const apiLog: ApiLog = {
        id: generateLogId(),
        timestamp: startTime,
        type: 'OPEN_ACCOUNT',
        endpoint: API_ENDPOINTS.OPEN_ACCOUNT,
        method: 'POST',
        request: payload,
        response: { error: error instanceof Error ? error.message : 'Unknown error' },
        duration,
        status: 'error',
        statusCode: 500
      }

      simulationState.addApiLog(apiLog)
      simulationState.setStepStatus('OPEN_ACCOUNT', 'error')
      simulationState.setStage(SimulationStage.IDLE)

      return {
        success: false,
        data: {} as any,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }, [simulationState, debugLog, createAnimationTrigger])

  /**
   * Execute Send Payment transaction
   */
  const executeSendPayment = useCallback(async () => {
    debugLog('Starting SEND_PAYMENT transaction')

    // Check prerequisites
    const accountId = simulationState.getTransactionId('accountId')
    if (!accountId) {
      debugLog('SEND_PAYMENT failed: No account ID available')
      return {
        success: false,
        data: {} as any,
        error: 'Account must be opened first'
      }
    }

    // Set loading state
    simulationState.setStepStatus('SEND_PAYMENT', 'loading')
    simulationState.setStage(SimulationStage.USER_TO_API)

    // Generate payment payload
    const payload: PaymentPayload = mockDataGenerator.generateSamplePaymentPayload(accountId)

    const startTime = Date.now()

    try {
      // Simulate API call
      simulationState.setStage(SimulationStage.PROCESSING)
      const response = await apiService.sendPayment(payload)
      const duration = Date.now() - startTime

      // Create API log
      const apiLog: ApiLog = {
        id: generateLogId(),
        timestamp: startTime,
        type: 'SEND_PAYMENT',
        endpoint: API_ENDPOINTS.SEND_PAYMENT,
        method: 'POST',
        request: payload,
        response: response.success
          ? response.data
          : {
              data: response.data,
              error: response.error,
              fullResponse: response
            },
        duration,
        status: response.success ? 'success' : 'error',
        statusCode: response.success ? 201 : 400
      }

      simulationState.addApiLog(apiLog)

      if (response.success) {
        debugLog('SEND_PAYMENT succeeded', response.data)

        // Store payment ID
        const paymentId = response.data.paymentId
        const accountId = simulationState.getTransactionId('accountId')
        const customerId = simulationState.getTransactionId('customerId')
        simulationState.setTransactionId('paymentId', paymentId)

        // Check if we're in real API mode
        const isRealMode = apiService.getServiceType() === 'real'

        // Add Kafka events
        if (response.events && response.events.length > 0) {
          simulationState.setStage(SimulationStage.API_TO_KAFKA)
          await new Promise((resolve) => setTimeout(resolve, ANIMATION_CONFIG.API_TO_KAFKA_DURATION))

          simulationState.setStage(SimulationStage.EMITTING)
          simulationState.addKafkaEvents(response.events)

          // Create animation triggers for cross-tab
          response.events.forEach((event) => {
            const trigger = createAnimationTrigger(event.type, 'SEND_PAYMENT', event.id)
            simulationState.addAnimationTrigger(trigger)
          })

          await new Promise((resolve) => setTimeout(resolve, ANIMATION_CONFIG.KAFKA_EMISSION_DURATION))
        }

        // If in real mode, poll for actual events from Event Store API
        if (isRealMode && EVENT_STORE_CONFIG.ENABLE_REAL_EVENTS) {
          debugLog('Polling for real events from Event Store API')
          const realEvents = await pollRealEventsAfterTransaction(startTime, customerId, accountId)
          
          if (realEvents.length > 0) {
            debugLog(`Found ${realEvents.length} real events from Event Store`)
            simulationState.setStage(SimulationStage.API_TO_KAFKA)
            await new Promise((resolve) => setTimeout(resolve, ANIMATION_CONFIG.API_TO_KAFKA_DURATION))

            simulationState.setStage(SimulationStage.EMITTING)
            simulationState.addKafkaEvents(realEvents)

            // Create animation triggers for real events
            realEvents.forEach((event) => {
              const trigger = createAnimationTrigger(event.type, 'SEND_PAYMENT', event.id)
              simulationState.addAnimationTrigger(trigger)
            })

            await new Promise((resolve) => setTimeout(resolve, ANIMATION_CONFIG.KAFKA_EMISSION_DURATION))
          } else {
            debugLog('No real events found from Event Store API')
          }
        }

        // Set success state
        simulationState.setStepStatus('SEND_PAYMENT', 'success')
        simulationState.setStage(SimulationStage.FINISHED)

        debugLog('SEND_PAYMENT completed successfully')
      } else {
        debugLog('SEND_PAYMENT failed', response.error)
        simulationState.setStepStatus('SEND_PAYMENT', 'error')
        simulationState.setStage(SimulationStage.IDLE)
      }

      return response
    } catch (error) {
      debugLog('SEND_PAYMENT error', error)
      const duration = Date.now() - startTime

      // Create error log
      const apiLog: ApiLog = {
        id: generateLogId(),
        timestamp: startTime,
        type: 'SEND_PAYMENT',
        endpoint: API_ENDPOINTS.SEND_PAYMENT,
        method: 'POST',
        request: payload,
        response: { error: error instanceof Error ? error.message : 'Unknown error' },
        duration,
        status: 'error',
        statusCode: 500
      }

      simulationState.addApiLog(apiLog)
      simulationState.setStepStatus('SEND_PAYMENT', 'error')
      simulationState.setStage(SimulationStage.IDLE)

      return {
        success: false,
        data: {} as any,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }, [simulationState, debugLog, createAnimationTrigger])

  /**
   * Execute transaction by type
   */
  const executeTransaction = useCallback(
    async (type: TransactionType) => {
      switch (type) {
        case 'CREATE_CUSTOMER':
          return executeCreateCustomer()
        case 'OPEN_ACCOUNT':
          return executeOpenAccount()
        case 'SEND_PAYMENT':
          return executeSendPayment()
      }
    },
    [executeCreateCustomer, executeOpenAccount, executeSendPayment]
  )

  /**
   * Enable Event Store integration (for real API mode)
   * Starts polling for real events from Azure Event Hub
   */
  const enableEventStore = useCallback(() => {
    if (eventStoreEnabled.current) {
      debugLog('Event Store already enabled')
      return
    }

    debugLog('Enabling Event Store integration')
    eventStoreEnabled.current = true

    // Subscribe to events from Event Store
    eventStoreUnsubscribe.current = eventStoreService.onEvents((newEvents: KafkaEvent[]) => {
      debugLog(`Received ${newEvents.length} events from Event Store`)
      // Add events to simulation state
      simulationState.addKafkaEvents(newEvents)
    })

    // Start polling
    eventStoreService.startPolling(EVENT_STORE_CONFIG.POLLING_INTERVAL)
  }, [simulationState, debugLog])

  /**
   * Disable Event Store integration
   * Stops polling and cleans up subscriptions
   */
  const disableEventStore = useCallback(() => {
    if (!eventStoreEnabled.current) {
      debugLog('Event Store already disabled')
      return
    }

    debugLog('Disabling Event Store integration')
    eventStoreEnabled.current = false

    // Stop polling
    eventStoreService.stopPolling()

    // Unsubscribe from events
    if (eventStoreUnsubscribe.current) {
      eventStoreUnsubscribe.current()
      eventStoreUnsubscribe.current = null
    }
  }, [debugLog])

  /**
   * Check if Event Store is enabled
   */
  const isEventStoreEnabled = useCallback(() => {
    return eventStoreEnabled.current
  }, [])

  /**
   * Fetch events manually from Event Store
   */
  const fetchRealEvents = useCallback(async () => {
    debugLog('Fetching real events from Event Store')
    const result = await eventStoreService.fetchRecentEvents(
      EVENT_STORE_CONFIG.DEFAULT_TIME_RANGE_MINUTES,
      EVENT_STORE_CONFIG.MAX_EVENTS_PER_REQUEST
    )
    if (result.success && result.events.length > 0) {
      simulationState.addKafkaEvents(result.events)
    }
    return result
  }, [simulationState, debugLog])

  /**
   * Get Event Store connection status
   */
  const getEventStoreStatus = useCallback((): EventStoreConnectionStatus => {
    return eventStoreService.getState().connectionStatus
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventStoreEnabled.current) {
        eventStoreService.stopPolling()
        if (eventStoreUnsubscribe.current) {
          eventStoreUnsubscribe.current()
        }
      }
    }
  }, [])

  return {
    ...simulationState,
    executeTransaction,
    executeCreateCustomer,
    executeOpenAccount,
    executeSendPayment,
    // Event Store integration
    enableEventStore,
    disableEventStore,
    isEventStoreEnabled,
    fetchRealEvents,
    getEventStoreStatus
  }
}

export default useSimulation
