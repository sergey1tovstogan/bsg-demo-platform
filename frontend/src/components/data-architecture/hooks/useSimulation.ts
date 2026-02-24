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
 * Synthesize business events from data events.
 * Real Event Hub often receives only data events (subject="dataevent"); we create
 * corresponding business events so both types are displayed in the Kafka Event Stream.
 * Skips synthesis when a business event already exists for the same transaction/entity.
 */
function synthesizeBusinessEventsFromDataEvents(events: KafkaEvent[]): KafkaEvent[] {
  const existingBusinessKeys = new Set<string>()
  for (const evt of events) {
    if (evt.type === 'business' && evt.transactionType) {
      const entityId = evt.payload?.entityid ? String(evt.payload.entityid) : evt.id
      existingBusinessKeys.add(`${evt.transactionType}:${entityId}`)
    }
  }

  const result: KafkaEvent[] = []
  for (const evt of events) {
    result.push(evt)

    if (evt.type !== 'data' || !evt.transactionType) continue

    const entityId = evt.payload?.entityid ? String(evt.payload.entityid) : evt.id
    const businessKey = `${evt.transactionType}:${entityId}`
    if (existingBusinessKeys.has(businessKey)) continue
    existingBusinessKeys.add(businessKey)

    const businessTopic = evt.transactionType === 'CREATE_CUSTOMER'
      ? 'temenos.party.customers.created'
      : evt.transactionType === 'OPEN_ACCOUNT'
        ? 'temenos.holdings.accounts.opened'
        : evt.transactionType === 'SEND_PAYMENT'
          ? 'temenos.order.payments.completed'
          : evt.topic.replace('temenos.data.', 'temenos.')

    const synth: KafkaEvent = {
      id: `${evt.id}_business_synth`,
      timestamp: evt.timestamp - 50,
      type: 'business',
      topic: businessTopic,
      partition: evt.partition,
      offset: evt.offset - 1,
      payload: { ...evt.payload, subject: 'businessevent' },
      transactionType: evt.transactionType
    }
    result.push(synth)
  }

  return result.sort((a, b) => a.timestamp - b.timestamp)
}

/**
 * Poll for real events from Event Store API after a transaction
 * 
 * Filtering rules:
 * - Classification: subject="dataevent" for data events, subject="businessevent" for business events
 * - Entity matching: Based on transaction type:
 *   - CREATE_CUSTOMER: entityid = CustomerID
 *   - OPEN_ACCOUNT: entityid = AccountID
 *   - SEND_PAYMENT: entityid = PaymentID or AccountID
 * 
 * Note: Event timestamps from Temenos may be BEFORE the API response returns,
 * so we use a time window rather than strict "after transaction" filtering.
 */
async function pollRealEventsAfterTransaction(
  transactionStartTime: number,
  entityId?: string  // The entity ID to match (CustomerID, AccountID, etc.)
): Promise<KafkaEvent[]> {
  if (!EVENT_STORE_CONFIG.ENABLE_REAL_EVENTS) {
    return []
  }

  try {
    // Wait a bit for events to propagate to Event Hub
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Fetch recent events without filters - we'll filter client-side by entityid
    console.log('[DEBUG] Fetching all recent events from Event Store')
    const result = await eventStoreService.fetchRecentEvents(2, 50)

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

    // Filter events by entityid and time window
    // Events may have timestamps slightly BEFORE the frontend transaction start time
    const timeWindowMs = 60000 // 60 second window before transaction
    const minTime = transactionStartTime - timeWindowMs
    
    const filteredEvents = result.events.filter((event: any) => {
      const eventEntityId = event.payload?.entityid ? String(event.payload.entityid) : ''
      
      // Match by entityId (dynamically set based on transaction type)
      const matchesEntity = entityId ? eventEntityId === String(entityId) : true
      
      // Event must be within the time window
      const withinTimeWindow = event.timestamp >= minTime
      
      return matchesEntity && withinTimeWindow
    })

    console.log('[DEBUG] Filtered events by entityId:', {
      totalReceived: result.events.length,
      filtered: filteredEvents.length,
      entityId,
      transactionTime: new Date(transactionStartTime).toISOString(),
      timeWindowStart: new Date(minTime).toISOString(),
      allEventEntityIds: result.events.map((e: any) => e.payload?.entityid)
    })

    // Synthesize business events for data events - real Event Hub often only receives data events,
    // so we create corresponding business events so both are displayed in the Kafka Event Stream
    const withBusinessEvents = synthesizeBusinessEventsFromDataEvents(filteredEvents)

    return withBusinessEvents
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
 * Create synthetic Kafka events for display when real/mock events are unavailable.
 * Used as fallback so users always see events after a successful API call.
 */
function createSyntheticEventsForCreateCustomer(customerId: string, customerData?: { name?: string }): KafkaEvent[] {
  const now = Date.now()
  const name = customerData?.name || `Customer ${customerId}`
  return [
    {
      id: `synth_business_${now}_${Math.random().toString(36).slice(2, 9)}`,
      timestamp: now,
      type: 'business',
      topic: 'temenos.party.customers.created',
      partition: 0,
      offset: Math.floor(Math.random() * 1000000),
      payload: { entityid: customerId, entityname: 'Customer Create Customer', customerId, name, eventType: 'CUSTOMER_CREATED' },
      transactionType: 'CREATE_CUSTOMER'
    },
    {
      id: `synth_data_${now}_${Math.random().toString(36).slice(2, 9)}`,
      timestamp: now + 30,
      type: 'data',
      topic: 'temenos.data.customers.sync',
      partition: 0,
      offset: Math.floor(Math.random() * 1000000) + 1,
      payload: { entityid: customerId, entityname: 'Customer Create Customer', customerId, syncTarget: 'DATA_HUB', eventType: 'CUSTOMER_DATA_SYNCED' },
      transactionType: 'CREATE_CUSTOMER'
    }
  ]
}

function createSyntheticEventsForOpenAccount(accountId: string, customerId: string): KafkaEvent[] {
  const now = Date.now()
  return [
    {
      id: `synth_business_${now}_${Math.random().toString(36).slice(2, 9)}`,
      timestamp: now,
      type: 'business',
      topic: 'temenos.holdings.accounts.opened',
      partition: 0,
      offset: Math.floor(Math.random() * 1000000),
      payload: { entityid: accountId, entityname: 'Account Open Account', accountId, customerId, eventType: 'ACCOUNT_OPENED' },
      transactionType: 'OPEN_ACCOUNT'
    },
    {
      id: `synth_data_${now}_${Math.random().toString(36).slice(2, 9)}`,
      timestamp: now + 30,
      type: 'data',
      topic: 'temenos.data.accounts.sync',
      partition: 0,
      offset: Math.floor(Math.random() * 1000000) + 1,
      payload: { entityid: accountId, entityname: 'Account Open Account', accountId, customerId, syncTarget: 'DATA_HUB', eventType: 'ACCOUNT_DATA_SYNCED' },
      transactionType: 'OPEN_ACCOUNT'
    }
  ]
}

function createSyntheticEventsForSendPayment(paymentId: string, fromAccount?: string, toAccount?: string): KafkaEvent[] {
  const now = Date.now()
  return [
    {
      id: `synth_business_${now}_${Math.random().toString(36).slice(2, 9)}`,
      timestamp: now,
      type: 'business',
      topic: 'temenos.order.payments.completed',
      partition: 0,
      offset: Math.floor(Math.random() * 1000000),
      payload: { entityid: paymentId, entityname: 'Payment', paymentId, fromAccount, toAccount, eventType: 'PAYMENT_COMPLETED' },
      transactionType: 'SEND_PAYMENT'
    },
    {
      id: `synth_data_${now}_${Math.random().toString(36).slice(2, 9)}`,
      timestamp: now + 30,
      type: 'data',
      topic: 'temenos.data.payments.sync',
      partition: 0,
      offset: Math.floor(Math.random() * 1000000) + 1,
      payload: { entityid: paymentId, entityname: 'Payment', paymentId, syncTarget: 'DATA_HUB', eventType: 'PAYMENT_DATA_SYNCED' },
      transactionType: 'SEND_PAYMENT'
    }
  ]
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
    
    // Clear events and set transaction start time to show only new events
    simulationState.setTransactionStartTime(startTime)
    
    // Restart polling with transaction start time to only fetch new events
    if (eventStoreEnabled.current) {
      eventStoreService.stopPolling()
      eventStoreService.startPolling(EVENT_STORE_CONFIG.POLLING_INTERVAL, startTime)
    }

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
        let eventsAdded = false

        // Add Kafka events from API response (mock mode returns these)
        if (response.events && response.events.length > 0) {
          simulationState.setStage(SimulationStage.API_TO_KAFKA)
          await new Promise((resolve) => setTimeout(resolve, ANIMATION_CONFIG.API_TO_KAFKA_DURATION))

          simulationState.setStage(SimulationStage.EMITTING)
          simulationState.addKafkaEvents(response.events)
          eventsAdded = true

          // Create animation triggers for cross-tab
          response.events.forEach((event: any) => {
            const trigger = createAnimationTrigger(event.type, 'CREATE_CUSTOMER', event.id)
            simulationState.addAnimationTrigger(trigger)
          })

          await new Promise((resolve) => setTimeout(resolve, ANIMATION_CONFIG.KAFKA_EMISSION_DURATION))
        }

        // If in real mode, poll for actual events from Event Store API
        // For CREATE_CUSTOMER, filter by customerId (entityid = CustomerID)
        if (!eventsAdded && isRealMode && EVENT_STORE_CONFIG.ENABLE_REAL_EVENTS) {
          debugLog('Polling for real events from Event Store API for customer: ' + customerId)
          const realEvents = await pollRealEventsAfterTransaction(startTime, customerId)
          
          debugLog(`Event Store API returned ${realEvents.length} events`)
          
          if (realEvents.length > 0) {
            debugLog(`Found ${realEvents.length} real events from Event Store`)
            simulationState.setStage(SimulationStage.API_TO_KAFKA)
            await new Promise((resolve) => setTimeout(resolve, ANIMATION_CONFIG.API_TO_KAFKA_DURATION))

            simulationState.setStage(SimulationStage.EMITTING)
            simulationState.addKafkaEvents(realEvents)
            eventsAdded = true

            // Create animation triggers for real events
            realEvents.forEach((event) => {
              const trigger = createAnimationTrigger(event.type, 'CREATE_CUSTOMER', event.id)
              simulationState.addAnimationTrigger(trigger)
            })

            await new Promise((resolve) => setTimeout(resolve, ANIMATION_CONFIG.KAFKA_EMISSION_DURATION))
          }
        }

        // Fallback: when no events from API or Event Store, show synthetic events so user sees the flow
        if (!eventsAdded) {
          simulationState.setStage(SimulationStage.API_TO_KAFKA)
          await new Promise((resolve) => setTimeout(resolve, ANIMATION_CONFIG.API_TO_KAFKA_DURATION))

          simulationState.setStage(SimulationStage.EMITTING)
          const syntheticEvents = createSyntheticEventsForCreateCustomer(customerId, response.data)
          simulationState.addKafkaEvents(syntheticEvents)

          syntheticEvents.forEach((event) => {
            const trigger = createAnimationTrigger(event.type, 'CREATE_CUSTOMER', event.id)
            simulationState.addAnimationTrigger(trigger)
          })

          await new Promise((resolve) => setTimeout(resolve, ANIMATION_CONFIG.KAFKA_EMISSION_DURATION))
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

    // Build account payload with real customer data only
    const payload: AccountPayload = {
      customerId: customerId,
      customerData: customerData
    }

    const startTime = Date.now()
    
    // Clear events and set transaction start time to show only new events
    simulationState.setTransactionStartTime(startTime)
    
    // Restart polling with transaction start time to only fetch new events
    if (eventStoreEnabled.current) {
      eventStoreService.stopPolling()
      eventStoreService.startPolling(EVENT_STORE_CONFIG.POLLING_INTERVAL, startTime)
    }

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
        simulationState.setTransactionId('accountId', accountId)

        // Check if we're in real API mode
        const isRealMode = apiService.getServiceType() === 'real'
        let eventsAdded = false

        // Add Kafka events from API response (mock mode returns these)
        if (response.events && response.events.length > 0) {
          simulationState.setStage(SimulationStage.API_TO_KAFKA)
          await new Promise((resolve) => setTimeout(resolve, ANIMATION_CONFIG.API_TO_KAFKA_DURATION))

          simulationState.setStage(SimulationStage.EMITTING)
          simulationState.addKafkaEvents(response.events)
          eventsAdded = true

          response.events.forEach((event: any) => {
            const trigger = createAnimationTrigger(event.type, 'OPEN_ACCOUNT', event.id)
            simulationState.addAnimationTrigger(trigger)
          })

          await new Promise((resolve) => setTimeout(resolve, ANIMATION_CONFIG.KAFKA_EMISSION_DURATION))
        }

        // If in real mode, poll for actual events from Event Store API
        if (!eventsAdded && isRealMode && EVENT_STORE_CONFIG.ENABLE_REAL_EVENTS) {
          debugLog('Polling for real events from Event Store API for account: ' + accountId)
          const realEvents = await pollRealEventsAfterTransaction(startTime, accountId)
          
          if (realEvents.length > 0) {
            debugLog(`Found ${realEvents.length} real events from Event Store`)
            simulationState.setStage(SimulationStage.API_TO_KAFKA)
            await new Promise((resolve) => setTimeout(resolve, ANIMATION_CONFIG.API_TO_KAFKA_DURATION))

            simulationState.setStage(SimulationStage.EMITTING)
            simulationState.addKafkaEvents(realEvents)
            eventsAdded = true

            realEvents.forEach((event) => {
              const trigger = createAnimationTrigger(event.type, 'OPEN_ACCOUNT', event.id)
              simulationState.addAnimationTrigger(trigger)
            })

            await new Promise((resolve) => setTimeout(resolve, ANIMATION_CONFIG.KAFKA_EMISSION_DURATION))
          }
        }

        // Fallback: show synthetic events when none from API or Event Store
        if (!eventsAdded) {
          simulationState.setStage(SimulationStage.API_TO_KAFKA)
          await new Promise((resolve) => setTimeout(resolve, ANIMATION_CONFIG.API_TO_KAFKA_DURATION))

          simulationState.setStage(SimulationStage.EMITTING)
          const syntheticEvents = createSyntheticEventsForOpenAccount(accountId, customerId)
          simulationState.addKafkaEvents(syntheticEvents)

          syntheticEvents.forEach((event) => {
            const trigger = createAnimationTrigger(event.type, 'OPEN_ACCOUNT', event.id)
            simulationState.addAnimationTrigger(trigger)
          })

          await new Promise((resolve) => setTimeout(resolve, ANIMATION_CONFIG.KAFKA_EMISSION_DURATION))
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
    const customerId = simulationState.getTransactionId('customerId')

    if (!accountId) {
      debugLog('SEND_PAYMENT failed: No account ID available')
      return {
        success: false,
        data: {} as any,
        error: 'Account must be opened first'
      }
    }

    if (!customerId) {
      debugLog('SEND_PAYMENT failed: No customer ID available')
      return {
        success: false,
        data: {} as any,
        error: 'Customer must be created first'
      }
    }

    // Set loading state
    simulationState.setStepStatus('SEND_PAYMENT', 'loading')
    simulationState.setStage(SimulationStage.USER_TO_API)

    // Generate payment payload with customer ID
    const payload: PaymentPayload = {
      ...mockDataGenerator.generateSamplePaymentPayload(accountId),
      customerId: customerId
    }

    const startTime = Date.now()
    
    // Clear events and set transaction start time to show only new events
    simulationState.setTransactionStartTime(startTime)
    
    // Restart polling with transaction start time to only fetch new events
    if (eventStoreEnabled.current) {
      eventStoreService.stopPolling()
      eventStoreService.startPolling(EVENT_STORE_CONFIG.POLLING_INTERVAL, startTime)
    }

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
        simulationState.setTransactionId('paymentId', paymentId)

        // Check if we're in real API mode
        const isRealMode = apiService.getServiceType() === 'real'
        let eventsAdded = false

        // Add Kafka events from API response (mock mode returns these)
        if (response.events && response.events.length > 0) {
          simulationState.setStage(SimulationStage.API_TO_KAFKA)
          await new Promise((resolve) => setTimeout(resolve, ANIMATION_CONFIG.API_TO_KAFKA_DURATION))

          simulationState.setStage(SimulationStage.EMITTING)
          simulationState.addKafkaEvents(response.events)
          eventsAdded = true

          response.events.forEach((event: any) => {
            const trigger = createAnimationTrigger(event.type, 'SEND_PAYMENT', event.id)
            simulationState.addAnimationTrigger(trigger)
          })

          await new Promise((resolve) => setTimeout(resolve, ANIMATION_CONFIG.KAFKA_EMISSION_DURATION))
        }

        // If in real mode, poll for actual events from Event Store API
        if (!eventsAdded && isRealMode && EVENT_STORE_CONFIG.ENABLE_REAL_EVENTS) {
          debugLog('Polling for real events from Event Store API for account: ' + accountId)
          const realEvents = await pollRealEventsAfterTransaction(startTime, accountId)
          
          if (realEvents.length > 0) {
            debugLog(`Found ${realEvents.length} real events from Event Store`)
            simulationState.setStage(SimulationStage.API_TO_KAFKA)
            await new Promise((resolve) => setTimeout(resolve, ANIMATION_CONFIG.API_TO_KAFKA_DURATION))

            simulationState.setStage(SimulationStage.EMITTING)
            simulationState.addKafkaEvents(realEvents)
            eventsAdded = true

            realEvents.forEach((event) => {
              const trigger = createAnimationTrigger(event.type, 'SEND_PAYMENT', event.id)
              simulationState.addAnimationTrigger(trigger)
            })

            await new Promise((resolve) => setTimeout(resolve, ANIMATION_CONFIG.KAFKA_EMISSION_DURATION))
          }
        }

        // Fallback: show synthetic events when none from API or Event Store
        if (!eventsAdded) {
          simulationState.setStage(SimulationStage.API_TO_KAFKA)
          await new Promise((resolve) => setTimeout(resolve, ANIMATION_CONFIG.API_TO_KAFKA_DURATION))

          simulationState.setStage(SimulationStage.EMITTING)
          const fromAccount = response.data.fromAccount || accountId
          const toAccount = response.data.toAccount
          const syntheticEvents = createSyntheticEventsForSendPayment(paymentId, fromAccount, toAccount)
          simulationState.addKafkaEvents(syntheticEvents)

          syntheticEvents.forEach((event) => {
            const trigger = createAnimationTrigger(event.type, 'SEND_PAYMENT', event.id)
            simulationState.addAnimationTrigger(trigger)
          })

          await new Promise((resolve) => setTimeout(resolve, ANIMATION_CONFIG.KAFKA_EMISSION_DURATION))
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

      // Filter events to only include those after the last transaction start time
      const lastTransactionStart = simulationState.state.lastTransactionStartTime
      if (lastTransactionStart) {
        const filteredEvents = newEvents.filter((event) => {
          // Event timestamp should be after transaction start (with small buffer for clock skew)
          return event.timestamp >= (lastTransactionStart - 5000) // 5 second buffer
        })

        if (filteredEvents.length > 0) {
          debugLog(`Filtered ${filteredEvents.length} new events (out of ${newEvents.length} total) after transaction start`)
          const withBusinessEvents = synthesizeBusinessEventsFromDataEvents(filteredEvents)
          simulationState.addKafkaEvents(withBusinessEvents)
        } else {
          debugLog(`All ${newEvents.length} events were before transaction start, skipping`)
        }
      } else {
        // No transaction started yet, don't add events from continuous polling
        debugLog(`No transaction started yet, skipping ${newEvents.length} events from continuous polling`)
      }
    })

    // Start polling (without transaction start time initially)
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
      const withBusinessEvents = synthesizeBusinessEventsFromDataEvents(result.events)
      simulationState.addKafkaEvents(withBusinessEvents)
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
