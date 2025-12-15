// useSimulationState - State management hook for transaction simulation
import { useState, useCallback } from 'react'
import {
  SimulationStage,
  type SimulationState,
  type StepStatus,
  type ApiLog,
  type KafkaEvent,
  type AnimationTrigger,
  type TransactionType
} from '../demo/types'

/**
 * Initial simulation state
 */
const initialState: SimulationState = {
  currentStep: 1,
  stage: SimulationStage.IDLE,
  transactions: {
    customerId: undefined,
    accountId: undefined,
    paymentId: undefined
  },
  stepStatuses: {
    createCustomer: 'idle',
    openAccount: 'idle',
    sendPayment: 'idle'
  },
  apiLogs: [],
  kafkaEvents: [],
  animationTriggers: []
}

/**
 * Map transaction type to step status key
 */
const getStepKey = (type: TransactionType): keyof SimulationState['stepStatuses'] => {
  switch (type) {
    case 'CREATE_CUSTOMER':
      return 'createCustomer'
    case 'OPEN_ACCOUNT':
      return 'openAccount'
    case 'SEND_PAYMENT':
      return 'sendPayment'
  }
}

/**
 * useSimulationState Hook
 * Manages all simulation state including steps, logs, events, and animations
 */
export const useSimulationState = () => {
  const [state, setState] = useState<SimulationState>(initialState)

  /**
   * Update simulation stage
   */
  const setStage = useCallback((stage: SimulationStage) => {
    setState((prev) => ({ ...prev, stage }))
  }, [])

  /**
   * Update step status
   */
  const setStepStatus = useCallback((type: TransactionType, status: StepStatus) => {
    const stepKey = getStepKey(type)
    setState((prev) => ({
      ...prev,
      stepStatuses: {
        ...prev.stepStatuses,
        [stepKey]: status
      }
    }))
  }, [])

  /**
   * Set transaction ID
   */
  const setTransactionId = useCallback(
    (type: 'customerId' | 'accountId' | 'paymentId', id: string) => {
      setState((prev) => ({
        ...prev,
        transactions: {
          ...prev.transactions,
          [type]: id
        }
      }))
    },
    []
  )

  /**
   * Add API log entry
   */
  const addApiLog = useCallback((log: ApiLog) => {
    setState((prev) => ({
      ...prev,
      apiLogs: [...prev.apiLogs, log]
    }))
  }, [])

  /**
   * Add Kafka event
   */
  const addKafkaEvent = useCallback((event: KafkaEvent) => {
    setState((prev) => ({
      ...prev,
      kafkaEvents: [...prev.kafkaEvents, event]
    }))
  }, [])

  /**
   * Add multiple Kafka events at once
   */
  const addKafkaEvents = useCallback((events: KafkaEvent[]) => {
    setState((prev) => ({
      ...prev,
      kafkaEvents: [...prev.kafkaEvents, ...events]
    }))
  }, [])

  /**
   * Add animation trigger
   */
  const addAnimationTrigger = useCallback((trigger: AnimationTrigger) => {
    setState((prev) => ({
      ...prev,
      animationTriggers: [...prev.animationTriggers, trigger]
    }))
  }, [])

  /**
   * Advance to next step
   */
  const advanceStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 3)
    }))
  }, [])

  /**
   * Clear API logs
   */
  const clearApiLogs = useCallback(() => {
    setState((prev) => ({
      ...prev,
      apiLogs: []
    }))
  }, [])

  /**
   * Clear Kafka events
   */
  const clearKafkaEvents = useCallback(() => {
    setState((prev) => ({
      ...prev,
      kafkaEvents: []
    }))
  }, [])

  /**
   * Reset entire simulation
   */
  const resetSimulation = useCallback(() => {
    setState(initialState)
  }, [])

  /**
   * Check if a step is available (previous steps completed or current step)
   */
  const isStepAvailable = useCallback(
    (stepNumber: number): boolean => {
      if (stepNumber === 1) return true // First step always available

      // Check if previous steps are completed
      if (stepNumber === 2) {
        return state.stepStatuses.createCustomer === 'success'
      }

      if (stepNumber === 3) {
        return (
          state.stepStatuses.createCustomer === 'success' &&
          state.stepStatuses.openAccount === 'success'
        )
      }

      return false
    },
    [state.stepStatuses]
  )

  /**
   * Get current step status
   */
  const getCurrentStepStatus = useCallback(
    (type: TransactionType): StepStatus => {
      const stepKey = getStepKey(type)
      return state.stepStatuses[stepKey]
    },
    [state.stepStatuses]
  )

  /**
   * Get transaction ID by type
   */
  const getTransactionId = useCallback(
    (type: 'customerId' | 'accountId' | 'paymentId'): string | undefined => {
      return state.transactions[type]
    },
    [state.transactions]
  )

  /**
   * Check if all steps are completed
   */
  const isSimulationComplete = useCallback((): boolean => {
    return (
      state.stepStatuses.createCustomer === 'success' &&
      state.stepStatuses.openAccount === 'success' &&
      state.stepStatuses.sendPayment === 'success'
    )
  }, [state.stepStatuses])

  /**
   * Get simulation progress percentage
   */
  const getProgress = useCallback((): number => {
    const completedSteps = Object.values(state.stepStatuses).filter(
      (status) => status === 'success'
    ).length
    return (completedSteps / 3) * 100
  }, [state.stepStatuses])

  /**
   * Get statistics
   */
  const getStats = useCallback(() => {
    return {
      totalApiCalls: state.apiLogs.length,
      successfulApiCalls: state.apiLogs.filter((log) => log.status === 'success').length,
      failedApiCalls: state.apiLogs.filter((log) => log.status === 'error').length,
      totalKafkaEvents: state.kafkaEvents.length,
      businessEvents: state.kafkaEvents.filter((event) => event.type === 'business').length,
      dataEvents: state.kafkaEvents.filter((event) => event.type === 'data').length,
      completedSteps: Object.values(state.stepStatuses).filter((status) => status === 'success')
        .length,
      totalSteps: 3,
      progress: getProgress()
    }
  }, [state.apiLogs, state.kafkaEvents, state.stepStatuses, getProgress])

  return {
    // State
    state,

    // Setters
    setStage,
    setStepStatus,
    setTransactionId,
    addApiLog,
    addKafkaEvent,
    addKafkaEvents,
    addAnimationTrigger,
    advanceStep,

    // Actions
    clearApiLogs,
    clearKafkaEvents,
    resetSimulation,

    // Queries
    isStepAvailable,
    getCurrentStepStatus,
    getTransactionId,
    isSimulationComplete,
    getProgress,
    getStats
  }
}

export default useSimulationState
