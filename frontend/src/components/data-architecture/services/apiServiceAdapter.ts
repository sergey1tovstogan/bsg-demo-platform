// API Service Adapter - Abstraction layer for Mock/Real API switching
import type {
  ITransactionApiService,
  CustomerPayload,
  AccountPayload,
  PaymentPayload,
  Customer,
  Account,
  Payment,
  ApiResponse
} from '../demo/types'
import { MockApiService } from './mockApiService'

/**
 * Real API Service - Will connect to actual Temenos APIs
 * Currently a placeholder that can be implemented when API access is available
 */
class RealApiService implements ITransactionApiService {
  private baseUrl: string

  constructor(baseUrl: string = 'http://transactingress.northeurope.cloudapp.azure.com/irf-provider-container/api') {
    this.baseUrl = baseUrl
  }

  async createCustomer(_payload: CustomerPayload): Promise<ApiResponse<Customer>> {
    try {
      // TODO: Implement real API call
      // const response = await fetch(`${this.baseUrl}/v1.0.0/party/customers`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(_payload)
      // })
      // return await response.json()
      void this.baseUrl // Acknowledge usage for future implementation

      throw new Error('Real API not yet implemented - use mock mode')
    } catch (err) {
      return {
        success: false,
        data: {} as Customer,
        error: err instanceof Error ? err.message : 'Unknown error occurred'
      }
    }
  }

  async openAccount(_payload: AccountPayload): Promise<ApiResponse<Account>> {
    try {
      // TODO: Implement real API call
      // const response = await fetch(`${this.baseUrl}/v1.2.0/holdings/accounts`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(_payload)
      // })
      // return await response.json()

      throw new Error('Real API not yet implemented - use mock mode')
    } catch (err) {
      return {
        success: false,
        data: {} as Account,
        error: err instanceof Error ? err.message : 'Unknown error occurred'
      }
    }
  }

  async sendPayment(_payload: PaymentPayload): Promise<ApiResponse<Payment>> {
    try {
      // TODO: Implement real API call
      // const response = await fetch(`${this.baseUrl}/v1.0.0/order/paymentOrders`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(_payload)
      // })
      // return await response.json()

      throw new Error('Real API not yet implemented - use mock mode')
    } catch (err) {
      return {
        success: false,
        data: {} as Payment,
        error: err instanceof Error ? err.message : 'Unknown error occurred'
      }
    }
  }
}

/**
 * API Service Adapter - Main abstraction layer
 * Delegates to either Mock or Real API service based on configuration
 */
export class ApiServiceAdapter implements ITransactionApiService {
  private service: ITransactionApiService

  constructor(config?: { useMock?: boolean; baseUrl?: string; mockConfig?: any }) {
    const useMock = config?.useMock ?? true // Default to mock mode

    if (useMock) {
      this.service = new MockApiService(config?.mockConfig)
    } else {
      this.service = new RealApiService(config?.baseUrl)
    }
  }

  /**
   * Switch between mock and real API at runtime
   */
  switchMode(useMock: boolean, config?: { baseUrl?: string; mockConfig?: any }): void {
    if (useMock) {
      this.service = new MockApiService(config?.mockConfig)
    } else {
      this.service = new RealApiService(config?.baseUrl)
    }
  }

  /**
   * Create Customer - delegates to underlying service
   */
  async createCustomer(payload: CustomerPayload): Promise<ApiResponse<Customer>> {
    return this.service.createCustomer(payload)
  }

  /**
   * Open Account - delegates to underlying service
   */
  async openAccount(payload: AccountPayload): Promise<ApiResponse<Account>> {
    return this.service.openAccount(payload)
  }

  /**
   * Send Payment - delegates to underlying service
   */
  async sendPayment(payload: PaymentPayload): Promise<ApiResponse<Payment>> {
    return this.service.sendPayment(payload)
  }

  /**
   * Get current service type
   */
  getServiceType(): 'mock' | 'real' {
    return this.service instanceof MockApiService ? 'mock' : 'real'
  }

  /**
   * Update mock configuration (only works if in mock mode)
   */
  updateMockConfig(config: {
    networkDelay?: number
    failureRate?: number
    kafkaEventDelay?: number
  }): void {
    if (this.service instanceof MockApiService) {
      this.service.updateConfig(config)
    }
  }

  /**
   * Get mock configuration (only works if in mock mode)
   */
  getMockConfig(): { networkDelay: number; failureRate: number; kafkaEventDelay: number } | null {
    if (this.service instanceof MockApiService) {
      return this.service.getConfig()
    }
    return null
  }
}

// Export default instance (starts in mock mode)
export const apiService = new ApiServiceAdapter({ useMock: true })
