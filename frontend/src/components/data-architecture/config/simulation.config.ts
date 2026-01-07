// Simulation Configuration - Centralized settings for Transaction Simulator
import type { TransactionType } from '../demo/types'

/**
 * API Configuration
 */
export const API_CONFIG = {
  // Always use real API - mock mode disabled
  USE_MOCK_API: false,

  // Real API settings
  REAL_API_BASE_URL: 'http://transactingress.northeurope.cloudapp.azure.com/irf-provider-container/api',
  REAL_API_TIMEOUT: 30000, // 30 seconds

  // UI toggle visibility - disabled since we only use real mode
  SHOW_API_TOGGLE: false, // Hide mock/real toggle in UI

  // Mock API settings - kept for reference but not used
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
  // Backend proxy URL for Event Store API (component-specific endpoints)
  // Use direct backend URL in production since Azure Static Web Apps rewrite doesn't support POST
  // CORS is already configured on the backend to allow Azure Static Web Apps domains
  BACKEND_PROXY_URL: typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8000/api/v1/components/data-architecture'  // Full URL for local dev
    : 'https://bsg-demo-platform-app.azurewebsites.net/api/v1/components/data-architecture',  // Direct backend URL for production

  // Polling settings
  POLLING_INTERVAL: 3000, // Poll every 3 seconds
  MAX_EVENTS_PER_REQUEST: 50, // Maximum events to fetch per request
  DEFAULT_TIME_RANGE_MINUTES: 30, // Default time range for fetching events

  // Always enable real events - mock mode disabled
  ENABLE_REAL_EVENTS: true, // Always fetch real events from Event Hub

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
 * Event Display Configuration
 */
export const EVENT_DISPLAY_CONFIG = {
  // Grouping settings
  ENABLE_EVENT_GROUPING: true,
  // entityId groups by entityid field (works for both CustomerID and AccountID)
  GROUP_BY: 'entityId' as 'entityId' | 'customerId' | 'correlationId' | 'transactionId',
  GROUP_TIME_WINDOW_MS: 30000, // Events within 30s are grouped together

  // Display preferences
  SHOW_BUSINESS_CONTEXT: true,
  SHOW_CORRELATION_IDS: true,
  SHOW_TIMING_INFO: true,
  COMPACT_MODE: false,

  // Highlighting
  HIGHLIGHT_NEW_EVENTS: true,
  HIGHLIGHT_DURATION_MS: 3000,

  // Filtering
  DEFAULT_FILTER: 'all' as 'all' | 'business' | 'data',
  ENABLE_SEARCH: true,

  // Business field extraction by event category
  BUSINESS_FIELDS: {
    customer: ['customerName', 'entityid', 'email', 'nationality', 'customerId', 'name'],
    account: ['accountId', 'accountType', 'balance', 'currency', 'customerId'],
    payment: ['paymentId', 'amount', 'currency', 'reference', 'status', 'fromAccount', 'toAccount']
  }
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
  OPEN_ACCOUNT: '/v9.4.0/holdings/accounts/currentAccounts', // Using v9.4.0 holdings API for current account opening
  SEND_PAYMENT: '/v7.0.0/order/paymentOrders/instantPayments' // Updated to v7.0.0 instant payments
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
    description: 'Customer Opening a new account',
    endpoint: API_ENDPOINTS.CREATE_CUSTOMER,
    method: 'POST',
    estimatedDuration: 2000
  },
  OPEN_ACCOUNT: {
    order: 2,
    title: 'Open Account',
    description: 'Opening an account for the newly created customer',
    endpoint: API_ENDPOINTS.OPEN_ACCOUNT,
    method: 'POST',
    estimatedDuration: 2500
  },
  SEND_PAYMENT: {
    order: 3,
    title: 'Send Instant Payment',
    description: 'Execute an instant payment transaction from the account',
    endpoint: API_ENDPOINTS.SEND_PAYMENT,
    method: 'POST',
    estimatedDuration: 3000
  }
}

/**
 * Color Theme Configuration - Temenos Brand Colors
 * Based on UNIFIED_LAYOUT_SPECIFICATION.txt
 */
export const THEME_CONFIG = {
  // Temenos Brand Colors
  TEMENOS_NAVY: '#003366',      // Primary brand color
  TEMENOS_BLUE: '#0066CC',      // Secondary brand color
  TEMENOS_CYAN: '#00A3E0',      // Accent color

  // Event type colors - using Temenos brand colors for consistency
  BUSINESS_EVENT_COLOR: '#003366', // Temenos Navy
  DATA_EVENT_COLOR: '#00A3E0',     // Temenos Cyan

  // Status colors (functional - from brand spec)
  IDLE_COLOR: '#64748B',        // Slate 500
  LOADING_COLOR: '#0066CC',     // Temenos Blue
  SUCCESS_COLOR: '#10B981',     // Emerald 500
  ERROR_COLOR: '#EF4444',       // Red 500

  // UI colors - using Slate palette for better contrast
  TERMINAL_BG: '#0F172A',       // Slate 900
  TERMINAL_TEXT: '#E2E8F0',     // Slate 200
  KAFKA_BG: '#1E293B',          // Slate 800
  KAFKA_TEXT: '#F8FAFC'         // Slate 50
}

/**
 * Database Records Configuration
 */
export const DATABASE_RECORDS_CONFIG = {
  // Enable/disable database records tile
  ENABLED: true,

  // SQL query to execute - fetches customer records from ODS
  // Shows most recent records first (newest customers appear at top)
  SQL_QUERY: `SELECT TOP 20 c.[RECID]
      ,c.[MNEMONIC]
	  ,cml.[SHORT_NAME]
      ,cml.[NAME_1]
      ,cml.[STREET]
      ,cml.[TOWN_COUNTRY]
      ,cml.[POST_CODE]
      ,cml.[COUNTRY]
      ,c.[SECTOR]
      ,c.[ACCOUNT_OFFICER]
      ,c.[INDUSTRY]
      ,c.[TARGET]
      ,c.[NATIONALITY]
      ,c.[CUSTOMER_STATUS]
      ,c.[RESIDENCE]
      ,c.[CREATION_TIME_DL]
      ,c.[BANKING_DATE_DL]
  FROM [ODS].[FBNK_CUSTOMER] c
  LEFT JOIN [ODS].[FBNK_CUSTOMER_ML] cml ON c.RECID = cml.RECID
  ORDER BY c.[CREATION_TIME_DL] DESC`,

  // Description shown in tile header
  DESCRIPTION: 'Database records synced from Temenos events',

  // Maximum rows to display
  MAX_ROWS: 20,

  // Auto-refresh when Kafka events are received
  AUTO_REFRESH: true,

  // Debounce delay for auto-refresh (ms) - prevents too many requests
  REFRESH_DEBOUNCE_MS: 2000
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
