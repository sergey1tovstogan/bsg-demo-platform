// useSimulation - Main transaction orchestration hook
import { useCallback } from 'react'
import { useSimulationState } from './useSimulationState'
import { apiService } from '../services/apiServiceAdapter'
import { mockDataGenerator } from '../services/mockDataGenerator'
import {
  SimulationStage,
  type TransactionType,
  type CustomerPayload,
  type AccountPayload,
  type PaymentPayload,
  type ApiLog,
  type AnimationTrigger
} from '../demo/types'
import {
  API_ENDPOINTS,
  ANIMATION_CONFIG,
  DEBUG_CONFIG
} from '../config/simulation.config'

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

      // Create API log
      const apiLog: ApiLog = {
        id: generateLogId(),
        timestamp: startTime,
        type: 'CREATE_CUSTOMER',
        endpoint: API_ENDPOINTS.CREATE_CUSTOMER,
        method: 'POST',
        request: payload,
        response: response.data,
        duration,
        status: response.success ? 'success' : 'error',
        statusCode: response.success ? 201 : 400
      }

      simulationState.addApiLog(apiLog)

      if (response.success) {
        debugLog('CREATE_CUSTOMER succeeded', response.data)

        // Store customer ID
        simulationState.setTransactionId('customerId', response.data.customerId)

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

      // Create error log
      const apiLog: ApiLog = {
        id: generateLogId(),
        timestamp: startTime,
        type: 'CREATE_CUSTOMER',
        endpoint: API_ENDPOINTS.CREATE_CUSTOMER,
        method: 'POST',
        request: payload,
        response: { error: error instanceof Error ? error.message : 'Unknown error' },
        duration,
        status: 'error',
        statusCode: 500
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
    if (!customerId) {
      debugLog('OPEN_ACCOUNT failed: No customer ID available')
      return {
        success: false,
        data: {} as any,
        error: 'Customer must be created first'
      }
    }

    // Set loading state
    simulationState.setStepStatus('OPEN_ACCOUNT', 'loading')
    simulationState.setStage(SimulationStage.USER_TO_API)

    // Generate account payload
    const payload: AccountPayload = mockDataGenerator.generateSampleAccountPayload(customerId)

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
        response: response.data,
        duration,
        status: response.success ? 'success' : 'error',
        statusCode: response.success ? 201 : 400
      }

      simulationState.addApiLog(apiLog)

      if (response.success) {
        debugLog('OPEN_ACCOUNT succeeded', response.data)

        // Store account ID
        simulationState.setTransactionId('accountId', response.data.accountId)

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
        response: response.data,
        duration,
        status: response.success ? 'success' : 'error',
        statusCode: response.success ? 201 : 400
      }

      simulationState.addApiLog(apiLog)

      if (response.success) {
        debugLog('SEND_PAYMENT succeeded', response.data)

        // Store payment ID
        simulationState.setTransactionId('paymentId', response.data.paymentId)

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

  return {
    ...simulationState,
    executeTransaction,
    executeCreateCustomer,
    executeOpenAccount,
    executeSendPayment
  }
}

export default useSimulation
