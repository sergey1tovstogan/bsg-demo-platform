// TemenosTransactionSimulator - Main transaction simulator container
import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, TrendingUp, User, CreditCard, Send, CheckCircle2, Wrench, Globe, Cloud } from 'lucide-react'
import { useSimulation } from '../hooks/useSimulation'
import { useCrossTabSync } from '../hooks/useCrossTabSync'
import { StepCard } from './StepCard'
import { ApiInspector } from './ApiInspector'
import { KafkaEventStream } from './KafkaEventStream'
import { TRANSACTION_STEPS, API_CONFIG } from '../config/simulation.config'
import { apiService } from '../services/apiServiceAdapter'

/**
 * Progress bar component
 */
const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-teal-500 to-teal-600"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  )
}

/**
 * Event Source Indicator component
 * Shows whether events are from Mock or Real API source
 */
const EventSourceIndicator: React.FC<{
  mode: 'mock' | 'real'
  eventCount: number
  connectionStatus?: 'connected' | 'connecting' | 'disconnected' | 'error'
  eventHubHealth?: { status: string; buffer_size?: number }
}> = ({ mode, eventCount, connectionStatus, eventHubHealth }) => {
  const isMock = mode === 'mock'

  return (
    <div className="flex items-center gap-3">
      {/* Event Source Badge */}
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${
          isMock
            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
            : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
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
        <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-gray-800 border border-gray-700">
          <div
            className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected'
                ? 'bg-green-500'
                : connectionStatus === 'connecting'
                ? 'bg-yellow-500 animate-pulse'
                : connectionStatus === 'error'
                ? 'bg-red-500'
                : 'bg-gray-500'
            }`}
          />
          <span className="text-xs text-gray-400 capitalize">{connectionStatus}</span>
          {eventHubHealth?.buffer_size !== undefined && (
            <span className="text-xs text-gray-500">| Buffer: {eventHubHealth.buffer_size}</span>
          )}
        </div>
      )}

      {/* Live indicator for real mode */}
      {!isMock && connectionStatus === 'connected' && (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400">Live</span>
        </div>
      )}

      {/* Event Count */}
      {eventCount > 0 && (
        <span className="text-xs text-gray-500">
          {eventCount} {eventCount === 1 ? 'event' : 'events'}
        </span>
      )}
    </div>
  )
}

/**
 * Stats display component
 */
const StatsDisplay: React.FC<{ stats: any }> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="text-sm text-gray-400 mb-1">Completed Steps</div>
        <div className="text-2xl font-bold text-white">
          {stats.completedSteps} / {stats.totalSteps}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="text-sm text-gray-400 mb-1">API Calls</div>
        <div className="text-2xl font-bold text-blue-400">{stats.totalApiCalls}</div>
        <div className="text-xs text-gray-500 mt-1">
          {stats.successfulApiCalls} success / {stats.failedApiCalls} failed
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="text-sm text-gray-400 mb-1">Kafka Events</div>
        <div className="text-2xl font-bold text-green-400">{stats.totalKafkaEvents}</div>
        <div className="text-xs text-gray-500 mt-1">
          {stats.businessEvents} business / {stats.dataEvents} data
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="text-sm text-gray-400 mb-1">Progress</div>
        <div className="text-2xl font-bold text-teal-400">{Math.round(stats.progress)}%</div>
        <div className="mt-2">
          <ProgressBar progress={stats.progress} />
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
  const [apiMode, setApiMode] = useState<'mock' | 'real'>('real')
  const { sendTriggers } = useCrossTabSync()

  // Event Hub health state
  const [eventHubHealth, setEventHubHealth] = useState<{ status: string; running?: boolean; buffer_size?: number } | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>('connecting')

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

  // Check Event Hub health periodically
  useEffect(() => {
    const checkEventHubHealth = async () => {
      try {
        const response = await fetch('/api/v1/events/health')
        if (response.ok) {
          const health = await response.json()
          setEventHubHealth(health)
          setConnectionStatus(health.running ? 'connected' : 'disconnected')
        } else {
          setConnectionStatus('error')
        }
      } catch (error) {
        setConnectionStatus('error')
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

  // API mode toggle disabled - always use real mode
  const handleApiModeToggle = useCallback(() => {
    // Disabled - always uses real mode
    console.warn('Mock mode is disabled - always using real API')
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Temenos Transaction Simulator
            </h1>
            <p className="text-gray-400">
              Simulate banking operations and visualize data flow through the architecture
            </p>
          </div>

          {/* Control buttons */}
          <div className="flex items-center gap-3">
            {/* API Mode Toggle (shown if configured) */}
            {/* API Mode Toggle - DISABLED: Always uses real mode */}
            {false && API_CONFIG.SHOW_API_TOGGLE && (
              <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-4 py-2 border border-gray-700">
                <span className="text-sm text-gray-400">API Mode:</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleApiModeToggle}
                  className="flex items-center gap-2 px-3 py-1 rounded-md font-medium text-sm transition-all bg-green-500/20 text-green-400 border border-green-500/30"
                >
                  <Globe className="w-4 h-4" />
                  Real
                </motion.button>
              </div>
            )}

            {/* Reset button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Simulation
            </motion.button>
          </div>
        </div>

        {/* Stats */}
        <StatsDisplay stats={stats} />

        {/* Completion banner */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-500/20 to-teal-500/20 border border-green-500/30 rounded-xl p-6"
          >
            <div className="flex items-center gap-4">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  Simulation Complete! 🎉
                </h3>
                <p className="text-gray-300">
                  All transactions executed successfully. Check the API Inspector and Kafka Event
                  Stream for details.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main content grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left column - Transaction steps */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-500" />
                Transaction Workflow
              </h2>

              <div className="space-y-4">
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
                  icon={<User className="w-5 h-5 text-teal-500" />}
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
                  icon={<CreditCard className="w-5 h-5 text-teal-500" />}
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
                  icon={<Send className="w-5 h-5 text-teal-500" />}
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

        {/* Current stage indicator (for debugging) */}
        {simulation.state.stage !== 'IDLE' && simulation.state.stage !== 'FINISHED' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed bottom-6 right-6 bg-blue-500/20 border border-blue-500/30 rounded-lg px-4 py-2 backdrop-blur-sm"
          >
            <div className="text-sm text-blue-400 font-mono">
              Stage: {simulation.state.stage}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default TemenosTransactionSimulator
