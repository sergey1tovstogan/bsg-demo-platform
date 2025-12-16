// Simulation Configuration - Centralized settings for Transaction Simulator
import type { TransactionType } from '../demo/types'

/**
 * API Configuration
 */
export const API_CONFIG = {
  // Toggle between mock and real API
  USE_MOCK_API: true,

  // Real API settings
  REAL_API_BASE_URL: 'http://transactingress.northeurope.cloudapp.azure.com:80/irf-provider-container/api',
  REAL_API_TIMEOUT: 30000, // 30 seconds

  // UI toggle visibility
  SHOW_API_TOGGLE: true, // Show mock/real toggle in UI

  // Mock API settings
  MOCK_API_CONFIG: {
    networkDelay: 1500, // 1.5 seconds to simulate realistic network latency
    failureRate: 0.05, // 5% chance of random errors
    kafkaEventDelay: 200 // 200ms delay for Kafka event emission
  }
}

/**
 * Event Store API Configuration (Azure Event Hub via Event Store API)
 */
export const EVENT_STORE_CONFIG = {
  // Backend proxy URL for Event Store API
  BACKEND_PROXY_URL: '/api/v1', // Proxied through backend

  // Polling settings
  POLLING_INTERVAL: 3000, // Poll every 3 seconds
  MAX_EVENTS_PER_REQUEST: 50, // Maximum events to fetch per request
  DEFAULT_TIME_RANGE_MINUTES: 30, // Default time range for fetching events

  // Enable real events from Event Store when in "real" API mode
  ENABLE_REAL_EVENTS: true, // When true, fetch real events from Event Store API in real mode

  // Event display settings
  AUTO_SCROLL_EVENTS: true, // Auto-scroll event list on new events
  MAX_DISPLAYED_EVENTS: 100, // Maximum events to display in UI

  // Connection settings
  CONNECTION_TIMEOUT: 10000, // 10 seconds timeout for connections
  RETRY_ATTEMPTS: 3, // Number of retry attempts on failure
  RETRY_DELAY: 1000, // Delay between retries in ms

  // Topic filters (optional - leave empty to show all)
  TOPIC_FILTERS: [] as string[] // e.g., ['temenos.party', 'temenos.order']
}

/**
 * Animation Configuration
 */
export const ANIMATION_CONFIG = {
  // Data packet animation speeds (ms)
  USER_TO_API_DURATION: 800,
  API_PROCESSING_DURATION: 2000,
  API_TO_KAFKA_DURATION: 600,
  KAFKA_EMISSION_DURATION: 400,
  KAFKA_TO_DOWNSTREAM_DURATION: 1000,

  // Particle effects
  PARTICLE_COUNT: 20,
  PARTICLE_SPREAD: 100,

  // Glow effects
  GLOW_INTENSITY: 0.8,
  GLOW_DURATION: 1000
}

/**
 * UI Configuration
 */
export const UI_CONFIG = {
  // API Inspector
  API_LOG_MAX_ITEMS: 50,
  API_LOG_AUTO_SCROLL: true,
  API_LOG_SYNTAX_HIGHLIGHT: true,

  // Kafka Event Stream
  KAFKA_EVENT_MAX_ITEMS: 100,
  KAFKA_EVENT_AUTO_SCROLL: true,
  KAFKA_EVENT_PAUSE_ON_HOVER: true,

  // Transaction Steps
  STEP_AUTO_ADVANCE: false, // Don't auto-advance to next step
  STEP_RESET_ON_ERROR: false, // Keep error state visible

  // Cross-tab integration
  ENABLE_CROSS_TAB_SYNC: true,
  CROSS_TAB_EVENT_NAME: 'data-architecture-animation-trigger'
}

/**
 * Transaction Configuration
 */
export const TRANSACTION_CONFIG = {
  // Default currency
  DEFAULT_CURRENCY: 'USD',

  // Account types
  ACCOUNT_TYPES: ['SAVINGS', 'CHECKING', 'CURRENT'] as const,

  // Payment limits
  MIN_PAYMENT_AMOUNT: 100,
  MAX_PAYMENT_AMOUNT: 10000,

  // Initial deposit limits
  MIN_INITIAL_DEPOSIT: 1000,
  MAX_INITIAL_DEPOSIT: 50000
}

/**
 * Kafka Topic Configuration
 */
export const KAFKA_TOPICS = {
  // Business events
  CUSTOMER_CREATED: 'temenos.party.customers.created',
  ACCOUNT_OPENED: 'temenos.holdings.accounts.opened',
  PAYMENT_INITIATED: 'temenos.order.payments.initiated',
  PAYMENT_COMPLETED: 'temenos.order.payments.completed',

  // Data events
  ACCOUNT_DATA_SYNCED: 'temenos.data.accounts.sync',
  PAYMENT_DATA_SYNCED: 'temenos.data.payments.sync'
} as const

/**
 * API Endpoint Configuration
 */
export const API_ENDPOINTS = {
  CREATE_CUSTOMER: '/v5.7.0/party/customers', // Updated to v5.7.0
  OPEN_ACCOUNT: '/v1.2.0/holdings/accounts',
  SEND_PAYMENT: '/v1.0.0/order/paymentOrders'
} as const

/**
 * Transaction Step Metadata
 */
export const TRANSACTION_STEPS: Record<TransactionType, {
  order: number
  title: string
  description: string
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  estimatedDuration: number
}> = {
  CREATE_CUSTOMER: {
    order: 1,
    title: 'Create Customer',
    description: 'Register a new customer with KYC verification',
    endpoint: API_ENDPOINTS.CREATE_CUSTOMER,
    method: 'POST',
    estimatedDuration: 2000
  },
  OPEN_ACCOUNT: {
    order: 2,
    title: 'Open Account',
    description: 'Create a new account for the customer',
    endpoint: API_ENDPOINTS.OPEN_ACCOUNT,
    method: 'POST',
    estimatedDuration: 2500
  },
  SEND_PAYMENT: {
    order: 3,
    title: 'Send Payment',
    description: 'Execute a payment transaction from the account',
    endpoint: API_ENDPOINTS.SEND_PAYMENT,
    method: 'POST',
    estimatedDuration: 3000
  }
}

/**
 * Color Theme Configuration
 */
export const THEME_CONFIG = {
  // Event type colors
  BUSINESS_EVENT_COLOR: 'rgb(20, 184, 166)', // Teal
  DATA_EVENT_COLOR: 'rgb(168, 85, 247)', // Purple

  // Status colors
  IDLE_COLOR: 'rgb(107, 114, 128)', // Gray
  LOADING_COLOR: 'rgb(59, 130, 246)', // Blue
  SUCCESS_COLOR: 'rgb(34, 197, 94)', // Green
  ERROR_COLOR: 'rgb(239, 68, 68)', // Red

  // UI colors
  TERMINAL_BG: 'rgb(17, 24, 39)', // Dark gray
  TERMINAL_TEXT: 'rgb(209, 213, 219)', // Light gray
  KAFKA_BG: 'rgb(6, 78, 59)', // Dark green
  KAFKA_TEXT: 'rgb(167, 243, 208)' // Light green
}

/**
 * Development/Debug Configuration
 */
export const DEBUG_CONFIG = {
  ENABLE_CONSOLE_LOGS: true,
  ENABLE_PERFORMANCE_METRICS: false,
  ENABLE_ERROR_BOUNDARIES: true,
  SHOW_SIMULATION_STAGE: true // Show current simulation stage in UI
}

/**
 * Export helper function to get full API URL
 */
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.USE_MOCK_API
    ? '/mock-api' // Mock API doesn't need real URL
    : API_CONFIG.REAL_API_BASE_URL

  return `${baseUrl}${endpoint}`
}

/**
 * Export helper function to check if feature is enabled
 */
export const isFeatureEnabled = (feature: keyof typeof UI_CONFIG): boolean => {
  return UI_CONFIG[feature] === true
}
