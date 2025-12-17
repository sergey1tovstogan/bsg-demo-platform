// Mock data generator for Temenos Transaction Simulator
import type {
  Customer,
  Account,
  Payment,
  CustomerPayload,
  AccountPayload,
  PaymentPayload
} from '../demo/types'

/**
 * Generate a unique customer ID in Temenos format
 * Format: CUST + timestamp + random
 */
export const generateCustomerId = (): string => {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `CUST${timestamp}${random}`
}

/**
 * Generate a unique account ID in Temenos format
 * Format: ACC + timestamp + random
 */
export const generateAccountId = (): string => {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `ACC${timestamp}${random}`
}

/**
 * Generate a unique transaction/payment ID in Temenos format
 * Format: TXN + timestamp + random
 */
export const generateTransactionId = (): string => {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `TXN${timestamp}${random}`
}

/**
 * Generate a unique event ID
 * Format: EVT + timestamp + random
 */
export const generateEventId = (): string => {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `EVT${timestamp}${random}`
}

/**
 * Generate mock customer response from payload
 */
export const generateCustomerResponse = (payload: CustomerPayload): Customer => {
  const now = new Date().toISOString()

  return {
    customerId: generateCustomerId(),
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    address: payload.address,
    status: 'ACTIVE',
    createdAt: now,
    lastModified: now
  }
}

/**
 * Generate mock account response from payload
 */
export const generateAccountResponse = (payload: AccountPayload): Account => {
  const now = new Date().toISOString()

  return {
    accountId: generateAccountId(),
    customerId: payload.customerId,
    accountType: payload.accountType,
    balance: payload.initialDeposit,
    currency: payload.currency,
    status: 'ACTIVE',
    openedAt: now
  }
}

/**
 * Generate mock payment response from payload
 */
export const generatePaymentResponse = (payload: PaymentPayload): Payment => {
  const now = new Date().toISOString()

  return {
    paymentId: generateTransactionId(),
    fromAccount: payload.fromAccount,
    toAccount: payload.toAccount,
    amount: payload.amount,
    currency: payload.currency,
    reference: payload.reference,
    status: 'COMPLETED',
    timestamp: now
  }
}

/**
 * Generate sample customer payload for testing
 */
export const generateSampleCustomerPayload = (): CustomerPayload => {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa']
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis']

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  const fullName = `${firstName} ${lastName}`

  return {
    name: fullName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    phone: `+1-555-${Math.floor(1000 + Math.random() * 9000)}`,
    address: `${Math.floor(100 + Math.random() * 900)} Main St, New York, NY 10001`
  }
}

/**
 * Generate sample account payload for testing
 */
export const generateSampleAccountPayload = (customerId: string): AccountPayload => {
  const accountTypes: Array<'SAVINGS' | 'CHECKING' | 'CURRENT'> = ['SAVINGS', 'CHECKING', 'CURRENT']
  const accountType = accountTypes[Math.floor(Math.random() * accountTypes.length)]

  return {
    customerId,
    accountType,
    initialDeposit: Math.floor(1000 + Math.random() * 9000),
    currency: 'USD'
  }
}

/**
 * Generate sample payment payload for testing
 */
export const generateSamplePaymentPayload = (fromAccount: string): PaymentPayload => {
  const toAccount = generateAccountId() // Generate random recipient account

  return {
    fromAccount,
    toAccount,
    amount: Math.floor(100 + Math.random() * 1900),
    currency: 'USD',
    reference: `Payment REF-${Date.now()}`
  }
}

/**
 * Simulate random API error (for testing error scenarios)
 * Returns null if no error, or an error message if error should occur
 */
export const simulateRandomError = (failureRate: number = 0.05): string | null => {
  if (Math.random() < failureRate) {
    const errors = [
      'Network timeout - please try again',
      'Invalid customer data - verification failed',
      'Insufficient funds for transaction',
      'Account temporarily locked',
      'Service temporarily unavailable'
    ]
    return errors[Math.floor(Math.random() * errors.length)]
  }
  return null
}

/**
 * Mock Data Generator - Main export object
 */
export const mockDataGenerator = {
  // ID Generators
  generateCustomerId,
  generateAccountId,
  generateTransactionId,
  generateEventId,

  // Response Generators
  generateCustomerResponse,
  generateAccountResponse,
  generatePaymentResponse,

  // Sample Payload Generators
  generateSampleCustomerPayload,
  generateSampleAccountPayload,
  generateSamplePaymentPayload,

  // Error Simulation
  simulateRandomError
}
