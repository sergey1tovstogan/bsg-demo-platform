// Mock API Service for Temenos Transaction Simulator
import type {
  ITransactionApiService,
  CustomerPayload,
  AccountPayload,
  PaymentPayload,
  Customer,
  Account,
  Payment,
  ApiResponse,
  KafkaEvent
} from '../demo/types'
import { mockDataGenerator } from './mockDataGenerator'

/**
 * Mock API Service - Simulates Temenos API calls with realistic delays and responses
 * Implements ITransactionApiService interface
 */
export class MockApiService implements ITransactionApiService {
  private networkDelay: number
  private failureRate: number
  private kafkaEventDelay: number

  constructor(config?: {
    networkDelay?: number
    failureRate?: number
    kafkaEventDelay?: number
  }) {
    this.networkDelay = config?.networkDelay ?? 1500 // Default 1.5s network delay
    this.failureRate = config?.failureRate ?? 0.05 // Default 5% failure rate
    this.kafkaEventDelay = config?.kafkaEventDelay ?? 200 // Default 200ms for Kafka event
  }

  /**
   * Simulate network delay
   */
  private async simulateDelay(ms?: number): Promise<void> {
    const delay = ms ?? this.networkDelay
    return new Promise(resolve => setTimeout(resolve, delay))
  }

  /**
   * Create a Kafka event
   */
  private createKafkaEvent(
    type: 'business' | 'data',
    topic: string,
    payload: any,
    transactionType?: any
  ): KafkaEvent {
    return {
      id: mockDataGenerator.generateEventId(),
      timestamp: Date.now(),
      type,
      topic,
      partition: 0,
      offset: Math.floor(Math.random() * 1000000),
      payload,
      transactionType
    }
  }

  /**
   * Create Customer API call
   * Simulates: POST /api/v1.0.0/party/customers
   */
  async createCustomer(payload: CustomerPayload): Promise<ApiResponse<Customer>> {
    try {
      // Simulate network delay
      await this.simulateDelay()

      // Check for simulated error
      const error = mockDataGenerator.simulateRandomError(this.failureRate)
      if (error) {
        return {
          success: false,
          data: {} as Customer,
          error
        }
      }

      // Generate customer response
      const customer = mockDataGenerator.generateCustomerResponse(payload)

      // Generate Kafka events
      const events: KafkaEvent[] = [
        // Business event - customer created
        this.createKafkaEvent(
          'business',
          'temenos.party.customers.created',
          {
            customerId: customer.customerId,
            name: customer.name,
            status: customer.status,
            eventType: 'CUSTOMER_CREATED'
          },
          'CREATE_CUSTOMER'
        )
      ]

      return {
        success: true,
        data: customer,
        events
      }
    } catch (err) {
      return {
        success: false,
        data: {} as Customer,
        error: err instanceof Error ? err.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Open Account API call
   * Simulates: POST /api/v1.2.0/holdings/accounts
   */
  async openAccount(payload: AccountPayload): Promise<ApiResponse<Account>> {
    try {
      // Simulate network delay
      await this.simulateDelay()

      // Check for simulated error
      const error = mockDataGenerator.simulateRandomError(this.failureRate)
      if (error) {
        return {
          success: false,
          data: {} as Account,
          error
        }
      }

      // Generate account response
      const account = mockDataGenerator.generateAccountResponse(payload)

      // Generate Kafka events (both business and data events for account opening)
      const events: KafkaEvent[] = [
        // Business event - account opened
        this.createKafkaEvent(
          'business',
          'temenos.holdings.accounts.opened',
          {
            accountId: account.accountId,
            customerId: account.customerId,
            accountType: account.accountType,
            eventType: 'ACCOUNT_OPENED'
          },
          'OPEN_ACCOUNT'
        ),
        // Data event - account data synced to data hub
        this.createKafkaEvent(
          'data',
          'temenos.data.accounts.sync',
          {
            accountId: account.accountId,
            customerId: account.customerId,
            balance: account.balance,
            currency: account.currency,
            syncTarget: 'DATA_HUB',
            eventType: 'ACCOUNT_DATA_SYNCED'
          },
          'OPEN_ACCOUNT'
        )
      ]

      return {
        success: true,
        data: account,
        events
      }
    } catch (err) {
      return {
        success: false,
        data: {} as Account,
        error: err instanceof Error ? err.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Send Payment API call
   * Simulates: POST /api/v1.0.0/order/paymentOrders
   */
  async sendPayment(payload: PaymentPayload): Promise<ApiResponse<Payment>> {
    try {
      // Simulate network delay
      await this.simulateDelay()

      // Check for simulated error
      const error = mockDataGenerator.simulateRandomError(this.failureRate)
      if (error) {
        return {
          success: false,
          data: {} as Payment,
          error
        }
      }

      // Generate payment response
      const payment = mockDataGenerator.generatePaymentResponse(payload)

      // Generate Kafka events (both business and data events for payments)
      const events: KafkaEvent[] = [
        // Business event - payment initiated
        this.createKafkaEvent(
          'business',
          'temenos.order.payments.initiated',
          {
            paymentId: payment.paymentId,
            fromAccount: payment.fromAccount,
            toAccount: payment.toAccount,
            amount: payment.amount,
            currency: payment.currency,
            eventType: 'PAYMENT_INITIATED'
          },
          'SEND_PAYMENT'
        ),
        // Business event - payment completed
        this.createKafkaEvent(
          'business',
          'temenos.order.payments.completed',
          {
            paymentId: payment.paymentId,
            status: payment.status,
            timestamp: payment.timestamp,
            eventType: 'PAYMENT_COMPLETED'
          },
          'SEND_PAYMENT'
        ),
        // Data event - payment data synced
        this.createKafkaEvent(
          'data',
          'temenos.data.payments.sync',
          {
            paymentId: payment.paymentId,
            fromAccount: payment.fromAccount,
            toAccount: payment.toAccount,
            amount: payment.amount,
            syncTarget: 'DATA_HUB',
            eventType: 'PAYMENT_DATA_SYNCED'
          },
          'SEND_PAYMENT'
        )
      ]

      return {
        success: true,
        data: payment,
        events
      }
    } catch (err) {
      return {
        success: false,
        data: {} as Payment,
        error: err instanceof Error ? err.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Update configuration at runtime
   */
  updateConfig(config: {
    networkDelay?: number
    failureRate?: number
    kafkaEventDelay?: number
  }): void {
    if (config.networkDelay !== undefined) {
      this.networkDelay = config.networkDelay
    }
    if (config.failureRate !== undefined) {
      this.failureRate = config.failureRate
    }
    if (config.kafkaEventDelay !== undefined) {
      this.kafkaEventDelay = config.kafkaEventDelay
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): {
    networkDelay: number
    failureRate: number
    kafkaEventDelay: number
  } {
    return {
      networkDelay: this.networkDelay,
      failureRate: this.failureRate,
      kafkaEventDelay: this.kafkaEventDelay
    }
  }
}

// Export a default instance
export const mockApiService = new MockApiService()
