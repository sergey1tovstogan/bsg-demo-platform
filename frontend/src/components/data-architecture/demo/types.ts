// Type definitions for Temenos Transaction Simulator

/**
 * Transaction types supported by the simulator
 */
export type TransactionType = 'CREATE_CUSTOMER' | 'OPEN_ACCOUNT' | 'SEND_PAYMENT'

/**
 * Status of a transaction step
 */
export type StepStatus = 'idle' | 'loading' | 'success' | 'error'

/**
 * Simulation stage for animation coordination
 */
export enum SimulationStage {
  IDLE = 'IDLE',
  USER_TO_API = 'USER_TO_API',
  PROCESSING = 'PROCESSING',
  API_TO_KAFKA = 'API_TO_KAFKA',
  EMITTING = 'EMITTING',
  KAFKA_TO_DOWNSTREAM = 'KAFKA_TO_DOWNSTREAM',
  FINISHED = 'FINISHED'
}

/**
 * Customer creation payload
 */
export interface CustomerPayload {
  name: string
  email: string
  phone: string
  address: string
  // Extended fields for comprehensive Temenos API integration
  nationality?: string // ISO country code (e.g., 'DE', 'FR', 'IT')
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  sectorId?: number // Customer segment (1=Retail, 2=Corporate, 3=SME, etc.)
  street?: string // Separate street for better structure
  city?: string // Separate city for better structure
  country?: string // Separate country for better structure
  postalCode?: string // Postal/ZIP code
}

/**
 * Customer response data
 */
export interface Customer {
  customerId: string
  customerMnemonic?: string // Short customer code (e.g., "ELENFERN")
  name: string
  email: string
  phone: string
  address: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  lastModified: string
}

/**
 * Temenos API Request Format (v5.7.0)
 * Nested {header, body} structure - all fields optional but customerNames is essential
 */
export interface TemenosCustomerPayload {
  header?: {
    audit?: {
      versionNumber?: string
    }
  }
  body: {
    // Essential - customer name
    customerNames: Array<{
      customerName: string // Max 70 chars
      customerNameAdditional?: string // Max 70 chars
    }>

    // Communication (recommended)
    communicationDevices?: Array<{
      email?: string // Max 50 chars
      phoneNumber?: string // Max 17 chars
      smsNumber?: string // Max 17 chars
      preferredChannel?: string // Max 20 chars
    }>

    // Address (optional)
    streets?: Array<{ street?: string }> // Max 70 chars
    addresses?: Array<{ address?: string }> // Max 35 chars
    addressCities?: Array<{ addressCity?: string }> // Max 35 chars
    countries?: Array<{ country?: string }> // Max 35 chars

    // Personal details (optional)
    gender?: string // Max 35 chars
    sectorId?: number // Customer type
  }
}

/**
 * Temenos API Response Format (v5.7.0)
 * System-generated customer ID is in header.id
 */
export interface TemenosCustomerResponse {
  header: {
    id: string // System-generated customer ID
    status: string
    audit?: {
      parseTime?: number
    }
  }
  body: {
    // Mirror of request fields plus system fields
    customerNames?: Array<{
      customerName?: string
      customerNameAdditional?: string
    }>
    communicationDevices?: Array<{
      email?: string
      phoneNumber?: string
    }>
    customerStatus?: number // System status
    sectorId?: number
    gender?: string
  }
}

/**
 * Account opening payload - only fields actually used by Temenos API
 */
export interface AccountPayload {
  customerId: string
  // Optional: Full customer data for validation
  customerData?: Customer
}

/**
 * Account response data
 */
export interface Account {
  accountId: string
  customerId: string
  accountType: string
  balance: number
  currency: string
  status: 'ACTIVE' | 'CLOSED'
  openedAt: string
}

/**
 * Payment transaction payload
 */
export interface PaymentPayload {
  fromAccount: string
  toAccount: string
  amount: number
  currency: string
  reference: string
  customerId?: string  // Optional: for customer context in instant payments
}

/**
 * Payment transaction response data
 */
export interface Payment {
  paymentId: string
  fromAccount: string
  toAccount: string
  amount: number
  currency: string
  reference: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  timestamp: string
}

/**
 * API log entry for request/response tracking
 */
export interface ApiLog {
  id: string
  timestamp: number
  type: TransactionType
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  request: any
  response: any
  duration: number
  status: 'success' | 'error'
  statusCode: number
}

/**
 * Kafka event for event stream display
 */
export interface KafkaEvent {
  id: string
  timestamp: number
  type: 'business' | 'data'
  topic: string
  partition: number
  offset: number
  payload: any
  transactionType?: TransactionType
}

/**
 * Animation trigger for cross-tab communication
 */
export interface AnimationTrigger {
  id: string
  type: 'business' | 'data'
  timestamp: number
  metadata?: {
    transactionType: TransactionType
    eventId: string
    description?: string
  }
}

/**
 * Simulation state for the entire transaction workflow
 */
export interface SimulationState {
  currentStep: number
  stage: SimulationStage
  transactions: {
    customerId?: string
    accountId?: string
    paymentId?: string
    // Store full customer response for reuse in subsequent API calls
    customerData?: Customer
  }
  stepStatuses: {
    createCustomer: StepStatus
    openAccount: StepStatus
    sendPayment: StepStatus
  }
  apiLogs: ApiLog[]
  kafkaEvents: KafkaEvent[]
  animationTriggers: AnimationTrigger[]
  lastTransactionStartTime?: number // Timestamp when last transaction started - used to filter events
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
  events?: KafkaEvent[]
  fullResponse?: any
}

/**
 * Transaction API service interface
 */
export interface ITransactionApiService {
  createCustomer(payload: CustomerPayload): Promise<ApiResponse<Customer>>
  openAccount(payload: AccountPayload): Promise<ApiResponse<Account>>
  sendPayment(payload: PaymentPayload): Promise<ApiResponse<Payment>>
}

/**
 * Step card props
 */
export interface StepCardProps {
  stepNumber: number
  title: string
  description: string
  status: StepStatus
  disabled: boolean
  onExecute: () => void
  resultData?: any
  icon: React.ReactNode
}

/**
 * API Inspector props
 */
export interface ApiInspectorProps {
  logs: ApiLog[]
  isLoading: boolean
  onClear: () => void
}

/**
 * Kafka Event Stream props
 */
export interface KafkaEventStreamProps {
  events: KafkaEvent[]
  onClear: () => void
  onPause?: () => void
  isPaused?: boolean
}

/**
 * View in Architecture Button props
 */
export interface ViewInArchitectureButtonProps {
  onNavigate: () => void
  disabled?: boolean
  eventType?: 'business' | 'data'
}

/**
 * Event group for transaction-based grouping
 */
export interface EventGroup {
  id: string
  customerId?: string
  correlationId?: string
  transactionType?: TransactionType
  events: KafkaEvent[]
  startTime: number
  endTime: number
  duration: number
}

/**
 * Business context extracted from event payload
 */
export interface EventBusinessContext {
  category: 'customer' | 'account' | 'payment'
  entityId?: string
  entityName?: string
  primaryFields: Record<string, any>
  formattedSummary: string
}

/**
 * Transaction metrics for grouped events
 */
export interface TransactionMetrics {
  totalEvents: number
  businessEvents: number
  dataEvents: number
  duration: number
  successful: boolean
}
