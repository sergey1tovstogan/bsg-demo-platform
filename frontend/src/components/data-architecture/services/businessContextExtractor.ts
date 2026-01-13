// Business Context Extractor - Extracts user-friendly business fields from event payloads
import type { KafkaEvent, EventBusinessContext } from '../demo/types'
import { EVENT_DISPLAY_CONFIG } from '../config/simulation.config'

/**
 * Determines the event category based on the topic
 */
function determineCategory(topic: string): 'customer' | 'account' | 'payment' {
  if (topic.includes('party') || topic.includes('customer')) {
    return 'customer'
  }
  if (topic.includes('holding') || topic.includes('account')) {
    return 'account'
  }
  if (topic.includes('payment') || topic.includes('order')) {
    return 'payment'
  }
  // Default to customer for unknown topics
  return 'customer'
}

/**
 * Extracts customer ID from nested Temenos account structure
 */
function extractNestedCustomerId(payload: any): string | undefined {
  // Check nested Temenos structure: data.applicationContext.applicationData.Customer[0].customer
  if (payload?.data?.applicationContext?.applicationData?.Customer?.[0]?.customer) {
    return String(payload.data.applicationContext.applicationData.Customer[0].customer)
  }
  return undefined
}

/**
 * Extracts customer name from various possible locations in the payload
 * Temenos events have different structures depending on the entity type
 */
function extractCustomerName(payload: any): string | undefined {
  if (!payload) return undefined

  // Check direct fields first (from API responses or enriched events)
  if (payload.customerName) return payload.customerName
  if (payload.name && typeof payload.name === 'string' && !payload.name.includes('_')) return payload.name
  
  // Check nested data structures
  const data = payload.data
  if (data) {
    // Check data.customerName or data.name
    if (data.customerName) return data.customerName
    if (data.name && typeof data.name === 'string' && !data.name.includes('_')) return data.name
    
    // Check Temenos applicationContext for customer details
    const appData = data.applicationContext?.applicationData
    if (appData) {
      // Customer name might be in various Temenos fields
      if (appData.customerName) return appData.customerName
      if (appData.shortName) return appData.shortName
      if (appData.givenNames && appData.familyName) {
        return `${appData.givenNames} ${appData.familyName}`
      }
      if (appData.fullName) return appData.fullName
    }
  }
  
  // Check businesskey - sometimes contains meaningful info
  // But skip if it looks like an ID or table name
  if (payload.businesskey && 
      typeof payload.businesskey === 'string' && 
      !payload.businesskey.match(/^\d+$/) && 
      !payload.businesskey.includes('_')) {
    return payload.businesskey
  }

  return undefined
}

/**
 * Extracts account details from nested Temenos structure
 */
function extractNestedAccountDetails(payload: any): Record<string, any> {
  const details: Record<string, any> = {}

  const appData = payload?.data?.applicationContext?.applicationData
  if (!appData) return details

  // Extract account ID from entityid at root level
  if (payload.entityid) {
    details.accountId = payload.entityid
  }

  // Extract product/account type
  if (appData.Product?.[0]?.product) {
    details.accountType = appData.Product[0].product
  }

  // Extract currency
  if (appData.currency) {
    details.currency = appData.currency
  }

  // Extract customer ID
  const customerId = extractNestedCustomerId(payload)
  if (customerId) {
    details.customerId = customerId
  }

  // Extract status
  if (appData.arrStatus) {
    details.status = appData.arrStatus
  }

  return details
}

/**
 * Extracts business-relevant fields from event payload based on category
 */
function extractPrimaryFields(
  payload: any,
  category: 'customer' | 'account' | 'payment'
): Record<string, any> {
  const fields = EVENT_DISPLAY_CONFIG.BUSINESS_FIELDS[category]
  const primaryFields: Record<string, any> = {}

  // For account events, check nested Temenos structure first
  if (category === 'account' && payload?.data?.applicationContext) {
    const nestedDetails = extractNestedAccountDetails(payload)
    Object.assign(primaryFields, nestedDetails)
  }

  // Then check top-level fields
  for (const fieldName of fields) {
    if (payload && payload[fieldName] !== undefined && payload[fieldName] !== null) {
      primaryFields[fieldName] = payload[fieldName]
    }
  }

  return primaryFields
}

/**
 * Formats a human-readable summary based on event category
 */
function formatSummary(
  payload: any,
  category: 'customer' | 'account' | 'payment'
): string {
  if (!payload) return 'No details available'

  switch (category) {
    case 'customer': {
      // Extract customer name from payload (NOT entityname - that's the table name like "Ebnk_customer")
      const customerName = extractCustomerName(payload)
      
      const email = payload.email ? ` (${payload.email})` : ''
      const customerId = payload.customerId || payload.entityid
      
      // If we have the customer name, show it; otherwise just show Customer ID
      if (customerName) {
        return customerId
          ? `${customerName}${email} - Customer ID: ${customerId}`
          : `${customerName}${email}`
      } else {
        // No customer name found - show a clean label without "Unknown"
        return customerId
          ? `Customer - Customer ID: ${customerId}`
          : 'Customer'
      }
    }

    case 'account': {
      // Check nested Temenos structure first
      const nestedDetails = extractNestedAccountDetails(payload)
      const accountId = nestedDetails.accountId || payload.accountId || payload.entityid
      const accountType = nestedDetails.accountType || payload.accountType || payload.type || payload.entityname || 'Current Account'
      const status = nestedDetails.status || payload.status || ''

      // Format account type to be more readable
      const formattedType = accountType
        .replace(/\./g, ' ')
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (l: string) => l.toUpperCase())

      const statusText = status ? ` (${status})` : ''
      return accountId
        ? `${formattedType} - Account ID: ${accountId}${statusText}`
        : `${formattedType}${statusText}`
    }

    case 'payment': {
      const paymentId = payload.paymentId || payload.transactionId || payload.entityid
      const amount = payload.amount !== undefined
        ? formatCurrency(payload.amount, payload.currency)
        : ''
      const reference = payload.reference ? ` - ${payload.reference}` : ''
      const paymentStatus = payload.status ? ` (${payload.status})` : ''
      const amountText = amount ? `: ${amount}` : ''
      return paymentId
        ? `Payment - Payment ID: ${paymentId}${amountText}${reference}${paymentStatus}`
        : `Payment${amountText}${reference}${paymentStatus}`
    }

    default:
      return 'Event details'
  }
}

/**
 * Formats currency with proper symbol and decimal places
 */
function formatCurrency(amount: number, currency?: string): string {
  const currencyCode = currency || 'USD'
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  } catch {
    // Fallback if currency code is invalid
    return `${currencyCode} ${amount.toFixed(2)}`
  }
}

/**
 * Extracts entity ID based on category
 */
function extractEntityId(payload: any, category: 'customer' | 'account' | 'payment'): string | undefined {
  if (!payload) return undefined

  switch (category) {
    case 'customer':
      return payload.customerId || payload.entityid
    case 'account':
      return payload.accountId
    case 'payment':
      return payload.paymentId || payload.transactionId
    default:
      return undefined
  }
}

/**
 * Extracts entity name based on category
 */
function extractEntityName(payload: any, category: 'customer' | 'account' | 'payment'): string | undefined {
  if (!payload) return undefined

  switch (category) {
    case 'customer':
      return payload.customerName || payload.name
    case 'account':
      return payload.accountType || payload.type
    case 'payment':
      return payload.reference
    default:
      return undefined
  }
}

/**
 * Main extraction function - converts KafkaEvent into EventBusinessContext
 */
export function extractBusinessContext(event: KafkaEvent): EventBusinessContext {
  const category = determineCategory(event.topic)
  const primaryFields = extractPrimaryFields(event.payload, category)
  const formattedSummary = formatSummary(event.payload, category)
  const entityId = extractEntityId(event.payload, category)
  const entityName = extractEntityName(event.payload, category)

  return {
    category,
    entityId,
    entityName,
    primaryFields,
    formattedSummary
  }
}

/**
 * Checks if an event has sufficient business context to display
 */
export function hasBusinessContext(event: KafkaEvent): boolean {
  if (!event.payload || typeof event.payload !== 'object') {
    return false
  }

  const category = determineCategory(event.topic)
  const primaryFields = extractPrimaryFields(event.payload, category)

  // Event has business context if at least one primary field was extracted
  return Object.keys(primaryFields).length > 0
}
