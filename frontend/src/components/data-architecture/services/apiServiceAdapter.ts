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
  // KafkaEvent // Unused type import
} from '../demo/types'
import { MockApiService } from './mockApiService'

/**
 * Sanitize customer name to only include valid SWIFT characters
 * SWIFT allows: A-Z, 0-9, and special chars: / - ? : ( ) . , ' + Space
 */
function sanitizeSwiftName(name: string): string {
  // Convert to uppercase first
  let sanitized = name.toUpperCase()
  
  // Remove any characters that are not valid SWIFT characters
  // Valid: A-Z, 0-9, / - ? : ( ) . , ' + Space
  sanitized = sanitized.replace(/[^A-Z0-9/\-?().,'\\s+]/g, '')
  
  // Replace multiple spaces with single space
  sanitized = sanitized.replace(/\s+/g, ' ')
  
  // Trim leading/trailing spaces
  sanitized = sanitized.trim()
  
  // Ensure it's not empty (fallback to "CUSTOMER" if empty after sanitization)
  if (!sanitized) {
    sanitized = 'CUSTOMER'
  }
  
  return sanitized
}

/**
 * Generate customer mnemonic from name
 * Creates a short unique identifier (max 16 chars typically)
 * Adds timestamp suffix to ensure uniqueness
 */
function generateCustomerMnemonic(name: string): string {
  // Take first 3-4 letters of first name and last name, uppercase, remove spaces
  const parts = name.toUpperCase().split(/\s+/).filter(p => p.length > 0)
  let baseMnemonic = ''

  if (parts.length >= 2) {
    const first = parts[0].substring(0, 4)
    const last = parts[parts.length - 1].substring(0, 4)
    baseMnemonic = `${first}${last}`.replace(/[^A-Z0-9]/g, '')
  } else {
    // Fallback: use first 8 chars of name, sanitized
    baseMnemonic = name.toUpperCase().replace(/[^A-Z0-9]/g, '')
  }

  // Add timestamp suffix to ensure uniqueness (last 4 digits of timestamp)
  const timestamp = Date.now().toString().slice(-4)
  const uniqueMnemonic = `${baseMnemonic}${timestamp}`.substring(0, 16)

  return uniqueMnemonic || 'CUST'
}

/**
 * Parse Temenos API error response
 */
function parseTemenosError(errorData: any): string {
  try {
    // Handle errorDetails array (new format)
    if (errorData?.errorDetails && Array.isArray(errorData.errorDetails)) {
      return errorData.errorDetails.map((err: any) => 
        `${err.fieldName || 'Field'}: ${err.message || 'Unknown error'} (${err.code || ''})`
      ).join('; ')
    }
    
    // Check if error contains Temenos error array as string
    if (typeof errorData === 'string') {
      // Try to extract errorDetails from JSON string
      try {
        const parsed = JSON.parse(errorData)
        if (parsed?.errorDetails && Array.isArray(parsed.errorDetails)) {
          return parsed.errorDetails.map((err: any) => 
            `${err.fieldName || 'Field'}: ${err.message || 'Unknown error'} (${err.code || ''})`
          ).join('; ')
        }
        if (Array.isArray(parsed)) {
          return parsed.map((err: any) => 
            `${err.fieldName || 'Field'}: ${err.message || err.code || 'Unknown error'} (${err.code || ''})`
          ).join('; ')
        }
      } catch {
        // Not JSON, check if it contains error array pattern
        const jsonMatch = errorData.match(/\[.*\]/)
        if (jsonMatch) {
          try {
            const errors = JSON.parse(jsonMatch[0])
            if (Array.isArray(errors) && errors.length > 0) {
              return errors.map((err: any) => 
                `${err.fieldName || 'Field'}: ${err.message || err.code || 'Unknown error'} (${err.code || ''})`
              ).join('; ')
            }
          } catch {
            // Couldn't parse
          }
        }
      }
    }
    
    // If it's already an array
    if (Array.isArray(errorData)) {
      return errorData.map((err: any) => 
        `${err.fieldName || 'Field'}: ${err.message || err.code || 'Unknown error'} (${err.code || ''})`
      ).join('; ')
    }
    
    // Default: return stringified version
    return typeof errorData === 'string' ? errorData : JSON.stringify(errorData)
  } catch (err) {
    return typeof errorData === 'string' ? errorData : JSON.stringify(errorData)
  }
}

/**
 * Real API Service - Connects to actual Temenos APIs
 * Events are fetched from Event Store API after successful transactions
 */
class RealApiService implements ITransactionApiService {
  private baseUrl: string

  constructor(baseUrl: string = 'http://transactingress.northeurope.cloudapp.azure.com/irf-provider-container/api') {
    this.baseUrl = baseUrl
  }

  async createCustomer(payload: CustomerPayload): Promise<ApiResponse<Customer>> {
    try {
      // Sanitize customer name to ensure SWIFT compliance
      const sanitizedName = sanitizeSwiftName(payload.name)
      
      // Log if name was changed
      if (sanitizedName !== payload.name.toUpperCase()) {
        console.warn('[RealApiService] Customer name sanitized:', {
          original: payload.name,
          sanitized: sanitizedName
        })
      }
      
      // Sanitize address/street to ensure SWIFT compliance
      let sanitizedAddress: string | undefined
      if (payload.address) {
        sanitizedAddress = sanitizeSwiftName(payload.address)
        if (sanitizedAddress !== payload.address.toUpperCase()) {
          console.warn('[RealApiService] Address sanitized:', {
            original: payload.address,
            sanitized: sanitizedAddress
          })
        }
        // Ensure it doesn't exceed max length (70 chars)
        sanitizedAddress = sanitizedAddress.substring(0, 70)
      }
      
      // Generate customer mnemonic (required by Temenos)
      const customerMnemonic = generateCustomerMnemonic(sanitizedName)
      
      // Get nationality and residence from payload (default to 'US' if not provided)
      const nationalityId = payload.nationality || payload.country || 'US'
      const residenceId = payload.country || payload.nationality || 'US'
      
      // Generate random account officer ID (1-9) as shown in Temenos Account Officer options
      const accountOfficerId = Math.floor(Math.random() * 9) + 1 // Random value between 1 and 9
      
      // Generate random target ID from available Target options in Temenos
      // Available Target IDs: 1, 2, 3, 4, 6, 7, 10, 11, 15, 20, 30
      const availableTargetIds = [1, 2, 3, 4, 6, 7, 10, 11, 15, 20, 30]
      const targetId = availableTargetIds[Math.floor(Math.random() * availableTargetIds.length)]
      
      // Generate random industry ID from available Industry options in Temenos
      // Available Industry IDs: 1000, 1050, 1100, 1200, 1400, 1401, 1402, 1403, 1404, 1500, 1600
      const availableIndustryIds = [1000, 1050, 1100, 1200, 1400, 1401, 1402, 1403, 1404, 1500, 1600]
      const industryId = availableIndustryIds[Math.floor(Math.random() * availableIndustryIds.length)]
      
      // Generate random birthdate (over 25 years old) in YYYY-MM-DD format
      const today = new Date()
      const maxAge = 80 // Maximum age for random generation
      const minAge = 25 // Minimum age (over 25 years old)
      const randomAge = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge
      const birthYear = today.getFullYear() - randomAge
      const birthMonth = Math.floor(Math.random() * 12) + 1 // 1-12
      const daysInMonth = new Date(birthYear, birthMonth, 0).getDate() // Get days in the month
      const birthDay = Math.floor(Math.random() * daysInMonth) + 1 // 1 to daysInMonth
      const birthdate = `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`
      
      // Transform to Temenos API format with all required fields
      // Temenos API v5.7.0 structure - all fields in body object
      const temenosPayload = {
        body: {
          customerMnemonic: customerMnemonic,
          sectorId: payload.sectorId || 1001, // Default to Individual (1001) if not provided
          language: '1', // Default to English (1 = English in Temenos)
          customerStatus: '1', // Default to Active (1 = Active in Temenos)
          industryId: industryId.toString(), // Random value from available Industry IDs
          accountOfficerId: accountOfficerId.toString(), // Random value from 1-9
          nationalityId: nationalityId, // Use from payload or default to 'US'
          residenceId: residenceId, // Use from payload or default to 'US'
          target: targetId.toString(), // Random value from available Target IDs
          dateOfBirth: birthdate, // Random birthdate (over 25 years old) in YYYY-MM-DD format
          customerNames: [
            {
              customerName: sanitizedName
            }
          ],
          displayNames: [
            {
              displayName: sanitizedName
            }
          ],
          // Optional fields
          ...(payload.email || payload.phone ? {
            communicationDevices: [
              {
                ...(payload.email ? { email: payload.email.substring(0, 50) } : {}),
                ...(payload.phone ? { phoneNumber: payload.phone.substring(0, 17) } : {})
              }
            ]
          } : {}),
          ...(sanitizedAddress ? {
            streets: [{ street: sanitizedAddress }]
          } : {})
        }
      }
      
      // Log the exact payload being sent for debugging
      console.log('[RealApiService] Temenos payload structure:', JSON.stringify(temenosPayload, null, 2))

      // Use backend proxy to avoid CORS and Mixed Content issues (consistent with openAccount)
      // Using v5.7.0 party API for customer creation
      const temenosUrl = `${this.baseUrl}/v5.7.0/party/customers`
      // Use direct backend URL in production since Azure Static Web Apps rewrite doesn't support POST
      // CORS is already configured on the backend to allow Azure Static Web Apps domains
      const proxyBaseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:8000/api/v1/integration/proxy'
        : 'https://bsg-demo-platform-app.azurewebsites.net/api/v1/integration/proxy'

      // For POST requests, send URL in body to avoid Azure Static Web Apps query parameter issues
      // The backend proxy supports both query parameter and body-based URL
      const proxyRequestBody = {
        url: temenosUrl,
        ...temenosPayload
      }
      const requestBody = JSON.stringify(proxyRequestBody)
      
      console.log('[RealApiService] Creating customer via proxy:', { proxyBaseUrl, temenosUrl, temenosPayload, requestBody })

      // Use backend proxy to avoid CORS and Mixed Content issues
      // Send URL in request body for POST to work around Azure Static Web Apps limitations
      const response = await fetch(proxyBaseUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-User-Id': 'demo_user'
        },
        body: requestBody
      })

      // Parse proxy response (proxy returns {success, status, data, headers})
      let proxyResponse: any
      const contentType = response.headers.get('content-type')
      
      // Get response text first (we'll parse it as JSON if possible)
      const responseText = await response.text()
      
      if (contentType && contentType.includes('application/json')) {
        try {
          proxyResponse = JSON.parse(responseText)
        } catch (parseError) {
          console.error('[RealApiService] Failed to parse proxy JSON response:', responseText)
          return {
            success: false,
            data: {} as Customer,
            error: `Invalid JSON response from proxy (status ${response.status}): ${responseText.substring(0, 200)}`
          }
        }
      } else {
        // Non-JSON response - might be an error
        proxyResponse = { success: false, status: response.status, data: { text: responseText } }
      }

      // Check for 405 Method Not Allowed specifically
      if (response.status === 405) {
        console.error('[RealApiService] 405 Method Not Allowed from proxy:', {
          status: response.status,
          statusText: response.statusText,
          proxyUrl: proxyBaseUrl,
          temenosUrl: temenosUrl,
          responseText,
          headers: Object.fromEntries(response.headers.entries())
        })
        return {
          success: false,
          data: {} as Customer,
          error: `Proxy endpoint error (405): Method Not Allowed. The proxy endpoint may not be configured correctly or the HTTP method is not supported.`
        }
      }

      // Extract the actual Temenos API response from proxy wrapper
      const responseData = proxyResponse.data || proxyResponse
      const httpStatus = proxyResponse.status || response.status
      const isSuccess = proxyResponse.success !== false && httpStatus >= 200 && httpStatus < 300

      console.log('[RealApiService] Proxy response:', { 
        proxySuccess: proxyResponse.success, 
        httpStatus, 
        isSuccess,
        temenosData: responseData 
      })

      if (!isSuccess) {
        // Handle 400 and other error statuses with detailed error message
        // Check for errorDetails array in the response
        const errorDetails = responseData?.errorDetails || responseData?.detail || responseData?.error || responseData?.message || responseData?.errors || responseData
        const parsedError = parseTemenosError(errorDetails)
        const errorMessage = `Temenos API Error (${httpStatus}): ${parsedError}`
        
        console.error('[RealApiService] API error:', {
          httpStatus,
          errorDetails,
          parsedError,
          fullResponse: responseData
        })
        
        return {
          success: false,
          data: {} as Customer,
          error: errorMessage
        }
      }

      // Transform the API response to match our Customer interface
      // Temenos may return data in different structures, so we check multiple paths
      const responseBody = responseData.body || responseData
      const customerNames = responseBody?.customerNames || responseBody?.customerName || []
      const customerName = Array.isArray(customerNames) && customerNames.length > 0 
        ? customerNames[0].customerName || customerNames[0]
        : sanitizedName
      
      const communicationDevices = responseBody?.communicationDevices || []
      const email = communicationDevices.length > 0 ? communicationDevices[0].email : payload.email
      const phone = communicationDevices.length > 0 ? communicationDevices[0].phoneNumber : payload.phone
      
      const customer: Customer = {
        customerId: responseData.header?.id || responseData.customerId || responseData.id || responseData.customer_id || customerMnemonic,
        customerMnemonic: customerMnemonic, // Store the mnemonic for use in account opening
        name: customerName,
        email: email || payload.email,
        phone: phone || payload.phone,
        address: responseBody?.streets?.[0]?.street || sanitizedAddress || payload.address,
        status: responseData.header?.status || responseData.status || 'ACTIVE',
        createdAt: responseData.header?.audit?.timestamp || responseData.createdAt || responseData.created_at || responseData.created || new Date().toISOString(),
        lastModified: responseData.header?.audit?.timestamp || responseData.lastModified || responseData.last_modified || responseData.modified || new Date().toISOString()
      }

      console.log('[RealApiService] Customer created successfully:', customer)

      // Note: Events are now fetched from Event Store API via backend proxy
      // after the transaction succeeds, so we don't generate them here
      return {
        success: true,
        data: customer,
        events: [] // Events will be fetched from Event Store API
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('[RealApiService] Exception creating customer:', err)
      return {
        success: false,
        data: {} as Customer,
        error: `Network or parsing error: ${errorMessage}`
      }
    }
  }

  async openAccount(payload: AccountPayload): Promise<ApiResponse<Account>> {
    try {
      // Validate required customer ID (must come from successful Create Customer step)
      if (!payload.customerId) {
        return {
          success: false,
          data: {} as Account,
          error: 'Customer ID is required to open an account. Please create a customer first.'
        }
      }

      // Validate that customer data is available
      if (!payload.customerData) {
        return {
          success: false,
          data: {} as Account,
          error: 'Customer data is required to open an account. Please ensure customer was created successfully.'
        }
      }

      console.log('[RealApiService] Opening account for customer:', {
        customerId: payload.customerId,
        customerMnemonic: payload.customerData.customerMnemonic,
        customerName: payload.customerData.name
      })

      // Transform to Temenos Holdings API format (v9.4.0)
      // Using v9.4.0/holdings/accounts/currentAccounts endpoint
      // IMPORTANT: Exact structure from working Postman example
      // Hardcoded effective date: 2025/04/15 in YYYYMMDD format
      const effectiveDate = '20250415'

      const temenosPayload = {
        header: {},
        body: {
          // REQUIRED: Activity ID for new account arrangement
          activityId: 'ACCOUNTS-NEW-ARRANGEMENT',

          // REQUIRED: Product ID
          productId: 'CURRENT.ACCOUNT',

          // REQUIRED: Currency ID (not "currency"!)
          currencyId: 'USD',

          // REQUIRED: Effective date in YYYYMMDD format
          effectiveDate: effectiveDate,

          // REQUIRED: parties (not "partyIds"!) with partyRole
          parties: [
            {
              partyId: payload.customerId, // Customer ID from Create Customer response
              partyRole: 'OWNER' // REQUIRED: Must specify party role
            }
          ]
        }
      }

      // Log the exact payload being sent for debugging
      console.log('[RealApiService] Temenos holdings account payload structure (v9.4.0):', JSON.stringify(temenosPayload, null, 2))

      // Use backend proxy to avoid CORS issues (consistent with createCustomer)
      // Using v9.4.0 holdings API for current account opening
      const temenosUrl = `${this.baseUrl}/v9.4.0/holdings/accounts/currentAccounts`
      // Use direct backend URL in production since Azure Static Web Apps rewrite doesn't support POST
      // CORS is already configured on the backend to allow Azure Static Web Apps domains
      const proxyBaseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:8000/api/v1/integration/proxy'
        : 'https://bsg-demo-platform-app.azurewebsites.net/api/v1/integration/proxy'

      // For POST requests, send URL in body to avoid Azure Static Web Apps query parameter issues
      // The backend proxy supports both query parameter and body-based URL
      const proxyRequestBody = {
        url: temenosUrl,
        ...temenosPayload
      }
      const requestBody = JSON.stringify(proxyRequestBody)

      console.log('[RealApiService] Opening account via proxy:', { proxyBaseUrl, temenosUrl, temenosPayload, requestBody })

      // Use backend proxy to avoid CORS issues
      // Send URL in request body for POST to work around Azure Static Web Apps limitations
      const response = await fetch(proxyBaseUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-User-Id': 'demo_user'
        },
        body: requestBody
      })

      // Parse proxy response (proxy returns {success, status, data, headers})
      let proxyResponse: any
      const contentType = response.headers.get('content-type')
      
      // Get response text first (we'll parse it as JSON if possible)
      const responseText = await response.text()
      
      if (contentType && contentType.includes('application/json')) {
        try {
          proxyResponse = JSON.parse(responseText)
        } catch (parseError) {
          console.error('[RealApiService] Failed to parse proxy JSON response:', responseText)
          return {
            success: false,
            data: {} as Account,
            error: `Invalid JSON response from proxy (status ${response.status}): ${responseText.substring(0, 200)}`
          }
        }
      } else {
        // Non-JSON response - might be an error
        proxyResponse = { success: false, status: response.status, data: { text: responseText } }
      }

      // Check for 405 Method Not Allowed specifically
      if (response.status === 405) {
        console.error('[RealApiService] 405 Method Not Allowed from proxy:', {
          status: response.status,
          statusText: response.statusText,
          proxyUrl: proxyBaseUrl,
          temenosUrl: temenosUrl,
          responseText,
          headers: Object.fromEntries(response.headers.entries())
        })
        return {
          success: false,
          data: {} as Account,
          error: `Proxy endpoint error (405): Method Not Allowed. The proxy endpoint may not be configured correctly or the HTTP method is not supported.`
        }
      }

      // Extract the actual Temenos API response from proxy wrapper
      const responseData = proxyResponse.data || proxyResponse
      const httpStatus = proxyResponse.status || response.status
      const isSuccess = proxyResponse.success !== false && httpStatus >= 200 && httpStatus < 300

      console.log('[RealApiService] Proxy response:', { 
        proxySuccess: proxyResponse.success, 
        httpStatus, 
        isSuccess,
        temenosData: responseData 
      })

      if (!isSuccess) {
        // Handle 400 and other error statuses with detailed error message
        const errorDetails = responseData?.errorDetails || responseData?.detail || responseData?.error || responseData?.message || responseData?.errors || responseData
        const parsedError = parseTemenosError(errorDetails)
        const errorMessage = `Temenos API Error (${httpStatus}): ${parsedError}`

        console.error('[RealApiService] API error:', {
          httpStatus,
          errorDetails,
          parsedError,
          fullResponse: responseData,
          sentPayload: temenosPayload,
          payloadValidation: {
            hasActivityId: !!temenosPayload.body.activityId,
            activityIdValue: temenosPayload.body.activityId,
            hasParties: !!temenosPayload.body.parties && Array.isArray(temenosPayload.body.parties),
            partiesLength: temenosPayload.body.parties?.length,
            firstPartyId: temenosPayload.body.parties?.[0]?.partyId,
            firstPartyRole: temenosPayload.body.parties?.[0]?.partyRole,
            hasCurrencyId: !!temenosPayload.body.currencyId,
            currencyIdValue: temenosPayload.body.currencyId,
            hasEffectiveDate: !!temenosPayload.body.effectiveDate,
            effectiveDateValue: temenosPayload.body.effectiveDate,
            hasProductId: !!temenosPayload.body.productId,
            productIdValue: temenosPayload.body.productId
          }
        })

        return {
          success: false,
          data: {} as Account,
          error: errorMessage,
          // Include debug info in the error response
          fullResponse: {
            ...responseData,
            _debug: {
              sentPayload: temenosPayload,
              endpoint: temenosUrl
            }
          }
        }
      }

      // Return real response from Temenos API - no fallbacks or generated data
      // Holdings API v9.4.0 returns: {header: {id, status, audit}, body: {...}}
      const responseBody = responseData.body || responseData
      
      // Extract account ID from header (standard Temenos response structure)
      const accountId = responseData.header?.id || responseBody?.accountId || responseData.accountId || responseData.id
      
      // Build account data from real response only
      const account: Account = {
        accountId: accountId || '',
        customerId: responseBody?.customerId || payload.customerId,
        accountType: responseBody?.productId || responseBody?.accountType || '',
        balance: responseBody?.balance || responseBody?.openingBalance || 0,
        currency: responseBody?.currencyId || responseBody?.currency || '',
        status: responseData.header?.status === 'success' || responseData.header?.status === 'SUCCESS' ? 'ACTIVE' : 'CLOSED',
        openedAt: responseData.header?.audit?.timestamp || responseBody?.openingDate || ''
      }

      console.log('[RealApiService] Account opened successfully - real response:', account)
      console.log('[RealApiService] Full Temenos response:', responseData)

      // Return real response data
      return {
        success: true,
        data: account,
        fullResponse: responseData, // Include full Temenos response for display
        events: [] // Events will be fetched from Event Store API
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('[RealApiService] Exception opening account:', err)
      return {
        success: false,
        data: {} as Account,
        error: `Network or parsing error: ${errorMessage}`
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async sendPayment(payload: PaymentPayload): Promise<ApiResponse<Payment>> {
    try {
      // Validate minimal required fields for Temenos instant payment
      if (!payload.fromAccount || !payload.toAccount || !payload.amount) {
        return {
          success: false,
          data: {} as Payment,
          error: 'From account, to account, and amount are required for payment'
        }
      }

      // Use backend payment API endpoint (not direct Temenos call)
      // Use direct backend URL in production since Azure Static Web Apps rewrite doesn't support POST
      // CORS is already configured on the backend to allow Azure Static Web Apps domains
      const backendUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:8000/api/v1/payments/instant'
        : 'https://bsg-demo-platform-app.azurewebsites.net/api/v1/payments/instant'

      console.log('[RealApiService] Creating instant payment:', { backendUrl, payload })

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-User-Id': 'demo_user'
        },
        body: JSON.stringify({
          // Minimal required fields for Temenos instant payment
          debit_account_id: payload.fromAccount,
          credit_account_id: payload.toAccount,
          transaction_amount: payload.amount.toString(),
          currency: payload.currency || 'USD',
          // payment_order_product_id defaults to ACOTHER in backend
          reference: payload.reference || `Payment ${Date.now()}`
        })
      })

      // Parse response
      let responseData: any
      const contentType = response.headers.get('content-type')

      if (contentType && contentType.includes('application/json')) {
        try {
          responseData = await response.json()
        } catch (parseError) {
          const textResponse = await response.text()
          console.error('[RealApiService] Failed to parse JSON response:', textResponse)
          return {
            success: false,
            data: {} as Payment,
            error: `Invalid JSON response: ${textResponse.substring(0, 200)}`
          }
        }
      } else {
        const textResponse = await response.text()
        responseData = { message: textResponse }
      }

      console.log('[RealApiService] Payment API response:', { status: response.status, data: responseData })

      if (!response.ok) {
        const errorMessage = responseData?.detail?.error || responseData?.error || 'Payment failed'
        console.error('[RealApiService] Payment error:', responseData)

        return {
          success: false,
          data: {} as Payment,
          error: errorMessage
        }
      }

      // Transform response to Payment interface
      const payment: Payment = {
        paymentId: responseData.payment_id || responseData.data?.header?.id || `PAY${Date.now()}`,
        fromAccount: payload.fromAccount,
        toAccount: payload.toAccount,
        amount: payload.amount,
        currency: payload.currency,
        reference: payload.reference,
        status: responseData.status === 'success' || responseData.success ? 'COMPLETED' : 'PENDING',
        timestamp: new Date().toISOString()
      }

      console.log('[RealApiService] Payment created successfully:', payment)

      return {
        success: true,
        data: payment,
        events: [] // Events will be fetched from Event Store API
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('[RealApiService] Exception creating payment:', err)
      return {
        success: false,
        data: {} as Payment,
        error: `Network or parsing error: ${errorMessage}`
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
    // Always use real API - mock mode disabled
    const useMock = false // Force real mode

    if (useMock) {
      this.service = new MockApiService(config?.mockConfig)
    } else {
      this.service = new RealApiService(config?.baseUrl)
    }
  }

  /**
   * Switch between mock and real API at runtime
   * DISABLED: Always uses real API
   */
  switchMode(_useMock: boolean, config?: { baseUrl?: string; mockConfig?: any }): void {
    // Always use real API - mock mode disabled
    this.service = new RealApiService(config?.baseUrl)
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

// Export default instance (always uses real API - mock mode disabled)
export const apiService = new ApiServiceAdapter({ useMock: false })
